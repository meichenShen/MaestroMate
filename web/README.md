# MaestroMate — three rooms, one curious visit

An English / Chinese music demo built around Saint-Saëns’ **Aquarium**. Listen, composer Chat and music Play are independent destinations. **Program** is a separate, optional route through all three. The first-visit guide introduces two primary entrances; “Just looking for now” is a smaller action only in the entry dialog.

Live: https://maestromate-aquarium.chirpyapple14.chatgpt.site

Current exploratory audience: interested children6–12 with little music-theory experience. Peer usability pretests and child learning observations are separate; no child study or educational-effect validation has been completed.

## Development

Requires Node.js 24 (local preview/tests use its SQLite support).

```sh
cd web
npm ci --cache .tmp/npm-cache
npm test
npm run build
mkdir -p .tmp/feedback
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
| Pond shape, camera and shared HTML/fallback target positions         | `src/features/water/layout.ts`, `src/rendering/music-pool.ts`, `src/components/MusicPoolView.tsx`                  |
| Elastic artwork and thin spatial Program previews                   | `src/components/ElasticField.tsx`, `src/hooks/useSpringPointer.ts`, `src/features/home/surfaces.css`               |
| Large concert hall, camera orbit and instanced architecture         | `src/rendering/theatre.ts`, `hall-architecture.ts`, `hall-view.ts`, `orchestra.ts`, `components/TheatreStage.tsx` |
| Large icon geometry, stable hover entrances and path drawing        | `src/components/DrawnIcon.tsx`, `RoomPortal.tsx`                                                                  |
| Independent listening collection                                    | `src/features/library/ListeningLibrary.tsx`                                                                       |
| Program fold, vertical work previews and metadata                   | `src/features/home/Programme.tsx`                                                                                 |
| Program-only progress and next-step controls                        | `src/components/JourneyProgress.tsx`, `App.tsx`                                                                   |
| Message bubbles, suggested questions and retained turns             | `src/features/conversation/Conversation.tsx`, `useComposerChat.ts`, `conversation.css`                            |
| Play hub, catalogues and Learn / Try / Make workspace                 | `src/features/curriculum/`, `src/content/curriculum.ts`                                                            |
| Introductory guide and first-entry hierarchy                        | `src/components/Guide.tsx`, `EntryChoice.tsx`                                                                     |
| Glass-like fish, travel paths, procedural reef/water and fallback   | `src/rendering/aquarium.ts`, `swim.ts`, `underwater.ts`, `components/AquariumView.tsx`                            |
| Work facts, chapters and recording clip timestamps                   | `src/content/aquarium.ts`                                                                                         |
| Shared audio and player controls                                    | `src/audio/AudioProvider.tsx`, `components/Player.tsx`                                                            |
| Colours, fonts, sizes and breakpoints                               | `src/styles/tokens.css`, `layout.css`                                                                             |
| Activity sizing, question rail, previews and celebration            | `src/styles/upgrade.css`, `refinement.css`, `src/features/detective/detective.css`                                |
| Program ending and explicit restart                                 | `src/features/program/ProgramComplete.tsx`, `App.tsx`, `useComposerChat.ts`                                       |
| Scattered letter arrival                                            | `src/components/LetterHeading.tsx`                                                                                |
| Shared hover/focus hints and separate source-notes dialog           | `src/components/Hint.tsx`, `ContextPanel.tsx`                                                                     |
| Eased scrolling, homepage idle snapping and scene reveals           | `src/hooks/useSmoothPage.ts`                                                                                      |

Current content editing: `src/content/curriculum.ts` and `curriculum-extra.ts` own fourteen units, three checks per unit, teaching copy, answer targets and recording windows. `features/creation/` owns independent free studios. `src/content/knowledge/composer.ts` owns ten prepared replies, topic labels and knowledge cards; `sources.ts` owns source labels and links. `features/curriculum/curriculum.css` controls the independent catalogue, learning, assessment and making regions. `features/conversation/prepared-chat.css` keeps question text visible in the horizontal rail, after the baseline global styles.

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
| `#play`                                      | Three Play pillars                         |
| `#play/works`, `#play/lessons`, `#play/create` | Separate Play catalogues                    |
| `#play/works/aquarium/aquarium-layers`         | Work discovery: layers                     |
| `#play/lessons/pitch`                         | General music lesson                       |
| `#play/aquarium`                              | Optional Sound Detective                   |
| `#play/pool`                                 | Independent creative Music Pool           |
| `#program`                                   | Optional whole-work Program collection    |
| `#program/aquarium/listen`, `/chat`, `/learn` | Guided Program steps                      |
| `#program/aquarium/done`                     | End of the Program                        |

