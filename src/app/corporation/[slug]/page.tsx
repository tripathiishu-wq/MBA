import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCorporations, getCorporationBySlug, getCountries, getAllCorporationSlugs, getCorporationHistory, getCorporationQuarterly, corpSlug, corpLogoUrl, fmtUsdBn, fmtPct, fmtNum } from '@/lib/data';
import QuarterlyEarningsChart from '@/components/QuarterlyEarningsChart';
import CorpScaleChart from '@/components/CorpScaleChart';
import GdpHistoryChart from '@/components/GdpHistoryChart';
import { flagUrl, flagAlt } from '@/lib/flags';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllCorporationSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await getCorporationBySlug(params.slug);
  if (!c) return { title: 'Not found — World Finance Atlas' };
  return {
    title: `${c.name} — market cap, revenue and context | World Finance Atlas`,
    description: c.description ?? `${c.name}: ${fmtUsdBn(c.market_cap_usd_bn)} market cap, ${c.sector}.`,
  };
}

export default async function CorpPage({ params }: { params: { slug: string } }) {
  const c = await getCorporationBySlug(params.slug);
  if (!c) notFound();

  const countries = await getCountries();
  const home = countries.find(co => co.iso3 === c.iso3);

  // find which banks have led deals involving this company
  const allCorps = await getCorporations();
  const globalRank = allCorps.findIndex(x => x.name === c.name) + 1;

  const revenueHistory = await getCorporationHistory(c.name);
  const quarterly = await getCorporationQuarterly(c.name);

  const sectorPeers = allCorps
    .filter(x => x.sector === c.sector && x.name !== c.name)
    .sort((a, b) => (b.market_cap_usd_bn ?? 0) - (a.market_cap_usd_bn ?? 0))
    .slice(0, 5);

  const homePeers = allCorps
    .filter(x => x.iso3 === c.iso3 && x.name !== c.name)
    .sort((a, b) => (b.market_cap_usd_bn ?? 0) - (a.market_cap_usd_bn ?? 0))
    .slice(0, 5);

  return (
    <>
      <section className="country-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Atlas</Link> · <Link href="/corporations">Corporations</Link>
            {home && <> · <Link href={`/country/${home.slug}`}>{home.name}</Link></>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {corpLogoUrl(c.domain) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={corpLogoUrl(c.domain, 80)} alt={`${c.name} logo`}
                  style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0,
                    background: 'white', borderRadius: 8,
                    border: '1px solid var(--rule)', padding: 6,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
              )}
              <div>
                <h1 style={{ margin: '0 0 4px' }}>{c.name}</h1>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                  {c.ticker && <span style={{ marginRight: 12 }}>{c.ticker}</span>}
                  <span>{c.sector}</span>
                  {home && <span style={{ marginLeft: 12 }}>· {home.name}</span>}
                </div>
              </div>
            </div>
            {home && flagUrl(home.iso3) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={flagUrl(home.iso3, 160)} alt={flagAlt(home.name)}
                style={{ width: 'clamp(48px, 5vw, 72px)', height: 'auto', flexShrink: 0,
                  border: '1px solid var(--rule)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }} />
            )}
          </div>
        </div>
      </section>

      <div className="wrap">
        <dl className="stats">
          <div className="stat"><dt>Market cap</dt>
            <dd>{c.market_cap_usd_bn ? fmtUsdBn(c.market_cap_usd_bn) : '—'}<small> verify</small></dd></div>
          <div className="stat"><dt>Annual revenue</dt><dd>{c.revenue_usd_bn ? fmtUsdBn(c.revenue_usd_bn) : '—'}</dd></div>
          <div className="stat"><dt>Employees</dt>
            <dd>{c.employees_k ? `${fmtNum(c.employees_k * 1000, 0)}` : '—'}</dd></div>
          <div className="stat"><dt>Global rank</dt><dd>{globalRank}<small> of {allCorps.length}</small></dd></div>
        </dl>

        <div className="panel">
          <h3>What {c.name} does</h3>
          <p style={{ marginTop: 0, fontSize: 14, color: 'var(--ink)', lineHeight: 1.65 }}>{c.description}</p>
          {c.top_products && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'var(--ink-3)' }}>Principal products & services</span>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {c.top_products}
              </div>
            </div>
          )}
        </div>

        <CorpScaleChart
          name={c.name}
          marketCap={c.market_cap_usd_bn ?? null}
          revenue={c.revenue_usd_bn ?? null}
          sector={c.sector}
        />

        {revenueHistory.length >= 3 ? (
          <GdpHistoryChart
            data={revenueHistory as any}
            label={c.name}
            title="Annual revenue over time"
            source="Company 10-K filings / SEC EDGAR · annual revenue, USD"
          />
        ) : (
          <div className="panel">
            <h3>Revenue history</h3>
            <div className="missing">
              Annual revenue history is not yet compiled for {c.name}. This atlas carries
              verified, filing-sourced history for a small and growing set — partial and real
              is preferred over complete and estimated. For quarterly earnings data, Twelve Data
              (twelvedata.com) provides a clean free-tier API feed.
            </div>
          </div>
        )}


        {quarterly.length > 0 && (
          <QuarterlyEarningsChart data={quarterly} label={c.name} />
        )}


        {home && (
          <div className="panel">
            <h3>In its home economy</h3>
            <div className="grid-2">
              <div>
                <div className="pair"><dt>Home economy</dt>
                  <dd><Link href={`/country/${home.slug}`}>{home.name}</Link></dd></div>
                <div className="pair"><dt>National GDP</dt><dd>{fmtUsdBn(home.gdp_usd_bn)}</dd></div>
                <div className="pair"><dt>Mkt cap ÷ GDP</dt>
                  <dd>{c.market_cap_usd_bn ? fmtPct((c.market_cap_usd_bn / home.gdp_usd_bn) * 100, 0) : '—'}</dd></div>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--ink-3)' }}>Other {home.name} companies</span>
                <div style={{ marginTop: 8 }}>
                  {homePeers.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between',
                      padding: '5px 0', borderBottom: '1px dotted var(--rule)', fontSize: 13 }}>
                      <Link href={`/corporation/${corpSlug(p.name)}`}>{p.name}</Link>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-2)' }}>{p.market_cap_usd_bn ? fmtUsdBn(p.market_cap_usd_bn) : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {sectorPeers.length > 0 && (
          <div className="panel">
            <h3>Sector peers — {c.sector}</h3>
            <table className="ledger">
              <thead>
                <tr><th>Company</th><th>Economy</th><th style={{ textAlign: 'right' }}>Mkt cap</th><th style={{ textAlign: 'right' }} className="hide-sm">Revenue</th></tr>
              </thead>
              <tbody>
                {sectorPeers.map(p => {
                  const pco = countries.find(co => co.iso3 === p.iso3);
                  return (
                    <tr key={p.id}>
                      <td className="cname"><Link href={`/corporation/${corpSlug(p.name)}`}>{p.name}</Link></td>
                      <td style={{ fontSize: 13 }}>
                        {pco ? <Link href={`/country/${pco.slug}`}>{pco.name}</Link> : p.iso3}
                      </td>
                      <td className="num">{p.market_cap_usd_bn ? fmtUsdBn(p.market_cap_usd_bn) : '—'}</td>
                      <td className="num hide-sm">{p.revenue_usd_bn ? fmtUsdBn(p.revenue_usd_bn) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
