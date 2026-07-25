import data, data2

def esc(s): return s.replace("'", "''")
def nz(v): return "NULL" if v is None else str(v)

out = []
out.append("""-- =====================================================================
-- WORLD FINANCE ATLAS — Phase 2 migration (ADDITIVE)
-- Safe to run over the existing Phase 1 database. Adds columns + tables,
-- drops nothing that holds Phase 1 data.
-- =====================================================================

-- ---- new columns on country ----
alter table country add column if not exists net_debt_pct_gdp   numeric;
alter table country add column if not exists hh_debt_pct_gdp     numeric;  -- BIS, 44 economies
alter table country add column if not exists corp_debt_pct_gdp   numeric;  -- BIS, 44 economies
alter table country add column if not exists fx_regime           text;
alter table country add column if not exists cb_name             text;
alter table country add column if not exists policy_rate         numeric;
alter table country add column if not exists policy_rate_name    text;
alter table country add column if not exists house_price_yoy     numeric;
alter table country add column if not exists house_real_yoy      numeric;
alter table country add column if not exists bis_covered         boolean default false;

-- generated: total private-sector leverage where BIS covers it
alter table country drop column if exists private_debt_pct_gdp;
alter table country add column private_debt_pct_gdp numeric
  generated always as (
    case when hh_debt_pct_gdp is not null and corp_debt_pct_gdp is not null
    then hh_debt_pct_gdp + corp_debt_pct_gdp end) stored;
""")

# per-country updates
def upd(iso, sets):
    cols = ", ".join(f"{k} = {v}" for k, v in sets)
    return f"update country set {cols} where iso3 = '{iso}';"

out.append("\n-- ---- net debt ----")
for iso, v in data2.NET_DEBT.items():
    out.append(upd(iso, [("net_debt_pct_gdp", v)]))

out.append("\n-- ---- BIS household & corporate credit (44 economies) ----")
covered = set(data2.BIS_HH) | set(data2.BIS_CORP)
for iso in sorted(covered):
    sets = [("bis_covered", "true")]
    if iso in data2.BIS_HH: sets.append(("hh_debt_pct_gdp", data2.BIS_HH[iso]))
    if iso in data2.BIS_CORP: sets.append(("corp_debt_pct_gdp", data2.BIS_CORP[iso]))
    out.append(upd(iso, sets))

out.append("\n-- ---- FX regime ----")
for iso, v in data2.FX_REGIME.items():
    out.append(upd(iso, [("fx_regime", f"'{esc(v)}'")]))

out.append("\n-- ---- central bank + policy rate ----")
for iso, (name, rate, rname) in data2.CENTRAL_BANK.items():
    out.append(upd(iso, [("cb_name", f"'{esc(name)}'"), ("policy_rate", nz(rate)), ("policy_rate_name", f"'{esc(rname)}'")]))

out.append("\n-- ---- house prices ----")
for iso, (yoy, real) in data2.HOUSE.items():
    out.append(upd(iso, [("house_price_yoy", yoy), ("house_real_yoy", real)]))

# payment rails table
out.append("""
-- ---- payment rails ----
drop table if exists rail cascade;
create table rail (
  id       bigserial primary key,
  iso3     text not null references country(iso3) on delete cascade,
  name     text not null,
  kind     text not null,
  live_year int
);
create index rail_iso3_idx on rail(iso3);
""")
out.append("insert into rail (iso3, name, kind, live_year) values")
rows = []
for iso, rails in data2.RAILS.items():
    for (name, kind, yr) in rails:
        rows.append(f"  ('{iso}', '{esc(name)}', '{esc(kind)}', {yr})")
out.append(",\n".join(rows) + ";\n")