The old `#programme`, `#experiences` and `#work/aquarium/{theater,conversation,detective}` links remain supported. Old activity links open standalone rooms, never silently create a guided journey.

## Music Pool prototype

Create & play offers Music Pool and links into guided rhythm/layer making. Sound Detective remains an optional extra under the work catalogue. Pool is a creative experiment with C4,D4,E4,G4,A4; it does not claim to reproduce Aquarium's melody/harmony or extract instrumental stems. Tap a light or use keyboard A/S/D/F/G. Each note fills/replaces the selected one of eight steps and advances; selecting a step previews it, then a new note changes it. Delete/Backspace clears the selected step. Play my melody plays the eight half-beat slots once at100bpm; Stop and Start fresh cancel scheduled sounds. Sound and Motion controls are independent.

Melody state stays above route switches, within this visit; refreshing resets it. There is no recording, upload, export or permanent save. The existing MP3 element remains mounted and pauses on pool entry. A gesture-created Web Audio graph supplies original tones at a modest level with a compressor; Guide, page hiding, cancellation and leaving stop pending/active sound. Contexts close on unmount. The water is an original lazy Three.js renderer with analytic waves, not a fluid simulation. All controls remain normal HTML with keyboard/touch support; a static drawing remains usable if WebGL fails. The newer HTML-in-Canvas API is not required.

Only drawings/previews tilt or stretch. Titles and entry controls remain stationary through Program opening; reduced motion disables decorative transforms and continuous water frames. Aquarium-specific open-source candidates and license/asset cautions are in [the rendering research note](../docs/research/aquarium-rendering-references.md); this iteration keeps the existing listening aquarium.

The pond now uses a more top-down camera and capped width, independently of the note hit areas. Each note is one coloured point and letter; the keyboard mapping stays in the shared guide. `layout.ts` projects both the real renderer and its drawing fallback. Adjust basin proportions there, rather than stretching the entire scene to spread targets.

Program starts with a cover; opening it reveals two vertically arranged works. The thin leaves and artwork move while titles/buttons stay fixed. `public/images/program-cover.png` is captured from the actual Aquarium renderer, without player controls; regenerate with `node scripts/capture-program-cover.mjs` against a running preview. It uses the existing credited fish models. Portal art has a local radial SVG displacement filter driven by the same damped pointer spring. Its original technical field is generated with `node scripts/generate-elastic-field.mjs`; touch/reduced motion bypasses decorative filtering. Neither effect depends on HTML-in-Canvas or copied showcase artwork.

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

Each activity fits the desktop viewport rather than asking users to scroll to act. The player's actual height is observed so the scene and controls remain above it. Listening has its scene, chapters and onward link in that frame. Chat pairs a profile/topic rail with retained messages and compact question tiles. Full question text is always visible in a local horizontal rail, with Previous/More controls. Hover/focus may reveal supplementary function hints; tap works for info triggers. Source notes are a separate dialog that returns focus on close.

Music Detective keeps its full question visible. Its case overview is a native horizontal rail: three cards fit desktop, with arrows and scrolling when more content or a narrow viewport needs space. Counts and navigation boundaries come from the content array; the current demo still has three questions and one fixed answer stage. Previous/next changes content with an animation, retaining each answer. Audio sits beside the visible question; checking adds feedback beside the action without increasing the page height; a correct answer draws a circle/check flourish. All three discoveries replace the navigation's middle status with a completion mark. The third clue asks which clip repeats the same recording window as A. Each content entry's `replayClipIndex` selects the passage explained by its revealed answer. No second audio element or model is involved.

Prepared dialogue remains a fictional first-person adaptation based on Paris Opera/BnF sources, never a historical quotation. Desktop1440×900 and1024×768 are explicit no-document-scroll contracts. Narrow screens retain a readable vertical fallback; physical-phone performance is not claimed.

## Program ending and motion

`ProgramComplete` requests finite3D GPU fireworks in the existing theatre canvas and Home, Restart Program and Choose another Program. Explicit restart clears guided answers and composer messages, cancels pending replies and seeks the same player to0 paused. Normal room switching still preserves state. Reduced motion suppresses fireworks and letter movement. `LetterHeading` keeps one accessible heading label while visual letters settle from deterministic varied offsets; no commercial font or animation library is added. Portal descriptions occupy reserved space below the drawing/title, with keyboard/touch equivalents.

