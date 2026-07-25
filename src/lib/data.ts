import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import seed from './seed.json';

export type Country = {
  iso3: string;
  name: string;
  slug: string;
  region: string;
  capital: string | null;
  currency_code: string;
  currency_name?: string;
  gdp_usd_bn: number;
  population_mn: number;
  land_km2: number;
  debt_pct_gdp: number | null;
  gdp_per_capita: number | null;
  pop_density: number | null;
  gdp_per_km2: number | null;
  debt_usd_bn: number | null;
  net_debt_pct_gdp: number | null;
  hh_debt_pct_gdp: number | null;
  corp_debt_pct_gdp: number | null;
  private_debt_pct_gdp: number | null;
  fx_regime: string | null;
  cb_name: string | null;
  policy_rate: number | null;
  policy_rate_name: string | null;
  house_price_yoy: number | null;
  house_real_yoy: number | null;
  bis_covered: boolean;
};

export type Rail = {
  iso3: string;
  name: string;
  kind: string;
  live_year: number | null;
};

export type Observation = {
  iso3: string;
  indicator: string;
  year: number;
  value: number | null;
};

export type Bank = {
  name: string;
  iso3: string;
  assets_usd_bn: number;
  hq_city: string | null;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During `next build` we generate 187 static pages. If each one opened its own
// Supabase query, that's 500+ round-trips to a nano-tier instance — it times out
// and the build loops forever. So: the build always reads the bundled seed (instant,
// offline), and Supabase is used only for runtime revalidation after deploy.
// The seed already contains every field, so built pages are fully correct.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

const supabase = url && key && !isBuildPhase ? createClient(url, key) : null;
export const usingSupabase = Boolean(supabase);

const localCountries = seed.countries as Country[];
const localBanks = seed.banks as Bank[];
const localRails = ((seed as any).rails ?? []) as Rail[];

// cache() dedupes within a single request/render pass, so getCountry() calling
// getCountries() many times triggers at most ONE fetch, not one per country.
const fetchAllCountries = cache(async (): Promise<Country[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('country')
      .select('*')
      .order('gdp_usd_bn', { ascending: false });
    if (!error && data) return data as Country[];
  }
  return [...localCountries].sort((a, b) => b.gdp_usd_bn - a.gdp_usd_bn);
});

const fetchAllBanks = cache(async (): Promise<Bank[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('bank').select('*').order('assets_usd_bn', { ascending: false });
    if (!error && data) return data as Bank[];
  }
  return [...localBanks].sort((a, b) => b.assets_usd_bn - a.assets_usd_bn);
});

const fetchAllRails = cache(async (): Promise<Rail[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('rail').select('*').order('live_year', { ascending: true });
    if (!error && data) return data as Rail[];
  }
  return localRails;
});

export async function getCountries(): Promise<Country[]> {
  return fetchAllCountries();
}

