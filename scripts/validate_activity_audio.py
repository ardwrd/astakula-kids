#!/usr/bin/env python3
"""Verify every Indonesian Eleven v4 clip, including all worksheet cues."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
catalog = json.loads((root / "src/data/activityNarrationV4.json").read_text(encoding="utf-8"))
base = root / "public/audio/activities/indo-v4-v1"
manifest = json.loads((base / "manifest.json").read_text(encoding="utf-8"))
expected = set(catalog["clips"])
entries = manifest["entries"]

if manifest.get("voice_id") != catalog["voice_id"] or manifest.get("model_id") != catalog["model_id"]:
    raise SystemExit("Incorrect narrator voice/model")
if expected != set(entries) or manifest.get("required_count") != len(expected) or manifest.get("generated_count") != len(expected):
    raise SystemExit("Activity narration is incomplete or mismatched")
for key in expected:
    target = base / (key + ".mp3")
    if not target.exists():
        raise SystemExit("Missing audio: " + key)
    raw = target.read_bytes()
    if len(raw) < 512 or len(raw) != entries[key]["bytes"]:
        raise SystemExit("Invalid audio size: " + key)
    if hashlib.sha256(raw).hexdigest() != entries[key]["sha256"]:
        raise SystemExit("Audio hash mismatch: " + key)
print(f"VALID: {len(expected)}/{len(expected)} additional Eleven v4 clips")
