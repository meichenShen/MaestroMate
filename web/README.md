# MaestroMate — three rooms, one curious visit

An English music demo built around Saint-Saëns’ **Aquarium**. Listen, composer Chat and music Play are independent destinations. **Program** is a separate, optional route through all three. The first-visit guide introduces two primary entrances; “Just looking for now” is a smaller action only in the entry dialog.

Live: https://maestromate-aquarium.chirpyapple14.chatgpt.site

Current exploratory audience: interested children6–12 with little music-theory experience. Peer usability pretests and child learning observations are separate; no child study or educational-effect validation has been completed.

## Development

Requires Node.js 24 (local preview/tests use its SQLite support).

```sh
cd web
npm ci --cache .tmp/npm-cache
npm test
npm run build
PORT=4173 npm run preview
```

With the production preview running: `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser`. The preview runs the real Worker handler with a persistent SQLite database at `.tmp/feedback/local.sqlite`; it does not write production feedback. For hot reload, also run `npm run dev`; its `/api` proxy expects the Worker preview on port8787 (the default). Rebuild/restart preview after Worker changes. Tests use `/usr/bin/chromium` and the actual MP3. Screenshots and transient results stay in ignored `.tmp/qa/`. Keep the production build unchanged during a browser run.

## Editing map

| Change                                                              | File                                                                                                              |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Independent destinations and Program URLs                           | `src/navigation/routes.ts`, `useRoute.ts`                                                                         |
| Persistent state and page composition                               | `src/App.tsx`                                                                                                     |
| Brand and global Listen / Chat / Play / Program navigation          | `src/components/BrandHeader.tsx`                                                                                  |
| Four homepage scenes, scattered entrances and contact links         | `src/features/home/Home.tsx`, `home.css`                                                                          |
| Anonymous feedback form, API and database schema                    | `src/features/feedback/`, `worker/feedback.ts`, `db/schema.ts`, `drizzle/`                                          |
| Music Pool notes, eight-step melody and local synthesized audio     | `src/features/water/{MusicPool.tsx,model.ts,audio.ts,music-pool.css}`                                                |
| Original procedural water and stable note positions                 | `src/rendering/music-pool.ts`, `src/components/MusicPoolView.tsx`                                                   |
| Elastic artwork and thin spatial Program previews                   | `src/hooks/useSpringPointer.ts`, `src/animation/spring.ts`, `src/features/home/surfaces.css`                        |
| Large concert hall, camera orbit and instanced architecture         | `src/rendering/theatre.ts`, `hall-architecture.ts`, `hall-view.ts`, `orchestra.ts`, `components/TheatreStage.tsx` |
| Large icon geometry, stable hover entrances and path drawing        | `src/components/DrawnIcon.tsx`, `RoomPortal.tsx`                                                                  |
| Independent listening collection                                    | `src/features/library/ListeningLibrary.tsx`                                                                       |
| Program fold, vertical work previews and metadata                   | `src/features/home/Programme.tsx`                                                                                 |
| Program-only progress and next-step controls                        | `src/components/JourneyProgress.tsx`, `App.tsx`                                                                   |
| Message bubbles, suggested questions and retained turns             | `src/features/conversation/Conversation.tsx`, `useComposerChat.ts`, `conversation.css`                            |
| Independent game entrance and detective activity                    | `src/features/detective/GameRoom.tsx`, `Detective.tsx`                                                            |
| Introductory guide and first-entry hierarchy                        | `src/components/Guide.tsx`, `EntryChoice.tsx`                                                                     |
| Glass-like fish, travel paths, procedural reef/water and fallback   | `src/rendering/aquarium.ts`, `swim.ts`, `underwater.ts`, `components/AquariumView.tsx`                            |
| Work facts, prepared answers, sources, chapters and clip timestamps | `src/content/aquarium.ts`                                                                                         |
| Shared audio and player controls                                    | `src/audio/AudioProvider.tsx`, `components/Player.tsx`                                                            |
| Colours, fonts, sizes and breakpoints                               | `src/styles/tokens.css`, `layout.css`                                                                             |
| Activity sizing, question rail, previews and celebration            | `src/styles/upgrade.css`, `refinement.css`, `src/features/detective/detective.css`                                |
| Program ending and explicit restart                                 | `src/features/program/ProgramComplete.tsx`, `App.tsx`, `useComposerChat.ts`                                       |
| Scattered letter arrival                                            | `src/components/LetterHeading.tsx`                                                                                |
| Shared hover/focus hints and separate source-notes dialog           | `src/components/Hint.tsx`, `ContextPanel.tsx`                                                                     |
| Eased scrolling, homepage idle snapping and scene reveals           | `src/hooks/useSmoothPage.ts`                                                                                      |

