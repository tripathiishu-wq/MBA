// Snapshot comparison: market cap vs annual revenue as proportional horizontal bars.
// The ratio is the story — NVIDIA earns $130B but the market values it at $4.8T,
// a 37× multiple that reflects AI infrastructure demand expectations.
type Props = {
  name: string;
  marketCap: number | null;
  revenue: number | null;
  sector?: string;
};

const fmtT = (v: number) => v >= 1000 ? `$${(v/1000).toFixed(1)}T` : `$${Math.round(v)}B`;

export default function CorpScaleChart({ name, marketCap, revenue, sector }: Props) {
  if (!marketCap && !revenue) return null;

  const max = Math.max(marketCap ?? 0, revenue ?? 0) * 1.12;
  const pct = (v: number | null) => v ? `${Math.min((v / max) * 100, 100).toFixed(1)}%` : '0%';
  const ratio = marketCap && revenue ? (marketCap / revenue) : null;

  const bars = [
    { label: 'Market capitalisation', value: marketCap, color: 'var(--teal)', note: 'What the market values the company at today — moves every second.' },
    { label: 'Annual revenue', value: revenue, color: 'var(--ink)', note: `Latest fiscal year total revenue from 10-K filing.` },
  ];

  return (
    <div className="panel">
      <h3>Scale — market cap vs. revenue</h3>
      <p style={{ marginTop: 0, marginBottom: 20, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
        {ratio && ratio > 5 ? (
          <>The market values {name} at <b>{ratio.toFixed(0)}× its annual revenue</b> — a premium that prices in future growth, not current earnings. A high multiple can compress fast when expectations shift.</>
        ) : ratio ? (
          <>Market cap is <b>{ratio.toFixed(1)}× annual revenue</b>.</>
        ) : 'Market cap and revenue on the same axis — the gap between them is what the market is pricing in.'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {bars.map((b) => b.value != null ? (
          <div key={b.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 10, height: 10, background: b.color, display: 'inline-block', borderRadius: 1 }} />
                <span>{b.label}</span>
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{fmtT(b.value)}</span>
            </div>
            <div style={{ height: 28, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: pct(b.value), background: b.color,
                display: 'flex', alignItems: 'center', paddingLeft: 10, transition: 'width 0.3s', minWidth: 0 }}>
                {(b.value / max) > 0.25 && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'white', fontWeight: 600 }}>{fmtT(b.value)}</span>
                )}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{b.note}</div>
          </div>
        ) : null)}
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 18, lineHeight: 1.5, fontStyle: 'italic' }}>
        These two figures rank companies very differently.
        A bank with $4T in assets may have a fraction of the market cap of a software company
        on $50B revenue. Market cap reflects expectations of future cash flows, not current size.
        <b style={{ fontWeight: 600, color: 'var(--copper)' }}> Market cap is mid-2026 point-in-time — verify before relying.</b>
      </p>
    </div>
  );
}
