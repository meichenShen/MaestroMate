# MaestroMate — refine the approved rooms baseline

The user approves Sites version5 as the visual baseline and explicitly asks for unattended implementation while asleep, with desktop priority and restrained token use. Preserve routes, English typography, black background, independent rooms and optional Program. Record the approved state with Git tag `baseline/rooms-v5`; retain the existing branch/PR/site.

## Implementation calls

Use the existing React, Three.js, Lenis and native animation stack. A new rendering/animation framework or generated art would add cost and change the approved direction. No extra dependencies, alternative mockups or new approval round are needed for this detailed continuation.

- Replace green UI surfaces with neutral ink/violet, light periwinkle as the main accent, peach for Listen, lavender for Chat and warm yellow for Play. Retain the multi-colour room concept.
- Enlarge scattered drawn icons. Keep names and stable large link targets visible; supporting explanations reveal on hover or keyboard focus, and remain visible on touch. Move only artwork, not hit targets.
- Expand the original theatre with a cello, music stand and small brass instrument. Increase desktop presence and pointer-driven rotation; preserve a stable, smaller touch presentation and reduced-motion/offscreen lifecycle. Reuse this actual theatre as the Program ending illustration.
- Add authored seabed rocks/plants, water-light layers and depth to the listening scene, without photographic textures. Strengthen tail movement and maintain audio-time synchronization, pause, seeking and Motion off. Show Motion on as the default state through an accessible switch.
- Add Forward ten seconds using the existing clamped seek API. Keep one audio element and accessible controls.
- Narrow the message window and permit native page scrolling at thread boundaries. Reuse the existing reduced-motion scroll preference for latest-message navigation.
- Keep prepared replies clearly labelled as fictional first-person dialogue based on cited biographical facts. Add questions about childhood, Paris and Carnival's private origins; avoid invented historical quotations or fabricated intentions.
- Compose the desktop detective as overlapping story/listening and answer surfaces with clear hierarchy; retain simple narrow layouts. Add a finite, reduced-motion-safe completion flourish and a theatre-backed Program thank-you.
- Lengthen the ease-out settling near home scene anchors; keep continuous/interruptible input. Fix the previous320px Program content crop.

## Research

LOL Colors is the palette reference; the selected adapted palette is #B9B5FF/#FFAE9D/#F6D881/#9DCCFF. Codrops MagneticButtons informs artwork-only hover response; native CSS/Pointer Events implement it without moving button hit targets. Installed Lenis Snap supports the longer eased settle. Three.js geometry, fog and transparent layers supply the seabed. Paris Opera's composer biography and the BnF Saint-Saëns exhibition supply first-person script facts, paraphrased rather than quoted.

## Validation / limits

Behavior regressions first: forward seeking/clamping; motion default/state; thread-edge page scrolling versus internal history scrolling; first-person prepared dialogue; visible hover/focus explanations; illustrated ending. Run existing unit/audio/routes/keyboard/motion/context-loss checks once changes stabilize; inspect desktop1440px and basic390/320px bounds. No physical phone GPU or actual screen-reader voice claim. Publish exact committed source to the existing public Site and update its draft PR. Account balances are managed by the platform; no reset or paid-account mutation is attempted.
