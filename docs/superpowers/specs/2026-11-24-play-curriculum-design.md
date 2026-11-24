# MaestroMate: learn, try, make (API deferred)

User authorization: implement the previously discussed redesign except external API integration, then publish a version for review. Preserve the approved visual baseline, English copy and black/cyan/rose/amber/lavender palette.

## Approach
Replace the active twelve-game difficulty grid with three Play pillars: Explore a piece, Music lessons, Create & play. Reuse the recording provider, local synth, water instrument and original renderers. Keep old game content/source files as an archive; legacy learning URLs open the new work curriculum. A cosmetic relabel would retain the confusing learning order; an entirely new game engine would discard working accessible tools.

## Curriculum
Six short units: Aquarium layers, original instrument colours, repetition/variation; general pitch (separate from loudness), beat/rhythm/rest, melody/accompaniment. Each begins with a manipulable visual demonstration, then two small checks with teaching feedback, then an open or rule-based creative application. Teaching and assessment occupy separate screens in one fixed desktop workspace; questions remain visible. Previous/next stay in place. Learning is always revisit-able; the two checks must be answered correctly before guided continuation to Make. Direct exploration remains available from catalogues and the pool.

Original recording passages are labelled full-mix excerpts. Generated sounds are clearly labelled original teaching examples, never stems or Saint-Saëns transcriptions. Score instrumentation is differentiated from this produced recording. Creative rules assess the taught concept, not one arbitrary melody.

## Chat without API
Curated local knowledge cards with institution/score/recording citations; reusable topic/question data separate from UI. Prepared replies stay in first-person imagined voice, with visible disclosure. Suggested questions have visible prompts and a local scroll rail. No free input, model selector or fake live AI. No external API requests, credentials, new backend endpoints or new data collection.

## Connections and progress
Listen discoveries link to the corresponding work unit; Chat links to the topic's Play unit; Make can send the user's eight-note sketch to Music Pool. App owns per-unit progress across routes; Program summary counts checked work-unit completion (two checks plus successful application). Restart clears the new curriculum progress and chat, retaining the shared audio provider. Invalid unit/work IDs resolve to a clear unavailable state, never inherited object properties.

## Visual/accessibility/verification
Large original SVG diagrams, motion tied to playback and interaction, visible 44px controls, no green panels. Keyboard buttons and native ranges; finite/reduced-motion-safe animations, no compulsory drag. Desktop operations fit 1366x600 and 1024x768 viewports; phone may scroll between content sections but has no horizontal overflow. Preserve audio cancellation on Guide, hide, mute and navigation. Keep sources in a focus-restoring dialog. Run curriculum tests, the existing unit suite, real-browser routes/learning/chat/pool/Program/keyboard/layout checks, build and public Sites deployment. Preserve feedback DB and source history.
