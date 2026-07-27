# -*- coding: utf-8 -*-
"""
Phase 5: 10-year government bond yields.
Point-in-time market snapshot, mid-2026. Like policy rates and ratings, this is
LIVE market data - it moves every second markets are open. Labelled "verify".
Source blend: TradingView / Tradeweb / national benchmarks, ~mid-2026.

Yield is the interesting figure: what it costs a government to borrow for 10 years,
the market's own verdict on its credit - sitting naturally beside policy rate,
debt, and the agency ratings (which are opinions; the yield is money).
"""

BOND_YIELD_10Y = {
"USA":4.40,"CHN":1.65,"JPN":1.50,"DEU":2.63,"IND":6.31,"GBR":4.62,"FRA":3.36,
"ITA":3.56,"ESP":3.29,"CAN":3.44,"AUS":4.35,"KOR":3.05,"BRA":13.80,"MEX":9.45,
"RUS":15.20,"IDN":6.61,"TUR":29.80,"NLD":2.85,"CHE":0.45,"SWE":2.35,"NOR":3.85,
"POL":5.55,"BEL":3.10,"AUT":3.05,"PRT":3.15,"GRC":3.45,"IRL":2.95,"FIN":2.95,
"DNK":2.75,"SGP":2.12,"HKG":3.04,"MYS":3.44,"THA":2.35,"PHL":6.20,"ZAF":10.45,
"COL":11.20,"CHL":5.85,"PER":6.45,"ISR":4.55,"NZL":4.55,"CZE":4.05,"HUN":6.85,
"ROU":7.45,"BGR":3.95,"HRV":3.25,"SVN":3.15,"SVK":3.55,"LTU":3.35,"LVA":3.45,
"ARG":None,"NGA":18.50,"EGY":24.50,"KEN":13.80,"PAK":11.90,"BGD":11.50,"VNM":3.10,
"ISL":6.85,
}
