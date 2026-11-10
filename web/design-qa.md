# v8 — clear questions, softer motion and a full orchestra

The approved black/cyan/rose/amber palette is unchanged. Current ignored production evidence is under `.tmp/qa/v8/`.

- `hall.png`: wider stage with25 string,8 woodwind,7 brass,2 percussion and1 conductor stations, an original detailed small grand piano, chairs, scores and stepped section placement. Shared geometry is instanced by family/material. Audience architecture and486 seats remain. Actual camera tests distinguish gentle hover from a wide deliberate mesh drag and verify durable release.
- `question.png`, `reveal-1024.png`: full prompt stays below the title before and after reveal, with no info-button prerequisite. Case overviews form an extensible native horizontal rail; current content remains three questions. Answer/reveal/previous/next stay in one desktop frame. Short-laptop checks include the expanded audio-error player.
- `preview-hover.png`, `preview-hover-1024.png`: hovered descriptions sit below the icon/title in reserved space rather than over the drawing. Bounds checks cover all icons, not just the matching icon. Visual QA found a higher-specificity inherited grey colour; the contrast regression failed before selector correction and passes afterward.
- `ending.png`: three clear completion choices, Home, Restart Program and Choose another Program, alongside the orchestra hall. Finite SVG fireworks decorate arrival; reduced motion suppresses them. The inspected static capture uses reduced motion, so it intentionally does not show a fireworks frame. Explicit restart resets answers/history and cancels pending replies without replacing audio.
- Home headings use readable accessible labels with original deterministic per-letter offset/rotation/stagger. Reduced-motion captures remain static. Home settling uses an18%-of-viewport proximity threshold after280ms, allowing deliberate stops away from a scene edge.
  -390px captures keep readable vertical fallbacks and no horizontal page overflow. Desktop remains the priority. Physical-phone GPU/touch and spoken screen-reader output have not been measured.

The final twelve-script production suite and twelve unit tests pass. One fresh final review found a modal-interrupted orbit defect, fixed through an actual Guide RED→GREEN regression; no new minors. Deployment provenance is recorded in `VERIFICATION.md`. Prior QA is retained below as history; current behavior supersedes its passive360° camera and mandatory snap descriptions.

---

# v7 — brighter rooms and bounded activity workspaces

The user's latest LOL palettes supersede v6: cyan `#45D9FD`, rose `#EE2560`, amber `#FFDA8E`, lavender `#A593E0`, sky `#80D4F6`, cream and black. Desktop retains Outfit/Onest and independent rooms with an optional Program.

## Actual inspected production captures

Evidence is ignored under `.tmp/qa/v7/`:

- `home-final.png`: the full original cutaway auditorium fills the right side, with486 instanced seats,13 floor rows, two balcony levels and the piano/cello/horn stage. Light stone, cyan, rose and lavender replace the previous small greenish plinth. Wide pointer yaw is exercised against actual camera state; focused arrows/Home and drag are alternatives. Left copy keeps a dark contrast field.
- `aquarium-final.png`, `aquarium-travel-8s.png`: authored sand, rocks, branching coral, bubbles and procedural water caustics surround seven physical-material fish. They travel across width/depth using absolute audio time, not just tail motion in place. The scene uses deep blue and luminous pastel/rose fish, no green material. Poster is captured from this renderer, not generated art.
- `game-final.png`, `game-feedback.png`, `game-next.png`: three coloured case overviews remain together; the active answer stage, reveal and previous/next controls fit above the player. Feedback replaces the central illustration, with a finite drawn check animation for a correct answer. Short answer tiles stay visible; information is revealed on hover/focus or by the info button.
- `chat-reply.png`: rose outgoing message, independent artist/topic rail, real ordered replies and compact prompt tiles; topic switching retains history. A fixed desktop thread reserves space for controls. First-person replies remain explicitly imagined and individually sourced.
  -390px activity captures have readable vertical fallbacks. The complete real-audio regression exposed a320px completion-row overflow only after all three clues were revealed; the completion text now wraps between retained previous/next targets instead of forcing the page wider.

## Verification boundary

Unit contracts11/11 pass; TypeScript, recording integrity and production build pass. The final eleven-script browser suite passes, including workspace3/3, upgrade6/6 and refinement7/7 contracts; real-audio/state, six widths, keyboard/focus, snapping, freeze and context-loss regressions remain green. The fresh review verified short-laptop Program pages with an expanded error player; its replay finding is covered by a new RED→GREEN regression. Tooltip Escape dismissal is a deferred minor. Final full-suite and publication evidence is in `VERIFICATION.md`. Tests use Chromium and actual local production assets. Physical-phone GPU/touch, spoken screen-reader output and the user's final aesthetic judgement are not established by these checks. Native Sites deployment establishes publication separately; a workspace file link is not the public website.

---

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
