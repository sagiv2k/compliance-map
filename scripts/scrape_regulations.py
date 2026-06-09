"""
scrape_regulations.py — Intelligent multi-source regulation scraper.

Outputs staged JSON files to data/scraped/ for human review before merging
into data/regulations.json.  Each file is named YYYY-MM-DD-{source}.json.

Usage:
    python scripts/scrape_regulations.py [--source SOURCE] [--dry-run]

Available sources:
    regulations_gov      Regulations.gov API v4 (requires free API key)
    library_of_congress  LOC Nations legal research pages
    dla_piper            DLA Piper Data Protection Across the Globe
    climate_laws         Climate Change Laws of the World API
    pri_regulation       PRI Global Regulation Database
    saicm_pdf            SAICM PDF (pdfplumber)
    georgetown_law       Georgetown Law Library
    nlex                 N-Lex (EU national legislation)
    uchicago             UChicago Foreign & International Law Library

Dependencies:
    pip install requests beautifulsoup4 pdfplumber
    (Playwright required for DLA Piper SPA: pip install playwright && playwright install)

API keys:
    REGULATIONS_GOV_KEY  — free key from https://open.gsa.gov/api/regulationsgov/
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

# Ensure UTF-8 output so Hebrew path characters in SCRAPED_DIR don't crash on Windows cp1252
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    raise SystemExit(
        "Missing dependencies — run: pip install requests beautifulsoup4 pdfplumber"
    )

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SCRAPED_DIR = Path(__file__).parent.parent / "data" / "scraped"
SCRAPED_DIR.mkdir(parents=True, exist_ok=True)

TODAY       = date.today().isoformat()
TIMEOUT     = 20
HEADERS     = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; ComplianceMapResearch/1.0; "
        "Academic/non-commercial use)"
    ),
    "Accept": "text/html,application/xhtml+xml,application/json,*/*;q=0.9",
}

# ---------------------------------------------------------------------------
# Output schema helper
# ---------------------------------------------------------------------------
def _regulation_stub(
    *,
    id: str,
    short_name: str,
    name: str,
    authority: str,
    jurisdiction: str,
    enforcement_region: str,
    domain: list[str],
    status: str,
    url: str,
    summary: str = "",
    source: str,
) -> dict:
    return {
        "id":                id,
        "short_name":        short_name,
        "name":              name,
        "authority":         authority,
        "jurisdiction":      jurisdiction,
        "enforcement_region": enforcement_region,
        "domain":            domain,
        "status":            status,
        "effective_date":    "",
        "url":               url,
        "summary":           summary,
        "geography":         {"countries": [], "regions": []},
        "key_requirements":  [],
        "_source":           source,
        "_scraped_at":       TODAY,
    }


def _save(source_key: str, items: list[dict]) -> Path:
    out_path = SCRAPED_DIR / f"{TODAY}-{source_key}.json"
    payload = {
        "source":     source_key,
        "scraped_at": TODAY,
        "count":      len(items),
        "items":      items,
    }
    out_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  Saved {len(items)} items → {out_path.name}")
    return out_path


# ---------------------------------------------------------------------------
# Source 1 — Regulations.gov API v4
# ---------------------------------------------------------------------------
def scrape_regulations_gov(dry_run: bool = False) -> list[dict]:
    """
    Free API key required: https://open.gsa.gov/api/regulationsgov/
    Set env var REGULATIONS_GOV_KEY before running.
    Searches for recent rulemakings from compliance-relevant agencies only.
    """
    api_key = os.environ.get("REGULATIONS_GOV_KEY", "DEMO_KEY")
    base    = "https://api.regulations.gov/v4/documents"
    # Only query agencies whose rules are compliance-relevant for this platform
    RELEVANT_AGENCIES = ["FTC", "SEC", "OCC", "CFPB", "FCC", "FDA", "HHS", "CISA", "NIST"]
    params  = {
        "filter[documentType]": "Rule",
        "filter[agencyId]":     ",".join(RELEVANT_AGENCIES),
        "filter[postedDate][ge]": f"{date.today().year}-01-01",
        "page[size]": 25,
        "api_key":   api_key,
        "sort":      "-postedDate",
    }

    print(f"  Regulations.gov (key: {'***' if api_key != 'DEMO_KEY' else 'DEMO_KEY'})")
    if dry_run:
        print("  [dry-run] skipping API call")
        return []

    try:
        resp = requests.get(base, params=params, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        print(f"  FAILED: {exc}")
        return []

    _AGENCY_DOMAIN = {
        "FTC": ["data_privacy", "finance"], "SEC": ["finance", "cybersecurity"],
        "OCC": ["finance"], "CFPB": ["finance", "data_privacy"],
        "FCC": ["data_privacy", "critical_infrastructure"], "FDA": ["health"],
        "HHS": ["health", "data_privacy"], "CISA": ["cybersecurity", "critical_infrastructure"],
        "NIST": ["cybersecurity"],
    }
    items = []
    for doc in data.get("data", []):
        attr    = doc.get("attributes", {})
        agency  = attr.get("agencyId", "")
        # Use agency-based domain first, then title keywords as tiebreaker
        domain  = _AGENCY_DOMAIN.get(agency) or _guess_domain(attr.get("title", "")) or ["finance"]
        items.append(_regulation_stub(
            id               = "REG_GOV_" + doc.get("id", ""),
            short_name       = attr.get("documentId", doc.get("id", "")),
            name             = attr.get("title", ""),
            authority        = agency,
            jurisdiction     = "United States",
            enforcement_region = "us_federal",
            domain           = domain,
            status           = "active" if attr.get("openForComment") else "proposed",
            url              = f"https://www.regulations.gov/document/{doc.get('id', '')}",
            summary          = "",
            source           = "regulations.gov",
        ))

    print(f"  Got {len(items)} rules")
    return items


# ---------------------------------------------------------------------------
# Source 2 — Library of Congress Nations
# ---------------------------------------------------------------------------
LOC_NATIONS = [
    "australia", "brazil", "canada", "china", "european-union",
    "france", "germany", "india", "israel", "japan",
    "mexico", "russia", "saudi-arabia", "south-africa", "united-kingdom",
]

def scrape_loc_nations(dry_run: bool = False) -> list[dict]:
    """Scrapes LOC Guide to Law Online for each nation's data-protection links."""
    base = "https://www.loc.gov/law/help/guide/"
    items = []

    for nation in LOC_NATIONS:
        url = f"{base}{nation}.php"
        print(f"  LOC {nation}", end=" … ", flush=True)
        if dry_run:
            print("skip")
            continue
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # Extract all links in the main content that look regulatory
            content = soup.find("div", id="main-body") or soup.find("main") or soup
            # Skip ALL *.loc.gov subdomains — only external legislative sites are useful
            _LOC_SKIP_DOMAINS_SUFFIX = ".loc.gov"
            _REGULATION_KW = [
                "act", "law", "regulation", "privacy", "data protection", "cyber",
                "security", "protection", "code", "ordinance", "decree", "directive",
                "legislation", "bill", "statute", "framework", "gdpr", "lgpd", "pipl",
            ]
            count = 0
            for a in content.find_all("a", href=True):
                title = a.get_text(strip=True)
                href  = urljoin(url, a["href"])
                if not title or len(title) < 10:
                    continue
                # Skip ALL *.loc.gov links (blog posts, navigation, catalogue, Ask a Librarian)
                parsed_href = urlparse(href)
                if parsed_href.netloc == "loc.gov" or parsed_href.netloc.endswith(_LOC_SKIP_DOMAINS_SUFFIX):
                    continue
                if not any(kw in title.lower() for kw in _REGULATION_KW):
                    continue

                items.append(_regulation_stub(
                    id               = "LOC_" + _slug(nation + "_" + title),
                    short_name       = _short(title),
                    name             = title,
                    authority        = "LOC Nations",
                    jurisdiction     = nation.replace("-", " ").title(),
                    enforcement_region = _country_to_region(nation),
                    domain           = _guess_domain(title) or ["data_privacy"],
                    status           = "active",
                    url              = href,
                    source           = "loc.nations",
                ))
                count += 1

            print(f"{count} items")
            time.sleep(0.5)
        except Exception as exc:
            print(f"FAILED ({exc})")

    return items


