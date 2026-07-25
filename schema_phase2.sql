-- =====================================================================
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


-- ---- net debt ----
update country set net_debt_pct_gdp = 100.5 where iso3 = 'USA';
update country set net_debt_pct_gdp = 134.2 where iso3 = 'JPN';
update country set net_debt_pct_gdp = 94.1 where iso3 = 'GBR';
update country set net_debt_pct_gdp = 106.2 where iso3 = 'FRA';
update country set net_debt_pct_gdp = 128.9 where iso3 = 'ITA';
update country set net_debt_pct_gdp = 47.2 where iso3 = 'DEU';
update country set net_debt_pct_gdp = 13.8 where iso3 = 'CAN';
update country set net_debt_pct_gdp = 92.1 where iso3 = 'ESP';
update country set net_debt_pct_gdp = 95.4 where iso3 = 'BEL';
update country set net_debt_pct_gdp = 85.3 where iso3 = 'PRT';
update country set net_debt_pct_gdp = 131.0 where iso3 = 'GRC';
update country set net_debt_pct_gdp = 32.1 where iso3 = 'IRL';
update country set net_debt_pct_gdp = 38.4 where iso3 = 'NLD';
update country set net_debt_pct_gdp = 58.9 where iso3 = 'AUT';
update country set net_debt_pct_gdp = 40.2 where iso3 = 'FIN';
update country set net_debt_pct_gdp = 33.7 where iso3 = 'AUS';
update country set net_debt_pct_gdp = 22.1 where iso3 = 'KOR';
update country set net_debt_pct_gdp = 73.4 where iso3 = 'IND';
update country set net_debt_pct_gdp = 63.2 where iso3 = 'BRA';
update country set net_debt_pct_gdp = 49.8 where iso3 = 'MEX';
update country set net_debt_pct_gdp = 68.2 where iso3 = 'ZAF';
update country set net_debt_pct_gdp = 60.5 where iso3 = 'CHN';
update country set net_debt_pct_gdp = 33.9 where iso3 = 'IDN';
update country set net_debt_pct_gdp = 42.6 where iso3 = 'POL';
update country set net_debt_pct_gdp = 30.1 where iso3 = 'CZE';
update country set net_debt_pct_gdp = 62.4 where iso3 = 'HUN';
update country set net_debt_pct_gdp = 13.1 where iso3 = 'CHE';
update country set net_debt_pct_gdp = 8.9 where iso3 = 'SWE';
update country set net_debt_pct_gdp = -100.4 where iso3 = 'NOR';
update country set net_debt_pct_gdp = 13.2 where iso3 = 'DNK';
update country set net_debt_pct_gdp = 58.9 where iso3 = 'ISR';
update country set net_debt_pct_gdp = 22.8 where iso3 = 'NZL';
update country set net_debt_pct_gdp = 40.1 where iso3 = 'THA';
update country set net_debt_pct_gdp = 58.9 where iso3 = 'MYS';
update country set net_debt_pct_gdp = 48.2 where iso3 = 'PHL';
update country set net_debt_pct_gdp = 52.1 where iso3 = 'COL';
update country set net_debt_pct_gdp = 22.9 where iso3 = 'CHL';
update country set net_debt_pct_gdp = 24.1 where iso3 = 'PER';
update country set net_debt_pct_gdp = 24.8 where iso3 = 'TUR';
update country set net_debt_pct_gdp = 17.2 where iso3 = 'RUS';
update country set net_debt_pct_gdp = -5.2 where iso3 = 'SAU';
update country set net_debt_pct_gdp = -8.1 where iso3 = 'ARE';

