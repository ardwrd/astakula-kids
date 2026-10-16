#!/usr/bin/env python3
"""Generate exactly three isolated kid-friendly Eleven v4 samples; no production replacements."""
import argparse
import hashlib
import json
import os
from pathlib import Path
from generate_v4_candidates import convert

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "public/audio/previews/indo-v4-kids-tempo-01"
CATALOG = DEST / "samples.json"
MANIFEST = DEST / "manifest.json"

def validate():
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    if (data.get("model_id") != "eleven_v4"
        or data.get("voice_id") != "wtqqNhC5H27DEv1Ojo4B"
        or data.get("language_code") != "id"):
        raise ValueError("Unexpected sample voice or model")
    clips = data.get("samples", [])
    if len(clips) != 3 or [clip["id"] for clip in clips] != [
        "instruksi-dadu", "pertanyaan-warna", "pujian"]:
        raise ValueError("Preview must contain precisely the three sample IDs")
    for clip in clips:
        text = clip["text"]
        if not isinstance(text, str) or len(text) < 20:
            raise ValueError("Missing sample script")
        if "[slowly]" not in text or "[pause]" not in text or "<" in text:
            raise ValueError("Eleven v4 sample must contain pacing tags")
    return data

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    data = validate()
    if args.validate:
        print("VALID: three isolated Eleven v4 child-friendly scripts.")
        return
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise SystemExit("ELEVENLABS_API_KEY missing in GitHub Actions.")
    entries = {}
    for clip in data["samples"]:
        path = DEST / (clip["id"] + ".mp3")
        if not path.exists():
            print("Generating preview:", clip["id"], flush=True)
            path.write_bytes(convert(clip["text"], key))
        raw = path.read_bytes()
        if len(raw) < 512:
            raise ValueError("Corrupt preview " + clip["id"])
        entries[clip["id"]] = {"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
        MANIFEST.write_text(json.dumps({
            "version": data["version"], "voice_id": data["voice_id"],
            "model_id": data["model_id"], "required_count": 3,
            "generated_count": len(entries), "entries": entries,
            "purpose": "Audition only; production audio untouched."
        }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("READY:", len(entries), "/3 isolated preview MP3s.", flush=True)

if __name__ == "__main__":
    main()
