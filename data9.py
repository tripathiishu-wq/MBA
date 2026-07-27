# -*- coding: utf-8 -*-
"""
Phase 9: notable public dealings (landmark IPOs/M&A a bank publicly led).
NOT a client roster — banks don't disclose those, and there is no authoritative
source for "who a bank's clients are." This is only deals that are matters of
public record (SEC filings, press disclosure): IPO lead underwriters and
similar. A small, growing, verified set — same discipline as CEOs and asset
history. This is the natural bridge to a future Corporations layer.
"""

# bank name (exact match to data.BANKS) -> [(deal, role, year), ...]
DEALS = {
"JPMorgan Chase": [
    ("Saudi Aramco IPO", "Joint global coordinator", 2019),
    ("SpaceX IPO", "Lead underwriter", 2026),
    ("Anthropic IPO", "Lead underwriter", 2026),
],
"Goldman Sachs": [
    ("Saudi Aramco IPO", "Joint global coordinator", 2019),
    ("SpaceX IPO", "Lead-left underwriter", 2026),
    ("Anthropic IPO", "Lead underwriter", 2026),
    ("OpenAI IPO", "Joint lead underwriter", 2026),
    ("Tesla IPO", "Lead underwriter", 2010),
],
"Morgan Stanley": [
    ("Saudi Aramco IPO", "Joint global coordinator", 2019),
    ("SpaceX IPO", "Lead underwriter", 2026),
    ("Anthropic IPO", "Lead underwriter", 2026),
    ("OpenAI IPO", "Joint lead underwriter", 2026),
    ("Tesla IPO", "Underwriter", 2010),
],
"Bank of America": [
    ("Saudi Aramco IPO", "Joint global coordinator", 2019),
    ("SpaceX IPO", "Lead underwriter", 2026),
],
"Citigroup": [
    ("Saudi Aramco IPO", "Joint global coordinator", 2019),
    ("SpaceX IPO", "Lead underwriter", 2026),
],
"HSBC Holdings": [
    ("Saudi Aramco IPO", "Joint global coordinator", 2019),
],
}
