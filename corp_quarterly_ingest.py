#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Twelve Data quarterly earnings ingest for World Finance Atlas.
Fetches quarterly income statement data for all corporations with a ticker.

Usage:
    python3 corp_quarterly_ingest.py --apikey YOUR_KEY [--out schema_quarterly.sql]

Free tier: 800 requests/day. 95 corporations = 95 calls — well within limit.
Run manually after each earnings season, or set a quarterly cron.

Twelve Data endpoint used:
  GET /income_statement?symbol=AAPL&period=quarterly&apikey=KEY
  Returns up to 12 quarters of revenue, net_income, and EPS.

Source: Twelve Data (twelvedata.com) — same key used for racing game stock board.
"""

import argparse, json, time, sys
try:
    import requests
except ImportError:
    print("pip install requests --break-system-packages"); sys.exit(1)

BASE = "https://api.twelvedata.com"

TICKERS = [
    # (corp_name, ticker, exchange_note)
    ("NVIDIA","NVDA","NASDAQ"),
    ("Apple","AAPL","NASDAQ"),
    ("Microsoft","MSFT","NASDAQ"),
    ("Alphabet","GOOGL","NASDAQ"),
    ("Amazon","AMZN","NASDAQ"),
    ("SpaceX","SPCX","NASDAQ"),
    ("Meta Platforms","META","NASDAQ"),
    ("Berkshire Hathaway","BRK.B","NYSE"),
    ("Tesla","TSLA","NASDAQ"),
    ("Broadcom","AVGO","NASDAQ"),
    ("Exxon Mobil","XOM","NYSE"),
    ("JPMorgan Chase","JPM","NYSE"),
    ("Walmart","WMT","NYSE"),
    ("Visa","V","NYSE"),
    ("UnitedHealth Group","UNH","NYSE"),
    ("Mastercard","MA","NYSE"),
    ("Johnson & Johnson","JNJ","NYSE"),
    ("Procter & Gamble","PG","NYSE"),
    ("Chevron","CVX","NYSE"),
    ("Home Depot","HD","NYSE"),
    ("AbbVie","ABBV","NYSE"),
    ("Eli Lilly","LLY","NYSE"),
    ("Costco","COST","NASDAQ"),
    ("Salesforce","CRM","NYSE"),
    ("Netflix","NFLX","NASDAQ"),
    ("Oracle","ORCL","NYSE"),
    ("Qualcomm","QCOM","NASDAQ"),
    ("AMD","AMD","NASDAQ"),
    ("Boeing","BA","NYSE"),
    ("Lockheed Martin","LMT","NYSE"),
    # China (Hong Kong / US ADR listed)
    ("Tencent","TCEHY","OTC"),
    ("Alibaba","BABA","NYSE"),
    ("BYD","BYDDY","OTC"),
    ("Meituan","MPNGY","OTC"),
    ("Xiaomi","XIACY","OTC"),
    ("JD.com","JD","NASDAQ"),
    ("China Mobile","CHL","NYSE"),
    ("Baidu","BIDU","NASDAQ"),
    # Japan ADR
    ("Toyota","TM","NYSE"),
    ("Sony","SONY","NYSE"),
    ("SoftBank","SFTBY","OTC"),
    ("Nintendo","NTDOY","OTC"),
    # Germany
    ("SAP","SAP","NYSE"),
    ("Siemens","SIEGY","OTC"),
    # UK
    ("AstraZeneca","AZN","NASDAQ"),
    ("Shell","SHEL","NYSE"),
    ("HSBC Holdings","HSBC","NYSE"),
    ("Unilever","UL","NYSE"),
    ("BP","BP","NYSE"),
    ("Rio Tinto","RIO","NYSE"),
    # France ADR
    ("LVMH","LVMUY","OTC"),
    ("TotalEnergies","TTE","NYSE"),
    ("L'Oréal","LRLCY","OTC"),
    ("Sanofi","SNY","NASDAQ"),
    # Korea ADR
    ("Samsung Electronics","SSNLF","OTC"),
    ("SK Hynix","HXSCL","OTC"),
    ("Hyundai Motor","HYMTF","OTC"),
    # Taiwan
    ("TSMC","TSM","NYSE"),
    # India
    ("Reliance Industries","RELIANCE.BSE","BSE"),
    ("Tata Consultancy Services","TCS.BSE","BSE"),
    ("Infosys","INFY","NYSE"),
    ("HDFC Bank","HDB","NYSE"),
    ("Wipro","WIT","NYSE"),
    # Netherlands
    ("ASML","ASML","NASDAQ"),
    # Switzerland ADR
    ("Nestlé","NSRGY","OTC"),
    ("Roche","RHHBY","OTC"),
    ("Novartis","NVS","NYSE"),
    # Canada
    ("Shopify","SHOP","NYSE"),
    ("Royal Bank of Canada","RY","NYSE"),
    # Australia
    ("BHP Group","BHP","NYSE"),
    # Saudi
    ("Saudi Aramco","2222.SR","Tadawul"),
    # Brazil
    ("Petrobras","PBR","NYSE"),
    ("Vale","VALE","NYSE"),
    # Norway
    ("Equinor","EQNR","NYSE"),
]

def fetch_quarterly(ticker: str, apikey: str) -> list[dict]:
    """Fetch quarterly income statement from Twelve Data."""
    url = f"{BASE}/income_statement"
    params = {
        "symbol": ticker,
        "period": "quarterly",
        "apikey": apikey,
    }
    try:
        r = requests.get(url, params=params, timeout=15)
        r.raise_for_status()
        d = r.json()
        if "income_statement" in d:
            return d["income_statement"]
        if "code" in d:  # error response
            return []
        return d if isinstance(d, list) else []
    except Exception as e:
        print(f"  error: {e}", file=sys.stderr)
        return []


def esc(s): return str(s).replace("'", "''")
def f(v):  # to_float
    try: return float(v) / 1_000_000_000  # Twelve Data returns raw USD
    except: return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apikey", required=True, help="Twelve Data API key")
    ap.add_argument("--out", default="schema_quarterly.sql")
    ap.add_argument("--delay", type=float, default=0.8,
                    help="Seconds between requests (default 0.8s = ~75 req/min, safe for free tier)")
    args = ap.parse_args()

    print(f"Fetching quarterly earnings for {len(TICKERS)} corporations...")
    print(f"Estimated API calls: {len(TICKERS)} / 800 daily limit")

    out = ["""-- =====================================================================
