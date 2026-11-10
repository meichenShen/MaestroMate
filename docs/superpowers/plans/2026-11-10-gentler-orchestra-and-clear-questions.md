# Clear questions, a gentler orchestra hall and Program celebration

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Continue inline implementation; one fresh final review, no per-feature agents.

**Goal:** Apply the user's concrete v7 feedback without changing the approved colours or independent room structure.
**Architecture:** Keep one audio provider and bounded activity workspaces. Extract a data-driven case navigator, a Program completion component, an authored orchestra builder and a reusable letter-arrival heading. Existing Three.js/React/Lenis and CSS/WAAPI suffice; no new dependency.
**Spec:** The user's current detailed request and screenshots are the binding design; continuing the already-authorized inline execution/public release workflow.

## Global constraints
- Black with #45D9FD / #EE2560 / #FFDA8E, Outfit/Onest, all English. Preserve research/baseline/history; ignored .tmp for artifacts.
- Desktop answers/reveal/previous/next remain in one viewport above the measured player. Same recording/provider, no free AI or new invented questions.
- Question prompts are essential visible content, not tooltips. Navigation remains ready for more content items without hardcoded count3.
- Hover gives gentle local camera parallax. Only a primary pointer press hitting the hall geometry starts a wide drag; add damping, preserve accumulated orbit on release, keyboard/reset/reduced motion/touch/modal/lifecycle safeguards.
- Home scroll correction only near a scene stop; allow free stops farther away. Heading characters settle from varied short offsets; readable static fallback and reduced motion.
- Program ending: finite fireworks; Home, Restart Program, Choose another Program. Explicit restart clears guided answers/chat, cancels pending reply and restarts audio at0 paused; no audio remount.
- Portal previews occupy reserved space outside drawing bounds; no icon/entry obstruction, focus/touch equivalence.

## Review focus
1. Revealed answers plus longer visible prompts at1024×768, Program shortcut and expanded error player: controls/readable content must not overlap or clip.
2. Drag begun on blank canvas or links, lost capture/modal/hidden tab: no unintended orbit or stuck interaction.
3. Restart during a pending composer reply: no stale message appears in a new visit.
4. Overflowing case navigation: selected item visible without moving document vertically; count/disabled boundaries derived from data.
5. Reduced motion and interrupted/reentered heading/firework animations: no invisible text, infinite decoration or orphaned resources.

## Tasks
### 1. Clear activity and completion interactions
Files: Detective.tsx, CaseNavigator.tsx, ProgramComplete.tsx, App.tsx, useComposerChat.ts, refinement.css, tests/clarity.mjs.
- [x] RED: prompt visible without hover at1440×900 and1024×768; case track scroll/keyboard; three completion exits and restart resets answers/audio/chat.
- [x] Implement explicit prompt + scalable horizontal overview, fixed-stage proportions; finite SVG fireworks, three exits, reset callback.
- [x] GREEN the focused contracts. Commit with ledger evidence.

### 2. Controlled hall and full orchestra
Files: hall-view.ts, theatre.ts, orchestra.ts, hall-architecture.ts, TheatreStage.tsx; hall-view.test.mjs, clarity.mjs.
- [x] RED: passive span<=30°, drag span>90°, blank press ignored, easing not instant; all four orchestra families in authored geometry.
- [x] Implement gentle hover offset plus durable drag base, mesh hit-test, slower time-based damping; enlarge stage, orchestra sections and conductor podium, retain detailed small piano.
- [x] GREEN unit/actual camera contracts and inspect rendered hall. Commit.

### 3. Softer scroll, letter motion and unobstructed previews
Files: useSmoothPage.ts, LetterHeading.tsx, Home.tsx, RoomPortal.tsx, refinement.css; snap.mjs, clarity.mjs.
- [x] RED: free stop outside scene proximity, close stop settles; portal hint/icon nonintersection; readable individually animated heading chars/reduced fallback.
- [x] Implement proximity Snap at18% viewport after280ms with softer easing; deterministic per-letter transforms and finite stagger; reserved hint space and stable targets.
- [x] GREEN focused contracts, update changed legacy expectations, run unit/build/full browser suite, inspect desktop/phone production screenshots.

