import Link from 'next/link';
import { getCountries, fmtPct, INDICATORS } from '@/lib/data';
import { flagEmoji } from '@/lib/flags';

export const revalidate = 3600;
export const metadata = {
  title: 'Central banks & policy rates — World Finance Atlas',
  description: 'Central bank policy rates and exchange rate regimes across the world economy.',
};

const REGIME_ORDER = [
  'Free floating', 'Floating', 'Crawl-like arrangement', 'Crawling peg',
  'Stabilised arrangement', 'Conventional peg', 'Currency board', 'Euro area',
  'US dollar', 'Euro (unilateral)', 'Multi-currency',
];

export default async function RatesPage() {
  const rows = await getCountries();
  const withRate = rows.filter((c) => c.policy_rate !== null)
    .sort((a, b) => (b.policy_rate ?? 0) - (a.policy_rate ?? 0));

  const I = INDICATORS.POLICY_RATE;
  const R = INDICATORS.FX_REGIME;

  // regime buckets
  const regimeGroups = new Map<string, typeof rows>();
  rows.filter((c) => c.fx_regime).forEach((c) => {
    const key = c.fx_regime as string;
    if (!regimeGroups.has(key)) regimeGroups.set(key, []);
    regimeGroups.get(key)!.push(c);
  });
  const sortedRegimes = [...regimeGroups.entries()].sort((a, b) => {
    const ai = REGIME_ORDER.findIndex((r) => a[0].startsWith(r));
    const bi = REGIME_ORDER.findIndex((r) => b[0].startsWith(r));
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  const maxRate = Math.max(...withRate.map((c) => c.policy_rate ?? 0));

  return (
    <div className="wrap" style={{ paddingTop: 40 }}>
      <div className="eyebrow">Money · live data</div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
        Central banks &amp; the price of money
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
        Policy rates are the one genuinely live figure on this site — they move on each bank’s
        meeting calendar. The regime a currency runs under is the hidden variable behind debt risk.
      </p>

      <div className="caveat" style={{ marginTop: 18, marginBottom: 30 }}>
        <b>Live figures, verify before relying</b>
        {I.caveat}
      </div>

      <div className="section-head"><div><h2>Policy rates, highest to lowest</h2>
        <p>{withRate.length} central banks. Euro-area members share the ECB’s rate.</p></div></div>
      <table className="ledger" style={{ marginBottom: 44 }}>
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Country</th>
            <th className="hide-sm">Central bank</th>
            <th className="hide-sm">Rate name</th>
            <th style={{ textAlign: 'right' }}>Policy rate</th>
          </tr>
        </thead>
        <tbody>
          {withRate.map((c, i) => (
            <tr key={c.iso3}>
              <td className="rank">{i + 1}</td>
              <td className="cname microbar">
                <span style={{ width: `${((c.policy_rate ?? 0) / maxRate) * 100}%`, background: 'var(--teal)' }} />
                <Link href={`/country/${c.slug}`} style={{ position: 'relative' }}>{flagEmoji(c.iso3)} {c.name}</Link>
              </td>
              <td className="hide-sm" style={{ color: 'var(--ink-2)', fontSize: 13 }}>{c.cb_name}</td>
              <td className="hide-sm" style={{ color: 'var(--ink-3)', fontSize: 12 }}>{c.policy_rate_name}</td>
              <td className="num">{fmtPct(c.policy_rate, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-head"><div><h2>Exchange rate regimes</h2>
        <p>How each currency is actually managed, grouped from most to least flexible. {R.source}, {R.vintage}.</p></div></div>
      {sortedRegimes.map(([regime, members]) => (
        <div key={regime} style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--ink)', marginBottom: 10, paddingBottom: 6,
            borderBottom: '1.5px solid var(--ink)' }}>
            {regime} · {members.length}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
            {members.sort((a, b) => b.gdp_usd_bn - a.gdp_usd_bn).map((c) => (
              <Link key={c.iso3} href={`/country/${c.slug}`}
                style={{ fontSize: 13, color: 'var(--ink-2)' }}>{flagEmoji(c.iso3)} {c.name}</Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
