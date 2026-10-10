#!/usr/bin/env python3
"""Read-only verification of the GitHub Actions ElevenLabs secret.

Never prints API credentials, account identity, voice names, or voice IDs.
No text-to-speech generation and therefore no TTS credits are consumed.
"""
import json
import os
import re
import urllib.error
import urllib.request

BASE = "https://api.elevenlabs.io"
OLD_VOICE = "Z1zqlZPdl4KqSeH7Nm4L"

def get_json(path: str, key: str):
    request = urllib.request.Request(BASE + path, headers={"xi-api-key": key})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
            return response.status, data
    except urllib.error.HTTPError as error:
        # Only print a sanitized machine-readable error status, never the error
        # message/body, API key, or identifying account details.
        code = "unknown"
        try:
            payload = json.loads(error.read(4096).decode("utf-8"))
            detail = payload.get("detail", payload)
            if isinstance(detail, dict):
                raw = detail.get("status") or detail.get("code") or "unknown"
                if isinstance(raw, str):
                    code = re.sub(r"[^a-zA-Z0-9_-]", "", raw)[:48] or "unknown"
        except (ValueError, UnicodeError, AttributeError):
            pass
        print("ElevenLabs diagnostic: HTTP " + str(error.code) +
              ", code=" + code)
        return error.code, None
    except (urllib.error.URLError, UnicodeError, json.JSONDecodeError):
        return 0, None

def main():
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not key:
        print("API key: missing from Actions secrets")
        raise SystemExit(1)
    print("API key: present in GitHub Actions secret")
    status, models = get_json("/v1/models", key)
    if status == 200 and isinstance(models, list):
        print("ElevenLabs authentication: working (models accessible)")
    else:
        print("ElevenLabs models endpoint: HTTP " + str(status) +
              "; key validity may require permitted API scopes")

    voice_status, voice = get_json("/v1/voices/" + OLD_VOICE, key)
    if voice_status == 200 and isinstance(voice, dict):
        print("Previous Voice Design ID: metadata accessible")
        print("Previous Voice Design owned by connected account: " +
              ("yes" if voice.get("is_owner") is True else "not confirmed"))
    else:
        print("Previous Voice Design ID: inaccessible via this key (HTTP " +
              str(voice_status) + ")")

    personal_status, voices = get_json(
        "/v2/voices?voice_type=personal&page_size=100", key)
    if personal_status == 200 and isinstance(voices, dict):
        generated = sum(1 for v in voices.get("voices", [])
                        if isinstance(v, dict) and v.get("category") == "generated")
        print("Voice Design voices visible to new key: " + str(generated))
        print("Available voice metadata access: yes")
    else:
        print("Voice list permission: HTTP " + str(personal_status) +
              " (Voices: Read may be needed)")

    if status != 200 and voice_status != 200 and personal_status != 200:
        print("Unable to confirm ElevenLabs access. Review API key and scopes.")
        raise SystemExit(1)

if __name__ == "__main__":
    main()
