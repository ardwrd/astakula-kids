#!/usr/bin/env python3
"""Generate pre-recorded Indonesian narration. Never embed the API key in web assets."""
import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "src/data/content.json"
MANIFEST = ROOT / "src/data/audioManifest.json"
AUDIO = ROOT / "public/audio/generated"


def clips_from_content():
    content = json.loads(CONTENT.read_text(encoding="utf-8"))
    clips = {
        "global/welcome": content["welcome"],
        "global/correct": content["correct"],
        "global/retry": content["retry"],
    }
    for world in content["worlds"]:
        clips["worlds/" + world["id"] + "/intro"] = world["intro"]
        for level in ("3", "5"):
            for item in world["levels"][level]:
                clips["questions/" + item["id"]] = item["prompt"]
    return clips


def speak(key, message, voice_id, api_key):
    url = ("https://api.elevenlabs.io/v1/text-to-speech/"
           + voice_id + "?output_format=mp3_44100_128")
    data = json.dumps({
        "text": message,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.6, "similarity_boost": 0.75},
    }, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url, data=data, method="POST",
        headers={"xi-api-key": api_key, "Content-Type": "application/json",
                 "Accept": "audio/mpeg"},
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                audio = response.read()
                if not audio:
                    raise RuntimeError("Empty audio response")
                return audio
        except urllib.error.HTTPError as error:
            # Never log authentication headers or the secret.
            if error.code == 429 and attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            # ElevenLabs supplies a structured error code and message in JSON.
            # Log a sanitized summary, never credentials or raw response bodies.
            error_code = "unknown"
            error_message = "No structured error details available."
            try:
                payload = json.loads(error.read(4096).decode("utf-8"))
                detail = payload.get("detail", payload)
                if isinstance(detail, dict):
                    raw_code = detail.get("code") or detail.get("status") or detail.get("type")
                    raw_message = detail.get("message")
                    if isinstance(raw_code, str):
                        error_code = re.sub(r"[^a-zA-Z0-9_-]", "", raw_code)[:80] or "unknown"
                    if isinstance(raw_message, str):
                        error_message = raw_message
                elif isinstance(detail, str):
                    error_message = detail
            except (ValueError, UnicodeError, AttributeError):
                pass
            error_message = error_message.replace(api_key, "[REDACTED]")
            error_message = re.sub(r"(?i)(xi-api-key|authorization|api.key)\s*[:=]\s*[^\s,;]+", r"\1=[REDACTED]", error_message)
            error_message = re.sub(r"[\r\n\t]+", " ", error_message)[:350]
            raise RuntimeError(
                "ElevenLabs rejected clip " + key + " (HTTP " + str(error.code)
                + ", code=" + error_code + "): " + error_message
            ) from None
    raise RuntimeError("Audio generation retries exhausted")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice-id", required=True)
    parser.add_argument("--limit", default="10")
    args = parser.parse_args()
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        sys.exit("ELEVENLABS_API_KEY secret is missing.")
    if not re.fullmatch(r"[a-zA-Z0-9_-]{8,80}", args.voice_id):
        sys.exit("Invalid voice ID.")
    try:
        limit = int(args.limit)
    except ValueError:
        sys.exit("Limit must be a whole number.")
    if not (1 <= limit <= 100):
        sys.exit("Limit must be between 1 and 100.")

    clips = clips_from_content()
    previous = json.loads(MANIFEST.read_text(encoding="utf-8"))
    generated = set(previous.get("keys", []))
    count = 0
    for key, message in clips.items():
        destination = AUDIO / (key + ".mp3")
        if destination.exists():
            generated.add(key)
            continue
        if count >= limit:
            break
        destination.parent.mkdir(parents=True, exist_ok=True)
        audio = speak(key, message, args.voice_id, api_key)
        destination.write_bytes(audio)
        generated.add(key)
        count += 1
        print("Generated:", key)
    MANIFEST.write_text(
        json.dumps({"keys": sorted(generated)}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print("Generated " + str(count) + " clip(s); " +
          str(len(generated)) + " in manifest.")


if __name__ == "__main__":
    main()
