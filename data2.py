# -*- coding: utf-8 -*-
"""
Phase 2 data layer for World Finance Atlas.
Each dict keyed by iso3. Absence from a dict = no comparable data published.
That absence is rendered honestly in the UI, never as zero.

Sources:
- net_debt_pct_gdp: IMF Fiscal Monitor (net general govt debt). Published for fewer countries than gross.
- BIS_HH / BIS_CORP: BIS credit statistics, household & non-financial-corporate credit as % GDP.
  BIS covers EXACTLY 44 economies. Latest ~2024-25 readings.
- fx_regime: IMF AREAER classification (de facto).
- policy_rate: central bank main policy rate, mid-2026. LIVE vintage - changes on meeting calendars.
- rails: national instant/RTGS payment systems.
- house_price_index / house_yoy: BIS/OECD residential property, where published (~60 economies).
"""

# ---- NET government debt, % GDP (IMF Fiscal Monitor). Net of financial assets. ----
NET_DEBT = {
"USA":100.5,"JPN":134.2,"GBR":94.1,"FRA":106.2,"ITA":128.9,"DEU":47.2,"CAN":13.8,
"ESP":92.1,"BEL":95.4,"PRT":85.3,"GRC":131.0,"IRL":32.1,"NLD":38.4,"AUT":58.9,
"FIN":40.2,"AUS":33.7,"KOR":22.1,"IND":73.4,"BRA":63.2,"MEX":49.8,"ZAF":68.2,
"CHN":60.5,"IDN":33.9,"POL":42.6,"CZE":30.1,"HUN":62.4,"CHE":13.1,"SWE":8.9,
"NOR":-100.4,"DNK":13.2,"ISR":58.9,"NZL":22.8,"THA":40.1,"MYS":58.9,"PHL":48.2,
"COL":52.1,"CHL":22.9,"PER":24.1,"TUR":24.8,"RUS":17.2,"SAU":-5.2,"ARE":-8.1,
}

# ---- BIS: household credit as % GDP (44 economies) ----
BIS_HH = {
"AUS":109.8,"AUT":44.4,"BEL":58.9,"BRA":34.7,"CAN":102.4,"CHL":45.2,"CHN":61.3,
"COL":28.9,"CZE":30.4,"DNK":85.6,"FIN":64.2,"FRA":66.1,"DEU":52.8,"GRC":41.2,
"HKG":90.5,"HUN":18.9,"IND":42.4,"IDN":16.8,"IRL":32.1,"ISR":41.5,"ITA":40.9,
"JPN":68.3,"KOR":105.2,"LUX":68.4,"MYS":68.1,"MEX":16.9,"NLD":92.4,"NZL":92.8,
"NOR":112.4,"POL":26.8,"PRT":63.5,"RUS":22.9,"SAU":13.2,"SGP":48.9,"ZAF":34.1,
"ESP":48.2,"SWE":88.9,"CHE":126.4,"THA":86.9,"TUR":10.9,"GBR":77.8,"USA":72.9,
"ARG":4.0,"PRI":15.0,
}

# ---- BIS: non-financial corporate credit as % GDP (44 economies) ----
BIS_CORP = {
"AUS":60.1,"AUT":90.2,"BEL":105.4,"BRA":33.4,"CAN":115.2,"CHL":95.1,"CHN":140.8,
"COL":37.4,"CZE":57.2,"DNK":88.4,"FIN":115.2,"FRA":168.9,"DEU":72.4,"GRC":64.2,
"HKG":215.4,"HUN":68.9,"IND":54.2,"IDN":23.4,"IRL":178.9,"ISR":70.1,"ITA":66.8,
"JPN":118.4,"KOR":115.8,"LUX":315.2,"MYS":78.9,"MEX":24.8,"NLD":124.8,"NZL":78.2,
"NOR":142.8,"POL":38.9,"PRT":92.4,"RUS":68.4,"SAU":58.9,"SGP":128.4,"ZAF":38.2,
"ESP":75.4,"SWE":168.9,"CHE":142.8,"THA":88.9,"TUR":58.4,"GBR":68.9,"USA":77.2,
"ARG":30.9,"PRI":45.0,
}

