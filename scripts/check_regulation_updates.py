"""
check_regulation_updates.py — Monthly regulation content-change detector.
Run manually or via GitHub Actions (.github/workflows/check-regulation-updates.yml).

For each regulation it:
  1. Fetches the official URL (HEAD first, then GET if ETag/Last-Modified changed).
  2. Computes a SHA-256 hash of the stripped HTML body.
  3. Compares to the stored hash in data/regulation-hashes.json.
  4. If changed → records a change event and updates the hash.
  5. Creates a monthly snapshot of data/regulations.json.
  6. Appends a summary to data/versions/manifest.json.
  7. Appends a CHANGELOG.md entry if any changes were detected.

Dependencies: pip install requests beautifulsoup4
"""

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    raise SystemExit("Missing dependency: run  pip install requests beautifulsoup4")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT          = Path(__file__).parent.parent
REGS_FILE     = ROOT / "data" / "regulations.json"
HASHES_FILE   = ROOT / "data" / "regulation-hashes.json"
VERSIONS_DIR   = ROOT / "data" / "versions"
MANIFEST_FILE  = VERSIONS_DIR / "manifest.json"
CHANGELOG      = ROOT / "CHANGELOG.md"
CHANGES_FILE   = ROOT / "data" / "regulation-changes.json"

VERSIONS_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "ComplianceMap-Bot/1.1 (regulation update checker; +https://github.com)"
}
REQUEST_TIMEOUT = 20   # seconds


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _sha256(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()


def _fetch_and_hash(url: str) -> tuple[str | None, str]:
    """Return (hash, status) where status is 'ok', 'unchanged', 'error'."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        # Strip scripts/styles for a stable content hash
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        return _sha256(text), "ok"
    except requests.exceptions.Timeout:
        return None, "timeout"
    except requests.exceptions.HTTPError as e:
        return None, f"http_{e.response.status_code}"
    except Exception as e:
        return None, f"error: {e}"


def _load_json(path: Path, default):
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return default


def _save_json(path: Path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    now_str  = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    month    = datetime.now(timezone.utc).strftime("%Y-%m")
    today    = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    regs_data = _load_json(REGS_FILE, {})
    regulations = regs_data.get("regulations", [])
    if not regulations:
        print("ERROR: Could not load regulations from", REGS_FILE)
        sys.exit(1)

    hashes = _load_json(HASHES_FILE, {})

    changes:  list[dict] = []
    checked:  int = 0
    errors:   int = 0

    for reg in regulations:
        reg_id = reg["id"]
        url    = reg.get("url", "")
        if not url:
            continue

        print(f"  [{reg_id}] {url[:70]}…", end=" ", flush=True)
        new_hash, status = _fetch_and_hash(url)
        checked += 1

        stored = hashes.get(reg_id, {})

        if new_hash is None:
            print(f"SKIP ({status})")
            errors += 1
            hashes[reg_id] = {
                **stored,
                "url":           url,
                "last_checked":  today,
                "last_status":   status,
            }
            continue

        old_hash = stored.get("hash")
        if old_hash and old_hash != new_hash:
            print("CHANGED")
            changes.append({
                "regulation_id": reg_id,
                "regulation":    reg.get("short_name", reg_id),
                "url":           url,
                "old_hash":      old_hash,
                "new_hash":      new_hash,
                "detected_at":   now_str,
            })
        elif not old_hash:
            print("NEW (first check)")
        else:
            print("unchanged")

        hashes[reg_id] = {
            "url":           url,
            "hash":          new_hash,
            "last_checked":  today,
            "last_status":   "ok",
        }

    # Save updated hashes
    _save_json(HASHES_FILE, hashes)
    print(f"\nChecked {checked} regulations. Changes: {len(changes)}. Errors: {errors}.")

    # -------------------------------------------------------------------
    # Create monthly snapshot
    # -------------------------------------------------------------------
    snapshot_file = VERSIONS_DIR / f"{month}.json"
    _save_json(snapshot_file, regs_data)
    print(f"Snapshot saved → {snapshot_file.name}")

    # -------------------------------------------------------------------
    # Update manifest
    # -------------------------------------------------------------------
    manifest = _load_json(MANIFEST_FILE, {"snapshots": []})
    # Remove existing entry for this month (replace it)
    manifest["snapshots"] = [s for s in manifest["snapshots"] if s.get("month") != month]
    manifest["snapshots"].append({
        "month":            month,
        "file":             f"{month}.json",
        "regulation_count": len(regulations),
        "changes":          changes,
        "checked_at":       now_str,
    })
    # Keep newest first
    manifest["snapshots"].sort(key=lambda s: s["month"], reverse=True)
    _save_json(MANIFEST_FILE, manifest)

    # -------------------------------------------------------------------
    # Update regulation-changes.json (read by the frontend alert banner)
    # -------------------------------------------------------------------
    existing_changes = _load_json(CHANGES_FILE, [])
    existing_keys = {f"{c['regulation_id']}:{c.get('detected_at', '')}" for c in existing_changes}
    for c in changes:
        key = f"{c['regulation_id']}:{c.get('detected_at', '')}"
        if key not in existing_keys:
            existing_changes.append(c)
    existing_changes.sort(key=lambda c: c.get("detected_at", ""), reverse=True)
    _save_json(CHANGES_FILE, existing_changes[:100])
    print(f"regulation-changes.json updated ({len(existing_changes)} total changes tracked).")

    # -------------------------------------------------------------------
    # Update CHANGELOG.md if there are changes
    # -------------------------------------------------------------------
    if changes:
        change_lines = "\n".join(
            f"  - {c['regulation']} (`{c['regulation_id']}`): content changed at {c['url']}"
            for c in changes
        )
        entry = f"\n## [{today}] Monthly Check — {len(changes)} change(s) detected\n\n{change_lines}\n"

        if CHANGELOG.exists():
            existing = CHANGELOG.read_text(encoding="utf-8")
            # Insert after the first heading line
            lines = existing.splitlines(keepends=True)
            insert_at = 0
            for i, line in enumerate(lines):
                if line.startswith("#"):
                    insert_at = i + 1
                    break
            lines.insert(insert_at, entry)
            CHANGELOG.write_text("".join(lines), encoding="utf-8")
        else:
            CHANGELOG.write_text(f"# CHANGELOG\n{entry}", encoding="utf-8")

        print(f"CHANGELOG.md updated with {len(changes)} change(s).")


if __name__ == "__main__":
    main()
