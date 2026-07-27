import Link from 'next/link';
import { getCountries, totals, fmtUsdBn, fmtPct, INDICATORS } from '@/lib/data';
import { flagUrl, flagAlt } from '@/lib/flags';

export const revalidate = 3600;
export const metadata = {
  title: 'Trade & supply chain — World Finance Atlas',
  description: 'Exports, imports, trade openness, principal exports and logistics capability across the world economy.',
};

export default async function TradePage() {
  const rows = await getCountries();
  const w = totals(rows);
  const withTrade = rows.filter((c) => c.exports_usd_bn != null);

  const byExports = [...withTrade].sort((a, b) => (b.exports_usd_bn ?? 0) - (a.exports_usd_bn ?? 0)).slice(0, 25);
  const byOpenness = [...withTrade].filter((c) => c.trade_openness_pct != null)
    .sort((a, b) => (b.trade_openness_pct ?? 0) - (a.trade_openness_pct ?? 0)).slice(0, 15);
  const byLpi = [...withTrade].filter((c) => c.lpi_score != null)
    .sort((a, b) => (b.lpi_score ?? 0) - (a.lpi_score ?? 0)).slice(0, 15);
  const surplus = [...withTrade].filter((c) => c.trade_balance_usd_bn != null)
    .sort((a, b) => (b.trade_balance_usd_bn ?? 0) - (a.trade_balance_usd_bn ?? 0));

  const totalExports = withTrade.reduce((s, c) => s + (c.exports_usd_bn ?? 0), 0);
  const maxEx = Math.max(...byExports.map((c) => c.exports_usd_bn ?? 0));
  const T = INDICATORS.TRADE;

  return (
    <div className="wrap" style={{ paddingTop: 40 }}>
      <div className="eyebrow">Trade &amp; supply chain</div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
        What crosses the borders
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
        Every other page on this site measures countries one at a time. Trade is the layer
        that connects them — and the one where the numbers most often mislead.
      </p>

      <div className="caveat" style={{ marginTop: 18, marginBottom: 30 }}>
        <b>Read re-export hubs carefully</b>
        {T.caveat}
      </div>

      <dl className="stats">
        <div className="stat"><dt>Economies covered</dt><dd>{withTrade.length}<small> of {rows.length}</small></dd></div>
        <div className="stat"><dt>Combined exports</dt><dd>{fmtUsdBn(totalExports)}</dd></div>
        <div className="stat"><dt>vs. world output</dt><dd>{fmtPct((totalExports / w.gdp_usd_bn) * 100, 0)}</dd></div>
      </dl>

      <div className="section-head" style={{ marginTop: 34 }}><div><h2>Largest exporters</h2>
        <p>Goods and services, latest full year.</p></div></div>
      <table className="ledger" style={{ marginBottom: 44 }}>
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th><th>Country</th>
            <th className="hide-sm">Principal export</th>
            <th style={{ textAlign: 'right' }}>Exports</th>
            <th style={{ textAlign: 'right' }} className="hide-sm">Balance</th>
          </tr>
        </thead>
        <tbody>
          {byExports.map((c, i) => (
            <tr key={c.iso3}>
              <td className="rank">{i + 1}</td>
              <td className="cname microbar">
                <span style={{ width: `${((c.exports_usd_bn ?? 0) / maxEx) * 100}%`, background: 'var(--teal)' }} />
                <Link href={`/country/${c.slug}`} style={{ position: 'relative' }}>{c.name}</Link>
              </td>
              <td className="hide-sm" style={{ color: 'var(--ink-2)', fontSize: 12 }}>{c.top_export ?? '—'}</td>
              <td className="num">{fmtUsdBn(c.exports_usd_bn ?? null)}</td>
              <td className="num hide-sm" style={{ color: (c.trade_balance_usd_bn ?? 0) < 0 ? 'var(--copper)' : 'var(--teal)' }}>
                {c.trade_balance_usd_bn != null ? `${c.trade_balance_usd_bn > 0 ? '+' : '−'}${fmtUsdBn(Math.abs(c.trade_balance_usd_bn))}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid-2">
        <div>
          <div className="section-head"><div><h2 style={{ fontSize: 20 }}>Most trade-exposed</h2>
            <p style={{ fontSize: 13 }}>Trade as a share of GDP. Above 100% signals a re-export hub.</p></div></div>
          <table className="ledger">
            <tbody>
              {byOpenness.map((c, i) => (
                <tr key={c.iso3}>
                  <td className="rank">{i + 1}</td>
                  <td className="cname"><Link href={`/country/${c.slug}`}>{<img src={flagUrl(c.iso3, 40)} alt={flagAlt(c.name)} width={16} height={12} loading="lazy" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />}{c.name}</Link></td>
                  <td className="num">{fmtPct(c.trade_openness_pct ?? null, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="section-head"><div><h2 style={{ fontSize: 20 }}>Strongest logistics</h2>
            <p style={{ fontSize: 13 }}>World Bank index, 1–5. Survey-based perception, not measurement.</p></div></div>
          <table className="ledger">
            <tbody>
              {byLpi.map((c, i) => (
                <tr key={c.iso3}>
                  <td className="rank">{i + 1}</td>
                  <td className="cname"><Link href={`/country/${c.slug}`}>{<img src={flagUrl(c.iso3, 40)} alt={flagAlt(c.name)} width={16} height={12} loading="lazy" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />}{c.name}</Link></td>
                  <td className="num">{(c.lpi_score ?? 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <div className="section-head"><div><h2>Surpluses and deficits</h2>
          <p>The five largest goods-and-services surpluses, and the five largest deficits.</p></div></div>
        <div className="grid-2">
          <table className="ledger">
            <thead><tr><th>Largest surpluses</th><th style={{ textAlign: 'right' }}>Balance</th></tr></thead>
            <tbody>
              {surplus.slice(0, 5).map((c) => (
                <tr key={c.iso3}>
                  <td className="cname"><Link href={`/country/${c.slug}`}>{<img src={flagUrl(c.iso3, 40)} alt={flagAlt(c.name)} width={16} height={12} loading="lazy" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />}{c.name}</Link></td>
                  <td className="num" style={{ color: 'var(--teal)' }}>+{fmtUsdBn(c.trade_balance_usd_bn ?? null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="ledger">
            <thead><tr><th>Largest deficits</th><th style={{ textAlign: 'right' }}>Balance</th></tr></thead>
            <tbody>
              {surplus.slice(-5).reverse().map((c) => (
                <tr key={c.iso3}>
                  <td className="cname"><Link href={`/country/${c.slug}`}>{<img src={flagUrl(c.iso3, 40)} alt={flagAlt(c.name)} width={16} height={12} loading="lazy" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />}{c.name}</Link></td>
                  <td className="num" style={{ color: 'var(--copper)' }}>−{fmtUsdBn(Math.abs(c.trade_balance_usd_bn ?? 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 16 }}>
          A trade deficit is not a debt and not a loss. It means a country received more goods
          and services than it sent, and settled the difference in financial claims — which is
          why the current account on each country page belongs next to this figure.
        </p>
      </div>
    </div>
  );
}
