'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  REGIONS, fmtUsdBn, fmtPop, fmtPct, fmtNum, type Country,
} from '@/lib/data';

type Metric = {
  key: string;
  label: string;
  get: (c: Country) => number | null;
  fmt: (c: Country) => string;
  note: string;
};

const METRICS: Metric[] = [
  { key: 'gdp', label: 'Output', get: (c) => c.gdp_usd_bn, fmt: (c) => fmtUsdBn(c.gdp_usd_bn),
    note: 'Nominal GDP at market exchange rates, 2025 estimate.' },
  { key: 'pop', label: 'Population', get: (c) => c.population_mn, fmt: (c) => fmtPop(c.population_mn),
    note: 'Total resident population, mid-2025 estimate.' },
  { key: 'land', label: 'Land area', get: (c) => c.land_km2, fmt: (c) => `${fmtNum(c.land_km2)} km²`,
    note: 'Total land area, excluding inland water where reported separately.' },
  { key: 'debt_pct', label: 'Debt to GDP', get: (c) => c.debt_pct_gdp, fmt: (c) => fmtPct(c.debt_pct_gdp),
    note: 'Gross general government debt as a share of output. Gross, not net — government-held assets are not deducted. Perimeter varies by country; treat cross-country comparison with care.' },
  { key: 'debt_usd', label: 'Debt outstanding', get: (c) => c.debt_usd_bn, fmt: (c) => fmtUsdBn(c.debt_usd_bn),
    note: 'Government debt in absolute dollars. Derived from GDP and the debt ratio.' },
  { key: 'gdp_pc', label: 'GDP per person', get: (c) => c.gdp_per_capita, fmt: (c) => `$${fmtNum(c.gdp_per_capita)}`,
    note: 'Nominal GDP divided by population. Inflated for Ireland and Luxembourg by multinational profit booking.' },
  { key: 'density', label: 'Density', get: (c) => c.pop_density, fmt: (c) => `${fmtNum(c.pop_density, 1)} /km²`,
    note: 'People per km² of land. National averages conceal extreme internal variation.' },
  { key: 'gdp_km2', label: 'Output per km²', get: (c) => c.gdp_per_km2, fmt: (c) => `$${fmtNum(c.gdp_per_km2)}`,
    note: 'Nominal GDP divided by land area — economic density rather than population density.' },
];

export default function CompareTable({ rows, initialMetric }: { rows: Country[]; initialMetric?: string }) {
  const [metricKey, setMetricKey] = useState(
    METRICS.some((m) => m.key === initialMetric) ? (initialMetric as string) : 'gdp'
  );
  const [regions, setRegions] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [asc, setAsc] = useState(false);

  const metric = METRICS.find((m) => m.key === metricKey)!;

  const filtered = useMemo(() => {
    let out = rows.filter((c) => metric.get(c) !== null);
    if (regions.length) out = out.filter((c) => regions.includes(c.region));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      out = out.filter((c) => c.name.toLowerCase().includes(s) || c.iso3.toLowerCase().includes(s));
    }
    return out.sort((a, b) => {
      const x = metric.get(a) ?? 0, y = metric.get(b) ?? 0;
      return asc ? x - y : y - x;
    });
  }, [rows, metric, regions, q, asc]);

  const missing = rows.length - rows.filter((c) => metric.get(c) !== null).length;
  const max = Math.max(...filtered.map((c) => metric.get(c) ?? 0), 1);

  const toggleRegion = (r: string) =>
    setRegions((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  return (
    <>
      <div className="toolbar">
        <select className="field" value={metricKey} onChange={(e) => setMetricKey(e.target.value)}
          aria-label="Rank by">
          {METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <input className="field" placeholder="Find a country" value={q}
          onChange={(e) => setQ(e.target.value)} aria-label="Find a country" style={{ minWidth: 180 }} />
        <button className="chip" onClick={() => setAsc((v) => !v)}>
          {asc ? 'Lowest first' : 'Highest first'}
        </button>
        <span className="count">{filtered.length} shown</span>
      </div>

      <div className="toolbar" style={{ borderBottom: 'none', paddingTop: 8 }}>
        {REGIONS.map((r) => (
          <button key={r} className="chip" data-on={regions.includes(r)} onClick={() => toggleRegion(r)}>
            {r}
          </button>
        ))}
        {regions.length > 0 && (
          <button className="chip" onClick={() => setRegions([])}>Clear</button>
        )}
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: '68ch', marginTop: 4 }}>
        {metric.note}
      </p>

      {missing > 0 && (
        <div className="missing" style={{ marginBottom: 18, textAlign: 'left' }}>
          {missing} of {rows.length} economies publish no comparable figure for this measure and are
          excluded from the ranking. They are absent from the source, not zero.
        </div>
      )}

      <table className="ledger">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Country</th>
            <th className="hide-sm">Region</th>
            <th className="hide-sm">Currency</th>
            <th style={{ textAlign: 'right' }}>{metric.label}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => {
            const v = metric.get(c) ?? 0;
            return (
              <tr key={c.iso3}>
                <td className="rank">{i + 1}</td>
                <td className="cname microbar">
                  <span style={{ width: `${(v / max) * 100}%`, background: 'var(--teal)' }} />
                  <Link href={`/country/${c.slug}`} style={{ position: 'relative' }}>{c.name}</Link>
                </td>
                <td className="hide-sm" style={{ color: 'var(--ink-2)', fontSize: 13 }}>{c.region}</td>
                <td className="hide-sm" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.currency_code}</td>
                <td className="num">{metric.fmt(c)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="missing" style={{ marginTop: 20 }}>
          Nothing matches that. Clear the filters or try a different name.
        </div>
      )}
    </>
  );
}
