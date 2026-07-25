#!/usr/bin/env python3
"""
IMF Historical Ingest — World Finance Atlas
=============================================
Pulls REAL year-by-year values from the IMF DataMapper API for every country
and writes a SQL migration that populates the `observation` history table.

Runs on YOUR machine (the build sandbox can't reach imf.org). Reusable every
year: change YEAR_END, re-run, get a fresh migration.

Usage:
    pip install requests
    python imf_ingest.py                    # 2010..current, all indicators
    python imf_ingest.py --start 2000       # deeper history
    python imf_ingest.py --out my.sql       # custom output file

Then paste the generated SQL into Supabase SQL Editor.

Indicators (IMF DataMapper codes):
    NGDPD         GDP, current prices, USD billions
    LP            Population, millions
    GGXWDG_NGDP   General government gross debt, % of GDP
    GGXWDN_NGDP   General government net debt, % of GDP
"""

import argparse
import json
import sys
import time
from datetime import datetime

try:
    import requests
except ImportError:
    sys.exit("Run:  pip install requests")

API = "https://www.imf.org/external/datamapper/api/v1"

# IMF indicator code -> (our column base, unit note)
INDICATORS = {
    "NGDPD":       "gdp_usd_bn",
    "LP":          "population_mn",
    "GGXWDG_NGDP": "debt_pct_gdp",
    "GGXWDN_NGDP": "net_debt_pct_gdp",
}

# IMF uses ISO3 that mostly match ours. A few of our rows are territories IMF
# codes differently or doesn't cover; those simply won't get history (honest gap).
# Map our iso3 -> IMF code where they differ:
ISO_OVERRIDE = {
    "XKX": "UVK",   # Kosovo
    # Hong Kong, Macao, Taiwan, Puerto Rico, Palestine: IMF coverage varies.
    "TWN": "TWN",
    "HKG": "HKG",
    "MAC": "MAC",
}
# Our full country list is loaded from data.py so the script stays in sync.


def load_our_countries():
    """Read iso3 list from the existing data.py so we never drift out of sync."""
    try:
        import data
        return [c[1] for c in data.COUNTRIES]
    except Exception:
        # Fallback: a small core set so the script still demonstrates if data.py absent
        return ["USA", "CHN", "JPN", "DEU", "IND", "GBR", "FRA", "ITA", "BRA", "CAN"]


def fetch(indicator, retries=3):
    """Fetch one indicator for ALL countries at once (API supports this)."""
    url = f"{API}/{indicator}"
    for attempt in range(retries):
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
            payload = r.json()
            # shape: {"values": {"NGDPD": {"USA": {"2010": 14992.1, ...}, ...}}}
            return payload.get("values", {}).get(indicator, {})
        except Exception as e:
            if attempt == retries - 1:
                print(f"  ! {indicator} failed: {e}", file=sys.stderr)
                return {}
            time.sleep(2 * (attempt + 1))
    return {}


def esc(v):
    return "NULL" if v is None else str(round(float(v), 3))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", type=int, default=2010)
    ap.add_argument("--end", type=int, default=datetime.now().year + 1)
    ap.add_argument("--out", default="schema_history.sql")
    args = ap.parse_args()

    ours = set(load_our_countries())
    years = list(range(args.start, args.end + 1))
    print(f"Fetching {len(INDICATORS)} indicators, {args.start}-{args.end}, "
          f"{len(ours)} countries...")

    # indicator -> { iso3 -> { year -> value } }
    data_by_ind = {}
    for imf_code in INDICATORS:
        print(f"  {imf_code} ...", end=" ", flush=True)
        data_by_ind[imf_code] = fetch(imf_code)
        print(f"{len(data_by_ind[imf_code])} economies")
        time.sleep(1)  # be polite to the API

    # Build rows: one observation per (iso3, indicator, year) that has a value
    rows = []
    covered_pairs = 0
    for imf_code, col in INDICATORS.items():
        series = data_by_ind[imf_code]
        for our_iso in ours:
            imf_iso = ISO_OVERRIDE.get(our_iso, our_iso)
            cdata = series.get(imf_iso)
            if not cdata:
                continue
            for y in years:
                v = cdata.get(str(y))
                if v is None:
                    continue
                rows.append((our_iso, col, y, v))
                covered_pairs += 1

    print(f"\nCollected {len(rows)} real observations.")

    # Emit SQL
    out = []
    out.append(f"""-- =====================================================================
-- WORLD FINANCE ATLAS - historical observations from IMF DataMapper
-- Generated {datetime.now().isoformat(timespec='minutes')}
-- Range {args.start}-{args.end}. Real IMF WEO values. Re-runnable.
-- =====================================================================

create table if not exists observation (
  id              bigserial primary key,
  iso3            text not null references country(iso3) on delete cascade,
  indicator       text not null,          -- gdp_usd_bn | population_mn | debt_pct_gdp | net_debt_pct_gdp
  year            int  not null,
  value           numeric,
  source          text default 'IMF WEO',
  unique (iso3, indicator, year)
);
create index if not exists obs_iso_ind_idx on observation(iso3, indicator);
create index if not exists obs_year_idx    on observation(year);

alter table observation enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='observation' and policyname='public read observation') then
    create policy "public read observation" on observation for select using (true);
  end if;
end $$;

-- upsert: re-running with new data overwrites cleanly, never duplicates
insert into observation (iso3, indicator, year, value) values""")

    values = ",\n".join(
        f"  ('{iso}', '{col}', {y}, {esc(v)})" for (iso, col, y, v) in rows
    )
    out.append(values)
    out.append("""on conflict (iso3, indicator, year)
  do update set value = excluded.value, source = excluded.source;

-- convenience view: GDP time series per country
create or replace view gdp_history as
select iso3, year, value as gdp_usd_bn
from observation where indicator = 'gdp_usd_bn'
order by iso3, year;
""")

    sql = "\n".join(out)
    with open(args.out, "w") as f:
        f.write(sql)

    # coverage report
    iso_with = len(set(r[0] for r in rows))
    print(f"Wrote {args.out}  ({len(sql)//1024} KB)")
    print(f"Coverage: {iso_with}/{len(ours)} countries have history.")
    print(f"          {len(ours)-iso_with} have no IMF match (honest gap).")
    print("\nNext: paste the SQL into Supabase SQL Editor and run.")


if __name__ == "__main__":
    main()