## Compact answer card and fireworks

The answer card has three grid rows: question/audio, choices, feedback/action. Question audio remains at the right after reveal, with its content-defined replay target. Previous/next stays outside the card with reserved space. The compact desktop treatment covers1366×600 and1366×640 as well as1440×900 and1024×768, including an expanded error player. Count typography uses explicit line height so it does not steal space from controls.

`rendering/fireworks.ts` owns one buffered particle draw call: four spatial bursts with soft cores, depth-sized sparks and ballistic trails, lasting7.9 active seconds. It shares the hall renderer and camera, stops when finished, freezes behind Guide/offscreen and disposes its own geometry/material. Reduced motion keeps a static hall. The shader age/size approach was researched in Max van Leeuwen's MIT example; choreography and shaders are adapted to this site without an added package or texture. See public credits for the reference/license. `hall-view.ts` owns pointer mapping and shared camera pose; projection tests confirm that the front opening follows the pointer, rather than merely checking an internal yaw sign.

## Historical v14 structure (superseded by the curriculum below)

`#play` now selects a work; Aquarium offers12 games, four at each difficulty. `#play/learn` and `#program/aquarium/learn` retain their existing entry URLs. `#play/learn/aquarium/0`, `/1`, `/2` open Notice, Explore and Invent directly; URL history updates the requested level. Unknown works show an unavailable page.

Active content/evaluation: `src/content/play/aquarium.ts`. Active UI: `src/features/workshop/{AquariumWorkshop,GamePieces,useWorkshopSound}.tsx` (sound hook is `.ts`) and `workshop.css`. Registry entries carry each work’s own games, goals, sources and clip windows. Future works need separately researched content and a reviewed recording/audio-provider integration; changing a label must never reuse Aquarium’s recording as another work. Only Aquarium is enabled now. The old generic learning component is retained as source history/reference but is no longer the active route.

Choices react on tap. Collect/order/rhythm/postcard/variation games offer nearby actions, visual slots and short clues. The help dialog holds explanations/sources. Recording windows use the existing persistent MP3; invented miniatures are labelled and synthesized separately. No stems or formal ABA analysis of Aquarium are claimed. State is per work/game above route changes, within this visit; refresh or Program restart clears it. The recap counts actual correct discoveries in each difficulty.

Pool is now rimless, radius3.8 with a soft fade and smooth analytic wave normals. Tap/paint the water or the five note targets to make a tune. Follow the fish plays3-,4-,5-note echo trails; wrong notes give a light hint without erasing the saved eight-step melody. Return to Paint a tune to edit/replay the melody. Echo uses the same gesture-created synth and cancels on Guide, hiding, mode change and leaving; short patterns end after their last note, without an empty eight-slot tail. Motion/reduced-motion, native HTML targets and the soft drawing fallback remain.

Chat, AI status, recording asset and private feedback schema remain unchanged. `npm run test:browser` now uses `workshop-browser.mjs` in place of obsolete v13 learning UI expectations. Old Detective links still work.


## Earlier Play curriculum (v15, superseded by v17 below)

The primary Play entrance has three pictorial doors: Explore a piece, Music lessons, Create & play. Aquarium has three connected discoveries: layers, instrument colour, repetition/variation. General music has three introductory lessons: pitch versus loudness, pulse/rhythm/rest, melody/accompaniment. These are learning goals, not difficulty labels. Additional works must supply their own recording-backed discoveries; Aquarium is the only enabled work.

Each unit has separate Learn, Try and Make views. Learn supplies a manipulable visual/sound example. Try has two focused checks, visible questions, feedback, retry and previous/next in a fixed stage. Both checks must be correct to continue to Make; all teaching and sibling units remain accessible. Make applies the same concept: rising pitches, sound/rest patterns, a varied ending, a sound palette or a two-layer miniature. Layer/pitch making starts with empty note spaces, and rhythm making starts with rests. Sound-colour making requires hearing the same tune with both characters. The chosen character, listening comparison and accompaniment setting live with the per-unit sketch. Creation succeeds only after a valid learner-built idea finishes playback; cancel/Guide/navigation cannot falsely finish it. Sketches can be sent to the existing eight-step Music Pool. Colour examples are synthesised, not recordings of the named score instruments; recorded excerpts are full mix.

