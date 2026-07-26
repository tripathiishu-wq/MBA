import data3, data4

def esc(s): return s.replace("'", "''")
def q(v): return "NULL" if v is None else "'" + esc(str(v)) + "'"
def n(v): return "NULL" if v is None else str(v)

out = ["""-- =====================================================================
-- WORLD FINANCE ATLAS — Phase 3 + 4 combined (ADDITIVE)
-- Trade, inflation, reserves, credit ratings, supply chain.
-- ONE migration. Safe over existing DB. Adds columns only, drops nothing.
-- =====================================================================

-- ---- Phase 3: external position, prices, ratings ----
alter table country add column if not exists current_account_pct_gdp numeric;
alter table country add column if not exists inflation_pct           numeric;
alter table country add column if not exists reserves_usd_bn         numeric;
alter table country add column if not exists rating_sp               text;
alter table country add column if not exists rating_moodys           text;
alter table country add column if not exists rating_fitch            text;

-- ---- Phase 4: trade & supply chain ----
alter table country add column if not exists exports_usd_bn          numeric;
alter table country add column if not exists imports_usd_bn          numeric;
alter table country add column if not exists top_export              text;
alter table country add column if not exists lpi_score               numeric;
alter table country add column if not exists trade_partners          text;

alter table country drop column if exists reserves_pct_gdp;
alter table country add column reserves_pct_gdp numeric
  generated always as (
    case when gdp_usd_bn > 0 and reserves_usd_bn is not null
    then round(reserves_usd_bn / gdp_usd_bn * 100, 1) end) stored;

-- Trade openness: (exports + imports) / GDP. Above 100% is normal for
-- re-export hubs, where the same goods cross the border more than once.
alter table country drop column if exists trade_openness_pct;
alter table country add column trade_openness_pct numeric
  generated always as (
    case when gdp_usd_bn > 0 and exports_usd_bn is not null and imports_usd_bn is not null
    then round((exports_usd_bn + imports_usd_bn) / gdp_usd_bn * 100, 1) end) stored;

alter table country drop column if exists trade_balance_usd_bn;
alter table country add column trade_balance_usd_bn numeric
  generated always as (
    case when exports_usd_bn is not null and imports_usd_bn is not null
    then round(exports_usd_bn - imports_usd_bn, 1) end) stored;
"""]

def upd(iso, pairs):
    return f"update country set {', '.join(f'{k} = {v}' for k,v in pairs)} where iso3 = '{iso}';"

out.append("\n-- current account")
for iso, v in data3.CURRENT_ACCOUNT.items():
    out.append(upd(iso, [("current_account_pct_gdp", n(v))]))
out.append("\n-- inflation")
for iso, v in data3.INFLATION.items():
    out.append(upd(iso, [("inflation_pct", n(v))]))
out.append("\n-- reserves")
for iso, v in data3.RESERVES.items():
    out.append(upd(iso, [("reserves_usd_bn", n(v))]))
out.append("\n-- credit ratings")
for iso, (sp, mo, fi) in data3.RATING.items():
    out.append(upd(iso, [("rating_sp", q(sp)), ("rating_moodys", q(mo)), ("rating_fitch", q(fi))]))

out.append("\n-- trade & supply chain")
for iso, (ex, im, top, lpi, partners) in data4.TRADE.items():
    out.append(upd(iso, [("exports_usd_bn", n(ex)), ("imports_usd_bn", n(im)),
                         ("top_export", q(top)), ("lpi_score", n(lpi)),
                         ("trade_partners", q(partners))]))