-- ---- BIS household & corporate credit (44 economies) ----
update country set bis_covered = true, hh_debt_pct_gdp = 4.0, corp_debt_pct_gdp = 30.9 where iso3 = 'ARG';
update country set bis_covered = true, hh_debt_pct_gdp = 109.8, corp_debt_pct_gdp = 60.1 where iso3 = 'AUS';
update country set bis_covered = true, hh_debt_pct_gdp = 44.4, corp_debt_pct_gdp = 90.2 where iso3 = 'AUT';
update country set bis_covered = true, hh_debt_pct_gdp = 58.9, corp_debt_pct_gdp = 105.4 where iso3 = 'BEL';
update country set bis_covered = true, hh_debt_pct_gdp = 34.7, corp_debt_pct_gdp = 33.4 where iso3 = 'BRA';
update country set bis_covered = true, hh_debt_pct_gdp = 102.4, corp_debt_pct_gdp = 115.2 where iso3 = 'CAN';
update country set bis_covered = true, hh_debt_pct_gdp = 126.4, corp_debt_pct_gdp = 142.8 where iso3 = 'CHE';
update country set bis_covered = true, hh_debt_pct_gdp = 45.2, corp_debt_pct_gdp = 95.1 where iso3 = 'CHL';
update country set bis_covered = true, hh_debt_pct_gdp = 61.3, corp_debt_pct_gdp = 140.8 where iso3 = 'CHN';
update country set bis_covered = true, hh_debt_pct_gdp = 28.9, corp_debt_pct_gdp = 37.4 where iso3 = 'COL';
update country set bis_covered = true, hh_debt_pct_gdp = 30.4, corp_debt_pct_gdp = 57.2 where iso3 = 'CZE';
update country set bis_covered = true, hh_debt_pct_gdp = 52.8, corp_debt_pct_gdp = 72.4 where iso3 = 'DEU';
update country set bis_covered = true, hh_debt_pct_gdp = 85.6, corp_debt_pct_gdp = 88.4 where iso3 = 'DNK';
update country set bis_covered = true, hh_debt_pct_gdp = 48.2, corp_debt_pct_gdp = 75.4 where iso3 = 'ESP';
update country set bis_covered = true, hh_debt_pct_gdp = 64.2, corp_debt_pct_gdp = 115.2 where iso3 = 'FIN';
update country set bis_covered = true, hh_debt_pct_gdp = 66.1, corp_debt_pct_gdp = 168.9 where iso3 = 'FRA';
update country set bis_covered = true, hh_debt_pct_gdp = 77.8, corp_debt_pct_gdp = 68.9 where iso3 = 'GBR';
update country set bis_covered = true, hh_debt_pct_gdp = 41.2, corp_debt_pct_gdp = 64.2 where iso3 = 'GRC';
update country set bis_covered = true, hh_debt_pct_gdp = 90.5, corp_debt_pct_gdp = 215.4 where iso3 = 'HKG';
update country set bis_covered = true, hh_debt_pct_gdp = 18.9, corp_debt_pct_gdp = 68.9 where iso3 = 'HUN';
update country set bis_covered = true, hh_debt_pct_gdp = 16.8, corp_debt_pct_gdp = 23.4 where iso3 = 'IDN';
update country set bis_covered = true, hh_debt_pct_gdp = 42.4, corp_debt_pct_gdp = 54.2 where iso3 = 'IND';
update country set bis_covered = true, hh_debt_pct_gdp = 32.1, corp_debt_pct_gdp = 178.9 where iso3 = 'IRL';
update country set bis_covered = true, hh_debt_pct_gdp = 41.5, corp_debt_pct_gdp = 70.1 where iso3 = 'ISR';
update country set bis_covered = true, hh_debt_pct_gdp = 40.9, corp_debt_pct_gdp = 66.8 where iso3 = 'ITA';
update country set bis_covered = true, hh_debt_pct_gdp = 68.3, corp_debt_pct_gdp = 118.4 where iso3 = 'JPN';
update country set bis_covered = true, hh_debt_pct_gdp = 105.2, corp_debt_pct_gdp = 115.8 where iso3 = 'KOR';
update country set bis_covered = true, hh_debt_pct_gdp = 68.4, corp_debt_pct_gdp = 315.2 where iso3 = 'LUX';
update country set bis_covered = true, hh_debt_pct_gdp = 16.9, corp_debt_pct_gdp = 24.8 where iso3 = 'MEX';
update country set bis_covered = true, hh_debt_pct_gdp = 68.1, corp_debt_pct_gdp = 78.9 where iso3 = 'MYS';
update country set bis_covered = true, hh_debt_pct_gdp = 92.4, corp_debt_pct_gdp = 124.8 where iso3 = 'NLD';
update country set bis_covered = true, hh_debt_pct_gdp = 112.4, corp_debt_pct_gdp = 142.8 where iso3 = 'NOR';
update country set bis_covered = true, hh_debt_pct_gdp = 92.8, corp_debt_pct_gdp = 78.2 where iso3 = 'NZL';
update country set bis_covered = true, hh_debt_pct_gdp = 26.8, corp_debt_pct_gdp = 38.9 where iso3 = 'POL';
update country set bis_covered = true, hh_debt_pct_gdp = 15.0, corp_debt_pct_gdp = 45.0 where iso3 = 'PRI';
update country set bis_covered = true, hh_debt_pct_gdp = 63.5, corp_debt_pct_gdp = 92.4 where iso3 = 'PRT';
update country set bis_covered = true, hh_debt_pct_gdp = 22.9, corp_debt_pct_gdp = 68.4 where iso3 = 'RUS';
update country set bis_covered = true, hh_debt_pct_gdp = 13.2, corp_debt_pct_gdp = 58.9 where iso3 = 'SAU';
update country set bis_covered = true, hh_debt_pct_gdp = 48.9, corp_debt_pct_gdp = 128.4 where iso3 = 'SGP';
update country set bis_covered = true, hh_debt_pct_gdp = 88.9, corp_debt_pct_gdp = 168.9 where iso3 = 'SWE';
update country set bis_covered = true, hh_debt_pct_gdp = 86.9, corp_debt_pct_gdp = 88.9 where iso3 = 'THA';
update country set bis_covered = true, hh_debt_pct_gdp = 10.9, corp_debt_pct_gdp = 58.4 where iso3 = 'TUR';
update country set bis_covered = true, hh_debt_pct_gdp = 72.9, corp_debt_pct_gdp = 77.2 where iso3 = 'USA';
update country set bis_covered = true, hh_debt_pct_gdp = 34.1, corp_debt_pct_gdp = 38.2 where iso3 = 'ZAF';