# ---------------------------------------------------------------------------
# Source 3 — DLA Piper Data Protection Across the Globe
# ---------------------------------------------------------------------------
def scrape_dla_piper(dry_run: bool = False) -> list[dict]:
    """
    DLA Piper is a JavaScript SPA — static requests will return an empty shell.
    Requires Playwright for full content. This function attempts a static fetch
    first and logs a warning if the SPA shell is returned instead.
    For production use: install playwright and swap the requests call for
    playwright.chromium.launch().
    """
    url   = "https://www.dlapiperdataprotection.com"
    items = []

    print(f"  DLA Piper {url}", end=" … ", flush=True)
    if dry_run:
        print("skip")
        return []

    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        soup = BeautifulSoup(resp.text, "html.parser")

        # Check if we got the SPA shell (no actual content)
        country_links = soup.find_all("a", href=re.compile(r"/country/"))
        if not country_links:
            print(
                "WARNING: SPA shell returned — no country data. "
                "Install Playwright for full extraction."
            )
            # Return a single placeholder so reviewers know to run with Playwright
            items.append({
                "_note": (
                    "DLA Piper is a JavaScript SPA. Run with Playwright: "
                    "playwright install && python scripts/dla_piper_playwright.py"
                )
            })
            return items

        for a in country_links[:30]:
            title = a.get_text(strip=True)
            href  = urljoin(url, a["href"])
            items.append(_regulation_stub(
                id               = "DLA_" + _slug(title),
                short_name       = title,
                name             = f"{title} Data Protection Law",
                authority        = "DLA Piper Research",
                jurisdiction     = title,
                enforcement_region = _country_to_region(title.lower()),
                domain           = ["data_privacy"],
                status           = "active",
                url              = href,
                source           = "dla_piper",
            ))
        print(f"{len(items)} countries")

    except Exception as exc:
        print(f"FAILED ({exc})")

    return items


