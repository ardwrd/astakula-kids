# Astakula Kids

**Belajar sambil bermain.** An open-source, Indonesian-language learning playground built for preschool children. The first family alpha supports two difficulty modes, approximately ages **3** and **5**, without requiring an account.

## Five learning worlds
- Dunia Warna
- Dunia Bentuk
- Dunia Hewan
- Dunia Angka
- Dunia Huruf

Activities are illustrations of playful early learning, **not developmental tests** or mandatory milestones. Adults should accompany children and support offline play, especially for younger children.

## Getting started
Requires Node.js 22+.

```bash
npm install
npm run dev
npm run build
```

The site is static, with no analytics or backend. Progress is stored in this browser only. No child names, photos, or accounts are required.

## Indonesian audio
Text is always available. Initially, the app can use browser speech synthesis as a fallback (availability and offline support vary). Pre-rendered ElevenLabs MP3 assets take precedence once generated.

1. Create a repository Actions secret named `ELEVENLABS_API_KEY` (never place keys in frontend code).
2. For Free-tier API usage, use a **Voice Design** voice saved in ElevenLabs **My Voices**. Voices copied from the community **Voice Library** are not usable through the API on Free. Default voices are only available on older accounts and expire on 31 December 2026.
3. Under **Actions → Generate Indonesian narration → Run workflow**, keep `voice_id=auto` and `limit=3`. The generator searches for a saved Voice Design voice, falling back to an eligible Default voice if available. Voice discovery requires **Voices: Read** permission on the ElevenLabs API key (plus **Text to Speech** permission).
4. You can also manually enter a compatible Voice ID instead of `auto`. Selecting an unavailable community voice will fail with an ElevenLabs permission error.
5. The workflow writes generated MP3 files to `public/audio/generated/` and updates `src/data/audioManifest.json`. Validate pronunciation before generating the full set. Generated audio is checked into the public repository, so verify ElevenLabs usage rights first.

Suggested Voice Design prompt: `Warm adult Indonesian female educator with a clear standard Indonesian accent. Patient, cheerful and reassuring, natural articulation, unhurried child-friendly storytelling delivery, no background noise or exaggerated cartoon affect.`

The Free tier is for **non-commercial use with ElevenLabs attribution**, even if the repository is public and open-source. Confirm current terms before publishing or redistributing generated audio.

No key is needed at runtime. ElevenLabs consumes credits **only during audio generation**.

## Privacy and safety
- No cookies for tracking, analytics, ads, signup or user profiling.
- Progress is stored in `localStorage` on the device; parents can reset it.
- Never commit personal data of children or API credentials.
- Audio or illustration assets may have their own licenses. Do not assume they are covered by a future MIT license for the code.

## Deployment
GitHub Pages support is planned. Configure the repository Pages source to GitHub Actions before enabling a deployment workflow. Until then, CI verifies the static build on each push.

## Roadmap
WP001 project foundation, WP002 design system, WP003 local age profiles, WP004 five learning worlds, WP005 narration, WP006 progress, WP007 offline PWA, WP008 QA + public release.