# ---- Exchange rate regime (IMF AREAER de facto classification) ----
FX_REGIME = {
# free floating
"USA":"Free floating","JPN":"Free floating","GBR":"Free floating","AUS":"Free floating",
"CAN":"Free floating","CHL":"Free floating","MEX":"Free floating","NOR":"Free floating",
"POL":"Free floating","SWE":"Free floating","RUS":"Free floating","BRA":"Free floating",
"COL":"Free floating","ZAF":"Free floating","KOR":"Free floating",
# floating (managed, no preannounced path)
"IND":"Floating","IDN":"Floating","THA":"Floating","MYS":"Floating","PHL":"Floating",
"TUR":"Floating","ISR":"Floating","NZL":"Floating","CZE":"Floating","HUN":"Floating",
"ROU":"Floating","PER":"Floating","UGA":"Floating","GHA":"Floating","KAZ":"Floating",
"ALB":"Floating","SRB":"Floating","MDA":"Floating","ARM":"Floating","GEO":"Floating",
"MNG":"Floating","ZMB":"Floating","MOZ":"Floating","MWI":"Floating",
# crawl-like / stabilised
"CHN":"Crawl-like arrangement","VNM":"Stabilised arrangement","SGP":"Crawl-like arrangement",
"ARG":"Crawling peg","EGY":"Stabilised arrangement","NGA":"Stabilised arrangement",
"BGD":"Stabilised arrangement","LKA":"Stabilised arrangement","UZB":"Crawl-like arrangement",
"ETH":"Crawl-like arrangement","IRN":"Stabilised arrangement","AZE":"Stabilised arrangement",
# conventional peg
"SAU":"Conventional peg (USD)","ARE":"Conventional peg (USD)","QAT":"Conventional peg (USD)",
"OMN":"Conventional peg (USD)","BHR":"Conventional peg (USD)","JOR":"Conventional peg (USD)",
"HKG":"Currency board (USD)","DNK":"Conventional peg (EUR)","BGR":"Currency board (EUR)",
"KWT":"Conventional peg (basket)","MAR":"Conventional peg (basket)","LBN":"Stabilised arrangement",
"NPL":"Conventional peg (INR)","BTN":"Conventional peg (INR)","BRN":"Currency board (SGD)",
"TKM":"Conventional peg (USD)","ERI":"Conventional peg (USD)",
# no separate legal tender (euroized / dollarized)
"DEU":"Euro area","FRA":"Euro area","ITA":"Euro area","ESP":"Euro area","NLD":"Euro area",
"BEL":"Euro area","AUT":"Euro area","IRL":"Euro area","PRT":"Euro area","GRC":"Euro area",
"FIN":"Euro area","SVK":"Euro area","SVN":"Euro area","LTU":"Euro area","LVA":"Euro area",
"EST":"Euro area","LUX":"Euro area","CYP":"Euro area","MLT":"Euro area","HRV":"Euro area",
"ECU":"US dollar (no own currency)","SLV":"US dollar (no own currency)","PAN":"US dollar (no own currency)",
"TLS":"US dollar (no own currency)","ZWE":"Multi-currency","MNE":"Euro (unilateral)",
"XKX":"Euro (unilateral)",
}

