import Link from 'next/link';
import {
  getCountries, byRegion, totals, fmtUsdBn, fmtPop, fmtKm2, fmtPct, fmtNum,
  type Country,
} from '@/lib/data';

export const revalidate = 3600;

const REGION_COLOR: Record<string, string> = {
  'Asia-Pacific': '#14524B',
  'North America': '#8C4A2F',
  Europe: '#3E5A78',
  'Latin America': '#9A7B2F',
  'Middle East': '#5C6B4A',
  Africa: '#6E4B6E',
};

function Bands({ rows }: { rows: Country[] }) {
  const regions = byRegion(rows);
  const w = totals(rows);

  const series = [
    { key: 'Output', total: w.gdp_usd_bn, pick: (r: any) => r.gdp_usd_bn, fmt: () => fmtUsdBn(w.gdp_usd_bn) },
    { key: 'People', total: w.population_mn, pick: (r: any) => r.population_mn, fmt: () => fmtPop(w.population_mn) },
    { key: 'Land', total: w.land_km2, pick: (r: any) => r.land_km2, fmt: () => fmtKm2(w.land_km2) },
    { key: 'Government debt', total: w.debt_usd_bn, pick: (r: any) => r.debt_usd_bn, fmt: () => fmtUsdBn(w.debt_usd_bn) },
  ];

  return (
    <div className="bands">
      {series.map((s) => (
        <div className="band-row" key={s.key}>
          <div className="band-label">
            <span>{s.key}</span>
            <b>{s.fmt()}</b>
          </div>
          <div className="band" role="img" aria-label={`${s.key} by region`}>
            {regions.map((r) => {
              const pct = (s.pick(r) / s.total) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={r.region}
                  className="band-seg"
                  style={{ width: `${pct}%`, background: REGION_COLOR[r.region] }}
                  title={`${r.region}: ${pct.toFixed(1)}%`}
                >
                  {pct > 7 ? `${pct.toFixed(0)}%` : ''}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="band-key">
        {regions.map((r) => (
          <span key={r.region}>
            <i style={{ background: REGION_COLOR[r.region] }} />
            {r.region}
          </span>
        ))}
      </div>
    </div>
  );
}

function Leader({
  title, note, rows, value, sub, href,
}: {
  title: string; note: string; rows: Country[];
  value: (c: Country) => string; sub?: (c: Country) => string; href: string;
}) {
  const max = Math.max(...rows.map((r) => {
    const n = parseFloat(value(r).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }));
  return (
    <div>
      <div className="section-head" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>{title}</h2>
          <p style={{ fontSize: 13 }}>{note}</p>
        </div>
      </div>
      <table className="ledger">
        <tbody>
          {rows.map((c, i) => {
            const n = parseFloat(value(c).replace(/[^0-9.]/g, ''));
            const pct = max > 0 && !isNaN(n) ? (n / max) * 100 : 0;
            return (
              <tr key={c.iso3}>
                <td className="rank">{i + 1}</td>
                <td className="cname microbar">
                  <span style={{ width: `${pct}%`, background: 'var(--teal)' }} />
                  <Link href={`/country/${c.slug}`} style={{ position: 'relative' }}>{c.name}</Link>
                  {sub && <span className="sub">{sub(c)}</span>}
                </td>
                <td className="num">{value(c)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ marginTop: 12 }}>
        <Link href={href} className="more">Full ranking →</Link>
      </p>
    </div>
  );
}

export default async function Home() {
  const rows = await getCountries();
  const w = totals(rows);

  const byDebtAbs = [...rows].filter((c) => c.debt_usd_bn !== null)
    .sort((a, b) => (b.debt_usd_bn ?? 0) - (a.debt_usd_bn ?? 0)).slice(0, 8);
  const byDebtPct = [...rows].filter((c) => c.debt_pct_gdp !== null)
    .sort((a, b) => (b.debt_pct_gdp ?? 0) - (a.debt_pct_gdp ?? 0)).slice(0, 8);
  const byLand = [...rows].sort((a, b) => b.land_km2 - a.land_km2).slice(0, 8);
  const byGdp = rows.slice(0, 8);

  const na = byRegion(rows).find((r) => r.region === 'North America')!;
  const af = byRegion(rows).find((r) => r.region === 'Africa')!;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="eyebrow">Reference atlas · 2025–26 estimates</div>
          <h1>The world has four sizes, and they do not agree.</h1>
          <p className="lede">
            Output, people, territory and debt each rank the world differently. A country large
            on one is often small on another — and the gaps between those four rankings are where
            most of what matters in global economics actually sits.
          </p>
          <Bands rows={rows} />
        </div>
      </section>

      <section className="wrap">
        <dl className="stats">
          <div className="stat"><dt>World output</dt><dd>{fmtUsdBn(w.gdp_usd_bn)}</dd></div>
          <div className="stat"><dt>Population</dt><dd>{fmtPop(w.population_mn)}</dd></div>
          <div className="stat"><dt>Land area</dt><dd>{fmtNum(Math.round(w.land_km2 / 1e6), 1)}M<small> km²</small></dd></div>
          <div className="stat"><dt>Government debt</dt><dd style={{ color: 'var(--copper)' }}>{fmtUsdBn(w.debt_usd_bn)}</dd></div>
          <div className="stat"><dt>Debt to output</dt><dd>{fmtPct(w.debt_pct_gdp)}</dd></div>
        </dl>

        <div className="caveat" style={{ marginBottom: 40 }}>
          <b>Read this first</b>
          North America produces {((na.gdp_usd_bn / w.gdp_usd_bn) * 100).toFixed(0)}% of world output
          with {((na.population_mn / w.population_mn) * 100).toFixed(0)}% of its people. Africa holds{' '}
          {((af.population_mn / w.population_mn) * 100).toFixed(0)}% of the world&apos;s people and produces{' '}
          {((af.gdp_usd_bn / w.gdp_usd_bn) * 100).toFixed(0)}%. Those two sentences describe the same
          planet, and no single ranking on this site will show you both.
        </div>
      </section>

      <section className="section">
        <div className="wrap grid-2">
          <Leader
            title="Largest economies"
            note="Nominal GDP at market exchange rates."
            rows={byGdp}
            value={(c) => fmtUsdBn(c.gdp_usd_bn)}
            sub={(c) => `${c.region} · ${c.currency_code}`}
            href="/compare?metric=gdp"
          />
          <Leader
            title="Largest debtors"
            note="Government debt in absolute dollars — not the ratio."
            rows={byDebtAbs}
            value={(c) => fmtUsdBn(c.debt_usd_bn)}
            sub={(c) => `${fmtPct(c.debt_pct_gdp)} of GDP`}
            href="/compare?metric=debt_usd"
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap grid-2">
          <Leader
            title="Heaviest debt burdens"
            note="Gross government debt as a share of output. A ratio, not a verdict."
            rows={byDebtPct}
            value={(c) => fmtPct(c.debt_pct_gdp)}
            sub={(c) => `${fmtUsdBn(c.debt_usd_bn)} outstanding`}
            href="/compare?metric=debt_pct"
          />
          <Leader
            title="Largest by territory"
            note="Total land area. The ranking least correlated with the other three."
            rows={byLand}
            value={(c) => `${(c.land_km2 / 1e6).toFixed(2)}M`}
            sub={(c) => `${fmtNum(c.pop_density, 1)}/km²`}
            href="/compare?metric=land"
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Every economy has a page</h2>
              <p>
                Output, people, territory, currency, debt and the largest banks headquartered
                there — with the definition and source beside each figure.
              </p>
            </div>
            <Link href="/compare" className="more">Browse all 187 →</Link>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
            gap: '0', borderTop: '1px solid var(--ink)', borderLeft: '1px solid var(--rule)',
          }}>
            {rows.slice(0, 24).map((c) => (
              <Link key={c.iso3} href={`/country/${c.slug}`} style={{
                padding: '11px 13px', borderRight: '1px solid var(--rule)',
                borderBottom: '1px solid var(--rule)', fontSize: 13,
              }}>
                <div style={{ fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                  {fmtUsdBn(c.gdp_usd_bn)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
