"""
enrich_requirements.py — Enrich regulation key_requirements with AI-generated guidance.

Adds 4 new fields to every structured requirement in data/regulations.json:
  - how_to_meet:         Step-by-step internal implementation guide
  - internal_actions:   What to request from internal IT/Legal/HR/Finance teams
  - vendor_actions:     What to request from third-party vendors and processors
  - compliance_evidence: Specific artefacts that prove compliance

Usage (local):
  set ANTHROPIC_API_KEY=<your-key>
  python scripts/enrich_requirements.py

Safe to re-run — skips requirements that already have all 4 fields populated.
Appends fields only; never overwrites or removes existing data.

Cost estimate: ~800 requirements × ~250 output tokens ≈ $0.16 total (Haiku).
"""

import json
import sys
import os
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

try:
    import anthropic
except ImportError:
    raise SystemExit("Missing dependency: run  pip install anthropic")

# ---------------------------------------------------------------------------
REGS_FILE  = Path(__file__).parent.parent / "data" / "regulations.json"
NEW_FIELDS = ("how_to_meet", "internal_actions", "vendor_actions", "compliance_evidence")
MODEL      = "claude-haiku-4-5-20251001"
MAX_TOKENS = 4096
RATE_DELAY = 0.4   # seconds between API calls (gentle rate limiting)
# ---------------------------------------------------------------------------


def _needs_enrichment(req: dict) -> bool:
    """True if req is a structured object that is missing any of the 4 new fields."""
    if not isinstance(req, dict):
        return False
    return any(not req.get(f) for f in NEW_FIELDS)


def _build_prompt(reg: dict, to_enrich: list) -> str:
    reqs_json = json.dumps(
        [{"id": r["id"], "text": r["text"], "control_theme": r.get("control_theme", "")}
         for r in to_enrich],
        indent=2, ensure_ascii=False
    )
    return f"""You are an expert compliance consultant. For each requirement of "{reg['name']}" ({reg.get('jurisdiction', '')}) listed below, provide concise, professional guidance.

Return ONLY a valid JSON array — no markdown, no code fences, no explanation text.
Each element must contain exactly these keys:
  "id"                  — copy verbatim from input, do not change
  "how_to_meet"         — 2-3 numbered implementation steps the organisation must take internally
  "internal_actions"    — specific deliverables or records to request from internal IT/Legal/HR/Finance teams
  "vendor_actions"      — specific documents or commitments to formally request from third-party vendors and service providers
  "compliance_evidence" — the specific artefacts (documents, logs, certificates, signed agreements) that prove compliance to a regulator or auditor

Rules:
- Be concise (2-4 sentences per field). Plain professional English.
- No generic advice like "implement policies". Name the actual artefact or step.
- "internal_actions" and "vendor_actions" must each start with the team/party name followed by a colon (e.g. "IT team: provide access log exports…").

Requirements to enrich:
{reqs_json}"""


def _strip_fences(raw: str) -> str:
    """Remove markdown code fences if Claude added them despite instructions."""
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        # parts[1] is the fenced block content (may start with 'json\n')
        body = parts[1]
        if body.startswith("json"):
            body = body[4:]
        return body.strip()
    return raw


def _enrich_regulation(client: anthropic.Anthropic, reg: dict) -> int:
    to_enrich = [r for r in reg.get("key_requirements", [])
                 if isinstance(r, dict) and _needs_enrichment(r)]
    if not to_enrich:
        return 0

    prompt = _build_prompt(reg, to_enrich)
    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = _strip_fences(response.content[0].text)
    enriched: list = json.loads(raw)

    enriched_by_id = {e["id"]: e for e in enriched if isinstance(e, dict)}
    merged = 0
    for req in reg["key_requirements"]:
        if not isinstance(req, dict):
            continue
        e = enriched_by_id.get(req.get("id"))
        if not e:
            continue
        for field in NEW_FIELDS:
            if not req.get(field) and e.get(field):
                req[field] = e[field]
                merged += 1

    return len(to_enrich)


def main() -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise SystemExit(
            "ANTHROPIC_API_KEY environment variable not set.\n"
            "  Windows: set ANTHROPIC_API_KEY=sk-ant-...\n"
            "  Unix:    export ANTHROPIC_API_KEY=sk-ant-..."
        )

    client = anthropic.Anthropic(api_key=api_key)

    print(f"Reading {REGS_FILE} …")
    data = json.loads(REGS_FILE.read_text(encoding="utf-8"))
    regs = data if isinstance(data, list) else data.get("regulations", [])

    total_regs_enriched = 0
    total_reqs_enriched = 0
    errors = 0

    for reg in regs:
        short = reg.get("short_name", reg.get("id", "?"))
        reqs  = reg.get("key_requirements", [])
        structured = [r for r in reqs if isinstance(r, dict)]

        if not structured:
            continue

        to_enrich = [r for r in structured if _needs_enrichment(r)]
        if not to_enrich:
            print(f"  {short:<22} — already enriched ({len(structured)} reqs)")
            continue

        print(f"  {short:<22} — enriching {len(to_enrich)}/{len(structured)} reqs … ", end="", flush=True)
        try:
            n = _enrich_regulation(client, reg)
            total_reqs_enriched += n
            total_regs_enriched += 1
            print(f"done")
        except json.JSONDecodeError as exc:
            errors += 1
            print(f"WARN: JSON parse error — {exc}")
        except anthropic.APIError as exc:
            errors += 1
            print(f"WARN: API error — {exc}")
        except Exception as exc:
            errors += 1
            print(f"WARN: {exc}")

        time.sleep(RATE_DELAY)

    # Write updated JSON back (pretty-printed, UTF-8, no ASCII escaping)
    REGS_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8"
    )

    print()
    print(f"Done. Enriched {total_reqs_enriched} requirements across {total_regs_enriched} regulations.")
    if errors:
        print(f"  {errors} regulation(s) had errors — re-run the script to retry them.")
    print(f"Updated: {REGS_FILE}")


if __name__ == "__main__":
    main()
