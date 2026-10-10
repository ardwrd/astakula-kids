# Astakula Kids — UI / UX Interaction Audit

**Date:** 2026-10-10  
**Scope:** Source-level inspection of `src/App.tsx`, `src/styles.css`, `src/data/content.json`, supporting content/types/audio, and comparison with the actual wordmark implementation in `ardwrd/astakula-tools`.  
**Limit:** Source-level audit, **not** yet a hands-on test on a physical Android/iOS device. Validate all proposed behavior on 320–430 px mobile screens before accepting further UI work.

## Direction

**Clean wordmark + playful interaction, not decorative cuteness.** Astakula Tools uses plain text `Astakula Tools`, bold (~900) and tight letter spacing. Astakula Kids must use the same wordmark principle: text `Astakula Kids` only, without the old `a✳` square. Maintain the user's privacy-first, no-account, no-age-choice requirements.

Children should recognize the primary action by its **shape, color, and spoken instruction**, not by reading the text. A world should have a distinctive way to interact, not simply another theme for the same three-button quiz.

## Baseline and completed correction

- **DONE:** wordmark changed to plain text `Astakula Kids`, no decorative mark; `src/App.tsx` / `src/styles.css`.
- **DONE (prior work):** full-surface answer colors in Dunia Warna.
- **DONE (prior work):** `Paku` now uses a local drawing of a *nail*, not the `🔩` bolt emoji.
- **DONE (prior work):** six questions per session, explicit `Main lagi` / `Pilih dunia lain`; no involuntary session loop.
- **KEEP:** approved 38/38 Indonesian Eleven v4 recordings; avoid regeneration until text/audio requirements change.
- **KEEP:** no account, no ads, no permanent scores or completion locks. The child-facing parent button and its settings panel have since been removed.

## Findings and recommended backlog

| Priority | Area | Observed code behavior | Acceptance criteria |
|---|---|---|---|
| P0 | Interaction diversity | All five worlds render the same `answer-grid` with three choice cards and `nextQuestion()`. | At least 2 contrasting game mechanics in the first release and a world-specific interaction map; not five reskinned multiple-choice quizzes. |
| P0 | First prompt narration | `openWorld()` only plays `worlds/<id>/intro`. It renders the first question but doesn't speak `questions/<id>` until the child manually presses **Dengarkan pertanyaan**. Later questions are read on `nextQuestion()`. | Intro and first question play sequentially (no overlap), with a prominent replay control, and user-gesture restrictions handled gracefully. |
| P0 | Choice feedback | Wrong taps trigger generic text/audio but do not visually mark the specific tapped choice; correct selection only receives a static green border. No tactile `:active` or celebratory state. | Wrong tap gives gentle in-card feedback; correct tap has obvious, short, reassuring confirmation; accessible label/status, no flashing or loud effect. |
| P1 | Visual assets | World icons and most animals use OS-dependent emoji, while `Paku` is SVG, and shapes/numbers are rendered with text glyphs. | Define one illustration family (consistent geometry/line weight), verify each label against the drawn object, keep local SVG assets. |
| P1 | Mobile flow / readability | Short prompts are strong, but multiple 12–13px explanatory labels target adults; three cards become narrow at 320px. Header occupies substantial height for a child-centric flow. | Mobile-first touch targets >=44×44 CSS px, no clipped labels at 320/360/390/430 widths, primary activity stays high in first viewport. |
| P1 | Replay value | A session repeats the same six question IDs with a different order and answer positions. | Add substantive task variants/content, not just shuffling. Do not create infinite loops or claim that repeated questions are new. |
| P1 | Audio coordination | A new `speak()` interrupts the previous clip, including praise if the child advances rapidly. There is no pause/stop UI on the game view. | Praise and next prompt never overlap or get cut unexpectedly; replay and sound controls are easy to discover. |
| P2 | Session end | Current end screen gives replay and exit, which is appropriate, but wording `sudah mencoba semuanya` may imply permanent completion. | End is framed as a break between sessions, not a permanently completed world; retain clear optional replay/exit. |
| DONE | Parent controls | Parent settings button originally competed with child-focused navigation. | Button and modal removed; no new browser preference data is stored. |
| P2 | Motion + reduced motion | There is a `prefers-reduced-motion` rule but effectively no meaningful state transition. | Add short 120–220ms interaction states only where feedback is useful; turn off nonessential motion under reduced-motion preference. |

