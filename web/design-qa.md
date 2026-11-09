# Approved baseline refinement — design QA

Baseline: public Sites version5, Git tag `baseline/rooms-v5`. The user explicitly approves this direction and asks for desktop-first refinement, retaining independent rooms/optional Program, black and Outfit/Onest. Current production captures are in ignored `.tmp/qa/polish/`.

## Inspected evidence

- `home.png`, `theatre-pointer-left.png`, `theatre-pointer-right.png`: expanded original concert geometry with piano, cello, horn and stand. Pointer positions produce visibly different3D orientations; the copy and entrance remain usable. Touch/reduced-motion keeps the stable composition.
- `rooms-final.png`: enlarged peach/lavender/yellow icons, freely staggered positions, visible names/arrows. Hover/focus reveals supporting information. Target bounds do not move; touch keeps explanations readable. Initial capture revealed inherited grey icon colour and was corrected before final verification.
- `aquarium-final.png`: original seabed, rocks, gently swaying stems, translucent light layers and clear foreground/background separation. Initial fog washed out the foreground; final density/exposure restores lighter colours. Fish tails use stronger audio-timed deformation. Default Motion on state is explicit, and Next: Chat is visible above the scene.
- `chat-final.png`: narrower thread, neutral violet panels, six visible prepared prompts above the desktop player. Reduced thread height keeps controls reachable. First-person messages are labelled fictional adaptations, with factual sources disclosed individually.
- `game.png`, `game-ending.png`: desktop listening evidence and answer surfaces overlap with distinct hierarchy; completion adds a finite musical flourish. Program thank-you `ending-final.png` returns to the authored theatre.
- `journey-320.png`: a320×667 content-height scene now scrolls to its CTA/attribution instead of clipping them. Scripted bounds also checked chat/listening and the page width. Mobile remains functional; desktop gets visual priority.

## Verification

Five unit tests and the production build pass. The complete nine-script Chromium suite passes, including seven new behavioral contracts. Existing checks retain actual MP3/clip/error recovery, both clues, routes/state, six widths, player clearance, keyboard/focus, continuous scroll/settling, reduced motion, freeze and WebGL-loss coverage. New behavior first failed against baseline before implementation.

One bounded fresh-context final review found no actionable regressions. Its extra production probes verified Lenis thread chaining at both boundaries, stationary hover targets, keyboard hints and the finite completion/retry behavior. No extra packages or copied source trees were added.

## Limits

These are local production Chromium checks and actual inspected screenshots. They do not establish physical-phone GPU/touch performance, spoken screen-reader behavior or the user's final aesthetic approval. Native Sites results establish publication separately. Composer facts were checked against the opened Paris Opera biography and BnF exhibition; source links are external, while the working site assets remain local.