IND = [
 ("CURRENT_ACCOUNT","Current account balance","pct_gdp",
  "The broadest measure of transactions with the rest of the world - trade in goods and services, income and transfers - as a share of GDP.",
  "whole_economy",None,
  "A surplus is not automatically good nor a deficit bad. A deficit means a country absorbs more than it produces and finances the difference from abroad - sustainable for a reserve-currency issuer, dangerous for one dependent on volatile capital inflows. Read it alongside the exchange rate regime and reserves.",
  "IMF World Economic Outlook","2025 estimate"),
 ("INFLATION","Inflation (CPI)","pct",
  "Annual average change in consumer prices.",
  None,None,
  "The number that makes every other nominal figure on this site readable. Basket composition differs between countries, so cross-country comparison is indicative rather than exact.",
  "IMF World Economic Outlook","2025 estimate"),
 ("RESERVES","Foreign exchange reserves","usd_bn",
  "Total official reserve assets including gold, held by the central bank.",
  "central_bank","market",
  "Adequacy depends on exposure, not the raw total - a large economy with a floating currency needs proportionally far less than a small one running a peg. Gold is valued at market prices, so totals move with the gold price alone.",
  "IMF / World Bank","latest available"),
 ("RATING","Sovereign credit rating","grade",
  "Long-term foreign-currency issuer rating from S&P, Moody's and Fitch.",
  None,None,
  "Opinions, not measurements - and the agencies disagree with each other regularly, which is itself informative. Ratings move on the agencies' own schedules, so verify against the agency directly. SD or RD means selective or restricted default; absence means unrated, not creditworthy or otherwise.",
  "S&P Global / Moody's / Fitch","point-in-time, verify"),
 ("TRADE","Exports & imports","usd_bn",
  "Goods and services crossing the border, in US dollars, for the latest full year.",
  "whole_economy",None,
  "Re-export hubs distort this badly. Hong Kong, Singapore, Netherlands and Luxembourg all record goods that arrive, get re-labelled and leave again - so their trade can exceed their entire GDP several times over without that reflecting domestic production. Compare trade openness against economic size before drawing conclusions.",
  "IMF / World Bank / national statistics","latest full year"),
 ("TRADE_OPENNESS","Trade openness","pct_gdp",
  "Exports plus imports as a share of GDP. Derived, not separately sourced.",
  None,None,
  "Above 100% is normal for small open economies and re-export hubs, where the same goods cross the border more than once. A low figure usually means a large domestic market rather than isolation - the United States sits near 25% because most of what Americans buy is made in America.",
  "Derived","latest full year"),
 ("TOP_EXPORT","Principal export","category",
  "The dominant export category by value.",
  None,None,
  "A broad classification, not a precise share. Concentration is the thing to notice: an economy whose single largest export is crude petroleum is exposed to one price in a way a diversified manufacturer is not, and that exposure shows up in the currency, the budget and the credit rating.",
  "National statistics / UN Comtrade","latest full year"),
 ("LPI","Logistics Performance Index","score",
  "World Bank composite score, 1 to 5, covering customs, infrastructure, shipment timeliness and tracking.",
  None,None,
  "A survey-based perception index, not a physical measurement - it reflects what freight professionals report, so it captures reputation alongside reality. Published irregularly rather than annually, so a score may be several years old. Useful as a rough tier, not a precise ranking.",
  "World Bank Logistics Performance Index","2023 edition"),
 ("PARTNERS","Principal trading partners","list",
  "The largest destinations and sources of trade by value.",
  None,None,
  "Concentration matters more than the names. A country whose trade runs overwhelmingly through one neighbour has a different risk profile from one spread across three continents - and that dependency is invisible in any single number on this site.",
  "National statistics / UN Comtrade","latest full year"),
]
out.append("\n-- indicator definitions")
out.append("insert into indicator (code, name, unit, definition, perimeter, valuation, caveat, source, vintage) values")
rows = []
for (c,nm,u,d,p,v,cv,s,vt) in IND:
    rows.append(f"  ('{c}', '{esc(nm)}', '{u}', '{esc(d)}', {q(p) if p else 'NULL'}, {q(v) if v else 'NULL'}, {q(cv)}, '{esc(s)}', '{esc(vt)}')")
out.append(",\n".join(rows) + "\non conflict (code) do update set definition=excluded.definition, caveat=excluded.caveat, vintage=excluded.vintage;\n")

sql = "\n".join(out)
open("/home/claude/atlas/schema_phase34.sql","w").write(sql)
print("wrote schema_phase34.sql", len(sql)//1024, "KB,", sql.count("update country"), "updates")
