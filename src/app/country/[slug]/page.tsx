import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCountries, getCountry, getBanks, getRails, getHistory, totals, byRegion, INDICATORS, bankSlug,
  getTradeItems, getSovereignWealth, getCorporations, corpSlug, corpLogoUrl,
  fmtUsdBn, fmtPop, fmtKm2, fmtPct, fmtNum, type Country,
} from '@/lib/data';
import GdpHistoryChart from '@/components/GdpHistoryChart';
import WealthComposition from '@/components/WealthComposition';
import { flagUrl, flagAlt } from '@/lib/flags';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getCountries();
  return rows.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await getCountry(params.slug);
  if (!c) return { title: 'Not found — World Finance Atlas' };
  return {
    title: `${c.name} — economy, debt, currency and banks | World Finance Atlas`,
    description: `${c.name}: ${fmtUsdBn(c.gdp_usd_bn)} output, ${fmtPop(c.population_mn)} people, ${fmtKm2(c.land_km2)}, government debt ${fmtPct(c.debt_pct_gdp)} of GDP.`,
  };
}

function Cmp({ label, value, world, region, color }: {
  label: string; value: number; world: number; region: number; color: string;
}) {
  const max = Math.max(value, world, region) || 1;
  const bar = (v: number, c: string, o = 1) => (
    <div className="cmp-track"><div className="cmp-fill" style={{ width: `${(v / max) * 100}%`, background: c, opacity: o }} /></div>
  );
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="cmp-label"><span>{label}</span></div>
      <div className="cmp-row">
        <div className="cmp-label"><span>This country</span><b>{fmtNum(value, 0)}</b></div>
        {bar(value, color)}
      </div>
      <div className="cmp-row">
        <div className="cmp-label"><span>Region average</span><span>{fmtNum(region, 0)}</span></div>
        {bar(region, color, 0.45)}
      </div>
      <div className="cmp-row">
        <div className="cmp-label"><span>World average</span><span>{fmtNum(world, 0)}</span></div>
        {bar(world, color, 0.25)}
      </div>
    </div>
  );
}

