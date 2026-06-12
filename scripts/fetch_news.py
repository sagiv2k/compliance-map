"""
fetch_news.py — Fetch regulatory news from official RSS feeds + advisory web pages,
then enrich new articles with Claude Haiku (AI summary, regulation tags, priority).

Dependencies: pip install feedparser requests beautifulsoup4 anthropic
Set ANTHROPIC_API_KEY environment variable to enable AI enrichment (optional).
"""

import json
import hashlib
import re
import sys
import os
from datetime import datetime, timezone
from pathlib import Path

# Ensure stdout uses UTF-8 so Hebrew path names and non-ASCII chars print correctly
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

try:
    import feedparser
except ImportError:
    raise SystemExit("Missing dependency: run  pip install feedparser requests beautifulsoup4 anthropic")

try:
    import requests
    from bs4 import BeautifulSoup
    _BS4_AVAILABLE = True
except ImportError:
    _BS4_AVAILABLE = False

try:
    import anthropic as _anthropic_module
    _ANTHROPIC_AVAILABLE = True
except ImportError:
    _ANTHROPIC_AVAILABLE = False

# ---------------------------------------------------------------------------
# RSS / Atom feed definitions
# Each entry may include:
#   url               — primary feed URL (tried first)
#   _fallback_urls    — list of alternative URLs tried if primary returns 0 entries
#   trust_source      — skip relevance filter (use for non-English sources)
# ---------------------------------------------------------------------------
FEEDS = [
    # --- EU ---
    {
        "source":        "EDPB",
        "url":           "https://www.edpb.europa.eu/feed/news_en",
        "_fallback_urls": [
            "https://www.edpb.europa.eu/news/news_en.xml",
            "https://edpb.europa.eu/news/news_en.xml",
        ],
        "categories":    ["data_privacy"],
        "jurisdictions": ["eu"],
    },
    {
        "source":        "ENISA",
        "url":           "https://www.enisa.europa.eu/news/enisa-news/news/RSS",
        "_fallback_urls": [
            "https://www.enisa.europa.eu/news/enisa-news/RSS",
            "https://www.enisa.europa.eu/publications/rss",
        ],
        "categories":    ["cybersecurity"],
        "jurisdictions": ["eu"],
    },
    # --- US Federal ---
    {
        "source":        "CISA",
        "url":           "https://www.cisa.gov/uscert/ncas/alerts.xml",
        "categories":    ["cybersecurity", "critical_infrastructure"],
        "jurisdictions": ["us_federal"],
    },
    {
        "source":        "NIST",
        "url":           "https://www.nist.gov/news-events/news/rss.xml",
        "categories":    ["cybersecurity"],
        "jurisdictions": ["us_federal"],
    },
    {
        "source":        "FTC",
        "url":           "https://www.ftc.gov/feeds/press-release-rss.xml",
        "_fallback_urls": [
            "https://www.ftc.gov/feeds/news",
            "https://www.ftc.gov/news-events/news/press-releases/rss",
        ],
        "categories":    ["data_privacy"],
        "jurisdictions": ["us_federal"],
    },
    {
        "source":        "SEC",
        "url":           "https://www.sec.gov/rss/news/pressreleases.rss",
        "_fallback_urls": [
            "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=press&dateb=&owner=include&count=40&output=atom",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["us_federal"],
    },
    {
        "source":        "OCC",
        "url":           "https://www.occ.gov/news-issuances/rss/occ-news.xml",
        "_fallback_urls": [
            "https://www.occ.gov/rss/occ-news.xml",
            "https://www.occ.gov/tools-forms/tools/rss-feeds/occ-press-releases.xml",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["us_federal"],
    },
    {
        "source":        "CFPB",
        "url":           "https://www.consumerfinance.gov/about-us/newsroom/feed/",
        "categories":    ["finance", "data_privacy"],
        "jurisdictions": ["us_federal"],
    },
    {
        "source":        "FED",
        "url":           "https://www.federalreserve.gov/feeds/press_all.xml",
        "_fallback_urls": [
            "https://www.federalreserve.gov/feeds/press_monetary.xml",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["us_federal"],
    },
    # --- UK ---
    {
        "source":        "ICO",
        "url":           "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/rss",
        "_fallback_urls": [
            "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/rss/",
            "https://ico.org.uk/rss/all",
        ],
        "categories":    ["data_privacy"],
        "jurisdictions": ["eu"],
    },
    # --- International / Multi-jurisdiction ---
    {
        "source":        "BIS",
        "url":           "https://www.bis.org/rss/presstat.xml",
        "_fallback_urls": [
            "https://www.bis.org/rss/presspdf.xml",
            "https://www.bis.org/rss/speeches.xml",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["international"],
    },
    {
        "source":        "EBA",
        "url":           "https://www.eba.europa.eu/rss.xml",
        "_fallback_urls": [
            "https://www.eba.europa.eu/en/rss.xml",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["eu"],
    },
    {
        "source":        "IMO",
        "url":           "https://www.imo.org/en/pages/pressbriefingsrss.aspx",
        "_fallback_urls": [
            "https://www.imo.org/rss/rssnews.aspx",
            "https://www.imo.org/en/MediaCentre/rss/rssnews.aspx",
        ],
        "categories":    ["maritime"],
        "jurisdictions": ["international"],
    },
    {
        "source":        "ILO",
        "url":           "https://www.ilo.org/rss/iloNewsAndPress.rss",
        "_fallback_urls": [
            "https://www.ilo.org/global/about-the-ilo/newsroom/news/lang--en/rss.xml",
            "https://www.ilo.org/global/about-the-ilo/newsroom/lang--en/rss.xml",
        ],
        "categories":    ["labor"],
        "jurisdictions": ["international"],
    },
    {
        "source":        "FATF",
        "url":           "https://www.fatf-gafi.org/en/topics/fatf-recommendations.rss.xml",
        "_fallback_urls": [
            "https://www.fatf-gafi.org/en/publications.rss.xml",
            "https://www.fatf-gafi.org/rss/publications.rss",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["international"],
    },
    {
        "source":        "FSB",
        "url":           "https://www.fsb.org/feed/",
        "_fallback_urls": [
            "https://www.fsb.org/rss/",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["international"],
    },
    {
        "source":        "ANPD",
        "url":           "https://www.gov.br/anpd/pt-br/assuntos/noticias/RSS",
        "_fallback_urls": [
            "https://www.gov.br/anpd/pt-br/assuntos/noticias/rss.xml",
            "https://www.gov.br/anpd/pt-br/assuntos/RSS",
        ],
        "categories":    ["data_privacy"],
        "jurisdictions": ["latam"],
        "trust_source":  True,   # Portuguese — skip English keyword filter
    },
]

# ---------------------------------------------------------------------------
# Big Four advisory pages (HTML scrape — best-effort, no JS rendering)
# ---------------------------------------------------------------------------
BIG4_SCRAPERS = [
    {
        "source":        "PwC",
        "url":           "https://www.pwc.com/gx/en/services/advisory/regulatory.html",
        "_fallback_urls": [
            "https://www.pwc.com/gx/en/issues/regulation.html",
        ],
        "categories":    ["finance", "data_privacy"],
        "jurisdictions": ["international"],
    },
    {
        "source":        "Deloitte",
        "url":           "https://www2.deloitte.com/us/en/insights/industry/financial-services.html",
        "_fallback_urls": [
            "https://www2.deloitte.com/us/en/insights/topics/regulatory-environment.html",
            "https://www2.deloitte.com/us/en/insights/industry/financial-services/regulatory-considerations.html",
        ],
        "categories":    ["finance", "data_privacy"],
        "jurisdictions": ["international"],
    },
    {
        "source":        "EY",
        "url":           "https://www.ey.com/en_gl/insights",
        "_fallback_urls": [
            "https://www.ey.com/en_gl/insights/tax",
            "https://www.ey.com/en_gl/insights/financial-services",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["international"],
    },
    {
        "source":        "KPMG",
        "url":           "https://kpmg.com/xx/en/home/topics/regulatory.html",
        "_fallback_urls": [
            "https://kpmg.com/xx/en/home/insights/2024/02/regulatory-insights.html",
            "https://kpmg.com/xx/en/home/insights.html",
        ],
        "categories":    ["finance"],
        "jurisdictions": ["international"],
    },
]

# Minimum relevance keywords — articles must contain at least one
RELEVANCE_KEYWORDS = [
    "regulation", "compliance", "privacy", "data protection", "gdpr", "cybersecurity",
    "enforcement", "fine", "penalty", "breach", "personal data", "ai", "artificial intelligence",
    "security", "standard", "framework", "guideline", "directive", "law", "act",
    "maritime", "shipping", "vessel", "imo", "labor", "labour", "ilo", "anti-money",
    "aml", "kyc", "fatf", "financial crime", "sanctions", "esg", "climate", "sustainability",
    "banking", "capital", "basel", "solvency", "fintech", "crypto", "digital asset",
    "financial services", "supervisory", "supervisory authority", "rule", "order", "decree",
]

OUTPUT_FILE = Path(__file__).parent.parent / "data" / "news.json"
REGS_FILE   = Path(__file__).parent.parent / "data" / "regulations.json"
MAX_ITEMS       = 80   # total items kept in news.json
MAX_NEW_PER_RUN = 30   # cap on new articles sent to Claude per run (cost guard)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; ComplianceMapBot/1.0; "
        "+https://github.com/compliancemap/bot)"
    )
}


def _item_id(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:12]


def _strip_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _truncate(text: str, max_len: int = 280) -> str:
    text = text.strip()
    return text[:max_len] + "…" if len(text) > max_len else text


def _is_relevant(title: str, summary: str) -> bool:
    combined = (title + " " + summary).lower()
    return any(kw in combined for kw in RELEVANCE_KEYWORDS)


def _parse_date(entry) -> str:
    for attr in ("published_parsed", "updated_parsed"):
        t = getattr(entry, attr, None)
        if t:
            try:
                return datetime(*t[:6], tzinfo=timezone.utc).strftime("%Y-%m-%d")
            except Exception:
                pass
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _base_url(url: str) -> str:
    try:
        parts = url.split("/")
        return parts[0] + "//" + parts[2]
    except Exception:
        return ""


def _try_feed_urls(feed_cfg: dict) -> tuple[list, str]:
    """
    Try each URL with custom headers first; if that yields HTTP 403, retry without
    headers so feedparser's default UA is used (some servers block custom bots).
    Returns (entries, url_that_worked) or ([], last_error).
    """
    urls       = [feed_cfg["url"]] + feed_cfg.get("_fallback_urls", [])
    last_error = "no entries in any URL tried"

    for url in urls:
        # Attempt order: our User-Agent first, then feedparser's default UA on 403
        header_attempts = [_HEADERS, None]
        for req_headers in header_attempts:
            try:
                kw     = {"request_headers": req_headers} if req_headers else {}
                parsed = feedparser.parse(url, **kw)
                status = getattr(parsed, "status", None)

                if status == 403:
                    last_error = f"HTTP 403 (url: {url})"
                    # If we just tried with custom headers, loop to retry without them
                    continue

                if status and status >= 400:
                    last_error = f"HTTP {status}"
                    break   # don't retry same URL — move to next URL

                if parsed.entries:
                    return parsed.entries, url

                # 200 / no status but empty feed — stop retrying this URL
                last_error = f"HTTP {status or 'OK'} - 0 entries"
                break

            except Exception as exc:
                last_error = str(exc)
                break

    return [], last_error


def fetch_rss_feeds() -> dict[str, dict]:
    items: dict[str, dict] = {}

    for feed_cfg in FEEDS:
        source = feed_cfg["source"]
        trust  = feed_cfg.get("trust_source", False)
        print(f"  RSS  {source:<10} …", end=" ", flush=True)

        entries, url_or_err = _try_feed_urls(feed_cfg)

        if not entries:
            print(f"WARN empty feed [{url_or_err}]")
            continue

        count_total    = len(entries)
        count_relevant = 0

        for entry in entries:
            link = getattr(entry, "link", "") or ""
            if not link:
                continue
            item_id = _item_id(link)
            if item_id in items:
                continue

            title   = _strip_html(getattr(entry, "title",   ""))
            summary = _strip_html(
                getattr(entry, "summary", "") or
                getattr(entry, "description", "")
            )

            # trust_source bypasses relevance filtering (e.g. non-English feeds)
            if not trust and not _is_relevant(title, summary):
                continue

            items[item_id] = {
                "id":            item_id,
                "title":         title,
                "summary":       _truncate(summary),
                "url":           link,
                "published":     _parse_date(entry),
                "source":        source,
                "source_url":    _base_url(link),
                "categories":    feed_cfg["categories"],
                "jurisdictions": feed_cfg["jurisdictions"],
            }
            count_relevant += 1

        if trust:
            # Show all items accepted for trusted sources
            print(f"{count_relevant} items (trusted, no filter) / {count_total} in feed")
        elif count_relevant == 0:
            print(f"0 relevant  <- {count_total} items in feed, none matched keywords")
        else:
            print(f"{count_relevant} relevant / {count_total} in feed")

    return items


def fetch_advisory_pages() -> dict[str, dict]:
    """Best-effort HTML scrape of Big Four advisory pages (no JS rendering)."""
    if not _BS4_AVAILABLE:
        print("  [skip] beautifulsoup4 not installed — skipping advisory pages")
        return {}

    items: dict[str, dict] = {}
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    for cfg in BIG4_SCRAPERS:
        source = cfg["source"]
        print(f"  HTML {source:<10} …", end=" ", flush=True)

        urls      = [cfg["url"]] + cfg.get("_fallback_urls", [])
        resp      = None
        used_url  = ""

        for url in urls:
            try:
                r = requests.get(url, headers=_HEADERS, timeout=15)
                if r.status_code < 400:
                    resp     = r
                    used_url = url
                    break
            except Exception:
                continue

        if resp is None:
            print(f"FAILED (all {len(urls)} URL(s) returned errors)")
            continue

        try:
            soup  = BeautifulSoup(resp.text, "html.parser")
            count = 0
            seen_links: set[str] = set()
            base_origin = "/".join(used_url.split("/")[:3])

            for tag in soup.find_all("a", href=True):
                href  = tag["href"].strip()
                title = _strip_html(tag.get_text())

                if not title or len(title) < 15:
                    continue
                if not _is_relevant(title, ""):
                    continue

                # Normalise relative URLs
                if href.startswith("/"):
                    href = base_origin + href
                elif not href.startswith("http"):
                    continue

                if href in seen_links:
                    continue
                seen_links.add(href)

                item_id = _item_id(href)
                if item_id in items:
                    continue

                items[item_id] = {
                    "id":            item_id,
                    "title":         _truncate(title, 160),
                    "summary":       "",
                    "url":           href,
                    "published":     today,
                    "source":        source,
                    "source_url":    _base_url(href),
                    "categories":    cfg["categories"],
                    "jurisdictions": cfg["jurisdictions"],
                }
                count += 1
                if count >= 5:
                    break

            # Count all links on page for context
            all_links = len(soup.find_all("a", href=True))
            if count == 0:
                print(f"0 relevant  ← {all_links} links on page, none matched keywords")
            else:
                print(f"{count} items")

        except Exception as exc:
            print(f"FAILED ({exc})")

    return items


# ── AI enrichment ─────────────────────────────────────────────────────────────

def _build_reg_index() -> str:
    if not REGS_FILE.exists():
        return ""
    regs = json.loads(REGS_FILE.read_text(encoding="utf-8"))
    return "\n".join(
        f"{r['id']}: {r['short_name']} ({r.get('enforcement_region', '?')})"
        for r in regs
    )


def enrich_with_claude(articles: list) -> list:
    """
    Sends new articles to Claude Haiku in a single batch call.
    Adds ai_summary, regulation_ids, and priority to each article in-place.
    Falls back gracefully if the API call fails.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key or not _ANTHROPIC_AVAILABLE:
        print("  [skip] ANTHROPIC_API_KEY not set or anthropic not installed — skipping AI enrichment")
        for a in articles:
            a.setdefault("ai_summary", "")
            a.setdefault("regulation_ids", [])
            a.setdefault("priority", "medium")
        return articles

    reg_index = _build_reg_index()
    if not reg_index:
        print("  [skip] regulations.json not found — skipping AI enrichment")
        for a in articles:
            a.setdefault("ai_summary", "")
            a.setdefault("regulation_ids", [])
            a.setdefault("priority", "medium")
        return articles

    numbered = "\n\n".join(
        f"[{i}] SOURCE: {a['source']}\nTITLE: {a['title']}\nSUMMARY: {a.get('summary', '')}"
        for i, a in enumerate(articles)
    )

    prompt = f"""You are a regulatory compliance analyst. Analyze each numbered article and return a JSON array.

Available regulation IDs (use exact IDs only; return [] if none clearly match):
{reg_index}

For each article return exactly:
{{
  "index": <number>,
  "ai_summary": "<2 sentences on compliance impact, max 220 chars total>",
  "regulation_ids": ["<EXACT_ID>", ...],
  "priority": "high" | "medium" | "low"
}}

Priority guide:
- high   = enforcement action, fine issued, breach disclosed, binding requirement now effective
- medium = consultation open, draft rule, guidance published, industry warning
- low    = research paper, general update, scheduled review, minor clarification

Articles:
{numbered}

Return ONLY the JSON array. No markdown, no explanation."""

    try:
        client   = _anthropic_module.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()

        enriched = json.loads(raw)
        for item in enriched:
            idx = item.get("index")
            if isinstance(idx, int) and 0 <= idx < len(articles):
                articles[idx]["ai_summary"]     = item.get("ai_summary", "")
                articles[idx]["regulation_ids"] = item.get("regulation_ids", [])
                articles[idx]["priority"]       = item.get("priority", "medium")

        print(f"  Claude enriched {len(enriched)} articles.")

    except (json.JSONDecodeError, TypeError) as e:
        print(f"  [warn] Claude JSON parse error: {e} — falling back to defaults")
        for a in articles:
            a.setdefault("ai_summary", "")
            a.setdefault("regulation_ids", [])
            a.setdefault("priority", "medium")
    except Exception as e:
        print(f"  [warn] Claude API error: {e} — falling back to defaults")
        for a in articles:
            a.setdefault("ai_summary", "")
            a.setdefault("regulation_ids", [])
            a.setdefault("priority", "medium")

    return articles


def main():
    print("Fetching regulatory news…")
    print()

    print("[ RSS feeds ]")
    rss_items = fetch_rss_feeds()

    print()
    print("[ Big Four advisory pages ]")
    advisory_items = fetch_advisory_pages()

    # Merge all sources (RSS takes precedence over advisory for same URL)
    merged: dict[str, dict] = {**advisory_items, **rss_items}

    # Load existing items to preserve articles not re-fetched
    existing: list[dict] = []
    if OUTPUT_FILE.exists():
        try:
            existing = json.loads(
                OUTPUT_FILE.read_text(encoding="utf-8")
            ).get("items", [])
        except Exception:
            pass

    existing_ids = {item["id"] for item in existing}

    # Identify truly new articles (not seen before)
    new_articles = [v for k, v in merged.items() if k not in existing_ids]
    new_articles  = new_articles[:MAX_NEW_PER_RUN]

    print()
    print(f"[ AI enrichment ] {len(new_articles)} new articles")
    if new_articles:
        new_articles = enrich_with_claude(new_articles)

    # Rebuild merged dict with enriched new items
    enriched_map = {a["id"]: a for a in new_articles}
    for item in existing:
        if item["id"] not in enriched_map:
            enriched_map[item["id"]] = item

    final = sorted(enriched_map.values(), key=lambda x: x["published"], reverse=True)[:MAX_ITEMS]

    output = {
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "items":        final,
    }

    OUTPUT_FILE.write_text(
        json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print()
    print(f"Saved {len(final)} articles -> {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
