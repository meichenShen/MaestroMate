# MaestroMate: independent rooms and an optional Program

The user's new instruction is the binding specification: Listen, composer Chat and music Play are independent destinations. A Program is an optional guided journey through the three. Keep browsing subordinate. Chat must retain sent/received messages using suggested prepared questions, without free AI. Remove the ruled-grid look; add large freely placed drawn icons, directional entry animation, deliberate page settling after scrolling, warmer English copy and an actual deliberately designed3D theatre (not generated/photo imagery). Keep approved Outfit/Onest and mainly black; reference LOL Colors.

## Architecture and boundaries
- `navigation/routes.ts` pure parser/builders: standalone listen picker/activity, Chat, Play picker/game; Program picker and guided activities; home scene anchors. Preserve old work hashes as standalone aliases.
- `App.tsx`: one persistent AudioProvider, route composition and shared question/game/chat state. No common three-tab activity panel outside Program. Journey progress/next shown only within Program.
- `features/library/ListeningLibrary.tsx`, home Programme: distinct listening selection versus a guided Program collection. Same fixed Aquarium recording; Swan is coming soon.
- `features/conversation/useComposerChat.ts` and `Conversation.tsx`: ordered message turns and delayed prepared replies, state preserved across routes, cleanup, no textbox. Chat thread scroll is independent of page snapping.
- `hooks/useSmoothPage.ts`: Lenis plus its installed Snap extension only on home scenes, with idle debounce; no snapping in libraries/activities/chat. Reduced-motion and modal/nested-scroll exclusions. All observers/targets torn down on routes.
- `components/DrawnIcon.tsx`: large Lucide geometry, measured stroke drawing via Web Animations, inspired by Smooothy Draw/Vivus. Native observer/directional transitions, accessible visible labels.
- `components/TheatreStage.tsx`, `rendering/theatre.ts`: original texture-free3D concert diorama, delegated as an isolated render domain; parent owns routing/publishing.
- Existing AquariumView/model: retain real mesh but use designed matte LOL palette instead of photo/generated environment; static fallback must be a captured frame of real rendering. Remove generated artwork from live UI.

## Research applied
- LOL Colors: #67D5B5 #EE7785 #C89EC4 #84B1ED, used as accents over black.
- Smooothy actual source: staggered SVG paths via getTotalLength and draw animation; eased scrolling/3D presentation. https://github.com/vallafederico/smooothy
- Lenis1.3.27 `lenis/snap` is installed (MIT); use idle mandatory alignment without lock, normal continuous scrolling remains interruptible. https://github.com/darkroomengineering/lenis
- Vivus (MIT) path-drawing technique, implemented with existing DOM/Web Animations, no extra dependency. https://github.com/maxwellito/vivus

## Work and verification
1. Write failing route/unit and browser contracts proving standalone/guided separation, message accumulation, snap settling/no snap inside chat. Observe red before production changes.
2. Implement routes, independent pages, optional Journey; message-history hook and UI; update navigation/guide/copy.
3. Implement home scenes, drawn icons and Lenis snap; integrate original theatre and designed fish rendering. Keep source components independent and test failure/reduced-motion/offscreen paths.
4. Production build, unit tests, primary journeys/real audio/game/context-loss/keyboard, desktop/mobile captures and actual scroll test. One final fresh review under executing-plans, fix important findings with regression tests.
5. Update docs and PR; publish exact committed web subtree to existing public Site. Record deployment provenance and limits.

## Ledger
- Start69fd641 on existing feature branch. No new worktree/dependency copy.
- Ruling: later explicit permission for drawn icons supersedes earlier no-handdraw preference only for icons. Main3D geometry remains designed, texture-free and non-photorealistic. User supplied detailed correction and asks realization; no new imagegen/mockup approval loop.
- Only the theatre renderer is delegated under the applicable independent-domain parallel skill. App/navigation/chat remain owned by parent; one fresh review at end.

- Route contracts first failed on missing navigation module, then passed2/2. Browser room contracts first failed on standalone chat in the old site, then passed after independent routes/message history. Guided-next accessible labels were fixed after the browser identified the arrow-name mismatch.
- Homepage wheel/nested-thread/reduced-motion test passed against the implemented interaction. No lock is applied during continuous input; idle alignment uses the installed Lenis Snap extension.
- Deep-link first Tab regression reproduced an unwanted initial main focus. `tests/focus.mjs` failed before the fix and passed after main focus was limited to actual hash navigation, including under StrictMode.
- Recording failure test initially changed only the hash on an already loaded persistent audio element; that cannot create a network failure. Corrected test isolation to a fresh page with the MP3 request aborted before navigation. No production audio change was required.
- Original theatre geometry was inspected in both isolated and integrated desktop/mobile captures. Current fish fallback was recaptured from the matte real renderer. Old generated rasters are removed from the live asset directory; prior research and history remain.
- Unit suite5/5 and production build passed. Full8-script browser suite and final fresh review are the remaining gates before publication.
