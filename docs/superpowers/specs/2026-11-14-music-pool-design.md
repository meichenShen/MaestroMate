# Music Pool and tactile surfaces — approved prototype iteration

The user chose all three previously presented directions and explicitly asked to try them in the existing site. Continue the approved black/cyan/rose/amber baseline in English, aimed at interested beginners including children6–12. Preserve Listen/Chat/Play independence and the optional Program, the one persistent recording player, private feedback and the existing detective.

## Scope / approach

- Add **Music Pool** to the Play room as a second independent activity at `#play/pool`. Five notes(C4,D4,E4,G4,A4), ordinary large accessible buttons, sound and finite water ripples, eight editable sequence steps, play/stop/clear, keyboard A/S/D/F/G. An original Three.js pond supplies depth and reflected light; real HTML controls stay stable and readable. This is an explicitly labelled creative experiment, not an excerpt of Saint-Saëns or a substitute for the existing three clues. No recordings, accounts or uploaded audio are involved.
- Keep the main recording paused while in the pool. Web Audio starts on deliberate interaction, modest default volume, and stops on navigation, page hide or Guide/entry overlays; pending resume/playback must not restart later. A drawing fallback retains all controls if WebGL fails. Reduced motion/static mode retains audio/sequence functionality without continuous animation.
- Add thin spatial layers and a damped tilt to Program covers/previews. Keep vertical browsing, two work entries, coming-soon state, existing entry labels and stationary controls. No first-person room navigation.
- Give the three homepage portal drawings spring movement, mild squish and recovery; their links and titles remain stationary. Touch and reduced motion keep stable navigation. Avoid per-frame React updates.
- Research aquarium-specific open-source implementations, verify primary-source licenses, and record candidates/tradeoffs. Do not replace the listening aquarium with the pond. A substantial listening-scene change needs a selected aquarium direction.

## Alternatives considered

Native HTML-in-Canvas would allow HTML textures but requires browser support the audience cannot assume. User selected the effects; use existing Three.js + HTML/CSS to reproduce the intended interactions and preserve broad functionality. A full 3D navigable site would add navigation demands without helping the approved activities. Original procedural geometry/shaders avoid new runtime assets/dependencies and preserve the user's rendered, simple style.

## Review focus

Rapid notes, edits during playback, repeated play/stop, async AudioContext.resume interrupted by a modal/navigation, page hiding, unavailable AudioContext/WebGL, reduced motion, short desktop viewport and touch. No duplicate HTMLAudioElement, accidental Program route, moving click targets, or exposure of private feedback data. All scheduled sounds and rendering resources must be released. Keep captions distinct from historical claims.

## Prototype decisions

Five-note C pentatonic set and eight half-beat slots at100bpm are builder defaults for a small usable sample; they are not claimed to be Aquarium's melody or harmony. Nonempty step click previews and selects it; the next note replaces it and advances. Clear stops playback. Original graphics and sound synthesis are authored for the site. The user can revise this prototype after trying it.