# new indicators
IND2 = [
 ("NET_DEBT","Net government debt","pct_gdp",
  "General government debt net of the government's financial assets, as a share of GDP.",
  "general_govt","nominal",
  "Published for fewer countries than gross debt. Norway is negative — its sovereign wealth fund holds more than the state owes. Net is often the fairer solvency measure, but gross is what headlines quote.",
  "IMF Fiscal Monitor","2025-26 estimate"),
 ("HH_DEBT","Household debt","pct_gdp",
  "Credit to households and non-profits serving households, as a share of GDP.",
  "households","market",
  "BIS publishes this for exactly 44 economies. The other ~143 countries on this site have no comparable figure - shown as absent, never zero. High household debt (Switzerland, Australia, Korea above 100%) signals consumer leverage, not government weakness.",
  "BIS credit statistics","2024-25"),
 ("CORP_DEBT","Corporate debt","pct_gdp",
  "Credit to non-financial corporations, as a share of GDP.",
  "non_financial_corps","market",
  "BIS, same 44-economy coverage as household debt. Luxembourg and Ireland are extreme outliers due to multinational entities domiciled there; the figure reflects corporate structuring, not domestic economic fragility.",
  "BIS credit statistics","2024-25"),
 ("FX_REGIME","Exchange rate regime","category",
  "How the currency is managed: free floating, floating, pegged, currency board, or no separate legal tender.",
  None,None,
  "IMF de facto classification - what a country actually does, which sometimes differs from what it says. Regime is the hidden variable behind debt risk: a country that issues its own freely floating currency can service local-currency debt in a way a pegged or dollarised economy cannot.",
  "IMF AREAER","2025"),
 ("POLICY_RATE","Central bank policy rate","pct",
  "The main policy interest rate set by the central bank.",
  None,None,
  "The one genuinely live figure on this site - it changes on each bank's meeting calendar, not annually. Euro-area countries share the ECB's rate. Values here are mid-2026; verify against the central bank directly before relying on them.",
  "Central banks / BIS","mid-2026, live"),
 ("HOUSE","Residential house prices","pct_yoy",
  "Year-on-year change in nominal residential property prices. A second column shows the inflation-adjusted (real) change.",
  None,None,
  "Roughly 60 economies publish comparable indices. Nominal and real can diverge sharply - Turkey's nominal prices rose over 30% while real prices fell, because inflation outran them. The real figure is the one that tells you whether housing got more expensive in purchasing-power terms.",
  "BIS / OECD residential property","latest quarter"),
 ("RAILS","Payment rails","registry",
  "National instant-payment and large-value settlement systems.",
  None,None,
  "Largely compiled rather than fed from an API. Instant retail rails (India's UPI, Brazil's PIX, the euro area's SEPA Instant) have reshaped domestic payments; large-value RTGS systems settle the interbank backbone. Coverage here is the principal systems, not every scheme.",
  "Central banks / CPMI","2025-26"),
]
out.append("\n-- ---- new indicator rows ----")
out.append("insert into indicator (code, name, unit, definition, perimeter, valuation, caveat, source, vintage) values")
rows = []
for (c,n,u,d,p,v,cv,s,vt) in IND2:
    q = lambda x: "NULL" if x is None else "'" + esc(x) + "'"
    rows.append(f"  ('{c}', '{esc(n)}', '{u}', '{esc(d)}', {q(p)}, {q(v)}, {q(cv)}, '{esc(s)}', '{esc(vt)}')")
out.append(",\n".join(rows) + "\non conflict (code) do update set definition = excluded.definition, caveat = excluded.caveat, vintage = excluded.vintage;\n")

# refresh views to include new aggregates
out.append("""
-- ---- refresh region summary with leverage where covered ----
create or replace view region_summary as
select
  region,
  count(*)                                            as countries,
  sum(gdp_usd_bn)                                     as gdp_usd_bn,
  sum(population_mn)                                  as population_mn,
  sum(land_km2)                                       as land_km2,
  sum(debt_usd_bn)                                    as debt_usd_bn,
  round(sum(gdp_usd_bn)*1000/sum(population_mn), 0)   as gdp_per_capita,
  round(sum(debt_usd_bn)/sum(gdp_usd_bn)*100, 1)      as debt_pct_gdp,
  count(*) filter (where bis_covered)                 as bis_covered_count,
  round(avg(policy_rate), 2)                          as avg_policy_rate
from country
group by region;

-- rail table read access
alter table rail enable row level security;
create policy "public read rail" on rail for select using (true);
""")

sql = "\n".join(out)
open("/home/claude/atlas/schema_phase2.sql","w").write(sql)
print("wrote schema_phase2.sql", len(sql), "bytes,", sql.count("update country"), "country updates")
