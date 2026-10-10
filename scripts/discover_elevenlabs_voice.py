#!/usr/bin/env python3
"""Find voice types potentially available to ElevenLabs Free API users.

This module does not generate speech or spend Text-to-Speech credits.
Only voices returned to the connected account are considered. Availability
is ultimately confirmed by the Text-to-Speech API when the job runs.
"""
import json
import urllib.error
import urllib.parse
import urllib.request


class VoiceDiscoveryError(RuntimeError):
    pass


def list_account_voices(api_key: str, voice_type: str):
    voices = []
    next_token = None
    for _ in range(10):
        params = {"voice_type": voice_type, "page_size": 100}
        if next_token:
            params["next_page_token"] = next_token
        url = "https://api.elevenlabs.io/v2/voices?" + urllib.parse.urlencode(params)
        request = urllib.request.Request(url, headers={"xi-api-key": api_key})
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                payload = json.load(response)
        except urllib.error.HTTPError as error:
            if error.code in (401, 403):
                raise VoiceDiscoveryError(
                    "Voice discovery failed: ElevenLabs API key needs permission "
                    "to list voices (Voices: Read). You can still set a Voice ID "
                    "manually in Run workflow, or enable the permission."
                ) from None
            raise VoiceDiscoveryError(
                "Voice discovery failed with HTTP " + str(error.code)
            ) from None
        except (urllib.error.URLError, ValueError) as error:
            raise VoiceDiscoveryError(
                "Unable to retrieve the voice list from ElevenLabs."
            ) from error
        voices.extend(payload.get("voices", []))
        if not payload.get("has_more") or not payload.get("next_page_token"):
            break
        next_token = payload["next_page_token"]
    return voices


def select_free_candidate(api_key: str):
    personal = list_account_voices(api_key, "personal")
    generated = [
        voice for voice in personal
        if voice.get("category") == "generated" and voice.get("voice_id")
    ]
    if generated:
        generated.sort(key=lambda voice: (
            str(voice.get("labels", {}).get("gender", "")).lower() == "female",
            str(voice.get("labels", {}).get("language", "")).lower() in
            {"indonesian", "id", "id-id", "id_id"},
        ), reverse=True)
        print("Found " + str(len(generated)) + " Voice Design voice(s). "
              "Trying a generated voice belonging to this account.")
        return generated[0]["voice_id"]

    defaults = list_account_voices(api_key, "default")
    eligible_defaults = [
        voice for voice in defaults
        if voice.get("category") == "premade" and voice.get("voice_id")
    ]
    if eligible_defaults:
        print("Found " + str(len(eligible_defaults)) +
              " legacy Default voice(s). These expire 31 December 2026.")
        return eligible_defaults[0]["voice_id"]

    raise VoiceDiscoveryError(
        "No suitable account-owned Voice Design or eligible Default voice was found. "
        "ElevenLabs does not permit Voice Library voices through Free API. "
        "Create a Voice Design voice under ElevenLabs > Voices > My Voices "
        "> Add a new voice > Voice Design, save it, and retry. "
        "Otherwise, use browser speech synthesis as a no-cost fallback."
    )
