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

| Change | File |
| --- | --- |
| Independent destinations and Program URLs | `src/navigation/routes.ts`, `useRoute.ts` |
| Persistent state and page composition | `src/App.tsx` |
| Brand and global Listen / Chat / Play / Program navigation | `src/components/BrandHeader.tsx` |
| Four homepage scenes, scattered entrances and contact links | `src/features/home/Home.tsx`, `home.css` |
| Actual 3D stage geometry, materials, lights and animation | `src/rendering/theatre.ts`, `components/TheatreStage.tsx` |
| Large icon geometry, stable hover entrances and path drawing | `src/components/DrawnIcon.tsx`, `RoomPortal.tsx` |
| Independent listening collection | `src/features/library/ListeningLibrary.tsx` |
| Program fold, vertical work previews and metadata | `src/features/home/Programme.tsx` |
| Program-only progress and next-step controls | `src/components/JourneyProgress.tsx`, `App.tsx` |
| Message bubbles, suggested questions and retained turns | `src/features/conversation/Conversation.tsx`, `useComposerChat.ts`, `conversation.css` |
| Independent game entrance and detective activity | `src/features/detective/GameRoom.tsx`, `Detective.tsx` |
| Introductory guide and first-entry hierarchy | `src/components/Guide.tsx`, `EntryChoice.tsx` |
| Live fish rendering, seabed and captured fallback | `src/rendering/aquarium.ts`, `underwater.ts`, `components/AquariumView.tsx` |
| Work facts, prepared answers, sources, chapters and clip timestamps | `src/content/aquarium.ts` |
| Shared audio and player controls | `src/audio/AudioProvider.tsx`, `components/Player.tsx` |
| Colours, fonts, sizes and breakpoints | `src/styles/tokens.css`, `layout.css` |
| Eased scrolling, homepage idle snapping and scene reveals | `src/hooks/useSmoothPage.ts` |

Each room has its own component. The shared player has one persistent audio element; moving between activities preserves playback and position. Directories and the homepage pause playback. Chat retains incoming/outgoing messages during navigation, including a reply pending when the user leaves; refreshing resets this state. No free text, accounts, AI calls or database are present. Sources remain available below individual replies and in recording credits.

## Routes

| URL hash | Destination |
| --- | --- |
| `#home`, `#explore`, `#journey`, `#about` | Homepage scenes |
| `#listen` → `#listen/aquarium` | Independent listening collection → room |
| `#chat` | Independent composer conversation |
| `#play` → `#play/aquarium` | Independent music games → Sound Detective |
| `#program` | Optional whole-work Program collection |
| `#program/aquarium/listen`, `/chat`, `/play` | Guided Program steps |
| `#program/aquarium/done` | End of the Program |

The old `#programme`, `#experiences` and `#work/aquarium/{theater,conversation,detective}` links remain supported. Old activity links open standalone rooms, never silently create a guided journey.

## Design and animation

Headings use Outfit350 and body text uses Onest, with normal-case readable labels. Black remains the main background. Light periwinkle `#B9B5FF`, peach `#FFAE9D`, yellow `#F6D881` and blue `#9DCCFF` adapt LOL Colors references, with neutral violet/ink panels. Green surfaces are removed. Entrances use enlarged, freely positioned Lucide shapes, animated stroke by stroke via native Web Animations. Names and arrows stay visible; hover/focus reveals descriptions. Only drawings follow a mouse; link targets stay still and touch keeps descriptions readable. Scene reveals arrive from different directions. Smooothy’s actual Draw source and Vivus informed the technique; no reference-site models or branded artwork are redistributed.

On the homepage, Lenis permits continuous wheel movement and its installed Snap extension aligns the nearest scene after input stops. Libraries, chat and games do not snap. The narrower conversation log scrolls internally and releases page scrolling at its ends; dialogs suspend snapping. Reduced-motion preference disables eased wheel/snap and animated reveals; coarse pointers also get native proximity snapping. Navigation remains available with normal links and the keyboard.

The approved version5 baseline is tagged `baseline/rooms-v5`. The theatre is original, texture-free Three.js geometry: piano, cello, horn, score stand, acoustic shells and curved steps. Desktop pointer rotation is more pronounced; touch stays stable. The same scene illustrates the Program ending. It is deliberately sculptural rather than photorealistic. The aquarium uses a real CC0 Microsoft/Khronos fish mesh with matte coloured materials, stronger audio-timed tail movement, original seabed geometry, depth lighting and translucent water-light layers. Motion on is the default accessible switch state; device reduced motion still takes precedence. Generated theatre, portrait, swan and environment rasters from the previous version are removed from the current website. The single fallback image is a captured frame of the actual fish renderer.

`python scripts/optimize-fish.py` downloads a fixed upstream model revision, checks its hash, preserves geometry and removes photographic textures. The final model is129,452 bytes (original12.49MB). Source, transformations and hashes are in `public/models/ATTRIBUTION.md`. Three.js is loaded only for scenes that need it. Renderers pause when offscreen/hidden; reduced motion freezes decoration. WebGL failure leaves accessible navigation and working audio. Native phone GPU performance has not been measured.

## Recording

Kevin MacLeod’s Aquarium (ISRC USUAN1900026), approximately144 seconds, is stored locally under CC BY4.0. See [recording attribution](public/audio/ATTRIBUTION.md). Changing the recording requires reviewing every timestamp. Scenes and chat are explicitly contemporary interpretations, not claims about Saint-Saëns’ intentions. The Swan remains a clearly disabled coming-soon entry.

## GitHub, publishing and cleanup

The existing `feat/aquarium-demo` branch stores source, necessary media and instructions. Preserve research and `old version/`; Git history replaces dated copies. Dependencies, `dist/`, `.tmp/`, caches and secrets stay out of GitHub. Only clear reproducible files belonging to this project.

Keep the existing public Sites project in `.openai/hosting.json`. Build and commit the website, then run `python web/scripts/prepare-site-source.py` from the repository root in a PTY. The helper accepts native short-lived credentials on hidden stdin, pushes the committed `web/` subtree, verifies the SHA and packages `dist/` with the hosting manifest. Never put credentials in files, command arguments or logs. Save/deploy through native Sites tools; record returned provenance in `VERIFICATION.md`.

## Baseline refinement details

The player now offers both backward and forward ten-second controls through the same clamped seek API. Program rooms have a visible top shortcut as well as onward controls after the activity. The desktop detective arranges listening evidence and answers on overlapping surfaces, with a finite Encore illustration after both clues. The Program ending returns to the concert stage.

Prepared dialogue uses first-person fictional adaptations with Paris Opera/BnF biographical sources, linked behind individual replies. It covers early musical life, La Madeleine, teaching and the private origins of Carnival; replies are never labelled historical quotations. Latest-message navigation respects reduced motion. The homepage's longer quintic ease-out adds gentle braking near its scene anchors, while input stays interruptible. The previous320px Program crop is fixed with content-based height. Desktop is the current design priority; basic narrow-layout checks remain part of the regression.
