# World Finance Atlas — Phase 1

Reference atlas of the world economy. 187 economies with output, population, land area,
currency, government debt and major banks. Every country has its own page.

Target: `atlas.rampiq.digital` (or any subdomain).

---

## What's in Phase 1

| | |
|---|---|
| Countries | 187 — ~99% of world GDP and population |
| Banks | 248 institutions, every country covered |
| Currencies | 138 distinct |
| Pages | 195 statically generated (187 country pages + 8 section pages) |
| World totals | $115.2T output · 8.22B people · 129.2M km² · $109.6T government debt |

**Routes**

```
/                      overview + proportional bands
/country/[slug]        one page per economy (187 of them)
/compare               rank/filter by 8 measures
/regions               six-region aggregates
/banks                 institutions by assets and by host economy
/methodology           definitions, sources, vintages, known limits
```

---

## Deploy

### 1. Database

Run `schema.sql` in the Supabase SQL editor. It's idempotent — safe to re-run.

Creates `country`, `bank`, `currency`, `indicator`, plus `region_summary` and
`world_totals` views, and enables RLS with public read policies.

Derived columns (`gdp_per_capita`, `pop_density`, `gdp_per_km2`, `debt_usd_bn`) are
Postgres `GENERATED ALWAYS ... STORED`. They recompute on write and can never go stale.

### 2. Environment

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

The app falls back to bundled `src/lib/seed.json` when these are absent, so it builds
and renders before Supabase is wired. Useful for preview deploys.

### 3. Build

```bash
npm install
npm run build
npm start
```

Verified: clean build, 195/195 static pages, no type errors.

### 4. Vercel

Point the project at this directory, add the two env vars, deploy. Add the subdomain
as a CNAME in your DNS.

Use `.com`/`.digital` for enterprise-facing work — novelty TLDs get blocked by
corporate proxies.

---

## Data model note

`indicator` is the table that makes this more than a spreadsheet. It stores `perimeter`,
`valuation` and `caveat` per measure, and those render *next to the number* rather than on
a buried methodology page.

This matters most for debt. Published figures for Japan range from ~200% to ~250% of GDP
depending on perimeter and valuation, and both cite the IMF. The IMF itself notes its
Fiscal Monitor tables use a narrower general-government perimeter for China than its
Article IV estimates. A site that shows one number and calls it "the" debt ratio is
wrong in the way most debt coverage is wrong.

Nine economies publish no comparable debt figure. They render an explicit absence state —
never a blank, never zero.

---

## Updating data

Edit `data.py`, then:

```bash
python gen_sql.py                    # regenerate schema.sql
python -c "..."                      # regenerate seed.json (see build notes)
```

Re-run the SQL in Supabase. Cadence: IMF WEO twice a year (April/October), UN WPP on
revision, S&P bank rankings annually. Annual data on a daily cron is wasted compute.

---

## Not in Phase 1

Deliberately deferred, per the playbook:

- Net debt alongside gross (published for fewer countries)
- Household/corporate leverage — BIS covers ~40–45 economies, needs the coverage-gap UI
- FX rates, central banks, policy rates
- Payment rails
- Historical time series — schema supports it, ingest doesn't yet
- The SLM

## Licensing

World Bank and UN data are free to redistribute with attribution. IMF and BIS are free to
*access*; redistribution terms are separate and need review before exposing a public API.
Currently no public API is exposed.
