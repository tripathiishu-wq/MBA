import type { Observation } from '@/lib/data';

// Pure-SVG line chart. No library — keeps the build light and the look on-brand.
// Renders nothing if there's no history (honest absence, not an empty box).
export default function GdpHistoryChart({
  data,
  label,
}: {
  data: Observation[];
  label: string;
}) {
  const points = data
    .filter((d) => d.value !== null)
    .map((d) => ({ year: d.year, value: d.value as number }));

  if (points.length < 2) return null;

  const W = 680, H = 240, padL = 64, padR = 20, padT = 20, padB = 34;
  const years = points.map((p) => p.year);
  const values = points.map((p) => p.value);
  const minY = Math.min(...years), maxY = Math.max(...years);
  const maxV = Math.max(...values) * 1.08;
  const minV = 0;

  const x = (yr: number) => padL + ((yr - minY) / (maxY - minY || 1)) * (W - padL - padR);
  const y = (v: number) => H - padB - ((v - minV) / (maxV - minV || 1)) * (H - padT - padB);

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(maxY).toFixed(1)},${(H - padB).toFixed(1)} L${x(minY).toFixed(1)},${(H - padB).toFixed(1)} Z`;

  const fmtV = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}T` : `$${Math.round(v)}B`);

  // y gridlines at 0, 50%, 100% of max
  const ticks = [0, maxV / 2, maxV];
  // x labels: first, last, and a couple between
  const xLabels = [minY, ...(maxY - minY > 6 ? [Math.round((minY + maxY) / 2)] : []), maxY];

  const first = points[0], last = points[points.length - 1];
  const growth = ((last.value / first.value - 1) * 100);

  return (
    <div className="panel">
      <h3>GDP over time</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 14px' }}>
        Nominal GDP, {label}, {minY}–{maxY}. {growth >= 0 ? 'Up' : 'Down'}{' '}
        {Math.abs(growth).toFixed(0)}% over the period in dollar terms.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
        aria-label={`GDP of ${label} from ${minY} to ${maxY}`}
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
        <path d={area} fill="var(--teal)" opacity="0.08" />
        <path d={line} fill="none" stroke="var(--teal)" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(last.year)} cy={y(last.value)} r="3.5" fill="var(--teal)" />
        {xLabels.map((yr) => (
          <text key={yr} x={x(yr)} y={H - padB + 18} textAnchor="middle"
            fontSize="10" fontFamily="var(--mono)" fill="var(--ink-3)">
            {yr}
          </text>
        ))}
      </svg>
      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '10px 0 0', fontFamily: 'var(--mono)' }}>
        Source: IMF World Economic Outlook · nominal USD, not inflation-adjusted
      </p>
    </div>
  );
}
