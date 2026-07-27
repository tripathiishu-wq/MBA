type Region = { region: string; revenue_usd_bn: number; ordinal: number };

const COLORS = [
  'var(--teal)', 'var(--gold)', 'var(--copper)', 'var(--ink)',
  '#6B8FA3', '#A3826B', '#6BA38F', '#8F6BA3',
];

const fmtB = (v: number) => v >= 1 ? `$${v.toFixed(1)}B` : `$${(v*1000).toFixed(0)}M`;

export default function GeoRevenueChart({ data, label, year = 2024 }: {
  data: Region[]; label: string; year?: number;
}) {
  if (!data.length) return null;
  const total = data.reduce((s, r) => s + r.revenue_usd_bn, 0);
  const max = Math.max(...data.map(r => r.revenue_usd_bn));

  return (
    <div className="panel">
      <h3>Revenue by geography — {label}</h3>
      <p style={{ marginTop: 0, marginBottom: 16, fontSize: 13, color: 'var(--ink-2)' }}>
        FY{year} · ${total.toFixed(1)}B total · {data.length} reported segments
        <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 10 }}>
          Source: Company 10-K annual filing
        </span>
      </p>

      {/* stacked bar at top — full visual at a glance */}
      <div style={{ display: 'flex', width: '100%', height: 22, borderRadius: 2,
        overflow: 'hidden', border: '1px solid var(--rule)', marginBottom: 18 }}>
        {data.map((r, i) => (
          <div key={r.region}
            style={{ width: `${(r.revenue_usd_bn / total) * 100}%`, background: COLORS[i % COLORS.length],
              display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}
            title={`${r.region}: ${fmtB(r.revenue_usd_bn)}`}>
            {(r.revenue_usd_bn / total) > 0.12 && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'white', fontWeight: 600 }}>
                {Math.round((r.revenue_usd_bn / total) * 100)}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* detailed rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((r, i) => (
          <div key={r.region}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              marginBottom: 4, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 10, height: 10, background: COLORS[i % COLORS.length],
                  display: 'inline-block', borderRadius: 1, flexShrink: 0 }} />
                {r.region}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                {fmtB(r.revenue_usd_bn)}
                <span style={{ fontWeight: 400, color: 'var(--ink-3)', marginLeft: 8 }}>
                  {Math.round((r.revenue_usd_bn / total) * 100)}%
                </span>
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-2)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(r.revenue_usd_bn / max) * 100}%`,
                background: COLORS[i % COLORS.length], borderRadius: 1 }} />
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '14px 0 0', fontFamily: 'var(--mono)' }}>
        Geographic segments as reported — perimeters vary by company.
        Apple&apos;s &quot;Greater China&quot; includes mainland, HK and Taiwan; Amazon separates AWS globally.
        Not all companies break out every country; some consolidate into broad regions.
      </p>
    </div>
  );
}
