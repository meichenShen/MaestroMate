# MaestroMate — three rooms, one curious visit

An English music demo built around Saint-Saëns’ **Aquarium**. Listen, composer Chat and music Play are independent destinations. **Program** is a separate, optional route through all three. The first-visit guide introduces two primary entrances; “Just looking for now” is a smaller action only in the entry dialog.

Live: https://maestromate-aquarium.chirpyapple14.chatgpt.site

## Development

Requires Node.js 22.18+ (24 recommended).

```sh
cd web
npm ci --cache .tmp/npm-cache
npm run dev
npm test
npm run build
npm run preview -- --port 4173
```

With the production preview running: `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser`. Tests use `/usr/bin/chromium` (override `CHROMIUM_PATH`) and the actual MP3. Screenshots and transient results stay in ignored `.tmp/qa/`. Keep the production build unchanged during a browser run.

## Editing map

| Change                                                              | File                                                                                                              |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Independent destinations and Program URLs                           | `src/navigation/routes.ts`, `useRoute.ts`                                                                         |
| Persistent state and page composition                               | `src/App.tsx`                                                                                                     |
| Brand and global Listen / Chat / Play / Program navigation          | `src/components/BrandHeader.tsx`                                                                                  |
| Four homepage scenes, scattered entrances and contact links         | `src/features/home/Home.tsx`, `home.css`                                                                          |
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
| Activity sizing, question rail, previews and celebration            | `src/styles/upgrade.css`, `refinement.css`                                                                        |
| Program ending and explicit restart                                 | `src/features/program/ProgramComplete.tsx`, `App.tsx`, `useComposerChat.ts`                                       |
| Scattered letter arrival                                            | `src/components/LetterHeading.tsx`                                                                                |
| Shared hover/focus hints and separate source-notes dialog           | `src/components/Hint.tsx`, `ContextPanel.tsx`                                                                     |
| Eased scrolling, homepage idle snapping and scene reveals           | `src/hooks/useSmoothPage.ts`                                                                                      |

Each room has its own component. The shared player has one persistent audio element; moving between activities preserves playback and position. Directories and the homepage pause playback. Chat retains incoming/outgoing messages during navigation, including a reply pending when the user leaves; refreshing resets this state. No free text, accounts, AI calls or database are present. Sources remain available below individual replies and in recording credits.

## Routes

| URL hash                                     | Destination                               |
| -------------------------------------------- | ----------------------------------------- |
| `#home`, `#explore`, `#journey`, `#about`    | Homepage scenes                           |
| `#listen` → `#listen/aquarium`               | Independent listening collection → room   |
| `#chat`                                      | Independent composer conversation         |
| `#play` → `#play/aquarium`                   | Independent music games → Sound Detective |
| `#program`                                   | Optional whole-work Program collection    |
| `#program/aquarium/listen`, `/chat`, `/play` | Guided Program steps                      |
| `#program/aquarium/done`                     | End of the Program                        |

The old `#programme`, `#experiences` and `#work/aquarium/{theater,conversation,detective}` links remain supported. Old activity links open standalone rooms, never silently create a guided journey.

## Design and animation

Headings use Outfit350 and body text uses Onest, with normal-case readable labels. Black remains the main background. The user-selected LOL palettes supply cyan `#45D9FD`, rose `#EE2560`, amber `#FFDA8E`, sky `#80D4F6` and auxiliary lavender `#A593E0`, with black/ink panels. Green surfaces are removed. Entrances use enlarged, freely positioned Lucide shapes, animated stroke by stroke via native Web Animations. Names and arrows stay visible; hover/focus reveals descriptions. Only drawings follow a mouse; link targets stay still and touch keeps descriptions readable. Scene reveals arrive from different directions. Smooothy’s actual Draw source and Vivus informed the technique; no reference-site models or branded artwork are redistributed.

On the homepage, Lenis permits continuous wheel movement. After280ms without wheel input, a scene aligns only if the intended stopping point is within18% of viewport height; stops farther away remain free. `src/navigation/scene-settle.ts` owns that proximity rule. Libraries, chat and games do not snap. Desktop activity workspaces fit the available viewport above the measured player. Chat history scrolls internally; its question controls stay visible. Notes open in a separate dialog, and dialogs suspend homepage snapping. Reduced-motion preference disables eased wheel/snap and animated reveals; coarse pointers also get native proximity snapping. Navigation remains available with normal links and the keyboard.