## Ledger
Pre-flight: activity prompt consumes existing q.prompt; navigator consumes question metadata/current keyed progress and emits onSelect, does not own playback. Completion emits onRestart to Site which resets existing state/provider. Orchestra uses existing tracked geometry/material factories, so theatre disposal stays authoritative. Heading animation is isolated from parent reveal transforms. User's explicit gentle-hover request supersedes v7 full-turn passive mapping; no other aesthetic redesign.

- Task1: initial five visual/interaction contracts failed5/5 against v7. Visible prompt, scalable rail and Program completion/reset contracts then passed3/3 at1440×900,1024×768 and390px. Pending reply reset is covered separately; all6 clarity contracts passed on production before the final contrast correction.
- Task2: passive-view units initially failed2/3, actual pointer regression confirmed −108°→144° without pressing. New units/hall drag regression pass; blank-canvas press is ignored, release retains orbit. Orchestra initially failed with missing module, then passed its family/stage-envelope/instance-budget check. Geometry covers25 string,8 woodwind,7 brass,2 percussion and1 conductor stations; detailed piano retained smaller.
- Task3: preview/nonintersection and letter contracts initially failed; now pass. A450px wheel probe confirmed v7 could force914px; a360px pattern happened to remain free, so that weaker gesture alone was not evidence of the desired invariant. The pure proximity contract first failed with missing helper, then passed. Use the actual intended Lenis target with an18% threshold rather than the old mandatory Snap's velocity-biased estimate. Near-stop, free-stop, nested chat and reduced-motion browser checks pass.
- Production captures inspected: hall, question,1024px revealed answer, Program ending, and actual hovered preview cards. Checks confirm each hint avoids all three icon bounds. Visual inspection found old higher-specificity text colour leaking into the pale card: contrast regression failed, then selector specificity was corrected for desktop and touch. Final production rebuild and full regression follow, then one fresh review and publication.
- Additional review-focus probes reproduced two concrete edge failures before final review: the expanded141px error player left a two-line reveal overlapping options at1024×768, and hiding a tab during captured drag retained the grabbing state. Compact layout now reserves80px for the central reveal by reducing secondary spacing; the full-question/error-player contract passes. Hidden/offscreen drag cancellation and a lost-button guard preserve the current view and clear capture; its actual camera regression follows.
- Task2 final drag/cancellation regression passed, including tab hiding, blank press, intentional wide orbit and retained release. Latest unit suite12/12 and production build pass. The complete12-script browser suite and one fresh whole-iteration review are the final gates; keep runtime/build fixed during them.
- One fresh final review of5b5484e..c662867 found one Important issue: modal motion suspension cleared an in-progress drag before committing yaw/pitch to the durable base, so resumed hover could return toward the old orientation. No Critical or new Minor findings. Existing Hint Escape behavior remains outside this iteration. A real Guide-open/close interruption regression is being run RED→GREEN before the one fix pass and final full suite; no re-review.
- Final review fix pass: real Guide interruption reproduced119.6°→41.5° return (RED). setMotion now calls the existing cancellation path before clearing captured input, committing displayed yaw/pitch to durable base. The same actual-camera/modal probe passes GREEN; unit12/12 and production rebuild pass. The complete pre-fix12-script suite had passed, and the final fixed-build suite is now running. No second review.
- Final: fixed modal-interrupted durable orbit — actual Guide open/close test RED119.6°→41.5°, then GREEN with a small resumed hover and preserved orbit. Final unit12/12, build, and complete12-script production browser suite all pass (exit0), including6 clarity and6 upgrade contracts. Runtime/build remained fixed during the final run. No new deferred minor or second review. Ready for exact-source public publication.
- Published version8, public audience unchanged, native succeeded2026-11-10T03:28:52Z. GitHuba5bcf89cbc0f7a86795bd89f4395c8bd4b4d7bb1 → verified Sites source5ed917407323272b7aa14f869e3b017d936276ba; deployment appgdep_6af28f6cb1608191841a2f3be981caf4. Exact provenance in web/VERIFICATION.md. PR2 stays draft, final scope/validation updated; no merge. Direct public browser handoff requested. Only docs follow publication.