Progress lives in App during this visit and is not permanent storage. Program recap counts the three work units only after both checks and the creative application; incomplete units remain honestly labelled. Restart clears that progress and prepared chat, retaining the single recording element. Legacy `#play/learn/aquarium/0|1|2` links map to the three work discoveries; `#program/aquarium/play` enters the new work learning route. The twelve-game workshop and generic trail remain as archived source/reference; they are not linked as the active curriculum. Fish-echo lifecycle tests remain in `tests/workshop-browser.mjs`, with the new curriculum contract in `tests/curriculum-browser.mjs`.

Prepared Chat now exposes a visible non-AI disclosure, ten suggested questions, a scrollable question rail, per-reply sources and a local knowledge shelf. Knowledge cards distinguish biography, score instrumentation, our produced recording and contemporary interpretation. Reply links connect to the corresponding work unit. No free input, API provider, credential, hosted AI index or model selector has been connected. The curated source layer is local data, ready to review before later API work. No new visitor data is collected.

Reference design research: Ableton Learning Music (concept → experiment), Chrome Music Lab (direct audio/visual manipulation) and the previously credited Smooothy interaction baseline. The curriculum illustrations and lesson code are original; no new runtime dependency, copied branded artwork or external animation asset is introduced. A music teacher should review the content with us before a child learning study; browser tests do not establish educational effectiveness.

## Source-backed AI conversation (v16)

Chat now keeps its visible prepared question rail and adds an opt-in Qwen conversation under **Settings**. The default remains prepared mode; it sends no generation requests. AI mode accepts a short free question as well as the same prompts. The visitor sees external-processing information before enabling AI. Qwen Plus and Qwen Flash are the only permitted models, selected in Settings; switching models retains the thread. Both run without hidden thinking. Replies are imagined first-person educational adaptations, not quotations. AI can still make mistakes: checked source IDs and prompts do not prove every sentence follows from its source.

The versioned knowledge collection is `src/content/knowledge/retrieval.ts`, with institutional facts, original-score information, the actual produced recording, introductory theory and separately labelled MaestroMate interpretations. It retrieves bounded notes rather than browsing the open web during a reply. `sources.ts` owns the actual links, `chat-contract.ts` the allowed models, `worker/chat.ts` provider calls and validation, and `features/conversation/` the independent UI/client. Add reviewed notes and source IDs here when adding a work; never invent references or present synth examples as recordings. There is no external vector service or editorial CMS yet.

**Runtime setup:** the published Site and the managed Cloud environment have separate secrets. In the existing Site's Settings → environment variables / Secrets, save `DASHSCOPE_API_KEY` as a **secret**, then deploy a version to apply that environment revision. The server calls the verified Beijing workspace at `https://ws-c2txvtn4vv1ihid0.cn-beijing.maas.aliyuncs.com/compatible-mode/v1`. A key for another workspace/region will need the matching endpoint and explicit model review. Do not paste keys into source, GitHub, browser storage, `VITE_*`, `.openai/hosting.json`, or chat. A managed Cloud placeholder works through that environment's proxy; it is not a deployable provider key.

For local preview, inject the real server variable with your secret manager, or use Node's `--env-file=.env.local` for a private ignored file. `scripts/preview-worker.mjs` forwards the server variable to the Worker. Managed Cloud may also need `NODE_USE_ENV_PROXY=1` to preserve its supplied proxy. Build with `npm run build`, then run `PORT=4173 npm run preview`. Never package `.env.local`. When the key is absent, `/api/chat/config` reports disabled, AI opt-in stays disabled, and prepared questions remain fully usable.

The public pilot uses a one-hour hashed capability; attempts are atomically capped at 20 per session/hour, 100 across the whole site/rolling 24 hours, and one every 2.5 seconds per session. Failed provider calls count too. Session minting is also bounded. Requests allow 600 characters, up to three bounded prior exchanges, 450 output tokens and a 20-second provider timeout. The private `chat_sessions` / `chat_requests` tables hold only temporary quota metadata, no questions/answers/IPs. Expired rows are pruned when a new session is minted. The thread stays only in the current page memory and is cleared on reload or Program restart. Alibaba Cloud separately processes submitted text under its own policy; do not promise zero provider retention or a guaranteed cash spending ceiling. Enable Alibaba's own budget/quota controls too.

This is a pilot, not a validated autonomous children's tutor. Ask parents/teachers to supervise first use, review sources and collect feedback before expanding the audience. Production readiness requires testing the deployed secret/provider connection; successful Cloud calls alone do not establish it. No automatic fall-through from an unavailable AI answer into an unlabelled prepared reply: the visitor explicitly chooses retry or the labelled prepared response.