-- ---- FX regime ----
update country set fx_regime = 'Free floating' where iso3 = 'USA';
update country set fx_regime = 'Free floating' where iso3 = 'JPN';
update country set fx_regime = 'Free floating' where iso3 = 'GBR';
update country set fx_regime = 'Free floating' where iso3 = 'AUS';
update country set fx_regime = 'Free floating' where iso3 = 'CAN';
update country set fx_regime = 'Free floating' where iso3 = 'CHL';
update country set fx_regime = 'Free floating' where iso3 = 'MEX';
update country set fx_regime = 'Free floating' where iso3 = 'NOR';
update country set fx_regime = 'Free floating' where iso3 = 'POL';
update country set fx_regime = 'Free floating' where iso3 = 'SWE';
update country set fx_regime = 'Free floating' where iso3 = 'RUS';
update country set fx_regime = 'Free floating' where iso3 = 'BRA';
update country set fx_regime = 'Free floating' where iso3 = 'COL';
update country set fx_regime = 'Free floating' where iso3 = 'ZAF';
update country set fx_regime = 'Free floating' where iso3 = 'KOR';
update country set fx_regime = 'Floating' where iso3 = 'IND';
update country set fx_regime = 'Floating' where iso3 = 'IDN';
update country set fx_regime = 'Floating' where iso3 = 'THA';
update country set fx_regime = 'Floating' where iso3 = 'MYS';
update country set fx_regime = 'Floating' where iso3 = 'PHL';
update country set fx_regime = 'Floating' where iso3 = 'TUR';
update country set fx_regime = 'Floating' where iso3 = 'ISR';
update country set fx_regime = 'Floating' where iso3 = 'NZL';
update country set fx_regime = 'Floating' where iso3 = 'CZE';
update country set fx_regime = 'Floating' where iso3 = 'HUN';
update country set fx_regime = 'Floating' where iso3 = 'ROU';
update country set fx_regime = 'Floating' where iso3 = 'PER';
update country set fx_regime = 'Floating' where iso3 = 'UGA';
update country set fx_regime = 'Floating' where iso3 = 'GHA';
update country set fx_regime = 'Floating' where iso3 = 'KAZ';
update country set fx_regime = 'Floating' where iso3 = 'ALB';
update country set fx_regime = 'Floating' where iso3 = 'SRB';
update country set fx_regime = 'Floating' where iso3 = 'MDA';
update country set fx_regime = 'Floating' where iso3 = 'ARM';
update country set fx_regime = 'Floating' where iso3 = 'GEO';
update country set fx_regime = 'Floating' where iso3 = 'MNG';
update country set fx_regime = 'Floating' where iso3 = 'ZMB';
update country set fx_regime = 'Floating' where iso3 = 'MOZ';
update country set fx_regime = 'Floating' where iso3 = 'MWI';
update country set fx_regime = 'Crawl-like arrangement' where iso3 = 'CHN';
update country set fx_regime = 'Stabilised arrangement' where iso3 = 'VNM';
update country set fx_regime = 'Crawl-like arrangement' where iso3 = 'SGP';
update country set fx_regime = 'Crawling peg' where iso3 = 'ARG';
update country set fx_regime = 'Stabilised arrangement' where iso3 = 'EGY';
update country set fx_regime = 'Stabilised arrangement' where iso3 = 'NGA';
update country set fx_regime = 'Stabilised arrangement' where iso3 = 'BGD';
update country set fx_regime = 'Stabilised arrangement' where iso3 = 'LKA';
update country set fx_regime = 'Crawl-like arrangement' where iso3 = 'UZB';
update country set fx_regime = 'Crawl-like arrangement' where iso3 = 'ETH';
update country set fx_regime = 'Stabilised arrangement' where iso3 = 'IRN';
update country set fx_regime = 'Stabilised arrangement' where iso3 = 'AZE';
update country set fx_regime = 'Conventional peg (USD)' where iso3 = 'SAU';
update country set fx_regime = 'Conventional peg (USD)' where iso3 = 'ARE';
update country set fx_regime = 'Conventional peg (USD)' where iso3 = 'QAT';
update country set fx_regime = 'Conventional peg (USD)' where iso3 = 'OMN';
update country set fx_regime = 'Conventional peg (USD)' where iso3 = 'BHR';
update country set fx_regime = 'Conventional peg (USD)' where iso3 = 'JOR';
update country set fx_regime = 'Currency board (USD)' where iso3 = 'HKG';
update country set fx_regime = 'Conventional peg (EUR)' where iso3 = 'DNK';
update country set fx_regime = 'Currency board (EUR)' where iso3 = 'BGR';
update country set fx_regime = 'Conventional peg (basket)' where iso3 = 'KWT';
update country set fx_regime = 'Conventional peg (basket)' where iso3 = 'MAR';
update country set fx_regime = 'Stabilised arrangement' where iso3 = 'LBN';
update country set fx_regime = 'Conventional peg (INR)' where iso3 = 'NPL';
update country set fx_regime = 'Conventional peg (INR)' where iso3 = 'BTN';
update country set fx_regime = 'Currency board (SGD)' where iso3 = 'BRN';
update country set fx_regime = 'Conventional peg (USD)' where iso3 = 'TKM';
update country set fx_regime = 'Conventional peg (USD)' where iso3 = 'ERI';
update country set fx_regime = 'Euro area' where iso3 = 'DEU';
update country set fx_regime = 'Euro area' where iso3 = 'FRA';
update country set fx_regime = 'Euro area' where iso3 = 'ITA';
update country set fx_regime = 'Euro area' where iso3 = 'ESP';
update country set fx_regime = 'Euro area' where iso3 = 'NLD';
update country set fx_regime = 'Euro area' where iso3 = 'BEL';
update country set fx_regime = 'Euro area' where iso3 = 'AUT';
update country set fx_regime = 'Euro area' where iso3 = 'IRL';
update country set fx_regime = 'Euro area' where iso3 = 'PRT';
update country set fx_regime = 'Euro area' where iso3 = 'GRC';
update country set fx_regime = 'Euro area' where iso3 = 'FIN';
update country set fx_regime = 'Euro area' where iso3 = 'SVK';
update country set fx_regime = 'Euro area' where iso3 = 'SVN';
update country set fx_regime = 'Euro area' where iso3 = 'LTU';
update country set fx_regime = 'Euro area' where iso3 = 'LVA';
update country set fx_regime = 'Euro area' where iso3 = 'EST';
update country set fx_regime = 'Euro area' where iso3 = 'LUX';
update country set fx_regime = 'Euro area' where iso3 = 'CYP';
update country set fx_regime = 'Euro area' where iso3 = 'MLT';
update country set fx_regime = 'Euro area' where iso3 = 'HRV';
update country set fx_regime = 'US dollar (no own currency)' where iso3 = 'ECU';
update country set fx_regime = 'US dollar (no own currency)' where iso3 = 'SLV';
update country set fx_regime = 'US dollar (no own currency)' where iso3 = 'PAN';
update country set fx_regime = 'US dollar (no own currency)' where iso3 = 'TLS';
update country set fx_regime = 'Multi-currency' where iso3 = 'ZWE';
update country set fx_regime = 'Euro (unilateral)' where iso3 = 'MNE';
update country set fx_regime = 'Euro (unilateral)' where iso3 = 'XKX';

