#!/usr/bin/env python3
"""Stage new Eleven v4 audio for interactive games, never touching approved legacy MP3s."""
import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from generate_v4_candidates import convert, VOICE_ID

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/data/activitiesNarrationV4.json"
DEST = ROOT / "public/audio/activities/indo-v4-v1"
MANIFEST = DEST / "manifest.json"
ALLOWED_TAGS = {"gently", "warmly", "happily", "curious"}

def validate():
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    assert data["voice_id"] == VOICE_ID, "Voice does not match approved narrator"
    assert data["model_id"] == "eleven_v4" and data["language_code"] == "id"
    clips = data["clips"]
    if not isinstance(clips, dict) or len(clips) != 38:
        raise ValueError("Expected exactly 38 additional narrated interactions")
    for name, script in clips.items():
        if not re.fullmatch(r"activities/[a-z0-9/-]+", name) or ".." in name:
            raise ValueError("Unsafe clip name " + name)
        if not isinstance(script, str) or not script.strip():
            raise ValueError("Missing speech " + name)
        if any(t not in ALLOWED_TAGS for t in re.findall(r"\[([^]]+)\]", script)):
            raise ValueError("Unsupported V4 tag " + name)
    return data

def save_manifest(data):
    clips = data["clips"]
    entries = {}
    for name in clips:
        path = DEST / (name + ".mp3")
        if path.exists():
            raw = path.read_bytes()
            if len(raw) < 512:
                raise ValueError("Incomplete candidate " + name)
            entries[name] = {"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
    DEST.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({
        "version": data["version"], "model": data["model_id"],
        "voice_id": data["voice_id"], "status": "STAGED_FOR_REVIEW",
        "generated_count": len(entries), "required_count": len(clips),
        "entries": entries
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return len(entries)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate", action="store_true")
    parser.add_argument("--limit", type=int, default=38)
    args = parser.parse_args()
    data = validate()
    print("VALID: 38 additional Eleven v4 scripts; approved Voice ID.", flush=True)
    if args.validate: return
    if not 1 <= args.limit <= 38: parser.error("limit must be 1..38")
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key: sys.exit("Missing GitHub Actions TTS secret")
    created = 0
    try:
        for name, spoken in data["clips"].items():
            path = DEST / (name + ".mp3")
            if path.is_file(): continue
            if created >= args.limit: break
            path.parent.mkdir(parents=True, exist_ok=True)
            raw = convert(spoken, api_key)
            path.write_bytes(raw)
            created += 1
            print("Generated:", name, flush=True)
    finally:
        count = save_manifest(data)
        print(f"Activity candidates: {count}/38. Previously approved 38 clips unchanged.", flush=True)

if __name__ == "__main__":
    main()
