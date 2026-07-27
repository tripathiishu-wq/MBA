type Wealth = {
  produced?: number | null;
  natural?: number | null;
  human?: number | null;
  foreign?: number | null;
};

// Horizontal stacked-bar showing how a country's wealth divides across the four
// World Bank asset classes. Human capital dominates developed economies; natural
// capital dominates resource states. Renders nothing when data is absent.
export default function WealthComposition({ w, label }: { w: Wealth; label: string }) {
  const p = w.produced, n = w.natural, h = w.human, f = w.foreign;
  if (p == null && n == null && h == null && f == null) return null;

  const parts = [
    { key: 'human',    label: 'Human capital',     value: h ?? 0, color: 'var(--teal)',   note: 'present value of future labour earnings' },
    { key: 'produced', label: 'Produced capital',  value: p ?? 0, color: 'var(--ink)',    note: 'buildings, machinery, infrastructure' },
    { key: 'natural',  label: 'Natural capital',   value: n ?? 0, color: 'var(--gold)',   note: 'land, forests, minerals, energy' },
    { key: 'foreign',  label: 'Net foreign assets',value: f ?? 0, color: 'var(--copper)', note: 'claims on the rest of the world (can be negative)' },
  ];
  // Foreign can be negative; render on its own row below the main bar for honesty
  const positiveTotal = parts.filter(x => x.value > 0).reduce((s,x) => s + x.value, 0) || 1;

  return (
    <div className="panel">
      <h3>National wealth composition</h3>
      <p style={{ marginTop: 0, marginBottom: 14, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
        How {label}&apos;s total wealth divides across the four World Bank asset classes. Human capital
        dominates developed economies; natural capital dominates resource states.
      </p>

      <div style={{ display: 'flex', width: '100%', height: 28, borderRadius: 2, overflow: 'hidden',
        border: '1px solid var(--rule)', marginBottom: 14 }}>
        {parts.filter(x => x.value > 0).map((x) => (
          <div key={x.key} style={{ width: `${(x.value / positiveTotal) * 100}%`, background: x.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
            {x.value >= 8 && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'white', fontWeight: 600 }}>{x.value}%</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 20px', fontSize: 12 }}>
        {parts.map((x) => (
          <div key={x.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ width: 10, height: 10, background: x.color, marginTop: 4, flexShrink: 0, borderRadius: 1 }} />
            <div>
              <div style={{ fontWeight: 600 }}>
                {x.label} <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-2)', fontWeight: 400 }}>
                  {x.value >= 0 ? `${x.value}%` : `${x.value}%`}
                </span>
              </div>
              <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>{x.note}</div>
            </div>
          </div>
        ))}
      </div>

      {(f ?? 0) < 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          Net foreign assets are negative — {label} owes more to the rest of the world than the world owes it.
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '12px 0 0', fontFamily: 'var(--mono)' }}>
        Source: World Bank Changing Wealth of Nations, 2021 edition
      </p>
    </div>
  );
}
