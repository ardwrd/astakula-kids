# Astakula Kids

**Belajar sambil bermain.** An open-source, Indonesian-language learning playground built for preschool children. The family alpha is designed for **preschool children under six**. There is no age selection, account, or visible age-based grouping. Children choose one of five learning worlds; activities progress gently from introductory exercises to more challenging ones.

## Five learning worlds
- Dunia Warna
- Dunia Bentuk
- Dunia Hewan
- Dunia Angka
- Dunia Huruf

Each world currently includes **six different questions per repeatable round**, with **30 unique questions across five worlds**. Questions progress from simple to more challenging, but every round cycles into another shuffled round rather than ending. Answer positions are also reshuffled. The original age-grouped question sets remain internal for difficulty sequencing; no ages are shown. This is an initial content bank that should expand over time—not an infinite supply of unique questions. Activities are not developmental tests or mandatory milestones. Adults should accompany children and support offline play.

## Getting started
Requires Node.js 22+.

```bash
npm install
npm run dev
npm run build
```

The site is static, with no analytics or backend. There are **no scores, completion percentages, end screens, or stored answer histories** for new play. Children can re-enter any world and play again indefinitely. Only the preferred audio playback speed is stored in the browser. Historical answer records from earlier alpha versions are not used or changed; parents can choose to delete them in the parent settings. No child names, photos, ages, or accounts are required.

## Indonesian audio
Text is always available. **The approved Indonesian Eleven v4 narrator is active**, using Voice Design `wtqqNhC5H27DEv1Ojo4B` and 38/38 pre-rendered MP3 files in `public/audio/candidates/indo-v4-v1/`. The original Multilingual v2 recordings remain intact in `public/audio/generated/` for rollback. `src/data/audioRevision.json` controls the active narrator; the build and deploy workflows verify its files. Browser speech synthesis is only a fallback (availability and offline support vary).

1. Create a repository Actions secret named `ELEVENLABS_API_KEY` (never place keys in frontend code).
2. For Free-tier API usage, use a **Voice Design** voice saved in ElevenLabs **My Voices**. Voices copied from the community **Voice Library** are not usable through the API on Free. Default voices are only available on older accounts and expire on 31 December 2026.
3. Under **Actions → Generate Indonesian narration → Run workflow**, use the preselected Astakula Kids Voice Design ID or enter `auto` and `limit=3`. With `auto`, the generator searches for a saved Voice Design voice, falling back to an eligible Default voice if available. Voice discovery requires **Voices: Read** permission on the ElevenLabs API key (plus **Text to Speech** permission).
4. You can also manually enter a compatible Voice ID instead of `auto`. Selecting an unavailable community voice will fail with an ElevenLabs permission error.
5. The workflow writes generated MP3 files to `public/audio/generated/` and updates `src/data/audioManifest.json`. Validate pronunciation before generating the full set. Generated audio is checked into the public repository, so verify ElevenLabs usage rights first.

Suggested Voice Design prompt: `Warm adult Indonesian female educator with a clear standard Indonesian accent. Patient, cheerful and reassuring, natural articulation, unhurried child-friendly storytelling delivery, no background noise or exaggerated cartoon affect.`

**Audio attribution:** Narration generated using [ElevenLabs](https://elevenlabs.io/) (elevenlabs.io), on its Free plan. These recordings are restricted to **non-commercial use with attribution**; do not assume they are covered by any future MIT license for the application code. Confirm current terms before republishing, remixing, or commercial use.

No key is needed at runtime. ElevenLabs consumes credits **only during audio generation**.

One voice-comparison page remains at `/audio/candidates/indo-v4-v1/index.html`. The earlier experimental sample page was removed to avoid duplicates.

## Privacy and safety
- No cookies for tracking, analytics, ads, signup or user profiling.
- New play sessions do not persist results or scores. Audio speed preference is stored in `localStorage`; old progress records can be cleared explicitly by a parent.
- Never commit personal data of children or API credentials.
- Audio or illustration assets may have their own licenses. Do not assume they are covered by a future MIT license for the code.

## Deployment
GitHub Pages is deployed automatically from `main` via GitHub Actions. Site: https://ardwrd.github.io/astakula-kids/. CI checks the build, all 38 narration scripts, and the currently approved audio revision on pushes.

## Roadmap
WP001 project foundation, WP002 design system, WP003 age-free preschool experience, WP004 five replayable learning worlds, WP005 narration, WP006 shuffle and repeatable rounds without completion tracking, WP007 offline PWA, WP008 QA + public release.