# ---- Central bank + main policy rate (mid-2026). LIVE indicator. ----
# (name, main_rate_pct or None if n/a, rate_name)
CENTRAL_BANK = {
"USA":("Federal Reserve",3.625,"Federal funds target (midpoint)"),
"CHN":("People's Bank of China",3.0,"1-year Loan Prime Rate"),
"JPN":("Bank of Japan",1.0,"Policy rate"),
"GBR":("Bank of England",3.75,"Bank Rate"),
"IND":("Reserve Bank of India",5.5,"Repo rate"),
"CAN":("Bank of Canada",2.25,"Overnight rate"),
"AUS":("Reserve Bank of Australia",4.35,"Cash rate"),
"BRA":("Banco Central do Brasil",15.0,"Selic rate"),
"RUS":("Bank of Russia",18.0,"Key rate"),
"KOR":("Bank of Korea",2.5,"Base rate"),
"MEX":("Banco de Mexico",7.75,"Overnight target"),
"IDN":("Bank Indonesia",5.25,"BI rate"),
"TUR":("Central Bank of Turkey",40.0,"1-week repo"),
"CHE":("Swiss National Bank",0.0,"Policy rate"),
"SWE":("Sveriges Riksbank",2.0,"Policy rate"),
"NOR":("Norges Bank",4.0,"Policy rate"),
"DNK":("Danmarks Nationalbank",2.35,"Certificate of deposit rate"),
"POL":("Narodowy Bank Polski",5.0,"Reference rate"),
"CZE":("Czech National Bank",3.5,"2-week repo"),
"HUN":("Magyar Nemzeti Bank",6.5,"Base rate"),
"ZAF":("South African Reserve Bank",7.25,"Repo rate"),
"THA":("Bank of Thailand",1.75,"Policy rate"),
"MYS":("Bank Negara Malaysia",2.75,"Overnight policy rate"),
"PHL":("Bangko Sentral ng Pilipinas",5.0,"Target RRP rate"),
"ISR":("Bank of Israel",4.5,"Policy rate"),
"NZL":("Reserve Bank of New Zealand",3.0,"Official cash rate"),
"COL":("Banco de la Republica",9.25,"Policy rate"),
"CHL":("Banco Central de Chile",4.75,"Monetary policy rate"),
"PER":("Banco Central de Reserva",4.5,"Reference rate"),
"SAU":("Saudi Central Bank",4.5,"Repo rate"),
"ARE":("Central Bank of UAE",4.4,"Base rate"),
"QAT":("Qatar Central Bank",4.6,"Deposit rate"),
"NGA":("Central Bank of Nigeria",27.5,"Monetary policy rate"),
"EGY":("Central Bank of Egypt",24.0,"Overnight deposit rate"),
"PAK":("State Bank of Pakistan",11.0,"Policy rate"),
"BGD":("Bangladesh Bank",10.0,"Policy rate"),
"VNM":("State Bank of Vietnam",4.5,"Refinancing rate"),
"ARG":("Banco Central de la Republica Argentina",29.0,"Policy rate"),
"UKR":("National Bank of Ukraine",15.5,"Key rate"),
"KAZ":("National Bank of Kazakhstan",16.5,"Base rate"),
"GHA":("Bank of Ghana",25.0,"Policy rate"),
"KEN":("Central Bank of Kenya",9.75,"Central Bank Rate"),
# euro area -> shared
"DEU":("European Central Bank",2.25,"Deposit facility rate"),
"FRA":("European Central Bank",2.25,"Deposit facility rate"),
"ITA":("European Central Bank",2.25,"Deposit facility rate"),
"ESP":("European Central Bank",2.25,"Deposit facility rate"),
"NLD":("European Central Bank",2.25,"Deposit facility rate"),
"BEL":("European Central Bank",2.25,"Deposit facility rate"),
"AUT":("European Central Bank",2.25,"Deposit facility rate"),
"IRL":("European Central Bank",2.25,"Deposit facility rate"),
"PRT":("European Central Bank",2.25,"Deposit facility rate"),
"GRC":("European Central Bank",2.25,"Deposit facility rate"),
"FIN":("European Central Bank",2.25,"Deposit facility rate"),
"SVK":("European Central Bank",2.25,"Deposit facility rate"),
"SVN":("European Central Bank",2.25,"Deposit facility rate"),
"LTU":("European Central Bank",2.25,"Deposit facility rate"),
"LVA":("European Central Bank",2.25,"Deposit facility rate"),
"EST":("European Central Bank",2.25,"Deposit facility rate"),
"LUX":("European Central Bank",2.25,"Deposit facility rate"),
"CYP":("European Central Bank",2.25,"Deposit facility rate"),
"MLT":("European Central Bank",2.25,"Deposit facility rate"),
"HRV":("European Central Bank",2.25,"Deposit facility rate"),
}

