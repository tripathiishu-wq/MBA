import { createClient } from '@supabase/supabase-js';
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
};

export type Bank = {
  name: string;
  iso3: string;
  assets_usd_bn: number;
  hq_city: string | null;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase when configured; bundled seed otherwise. The site renders either way,
// so a missing env var degrades to static data rather than an error page.
const supabase = url && key ? createClient(url, key) : null;
export const usingSupabase = Boolean(supabase);

const localCountries = seed.countries as Country[];
const localBanks = seed.banks as Bank[];

export async function getCountries(): Promise<Country[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('country')
      .select('*')
      .order('gdp_usd_bn', { ascending: false });
    if (!error && data) return data as Country[];
  }
  return [...localCountries].sort((a, b) => b.gdp_usd_bn - a.gdp_usd_bn);
}

export async function getCountry(slug: string): Promise<Country | null> {
  const all = await getCountries();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getBanks(iso3?: string): Promise<Bank[]> {
  let rows: Bank[] = localBanks;
  if (supabase) {
    const q = supabase.from('bank').select('*').order('assets_usd_bn', { ascending: false });
    const { data, error } = iso3 ? await q.eq('iso3', iso3) : await q;
    if (!error && data) return data as Bank[];
  }
  if (iso3) rows = rows.filter((b) => b.iso3 === iso3);
  return [...rows].sort((a, b) => b.assets_usd_bn - a.assets_usd_bn);
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

// Indicator definitions — perimeter and caveat render beside the number.
export const INDICATORS: Record<
  string,
  { name: string; unit: string; definition: string; caveat?: string; source: string; vintage: string }
> = {
  GDP_NOM: {
    name: 'Nominal GDP',
    unit: 'USD billions',
    definition:
      'Gross domestic product at current market prices, converted to US dollars at market exchange rates. Not adjusted for purchasing power.',
    caveat:
      'Moves with the US dollar. A 10% dollar appreciation mechanically shrinks every other economy’s figure without any change in real output.',
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
};