## Suggested world-specific interaction specification

**Dunia Warna:** tap large solid-color swatches; for mixing challenges, let children tap two paint colors and show their resulting color (simple flat illustration). Avoid decorative gradients on selectable colors.

**Dunia Bentuk:** tap a shape, then drag *or tap-to-place* the shape into a matching silhouette. Always offer a non-drag gesture alternative; maintain spoken instructions.

**Dunia Hewan:** select a consistent animal drawing from a small set, optionally listen to an animal sound when tapped. Do not rely on operating-system emoji that vary between devices.

**Dunia Angka:** count visible objects via tapping each object; only then choose a numeral. Advanced prompts show groups that are physically added/subtracted rather than relying only on abstract text.

**Dunia Huruf:** choose the initial letter, select syllables, or assemble words from large selectable letter tiles. Show actual objects and avoid incorrect symbols (e.g., nail != bolt).

These mechanics are **proposals, not implemented features**. Preserve existing question IDs/audio keys unless a reviewed content migration or new narration batch is planned.

## Visual rules for a coherent non-AI-slop product

- Logo is a **monochrome text wordmark**, matching the restrained Astakula Tools approach. No mascot, faux icon, sparkle or gradient attached to the wordmark.
- Global UI: one neutral background, a small set of reusable ink/surface/accent tokens, radii from one scale (e.g. 10/14/18 px), no unrelated pill/circle/badge styles.
- World colors are navigation cues; use strong colors for interactive objects and neutral surfaces for instructions instead of saturating every element.
- Use typography size, weight and spacing to establish hierarchy; avoid gratuitous ornaments and repeated status chips.
- Iconography must be semantically correct, consistently illustrated and legible on Android.
- Motion is **functional**: press response, selection state, correct answer celebration, contextual instruction. No looping ornamental animations.
- Avoid adding UI chrome that competes with the child's current activity.

## Proposed delivery sequence

1. **Foundation (small)** — text-only logo (done), consolidate design tokens, simplify hero/header and world cards, responsive audit.
2. **Interaction P0** — sequence initial narration, add answer press/wrong/correct states, test audio cancellation, avoid accidental double taps.
3. **First mechanic pilot** — implement a genuine interactive Dunia Warna activity while keeping the other four working; child/parent acceptance on a mobile device.
4. **World rollout** — introduce per-world touch and tap-to-place mechanics with validated, consistent illustrations.
5. **QA gate** — explicit acceptance on 320/360/390/430 px viewport sizes, touch feedback, offline/static GitHub Pages URLs, reduced motion, screen reader names, visual correctness and full 38-clip audio manifest.

## Regression checks

- No age selection appears anywhere in the UI.
- Starting a world leads to a valid playable screen even when audio fails.
- Each existing world stops after exactly six responses and requires explicit replay.
- Incorrect response allows retry; correct response has one path to the next question.
- Parent settings and button are intentionally absent. Past alpha browser storage is no longer accessed; clearing it remains the browser user's choice.
- `Paku` shows an actual nail, all color answers fill their touch surface, and other answer IDs map to the correct visuals.
- The original and approved Eleven v4 MP3 collections stay intact.

## Implemented interaction update — 10 October 2026

- World cards now open an activity selector instead of routing immediately to the same quiz. The text-only wordmark remains.
- World-specific activities: color mixing (Warna), outline tracing (Bentuk), matching card pairs and tracing (Hewan), touch-to-count (Angka), tracing letters and assembling syllables (Huruf).
- All five worlds retain their original six-question quiz for optional play. Each quiz session still stops and offers an explicit replay decision.
- Outline tracing supports both direct finger drawing and an ordered dot-by-dot mode for children who find free tracing difficult. Content includes simple shapes, animals, and letters.
- Basic interactions use flat colors and minimal motion; new animal image choices use consistent locally authored SVGs instead of operating-system-dependent emoji.
- UI wording shortened to natural action-oriented Indonesian; removed repetitive hype language, mascot icon and parent/settings chrome.
- Existing Eleven v4 recordings are unchanged for the original lessons. New activity instructions have optional browser Indonesian speech synthesis; dedicated Eleven v4 recordings are **not yet generated**.
- Build-time checks confirm TypeScript compiles and the original question/audio manifests remain intact. A physical-device touch/usability test is still required, especially tracing at 320–430 CSS-pixel widths.
