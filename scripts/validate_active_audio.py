#!/usr/bin/env python3
"""Check the active audio revision is complete before publishing Astakula Kids."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "src/data/audioRevision.json").read_text(encoding="utf-8"))
KEYS = json.loads((ROOT / "src/data/audioManifest.json").read_text(encoding="utf-8"))["keys"]
EXPECTED = set(KEYS)
if len(EXPECTED) != 38:
    raise SystemExit("Expected exactly 38 production audio keys")

base = CONFIG.get("basePath", "")
revision = CONFIG.get("id")
if not CONFIG.get("approved"):
    raise SystemExit("Active audio revision lacks explicit approval")
if revision == "legacy-v2":
    if base != "audio/generated/":
        raise SystemExit("Legacy revision must use its original audio path")
    missing = [key for key in KEYS if not (ROOT / "public" / base / (key + ".mp3")).is_file()]
    if missing:
        raise SystemExit("Missing original audio: " + ", ".join(missing))
    print("Approved production audio: legacy-v2, 38/38, original files retained.")
elif revision == "indo-v4-v1":
    if base != "audio/candidates/indo-v4-v1/":
        raise SystemExit("V4 revision must use its isolated candidate path")
    location = ROOT / "public" / base
    manifest_path = location / "manifest.json"
    if not manifest_path.exists():
        raise SystemExit("Cannot activate v4: no candidate manifest")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    entries = manifest.get("entries", {})
    if (manifest.get("model") != "eleven_v4" or
        manifest.get("generated_count") != 38 or
        manifest.get("required_count") != 38 or
        set(entries) != EXPECTED):
        raise SystemExit("Cannot activate v4: candidate audio is not 38/38")
    for key in KEYS:
        path = location / (key + ".mp3")
        if not path.is_file():
            raise SystemExit("Missing candidate: " + key)
        raw = path.read_bytes()
        if len(raw) < 512 or hashlib.sha256(raw).hexdigest() != entries[key]["sha256"]:
            raise SystemExit("Candidate checksum/size mismatch: " + key)
    print("Approved production audio: indo-v4-v1, 38/38, SHA-256 valid.")
else:
    raise SystemExit("Unrecognized audio revision: " + str(revision))
