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
2. Select a suitable Indonesian-language **voice ID** in ElevenLabs.
3. Under **Actions → Generate Indonesian narration → Run workflow**, enter that voice ID and a clip limit (try 3 first).
4. The workflow writes generated files into `public/audio/generated/` and updates `src/data/audioManifest.json`.
5. Validate pronunciation before generating the full set. Generated audio is checked into the public repository, so verify ElevenLabs usage rights first.

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
