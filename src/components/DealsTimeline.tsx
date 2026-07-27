type Deal = { deal: string; role: string; year: number | null };

// A horizontal timeline of landmark deals, alternating labels above/below the
// axis so they don't collide. Matches the site's inline-SVG, no-library pattern.
export default function DealsTimeline({ deals, label }: { deals: Deal[]; label: string }) {
  const dated = deals.filter((d) => d.year !== null) as { deal: string; role: string; year: number }[];
  if (dated.length === 0) return null;

  const years = dated.map((d) => d.year);
  const minY = Math.min(...years) - 1;
  const maxY = Math.max(...years) + 1;
  const span = Math.max(maxY - minY, 1);

  const W = 720;
  const H = 64 + Math.ceil(dated.length / 1) * 0; // base height, rows computed below
  const padX = 44;
  const axisY = 130;
  const rowGap = 58;

  // Sort by year, then stagger above/below alternately for readability
  const sorted = [...dated].sort((a, b) => a.year - b.year);
  const x = (yr: number) => padX + ((yr - minY) / span) * (W - padX * 2);

  // When multiple deals share a year, nudge them apart horizontally so labels don't collide
  const yearCounts = new Map<number, number>();
  const positioned = sorted.map((d) => {
    const seen = yearCounts.get(d.year) ?? 0;
    yearCounts.set(d.year, seen + 1);
    return { ...d, offset: seen };
  });
  const totalPerYear = new Map<number, number>();
  sorted.forEach((d) => totalPerYear.set(d.year, (totalPerYear.get(d.year) ?? 0) + 1));
  const jitter = (yr: number, offset: number) => {
    const total = totalPerYear.get(yr) ?? 1;
    if (total <= 1) return 0;
    const spread = 46;
    return (offset - (total - 1) / 2) * (spread / total);
  };

  const totalH = axisY + 40;

  return (
    <div className="panel">
      <h3>Notable public dealings — timeline</h3>
      <p style={{ marginTop: 0, marginBottom: 14, fontSize: 12, color: 'var(--ink-3)' }}>
        Public-record transactions only — not a client list. Banks do not disclose their clients,
        and no authoritative source exists for that; these are landmark deals reported through
        SEC filings or public disclosure.
      </p>
      <svg viewBox={`0 0 ${W} ${totalH}`} width="100%" role="img"
        aria-label={`Timeline of notable public dealings for ${label}`}
        style={{ display: 'block', overflow: 'visible' }}>
        {/* axis */}
        <line x1={padX} x2={W - padX} y1={axisY} y2={axisY} stroke="var(--rule)" strokeWidth="1.5" />
        {/* year ticks at each deal's year, deduped */}
        {[...new Set(sorted.map((d) => d.year))].map((yr) => (
          <g key={yr}>
            <line x1={x(yr)} x2={x(yr)} y1={axisY - 4} y2={axisY + 4} stroke="var(--ink-3)" strokeWidth="1" />
            <text x={x(yr)} y={axisY + 20} textAnchor="middle" fontSize="11"
              fontFamily="var(--mono)" fill="var(--ink-3)">{yr}</text>
          </g>
        ))}
        {positioned.map((d, i) => {
          const above = i % 2 === 0;
          const cx = x(d.year) + jitter(d.year, d.offset);
          const labelY = above ? axisY - 22 : axisY + 40;
          const lineY2 = above ? axisY - 8 : axisY + 8;
          const anchorY = above ? labelY + 4 : labelY - 6;
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={axisY} y2={lineY2} stroke="var(--gold)" strokeWidth="1.5" opacity="0.6" />
              <circle cx={cx} cy={axisY} r="4" fill="var(--gold)" />
              <text x={cx} y={anchorY} textAnchor="middle" fontSize="12" fontWeight="600"
                fontFamily="var(--display)" fill="var(--ink)">{d.deal}</text>
              <text x={cx} y={anchorY + (above ? 14 : -14)} textAnchor="middle" fontSize="10"
                fontFamily="var(--mono)" fill="var(--ink-2)">{d.role}</text>
            </g>
          );
        })}
      </svg>
      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '10px 0 0', fontFamily: 'var(--mono)' }}>
        Source: SEC filings / public disclosure · {dated.length} deal{dated.length !== 1 ? 's' : ''} of public record
      </p>
    </div>
  );
}