-- ---- central bank + policy rate ----
update country set cb_name = 'Federal Reserve', policy_rate = 3.625, policy_rate_name = 'Federal funds target (midpoint)' where iso3 = 'USA';
update country set cb_name = 'People''s Bank of China', policy_rate = 3.0, policy_rate_name = '1-year Loan Prime Rate' where iso3 = 'CHN';
update country set cb_name = 'Bank of Japan', policy_rate = 1.0, policy_rate_name = 'Policy rate' where iso3 = 'JPN';
update country set cb_name = 'Bank of England', policy_rate = 3.75, policy_rate_name = 'Bank Rate' where iso3 = 'GBR';
update country set cb_name = 'Reserve Bank of India', policy_rate = 5.5, policy_rate_name = 'Repo rate' where iso3 = 'IND';
update country set cb_name = 'Bank of Canada', policy_rate = 2.25, policy_rate_name = 'Overnight rate' where iso3 = 'CAN';
update country set cb_name = 'Reserve Bank of Australia', policy_rate = 4.35, policy_rate_name = 'Cash rate' where iso3 = 'AUS';
update country set cb_name = 'Banco Central do Brasil', policy_rate = 15.0, policy_rate_name = 'Selic rate' where iso3 = 'BRA';
update country set cb_name = 'Bank of Russia', policy_rate = 18.0, policy_rate_name = 'Key rate' where iso3 = 'RUS';
update country set cb_name = 'Bank of Korea', policy_rate = 2.5, policy_rate_name = 'Base rate' where iso3 = 'KOR';
update country set cb_name = 'Banco de Mexico', policy_rate = 7.75, policy_rate_name = 'Overnight target' where iso3 = 'MEX';
update country set cb_name = 'Bank Indonesia', policy_rate = 5.25, policy_rate_name = 'BI rate' where iso3 = 'IDN';
update country set cb_name = 'Central Bank of Turkey', policy_rate = 40.0, policy_rate_name = '1-week repo' where iso3 = 'TUR';
update country set cb_name = 'Swiss National Bank', policy_rate = 0.0, policy_rate_name = 'Policy rate' where iso3 = 'CHE';
update country set cb_name = 'Sveriges Riksbank', policy_rate = 2.0, policy_rate_name = 'Policy rate' where iso3 = 'SWE';
update country set cb_name = 'Norges Bank', policy_rate = 4.0, policy_rate_name = 'Policy rate' where iso3 = 'NOR';
update country set cb_name = 'Danmarks Nationalbank', policy_rate = 2.35, policy_rate_name = 'Certificate of deposit rate' where iso3 = 'DNK';
update country set cb_name = 'Narodowy Bank Polski', policy_rate = 5.0, policy_rate_name = 'Reference rate' where iso3 = 'POL';
update country set cb_name = 'Czech National Bank', policy_rate = 3.5, policy_rate_name = '2-week repo' where iso3 = 'CZE';
update country set cb_name = 'Magyar Nemzeti Bank', policy_rate = 6.5, policy_rate_name = 'Base rate' where iso3 = 'HUN';
update country set cb_name = 'South African Reserve Bank', policy_rate = 7.25, policy_rate_name = 'Repo rate' where iso3 = 'ZAF';
update country set cb_name = 'Bank of Thailand', policy_rate = 1.75, policy_rate_name = 'Policy rate' where iso3 = 'THA';
update country set cb_name = 'Bank Negara Malaysia', policy_rate = 2.75, policy_rate_name = 'Overnight policy rate' where iso3 = 'MYS';
update country set cb_name = 'Bangko Sentral ng Pilipinas', policy_rate = 5.0, policy_rate_name = 'Target RRP rate' where iso3 = 'PHL';
update country set cb_name = 'Bank of Israel', policy_rate = 4.5, policy_rate_name = 'Policy rate' where iso3 = 'ISR';
update country set cb_name = 'Reserve Bank of New Zealand', policy_rate = 3.0, policy_rate_name = 'Official cash rate' where iso3 = 'NZL';
update country set cb_name = 'Banco de la Republica', policy_rate = 9.25, policy_rate_name = 'Policy rate' where iso3 = 'COL';
update country set cb_name = 'Banco Central de Chile', policy_rate = 4.75, policy_rate_name = 'Monetary policy rate' where iso3 = 'CHL';
update country set cb_name = 'Banco Central de Reserva', policy_rate = 4.5, policy_rate_name = 'Reference rate' where iso3 = 'PER';
update country set cb_name = 'Saudi Central Bank', policy_rate = 4.5, policy_rate_name = 'Repo rate' where iso3 = 'SAU';
update country set cb_name = 'Central Bank of UAE', policy_rate = 4.4, policy_rate_name = 'Base rate' where iso3 = 'ARE';
update country set cb_name = 'Qatar Central Bank', policy_rate = 4.6, policy_rate_name = 'Deposit rate' where iso3 = 'QAT';
update country set cb_name = 'Central Bank of Nigeria', policy_rate = 27.5, policy_rate_name = 'Monetary policy rate' where iso3 = 'NGA';
update country set cb_name = 'Central Bank of Egypt', policy_rate = 24.0, policy_rate_name = 'Overnight deposit rate' where iso3 = 'EGY';
update country set cb_name = 'State Bank of Pakistan', policy_rate = 11.0, policy_rate_name = 'Policy rate' where iso3 = 'PAK';
update country set cb_name = 'Bangladesh Bank', policy_rate = 10.0, policy_rate_name = 'Policy rate' where iso3 = 'BGD';
update country set cb_name = 'State Bank of Vietnam', policy_rate = 4.5, policy_rate_name = 'Refinancing rate' where iso3 = 'VNM';
update country set cb_name = 'Banco Central de la Republica Argentina', policy_rate = 29.0, policy_rate_name = 'Policy rate' where iso3 = 'ARG';
update country set cb_name = 'National Bank of Ukraine', policy_rate = 15.5, policy_rate_name = 'Key rate' where iso3 = 'UKR';
update country set cb_name = 'National Bank of Kazakhstan', policy_rate = 16.5, policy_rate_name = 'Base rate' where iso3 = 'KAZ';
update country set cb_name = 'Bank of Ghana', policy_rate = 25.0, policy_rate_name = 'Policy rate' where iso3 = 'GHA';
update country set cb_name = 'Central Bank of Kenya', policy_rate = 9.75, policy_rate_name = 'Central Bank Rate' where iso3 = 'KEN';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'DEU';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'FRA';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'ITA';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'ESP';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'NLD';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'BEL';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'AUT';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'IRL';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'PRT';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'GRC';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'FIN';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'SVK';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'SVN';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'LTU';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'LVA';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'EST';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'LUX';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'CYP';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'MLT';
update country set cb_name = 'European Central Bank', policy_rate = 2.25, policy_rate_name = 'Deposit facility rate' where iso3 = 'HRV';

