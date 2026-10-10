#!/usr/bin/env python3
"""Generate additional Eleven v4 narration without modifying the 38 approved MP3s."""
import argparse
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/data/activityNarrationV4.json"
DEST = ROOT / "public/audio/activities/indo-v4-v1"
MANIFEST = DEST / "manifest.json"

def validate():
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    clips = data["clips"]
    if (data["model_id"] != "eleven_v4" or data["language_code"] != "id"
        or data["voice_id"] != "wtqqNhC5H27DEv1Ojo4B"
        or len(clips) != 22):
        raise ValueError("Unexpected activity voice, model or clip count")
    for name, text in clips.items():
        if not re.fullmatch(r"[a-z0-9/-]+", name) or ".." in name:
            raise ValueError("Invalid clip key " + name)
        if not isinstance(text, str) or len(text.strip()) < 4:
            raise ValueError("Missing spoken text: " + name)
    return data

def manifest_for(data):
    entries = {}
    for key in data["clips"]:
        target = DEST / (key + ".mp3")
        if target.exists():
            raw = target.read_bytes()
            if len(raw) < 512:
                raise ValueError("Corrupt MP3: " + key)
            entries[key] = {"sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    MANIFEST.write_text(json.dumps({
        "voice_id": data["voice_id"], "model_id": data["model_id"],
        "required_count": len(data["clips"]), "generated_count": len(entries),
        "entries": entries
    }, indent=2) + "\n", encoding="utf-8")

def synthesize(data, key):
    payload = json.dumps({
        "text": data["clips"][key], "model_id": data["model_id"], "language_code": "id",
        "voice_settings": {"stability": 0.6, "similarity_boost": 0.75}
    }, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        "https://api.elevenlabs.io/v1/text-to-speech/" + data["voice_id"] + "?output_format=mp3_44100_128",
        data=payload, method="POST", headers={
            "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
            "Accept": "audio/mpeg", "Content-Type": "application/json"
        }
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                raw = response.read()
                if len(raw) < 512:
                    raise RuntimeError("Empty response")
                return raw
        except urllib.error.HTTPError as ex:
            if ex.code == 429 and attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            status = "unknown"
            try:
                parsed = json.loads(ex.read(2048).decode("utf-8"))
                status = str(parsed.get("detail", {}).get("status", "unknown"))
            except (ValueError, UnicodeError, AttributeError):
                pass
            # Do not expose server-provided text or credentials in CI logs.
            raise RuntimeError("ElevenLabs HTTP " + str(ex.code) + " status=" + re.sub(r"[^a-z_]", "", status)[:48]) from None
    raise RuntimeError("Request failed")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate", action="store_true")
    parser.add_argument("--limit", type=int, default=22)
    args = parser.parse_args()
    data = validate()
    print("VALID: 22 scoped Indonesian Eleven v4 activity clips", flush=True)
    if args.validate:
        return
    if not 1 <= args.limit <= len(data["clips"]):
        parser.error("limit must be 1..22")
    if not os.environ.get("ELEVENLABS_API_KEY"):
        sys.exit("Missing GitHub Actions secret ELEVENLABS_API_KEY")
    DEST.mkdir(parents=True, exist_ok=True)
    created = 0
    try:
        for key in data["clips"]:
            target = DEST / (key + ".mp3")
            if target.exists():
                continue
            if created >= args.limit:
                break
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(synthesize(data, key))
            created += 1
            manifest_for(data)
            print("Generated:", key, flush=True)
    finally:
        manifest_for(data)
        print("Staged:", len(json.loads(MANIFEST.read_text())["entries"]), "/22", flush=True)

if __name__ == "__main__":
    main()
