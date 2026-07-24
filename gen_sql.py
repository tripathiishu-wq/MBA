import data

def esc(s):
    return s.replace("'", "''")

def nz(v):
    return "NULL" if v is None else str(v)

slug = lambda n: (n.lower()
    .replace("'", "").replace(".", "").replace(",", "")
    .replace("(", "").replace(")", "")
    .replace(" ", "-"))

out = []
out.append("""-- =====================================================================
-- WORLD FINANCE ATLAS — Phase 1 schema + seed
-- Run in Supabase SQL editor. Idempotent: safe to re-run.
-- =====================================================================

drop table if exists bank cascade;
drop table if exists country cascade;
drop table if exists currency cascade;
drop table if exists indicator cascade;

-- ---------------------------------------------------------------------
create table currency (
  code        text primary key,
  name        text not null
);

create table country (
  iso3            text primary key,
  name            text not null,
  slug            text not null unique,
  region          text not null,
  capital         text,
  currency_code   text references currency(code),
  gdp_usd_bn      numeric not null,
  population_mn   numeric not null,
  land_km2        numeric not null,
  debt_pct_gdp    numeric,
  -- generated columns: computed by Postgres, never stored stale
  gdp_per_capita  numeric generated always as (
                    case when population_mn > 0
                    then round(gdp_usd_bn * 1000 / population_mn, 0) end) stored,
  pop_density     numeric generated always as (
                    case when land_km2 > 0
                    then round(population_mn * 1000000 / land_km2, 1) end) stored,
  gdp_per_km2     numeric generated always as (
                    case when land_km2 > 0
                    then round(gdp_usd_bn * 1000000000 / land_km2, 0) end) stored,
  debt_usd_bn     numeric generated always as (
                    case when debt_pct_gdp is not null
                    then round(gdp_usd_bn * debt_pct_gdp / 100, 1) end) stored
);

create index country_region_idx  on country(region);
create index country_gdp_idx     on country(gdp_usd_bn desc);
create index country_debt_idx    on country(debt_pct_gdp desc nulls last);
create index country_slug_idx    on country(slug);

create table bank (
  id            bigserial primary key,
  name          text not null,
  iso3          text not null references country(iso3) on delete cascade,
  assets_usd_bn numeric not null,
  hq_city       text
);
create index bank_iso3_idx   on bank(iso3);
create index bank_assets_idx on bank(assets_usd_bn desc);

-- Indicator definitions. This table is the product: perimeter and caveat
-- render next to the number in the UI, never buried in a methodology page.
create table indicator (
  code        text primary key,
  name        text not null,
  unit        text not null,
  definition  text not null,
  perimeter   text,
  valuation   text,
  caveat      text,
  source      text not null,
  vintage     text not null
);
""")

# currencies
cur = {}
for c in data.COUNTRIES:
    cur[c[7]] = c[8]
out.append("\n-- ---- currency ----")
out.append("insert into currency (code, name) values")
rows = [f"  ('{k}', '{esc(v)}')" for k, v in sorted(cur.items())]
out.append(",\n".join(rows) + "\non conflict (code) do nothing;\n")

# countries
out.append("\n-- ---- country ----")
out.append("insert into country (iso3, name, slug, region, capital, currency_code, gdp_usd_bn, population_mn, land_km2, debt_pct_gdp) values")
rows = []
seen = set()
for (name, iso, reg, gdp, pop, land, debt, ccode, cname, cap) in data.COUNTRIES:
    s = slug(name)
    assert s not in seen, s
    seen.add(s)
    rows.append(f"  ('{iso}', '{esc(name)}', '{s}', '{reg}', '{esc(cap)}', '{ccode}', {gdp}, {pop}, {land}, {nz(debt)})")
out.append(",\n".join(rows) + "\non conflict (iso3) do nothing;\n")

# banks
out.append("\n-- ---- bank ----")
out.append("insert into bank (name, iso3, assets_usd_bn, hq_city) values")
rows = [f"  ('{esc(n)}', '{i}', {a}, '{esc(h)}')" for (n, i, a, h) in data.BANKS]
out.append(",\n".join(rows) + ";\n")

