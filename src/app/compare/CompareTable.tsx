'use client';

import { flagUrl, flagAlt } from '@/lib/flags';

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
  { key: 'net_debt', label: 'Net govt debt', get: (c) => c.net_debt_pct_gdp, fmt: (c) => fmtPct(c.net_debt_pct_gdp),
    note: 'Government debt net of financial assets. Published for ~42 economies. Norway is negative — its wealth fund exceeds what the state owes.' },
  { key: 'hh_debt', label: 'Household debt', get: (c) => c.hh_debt_pct_gdp, fmt: (c) => fmtPct(c.hh_debt_pct_gdp),
    note: 'Credit to households as % of GDP. BIS covers exactly 44 economies; the rest have no comparable figure and are excluded, not zeroed.' },
  { key: 'corp_debt', label: 'Corporate debt', get: (c) => c.corp_debt_pct_gdp, fmt: (c) => fmtPct(c.corp_debt_pct_gdp),
    note: 'Credit to non-financial corporations as % of GDP. BIS 44-economy coverage. Luxembourg and Ireland are multinational-driven outliers.' },
  { key: 'private_debt', label: 'Total private debt', get: (c) => c.private_debt_pct_gdp, fmt: (c) => fmtPct(c.private_debt_pct_gdp),
    note: 'Household plus corporate debt, where BIS covers both. Often larger than government debt — this is where financial fragility frequently sits.' },
  { key: 'policy_rate', label: 'Policy rate', get: (c) => c.policy_rate, fmt: (c) => fmtPct(c.policy_rate, 2),
    note: 'Central bank main policy rate. The one live figure here — changes on meeting calendars. Euro-area members share the ECB rate. Mid-2026.' },
  { key: 'house_yoy', label: 'House prices (nominal)', get: (c) => c.house_price_yoy, fmt: (c) => `${(c.house_price_yoy ?? 0) > 0 ? '+' : ''}${fmtPct(c.house_price_yoy, 1)}`,
    note: 'Year-on-year change in residential prices. ~55 economies. Nominal — see each country page for the inflation-adjusted figure.' },
  { key: 'current_account', label: 'Current account', get: (c) => c.current_account_pct_gdp ?? null, fmt: (c) => c.current_account_pct_gdp != null ? `${c.current_account_pct_gdp > 0 ? '+' : ''}${fmtPct(c.current_account_pct_gdp)}` : '—',
    note: 'Balance of trade, income and transfers with the rest of the world, % of GDP. A surplus is not automatically good nor a deficit bad — it depends on the currency regime and who finances the gap.' },
  { key: 'inflation', label: 'Inflation (CPI)', get: (c) => c.inflation_pct ?? null, fmt: (c) => c.inflation_pct != null ? fmtPct(c.inflation_pct) : '—',
    note: 'Annual average consumer price change, 2025 estimate. The figure that makes every nominal number on this site readable. Baskets differ by country, so treat cross-country comparison as indicative.' },
  { key: 'reserves', label: 'FX reserves', get: (c) => c.reserves_usd_bn ?? null, fmt: (c) => c.reserves_usd_bn != null ? fmtUsdBn(c.reserves_usd_bn) : '—',
    note: 'Official reserve assets including gold. Adequacy depends on exposure, not the raw total — gold is at market value, so totals move with the gold price alone.' },
  { key: 'reserves_gdp', label: 'Reserves ÷ GDP', get: (c) => c.reserves_pct_gdp ?? null, fmt: (c) => c.reserves_pct_gdp != null ? fmtPct(c.reserves_pct_gdp) : '—',
    note: 'Reserves as a share of output — a rough adequacy read. Small open economies and peggers rationally hold far more than large floaters.' },
  { key: 'exports', label: 'Exports', get: (c) => c.exports_usd_bn ?? null, fmt: (c) => c.exports_usd_bn != null ? fmtUsdBn(c.exports_usd_bn) : '—',
    note: 'Goods and services leaving the country, latest full year. ~130 economies compiled. Re-export hubs record goods that merely pass through.' },
  { key: 'trade_balance', label: 'Trade balance', get: (c) => c.trade_balance_usd_bn ?? null, fmt: (c) => c.trade_balance_usd_bn != null ? `${c.trade_balance_usd_bn > 0 ? '+' : '−'}${fmtUsdBn(Math.abs(c.trade_balance_usd_bn))}` : '—',
    note: 'Exports minus imports. A deficit is not a debt or a loss — it means a country received more than it sent and settled the difference in financial claims.' },
  { key: 'openness', label: 'Trade openness', get: (c) => c.trade_openness_pct ?? null, fmt: (c) => c.trade_openness_pct != null ? fmtPct(c.trade_openness_pct, 0) : '—',
    note: 'Exports plus imports over GDP. Above 100% marks a re-export hub, not an unusually productive economy. A low figure usually means a large domestic market.' },
  { key: 'lpi', label: 'Logistics index', get: (c) => c.lpi_score ?? null, fmt: (c) => c.lpi_score != null ? `${c.lpi_score.toFixed(1)} / 5` : '—',
    note: 'World Bank Logistics Performance Index, 1–5. Survey-based perception rather than physical measurement, published irregularly.' },
  { key: 'bond_yield', label: 'Bond yield (10Y)', get: (c) => c.bond_yield_10y ?? null, fmt: (c) => c.bond_yield_10y != null ? fmtPct(c.bond_yield_10y, 2) : '—',
    note: 'Market yield on the benchmark 10-year government bond — what it costs that government to borrow. Live market data, point-in-time. Where a rating and a yield disagree, the yield is the market betting real money.' },
  { key: 'broad_money', label: 'Broad money (M2)', get: (c) => c.broad_money_pct_gdp ?? null, fmt: (c) => c.broad_money_pct_gdp != null ? `${fmtPct(c.broad_money_pct_gdp, 0)} of GDP` : '—',
    note: 'M2 — currency plus deposits — the standard measure of how much money exists in an economy. Not the same as wealth or reserves.' },
  { key: 'gold', label: 'Gold reserves', get: (c) => c.gold_tonnes ?? null, fmt: (c) => c.gold_tonnes != null ? `${fmtNum(c.gold_tonnes, 0)} t` : '—',
    note: 'Central bank gold holdings in metric tonnes. Distinct from FX reserve value — tonnage does not move with the gold price.' },
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
                  <Link href={`/country/${c.slug}`} style={{ position: 'relative' }}>{<img src={flagUrl(c.iso3, 40)} alt={flagAlt(c.name)} width={16} height={12} loading="lazy" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />}{c.name}</Link>
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
