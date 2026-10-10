#!/usr/bin/env python3
"""Generate small test clips without changing the main narration."""
import os
from pathlib import Path
from generate_audio import speak

OUT = Path(__file__).resolve().parents[1] / "public/audio/previews/indo-prosody-01"
VOICE = "Z1zqlZPdl4KqSeH7Nm4L"
SAMPLES = {
    "welcome": 'Halo, petualang kecil! <break time="0.45s" /> Yuk, kita belajar sambil bermain, ya.',
    "instruction": 'Sekarang, coba sentuh warna merah, ya. <break time="0.35s" />',
    "question": 'Coba lihat baik-baik. <break time="0.45s" /> Yang mana warna biru?',
}

def main():
    key = os.environ["ELEVENLABS_API_KEY"]
    OUT.mkdir(parents=True, exist_ok=True)
    for name, text in SAMPLES.items():
        path = OUT / (name + "-v2.mp3")
        if not path.exists():
            path.write_bytes(speak(name, text, VOICE, key))
        print("Generated:", path.name)

if __name__ == "__main__":
    main()
