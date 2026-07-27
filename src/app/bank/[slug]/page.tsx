import Link from 'next/link';
import LogoImg from '@/components/LogoImg';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getBanks, getBankBySlug, getCountries, getBankHistory, getBankDeals, bankSlug,
  fmtUsdBn, fmtPct, INDICATORS,
} from '@/lib/data';
import { flagUrl, flagAlt } from '@/lib/flags';
import { bankLogoUrl } from '@/lib/data';
import GdpHistoryChart from '@/components/GdpHistoryChart';
import DealsTimeline from '@/components/DealsTimeline';

export const revalidate = 3600;

export async function generateStaticParams() {
  const banks = await getBanks();
  return banks.map((b) => ({ slug: bankSlug(b.name) }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await getBankBySlug(params.slug);
  if (!r) return { title: 'Bank not found — World Finance Atlas' };
  return {
    title: `${r.bank.name} — assets, rank and context | World Finance Atlas`,
    description: `${r.bank.name}: ${fmtUsdBn(r.bank.assets_usd_bn)} in total assets, ranked ${r.globalRank} of ${r.total} banks worldwide.`,
  };
}

export default async function BankPage({ params }: { params: { slug: string } }) {
  const r = await getBankBySlug(params.slug);
  if (!r) notFound();
  const { bank, globalRank, total } = r;

  const countries = await getCountries();
  const home = countries.find((c) => c.iso3 === bank.iso3);
  const allBanks = await getBanks();
  const domestic = allBanks.filter((b) => b.iso3 === bank.iso3);
  const domesticRank = domestic.findIndex((b) => b.name === bank.name) + 1;
  const peers = allBanks
    .filter((b) => b.name !== bank.name)
    .sort((a, b) => Math.abs(a.assets_usd_bn - bank.assets_usd_bn) - Math.abs(b.assets_usd_bn - bank.assets_usd_bn))
    .slice(0, 6);
  const vsGdp = home ? (bank.assets_usd_bn / home.gdp_usd_bn) * 100 : null;
  const I = INDICATORS.BANK_ASSETS;
  const assetHistory = await getBankHistory(bank.name);
  const deals = await getBankDeals(bank.name);

  return (
    <>
      <section className="country-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Atlas</Link> · <Link href="/banks">Banks</Link>
            {home && <> · <Link href={`/country/${home.slug}`}>{home.name}</Link></>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {bankLogoUrl(bank.domain) && (                <LogoImg src={bankLogoUrl(bank.domain)} size={32} style={{ width: 52, height: 52, objectFit: 'contain', flexShrink: 0,
                    background: 'white', borderRadius: 8, border: '1px solid var(--rule)',
                    padding: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} alt={`${bank.name} logo`} />
              )}
              <h1 style={{ margin: 0 }}>{bank.name}</h1>
            </div>
            {home && flagUrl(home.iso3) && (              <img
                src={flagUrl(home.iso3, 160)}
                alt={flagAlt(home.name)}
                style={{
                  width: 'clamp(48px, 5vw, 72px)', height: 'auto', flexShrink: 0,
                  border: '1px solid var(--rule)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}
              />
            )}
          </div>
          <div className="country-meta">
            <span>Headquarters <b>{bank.hq_city ?? '—'}</b></span>
            {home && <span>Home economy <b>{home.name}</b></span>}
            <span>Global rank <b>{globalRank} of {total}</b></span>
            {bank.ceo_name && (
              <span>CEO <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{bank.ceo_name}</b>
                <span style={{ color: 'var(--ink-3)', fontSize: 11, marginLeft: 5 }}>verify</span>
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="wrap">
        <dl className="stats">
          <div className="stat"><dt>Total assets</dt><dd>{fmtUsdBn(bank.assets_usd_bn)}</dd></div>
          <div className="stat"><dt>Global rank</dt><dd>{globalRank}<small> / {total}</small></dd></div>
          <div className="stat"><dt>National rank</dt><dd>{domesticRank}<small> / {domestic.length}</small></dd></div>
          {vsGdp != null && (
            <div className="stat"><dt>Assets ÷ home GDP</dt><dd>{fmtPct(vsGdp, 0)}</dd></div>
          )}
        </dl>

        <div className="panel">
          <h3>What this figure is</h3>
          <p style={{ marginTop: 0, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            {bank.name} holds <b>{fmtUsdBn(bank.assets_usd_bn)}</b> in total assets — cash, loans,
            investments and property on its balance sheet.
            {vsGdp != null && vsGdp > 100 && home && (
              <> That is larger than the entire GDP of {home.name} ({fmtUsdBn(home.gdp_usd_bn)}),
              a mark of a banking sector big relative to its home economy — and a concentration of
              risk worth noting.</>
            )}
            {vsGdp != null && vsGdp <= 100 && home && (
              <> That is equivalent to {fmtPct(vsGdp, 0)} of {home.name}&apos;s GDP.</>
            )}
          </p>
          <div className="caveat">
            <b>Assets, not market value — and not a full profile</b>
            {I.caveat} This atlas carries each bank&apos;s assets, headquarters and ranking; it does
            not compile founding dates, ownership structures or fund-level breakdowns, which have no
            single authoritative free source across all {total} institutions. Where those details
            matter, consult the institution&apos;s own filings.
          </div>
        </div>

        {assetHistory.filter((d) => d.value !== null).length >= 2 && (
          <GdpHistoryChart
            data={assetHistory as any}
            label={bank.name}
            title="Total assets over time"
            source="Company 10-K filings / SEC EDGAR"
            note={undefined}
          />
        )}

        {deals.length > 0 && <DealsTimeline deals={deals} label={bank.name} />}

        {home && (
          <div className="panel">
            <h3>In its home economy</h3>
            <div className="grid-2">
              <div>
                <div className="pair"><dt>Home economy</dt>
                  <dd><Link href={`/country/${home.slug}`}>{home.name}</Link></dd></div>
                <div className="pair"><dt>National GDP</dt><dd>{fmtUsdBn(home.gdp_usd_bn)}</dd></div>
                <div className="pair"><dt>This bank vs. GDP</dt><dd>{fmtPct(vsGdp, 0)}</dd></div>
                <div className="pair"><dt>Rank among {home.name} banks</dt>
                  <dd>{domesticRank} of {domestic.length}</dd></div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
                  Other major {home.name} banks
                </div>
                {domestic.filter((b) => b.name !== bank.name).slice(0, 5).map((b) => (
                  <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '5px 0', borderBottom: '1px dotted var(--rule)', fontSize: 13 }}>
                    <Link href={`/bank/${bankSlug(b.name)}`}>{b.name}</Link>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-2)' }}>{fmtUsdBn(b.assets_usd_bn)}</span>
                  </div>
                ))}
                {domestic.length === 1 && (
                  <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                    The only {home.name} institution in this dataset.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="section" style={{ borderBottom: 0 }}>
          <div className="section-head"><div><h2>Comparable institutions worldwide</h2>
            <p>Banks closest in size to {bank.name}, by total assets.</p></div></div>
          <table className="ledger">
            <thead>
              <tr><th>Institution</th><th className="hide-sm">Headquarters</th>
                <th>Economy</th><th style={{ textAlign: 'right' }}>Total assets</th></tr>
            </thead>
            <tbody>
              {peers.map((b) => {
                const c = countries.find((x) => x.iso3 === b.iso3);
                return (
                  <tr key={b.name}>
                    <td className="cname"><Link href={`/bank/${bankSlug(b.name)}`}>{b.name}</Link></td>
                    <td className="hide-sm" style={{ color: 'var(--ink-2)', fontSize: 13 }}>{b.hq_city ?? '—'}</td>
                    <td style={{ fontSize: 13 }}>{c ? <Link href={`/country/${c.slug}`}>{c.name}</Link> : b.iso3}</td>
                    <td className="num">{fmtUsdBn(b.assets_usd_bn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
