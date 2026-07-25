import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCountries, getCountry, getBanks, getRails, totals, byRegion, INDICATORS,
  fmtUsdBn, fmtPop, fmtKm2, fmtPct, fmtNum, type Country,
} from '@/lib/data';

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
          <h1>{c.name}</h1>
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
                    <td className="cname">{b.name}</td>
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
