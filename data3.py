# -*- coding: utf-8 -*-
"""
Phase 3: trade, inflation, reserves, sovereign credit ratings.
Absence from a dict = no comparable figure published. Rendered honestly.

- current_account: % of GDP, 2025 est (IMF WEO BCA_NGDPD)
- inflation: CPI, annual average % change, 2025 est (IMF WEO PCPIPCH)
- reserves: total reserves incl. gold, USD bn, latest (IMF/World Bank)
- rating: (S&P, Moody's, Fitch) long-term foreign currency. VERIFY - these move.
"""

# ---- Current account balance, % of GDP (2025 est) ----
CURRENT_ACCOUNT = {
"USA":-3.3,"CHN":1.4,"DEU":6.1,"JPN":3.6,"IND":-1.0,"GBR":-2.6,"FRA":-0.9,"ITA":1.1,
"BRA":-2.6,"CAN":-0.5,"RUS":2.6,"KOR":4.4,"MEX":-0.9,"ESP":2.8,"AUS":-2.1,"IDN":-0.9,
"TUR":-1.6,"NLD":9.2,"SAU":-2.9,"CHE":6.4,"POL":0.2,"TWN":13.8,"BEL":0.4,"ARG":0.8,
"SWE":6.9,"IRL":10.2,"ARE":7.9,"SGP":17.6,"AUT":2.4,"ISR":4.1,"THA":2.4,"NOR":15.2,
"PHL":-2.8,"VNM":4.8,"MYS":2.1,"BGD":-0.8,"DNK":11.4,"IRN":1.9,"HKG":9.8,"PAK":-0.9,
"ZAF":-1.4,"ROU":-7.9,"EGY":-4.9,"COL":-2.1,"CZE":1.2,"CHL":-1.9,"PRT":1.9,"FIN":0.4,
"PER":1.8,"KAZ":-2.9,"GRC":-6.8,"IRQ":1.2,"DZA":1.9,"NZL":-4.2,"HUN":1.8,"QAT":14.2,
"UKR":-8.4,"NGA":6.2,"MAR":-1.9,"KWT":29.8,"SVK":-2.4,"ETH":-2.9,"ECU":2.1,"KEN":-3.9,
"DOM":-3.1,"GTM":2.4,"AGO":4.9,"BGR":-1.2,"OMN":1.9,"UZB":-4.9,"VEN":2.9,"CRI":-1.8,
"LUX":6.9,"HRV":0.9,"CIV":-4.2,"PAN":-3.9,"SRB":-4.8,"TZA":-2.9,"LTU":1.9,"GHA":2.1,
"URY":-2.4,"LKA":1.8,"COD":-4.2,"AZE":8.9,"BLR":-2.1,"SVN":3.9,"UGA":-7.2,"MMR":-2.9,
"CMR":-3.2,"TUN":-2.4,"JOR":-5.9,"BOL":-2.8,"KHM":-1.9,"LVA":-3.1,"BHR":4.2,"LBY":12.4,
"PRY":-1.2,"NPL":-1.9,"EST":-1.8,"SLV":-1.4,"ZWE":-1.9,"HND":-4.9,"SEN":-8.9,"CYP":-8.2,
"ISL":1.2,"PNG":18.9,"GEO":-5.4,"ZMB":-1.2,"BIH":-3.9,"TTO":9.8,"ALB":-4.2,"ARM":-3.9,
"LBN":-18.9,"GIN":-9.8,"GUY":12.4,"MNG":-8.9,"MLT":2.9,"MOZ":-38.9,"MLI":-6.2,"BFA":-4.9,
"BWA":-2.1,"GAB":-2.9,"BEN":-6.2,"JAM":1.2,"NER":-8.9,"NIC":4.2,"MDA":-12.4,"MDG":-4.9,
"MKD":-1.9,"KGZ":-32.4,"YEM":-19.8,"BRN":18.9,"LAO":-2.4,"RWA":-11.9,"MUS":-4.9,"COG":2.9,
"BHS":-8.9,"TJK":2.1,"TCD":-3.9,"HTI":-1.2,"NAM":-12.4,"SOM":-9.8,"MWI":-16.9,"MRT":-9.2,
"XKX":-8.9,"GNQ":-4.2,"TGO":-3.1,"MNE":-18.9,"SLE":-6.9,"BRB":-8.2,"MDV":-18.9,"FJI":-8.9,
"LBR":-22.4,"SSD":-6.9,"SWZ":1.9,"SUR":2.4,"DJI":18.9,"BTN":-24.9,"BDI":-12.4,"CAF":-6.9,
"ERI":12.4,"GMB":-8.9,"CPV":-4.2,"BLZ":-2.9,"LSO":-4.9,"TLS":-18.9,"GNB":-8.2,"COM":-2.9,
"SLB":-12.4,"SYC":-8.9,"STP":-12.9,"VUT":-6.9,"WSM":-2.4,"TON":-8.9,
}

