// ISO 3166-1 alpha-3 -> alpha-2, for rendering flag emoji (regional indicator symbols).
// Covers all 187 economies in the dataset. A handful are non-ISO or special cases,
// handled with the conventional code still recognised by most platforms, or a
// graceful fallback where no flag glyph exists.
const A3_TO_A2: Record<string, string> = {
  AFG:'AF',AGO:'AO',ALB:'AL',AND:'AD',ARE:'AE',ARG:'AR',ARM:'AM',AUS:'AU',AUT:'AT',AZE:'AZ',
  BDI:'BI',BEL:'BE',BEN:'BJ',BFA:'BF',BGD:'BD',BGR:'BG',BHR:'BH',BHS:'BS',BIH:'BA',BLR:'BY',
  BLZ:'BZ',BOL:'BO',BRA:'BR',BRB:'BB',BRN:'BN',BTN:'BT',BWA:'BW',CAF:'CF',CAN:'CA',CHE:'CH',
  CHL:'CL',CHN:'CN',CIV:'CI',CMR:'CM',COD:'CD',COG:'CG',COL:'CO',COM:'KM',CPV:'CV',CRI:'CR',
  CUB:'CU',CYP:'CY',CZE:'CZ',DEU:'DE',DJI:'DJ',DNK:'DK',DOM:'DO',DZA:'DZ',ECU:'EC',EGY:'EG',
  ERI:'ER',ESP:'ES',EST:'EE',ETH:'ET',FIN:'FI',FJI:'FJ',FRA:'FR',GAB:'GA',GBR:'GB',GEO:'GE',
  GHA:'GH',GIN:'GN',GMB:'GM',GNB:'GW',GNQ:'GQ',GRC:'GR',GTM:'GT',GUY:'GY',HKG:'HK',HND:'HN',
  HRV:'HR',HTI:'HT',HUN:'HU',IDN:'ID',IND:'IN',IRL:'IE',IRN:'IR',IRQ:'IQ',ISL:'IS',ISR:'IL',
  ITA:'IT',JAM:'JM',JOR:'JO',JPN:'JP',KAZ:'KZ',KEN:'KE',KGZ:'KG',KHM:'KH',KOR:'KR',KWT:'KW',
  LAO:'LA',LBN:'LB',LBR:'LR',LBY:'LY',LIE:'LI',LKA:'LK',LSO:'LS',LTU:'LT',LUX:'LU',LVA:'LV',
  MAC:'MO',MAR:'MA',MCO:'MC',MDA:'MD',MDG:'MG',MDV:'MV',MEX:'MX',MKD:'MK',MLI:'ML',MLT:'MT',
  MMR:'MM',MNE:'ME',MNG:'MN',MOZ:'MZ',MRT:'MR',MUS:'MU',MWI:'MW',MYS:'MY',NAM:'NA',NER:'NE',
  NGA:'NG',NIC:'NI',NLD:'NL',NOR:'NO',NPL:'NP',NZL:'NZ',OMN:'OM',PAK:'PK',PAN:'PA',PER:'PE',
  PHL:'PH',PNG:'PG',POL:'PL',PRI:'PR',PRK:'KP',PRT:'PT',PRY:'PY',PSE:'PS',QAT:'QA',ROU:'RO',
  RUS:'RU',RWA:'RW',SAU:'SA',SDN:'SD',SEN:'SN',SGP:'SG',SLB:'SB',SLE:'SL',SLV:'SV',SMR:'SM',
  SOM:'SO',SRB:'RS',SSD:'SS',STP:'ST',SUR:'SR',SVK:'SK',SVN:'SI',SWE:'SE',SWZ:'SZ',SYC:'SC',
  SYR:'SY',TCD:'TD',TGO:'TG',THA:'TH',TJK:'TJ',TKM:'TM',TLS:'TL',TON:'TO',TTO:'TT',TUN:'TN',
  TUR:'TR',TWN:'TW',TZA:'TZ',UGA:'UG',UKR:'UA',URY:'UY',USA:'US',UZB:'UZ',VEN:'VE',VNM:'VN',
  VUT:'VU',WSM:'WS',YEM:'YE',ZAF:'ZA',ZMB:'ZM',ZWE:'ZW',
  // XKX (Kosovo) has no official ISO 3166-1 code; XK is the widely-used
  // provisional code and renders correctly as a flag on most platforms.
  XKX:'XK',
};

/**
 * Real flag image URL (not emoji) from flagcdn.com — a free, public CDN of
 * actual national flag graphics, indexed by the same ISO alpha-2 codes above.
 * `width` controls the requested raster size (flagcdn serves w20/w40/w80/w160/w320).
 */
export function flagUrl(iso3: string, width: 20 | 40 | 80 | 160 | 320 = 40): string {
  const a2 = A3_TO_A2[iso3];
  if (!a2) return '';
  return `https://flagcdn.com/w${width}/${a2.toLowerCase()}.png`;
}

/** Alt text helper so every flag image has a real accessible label. */
export function flagAlt(name: string): string {
  return `Flag of ${name}`;
}