Each room has its own component. The shared player has one persistent audio element; moving between activities preserves playback and position. Directories and the homepage pause playback. Chat retains incoming/outgoing messages during navigation, including a reply pending when the user leaves; refreshing resets this state. Composer chat has no free input, accounts or AI calls. Only the optional feedback form uses a database. Sources remain available below individual replies and in recording credits.

## Feedback for the owner

“Tell us how it felt” opens an account-free form. It saves the note, type, optional reply email, route and timestamp in the private Sites D1 `DB` binding. It does not create a GitHub issue or send an automatic email. “Say hello on GitHub” is a separately labelled external repository link.

To see feedback, open this Site’s **Settings → database viewer**, select `DB` and `feedback`, or ask Codex to retrieve/summarize recent feedback using the native Sites database tools. Messages and email addresses must not be copied into the public repository, logs or screenshots. There is no public read/list endpoint or visitor admin page. The capability/session table contains only hashed short-lived anonymous write tokens, without IP addresses; old capability rows are pruned on new session issuance. Feedback is retained until the owner removes it through the platform’s database management; no deletion or export endpoint is public.

The UI preserves drafts in component memory (not browser storage) after errors or dismissal. Receipt requires an acknowledged durable write; exact retries reuse an idempotency ID. A temporary same-origin capability, schema/body limits and per-capability/global intake limits bound anonymous writes. This is lightweight demo spam protection, not identity verification; a determined sender can consume the shared quota. No CAPTCHA/account service is introduced.

For schema changes, edit `db/schema.ts`, run `npx drizzle-kit generate`, review and commit generated SQL plus `drizzle/meta/`. Sites applies these migrations before deploying the Worker. The build stages them under `dist/.openai/drizzle`. Never create or alter schema in a request handler. `npm run test:feedback` runs the API contracts and, with preview running, a browser submission inspected through an independent local database connection. Do not call a local preview check a production delivery test.

## Routes

| URL hash                                     | Destination                               |
| -------------------------------------------- | ----------------------------------------- |
| `#home`, `#explore`, `#journey`, `#about`    | Homepage scenes                           |
| `#listen` → `#listen/aquarium`               | Independent listening collection → room   |
| `#chat`                                      | Independent composer conversation         |
| `#play` → `#play/aquarium`                   | Independent music games → Sound Detective |
| `#play/pool`                                 | Independent creative Music Pool           |
| `#program`                                   | Optional whole-work Program collection    |
| `#program/aquarium/listen`, `/chat`, `/play` | Guided Program steps                      |
| `#program/aquarium/done`                     | End of the Program                        |

The old `#programme`, `#experiences` and `#work/aquarium/{theater,conversation,detective}` links remain supported. Old activity links open standalone rooms, never silently create a guided journey.

## Music Pool prototype

Play offers Sound Detective and Music Pool as separate activities. Pool is a creative experiment with C4,D4,E4,G4,A4; it does not claim to reproduce Aquarium's melody/harmony or extract instrumental stems. Tap a light or use keyboard A/S/D/F/G. Each note fills/replaces the selected one of eight steps and advances; selecting a step previews it, then a new note changes it. Delete/Backspace clears the selected step. Play my melody plays the eight half-beat slots once at100bpm; Stop and Start fresh cancel scheduled sounds. Sound and Motion controls are independent.

