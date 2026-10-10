#!/usr/bin/env python3
"""Non-destructive Eleven v4 Indonesian audio candidates for Astakula Kids.

Writes only to public/audio/candidates/indo-v4-v1. Never edits production audio.
Use --validate first (no API calls), then --keys or --limit for staged creation.
"""
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
NARRATION = ROOT / "src/data/narrationV4.json"
CONTENT = ROOT / "src/data/content.json"
DESTINATION = ROOT / "public/audio/candidates/indo-v4-v1"
MANIFEST = DESTINATION / "manifest.json"
VOICE_ID = "Z1zqlZPdl4KqSeH7Nm4L"
SUPPORTED_TAGS = {"warmly", "happily", "gently", "curious"}


def validate_narration():
    data = json.loads(NARRATION.read_text(encoding="utf-8"))
    content = json.loads(CONTENT.read_text(encoding="utf-8"))
    expected = ["global/welcome", "global/correct", "global/retry"]
    for world in content["worlds"]:
        expected.append("worlds/" + world["id"] + "/intro")
        for age in ("3", "5"):
            expected.extend("questions/" + q["id"] for q in world["levels"][age])
    clips = data.get("clips", {})
    if len(expected) != 38 or set(clips) != set(expected):
        raise ValueError("Narration keys must exactly match all 38 existing app audio keys")
    if data.get("model_id") != "eleven_v4" or data.get("language_code") != "id":
        raise ValueError("This candidate must target Eleven v4 in Indonesian")
    if data.get("voice_id") != VOICE_ID:
        raise ValueError("Unexpected voice identifier")
    for key in expected:
        item = clips[key]
        line = item["text"]
        if not isinstance(line, str) or len(line.strip()) < 12:
            raise ValueError("Missing or too short spoken text for " + key)
        if "<" in line or ">" in line:
            raise ValueError("SSML/HTML not allowed with Eleven v4: " + key)
        tags = re.findall(r"\\[([^]]+)\\]", line)
        if any(tag not in SUPPORTED_TAGS for tag in tags):
            raise ValueError("Unapproved delivery tag in " + key)
        if re.search(r"[\\U0001F300-\\U0001FAFF]", line):
            raise ValueError("Emoji should not be sent to Eleven v4: " + key)
        if item["kind"] == "pertanyaan" and "?" not in line:
            raise ValueError("Question missing question mark: " + key)
    return data, expected


def convert(text, api_key):
    payload = {
        "text": text,
        "model_id": "eleven_v4",
        "language_code": "id",
        "voice_settings": {"stability": 0.6, "similarity_boost": 0.75},
    }
    url = "https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID
    url += "?output_format=mp3_44100_128"
    request = urllib.request.Request(
        url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"xi-api-key": api_key, "Accept": "audio/mpeg",
                 "Content-Type": "application/json"},
        method="POST",
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                audio = response.read()
                if not audio or len(audio) < 512:
                    raise RuntimeError("Empty or incomplete audio response")
                return audio
        except urllib.error.HTTPError as error:
            if error.code == 429 and attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            code = "unknown"
            message = "Request rejected by ElevenLabs"
            try:
                detail = json.loads(error.read(4096).decode("utf-8"))
                detail = detail.get("detail", detail)
                if isinstance(detail, dict):
                    code = str(detail.get("status", detail.get("code", "unknown")))
                    message = str(detail.get("message", message))
            except (ValueError, UnicodeError, AttributeError):
                pass
            # Redact API credentials before emitting diagnostics.
            message = message.replace(api_key, "[REDACTED]")
            message = re.sub(r"(?i)(xi-api-key|authorization)\\s*[:=]\\s*\\S+",
                             r"\\1=[REDACTED]", message)
            raise RuntimeError("ElevenLabs HTTP " + str(error.code) +
                               " (" + code[:64] + "): " + message[:250]) from None
    raise RuntimeError("Audio request failed after retries")


def write_manifest(narration, expected):
    entries = {}
    for key in expected:
        path = DESTINATION / (key + ".mp3")
        if path.is_file():
            raw = path.read_bytes()
            entries[key] = {
                "sha256": hashlib.sha256(raw).hexdigest(),
                "bytes": len(raw),
                "kind": narration["clips"][key]["kind"],
            }
    manifest = {
        "version": narration["version"], "model": "eleven_v4",
        "voice_id": VOICE_ID, "language_code": "id",
        "status": "CANDIDATE_ONLY_NOT_APPROVED",
        "generated_count": len(entries), "required_count": len(expected),
        "entries": entries,
    }
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate", action="store_true",
                        help="Audit all 38 scripts without using API credits")
    parser.add_argument("--limit", type=int, default=3,
                        help="Maximum NEW clips per run; default 3")
    parser.add_argument("--keys", default="",
                        help="Optional comma-separated exact keys for targeted tests")
    args = parser.parse_args()
    data, expected = validate_narration()
    print("VALID: 38 Indonesian v4 scripts, keys match current app.")
    if args.validate:
        return
    if not 1 <= args.limit <= 38:
        parser.error("limit must be between 1 and 38")
    selected = [x.strip() for x in args.keys.split(",") if x.strip()]
    if selected and (len(selected) != len(set(selected)) or
                     any(key not in expected for key in selected)):
        parser.error("Every requested key must be unique and present in 38-key catalog")
    if not selected:
        selected = expected
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not key:
        sys.exit("Missing ELEVENLABS_API_KEY Actions secret")
    DESTINATION.mkdir(parents=True, exist_ok=True)
    generated = 0
    for name in selected:
        path = DESTINATION / (name + ".mp3")
        if path.is_file():
            print("Reused approved-for-audition candidate:", name, flush=True)
            continue
        if generated >= args.limit:
            break
        path.parent.mkdir(parents=True, exist_ok=True)
        audio = convert(data["clips"][name]["text"], key)
        path.write_bytes(audio)
        generated += 1
        write_manifest(data, expected)
        print("Candidate generated:", name, flush=True)
    write_manifest(data, expected)
    print("New clips:", generated, "| Candidate total:",
          json.loads(MANIFEST.read_text(encoding="utf-8"))["generated_count"],
          "/38. Production audio unchanged.")


if __name__ == "__main__":
    main()