# indicators
IND = [
 ("GDP_NOM","Nominal GDP","usd_bn",
  "Gross domestic product at current market prices, converted to US dollars at market exchange rates. Not adjusted for purchasing power.",
  "whole_economy","market",
  "Moves with the US dollar. A 10% dollar appreciation mechanically shrinks every other economy's figure without any change in real output.",
  "IMF World Economic Outlook","2025 estimate"),
 ("POP","Population","persons_mn",
  "Total resident population, mid-year estimate.",
  None,None,None,
  "UN World Population Prospects","2025 estimate"),
 ("LAND","Land area","km2",
  "Total land area. Excludes inland water bodies where reported separately by the source.",
  None,None,
  "Definitions of coastline, territorial claims and inland water differ between sources; disputed territories are attributed per UN convention.",
  "UN Statistics Division / CIA World Factbook","2024"),
 ("DEBT_GG","General government gross debt","pct_gdp",
  "Gross debt of the general government sector as a share of GDP. Gross means government-held financial assets are NOT netted off.",
  "general_govt","nominal",
  "The single most misread figure in public finance. Gross, not net: Japan's net position is materially less severe than this ratio implies. Perimeter varies by country - the IMF itself notes its Fiscal Monitor tables cover a narrower perimeter of general government for China than its Article IV estimates. Published figures for Japan range from roughly 200% to 250% depending on perimeter and valuation, and both cite the IMF. Debt in a currency the government issues is a fundamentally different instrument from debt it must earn or borrow to service; this ratio does not distinguish them.",
  "IMF World Economic Outlook / Fiscal Monitor","2025-26 estimate"),
 ("DEBT_USD","Government debt, absolute","usd_bn",
  "General government gross debt expressed in US dollars. Derived as nominal GDP multiplied by the debt-to-GDP ratio.",
  "general_govt","nominal",
  "A derived figure, not separately sourced. Inherits every caveat of both inputs.",
  "Derived from IMF WEO","2025-26 estimate"),
 ("BANK_ASSETS","Bank total assets","usd_bn",
  "Total assets of the institution for its most recent reporting period: cash, loans, investments, property and equipment.",
  "institution",None,
  "Assets, not market capitalisation - the two rank very differently. ICBC leads on assets while JPMorgan leads on market value. Coverage here is the largest institutions per country and is not exhaustive; smaller markets are represented by one or two banks only.",
  "S&P Global Market Intelligence","2026 ranking, 2025 year-end assets"),
 ("GDP_PC","GDP per capita","usd",
  "Nominal GDP divided by population. Computed in-database, not separately sourced.",
  "whole_economy",None,
  "Inflated for Ireland and Luxembourg by multinational profit booking; GNI per capita is the better living-standards measure for both.",
  "Derived","2025 estimate"),
 ("POP_DENSITY","Population density","persons_km2",
  "Population divided by land area. Computed in-database.",
  None,None,
  "National averages conceal extreme internal variation - most of Canada, Australia and Russia is effectively unpopulated.",
  "Derived","2025 estimate"),
]
out.append("\n-- ---- indicator ----")
out.append("insert into indicator (code, name, unit, definition, perimeter, valuation, caveat, source, vintage) values")
rows = []
for (c,n,u,d,p,v,cv,s,vt) in IND:
    q = lambda x: "NULL" if x is None else "'" + esc(x) + "'"
    rows.append(f"  ('{c}', '{esc(n)}', '{u}', '{esc(d)}', {q(p)}, {q(v)}, {q(cv)}, '{esc(s)}', '{esc(vt)}')")
out.append(",\n".join(rows) + "\non conflict (code) do nothing;\n")

# views
out.append("""
-- ---- aggregate view ----
create or replace view region_summary as
select
  region,
  count(*)                                   as countries,
  sum(gdp_usd_bn)                            as gdp_usd_bn,
  sum(population_mn)                         as population_mn,
  sum(land_km2)                              as land_km2,
  sum(debt_usd_bn)                           as debt_usd_bn,
  round(sum(gdp_usd_bn)*1000/sum(population_mn), 0)          as gdp_per_capita,
  round(sum(debt_usd_bn)/sum(gdp_usd_bn)*100, 1)             as debt_pct_gdp
from country
group by region;

create or replace view world_totals as
select
  count(*)                as countries,
  sum(gdp_usd_bn)         as gdp_usd_bn,
  sum(population_mn)      as population_mn,
  sum(land_km2)           as land_km2,
  sum(debt_usd_bn)        as debt_usd_bn,
  round(sum(debt_usd_bn)/sum(gdp_usd_bn)*100, 1) as debt_pct_gdp
from country;

-- ---- public read access ----
alter table country  enable row level security;
alter table bank     enable row level security;
alter table currency enable row level security;
alter table indicator enable row level security;

create policy "public read country"   on country   for select using (true);
create policy "public read bank"      on bank      for select using (true);
create policy "public read currency"  on currency  for select using (true);
create policy "public read indicator" on indicator for select using (true);
""")

sql = "\n".join(out)
open("/home/claude/atlas/schema.sql","w").write(sql)
print("wrote schema.sql", len(sql), "bytes")
