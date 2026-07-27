type Deal = { deal: string; role: string; year: number | null };

// A compact horizontal timeline. Each deal gets its own label stack (name, role,
// year) directly above its marker — no separate axis-year labels to collide with,
// and height is sized to what the content actually needs, not a fixed tall canvas.
export default function DealsTimeline({ deals, label }: { deals: Deal[]; label: string }) {
  const dated = deals.filter((d) => d.year !== null) as { deal: string; role: string; year: number }[];
  if (dated.length === 0) return null;

  const sorted = [...dated].sort((a, b) => a.year - b.year);
  const years = sorted.map((d) => d.year);
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  const span = Math.max(maxY - minY, 1);

  const W = 720;
  const padX = 60;
  const axisY = 108;
  const H = 150;

  const x = (yr: number) => padX + ((yr - minY) / span) * (W - padX * 2);

  // Nudge apart deals that fall in the same year so labels don't overlap
  const totalPerYear = new Map<number, number>();
  sorted.forEach((d) => totalPerYear.set(d.year, (totalPerYear.get(d.year) ?? 0) + 1));
  const seenSoFar = new Map<number, number>();
  const positioned = sorted.map((d) => {
    const idx = seenSoFar.get(d.year) ?? 0;
    seenSoFar.set(d.year, idx + 1);
    const total = totalPerYear.get(d.year) ?? 1;
    const spread = 130;
    const jitter = total > 1 ? (idx - (total - 1) / 2) * (spread / total) : 0;
    return { ...d, cx: x(d.year) + jitter };
  });

  return (
    <div className="panel">
      <h3>Notable public dealings — timeline</h3>
      <p style={{ marginTop: 0, marginBottom: 14, fontSize: 12, color: 'var(--ink-3)' }}>
        Public-record transactions only — not a client list. Banks do not disclose their clients,
        and no authoritative source exists for that; these are landmark deals reported through
        SEC filings or public disclosure.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
        aria-label={`Timeline of notable public dealings for ${label}`}
        style={{ display: 'block', overflow: 'visible' }}>
        <line x1={padX} x2={W - padX} y1={axisY} y2={axisY} stroke="var(--rule)" strokeWidth="1.5" />
        {positioned.map((d, i) => (
          <g key={i}>
            <line x1={d.cx} x2={d.cx} y1={axisY} y2={axisY - 34} stroke="var(--gold)" strokeWidth="1.5" opacity="0.55" />
            <circle cx={d.cx} cy={axisY} r="4.5" fill="var(--gold)" />
            <text x={d.cx} y={axisY - 62} textAnchor="middle" fontSize="13" fontWeight="600"
              fontFamily="var(--display)" fill="var(--ink)">{d.deal}</text>
            <text x={d.cx} y={axisY - 48} textAnchor="middle" fontSize="10.5"
              fontFamily="var(--mono)" fill="var(--ink-2)">{d.role}</text>
            <text x={d.cx} y={axisY + 20} textAnchor="middle" fontSize="12" fontWeight="600"
              fontFamily="var(--mono)" fill="var(--ink-3)">{d.year}</text>
          </g>
        ))}
      </svg>
      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '10px 0 0', fontFamily: 'var(--mono)' }}>
        Source: SEC filings / public disclosure · {dated.length} deal{dated.length !== 1 ? 's' : ''} of public record
      </p>
    </div>
  );
}
