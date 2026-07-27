# -*- coding: utf-8 -*-
"""
Geographic revenue breakdown per corporation.
Source: Company 10-K annual filings (FY2024 unless noted).
Each company reports in its own geographic segments — these are preserved as-is,
not normalized, since Apple's "Greater China" and Samsung's "China" are different
perimeters and forcing them equal would be dishonest.
Revenue in USD billions.
"""

# corp_name -> [(region_name, revenue_usd_bn), ...]  sorted largest first
GEO_REVENUE = {
"Apple": [
    ("Americas", 167.0),
    ("Europe", 101.3),
    ("Greater China", 66.9),
    ("Rest of Asia Pacific", 30.5),
    ("Japan", 25.2),
],
"Microsoft": [
    ("United States", 116.0),
    ("Other countries", 146.0),
],
"Alphabet": [
    ("United States", 175.8),
    ("EMEA", 101.7),
    ("APAC", 55.5),
    ("Other Americas", 18.9),
],
"Amazon": [
    ("North America", 387.5),
    ("International", 145.7),
    ("AWS (global)", 107.6),
],
"Meta Platforms": [
    ("United States & Canada", 98.1),
    ("Europe", 33.5),
    ("Asia-Pacific", 23.0),
    ("Rest of world", 10.1),
],
"Tesla": [
    ("United States", 52.8),
    ("China", 21.3),
    ("Other", 23.6),
],
"NVIDIA": [
    ("United States", 47.7),
    ("Taiwan", 29.6),
    ("China incl. Hong Kong", 17.1),
    ("Singapore", 19.9),
    ("Other", 16.2),
],
"Walmart": [
    ("Walmart US", 478.1),
    ("Sam's Club", 90.0),
    ("Walmart International", 114.6),
],
"Samsung Electronics": [
    ("Americas", 61.3),
    ("Europe", 37.2),
    ("China", 35.1),
    ("Asia & Africa", 96.8),
],
"Toyota": [
    ("Japan", 87.5),
    ("North America", 112.0),
    ("Europe", 34.2),
    ("Asia", 42.8),
    ("Other", 30.5),
],
"TSMC": [
    ("North America", 68.8),
    ("Asia Pacific", 12.3),
    ("EMEA", 4.1),
    ("Japan", 2.0),
],
"AstraZeneca": [
    ("United States", 22.1),
    ("Europe", 11.4),
    ("Emerging markets", 11.5),
    ("Established Rest of World", 9.0),
],
"Shell": [
    ("Americas", 89.4),
    ("Europe & Africa", 121.3),
    ("Asia, Oceania & Africa", 105.7),
],
"Nestlé": [
    ("Americas", 36.2),
    ("Europe, Middle East & North Africa", 28.9),
    ("Asia, Oceania & sub-Saharan Africa", 27.1),
],
"Unilever": [
    ("Asia Pacific, Africa & MENA", 28.4),
    ("Americas", 16.9),
    ("Europe", 16.9),
],
"SAP": [
    ("Americas", 13.8),
    ("EMEA", 17.5),
    ("APJ", 5.7),
],
"ASML": [
    ("Taiwan", 9.9),
    ("South Korea", 5.2),
    ("China", 7.2),
    ("United States", 2.6),
    ("Other", 3.1),
],
"Infosys": [
    ("North America", 10.2),
    ("Europe", 4.7),
    ("Rest of world", 3.1),
],
"Shopify": [
    ("United States", 5.7),
    ("International", 3.3),
],
}
