# MaestroMate Smooothy-led Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. The user explicitly requested direct implementation after rejecting the image concepts; do not repeat visual-option or approval gates.

**Goal:** Replace the existing interface with an English music theatre grounded in the actual Smooothy source, retaining functional listening, guided and activity-first entrances, a vertical programme and beginner guidance.

**Architecture:** Keep one AudioProvider above home/work navigation. Independent home, programme, guide, artwork and activity components use the existing recording and activity IDs. A hash route supports browser navigation; home navigation pauses but does not discard listening position.

**Tech Stack:** Existing React/TypeScript/Vite and Sites; Three.js for original unlit sculptures, Lenis for source-like scrolling, local Geist and openly licensed display typography.

## Global Constraints
- All public UI, labels, errors and metadata are English.
- No rejected generated imagery, plastic/glass rendering, aged paper, ornamental imitation handwriting, or fake playable works.
- Programme scrolls vertically; both Aquarium and the disabled Swan placeholder are visible together on desktop. Previews stay above metadata inside their work areas.
- No AI or free-text composer questions. Keep real recording, source attribution, sources and existing progress.
- Use the existing Sites project and public audience. Keep research and temporary files separate.

## Review Focus
- Hash/browser back navigation and returning to a previous activity preserve audio and question state.
- The guide is keyboard accessible, dismissible and reopenable.
- WebGL creation failure, reduced motion and offscreen rendering have a usable fallback and cleanup.
- English copy includes errors, clip labels, recording attribution and accessible labels.
- Mobile controls remain reachable without horizontal drag or hover.

### Task 1: English theatre and programme journeys
- [x] Add a real-browser acceptance test for English, guided/activity-first entry and state continuity; observe its failure before implementing.
- [x] Translate the shared content and all interactive controls.
- [x] Build home, programme, guide and hash-based navigation around the existing audio provider.
- [x] Verify the new acceptance test, audio boundaries and responsive layouts.

### Task 2: Source-grounded visual system
- [x] Use source evidence: black/white base, Geist/mono, oversized playful lettering, precise SVG reveals, source-like eased scrolling and unlit 3D.
- [x] Build original musical sculptures and minimal theatre geometry; retain source acknowledgments and font licenses.
- [x] Capture desktop/mobile and review against source previews and the user's explicit constraints.

### Task 3: Handoff
- [x] Run the complete tests/build and a separate final review; address material findings.
- [ ] Update docs and the existing GitHub PR, publish to the existing public Site, verify deployment state and open the URL.

## Ledger
- Ruling: Work in the existing feature branch and project directory; avoid a duplicate worktree and dependency tree, following the user's storage preference.
- Ruling: The user supplied the GitHub source as a fallback to the live reference. Inspect source plus its own preview images instead of inventing inaccessible page details.
- Ruling: Use open display typography rather than redistributing a font whose separate license cannot be established. Retain source Geist and its SIL license.
- Baseline: 3/3 timeline tests passed before implementation. Existing UI remains Chinese and has no home/programme journeys.

- Task 1: complete — production browser acceptance, audio regression and 3/3 timeline tests passed. English check failed before implementation.
- Task 2: complete — source previews and actual desktop/mobile captures inspected; no glossy material or rejected images shipped.
- Final review: fresh reviewer found two P2s: skip link exited current activity; guide button closure lost focus. Both reproduced before fixes, then keyboard regression passed. Whole suite green.
- Review limits: inaccessible live reference, real-device GPU lifecycle and deployment were not judged by reviewer. Source evidence follows the authorized GitHub fallback; deployment is verified separately.
- Browser QA uses production preview to avoid hot reload replacing a React context. The ending assertion waits for route scroll-to-top before simulating bottom scroll; actual mobile padding was sufficient.