## Independent Play paths (v17 — current)

The three catalogue doors are independent. Explore a piece has six Aquarium discoveries: the composer, Carnival history, original instruments, listening layers, score versus produced recording, and repetition/variation. Music lessons has eight numbered lessons, grouped First sounds (pitch/loudness, rhythm/rest, steps/leaps), Building music (melody/accompaniment, patterns/variation), and People & instruments (ensemble, musical roles, music in time). This is a reviewed introductory pilot sequence, not a comprehensive music qualification.

Learning now follows **Learn → three varied checks → Complete**. Free creation is not a completion requirement. Check formats include picture choices, tap-to-order notes/history, and building a sound/rest pattern. The central dock owns feedback and the sole primary next action. Correct answers emit a finite CSS particle burst; reduced motion shows the success message without particles. Explanations remain short; sources and longer background open in a separate dialog. Progress is counted only when all three checks are actually correct.

Create & play links only to Music Pool, Beat Studio and Melody Studio. The studios have their own eight-step drafts, playback, reset and optional accompaniment, no quizzes, scores or lesson progress. Drafts survive room changes during the current visit. The synthesised grid is an original sketch, not an Aquarium transcription or instrument recording. Existing `CreationBoard.tsx` remains archived source; it is no longer the active lesson/application gate. `CreativeStudio.tsx` owns the new free creation UI and `studio.css` its layout.

`study-flow.ts` defines local stage URLs: e.g. `#play/lessons/pitch/try/1` and `#program/aquarium/learn/aquarium-colour/done`. Back moves to the previous question, the same lesson's learning screen, then its area catalogue. Browser Back uses the same route history; a lesson does not send visitors to the top Play hub. Music Pool and both studios return to Create & play. A forged completion URL falls back to practice until the checks are correct. Unknown work/area/unit combinations remain unavailable. Program recap derives its denominator from the six work discoveries, while optional navigation remains open.

