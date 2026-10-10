#!/usr/bin/env python3
"""Generate 6 non-destructive A/B samples to compare Indonesian speech prosody."""
import json
import os
from pathlib import Path
from generate_audio import speak

OUT = Path(__file__).resolve().parents[1] / "public/audio/previews/indo-prosody-01"
VOICE = "Z1zqlZPdl4KqSeH7Nm4L"
SAMPLES = {
    "welcome": {
        "v2": 'Halo, petualang kecil! <break time="0.45s" /> Yuk, kita belajar sambil bermain, ya.',
        "v4": '[warmly] Halo, petualang kecil! [cheerfully] Yuk, kita belajar sambil bermain, ya.',
    },
    "instruction": {
        "v2": 'Sekarang, coba sentuh warna merah, ya. <break time="0.35s" />',
        "v4": '[gently] Sekarang, coba sentuh warna merah, ya.',
    },
    "question": {
        "v2": 'Coba lihat baik-baik. <break time="0.45s" /> Yang mana warna biru?',
        "v4": '[curious] Coba lihat baik-baik. Yang mana warna biru?',
    },
}

def main():
    key = os.environ["ELEVENLABS_API_KEY"]
    OUT.mkdir(parents=True, exist_ok=True)
    results = {}
    for scene, variants in SAMPLES.items():
        for variant, line in variants.items():
            filename = scene + "-" + variant + ".mp3"
            path = OUT / filename
            try:
                if not path.exists():
                    speak_kwargs = ({"model_id": "eleven_v4"} if variant == "v4" else
                                    {"model_id": "eleven_multilingual_v2", "speed": 0.88})
                    path.write_bytes(speak(scene, line, VOICE, key, **speak_kwargs))
                results[filename] = "ready"
                print("Generated:", filename, flush=True)
            except RuntimeError as error:
                results[filename] = "unavailable"
                print("Cannot generate " + filename + ": " + str(error), flush=True)
    (OUT / "result.json").write_text(
        json.dumps({"voice": VOICE, "samples": results}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    success = sum(x == "ready" for x in results.values())
    print("Prosody clips generated:", success, "of", len(results))
    if success == 0:
        raise SystemExit("No preview clips available; production audio remains unchanged.")

if __name__ == "__main__":
    main()