The approved version5 baseline is tagged `baseline/rooms-v5`. The original roof-open concert hall now contains486 seats,13 curved rows, two balconies, acoustic architecture and a detailed music stage. Passive hover spans about25° with time-based damping. A primary press must hit actual hall geometry before a wide drag begins; releasing retains the chosen view. Arrow keys and Home reset remain available. The stage now has43 abstract orchestra stations covering strings, woodwinds, brass and percussion, a conductor and a smaller detailed piano; `orchestra.ts` instances shared geometry/material pairs. Motion during modal overlays is suspended, reduced motion keeps explicit keyboard/drag control, and touch scrolling remains safe. The same hall illustrates the Program ending.

The aquarium uses the CC0 Microsoft/Khronos fish geometry with physical transmission materials. Fish cross the water on deterministic audio-time paths, turn with their direction of travel and move through depth. Original reef, branches, bubbles and procedural caustic/ripple shaders replace the formerly sparse backdrop. Seeking reproduces the same positions; pausing/Motion off/reduced-motion behavior preserves the existing controls. The fallback is a captured frame of the actual renderer.

`python scripts/optimize-fish.py` downloads a fixed upstream model revision, checks its hash, preserves geometry and removes photographic textures. The final model is129,456 bytes (original12.49MB). Source, transformations and hashes are in `public/models/ATTRIBUTION.md`. Three.js is loaded only for scenes that need it. Renderers pause when offscreen/hidden; reduced motion freezes decoration. WebGL failure leaves accessible navigation and working audio. Native phone GPU performance has not been measured.

## Recording

Kevin MacLeod’s Aquarium (ISRC USUAN1900026), approximately144 seconds, is stored locally under CC BY4.0. See [recording attribution](public/audio/ATTRIBUTION.md). Changing the recording requires reviewing every timestamp. Scenes and chat are explicitly contemporary interpretations, not claims about Saint-Saëns’ intentions. The Swan remains a clearly disabled coming-soon entry.

## GitHub, publishing and cleanup

The existing `feat/aquarium-demo` branch stores source, necessary media and instructions. Preserve research and `old version/`; Git history replaces dated copies. Dependencies, `dist/`, `.tmp/`, caches and secrets stay out of GitHub. Only clear reproducible files belonging to this project.

Keep the existing public Sites project in `.openai/hosting.json`. Build and commit the website, then run `python web/scripts/prepare-site-source.py` from the repository root in a PTY. The helper accepts native short-lived credentials on hidden stdin, pushes the committed `web/` subtree, verifies the SHA and packages `dist/` with the hosting manifest. Never put credentials in files, command arguments or logs. Save/deploy through native Sites tools; record returned provenance in `VERIFICATION.md`.

## Desktop activity workspaces

Each activity fits the desktop viewport rather than asking users to scroll to act. The player's actual height is observed so the scene and controls remain above it. Listening has its scene, chapters and onward link in that frame. Chat pairs a profile/topic rail with retained messages and compact question tiles. Hover/focus shows the full question or function; tap works for info triggers. Source notes are a separate dialog that returns focus on close.

Music Detective keeps its full question visible. Its case overview is a native horizontal rail: three cards fit desktop, with arrows and scrolling when more content or a narrow viewport needs space. Counts and navigation boundaries come from the content array; the current demo still has three questions and one fixed answer stage. Previous/next changes content with an animation, retaining each answer. Checking replaces the centre visual with animated feedback without increasing the page height; a correct answer draws a circle/check flourish. All three discoveries replace the navigation's middle status with a completion mark. The third clue asks which clip repeats the same recording window as A. Each content entry's `replayClipIndex` selects the passage explained by its revealed answer. No second audio element or model is involved.

Prepared dialogue remains a fictional first-person adaptation based on Paris Opera/BnF sources, never a historical quotation. Desktop1440×900 and1024×768 are explicit no-document-scroll contracts. Narrow screens retain a readable vertical fallback; physical-phone performance is not claimed.

## Program ending and motion

`ProgramComplete` shows finite SVG fireworks and Home, Restart Program and Choose another Program. Explicit restart clears guided answers and composer messages, cancels pending replies and seeks the same player to0 paused. Normal room switching still preserves state. Reduced motion suppresses fireworks and letter movement. `LetterHeading` keeps one accessible heading label while visual letters settle from deterministic varied offsets; no commercial font or animation library is added. Portal descriptions occupy reserved space below the drawing/title, with keyboard/touch equivalents.