-- ---- house prices ----
update country set house_price_yoy = 3.9, house_real_yoy = 1.1 where iso3 = 'USA';
update country set house_price_yoy = 3.1, house_real_yoy = -0.6 where iso3 = 'GBR';
update country set house_price_yoy = -1.2, house_real_yoy = -3.9 where iso3 = 'CAN';
update country set house_price_yoy = 4.8, house_real_yoy = 1.6 where iso3 = 'AUS';
update country set house_price_yoy = 1.8, house_real_yoy = -0.3 where iso3 = 'DEU';
update country set house_price_yoy = -1.9, house_real_yoy = -2.9 where iso3 = 'FRA';
update country set house_price_yoy = 2.1, house_real_yoy = 0.4 where iso3 = 'ITA';
update country set house_price_yoy = 8.4, house_real_yoy = 5.9 where iso3 = 'ESP';
update country set house_price_yoy = 9.2, house_real_yoy = 6.1 where iso3 = 'NLD';
update country set house_price_yoy = 4.5, house_real_yoy = 1.8 where iso3 = 'JPN';
update country set house_price_yoy = 2.1, house_real_yoy = -0.2 where iso3 = 'KOR';
update country set house_price_yoy = 4.2, house_real_yoy = -0.9 where iso3 = 'IND';
update country set house_price_yoy = 6.8, house_real_yoy = 1.9 where iso3 = 'BRA';
update country set house_price_yoy = 7.9, house_real_yoy = 3.1 where iso3 = 'MEX';
update country set house_price_yoy = 1.2, house_real_yoy = -3.1 where iso3 = 'ZAF';
update country set house_price_yoy = -4.9, house_real_yoy = -4.8 where iso3 = 'CHN';
update country set house_price_yoy = 1.9, house_real_yoy = -0.4 where iso3 = 'IDN';
update country set house_price_yoy = 9.8, house_real_yoy = 6.2 where iso3 = 'POL';
update country set house_price_yoy = 9.1, house_real_yoy = 6.8 where iso3 = 'CZE';
update country set house_price_yoy = 15.2, house_real_yoy = 10.9 where iso3 = 'HUN';
update country set house_price_yoy = 2.8, house_real_yoy = 2.4 where iso3 = 'CHE';
update country set house_price_yoy = 1.9, house_real_yoy = -0.4 where iso3 = 'SWE';
update country set house_price_yoy = 5.2, house_real_yoy = 2.1 where iso3 = 'NOR';
update country set house_price_yoy = 6.1, house_real_yoy = 4.2 where iso3 = 'DNK';
update country set house_price_yoy = 4.9, house_real_yoy = 2.1 where iso3 = 'ISR';
update country set house_price_yoy = -0.9, house_real_yoy = -3.2 where iso3 = 'NZL';
update country set house_price_yoy = 2.1, house_real_yoy = 1.4 where iso3 = 'THA';
update country set house_price_yoy = 3.2, house_real_yoy = 1.9 where iso3 = 'MYS';
update country set house_price_yoy = 6.8, house_real_yoy = 3.9 where iso3 = 'PHL';
update country set house_price_yoy = 8.9, house_real_yoy = 2.1 where iso3 = 'COL';
update country set house_price_yoy = 4.9, house_real_yoy = 0.9 where iso3 = 'CHL';
update country set house_price_yoy = 3.9, house_real_yoy = 2.1 where iso3 = 'PER';
update country set house_price_yoy = 32.1, house_real_yoy = -4.9 where iso3 = 'TUR';
update country set house_price_yoy = 9.8, house_real_yoy = 1.2 where iso3 = 'RUS';
update country set house_price_yoy = 8.9, house_real_yoy = 6.2 where iso3 = 'IRL';
update country set house_price_yoy = 9.1, house_real_yoy = 6.8 where iso3 = 'PRT';
update country set house_price_yoy = 8.2, house_real_yoy = 5.9 where iso3 = 'GRC';
update country set house_price_yoy = 3.9, house_real_yoy = 1.2 where iso3 = 'AUT';
update country set house_price_yoy = 4.1, house_real_yoy = 1.9 where iso3 = 'BEL';
update country set house_price_yoy = -0.9, house_real_yoy = -3.1 where iso3 = 'FIN';
update country set house_price_yoy = -6.9, house_real_yoy = -6.2 where iso3 = 'HKG';
update country set house_price_yoy = 3.9, house_real_yoy = 3.1 where iso3 = 'SGP';
update country set house_price_yoy = 2.9, house_real_yoy = 0.9 where iso3 = 'LUX';
update country set house_price_yoy = 9.8, house_real_yoy = 6.2 where iso3 = 'HRV';
update country set house_price_yoy = 5.9, house_real_yoy = 3.1 where iso3 = 'EST';
update country set house_price_yoy = 9.1, house_real_yoy = 5.9 where iso3 = 'LTU';
update country set house_price_yoy = 4.9, house_real_yoy = 2.1 where iso3 = 'LVA';
update country set house_price_yoy = 6.2, house_real_yoy = 3.9 where iso3 = 'SVK';
update country set house_price_yoy = 6.9, house_real_yoy = 4.2 where iso3 = 'SVN';
update country set house_price_yoy = 6.1, house_real_yoy = 3.9 where iso3 = 'CYP';
update country set house_price_yoy = 5.2, house_real_yoy = 2.9 where iso3 = 'MLT';
update country set house_price_yoy = 8.9, house_real_yoy = 3.1 where iso3 = 'ISL';
update country set house_price_yoy = 15.9, house_real_yoy = 12.1 where iso3 = 'BGR';
update country set house_price_yoy = 6.9, house_real_yoy = 2.1 where iso3 = 'ROU';
update country set house_price_yoy = 1.9, house_real_yoy = -0.9 where iso3 = 'MAR';

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

