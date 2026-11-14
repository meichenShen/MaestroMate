# Music Pool Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline; one fresh bounded whole-iteration review, no implementer delegation. Tasks are tracked below.

**Goal:** Try the user's selected water-music, spatial booklet and elastic portal interactions in the existing public MaestroMate.
**Architecture:** Isolated pool feature/model/audio/renderer, explicit standalone route, shared spring pointer hook used only on artwork. Existing Worker/D1 and other music features stay intact.
**Tech Stack:** Existing React, TypeScript, Three.js, native Web Audio/CSS. No new dependencies or HTML-in-Canvas requirement.
**Spec:** `docs/superpowers/specs/2026-11-14-music-pool-design.md`

## Global Constraints

English, black/#45D9FD/#EE2560/#FFDA8E; no green panels. Work in the existing feature branch and prescribed `/workspace/MaestroMate/web` without duplicating the source tree. Keep one persistent MP3 element; synthesized notes are separate only within the creative instrument. Retain all previous routes, vertical two-work Program, fixed entry targets and private feedback. Use ignored `web/.tmp/music-pool/` for artifacts.

## Review Focus

- Async audio resume interrupted by route/modal/visibility: no later sound or rescheduled sequence.
- Editing/clearing/repeated playback: deterministic retained eight steps, exact stop and honest status.
- Missing WebGL/AudioContext: readable actionable fallback with navigation still usable.
- Reduced motion/touch/keyboard/short desktop: stable targets, no hidden controls or uncontrolled frames.
- Existing Listen/Chat/Detective/feedback: no regression or accidental Program/reset/audio behavior.

## Task 1: standalone Music Pool

Files: new `src/features/water/{model.ts,audio.ts,MusicPool.tsx,PoolGlyph.tsx,music-pool.css}`, `src/components/MusicPoolView.tsx`, `src/rendering/music-pool.ts`; modify routes/App/BrandHeader/GameRoom and owned game-room CSS. Interfaces: immutable `Melody=(number|null)[]`, `putNote`, MIDI/frequency helpers, `PoolAudio` start/play/stop/dispose, `PoolView` explicit ripple/motion/suspend.

- [x] RED: route + sequence/pitch invariants, browser entry/play/edit/replay/clear, preserve one recording element.
- [x] Implement original 3D water and five ordinary DOM note controls, eight steps, explicit lifecycle and fallback.
- [x] GREEN: targeted unit/browser, audio stop on modal/navigation, static/failure and short-window checks.
- [x] Commit feature (`5175469`).

## Task 2: spatial booklet / elastic entrances

Files: new `src/hooks/useSpringPointer.ts`, spring math and owned surface CSS; modify RoomPortal/Programme. Interfaces: CSS custom properties on art ancestors; no changed click targets/routes.

- [x] RED: spring settles/finiteness, pointer visibly affects art while link/title/button bounds stay fixed; two vertical work entries remain available.
- [x] Implement damped perspective/squish and finite fold arrival. Reduced motion disables decoration.
- [x] GREEN: new browser tests; final existing entry/preview/keyboard regression follows.
- [x] Commit feature (`12de22c`).

## Task 3: research, verification and publication

- [x] Record primary aquarium projects/licenses and next-direction tradeoffs without swapping the listening scene.
- [x] Unit tests, asset/TypeScript/build, inspect desktop/mobile screenshots, full browser suite.
- [x] One fresh gpt-6-astra/high final review of the iteration; fix Important findings RED→GREEN.
- [x] Commit/push existing feature branch and update draft PR2; package exact source and publish same public Site. Preserve DB migration history and audience.
- [x] Record exact provenance/limits; attempt supported URL handoff and stop owned servers.

## Ledger

Baseline `edcd7fb67b13dc7407d0e0d158006d9166be99ba`, published Sites v10. User expressly approved trying the three concepts; this is the approved prototype/spike continuation, not an unsolicited redesign or general AI/education expansion. Existing feature checkout is retained to follow the user's prescribed path and storage rules. Managed cloud policy still has a restricted host list; do not bypass it. Native Sites publish/owner DB checks and local HTTP browser verification are distinct from production browser verification.

Task1: initial route assertion and missing pool entry failed. Implemented isolated model/audio/renderer/view/UI. Cancelled audio permission rejection was separately reproduced RED then fixed to ignore cancelled outcomes. Real browser Web Audio RMS checks pass for audible notes, mute, Guide stop and close on navigation. Static mode, genuine WEBGL_lose_context and missing WebGL retain controls. Two test-harness defects corrected: hash-only navigation does not rerun addInitScript, and a hash click does not guarantee React has committed its new page; fallback uses a fresh page and persistence waits for its visible step. No application behavior was changed to accommodate these tests.

Task2: valid baseline browser run failed for missing stretch/depth/reduced-motion state. Original spring math and hook, art-only transforms and finite page arrivals now pass all3 targeted surface contracts. Link/title/CTA geometry stays stationary. Current unit suite26/26 and build pass; all runtime dependencies are unchanged. Final browser regression runs from a fixed Worker build with an isolated local SQLite database, not production feedback.

Final review: one fresh gpt-6-astra/high read-only review found two Important issues and no Critical/minors. Pre-review regression was deliberately stopped when fixes became necessary. Both fixes were performed inline, in one pass, with no re-review:
- Mobile hit areas: RED at320px, the visible right edge of C hit D. Expanded pond/note projection to fixed10/30/50/70/90% centres, responsive48–57px touch targets, aligned fallback. GREEN checks pairwise target bounds and elementFromPoint at320/390/1024, both ready/fallback.
- Program arrival: RED proved title/CTA geometry changes when native CSS animation times are sampled. Whole-list opening/closing is now opacity-only; 3D arrival is restricted to previews. GREEN samples20–900ms and confirms stationary headings/buttons. GPU is disabled only for this CSS geometry test; normal live-preview behavior is covered separately.

Final repair verification:26 unit tests and production build pass; both new review regressions pass. Runtime/build stay frozen during the final18-script browser run. Updated screenshots inspected at1440px,390px and320px. No API/feedback schema change, no real user data captured by tests.

Complete: final18-script browser command exited0, after the one fix pass, against the frozen Worker build. Published Sites v11 (`succeeded`) to the existing public URL; native D1 overview retains DB/feedback/feedback_sessions. Direct public GET remains blocked by managed CONNECT403; app browser/PR-attachment RPC returned connection closed, so no claim of direct production browser verification or successful handoff. Draft PR2 updated, not merged. Exact source/version/deployment provenance is in web/VERIFICATION.md. Final-only documentation does not change runtime. The existing source checkout remains; owned preview/dev servers are stopped at handoff.