# ---------------------------------------------------------------------------
# Source 4 — Climate Change Laws of the World API
# ---------------------------------------------------------------------------
def scrape_climate_laws(dry_run: bool = False) -> list[dict]:
    """
    Uses the Grantham Research Institute API at climate-laws.org.
    No API key required. Returns climate/environment legislation.
    """
    # climate-laws.org (now Climate Policy Radar) moved to a new API in 2024.
    # Try the new endpoint first, then fallback to the search page for scraping.
    url     = "https://climate-laws.org/api/v1/laws"
    params  = {"per_page": 50, "page": 1}
    items   = []

    print(f"  Climate Laws of the World", end=" … ", flush=True)
    if dry_run:
        print("skip")
        return []

    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        # Climate Policy Radar API may return {"data": [...]} or a flat list
        records = data.get("data", data.get("results", data)) if isinstance(data, dict) else data

        for rec in records[:40]:
            country = (rec.get("geography") or {}).get("name", "")
            items.append(_regulation_stub(
                id               = "CLIMATE_" + str(rec.get("id", _slug(rec.get("title", "")))),
                short_name       = _short(rec.get("title", "")),
                name             = rec.get("title", ""),
                authority        = rec.get("government_branch", "Government"),
                jurisdiction     = country,
                enforcement_region = _country_to_region(country.lower()),
                domain           = ["environment"],
                status           = "active" if rec.get("passed_lower_or_single_house") else "proposed",
                url              = rec.get("url") or f"https://climate-laws.org/legislation/{rec.get('id', '')}",
                summary          = rec.get("description", "")[:280],
                source           = "climate-laws.org",
            ))

        print(f"{len(items)} records")
    except Exception as exc:
        print(f"FAILED ({exc})")

    return items


# ---------------------------------------------------------------------------
# Source 5 — PRI Regulation Database
# ---------------------------------------------------------------------------
def scrape_pri_regulation(dry_run: bool = False) -> list[dict]:
    """Scrapes the PRI regulation database listing page."""
    url   = "https://public.unpri.org/policy/global-policy/regulation-database"
    items = []

    print(f"  PRI Regulation Database", end=" … ", flush=True)
    if dry_run:
        print("skip")
        return []

    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        count = 0
        for article in soup.find_all(["article", "li", "div"], class_=re.compile(r"(card|item|result|regulation)")):
            title_tag = article.find(["h2", "h3", "h4", "a"])
            if not title_tag:
                continue
            title = title_tag.get_text(strip=True)
            link_tag = article.find("a", href=True)
            href = urljoin(url, link_tag["href"]) if link_tag else url

            if not title or len(title) < 10:
                continue

            items.append(_regulation_stub(
                id               = "PRI_" + _slug(title),
                short_name       = _short(title),
                name             = title,
                authority        = "PRI",
                jurisdiction     = "Global",
                enforcement_region = "international",
                domain           = ["finance", "environment"],
                status           = "active",
                url              = href,
                source           = "unpri.org",
            ))
            count += 1
            if count >= 30:
                break

        print(f"{len(items)} items")
    except Exception as exc:
        print(f"FAILED ({exc})")

    return items