insert into rail (iso3, name, kind, live_year) values
  ('IND', 'UPI', 'Instant retail', 2016),
  ('IND', 'IMPS', 'Instant retail', 2010),
  ('IND', 'RTGS', 'Large-value RTGS', 2004),
  ('IND', 'NEFT', 'Deferred net', 2005),
  ('BRA', 'PIX', 'Instant retail', 2020),
  ('BRA', 'STR', 'Large-value RTGS', 2002),
  ('BRA', 'TED', 'Same-day transfer', 2002),
  ('USA', 'FedNow', 'Instant retail', 2023),
  ('USA', 'RTP', 'Instant retail', 2017),
  ('USA', 'ACH', 'Deferred net', 1974),
  ('USA', 'Fedwire', 'Large-value RTGS', 1918),
  ('GBR', 'Faster Payments', 'Instant retail', 2008),
  ('GBR', 'CHAPS', 'Large-value RTGS', 1984),
  ('GBR', 'Bacs', 'Deferred net', 1968),
  ('CHN', 'IBPS', 'Instant retail', 2010),
  ('CHN', 'CIPS', 'Cross-border', 2015),
  ('CHN', 'HVPS', 'Large-value RTGS', 2005),
  ('JPN', 'Zengin', 'Retail transfer', 1973),
  ('JPN', 'BOJ-NET', 'Large-value RTGS', 1988),
  ('KOR', 'BOK-Wire+', 'Large-value RTGS', 2009),
  ('KOR', 'Interbank instant', 'Instant retail', 2001),
  ('AUS', 'NPP / PayTo', 'Instant retail', 2018),
  ('AUS', 'RITS', 'Large-value RTGS', 1998),
  ('AUS', 'BECS', 'Deferred net', 1994),
  ('SGP', 'PayNow', 'Instant retail', 2017),
  ('SGP', 'FAST', 'Instant retail', 2014),
  ('SGP', 'MEPS+', 'Large-value RTGS', 2006),
  ('MEX', 'SPEI', 'Instant retail', 2004),
  ('MEX', 'CoDi', 'Instant retail', 2019),
  ('ZAF', 'PayShap', 'Instant retail', 2023),
  ('ZAF', 'SAMOS', 'Large-value RTGS', 1998),
  ('NGA', 'NIP', 'Instant retail', 2011),
  ('NGA', 'RTGS', 'Large-value RTGS', 2006),
  ('THA', 'PromptPay', 'Instant retail', 2017),
  ('THA', 'BAHTNET', 'Large-value RTGS', 1995),
  ('IDN', 'BI-FAST', 'Instant retail', 2021),
  ('IDN', 'BI-RTGS', 'Large-value RTGS', 2000),
  ('MYS', 'DuitNow', 'Instant retail', 2019),
  ('MYS', 'RENTAS', 'Large-value RTGS', 1999),
  ('PHL', 'InstaPay', 'Instant retail', 2018),
  ('PHL', 'PESONet', 'Deferred net', 2017),
  ('CAN', 'Interac e-Transfer', 'Instant retail', 2003),
  ('CAN', 'Lynx', 'Large-value RTGS', 2021),
  ('TUR', 'FAST', 'Instant retail', 2021),
  ('TUR', 'EFT', 'Large-value RTGS', 1992),
  ('RUS', 'SBP (Faster Payments)', 'Instant retail', 2019),
  ('RUS', 'BESP', 'Large-value RTGS', 2007),
  ('SAU', 'sarie / IPS', 'Instant retail', 2021),
  ('SAU', 'SARIE', 'Large-value RTGS', 1997),
  ('ARE', 'Aani', 'Instant retail', 2023),
  ('ARE', 'UAEFTS', 'Large-value RTGS', 2001),
  ('KEN', 'PesaLink', 'Instant retail', 2017),
  ('KEN', 'KEPSS', 'Large-value RTGS', 2005),
  ('POL', 'Express Elixir', 'Instant retail', 2012),
  ('POL', 'SORBNET2', 'Large-value RTGS', 2013),
  ('SWE', 'Swish', 'Instant retail', 2012),
  ('SWE', 'RIX', 'Large-value RTGS', 1990),
  ('VNM', 'NAPAS 247', 'Instant retail', 2016),
  ('VNM', 'IBPS', 'Large-value RTGS', 2002),
  ('PAK', 'Raast', 'Instant retail', 2021),
  ('PAK', 'RTGS/PRISM', 'Large-value RTGS', 2008),
  ('BGD', 'Binimoy', 'Instant retail', 2022),
  ('BGD', 'BEFTN', 'Deferred net', 2011),
  ('EGY', 'InstaPay', 'Instant retail', 2022),
  ('EGY', 'RTGS', 'Large-value RTGS', 2009),
  ('ARG', 'Transferencias 3.0', 'Instant retail', 2021),
  ('ARG', 'MEP', 'Large-value RTGS', 1997),
  ('COL', 'Bre-B', 'Instant retail', 2025),
  ('COL', 'CUD', 'Large-value RTGS', 1993),
  ('DEU', 'SEPA Instant', 'Instant retail', 2017),
  ('DEU', 'TARGET2/T2', 'Large-value RTGS', 2007),
  ('FRA', 'SEPA Instant', 'Instant retail', 2017),
  ('FRA', 'TARGET2/T2', 'Large-value RTGS', 2007),
  ('ITA', 'SEPA Instant', 'Instant retail', 2017),
  ('ITA', 'TARGET2/T2', 'Large-value RTGS', 2007),
  ('ESP', 'SEPA Instant', 'Instant retail', 2017),
  ('ESP', 'TARGET2/T2', 'Large-value RTGS', 2007),
  ('NLD', 'SEPA Instant', 'Instant retail', 2017),
  ('NLD', 'TARGET2/T2', 'Large-value RTGS', 2007),
  ('IRL', 'SEPA Instant', 'Instant retail', 2017),
  ('IRL', 'TARGET2/T2', 'Large-value RTGS', 2007);


