import type { Observation } from '@/lib/data';

type Props = {
  data: Observation[];
  label: string;
  title?: string;
  kind?: 'usd' | 'pct' | 'people';
  color?: string;
  note?: string;
  source?: string;
};

// Pure-SVG line chart, no library. Renders nothing when there's no history —
// honest absence rather than an empty box. Handles USD, %, and population.
export default function GdpHistoryChart({
  data,
  label,
  title = 'GDP over time',
  kind = 'usd',
  color = 'var(--teal)',
  note,
  source = 'IMF World Economic Outlook · nominal USD, not inflation-adjusted',
}: Props) {
  const points = data
    .filter((d) => d.value !== null)
    .map((d) => ({ year: d.year, value: d.value as number }));

  if (points.length < 2) return null;

  const W = 680, H = 240, padL = 64, padR = 20, padT = 20, padB = 34;
  const years = points.map((p) => p.year);
  const values = points.map((p) => p.value);
  const minY = Math.min(...years), maxY = Math.max(...years);

  // % series shouldn't force a zero baseline — the interesting movement is the band
  const rawMax = Math.max(...values), rawMin = Math.min(...values);
  const minV = kind === 'pct' ? Math.max(0, rawMin - (rawMax - rawMin) * 0.35) : 0;
  const maxV = rawMax * (kind === 'pct' ? 1.06 : 1.08);

  const x = (yr: number) => padL + ((yr - minY) / (maxY - minY || 1)) * (W - padL - padR);
  const y = (v: number) => H - padB - ((v - minV) / (maxV - minV || 1)) * (H - padT - padB);

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(maxY).toFixed(1)},${(H - padB).toFixed(1)} L${x(minY).toFixed(1)},${(H - padB).toFixed(1)} Z`;

  const fmtV = (v: number) =>
    kind === 'usd' ? (v >= 1000 ? `$${(v / 1000).toFixed(1)}T` : `$${Math.round(v)}B`)
    : kind === 'pct' ? `${v.toFixed(0)}%`
    : v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${Math.round(v)}M`;

  const ticks = [minV, (minV + maxV) / 2, maxV];
  const xLabels = [minY, ...(maxY - minY > 6 ? [Math.round((minY + maxY) / 2)] : []), maxY];

  const first = points[0], last = points[points.length - 1];
  const change = kind === 'pct'
    ? last.value - first.value
    : (last.value / first.value - 1) * 100;

  const summary = note ?? (kind === 'pct'
    ? `${change >= 0 ? 'Up' : 'Down'} ${Math.abs(change).toFixed(0)} percentage points over the period.`
    : `${change >= 0 ? 'Up' : 'Down'} ${Math.abs(change).toFixed(0)}% over the period${kind === 'usd' ? ' in dollar terms' : ''}.`);

  return (
    <div className="panel">
      <h3>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 14px' }}>
        {label}, {minY}–{maxY}. {summary}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
        aria-label={`${title} for ${label}, ${minY} to ${maxY}`}
        style={{ display: 'block', overflow: 'visible' }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)}
              stroke="var(--rule)" strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end"
              fontSize="10" fontFamily="var(--mono)" fill="var(--ink-3)">
              {fmtV(t)}
            </text>
          </g>
        ))}
        <path d={area} fill={color} opacity="0.08" />
        <path d={line} fill="none" stroke={color} strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(last.year)} cy={y(last.value)} r="3.5" fill={color} />
        {xLabels.map((yr) => (
          <text key={yr} x={x(yr)} y={H - padB + 18} textAnchor="middle"
            fontSize="10" fontFamily="var(--mono)" fill="var(--ink-3)">
            {yr}
          </text>
        ))}
      </svg>
      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '10px 0 0', fontFamily: 'var(--mono)' }}>
        Source: {source}
      </p>
    </div>
  );
}