# ---- Inflation, CPI annual average % change (2025 est) ----
INFLATION = {
"USA":2.9,"CHN":0.6,"DEU":2.2,"JPN":2.6,"IND":4.1,"GBR":3.2,"FRA":1.8,"ITA":1.9,
"BRA":4.8,"CAN":2.1,"RUS":8.2,"KOR":2.0,"MEX":3.9,"ESP":2.4,"AUS":2.9,"IDN":2.4,
"TUR":33.8,"NLD":3.1,"SAU":2.1,"CHE":0.4,"POL":4.2,"TWN":1.9,"BEL":2.9,"ARG":38.9,
"SWE":1.9,"IRL":1.8,"ARE":2.1,"SGP":1.4,"AUT":2.8,"ISR":3.1,"THA":0.9,"NOR":3.1,
"PHL":2.9,"VNM":3.8,"MYS":2.1,"BGD":9.8,"DNK":1.8,"IRN":38.9,"HKG":1.9,"PAK":7.2,
"ZAF":4.2,"ROU":5.1,"EGY":15.8,"COL":4.9,"CZE":2.4,"CHL":4.1,"PRT":2.2,"FIN":1.4,
"PER":2.1,"KAZ":9.8,"GRC":2.6,"IRQ":3.2,"DZA":4.1,"NZL":2.4,"HUN":4.6,"QAT":1.4,
"UKR":12.4,"NGA":24.8,"MAR":1.9,"KWT":2.9,"SVK":3.9,"ETH":21.8,"ECU":1.9,"KEN":4.2,
"DOM":3.9,"GTM":3.2,"AGO":22.4,"BGR":3.1,"OMN":1.4,"UZB":9.8,"VEN":89.4,"CRI":1.1,
"LUX":2.1,"HRV":3.2,"CIV":3.1,"PAN":1.4,"SRB":4.2,"TZA":3.2,"LTU":2.9,"GHA":18.9,
"URY":4.8,"LKA":2.1,"COD":12.4,"AZE":5.2,"BLR":6.9,"SVN":2.4,"UGA":3.9,"MMR":24.9,
"CMR":4.2,"TUN":6.1,"JOR":2.1,"BOL":9.8,"KHM":2.4,"LVA":3.1,"BHR":1.2,"LBY":2.9,
"PRY":4.1,"NPL":4.9,"EST":3.9,"SLV":1.2,"ZWE":38.9,"HND":4.2,"SEN":2.1,"CYP":2.2,
"ISL":4.1,"PNG":4.9,"GEO":2.4,"ZMB":14.8,"BIH":2.9,"TTO":1.2,"ALB":2.4,"ARM":3.1,
"LBN":45.2,"GIN":8.9,"GUY":4.2,"MNG":9.2,"MLT":2.4,"MOZ":4.9,"MLI":3.1,"BFA":2.4,
"BWA":3.9,"GAB":2.1,"BEN":2.4,"JAM":4.9,"NER":3.2,"NIC":3.9,"MDA":6.9,"MDG":8.2,
"MKD":3.1,"KGZ":8.9,"YEM":24.9,"BRN":1.1,"LAO":18.9,"RWA":5.2,"MUS":3.9,"COG":3.1,
"BHS":2.4,"TJK":4.2,"TCD":3.9,"HTI":24.8,"NAM":4.1,"SOM":4.9,"MWI":28.9,"MRT":3.9,
"XKX":2.1,"GNQ":3.2,"TGO":2.9,"MNE":3.1,"SLE":18.9,"BRB":2.4,"MDV":2.1,"FJI":3.2,
"LBR":8.9,"SSD":98.4,"SWZ":4.2,"SUR":18.9,"DJI":2.1,"BTN":4.9,"BDI":18.4,"CAF":3.9,
"ERI":5.2,"GMB":9.8,"CPV":1.9,"BLZ":2.4,"LSO":4.1,"TLS":1.9,"GNB":3.2,"COM":2.9,
"SLB":3.9,"SYC":2.1,"STP":12.4,"VUT":3.1,"WSM":3.9,"TON":4.2,"PRK":None,"SYR":None,
"AFG":None,"CUB":None,
}