Interaction research: [Ableton Learning Music](https://learningmusic.ableton.com/) for ordered chapters; [Chrome Music Lab](https://musiclab.chromeexperiments.com/Experiments) and its [Apache2 source archive](https://github.com/googlecreativelab/chrome-music-lab) for immediate visual manipulation; [Tone.js](https://github.com/Tonejs/Tone.js) (MIT) was evaluated. We kept our existing Web Audio engine to avoid a second audio stack. No source/artwork was copied from these projects and no new runtime package was added.

Studio tempo is visit-local per draft (60–140 bpm). Each of the eight grid steps is an eighth note: **two steps per beat**. The scheduling interval is computed in the existing `PoolAudio.playLayers`; changing tempo stops the old schedule before editing the draft. Both layers use the same timeline/context. A local history helper reuses an actual preceding parent entry for Back and uses a replacement fallback for direct links, so mixing in-page Back with browser Back does not reopen the child. Restarting the Aquarium Program preserves standalone Music lesson progress and creative drafts.

## Conversation and navigation clarity (revision21)

Chat is organised into an illustrated composer introduction (expandable biography and source shelf) and the conversation. The question area exposes the AI switch, model selector and English/中文 selector directly. First AI activation shows a privacy dialog; model choice no longer requires Settings. Both prepared questions/replies and live AI replies support Chinese. Each turn retains its selected language; history is not silently rewritten. Source IDs and fictional-persona boundaries remain unchanged. Chinese free-question keywords retrieve the same reviewed notes. Chapter IDs/quiz logic stay stable while titles now use explicit subject names. Lessons have separate Previous and Exit lesson actions; Exit returns straight to the relevant catalogue. Homepage visual order is Listen, Chat, Play. Music Pool uses a contained control panel and a three-step visual prompt.

## Site-wide English / 中文

The persistent language picker in the top header controls the whole interface: home and entry guide, Listen and player, Chat, the fourteen learning units and quizzes, studios/Pool, Program recap, source dialogs and feedback. Chinese is initially selected for a Chinese browser; a saved explicit selection takes precedence. The preference is stored under `maestromate-language`. `document.lang` and the page title follow the selected language.

`src/i18n/locale.ts` owns the reactive visit-wide setting. Components subscribe with `useLocale()` and translate display text through `t()`. English source content, work/unit/answer IDs and event handlers stay canonical; switching language does not remount the shared audio provider or reset answers/drafts. `ui.zh.json` holds interface copy, `content.zh.json` holds educational copy, and `translate.ts` handles normalized keys plus dynamic labels. Add a Chinese entry when introducing new English copy; unknown copy falls back to its English original. Pitch letters, model brands, URLs and license identifiers remain unchanged. This is local reviewed translation, with no translation API.

Chat uses the same preference for new questions and API replies. Existing user input and AI reply snapshots are never translated as interface text. Per-question source evidence and the distinction between recording, score and synthetic examples remain unchanged. The optional Chat language selector edits the same global preference.

### Chinese copy, type and grounded answers

Chinese UI/lesson copy lives in `src/i18n/{ui,content}.zh.json`; the ten prepared replies live in `src/content/knowledge/chinese.ts`. Keep terms consistent: 音高 (pitch), 音色 (timbre), 响度 (perceived loudness), 音量 (player control), 速度 (tempo), 节奏 (rhythm). Prefer a concrete instruction or fact over motivational slogans. Static Chat copy uses the same catalogue; authored questions and saved replies remain unchanged.

`src/i18n/language.css` loads renamed, self-hosted SC subsets in `public/fonts/`, with source and OFL licence alongside them. Latin fonts are retained. GB2312 plus UI characters are covered; rarer Chinese characters use the system fallback. To regenerate, run `python3 scripts/subset-chinese-fonts.py --font-dir /path/to/noto-ttc` with fonttools[woff] installed; this is an optional asset-authoring step, not a build/runtime dependency. Check headings and prose at 1440×900, 1366×600 and 390×844 using `node tests/chinese-layout-browser.mjs`.

Chat reference notes and citations live in `src/content/knowledge/{retrieval,sources}.ts`. New facts require reviewed sources; a source ID alone does not establish that an answer is true. Retrieval ranks the current question first and uses up to three earlier user questions for elliptical follow-ups. The source collection distinguishes original scoring, another institution's performance analysis, our produced recording and contemporary visual interpretations. The server prompt requires plain, native-language explanations and forbids inferred personal feelings or forced closing invitations. Keep the existing opt-in, quota and server-only credential controls.

The composer introduction's six factual chapters live in `src/content/knowledge/biography.ts`, displayed by `features/conversation/ComposerBiography.tsx`. Their Chinese copy is in the shared UI catalogue. Keep this third-person biography separate from imagined Chat replies. Opening the biography scrolls within the existing desktop profile, preserving the question controls and page position.

### Creative instruments and patterns

Melody Studio and Music Pool default to a self-hosted sampled piano, with original glass-bell and bright-pluck synthesis as alternatives. Eight Salamander Grand Piano MP3 notes by Alexander Holm total581,803 bytes (CC BY3.0); provenance, source README and hashes are in `public/audio/piano/`, with a public credit link in creation. Samples are fetched only in relevant creative spaces, decoded into the same cancellable AudioContext, and never represented as parts of the Aquarium recording. `scripts/check-assets.mjs` verifies the sample manifest before building. No audio library or new runtime dependency is required.

`features/creation/music.ts` owns original starter phrases, three backing choices (chords/arpeggio/drum pulse) and drum-track conversion. Users can edit/reverse phrases, choose tempo and play them twice. Beat Studio has three independent drum tracks; creative drafts retain notes, sound, tempo and backing during navigation/language changes. Curriculum synth examples remain distinct. `features/water/audio.ts` owns source lifetimes, latest-pending-tap behavior, tempo and release tails; `piano.ts` owns the bounded preload cache. Tests: `node tests/creative-instruments-browser.mjs` with the preview running, alongside `npm test`.

Expanded Chat topics live in `src/content/knowledge/breadth.ts`. Retrieval keeps the editorial boundary available but only supplies life/work summaries when relevant. Explicit “what else” follow-ups use prior answers to avoid already covered notes; history remains untrusted as a factual source. Add source-backed topics and Chinese aliases together. The output budget is650 tokens; scope-dependent answer length does not alter the existing request quotas.

Chat reading layout: `features/conversation/prepared-chat.css` gives the thread most of the activity height, with one horizontal full-question suggestion rail and one asking row. The header expand control widens the conversation and hides suggestions by CSS, retaining the same thread, draft and opened sources. `node tests/chat-reading-browser.mjs` checks long-reply start/end access, expansion state and short/mobile layouts. Composer-difficulty notes distinguish documented production obstacles from musical analysis; ordinary reasoning and original teaching exercises are allowed without presenting them as remembered historical events.
