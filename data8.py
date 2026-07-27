# -*- coding: utf-8 -*-
"""
Phase 8: bank asset history + broad money + gold reserves.

BANK_ASSET_HISTORY: real, SEC-filed annual total assets (USD billions), sourced
via company 10-Ks / macrotrends. Deliberately a SMALL, GROWING set — only banks
with individually verified multi-year figures are included. This is the same
honesty pattern as bank CEOs: partial and real beats complete and guessed.

BROAD_MONEY: M2 broad money supply, % of GDP. IMF/World Bank International
Financial Statistics. Answers "how much money exists in the economy" in the
standard macro sense.

GOLD_TONNES: central bank gold reserves in metric tonnes (distinct from the
USD reserve value already on the site — gold tonnes don't move with price).
World Gold Council, compiled at working accuracy for major holders.
"""

# bank name (exact match to data.BANKS) -> {year: total_assets_usd_bn}
BANK_ASSET_HISTORY = {
"JPMorgan Chase": {
    2015: 2351.7, 2016: 2491.0, 2017: 2533.6, 2018: 2622.5, 2019: 2687.4,
    2020: 3384.8, 2021: 3743.6, 2022: 3665.7, 2023: 3875.4, 2024: 4002.8,
},
"Goldman Sachs": {
    2015: 861.4, 2016: 860.2, 2017: 916.8, 2018: 931.8, 2019: 993.0,
    2020: 1163.0, 2021: 1464.0, 2022: 1441.8, 2023: 1641.6, 2024: 1676.0,
},
}

# ---- Broad money (M2), % of GDP, latest available ----
BROAD_MONEY = {
"USA":91.0,"CHN":215.0,"JPN":260.0,"DEU":92.0,"IND":78.0,"GBR":135.0,"FRA":98.0,
"ITA":95.0,"BRA":88.0,"CAN":110.0,"RUS":55.0,"KOR":165.0,"MEX":45.0,"ESP":115.0,
"AUS":118.0,"IDN":40.0,"TUR":58.0,"NLD":140.0,"SAU":48.0,"CHE":195.0,"POL":68.0,
"ARG":25.0,"SWE":85.0,"IRL":250.0,"SGP":145.0,"AUT":105.0,"ISR":88.0,"THA":128.0,
"NOR":75.0,"PHL":68.0,"VNM":135.0,"MYS":135.0,"BGD":58.0,"DNK":90.0,"HKG":380.0,
"ZAF":68.0,"COL":42.0,"CHL":78.0,"PER":48.0,"KAZ":32.0,"NGA":22.0,"MAR":95.0,
"BGR":85.0,"HRV":88.0,"EGY":78.0,"PAK":42.0,"VNM2":0,"UKR":38.0,"KEN":48.0,
"GHA":32.0,"ETH":35.0,"TZA":25.0,"UGA":22.0,"CIV":30.0,"SEN":38.0,"TUN":72.0,
"JOR":95.0,"LBN":210.0,"OMN":65.0,"QAT":78.0,"KWT":88.0,"BHR":72.0,"ARE":85.0,
"CZE":78.0,"HUN":58.0,"ROU":42.0,"SVK":88.0,"SVN":95.0,"LTU":68.0,"LVA":58.0,
"EST":78.0,"PRT":115.0,"GRC":78.0,"FIN":78.0,"BEL":110.0,"LUX":220.0,"NZL":98.0,
"TWN":220.0,"LKA":48.0,"NPL":95.0,"KHM":135.0,"MNG":48.0,"UZB":28.0,"AZE":22.0,
"GEO":48.0,"ARM":48.0,
}
# clean stray placeholder
BROAD_MONEY.pop("VNM2", None)

# ---- Central bank gold reserves, metric tonnes ----
GOLD_TONNES = {
"USA":8133,"DEU":3352,"ITA":2452,"FRA":2437,"RUS":2335,"CHN":2264,"CHE":1040,
"JPN":846,"IND":840,"NLD":612,"TUR":585,"TWN":424,"POL":420,"PRT":383,"UZB":362,
"KAZ":295,"GBR":310,"BEL":227,"ARE":90,"PHL":417,"VEN":161,"ECU":36,"THA":244,
"ESP":282,
"LBY":147,"ROU":103,"EGY":126,"SWE":126,"AUS":80,"KWT":79,"IDN":78,"DNK":66,
"ARG":62,"PAK":65,"ZAF":56,"NGA":22,"GRC":114,"FIN":49,"CAN":0,"BLR":52,"KOR":104,
"MYS":39,"COL":11,"PER":34,"MNG":26,"JOR":30,"QAT":103,"BGD":14,"SVK":32,"ALB":3,
}

INDICATORS_PHASE8 = {
 "BANK_HISTORY": ("Total assets over time","usd_bn",
   "Annual total assets from the bank's own financial filings.",
   "This atlas carries verified multi-year history for a small, growing set of banks only \u2014 partial and real is preferred over complete and estimated. Most banks show only the current-year figure.",
   "Company 10-K filings / SEC EDGAR","varies by bank, see chart"),
 "BROAD_MONEY": ("Broad money supply (M2)","pct_gdp",
   "Currency in circulation plus deposits \u2014 the standard measure of how much money exists in an economy.",
   "Not the same as wealth or reserves. High M2/GDP (Hong Kong, Japan, Switzerland) often reflects a large banking and financial-services sector rather than currency being printed excessively.",
   "IMF International Financial Statistics","latest available"),
 "GOLD_TONNES": ("Central bank gold reserves","tonnes",
   "Physical gold held by the central bank, in metric tonnes.",
   "Distinct from the FX reserve value elsewhere on this site \u2014 tonnage doesn't move with the gold price, so it isolates accumulation decisions from market swings.",
   "World Gold Council","latest available"),
}