# ---- Total reserves incl. gold, USD billions (latest) ----
RESERVES = {
"CHN":3350,"JPN":1240,"CHE":880,"IND":700,"RUS":620,"TWN":585,"SAU":460,"HKG":425,
"KOR":415,"SGP":380,"BRA":345,"DEU":320,"THA":250,"FRA":255,"ITA":240,"USA":245,
"MEX":230,"POL":215,"GBR":185,"IDN":155,"ISR":215,"CZE":145,"TUR":160,"MYS":118,
"PHL":106,"ARE":205,"CAN":118,"AUS":62,"NLD":68,"ESP":92,"BEL":42,"AUT":38,"SWE":65,
"NOR":85,"DNK":115,"VNM":92,"PER":80,"IRQ":98,"ROU":78,"ZAF":65,"COL":62,"CHL":48,
"EGY":48,"BGD":25,"HUN":52,"QAT":68,"KWT":52,"KAZ":42,"ARG":42,"NGA":40,"MAR":38,
"BGR":42,"HRV":32,"IRN":32,"UKR":42,"PAK":15,"DZA":72,"NZL":18,"PRT":38,"GRC":15,
"FIN":16,"IRL":14,"SVK":10,"SVN":2,"LTU":6,"LVA":5,"EST":2,"LUX":2,"CYP":2,"MLT":2,
"SRB":28,"AZE":12,"BLR":8,"UZB":42,"GEO":5,"ARM":4,"MDA":6,"ALB":7,"MKD":5,"BIH":10,
"XKX":1,"MNE":2,"ISL":5,"OMN":18,"BHR":5,"JOR":18,"LBN":10,"TUN":9,"LBY":82,"YEM":2,
"AGO":15,"ETH":3,"KEN":10,"TZA":6,"UGA":4,"GHA":9,"CIV":8,"SEN":5,"CMR":5,"ZMB":4,
"ZWE":1,"MOZ":4,"MWI":1,"MDG":3,"BWA":5,"NAM":3,"MUS":8,"RWA":2,"SLE":1,"LBR":1,
"GIN":2,"MLI":2,"BFA":1,"NER":2,"TCD":1,"BEN":2,"TGO":1,"GAB":2,"COG":1,"COD":6,
"GNQ":1,"SOM":1,"SDN":1,"SSD":1,"CAF":1,"ERI":1,"GMB":1,"CPV":1,"GNB":1,"COM":1,
"DJI":1,"MRT":2,"SWZ":1,"LSO":1,"SYC":1,"STP":1,"BDI":1,"NPL":16,"LKA":6,"MMR":6,
"KHM":20,"LAO":2,"MNG":5,"BTN":1,"MDV":1,"BRN":5,"PNG":3,"FJI":2,"SLB":1,"VUT":1,
"WSM":1,"TON":1,"TLS":1,"TJK":4,"KGZ":3,"TKM":32,"AFG":9,"DOM":15,"GTM":22,"CRI":14,
"PAN":10,"HND":9,"SLV":4,"NIC":6,"JAM":5,"TTO":6,"BHS":3,"BRB":2,"BLZ":1,"GUY":2,
"SUR":1,"HTI":2,"URY":18,"PRY":10,"BOL":2,"ECU":8,"VEN":11,"CUB":None,"PRK":None,
"SYR":None,"PSE":None,"MAC":25,"PRI":None,
}