Melody state stays above route switches, within this visit; refreshing resets it. There is no recording, upload, export or permanent save. The existing MP3 element remains mounted and pauses on pool entry. A gesture-created Web Audio graph supplies original tones at a modest level with a compressor; Guide, page hiding, cancellation and leaving stop pending/active sound. Contexts close on unmount. The water is an original lazy Three.js renderer with analytic waves, not a fluid simulation. All controls remain normal HTML with keyboard/touch support; a static drawing remains usable if WebGL fails. The newer HTML-in-Canvas API is not required.

Only drawings/previews tilt or stretch. Titles and entry controls remain stationary through Program opening; reduced motion disables decorative transforms and continuous water frames. Aquarium-specific open-source candidates and license/asset cautions are in [the rendering research note](../docs/research/aquarium-rendering-references.md); this iteration keeps the existing listening aquarium.

## Design and animation

Headings use Outfit350 and body text uses Onest, with normal-case readable labels. Black remains the main background. The user-selected LOL palettes supply cyan `#45D9FD`, rose `#EE2560`, amber `#FFDA8E`, sky `#80D4F6` and auxiliary lavender `#A593E0`, with black/ink panels. Green surfaces are removed. Entrances use enlarged, freely positioned Lucide shapes, animated stroke by stroke via native Web Animations. Names and arrows stay visible; hover/focus reveals descriptions. Only drawings follow a mouse; link targets stay still and touch keeps descriptions readable. Scene reveals arrive from different directions. Smooothy’s actual Draw source and Vivus informed the technique; no reference-site models or branded artwork are redistributed.

On the homepage, Lenis permits continuous wheel movement. After280ms without wheel input, a scene aligns only if the intended stopping point is within18% of viewport height; stops farther away remain free. `src/navigation/scene-settle.ts` owns that proximity rule. Libraries, chat and games do not snap. Desktop activity workspaces fit the available viewport above the measured player. Chat history scrolls internally; its question controls stay visible. Notes open in a separate dialog, and dialogs suspend homepage snapping. Reduced-motion preference disables eased wheel/snap and animated reveals; coarse pointers also get native proximity snapping. Navigation remains available with normal links and the keyboard.

The approved version5 baseline is tagged `baseline/rooms-v5`. The original roof-open concert hall now contains486 seats,13 curved rows, two balconies, acoustic architecture and a detailed music stage. Passive hover spans about34° with time-based damping. The hall opening follows the pointer in both axes. A primary press must hit actual hall geometry before a wide drag begins; releasing retains the chosen view. Arrow keys and Home reset remain available. The stage now has43 abstract orchestra stations covering strings, woodwinds, brass and percussion, a conductor and a smaller detailed piano; `orchestra.ts` instances shared geometry/material pairs. Motion during modal overlays is suspended, reduced motion keeps explicit keyboard/drag control, and touch scrolling remains safe. The same hall illustrates the Program ending.

The aquarium uses the CC0 Microsoft/Khronos fish geometry with physical transmission materials. Fish cross the water on deterministic audio-time paths, turn with their direction of travel and move through depth. Original reef, branches, bubbles and procedural caustic/ripple shaders replace the formerly sparse backdrop. Seeking reproduces the same positions; pausing/Motion off/reduced-motion behavior preserves the existing controls. The fallback is a captured frame of the actual renderer.

`python scripts/optimize-fish.py` downloads a fixed upstream model revision, checks its hash, preserves geometry and removes photographic textures. The final model is129,456 bytes (original12.49MB). Source, transformations and hashes are in `public/models/ATTRIBUTION.md`. Three.js is loaded only for scenes that need it. Renderers pause when offscreen/hidden; reduced motion freezes decoration. WebGL failure leaves accessible navigation and working audio. Native phone GPU performance has not been measured.