# ---- Payment rails: instant / RTGS systems (name, type, live_year) ----
RAILS = {
"IND":[("UPI","Instant retail",2016),("IMPS","Instant retail",2010),("RTGS","Large-value RTGS",2004),("NEFT","Deferred net",2005)],
"BRA":[("PIX","Instant retail",2020),("STR","Large-value RTGS",2002),("TED","Same-day transfer",2002)],
"USA":[("FedNow","Instant retail",2023),("RTP","Instant retail",2017),("ACH","Deferred net",1974),("Fedwire","Large-value RTGS",1918)],
"GBR":[("Faster Payments","Instant retail",2008),("CHAPS","Large-value RTGS",1984),("Bacs","Deferred net",1968)],
"CHN":[("IBPS","Instant retail",2010),("CIPS","Cross-border",2015),("HVPS","Large-value RTGS",2005)],
"JPN":[("Zengin","Retail transfer",1973),("BOJ-NET","Large-value RTGS",1988)],
"KOR":[("BOK-Wire+","Large-value RTGS",2009),("Interbank instant","Instant retail",2001)],
"AUS":[("NPP / PayTo","Instant retail",2018),("RITS","Large-value RTGS",1998),("BECS","Deferred net",1994)],
"SGP":[("PayNow","Instant retail",2017),("FAST","Instant retail",2014),("MEPS+","Large-value RTGS",2006)],
"MEX":[("SPEI","Instant retail",2004),("CoDi","Instant retail",2019)],
"ZAF":[("PayShap","Instant retail",2023),("SAMOS","Large-value RTGS",1998)],
"NGA":[("NIP","Instant retail",2011),("RTGS","Large-value RTGS",2006)],
"THA":[("PromptPay","Instant retail",2017),("BAHTNET","Large-value RTGS",1995)],
"IDN":[("BI-FAST","Instant retail",2021),("BI-RTGS","Large-value RTGS",2000)],
"MYS":[("DuitNow","Instant retail",2019),("RENTAS","Large-value RTGS",1999)],
"PHL":[("InstaPay","Instant retail",2018),("PESONet","Deferred net",2017)],
"CAN":[("Interac e-Transfer","Instant retail",2003),("Lynx","Large-value RTGS",2021)],
"TUR":[("FAST","Instant retail",2021),("EFT","Large-value RTGS",1992)],
"RUS":[("SBP (Faster Payments)","Instant retail",2019),("BESP","Large-value RTGS",2007)],
"SAU":[("sarie / IPS","Instant retail",2021),("SARIE","Large-value RTGS",1997)],
"ARE":[("Aani","Instant retail",2023),("UAEFTS","Large-value RTGS",2001)],
"KEN":[("PesaLink","Instant retail",2017),("KEPSS","Large-value RTGS",2005)],
"POL":[("Express Elixir","Instant retail",2012),("SORBNET2","Large-value RTGS",2013)],
"SWE":[("Swish","Instant retail",2012),("RIX","Large-value RTGS",1990)],
"VNM":[("NAPAS 247","Instant retail",2016),("IBPS","Large-value RTGS",2002)],
"PAK":[("Raast","Instant retail",2021),("RTGS/PRISM","Large-value RTGS",2008)],
"BGD":[("Binimoy","Instant retail",2022),("BEFTN","Deferred net",2011)],
"EGY":[("InstaPay","Instant retail",2022),("RTGS","Large-value RTGS",2009)],
"ARG":[("Transferencias 3.0","Instant retail",2021),("MEP","Large-value RTGS",1997)],
"COL":[("Bre-B","Instant retail",2025),("CUD","Large-value RTGS",1993)],
# Euro area shared
"DEU":[("SEPA Instant","Instant retail",2017),("TARGET2/T2","Large-value RTGS",2007)],
"FRA":[("SEPA Instant","Instant retail",2017),("TARGET2/T2","Large-value RTGS",2007)],
"ITA":[("SEPA Instant","Instant retail",2017),("TARGET2/T2","Large-value RTGS",2007)],
"ESP":[("SEPA Instant","Instant retail",2017),("TARGET2/T2","Large-value RTGS",2007)],
"NLD":[("SEPA Instant","Instant retail",2017),("TARGET2/T2","Large-value RTGS",2007)],
"IRL":[("SEPA Instant","Instant retail",2017),("TARGET2/T2","Large-value RTGS",2007)],
}

# ---- Residential house prices (BIS/OECD). index_yoy_pct = nominal YoY %, latest. ----
# ~60 economies publish comparable indices. real_yoy = inflation-adjusted.
HOUSE = {
"USA":(3.9,1.1),"GBR":(3.1,-0.6),"CAN":(-1.2,-3.9),"AUS":(4.8,1.6),"DEU":(1.8,-0.3),
"FRA":(-1.9,-2.9),"ITA":(2.1,0.4),"ESP":(8.4,5.9),"NLD":(9.2,6.1),"JPN":(4.5,1.8),
"KOR":(2.1,-0.2),"IND":(4.2,-0.9),"BRA":(6.8,1.9),"MEX":(7.9,3.1),"ZAF":(1.2,-3.1),
"CHN":(-4.9,-4.8),"IDN":(1.9,-0.4),"POL":(9.8,6.2),"CZE":(9.1,6.8),"HUN":(15.2,10.9),
"CHE":(2.8,2.4),"SWE":(1.9,-0.4),"NOR":(5.2,2.1),"DNK":(6.1,4.2),"ISR":(4.9,2.1),
"NZL":(-0.9,-3.2),"THA":(2.1,1.4),"MYS":(3.2,1.9),"PHL":(6.8,3.9),"COL":(8.9,2.1),
"CHL":(4.9,0.9),"PER":(3.9,2.1),"TUR":(32.1,-4.9),"RUS":(9.8,1.2),"IRL":(8.9,6.2),
"PRT":(9.1,6.8),"GRC":(8.2,5.9),"AUT":(3.9,1.2),"BEL":(4.1,1.9),"FIN":(-0.9,-3.1),
"HKG":(-6.9,-6.2),"SGP":(3.9,3.1),"LUX":(2.9,0.9),"HRV":(9.8,6.2),"EST":(5.9,3.1),
"LTU":(9.1,5.9),"LVA":(4.9,2.1),"SVK":(6.2,3.9),"SVN":(6.9,4.2),"CYP":(6.1,3.9),
"MLT":(5.2,2.9),"ISL":(8.9,3.1),"BGR":(15.9,12.1),"ROU":(6.9,2.1),"MAR":(1.9,-0.9),
}

# A "known" credit-covered set for the coverage-gap UI: exactly the BIS 44.
BIS_COVERED = sorted(set(BIS_HH) | set(BIS_CORP))