# ---------------------------------------------------------------------------
# Source 6 — SAICM PDF
# ---------------------------------------------------------------------------
def scrape_saicm_pdf(dry_run: bool = False) -> list[dict]:
    """
    Downloads and parses the SAICM Strategic Approach to International Chemicals
    Management document (PDF). Returns high-level chapter/section items.
    Requires: pip install pdfplumber
    """
    pdf_url = (
        "https://www.saicm.org/Portals/12/documents/publications/"
        "SAICM_texts_and_resolutions.pdf"
    )
    items   = []

    print(f"  SAICM PDF", end=" … ", flush=True)
    if dry_run:
        print("skip")
        return []

    try:
        import pdfplumber
    except ImportError:
        print("SKIP (pdfplumber not installed — run: pip install pdfplumber)")
        return []

    try:
        resp = requests.get(pdf_url, headers=HEADERS, timeout=60, stream=True)
        resp.raise_for_status()

        tmp_path = SCRAPED_DIR / "saicm_tmp.pdf"
        with open(tmp_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        with pdfplumber.open(tmp_path) as pdf:
            full_text = "\n".join(page.extract_text() or "" for page in pdf.pages[:20])

        # Extract chapter headings as regulation stubs
        chapter_re = re.compile(
            r"(?m)^(Chapter|Section|Part|Resolution)\s+([\dIVX]+)[:\.\s]+(.+)$"
        )
        seen: set[str] = set()
        for match in chapter_re.finditer(full_text):
            title = f"SAICM {match.group(1)} {match.group(2)}: {match.group(3).strip()}"
            if title in seen or len(title) < 20:
                continue
            seen.add(title)
            items.append(_regulation_stub(
                id               = "SAICM_" + _slug(title),
                short_name       = f"SAICM {match.group(1)[:4]} {match.group(2)}",
                name             = title,
                authority        = "UNEP / SAICM Secretariat",
                jurisdiction     = "Global",
                enforcement_region = "international",
                domain           = ["environment"],
                status           = "active",
                url              = pdf_url,
                source           = "saicm.org",
            ))
            if len(items) >= 15:
                break

        tmp_path.unlink(missing_ok=True)
        print(f"{len(items)} sections")
    except Exception as exc:
        print(f"FAILED ({exc})")

    return items


# ---------------------------------------------------------------------------
# Source 7 — Georgetown Law Library (Foreign Law Guide)
# ---------------------------------------------------------------------------
def scrape_georgetown_law(dry_run: bool = False) -> list[dict]:
    """Scrapes Georgetown Law Library's International Cyberspace Law research guide."""
    url   = "https://guides.ll.georgetown.edu/cyberspace/data-protection-national-laws"
    items = []

    print(f"  Georgetown Law Library", end=" … ", flush=True)
    if dry_run:
        print("skip")
        return []

    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        count = 0
        for a in soup.find_all("a", href=True):
            title = a.get_text(strip=True)
            href  = a["href"]
            if not title or len(title) < 8:
                continue
            if not any(kw in title.lower() for kw in [
                "data", "privacy", "cyber", "financial", "banking",
                "environment", "labor", "securities", "regulation", "law",
            ]):
                continue
            if not href.startswith("http"):
                href = urljoin(url, href)

            items.append(_regulation_stub(
                id               = "GEO_" + _slug(title),
                short_name       = _short(title),
                name             = title,
                authority        = "Georgetown Law Library",
                jurisdiction     = "Multiple",
                enforcement_region = "international",
                domain           = _guess_domain(title) or ["data_privacy"],
                status           = "active",
                url              = href,
                source           = "georgetown.edu",
            ))
            count += 1
            if count >= 30:
                break

        print(f"{len(items)} items")
    except Exception as exc:
        print(f"FAILED ({exc})")

    return items


# ---------------------------------------------------------------------------
# Source 8 — N-Lex (EU national legislation portal)
# ---------------------------------------------------------------------------
NLEX_COUNTRIES = {
    "AT": "Austria", "BE": "Belgium", "BG": "Bulgaria", "CY": "Cyprus",
    "CZ": "Czech Republic", "DE": "Germany", "DK": "Denmark", "EE": "Estonia",
    "ES": "Spain", "FI": "Finland", "FR": "France", "GR": "Greece",
    "HR": "Croatia", "HU": "Hungary", "IE": "Ireland", "IT": "Italy",
    "LT": "Lithuania", "LU": "Luxembourg", "LV": "Latvia", "MT": "Malta",
    "NL": "Netherlands", "PL": "Poland", "PT": "Portugal", "RO": "Romania",
    "SE": "Sweden", "SI": "Slovenia", "SK": "Slovakia",
}

def scrape_nlex(dry_run: bool = False) -> list[dict]:
    """
    Queries EUR-Lex search RSS for EU member state data protection / cybersecurity legislation.
    N-Lex's old RSS search endpoint (n-lex.europa.eu/n-lex/recherche/rss) was retired.
    EUR-Lex provides equivalent access to national transposition measures.
    """
    # EUR-Lex predefined RSS feeds for recent EU Official Journal legislation
    # and national transposition measures
    base  = "https://eur-lex.europa.eu/rss/OJRSS_Series_L.xml"
    items = []
    seen: set[str] = set()

    keywords = ["data protection", "cybersecurity", "artificial intelligence", "financial services"]

    for kw in keywords:
        print(f"  EUR-Lex [{kw}]", end=" ... ", flush=True)
        if dry_run:
            print("skip")
            continue
        try:
            resp = requests.get(
                base,
                params={"expression": kw, "lang": "en"},
                headers=HEADERS,
                timeout=TIMEOUT,
            )
            resp.raise_for_status()
            import feedparser
            feed = feedparser.parse(resp.text)

            count = 0
            for entry in feed.entries:
                link  = getattr(entry, "link", "") or ""
                title = getattr(entry, "title", "") or ""
                if not link or link in seen:
                    continue
                seen.add(link)

                # Try to infer country from URL
                country_code = ""
                for code in NLEX_COUNTRIES:
                    if f"/{code.lower()}/" in link.lower() or f"-{code.lower()}" in link.lower():
                        country_code = code
                        break

                country_name = NLEX_COUNTRIES.get(country_code, "EU Member State")
                items.append(_regulation_stub(
                    id               = "EURLEX_" + _slug(title),
                    short_name       = _short(title),
                    name             = title,
                    authority        = country_name or "European Union",
                    jurisdiction     = country_name or "European Union",
                    enforcement_region = "eu",
                    domain           = _guess_domain(title),
                    status           = "active",
                    url              = link,
                    summary          = getattr(entry, "summary", ""),
                    source           = "eur-lex.europa.eu",
                ))
                count += 1

            print(f"{count} items")
            time.sleep(1.0)
        except Exception as exc:
            print(f"FAILED ({exc})")

    return items


# ---------------------------------------------------------------------------
# Source 9 — UChicago Foreign & International Law Library
# ---------------------------------------------------------------------------
def scrape_uchicago(dry_run: bool = False) -> list[dict]:
    """Scrapes UChicago D'Angelo Law Library foreign and international law guide."""
    url   = "https://guides.lib.uchicago.edu/c.php?g=1089597&p=7946266"
    items = []

    print(f"  UChicago Law Library", end=" … ", flush=True)
    if dry_run:
        print("skip")
        return []

    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        count = 0
        for a in soup.find_all("a", href=True):
            title = a.get_text(strip=True)
            href  = urljoin(url, a["href"])
            if not title or len(title) < 10:
                continue
            if not any(kw in title.lower() for kw in [
                "data", "privacy", "cyber", "ai", "fintech", "banking",
                "environmental", "labor", "telecommunications", "digital",
            ]):
                continue

            items.append(_regulation_stub(
                id               = "UCH_" + _slug(title),
                short_name       = _short(title),
                name             = title,
                authority        = "UChicago Law Library",
                jurisdiction     = "Multiple",
                enforcement_region = "international",
                domain           = _guess_domain(title) or ["data_privacy"],
                status           = "active",
                url              = href,
                source           = "lib.uchicago.edu",
            ))
            count += 1
            if count >= 25:
                break

        print(f"{len(items)} items")
    except Exception as exc:
        print(f"FAILED ({exc})")

    return items


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------
import re  # already imported at top, re-assertion for clarity

_DOMAIN_HINTS = {
    "data_privacy":    ["privacy", "data protection", "gdpr", "personal data", "pipl", "lgpd", "ccpa", "personal information"],
    "cybersecurity":   ["cybersecurity", "cyber security", "infosec", "information security", "network security", "nis2", "cisa"],
    "finance":         ["banking", "financial services", "fintech", "aml", "securities", "basel", "mifid", "fatf", "money laundering", "payment"],
    "health":          ["health", "hipaa", "pharmaceutical", "medical device", "clinical", "healthcare"],
    "ai_governance":   ["artificial intelligence", "machine learning", "algorithm", "automated decision"],
    "environment":     ["environment", "climate change", "carbon", "emission", "sustainability", "esg", "pollution"],
    "labor":           ["labor", "labour", "employment", "worker rights", "ilo", "wage", "workplace"],
    "critical_infrastructure": ["critical infrastructure", "energy grid", "power grid", "telecom network", "water system"],
    # maritime requires unambiguous terms — never match "port" alone (too generic)
    "maritime":        ["maritime", " shipping ", "vessel safety", "imo ", "marpol", "solas", "seafarer", "ballast water", "ship security"],
}

def _guess_domain(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for domain, hints in _DOMAIN_HINTS.items():
        if any(h in text_lower for h in hints):
            found.append(domain)
    # Return empty rather than defaulting to data_privacy — callers should decide fallback
    return found


_COUNTRY_REGION_MAP = {
    "european-union": "eu",
    "france": "eu",
    "germany": "eu",
    "austria": "eu",
    "spain": "eu",
    "italy": "eu",
    "netherlands": "eu",
    "poland": "eu",
    "sweden": "eu",
    "denmark": "eu",
    "finland": "eu",
    "belgium": "eu",
    "portugal": "eu",
    "ireland": "eu",
    "greece": "eu",
    "united states": "us_federal",
    "us": "us_federal",
    "canada": "canada",
    "china": "china",
    "brazil": "latam",
    "mexico": "latam",
    "argentina": "latam",
    "colombia": "latam",
    "chile": "latam",
    "australia": "australia",
    "new zealand": "australia",
    "israel": "israel",
    "saudi-arabia": "mena",
    "saudi arabia": "mena",
    "uae": "mena",
    "united arab emirates": "mena",
    "south-africa": "africa",
    "south africa": "africa",
    "nigeria": "africa",
    "kenya": "africa",
    "japan": "international",
    "india": "international",
    "russia": "international",
    "united-kingdom": "international",
    "united kingdom": "international",
}

def _country_to_region(country: str) -> str:
    return _COUNTRY_REGION_MAP.get(country.lower(), "international")


def _slug(text: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "_", text.lower())
    return text[:40].strip("_")


def _short(text: str, max_len: int = 20) -> str:
    words = text.split()
    result = ""
    for w in words:
        candidate = (result + " " + w).strip()
        if len(candidate) > max_len:
            break
        result = candidate
    return result or text[:max_len]


# ---------------------------------------------------------------------------
# Source registry
# ---------------------------------------------------------------------------
SOURCES = {
    "regulations_gov":   scrape_regulations_gov,
    "library_of_congress": scrape_loc_nations,
    "dla_piper":         scrape_dla_piper,
    "climate_laws":      scrape_climate_laws,
    "pri_regulation":    scrape_pri_regulation,
    "saicm_pdf":         scrape_saicm_pdf,
    "georgetown_law":    scrape_georgetown_law,
    "nlex":              scrape_nlex,
    "uchicago":          scrape_uchicago,
}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Scrape regulatory data from multiple sources.")
    parser.add_argument(
        "--source", choices=list(SOURCES.keys()), default=None,
        help="Run a single source (default: all)"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print what would be fetched without making network requests"
    )
    args = parser.parse_args()

    sources_to_run = (
        {args.source: SOURCES[args.source]} if args.source else SOURCES
    )

    print(f"ComplianceMap Regulation Scraper — {TODAY}")
    if args.dry_run:
        print("DRY RUN — no network requests will be made")
    print()

    total = 0
    for key, fn in sources_to_run.items():
        print(f"[{key}]")
        try:
            items = fn(dry_run=args.dry_run)
            if items and not args.dry_run:
                _save(key, items)
                total += len(items)
        except Exception as exc:
            print(f"  ERROR: {exc}")
        print()

    print(f"Done. {total} total items written to {SCRAPED_DIR}/")
    print()
    print("Next steps:")
    print("  1. Review files in data/scraped/")
    print("  2. Edit/curate items you want to add")
    print("  3. Merge into data/regulations.json")


if __name__ == "__main__":
    main()