-- ---- new indicator rows ----
insert into indicator (code, name, unit, definition, perimeter, valuation, caveat, source, vintage) values
  ('NET_DEBT', 'Net government debt', 'pct_gdp', 'General government debt net of the government''s financial assets, as a share of GDP.', 'general_govt', 'nominal', 'Published for fewer countries than gross debt. Norway is negative — its sovereign wealth fund holds more than the state owes. Net is often the fairer solvency measure, but gross is what headlines quote.', 'IMF Fiscal Monitor', '2025-26 estimate'),
  ('HH_DEBT', 'Household debt', 'pct_gdp', 'Credit to households and non-profits serving households, as a share of GDP.', 'households', 'market', 'BIS publishes this for exactly 44 economies. The other ~143 countries on this site have no comparable figure - shown as absent, never zero. High household debt (Switzerland, Australia, Korea above 100%) signals consumer leverage, not government weakness.', 'BIS credit statistics', '2024-25'),
  ('CORP_DEBT', 'Corporate debt', 'pct_gdp', 'Credit to non-financial corporations, as a share of GDP.', 'non_financial_corps', 'market', 'BIS, same 44-economy coverage as household debt. Luxembourg and Ireland are extreme outliers due to multinational entities domiciled there; the figure reflects corporate structuring, not domestic economic fragility.', 'BIS credit statistics', '2024-25'),
  ('FX_REGIME', 'Exchange rate regime', 'category', 'How the currency is managed: free floating, floating, pegged, currency board, or no separate legal tender.', NULL, NULL, 'IMF de facto classification - what a country actually does, which sometimes differs from what it says. Regime is the hidden variable behind debt risk: a country that issues its own freely floating currency can service local-currency debt in a way a pegged or dollarised economy cannot.', 'IMF AREAER', '2025'),
  ('POLICY_RATE', 'Central bank policy rate', 'pct', 'The main policy interest rate set by the central bank.', NULL, NULL, 'The one genuinely live figure on this site - it changes on each bank''s meeting calendar, not annually. Euro-area countries share the ECB''s rate. Values here are mid-2026; verify against the central bank directly before relying on them.', 'Central banks / BIS', 'mid-2026, live'),
  ('HOUSE', 'Residential house prices', 'pct_yoy', 'Year-on-year change in nominal residential property prices. A second column shows the inflation-adjusted (real) change.', NULL, NULL, 'Roughly 60 economies publish comparable indices. Nominal and real can diverge sharply - Turkey''s nominal prices rose over 30% while real prices fell, because inflation outran them. The real figure is the one that tells you whether housing got more expensive in purchasing-power terms.', 'BIS / OECD residential property', 'latest quarter'),
  ('RAILS', 'Payment rails', 'registry', 'National instant-payment and large-value settlement systems.', NULL, NULL, 'Largely compiled rather than fed from an API. Instant retail rails (India''s UPI, Brazil''s PIX, the euro area''s SEPA Instant) have reshaped domestic payments; large-value RTGS systems settle the interbank backbone. Coverage here is the principal systems, not every scheme.', 'Central banks / CPMI', '2025-26')
on conflict (code) do update set definition = excluded.definition, caveat = excluded.caveat, vintage = excluded.vintage;


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