export default async function CountryPage({ params }: { params: { slug: string } }) {
  const c = await getCountry(params.slug);
  if (!c) notFound();

  const all = await getCountries();
  const banks = await getBanks(c.iso3);
  const rails = await getRails(c.iso3);
  const history = await getHistory(c.iso3, 'gdp_usd_bn');
  const debtHistory = await getHistory(c.iso3, 'debt_pct_gdp');
  const popHistory = await getHistory(c.iso3, 'population_mn');
  const tradeItems = await getTradeItems(c.iso3);
  const corporations = await getCorporations(c.iso3);
  const swfs = await getSovereignWealth(c.iso3);
  const w = totals(all);
  const regions = byRegion(all);
  const reg = regions.find((r) => r.region === c.region)!;

  const rank = (key: keyof Country) => {
    const sorted = [...all]
      .filter((x) => x[key] !== null)
      .sort((a, b) => (b[key] as number) - (a[key] as number));
    return { pos: sorted.findIndex((x) => x.iso3 === c.iso3) + 1, of: sorted.length };
  };

  const gdpRank = rank('gdp_usd_bn');
  const popRank = rank('population_mn');
  const landRank = rank('land_km2');
  const debtRank = rank('debt_usd_bn');
  const moneyRank = rank('broad_money_pct_gdp');
  const goldRank = rank('gold_tonnes');

  const worldGdpPc = (w.gdp_usd_bn * 1000) / w.population_mn;
  const regGdpPc = (reg.gdp_usd_bn * 1000) / reg.population_mn;
  const worldDensity = (w.population_mn * 1e6) / w.land_km2;
  const regDensity = (reg.population_mn * 1e6) / reg.land_km2;

  const peers = all
    .filter((x) => x.region === c.region && x.iso3 !== c.iso3)
    .sort((a, b) => Math.abs(a.gdp_usd_bn - c.gdp_usd_bn) - Math.abs(b.gdp_usd_bn - c.gdp_usd_bn))
    .slice(0, 5);

  const D = INDICATORS.DEBT_GG;

  return (
    <>
      <section className="country-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Atlas</Link> · <Link href="/regions">{c.region}</Link> · {c.iso3}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <h1 style={{ margin: 0 }}>{c.name}</h1>
            {flagUrl(c.iso3) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={flagUrl(c.iso3, 160)}
                alt={flagAlt(c.name)}
                style={{
                  width: 'clamp(56px, 7vw, 88px)', height: 'auto', flexShrink: 0,
                  border: '1px solid var(--rule)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}
              />
            )}
          </div>
          <div className="country-meta">
            <span>Capital <b>{c.capital ?? '—'}</b></span>
            <span>Currency <b>{c.currency_code}</b>{c.currency_name ? ` · ${c.currency_name}` : ''}</span>
            <span>Region <b>{c.region}</b></span>
          </div>
        </div>
      </section>

      <div className="wrap">
        <dl className="stats">
          <div className="stat">
            <dt>Output · rank {gdpRank.pos}/{gdpRank.of}</dt>
            <dd>{fmtUsdBn(c.gdp_usd_bn)}</dd>
          </div>
          <div className="stat">
            <dt>People · rank {popRank.pos}/{popRank.of}</dt>
            <dd>{fmtPop(c.population_mn)}</dd>
          </div>
          <div className="stat">
            <dt>Land · rank {landRank.pos}/{landRank.of}</dt>
            <dd>{fmtNum(c.land_km2 / 1000, 0)}K<small> km²</small></dd>
          </div>
          <div className="stat">
            <dt>GDP per person</dt>
            <dd>${fmtNum(c.gdp_per_capita)}</dd>
          </div>
          <div className="stat">
            <dt>Density</dt>
            <dd>{fmtNum(c.pop_density, 1)}<small> /km²</small></dd>
          </div>
        </dl>

        {/* ---- leader: feature headline ---- */}
        {c.leader_name && (
          <div style={{ padding: '30px 0 26px', borderBottom: '1px solid var(--rule)', marginBottom: 4 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              {c.leader_title ?? 'Head of government'}
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(30px, 4.5vw, 46px)',
              fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, color: 'var(--gold)' }}>
              {c.leader_name}
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--mono)' }}>
              {c.leader_since ? `In office since ${c.leader_since}` : ''}
              {c.gov_type ? `${c.leader_since ? '  ·  ' : ''}${c.gov_type}` : ''}
              <span style={{ color: 'var(--ink-3)' }}>  ·  point-in-time, verify</span>
            </div>
            {c.hos_name && c.hos_name !== c.leader_name && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dotted var(--rule)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--ink-3)' }}>{c.hos_title ?? 'Head of state'}</span>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500,
                  color: 'var(--ink)', marginTop: 4 }}>{c.hos_name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>
                  Ceremonial head of state — the {c.leader_title?.toLowerCase() ?? 'head of government'} above holds executive power.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- government & alignment (political context) ---- */}
        {(c.gov_type || c.blocs) && (
          <div className="panel">
            <h3>Alignment &amp; membership</h3>
            <div className="grid-2">
              <div>
                <div className="pair" style={{ alignItems: 'flex-start' }}><dt>Government</dt>
                  <dd style={{ fontSize: 12, textAlign: 'right' }}>{c.gov_type ?? '—'}</dd></div>
                <div className="pair"><dt>Currency</dt><dd>{c.currency_code}</dd></div>
                <div className="pair"><dt>Capital</dt><dd style={{ fontSize: 13 }}>{c.capital ?? '—'}</dd></div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                Membership below is of formal treaty and economic organisations only — a matter of
                record. It is deliberately not a map of informal alliances, which are contested and
                unsourceable.
              </div>
            </div>
            {c.blocs && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--ink-3)' }}>Blocs &amp; organisations</span>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {c.blocs.split(', ').map((b) => (
                    <span key={b} style={{ fontFamily: 'var(--mono)', fontSize: 11,
                      padding: '3px 9px', border: '1px solid var(--rule)', background: '#FCFBF8',
                      color: b.includes('-') ? 'var(--ink-3)' : 'var(--ink)' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- DEBT: the argument ---- */}
        <div className="panel debt-block">
          <h3>Government debt</h3>
          {c.debt_pct_gdp === null ? (
            <div className="missing">
              No comparable general government debt figure is published for {c.name}.
              <br />This is an absence in the source data, not a value of zero.
            </div>
          ) : (
            <div className="grid-2">
              <div>
                <div className="debt-figure">
                  {fmtPct(c.debt_pct_gdp)}
                  <small>gross debt, share of GDP</small>
                </div>
                <div style={{ marginTop: 22 }}>
                  <div className="debt-figure" style={{ fontSize: 30, color: 'var(--ink)' }}>
                    {fmtUsdBn(c.debt_usd_bn)}
                    <small>outstanding, {debtRank.pos > 0 ? `rank ${debtRank.pos} of ${debtRank.of}` : 'unranked'}</small>
                  </div>
                </div>
              </div>
              <div>
                <dl style={{ margin: 0 }}>
                  <div className="pair"><dt>Perimeter</dt><dd>General government</dd></div>
                  <div className="pair"><dt>Basis</dt><dd>Gross, not net</dd></div>
                  <div className="pair"><dt>Valuation</dt><dd>Nominal</dd></div>
                  <div className="pair"><dt>Debt per person</dt>
                    <dd>${fmtNum(Math.round(((c.debt_usd_bn ?? 0) * 1000) / c.population_mn))}</dd></div>
                  <div className="pair">
                    <dt>Net of assets</dt>
                    <dd>{c.net_debt_pct_gdp !== null ? fmtPct(c.net_debt_pct_gdp) : 'not published'}</dd>
                  </div>
                  <div className="pair"><dt>Source</dt><dd style={{ fontSize: 11 }}>{D.source}</dd></div>
                </dl>
              </div>
            </div>
          )}
          {c.net_debt_pct_gdp !== null && c.debt_pct_gdp !== null && (
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-2)' }}>
              Gross debt is <b>{fmtPct(c.debt_pct_gdp)}</b>; net of the government’s financial assets
              it is <b>{fmtPct(c.net_debt_pct_gdp)}</b>
              {c.net_debt_pct_gdp < 0
                ? ' — negative, meaning the state holds more financial assets than it owes.'
                : `, a ${fmtPct(c.debt_pct_gdp - c.net_debt_pct_gdp, 1)} gap.`}
            </div>
          )}
          <div className="caveat">
            <b>What this number does not tell you</b>
            {D.caveat}
          </div>
        </div>

        {/* ---- corporations ---- */}
        {corporations.length > 0 && (
          <div className="panel">
            <h3>Major public companies</h3>
            <table className="ledger">
              <thead>
                <tr><th>Company</th><th className="hide-sm">Sector</th>
                  <th style={{ textAlign: 'right' }}>Mkt cap</th>
                  <th style={{ textAlign: 'right' }} className="hide-sm">Revenue</th></tr>
              </thead>
              <tbody>
                {corporations.slice(0, 10).map((corp) => (
                  <tr key={corp.id}>
                    <td className="cname" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {corpLogoUrl(corp.domain) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={corpLogoUrl(corp.domain, 32)} alt="" aria-hidden="true"
                          style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0,
                            background: 'white', borderRadius: 3, border: '1px solid var(--rule)', padding: 2 }} />
                      ) : <span style={{ width: 20 }} />}
                      <span>
                        <Link href={`/corporation/${corpSlug(corp.name)}`}>{corp.name}</Link>
                        {corp.ticker && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginLeft: 5 }}>{corp.ticker}</span>}
                      </span>
                    </td>
                    <td className="hide-sm" style={{ color: 'var(--ink-2)', fontSize: 12 }}>{corp.sector}</td>
                    <td className="num">{corp.market_cap_usd_bn ? fmtUsdBn(corp.market_cap_usd_bn) : '—'}</td>
                    <td className="num hide-sm">{corp.revenue_usd_bn ? fmtUsdBn(corp.revenue_usd_bn) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {corporations.length > 10 && (
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
                +{corporations.length - 10} more · <Link href="/corporations">see all companies</Link>
              </div>
            )}
            <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '10px 0 0', fontFamily: 'var(--mono)' }}>
              Market cap is mid-2026 point-in-time — verify before relying. Revenue is latest fiscal year.
            </p>
          </div>
        )}

                {/* ---- GDP history chart (renders only if history exists) ---- */}
        <GdpHistoryChart data={history} label={c.name} />

        {/* ---- debt trajectory: level matters less than direction ---- */}
        <GdpHistoryChart
          data={debtHistory}
          label={c.name}
          title="Debt trajectory"
          kind="pct"
          color="var(--copper)"
          source="IMF World Economic Outlook · gross general government debt, % of GDP"
        />

        {/* ---- external position: trade, inflation, reserves ---- */}
        <div className="panel">
          <h3>External position &amp; prices</h3>
          <div className="grid-3">
            <div>
              <div className="pair"><dt>Current account</dt>
                <dd style={{ color: (c.current_account_pct_gdp ?? 0) < 0 ? 'var(--copper)' : 'var(--teal)' }}>
                  {c.current_account_pct_gdp != null
                    ? `${c.current_account_pct_gdp > 0 ? '+' : ''}${fmtPct(c.current_account_pct_gdp)}`
                    : '—'}</dd></div>
              <div className="pair"><dt>Inflation (CPI)</dt>
                <dd>{c.inflation_pct != null ? fmtPct(c.inflation_pct) : '—'}</dd></div>
            </div>
            <div>
              <div className="pair"><dt>FX reserves</dt>
                <dd>{c.reserves_usd_bn != null ? fmtUsdBn(c.reserves_usd_bn) : '—'}</dd></div>
              <div className="pair"><dt>Reserves ÷ GDP</dt>
                <dd>{c.reserves_pct_gdp != null ? fmtPct(c.reserves_pct_gdp) : '—'}</dd></div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {c.current_account_pct_gdp != null && c.current_account_pct_gdp < -3
                ? 'Runs a sizeable external deficit — absorbing more than it produces and financing the gap from abroad. How risky that is depends on the currency regime above.'
                : c.current_account_pct_gdp != null && c.current_account_pct_gdp > 5
                ? 'Runs a large external surplus — producing more than it absorbs and accumulating claims on the rest of the world.'
                : 'A surplus is not automatically good nor a deficit bad; read it against the currency regime and reserves.'}
            </div>
          </div>
          {(c.broad_money_pct_gdp != null || c.gold_tonnes != null) && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
              <div className="grid-2">
                <div className="pair"><dt>Broad money (M2)
                  {moneyRank.pos > 0 && <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}> · rank {moneyRank.pos} of {moneyRank.of}</span>}</dt>
                  <dd>{c.broad_money_pct_gdp != null ? `${fmtPct(c.broad_money_pct_gdp, 0)} of GDP` : '—'}</dd></div>
                <div className="pair"><dt>Gold reserves
                  {goldRank.pos > 0 && <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}> · rank {goldRank.pos} of {goldRank.of}</span>}</dt>
                  <dd>{c.gold_tonnes != null ? `${fmtNum(c.gold_tonnes, 0)} tonnes` : '—'}</dd></div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>
                Broad money is the standard measure of how much money exists in the economy — not
                the same as wealth or reserves. Gold is in tonnes, not dollars, so it doesn&apos;t
                move with the gold price the way the FX reserve figure above does.
              </div>
            </div>
          )}
        </div>

        {/* ---- national wealth composition (World Bank) ---- */}
        <WealthComposition
          w={{
            produced: c.wealth_produced_pct,
            natural:  c.wealth_natural_pct,
            human:    c.wealth_human_pct,
            foreign:  c.wealth_foreign_pct,
          }}
          label={c.name}
        />

        {/* ---- sovereign wealth funds ---- */}
        {swfs.length > 0 && (
          <div className="panel">
            <h3>Sovereign wealth</h3>
            <p style={{ marginTop: 0, marginBottom: 14, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              State-owned investment vehicles distinct from the central bank&apos;s reserves.
              Where a country holds its financial buffer in a fund rather than in FX reserves,
              this is where to look.
            </p>
            <table className="ledger">
              <thead>
                <tr><th>Fund</th><th style={{ textAlign: 'right' }}>AUM</th><th style={{ textAlign: 'right' }} className="hide-sm">vs. GDP</th></tr>
              </thead>
              <tbody>
                {swfs.map((f, i) => (
                  <tr key={i}>
                    <td className="cname">{f.fund_name}</td>
                    <td className="num">{fmtUsdBn(f.aum_usd_bn)}</td>
                    <td className="num hide-sm">
                      {c.gdp_usd_bn > 0 ? fmtPct((f.aum_usd_bn / c.gdp_usd_bn) * 100, 0) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '10px 0 0', fontFamily: 'var(--mono)' }}>
              Source: SWF Institute · AUM moves with markets; point-in-time
            </p>
          </div>
        )}

        {/* ---- trade & supply chain ---- */}
        {(c.exports_usd_bn != null || c.top_export) ? (
          <div className="panel">
            <h3>Trade &amp; supply chain</h3>
            <div className="grid-3">
              <div>
                <div className="pair"><dt>Exports</dt>
                  <dd>{c.exports_usd_bn != null ? fmtUsdBn(c.exports_usd_bn) : '—'}</dd></div>
                <div className="pair"><dt>Imports</dt>
                  <dd>{c.imports_usd_bn != null ? fmtUsdBn(c.imports_usd_bn) : '—'}</dd></div>
                <div className="pair"><dt>Balance</dt>
                  <dd style={{ color: (c.trade_balance_usd_bn ?? 0) < 0 ? 'var(--copper)' : 'var(--teal)' }}>
                    {c.trade_balance_usd_bn != null
                      ? `${c.trade_balance_usd_bn > 0 ? '+' : '−'}${fmtUsdBn(Math.abs(c.trade_balance_usd_bn))}`
                      : '—'}</dd></div>
              </div>
              <div>
                <div className="pair"><dt>Trade ÷ GDP</dt>
                  <dd>{c.trade_openness_pct != null ? fmtPct(c.trade_openness_pct, 0) : '—'}</dd></div>
                <div className="pair"><dt>Logistics index</dt>
                  <dd>{c.lpi_score != null ? `${c.lpi_score.toFixed(1)} / 5` : '—'}</dd></div>
                <div className="pair"><dt>Principal export</dt>
                  <dd style={{ fontSize: 11, textAlign: 'right' }}>{c.top_export ?? '—'}</dd></div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                {(c.trade_openness_pct ?? 0) > 150
                  ? 'Trade exceeds the size of the economy itself — the mark of a re-export hub, where the same goods cross the border more than once. Read this as throughput, not domestic production.'
                  : (c.trade_openness_pct ?? 0) < 40 && c.trade_openness_pct != null
                  ? 'A relatively closed trade profile — usually a sign of a large domestic market rather than isolation.'
                  : 'Exports plus imports against output. Concentration in a single export category is the exposure worth watching.'}
              </div>
            </div>
            {c.trade_partners && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--rule)',
                fontSize: 13, color: 'var(--ink-2)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--ink-3)' }}>Principal partners</span>
                <div style={{ marginTop: 5 }}>{c.trade_partners}</div>
              </div>
            )}
            {tradeItems.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {(['export', 'import'] as const).map((dir) => {
                    const items = tradeItems.filter((t) => t.direction === dir);
                    if (!items.length) return null;
                    return (
                      <div key={dir}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                          textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                          {dir === 'export' ? 'Principal exports' : 'Principal imports'}
                        </span>
                        <div style={{ marginTop: 8 }}>
                          {items.map((t, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                              padding: '5px 0', borderBottom: '1px dotted var(--rule)', fontSize: 13 }}>
                              <span>{t.item}</span>
                              <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-2)' }}>
                                {t.pct_share != null ? `${t.pct_share}%` : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '10px 0 0', fontFamily: 'var(--mono)' }}>
                  Share of total goods trade. Source: UN Comtrade / national statistics
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="panel">
            <h3>Trade &amp; supply chain</h3>
            <div className="missing">
              No comparable trade breakdown is compiled for {c.name}.
              <br />Coverage here is roughly 130 economies; absence is a gap in this dataset,
              not an absence of trade.
            </div>
          </div>
        )}

        {/* ---- sovereign credit ratings ---- */}
        {(c.rating_sp || c.rating_moodys || c.rating_fitch) ? (
          <div className="panel">
            <h3>Sovereign credit rating</h3>
            <div className="grid-2">
              <div>
                <div className="pair"><dt>S&amp;P</dt><dd>{c.rating_sp ?? 'not rated'}</dd></div>
                <div className="pair"><dt>Moody&apos;s</dt><dd>{c.rating_moodys ?? 'not rated'}</dd></div>
                <div className="pair"><dt>Fitch</dt><dd>{c.rating_fitch ?? 'not rated'}</dd></div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                Opinions, not measurements. Where the three agencies disagree, that
                disagreement is itself information. Ratings move on the agencies&apos; own
                schedules — verify directly before relying on them.
                {c.bond_yield_10y != null && (
                  <span style={{ display: 'block', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--rule)' }}>
                    The market&apos;s own verdict sits in the <b>10-year bond yield: {fmtPct(c.bond_yield_10y, 2)}</b> —
                    what it actually costs this government to borrow. Where the rating and the yield
                    disagree, the yield is the crowd betting real capital.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="panel">
            <h3>Sovereign credit rating</h3>
            <div className="missing">
              No major agency currently publishes a rating for {c.name}.
              <br />Unrated is not the same as uncreditworthy — many governments simply
              do not seek a rating.
            </div>
          </div>
        )}

        {/* ---- population trajectory ---- */}
        <GdpHistoryChart
          data={popHistory}
          label={c.name}
          title="Population over time"
          kind="people"
          color="var(--people)"
          source="UN World Population Prospects / IMF · mid-year estimates"
        />

        {/* ---- private-sector leverage: the BIS coverage gap ---- */}
        <div className="panel">
          <h3>Private-sector debt</h3>
          {c.bis_covered ? (
            <div className="grid-2">
              <div>
                <dl style={{ margin: 0 }}>
                  <div className="pair">
                    <dt>Households</dt>
                    <dd>{c.hh_debt_pct_gdp !== null ? fmtPct(c.hh_debt_pct_gdp) : '—'} of GDP</dd>
                  </div>
                  <div className="pair">
                    <dt>Non-financial corporations</dt>
                    <dd>{c.corp_debt_pct_gdp !== null ? fmtPct(c.corp_debt_pct_gdp) : '—'} of GDP</dd>
                  </div>
                  <div className="pair" style={{ borderTop: '1px solid var(--rule)' }}>
                    <dt><b style={{ color: 'var(--ink)' }}>Total private</b></dt>
                    <dd><b>{c.private_debt_pct_gdp !== null ? fmtPct(c.private_debt_pct_gdp) : '—'}</b> of GDP</dd>
                  </div>
                </dl>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                Government debt is only one layer. Household and corporate borrowing is where financial
                fragility often actually sits — and here it totals{' '}
                <b>{c.private_debt_pct_gdp !== null ? fmtPct(c.private_debt_pct_gdp) : '—'}</b> of GDP,
                {c.debt_pct_gdp !== null && c.private_debt_pct_gdp !== null && c.private_debt_pct_gdp > c.debt_pct_gdp
                  ? ' larger than the public debt above.'
                  : ' set against the public figure above.'}
              </div>
            </div>
          ) : (
            <div className="missing">
              The BIS publishes household and corporate credit for 44 economies. {c.name} is not
              among them, so no comparable private-debt figure exists.
              <br />This is a gap in global data coverage, not a value of zero.
            </div>
          )}
        </div>

        {/* ---- money: regime, central bank, rate ---- */}
        <div className="panel">
          <h3>Currency &amp; monetary policy</h3>
          <div className="grid-3">
            <div>
              <div className="pair"><dt>Currency</dt><dd>{c.currency_code}</dd></div>
              <div className="pair"><dt>Regime</dt>
                <dd style={{ fontSize: 12, textAlign: 'right' }}>{c.fx_regime ?? 'not classified'}</dd></div>
            </div>
            <div>
              <div className="pair"><dt>Central bank</dt>
                <dd style={{ fontSize: 12, textAlign: 'right' }}>{c.cb_name ?? '—'}</dd></div>
              <div className="pair"><dt>{c.policy_rate_name ?? 'Policy rate'}</dt>
                <dd>{c.policy_rate !== null ? fmtPct(c.policy_rate, 2) : '—'}</dd></div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {c.fx_regime?.includes('Euro area')
                ? 'Shares the euro and the ECB’s policy rate with the rest of the euro area.'
                : c.fx_regime?.includes('dollar') || c.fx_regime?.includes('peg') || c.fx_regime?.includes('board')
                ? 'A pegged or fixed regime — monetary policy is anchored to the currency it tracks, limiting independent rate-setting.'
                : c.policy_rate !== null
                ? 'Issues its own currency and sets its own policy rate — meaningful room to manage local-currency debt.'
                : 'Monetary arrangement shown where classified.'}
            </div>
          </div>
        </div>

        {/* ---- housing ---- */}
        {(c.house_price_yoy !== null) && (
          <div className="panel">
            <h3>House prices</h3>
            <div className="grid-2">
              <div>
                <div className="pair"><dt>Nominal, year-on-year</dt>
                  <dd style={{ color: (c.house_price_yoy ?? 0) < 0 ? 'var(--copper)' : 'var(--teal)' }}>
                    {(c.house_price_yoy ?? 0) > 0 ? '+' : ''}{fmtPct(c.house_price_yoy, 1)}</dd></div>
                <div className="pair"><dt>Real (inflation-adjusted)</dt>
                  <dd style={{ color: (c.house_real_yoy ?? 0) < 0 ? 'var(--copper)' : 'var(--teal)' }}>
                    {(c.house_real_yoy ?? 0) > 0 ? '+' : ''}{fmtPct(c.house_real_yoy, 1)}</dd></div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                {c.house_price_yoy !== null && c.house_real_yoy !== null && c.house_price_yoy > 0 && c.house_real_yoy < 0
                  ? 'Prices rose in cash terms but fell after inflation — housing got cheaper in purchasing-power terms despite the headline rise.'
                  : 'The real figure strips out inflation and is the one that tells you whether housing actually became more expensive.'}
              </div>
            </div>
          </div>
        )}

        {/* ---- payment rails ---- */}
        {rails.length > 0 && (
          <div className="panel">
            <h3>Payment rails</h3>
            <table className="ledger">
              <thead>
                <tr><th>System</th><th>Type</th><th style={{ textAlign: 'right' }}>Live since</th></tr>
              </thead>
              <tbody>
                {rails.map((r) => (
                  <tr key={r.name}>
                    <td className="cname">{r.name}</td>
                    <td style={{ color: 'var(--ink-2)', fontSize: 13 }}>{r.kind}</td>
                    <td className="num">{r.live_year ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---- comparison ---- */}
        <div className="section" style={{ borderBottom: 0, paddingBottom: 20 }}>
          <div className="section-head">
            <div>
              <h2>Against its region and the world</h2>
              <p>Where {c.name} sits relative to the {c.region} average and the world average.</p>
            </div>
          </div>
          <div className="grid-2">
            <Cmp label="GDP per person (USD)" value={c.gdp_per_capita ?? 0}
              world={worldGdpPc} region={regGdpPc} color="var(--teal)" />
            <Cmp label="Population density (per km²)" value={c.pop_density ?? 0}
              world={worldDensity} region={regDensity} color="var(--people)" />
          </div>
          {c.debt_pct_gdp !== null && (
            <div className="grid-2">
              <Cmp label="Debt to GDP (%)" value={c.debt_pct_gdp}
                world={w.debt_pct_gdp} region={reg.debt_pct_gdp} color="var(--copper)" />
            </div>
          )}
        </div>

        {/* ---- banks ---- */}
        <div className="section" style={{ borderBottom: 0 }}>
          <div className="section-head">
            <div>
              <h2>Major banks</h2>
              <p>
                Largest institutions headquartered in {c.name}, by total assets. Assets, not
                market value — the two rank very differently.
              </p>
            </div>
            <Link href="/banks" className="more">All banks →</Link>
          </div>
          {banks.length === 0 ? (
            <div className="missing">No institution in this dataset is headquartered in {c.name}.</div>
          ) : (
            <table className="ledger">
              <thead>
                <tr>
                  <th style={{ width: 34 }}></th>
                  <th>Institution</th>
                  <th className="hide-sm">Headquarters</th>
                  <th style={{ textAlign: 'right' }}>Total assets</th>
                  <th style={{ textAlign: 'right' }} className="hide-sm">vs. national GDP</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((b, i) => (
                  <tr key={b.name}>
                    <td className="rank">{i + 1}</td>
                    <td className="cname">
                      <Link href={`/bank/${bankSlug(b.name)}`}>{b.name}</Link>
                      {b.ceo_name && (
                        <div style={{ fontSize: 11, fontWeight: 400, color: '#000', marginTop: 1 }}>{b.ceo_name}</div>
                      )}
                    </td>
                    <td className="hide-sm" style={{ color: 'var(--ink-2)' }}>{b.hq_city ?? '—'}</td>
                    <td className="num">{fmtUsdBn(b.assets_usd_bn)}</td>
                    <td className="num hide-sm">{fmtPct((b.assets_usd_bn / c.gdp_usd_bn) * 100, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ---- detail + peers ---- */}
        <div className="section" style={{ borderBottom: 0 }}>
          <div className="grid-2">
            <div className="panel">
              <h3>All figures</h3>
              <dl style={{ margin: 0 }}>
                <div className="pair"><dt>Nominal GDP</dt><dd>{fmtUsdBn(c.gdp_usd_bn)}</dd></div>
                <div className="pair"><dt>Share of world output</dt><dd>{fmtPct((c.gdp_usd_bn / w.gdp_usd_bn) * 100, 2)}</dd></div>
                <div className="pair"><dt>Population</dt><dd>{fmtPop(c.population_mn)}</dd></div>
                <div className="pair"><dt>Share of world population</dt><dd>{fmtPct((c.population_mn / w.population_mn) * 100, 2)}</dd></div>
                <div className="pair"><dt>Land area</dt><dd>{fmtKm2(c.land_km2)}</dd></div>
                <div className="pair"><dt>Share of world land</dt><dd>{fmtPct((c.land_km2 / w.land_km2) * 100, 2)}</dd></div>
                <div className="pair"><dt>GDP per person</dt><dd>${fmtNum(c.gdp_per_capita)}</dd></div>
                <div className="pair"><dt>GDP per km²</dt><dd>${fmtNum(c.gdp_per_km2)}</dd></div>
                <div className="pair"><dt>Population density</dt><dd>{fmtNum(c.pop_density, 1)} /km²</dd></div>
                <div className="pair"><dt>Government debt</dt><dd>{fmtPct(c.debt_pct_gdp)}</dd></div>
                <div className="pair"><dt>Debt outstanding</dt><dd>{fmtUsdBn(c.debt_usd_bn)}</dd></div>
              </dl>
            </div>
            <div className="panel">
              <h3>Closest by output in {c.region}</h3>
              <table className="ledger">
                <tbody>
                  {peers.map((p) => (
                    <tr key={p.iso3}>
                      <td className="cname"><Link href={`/country/${p.slug}`}>{p.name}</Link></td>
                      <td className="num">{fmtUsdBn(p.gdp_usd_bn)}</td>
                      <td className="num" style={{ color: 'var(--copper)' }}>{fmtPct(p.debt_pct_gdp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 14, marginBottom: 0 }}>
                Nearest neighbours by nominal output within the same region. Third column is
                debt to GDP.
              </p>
            </div>
          </div>
        </div>

        {/* ---- provenance ---- */}
        <div className="section">
          <div className="panel">
            <h3>Where these figures come from</h3>
            <dl style={{ margin: 0 }}>
              {Object.entries(INDICATORS).filter(([k]) => k !== 'GDP_PC' && k !== 'POP_DENSITY').map(([k, v]) => (
                <div className="pair" key={k} style={{ alignItems: 'flex-start' }}>
                  <dt style={{ flex: '0 0 42%' }}>
                    <b style={{ color: 'var(--ink)' }}>{v.name}</b>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)', fontWeight: 400 }}>
                      {v.definition}
                    </span>
                  </dt>
                  <dd style={{ fontSize: 11, textAlign: 'right', fontWeight: 400 }}>
                    {v.source}<br /><span style={{ color: 'var(--ink-3)' }}>{v.vintage}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