-- Corp quarterly earnings from Twelve Data
-- Generated by corp_quarterly_ingest.py
-- =====================================================================

drop table if exists corp_quarterly cascade;
create table corp_quarterly (
  id bigserial primary key,
  corp_name text not null,
  ticker text not null,
  period text not null,          -- e.g. '2024-Q3'
  period_end date,
  revenue_usd_bn numeric,
  net_income_usd_bn numeric,
  eps numeric,
  unique (corp_name, period)
);
create index corp_q_name_idx on corp_quarterly(corp_name, period);
alter table corp_quarterly enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='corp_quarterly'
                 and policyname='public read corp_quarterly')
  then create policy "public read corp_quarterly" on corp_quarterly
    for select using (true); end if;
end $$;
"""]

    rows = []
    errors = []

    for i, (corp_name, ticker, _exch) in enumerate(TICKERS):
        print(f"[{i+1}/{len(TICKERS)}] {corp_name} ({ticker})...", end=" ", flush=True)
        quarters = fetch_quarterly(ticker, args.apikey)

        if not quarters:
            print("no data")
            errors.append(corp_name)
            time.sleep(args.delay)
            continue

        count = 0
        for q in quarters:
            try:
                date_str = q.get("fiscal_date") or q.get("date") or q.get("period_end", "")
                if not date_str: continue
                # Parse into YYYY-QN label
                from datetime import datetime
                dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
                qn = f"{dt.year}-Q{(dt.month - 1) // 3 + 1}"
                rev = f(q.get("total_revenue") or q.get("revenue"))
                ni  = f(q.get("net_income"))
                eps_v = q.get("eps") or q.get("eps_diluted")
                try: eps_v = float(eps_v) if eps_v not in (None, "") else None
                except: eps_v = None

                rows.append(
                    f"  ('{esc(corp_name)}','{esc(ticker)}','{qn}','{date_str[:10]}',"
                    f"{'NULL' if rev is None else round(rev, 3)},"
                    f"{'NULL' if ni is None else round(ni, 3)},"
                    f"{'NULL' if eps_v is None else round(eps_v, 4)})"
                )
                count += 1
            except Exception as ex:
                pass

        print(f"{count} quarters")
        time.sleep(args.delay)

    if rows:
        out.append(
            "insert into corp_quarterly (corp_name,ticker,period,period_end,revenue_usd_bn,net_income_usd_bn,eps)\nvalues\n"
            + ",\n".join(rows)
            + "\non conflict (corp_name, period) do update set\n"
            "  revenue_usd_bn=excluded.revenue_usd_bn,\n"
            "  net_income_usd_bn=excluded.net_income_usd_bn,\n"
            "  eps=excluded.eps;"
        )

    out.append("\nNOTIFY pgrst, 'reload schema';")

    sql = "\n".join(out)
    with open(args.out, "w") as f_out:
        f_out.write(sql)

    print(f"\nDone. {len(rows)} rows → {args.out}")
    if errors:
        print(f"No data for: {', '.join(errors)}")
    print("Paste the SQL into Supabase SQL Editor and run.")


if __name__ == "__main__":
    main()
