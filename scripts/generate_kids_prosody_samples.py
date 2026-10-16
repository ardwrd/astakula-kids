#!/usr/bin/env python3
"""Generate 3 expressive Eleven v4 previews; never modify any production audio."""
import argparse
import hashlib
import json
import os
from pathlib import Path
from generate_v4_candidates import convert

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/audio/previews/indo-v4-kids-prosody-02"
CATALOG = OUT / "samples.json"
MANIFEST = OUT / "manifest.json"
NAMES = ["instruksi-dadu", "pertanyaan-warna", "pujian"]

def validate():
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    if (data.get("model_id") != "eleven_v4" or
        data.get("voice_id") != "wtqqNhC5H27DEv1Ojo4B" or
        data.get("language_code") != "id"):
        raise ValueError("Unexpected voice or model")
    samples = data.get("samples", [])
    if [entry.get("id") for entry in samples] != NAMES:
        raise ValueError("Exactly three uniquely named samples required")
    for entry in samples:
        script = entry.get("text", "")
        if len(script.strip()) < 15 or "<" in script or ">" in script:
            raise ValueError("Invalid narration script")
        if entry["id"] == "pujian" and any(tag in script for tag in ("[pause]", "[slowly]", "...")):
            raise ValueError("Praise must retain natural, upbeat rhythm")
        if entry["id"] == "pertanyaan-warna" and "?" not in script:
            raise ValueError("Question needs rising question punctuation")
    return data

def save_manifest(data, entries):
    MANIFEST.write_text(json.dumps({
        "version": data["version"], "model_id": data["model_id"],
        "voice_id": data["voice_id"], "required_count": 3,
        "generated_count": len(entries), "entries": entries,
        "production_replacement": False
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    data = validate()
    if args.validate:
        print("VALID: three distinct prosody scripts, lively praise preserved.")
        return
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise SystemExit("Missing ELEVENLABS_API_KEY secret")
    OUT.mkdir(parents=True, exist_ok=True)
    entries = {}
    try:
        for sample in data["samples"]:
            target = OUT / (sample["id"] + ".mp3")
            if not target.exists():
                print("Generating:", sample["id"], flush=True)
                target.write_bytes(convert(sample["text"], key))
            audio = target.read_bytes()
            if len(audio) < 512:
                raise ValueError("Invalid MP3 for " + sample["id"])
            entries[sample["id"]] = {
                "sha256": hashlib.sha256(audio).hexdigest(), "bytes": len(audio)
            }
            save_manifest(data, entries)
    finally:
        save_manifest(data, entries)
        print("Staged:", len(entries), "of 3", flush=True)

if __name__ == "__main__":
    main()
