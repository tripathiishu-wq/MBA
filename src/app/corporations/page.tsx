import Link from 'next/link';
import LogoImg from '@/components/LogoImg';
import { getCorporations, getCountries, fmtUsdBn, fmtPct, corpSlug, corpLogoUrl } from '@/lib/data';
import { flagUrl, flagAlt } from '@/lib/flags';

export const revalidate = 3600;
export const metadata = {
  title: 'Corporations — World Finance Atlas',
  description: "The world's leading public companies by market capitalisation, organised by home country.",
};

export default async function CorporationsPage() {
  const corps = await getCorporations();
  const countries = await getCountries();
  const byIso = new Map(countries.map(c => [c.iso3, c]));
  const worldMkt = corps.reduce((s,c) => s + (c.market_cap_usd_bn ?? 0), 0);

  // Group by country
  const byCountry = new Map<string, typeof corps>();
  corps.forEach(c => {
    if (!byCountry.has(c.iso3)) byCountry.set(c.iso3, []);
    byCountry.get(c.iso3)!.push(c);
  });
  const countryList = [...byCountry.entries()]
    .map(([iso3, list]) => ({ iso3, list, total: list.reduce((s,c) => s + (c.market_cap_usd_bn ?? 0), 0) }))
    .sort((a, b) => b.total - a.total);

  const sectors = [...new Set(corps.map(c => c.sector))].sort();

  return (
    <div className="wrap" style={{ paddingTop: 40 }}>
      <div className="eyebrow">Corporations</div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
        The world&apos;s leading public companies
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
        {corps.length} companies across {byCountry.size} economies, organised by home country.
        Market cap is a mid-2026 snapshot — it moves every second markets are open.
      </p>
      <div className="caveat" style={{ marginTop: 18, marginBottom: 30 }}>
        <b>Market cap vs. revenue vs. assets</b>
        These three measures rank companies very differently. NVIDIA is worth $4.8T on $130B
        revenue. A bank with $4T in assets may have a fraction of that market cap. All three
        figures are on each company page, alongside what the company actually makes.
      </div>

      <dl className="stats">
        <div className="stat"><dt>Companies</dt><dd>{corps.length}</dd></div>
        <div className="stat"><dt>Combined market cap</dt><dd>{fmtUsdBn(worldMkt)}</dd></div>
        <div className="stat"><dt>Economies represented</dt><dd>{byCountry.size}</dd></div>
      </dl>

      {/* all corporations, sorted by market cap */}
      <div className="section-head" style={{ marginTop: 40 }}><div>
        <h2>All companies, by market cap</h2>
        <p>Point-in-time mid-2026. Verify before relying.</p>
      </div></div>
      <table className="ledger" style={{ marginBottom: 44 }}>
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Company</th>
            <th className="hide-sm">Sector</th>
            <th>Economy</th>
            <th style={{ textAlign: 'right' }}>Mkt cap</th>
            <th style={{ textAlign: 'right' }} className="hide-sm">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {corps.map((c, i) => {
            const co = byIso.get(c.iso3);
            return (
              <tr key={c.id}>
                <td className="rank">{i + 1}</td>
                <td className="cname" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {corpLogoUrl(c.domain) ? (                    <LogoImg src={corpLogoUrl(c.domain)} size={32} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0,
                        background: 'white', borderRadius: 4, border: '1px solid var(--rule)', padding: 2 }} alt="" aria-hidden="true" />
                  ) : <span style={{ width: 22 }} />}
                  <span>
                    <Link href={`/corporation/${corpSlug(c.name)}`}>{c.name}</Link>
                    {c.ticker && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginLeft: 6 }}>{c.ticker}</span>}
                  </span>
                </td>
                <td className="hide-sm" style={{ color: 'var(--ink-2)', fontSize: 12 }}>{c.sector}</td>
                <td style={{ fontSize: 13 }}>
                  {co ? (
                    <Link href={`/country/${co.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {flagUrl(c.iso3) && <img src={flagUrl(c.iso3, 40)} alt={flagAlt(co.name)} width={14} height={11} loading="lazy" style={{ borderRadius: 1, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />}
                      {co.name}
                    </Link>
                  ) : c.iso3}
                </td>
                <td className="num">{c.market_cap_usd_bn ? fmtUsdBn(c.market_cap_usd_bn) : '—'}</td>
                <td className="num hide-sm">{c.revenue_usd_bn ? fmtUsdBn(c.revenue_usd_bn) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* by country */}
      <div className="section-head"><div><h2>By home economy</h2>
        <p>Combined market cap of companies headquartered in each economy.</p></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 44 }}>
        {countryList.map(({ iso3, list, total }) => {
          const co = byIso.get(iso3);
          if (!co) return null;
          return (
            <div key={iso3} className="panel" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {flagUrl(iso3) && <img src={flagUrl(iso3, 40)} alt={flagAlt(co.name)} width={18} height={14} style={{ borderRadius: 1, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />}
                <Link href={`/country/${co.slug}`} style={{ fontWeight: 600 }}>{co.name}</Link>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)' }}>{fmtUsdBn(total)}</span>
              </div>
              {list.slice(0, 4).map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dotted var(--rule)', fontSize: 12, gap: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    {corpLogoUrl(c.domain) && (                      <LogoImg src={corpLogoUrl(c.domain)} size={32} style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0,
                          background: 'white', borderRadius: 3, border: '1px solid var(--rule)', padding: 1 }} alt="" aria-hidden="true" />
                    )}
                    <Link href={`/corporation/${corpSlug(c.name)}`} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</Link>
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-2)', flexShrink: 0 }}>{c.market_cap_usd_bn ? fmtUsdBn(c.market_cap_usd_bn) : '—'}</span>
                </div>
              ))}
              {list.length > 4 && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>+{list.length - 4} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