## Recording

Kevin MacLeod’s Aquarium (ISRC USUAN1900026), approximately144 seconds, is stored locally under CC BY4.0. See [recording attribution](public/audio/ATTRIBUTION.md). Changing the recording requires reviewing every timestamp. Scenes and chat are explicitly contemporary interpretations, not claims about Saint-Saëns’ intentions. The Swan remains a clearly disabled coming-soon entry.

## GitHub, publishing and cleanup

The existing `feat/aquarium-demo` branch stores source, necessary media and instructions. Preserve research and `old version/`; Git history replaces dated copies. Dependencies, `dist/`, `.tmp/`, caches and secrets stay out of GitHub. Only clear reproducible files belonging to this project.

Keep the existing public Sites project in `.openai/hosting.json`. Build and commit the website, then run `python web/scripts/prepare-site-source.py` from the repository root in a PTY. The helper accepts native short-lived credentials on hidden stdin, pushes the committed `web/` subtree, verifies the SHA and packages `dist/` with the hosting manifest. Never put credentials in files, command arguments or logs. Save/deploy through native Sites tools; record returned provenance in `VERIFICATION.md`.

## Desktop activity workspaces

Each activity fits the desktop viewport rather than asking users to scroll to act. The player's actual height is observed so the scene and controls remain above it. Listening has its scene, chapters and onward link in that frame. Chat pairs a profile/topic rail with retained messages and compact question tiles. Hover/focus shows the full question or function; tap works for info triggers. Source notes are a separate dialog that returns focus on close.

Music Detective keeps its full question visible. Its case overview is a native horizontal rail: three cards fit desktop, with arrows and scrolling when more content or a narrow viewport needs space. Counts and navigation boundaries come from the content array; the current demo still has three questions and one fixed answer stage. Previous/next changes content with an animation, retaining each answer. Audio sits beside the visible question; checking adds feedback beside the action without increasing the page height; a correct answer draws a circle/check flourish. All three discoveries replace the navigation's middle status with a completion mark. The third clue asks which clip repeats the same recording window as A. Each content entry's `replayClipIndex` selects the passage explained by its revealed answer. No second audio element or model is involved.

Prepared dialogue remains a fictional first-person adaptation based on Paris Opera/BnF sources, never a historical quotation. Desktop1440×900 and1024×768 are explicit no-document-scroll contracts. Narrow screens retain a readable vertical fallback; physical-phone performance is not claimed.

## Program ending and motion

`ProgramComplete` requests finite3D GPU fireworks in the existing theatre canvas and Home, Restart Program and Choose another Program. Explicit restart clears guided answers and composer messages, cancels pending replies and seeks the same player to0 paused. Normal room switching still preserves state. Reduced motion suppresses fireworks and letter movement. `LetterHeading` keeps one accessible heading label while visual letters settle from deterministic varied offsets; no commercial font or animation library is added. Portal descriptions occupy reserved space below the drawing/title, with keyboard/touch equivalents.

## Compact answer card and fireworks

The answer card has three grid rows: question/audio, choices, feedback/action. Question audio remains at the right after reveal, with its content-defined replay target. Previous/next stays outside the card with reserved space. The compact desktop treatment covers1366×600 and1366×640 as well as1440×900 and1024×768, including an expanded error player. Count typography uses explicit line height so it does not steal space from controls.

`rendering/fireworks.ts` owns one buffered particle draw call: four spatial bursts with soft cores, depth-sized sparks and ballistic trails, lasting7.9 active seconds. It shares the hall renderer and camera, stops when finished, freezes behind Guide/offscreen and disposes its own geometry/material. Reduced motion keeps a static hall. The shader age/size approach was researched in Max van Leeuwen's MIT example; choreography and shaders are adapted to this site without an added package or texture. See public credits for the reference/license. `hall-view.ts` owns pointer mapping and shared camera pose; projection tests confirm that the front opening follows the pointer, rather than merely checking an internal yaw sign.