export async function getCountry(slug: string): Promise<Country | null> {
  const all = await fetchAllCountries();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getBanks(iso3?: string): Promise<Bank[]> {
  const rows = await fetchAllBanks();
  return iso3 ? rows.filter((b) => b.iso3 === iso3) : rows;
}

export async function getRails(iso3?: string): Promise<Rail[]> {
  const rows = await fetchAllRails();
  return iso3 ? rows.filter((r) => r.iso3 === iso3) : rows;
}

// History needs its own client that ISN'T blocked at build time. Unlike the main
// country/bank/rail data (187 pages x several queries = build-timeout risk), history
// is fetched ONCE as a single bulk query and cached — same safe pattern as
// fetchAllCountries, just not gated behind isBuildPhase. This is what makes the
// GDP chart actually populate at build instead of silently rendering empty.
const historyClient = url && key ? createClient(url, key) : null;

const fetchAllHistory = cache(async (): Promise<Observation[]> => {
  if (!historyClient) return [];
  const { data, error } = await historyClient
    .from('observation')
    .select('iso3, indicator, year, value')
    .order('year', { ascending: true });
  if (error || !data) return [];
  return data as Observation[];
});

export async function getHistory(iso3: string, indicator = 'gdp_usd_bn'): Promise<Observation[]> {
  const all = await fetchAllHistory();
  return all.filter((o) => o.iso3 === iso3 && o.indicator === indicator);
}

// Available years across the whole dataset, for the global year switcher.
export async function getAvailableYears(): Promise<number[]> {
  const all = await fetchAllHistory();
  return [...new Set(all.filter((o) => o.indicator === 'gdp_usd_bn').map((o) => o.year))]
    .sort((a, b) => b - a);
}

export type WorldTotals = {
  countries: number;
  gdp_usd_bn: number;
  population_mn: number;
  land_km2: number;
  debt_usd_bn: number;
  debt_pct_gdp: number;
};

export function totals(rows: Country[]): WorldTotals {
  const gdp = rows.reduce((s, c) => s + c.gdp_usd_bn, 0);
  const debt = rows.reduce((s, c) => s + (c.debt_usd_bn ?? 0), 0);
  return {
    countries: rows.length,
    gdp_usd_bn: gdp,
    population_mn: rows.reduce((s, c) => s + c.population_mn, 0),
    land_km2: rows.reduce((s, c) => s + c.land_km2, 0),
    debt_usd_bn: debt,
    debt_pct_gdp: gdp ? (debt / gdp) * 100 : 0,
  };
}

export const REGIONS = [
  'Asia-Pacific',
  'North America',
  'Europe',
  'Latin America',
  'Middle East',
  'Africa',
] as const;

export function byRegion(rows: Country[]) {
  return REGIONS.map((region) => {
    const members = rows.filter((c) => c.region === region);
    return { region, ...totals(members), members };
  }).sort((a, b) => b.gdp_usd_bn - a.gdp_usd_bn);
}

// ---- formatting ----------------------------------------------------
export const fmtUsdBn = (v: number | null) =>
  v === null ? '—' : v >= 1000 ? `$${(v / 1000).toFixed(1)}T` : `$${Math.round(v).toLocaleString()}B`;

export const fmtNum = (v: number | null, d = 0) =>
  v === null ? '—' : v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmtPct = (v: number | null, d = 1) => (v === null ? '—' : `${v.toFixed(d)}%`);

export const fmtKm2 = (v: number | null) =>
  v === null ? '—' : `${Math.round(v).toLocaleString()} km²`;

export const fmtPop = (v: number | null) =>
  v === null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(2)}B` : `${v.toFixed(1)}M`;

export const INDICATORS: Record<string, { name: string; unit: string; definition: string; caveat?: string; source: string; vintage: string }> = {  GDP_NOM: {
    name: 'Nominal GDP',
    unit: 'USD billions',
    definition:
      'Gross domestic product at current market prices, converted to US dollars at market exchange rates. Not adjusted for purchasing power.',
    caveat:
      'Moves with the US dollar. A 10% dollar appreciation mechanically shrinks every other economy\u2019s figure without any change in real output.',
    source: 'IMF World Economic Outlook',
    vintage: '2025 estimate',
  },
  POP: {
    name: 'Population',
    unit: 'millions',
    definition: 'Total resident population, mid-year estimate.',
    source: 'UN World Population Prospects',
    vintage: '2025 estimate',
  },
  LAND: {
    name: 'Land area',
    unit: 'km²',
    definition: 'Total land area, excluding inland water where the source reports it separately.',
    caveat:
      'Definitions of inland water and disputed territory differ between sources; figures follow UN convention.',
    source: 'UN Statistics Division',
    vintage: '2024',
  },
  DEBT_GG: {
    name: 'General government gross debt',
    unit: '% of GDP',
    definition:
      'Gross debt of the general government sector as a share of GDP. Gross means government-held financial assets are not netted off.',
    caveat:
      'The most misread figure in public finance. Perimeter varies by country — the IMF notes its Fiscal Monitor tables use a narrower perimeter for China than its Article IV estimates, and published figures for Japan range from roughly 200% to 250% depending on perimeter and valuation, both citing the IMF. Debt in a currency the government issues is a fundamentally different instrument from debt it must earn or borrow to service; this ratio does not distinguish them.',
    source: 'IMF World Economic Outlook / Fiscal Monitor',
    vintage: '2025–26 estimate',
  },
  BANK_ASSETS: {
    name: 'Bank total assets',
    unit: 'USD billions',
    definition:
      'Total assets for the most recent reporting period: cash, loans, investments, property and equipment.',
    caveat:
      'Assets, not market capitalisation — the two rank very differently. Coverage is the largest institutions per country and is not exhaustive.',
    source: 'S&P Global Market Intelligence',
    vintage: '2026 ranking',
  },
  NET_DEBT: {
    name: 'Net government debt',
    unit: '% of GDP',
    definition: 'Government debt net of its financial assets, as a share of GDP.',
    caveat:
      'Published for fewer countries than gross. Norway is negative — its sovereign wealth fund holds more than the state owes. Net is often the fairer solvency measure; gross is what headlines quote.',
    source: 'IMF Fiscal Monitor',
    vintage: '2025–26 estimate',
  },
  HH_DEBT: {
    name: 'Household debt',
    unit: '% of GDP',
    definition: 'Credit to households and non-profits serving them, as a share of GDP.',
    caveat:
      'BIS publishes this for exactly 44 economies. The other ~143 countries here have no comparable figure — shown as absent, never zero. High household debt signals consumer leverage, not government weakness.',
    source: 'BIS credit statistics',
    vintage: '2024–25',
  },
  CORP_DEBT: {
    name: 'Corporate debt',
    unit: '% of GDP',
    definition: 'Credit to non-financial corporations, as a share of GDP.',
    caveat:
      'BIS, same 44-economy coverage. Luxembourg and Ireland are extreme outliers due to multinationals domiciled there; the figure reflects corporate structuring, not domestic fragility.',
    source: 'BIS credit statistics',
    vintage: '2024–25',
  },
  FX_REGIME: {
    name: 'Exchange rate regime',
    unit: 'classification',
    definition:
      'How the currency is managed: free floating, floating, pegged, currency board, or no separate legal tender.',
    caveat:
      'IMF de facto classification — what a country actually does, which sometimes differs from what it says. A country that issues its own freely floating currency can service local-currency debt in a way a pegged or dollarised economy cannot.',
    source: 'IMF AREAER',
    vintage: '2025',
  },
  POLICY_RATE: {
    name: 'Central bank policy rate',
    unit: '%',
    definition: 'The main policy interest rate set by the central bank.',
    caveat:
      'The one genuinely live figure on this site — it changes on each bank\u2019s meeting calendar, not annually. Euro-area countries share the ECB\u2019s rate. Verify against the central bank directly before relying on it.',
    source: 'Central banks / BIS',
    vintage: 'mid-2026, live',
  },
  HOUSE: {
    name: 'Residential house prices',
    unit: '% year-on-year',
    definition: 'Year-on-year change in residential property prices, nominal and inflation-adjusted.',
    caveat:
      'Roughly 60 economies publish comparable indices. Nominal and real diverge sharply — Turkey\u2019s nominal prices rose over 30% while real prices fell, because inflation outran them.',
    source: 'BIS / OECD residential property',
    vintage: 'latest quarter',
  },
};
