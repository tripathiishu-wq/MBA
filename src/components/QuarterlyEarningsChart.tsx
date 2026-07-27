'use client';
import { useState } from 'react';

type Quarter = {
  period: string;
  revenue_usd_bn: number | null;
  net_income_usd_bn: number | null;
  eps: number | null;
};

type Props = { data: Quarter[]; label: string };

const fmtB = (v: number | null) =>
  v == null ? '—' : v >= 1 ? `$${v.toFixed(1)}B` : v >= 0 ? `$${(v * 1000).toFixed(0)}M` : `-$${Math.abs(v).toFixed(1)}B`;

export default function QuarterlyEarningsChart({ data, label }: Props) {
  const [metric, setMetric] = useState<'revenue' | 'net_income'>('revenue');
  if (!data.length) return null;

  const vals = data.map(d => metric === 'revenue' ? d.revenue_usd_bn : d.net_income_usd_bn);
  const max = Math.max(...vals.filter((v): v is number => v !== null).map(Math.abs)) * 1.15 || 1;
  const W = 720, H = 180, padL = 56, padR = 8, padT = 10, padB = 36;
  const barW = Math.max(2, Math.floor(((W - padL - padR) / data.length) - 2));
  const x = (i: number) => padL + i * ((W - padL - padR) / data.length) + (((W - padL - padR) / data.length) - barW) / 2;
  const baseline = H - padB;
  const barH = (v: number) => Math.abs(v / max) * (H - padT - padB - 8);

  // tick labels — show every 4th quarter label to avoid crowding
  const step = data.length <= 16 ? 2 : data.length <= 32 ? 4 : 8;

  const TEAL = 'var(--teal)', COPPER = 'var(--copper)', RULE = 'var(--rule)';

  return (
    <div className="panel">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0 }}>Quarterly earnings — {label}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['revenue','net_income'] as const).map(m => (
            <button key={m} onClick={() => setMetric(m)} style={{
              fontFamily: 'var(--mono)', fontSize: 11, padding: '3px 10px',
              border: '1px solid var(--rule)', background: metric === m ? 'var(--ink)' : 'transparent',
              color: metric === m ? 'white' : 'var(--ink-2)', cursor: 'pointer', borderRadius: 2,
            }}>
              {m === 'revenue' ? 'Revenue' : 'Net income'}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}
        role="img" aria-label={`Quarterly ${metric} for ${label}`}>
        {/* baseline */}
        <line x1={padL} x2={W - padR} y1={baseline} y2={baseline} stroke={RULE} strokeWidth="1" />

        {/* y ticks */}
        {[0.5, 1].map(f => {
          const yv = baseline - f * (H - padT - padB - 8);
          return (
            <g key={f}>
              <line x1={padL} x2={W - padR} y1={yv} y2={yv} stroke={RULE} strokeWidth="0.5" strokeDasharray="3 3" />
              <text x={padL - 4} y={yv + 4} textAnchor="end" fontSize="10"
                fontFamily="var(--mono)" fill="var(--ink-3)">{fmtB(max * f)}</text>
            </g>
          );
        })}

        {/* bars */}
        {data.map((d, i) => {
          const v = metric === 'revenue' ? d.revenue_usd_bn : d.net_income_usd_bn;
          if (v == null) return null;
          const h = barH(v);
          const negative = v < 0;
          const bx = x(i);
          const by = negative ? baseline : baseline - h;
          return (
            <g key={d.period}>
              <rect x={bx} y={by} width={barW} height={h}
                fill={negative ? COPPER : TEAL} opacity="0.85" rx="1" />
            </g>
          );
        })}

        {/* x labels */}
        {data.map((d, i) => {
          if (i % step !== 0) return null;
          return (
            <text key={d.period} x={x(i) + barW / 2} y={H - padB + 16}
              textAnchor="middle" fontSize="9.5" fontFamily="var(--mono)" fill="var(--ink-3)">
              {d.period}
            </text>
          );
        })}
      </svg>

      {/* latest quarter callout */}
      {(() => {
        const last = [...data].reverse().find(d =>
          (metric === 'revenue' ? d.revenue_usd_bn : d.net_income_usd_bn) != null);
        if (!last) return null;
        const v = metric === 'revenue' ? last.revenue_usd_bn : last.net_income_usd_bn;
        return (
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 10, display: 'flex', gap: 20 }}>
            <span>Latest ({last.period}): <b style={{ fontFamily: 'var(--mono)' }}>{fmtB(v)}</b></span>
            {last.eps != null && metric === 'net_income' && (
              <span>EPS: <b style={{ fontFamily: 'var(--mono)' }}>${last.eps.toFixed(2)}</b></span>
            )}
          </div>
        );
      })()}

      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '10px 0 0', fontFamily: 'var(--mono)' }}>
        Source: Twelve Data · company quarterly income statements · USD
      </p>
    </div>
  );
}
