import Link from 'next/link';
import { getCountries, byRegion, totals, fmtUsdBn, fmtPop, fmtNum, fmtPct } from '@/lib/data';

export const revalidate = 3600;
export const metadata = {
  title: 'Regional aggregates — World Finance Atlas',
  description: 'Output, population, land area and government debt aggregated across six world regions.',
};

export default async function RegionsPage() {
  const rows = await getCountries();
  const regions = byRegion(rows);
  const w = totals(rows);

  return (
    <div className="wrap" style={{ paddingTop: 40 }}>
      <div className="eyebrow">Regional aggregates</div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
        Six regions, four rankings
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
        Aggregated from the country rows. Share of output and share of population diverge sharply —
        that divergence is the single most important fact on this page.
      </p>

      <table className="ledger" style={{ marginTop: 28 }}>
        <thead>
          <tr>
            <th>Region</th>
            <th style={{ textAlign: 'right' }}>Economies</th>
            <th style={{ textAlign: 'right' }}>Output</th>
            <th style={{ textAlign: 'right' }}>% world</th>
            <th style={{ textAlign: 'right' }}>People</th>
            <th style={{ textAlign: 'right' }}>% world</th>
            <th style={{ textAlign: 'right' }} className="hide-sm">Land (M km²)</th>
            <th style={{ textAlign: 'right' }}>Debt</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.region}>
              <td className="cname">{r.region}</td>
              <td className="num">{r.countries}</td>
              <td className="num">{fmtUsdBn(r.gdp_usd_bn)}</td>
              <td className="num">{fmtPct((r.gdp_usd_bn / w.gdp_usd_bn) * 100)}</td>
              <td className="num">{fmtPop(r.population_mn)}</td>
              <td className="num">{fmtPct((r.population_mn / w.population_mn) * 100)}</td>
              <td className="num hide-sm">{fmtNum(r.land_km2 / 1e6, 1)}</td>
              <td className="num" style={{ color: 'var(--copper)' }}>{fmtUsdBn(r.debt_usd_bn)}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '1.5px solid var(--ink)', fontWeight: 500 }}>
            <td className="cname">World</td>
            <td className="num">{w.countries}</td>
            <td className="num">{fmtUsdBn(w.gdp_usd_bn)}</td>
            <td className="num">100.0%</td>
            <td className="num">{fmtPop(w.population_mn)}</td>
            <td className="num">100.0%</td>
            <td className="num hide-sm">{fmtNum(w.land_km2 / 1e6, 1)}</td>
            <td className="num" style={{ color: 'var(--copper)' }}>{fmtUsdBn(w.debt_usd_bn)}</td>
          </tr>
        </tbody>
      </table>

      {regions.map((r) => (
        <div className="section" key={r.region}>
          <div className="section-head">
            <div>
              <h2>{r.region}</h2>
              <p>
                {r.countries} economies · {fmtPct((r.gdp_usd_bn / w.gdp_usd_bn) * 100)} of world output ·{' '}
                {fmtPct((r.population_mn / w.population_mn) * 100)} of world population ·
                debt {fmtPct(r.debt_pct_gdp)} of regional output
              </p>
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            borderTop: '1px solid var(--ink)', borderLeft: '1px solid var(--rule)',
          }}>
            {r.members.sort((a, b) => b.gdp_usd_bn - a.gdp_usd_bn).map((c) => (
              <Link key={c.iso3} href={`/country/${c.slug}`} style={{
                padding: '10px 13px', borderRight: '1px solid var(--rule)',
                borderBottom: '1px solid var(--rule)', fontSize: 13,
              }}>
                <div style={{ fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                  {fmtUsdBn(c.gdp_usd_bn)} · {fmtPct(c.debt_pct_gdp, 0)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
