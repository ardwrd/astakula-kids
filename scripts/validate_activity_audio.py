#!/usr/bin/env python3
"""Validate all approved activity narration; allow only staged new worksheet cues."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
catalog = json.loads((root / "src/data/activityNarrationV4.json").read_text(encoding="utf-8"))
base = root / "public/audio/activities/indo-v4-v1"
manifest = json.loads((base / "manifest.json").read_text(encoding="utf-8"))
expected = set(catalog["clips"])
legacy = [key for key in catalog["clips"] if not key.startswith(("instructions/vowel-colors", "instructions/dice-match", "instructions/connect-dots", "instructions/number-paint", "instructions/veggie-baskets", "vowel/"))]
entries = manifest["entries"]

if manifest.get("voice_id") != catalog["voice_id"] or manifest.get("model_id") != catalog["model_id"]:
    raise SystemExit("Incorrect activity narrator voice/model")
if len(legacy) != 48 or not set(legacy).issubset(entries):
    raise SystemExit("An existing approved activity clip is missing")
if not set(entries).issubset(expected):
    raise SystemExit("Unexpected voice clip in manifest")
if manifest.get("generated_count") != len(entries):
    raise SystemExit("Invalid generated clip count")
if manifest.get("required_count") not in (48, len(expected)):
    raise SystemExit("Invalid manifest required_count")
for key in entries:
    target = base / (key + ".mp3")
    if not target.exists():
        raise SystemExit("Missing audio: " + key)
    raw = target.read_bytes()
    if len(raw) < 512 or len(raw) != entries[key]["bytes"]:
        raise SystemExit("Invalid audio size: " + key)
    if hashlib.sha256(raw).hexdigest() != entries[key]["sha256"]:
        raise SystemExit("Audio hash mismatch: " + key)
pending = expected - set(entries)
if pending:
    assert pending.issubset(set(catalog["clips"]) - set(legacy))
    print(f"VALID: {len(entries)}/{len(expected)} Eleven v4 clips; {len(pending)} new worksheet cues queued for generation")
else:
    print(f"VALID: {len(entries)}/{len(expected)} Eleven v4 clips")