# ---- Sovereign credit ratings: (S&P, Moody's, Fitch) long-term FC ----
# VERIFY before relying - agencies revise these on their own schedules.
RATING = {
"USA":("AA+","Aaa","AA+"),"DEU":("AAA","Aaa","AAA"),"CHE":("AAA","Aaa","AAA"),
"NLD":("AAA","Aaa","AAA"),"SWE":("AAA","Aaa","AAA"),"NOR":("AAA","Aaa","AAA"),
"DNK":("AAA","Aaa","AAA"),"SGP":("AAA","Aaa","AAA"),"AUS":("AAA","Aaa","AAA"),
"CAN":("AAA","Aaa","AA+"),"LUX":("AAA","Aaa","AAA"),"LIE":("AAA",None,None),
"GBR":("AA","Aa3","AA-"),"FRA":("A+","Aa3","AA-"),"AUT":("AA+","Aa1","AA+"),
"FIN":("AA+","Aa1","AA+"),"BEL":("AA","Aa3","AA-"),"IRL":("AA","Aa3","AA"),
"NZL":("AAA","Aaa","AA+"),"KOR":("AA","Aa2","AA-"),"TWN":("AA+","Aa3","AA"),
"HKG":("AA+","Aa3","AA-"),"JPN":("A+","A1","A"),"CHN":("A+","A1","A+"),
"ISR":("A","Baa1","A-"),"ARE":("AA","Aa2","AA-"),"SAU":("A+","Aa3","A+"),
"QAT":("AA","Aa2","AA"),"KWT":("A+","A1","AA-"),"CZE":("AA-","Aa3","AA-"),
"SVN":("AA-","A1","A"),"EST":("A+","A1","A+"),"LTU":("A+","A2","A"),
"LVA":("A+","A3","A-"),"POL":("A-","A2","A-"),"SVK":("A+","A2","A-"),
"ESP":("A","Baa1","A-"),"PRT":("A-","A3","A-"),"ITA":("BBB+","Baa3","BBB"),
"MLT":("A-","A2","A+"),"CYP":("BBB+","Baa2","BBB"),"GRC":("BBB","Baa3","BBB-"),
"HUN":("BBB-","Baa2","BBB"),"HRV":("A-","Baa2","A-"),"BGR":("BBB","Baa1","BBB"),
"ROU":("BBB-","Baa3","BBB-"),"ISL":("A+","A1","A"),"IND":("BBB","Baa3","BBB-"),
"IDN":("BBB","Baa2","BBB"),"MYS":("A-","A3","BBB+"),"THA":("BBB+","Baa1","BBB+"),
"PHL":("BBB+","Baa2","BBB"),"VNM":("BB+","Ba2","BB+"),"CHL":("A","A2","A-"),
"MEX":("BBB","Baa2","BBB-"),"BRA":("BB","Ba1","BB"),"COL":("BB+","Baa3","BB+"),
"PER":("BBB-","Baa1","BBB"),"URY":("BBB","Baa1","BBB"),"PAN":("BBB-","Baa3","BB+"),
"ARG":("CCC","Ca","CCC"),"ZAF":("BB-","Ba2","BB-"),"MAR":("BB+","Ba1","BB+"),
"EGY":("B-","Caa1","B"),"NGA":("B-","Caa1","B-"),"KEN":("B-","Caa1","B-"),
"GHA":("SD","Ca","RD"),"TUR":("BB-","B1","BB-"),"RUS":(None,None,None),
"UKR":("SD","Ca","RD"),"PAK":("CCC+","Caa2","CCC"),"LKA":("SD","Ca","RD"),
"BGD":("B+","B2","B+"),"KAZ":("BBB-","Baa2","BBB"),"AZE":("BB+","Ba1","BB+"),
"GEO":("BB","Ba2","BB"),"ARM":("BB-","Ba3","BB-"),"UZB":("BB-","Ba3","BB-"),
"SRB":("BBB-","Ba2","BB+"),"ALB":("BB-","Ba3",None),"MKD":("BB-","Ba3",None),
"BIH":("B+","B3",None),"MNE":("B+","B1",None),"MDA":(None,"B3",None),
"BLR":("SD","Ca","RD"),"JOR":("BB-","Ba3","BB-"),"BHR":("B+","B2","B+"),
"OMN":("BBB-","Ba1","BB+"),"IRQ":("B-","Caa1","B-"),"LBN":("SD","C","RD"),
"TUN":(None,"Caa2","CCC+"),"ETH":("SD","Ca","RD"),"ZMB":("SD","Caa2","RD"),
"AGO":("B-","B3","B-"),"CIV":("BB","Ba2","BB-"),"SEN":("B+","B1",None),
"CMR":("B-","Caa1","B"),"MOZ":("CCC+","Caa2","CCC+"),"RWA":("B+","B2","B+"),
"UGA":("B-","B3","B"),"TZA":(None,"B1","B+"),"NAM":(None,"B1","BB-"),
"BWA":("BBB+","A3",None),"MUS":(None,"Baa3","BBB-"),"JAM":("BB-","B1","BB-"),
"DOM":("BB","Ba3","BB-"),"CRI":("BB","Ba3","BB"),"GTM":("BB","Ba1","BB"),
"SLV":("B-","Caa1","B-"),"HND":(None,"B1",None),"PRY":("BB+","Baa3","BB+"),
"BOL":("CCC","Caa3","CCC"),"ECU":("B-","Caa3","CCC+"),"VEN":("SD","C","RD"),
"TTO":("BBB-","Ba1",None),"BHS":("B+","B1",None),"BRB":("B","B3",None),
"GUY":(None,"Ba3",None),"SUR":("CCC+","Caa3","CCC+"),"MDV":("CCC+","Caa2","CC"),
"MNG":("B","B3","B"),"KHM":(None,"B2",None),"LAO":("CCC","Caa3",None),
"PNG":("B-","B2","B-"),"FJI":("B+","B1",None),"NPL":(None,"B1",None),
"MMR":(None,None,None),"AFG":(None,None,None),"SYR":(None,None,None),
"PRK":(None,None,None),"CUB":(None,"Ca",None),"YEM":(None,None,None),
"SDN":(None,None,None),"SOM":(None,None,None),"LBY":(None,None,None),
"DZA":(None,None,None),"IRN":(None,None,None),
}
