# MaestroMate — a listening room

An English music experience built around Saint-Saëns' **Aquarium**, using the approved Outfit + Onest direction and a modern thin programme. The homepage offers work-first, experience-first and browsing entrances. The vertical programme keeps previews inside each work; Aquarium is playable and The Swan is explicitly a coming-soon placeholder. The first-visit guide leads to two prominent pictorial entrance choices; the subordinate “Just looking for now” action exists only in that dialog. “Start here” reopens the choices and “Guide” reopens onboarding.

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

With the production preview running, run `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser`. Browser tests use `/usr/bin/chromium` (override `CHROMIUM_PATH`) and the real MP3. Results and screenshots go to ignored `.tmp/qa/`. Do not edit source during a test of the development server: hot reload replaces React contexts and can invalidate the test. The optional `QA_AUDIO_FIXTURE=1 node tests/browser.mjs` uses test-only synthesized media; it is never deployed and does not verify the recording.

## Editing map

| Change | File |
| --- | --- |
| Brand and main navigation | `src/components/BrandHeader.tsx` |
| Theatre backdrop, large activity entries, about and feedback links | `src/features/home/Home.tsx` |
| Programme cover, work previews and work metadata | `src/features/home/Programme.tsx` |
| Introductory guide | `src/components/Guide.tsx` |
| First-entry hierarchy | `src/components/EntryChoice.tsx` |
| Live 3D integration and static fallback | `src/components/AquariumView.tsx` |
| PBR lights, model animation and render lifecycle | `src/rendering/aquarium.ts` |
| Shared model/texture loading | `src/rendering/model.ts` |
| Interface icons | Lucide React imports inside the relevant components |
| Palette, fonts, page spacing and shared dimensions | `src/styles/tokens.css` |
| Header, work columns, fixed player and responsive breakpoints | `src/styles/layout.css` |
| Homepage composition and programme layout | `src/features/home/home.css` |
| Individual activity presentation | `src/styles/experience.css` (separate activity sections) |
| Listening, scripted conversation and detective logic | `src/features/theater/`, `conversation/`, `detective/` |
| Work facts, questions, sources, chapters and clip timestamps | `src/content/aquarium.ts` |
| Shared audio and clip-end logic | `src/audio/AudioProvider.tsx` |
| Player controls | `src/components/Player.tsx` |
| Optional eased scrolling and reveal observation | `src/hooks/useSmoothPage.ts` |
| Navigation and transient session state | `src/App.tsx` |

Work pages give the activity the full width. Contextual notes and recording sources sit in an expandable section below. At 720px the player uses two rows; homepage experience portals become one column and programme metadata remains below each preview. Heights follow content, and work pages reserve space below the fixed player. Programme browsing always stays vertical.

Hash routes (`#programme`, `#experiences`, `#about`, `#work/aquarium/theater`, `conversation`, `detective`) support browser back/forward. One AudioProvider stays mounted across every route. Changing activities preserves playback position and answer state; returning to the homepage pauses audio. Page refresh resets activity progress; the guide is remembered only for the browser session. Composer questions are scripted, with no free text or model calls.

## Visual direction, 3D and assets

Font A uses Outfit 350 for headings and Onest for body copy. Body text is approximately18px, with normal-case labels and larger readable controls. The black background remains; colour comes from the artwork and small restrained accents. The selected thin-page concept informs the programme, with a light fold transition, large previews and two complete vertically stacked works visible on desktop. Homepage experiences are large pictorial portals; work notes are folded into an expandable section below the full-width activity.

`AquariumView` displays real-time textured 3D fish using Three.js, a CC0 Microsoft BarramundiFish model distributed by Khronos, direct lights and an environment map. It reads music time, playback rate, pause and motion state; it never creates audio. A single downloaded model/texture promise is shared, while each renderer owns animated materials and environment resources. Geometry stays unchanged on disk; WebP texture repacking reduces the original12.49MB file to0.64MB. Details and checksums are in `public/models/ATTRIBUTION.md`. To reproduce optimization, put the original at `.tmp/modern-render/barramundi-original.glb`, then run `python scripts/optimize-fish.py` (requires Pillow).

The theatre, underwater environment, swan, imagined composer sculpture and detective symbol are generated raster assets with realistic rendered 3D art direction. They are images rather than live 3D models. The aquarium poster is a captured frame of the actual renderer and is also the fallback. These assets are stored locally in `public/images/`; visitors do not need access to outside model/font hosts.

Smooothy's actual code and preview images informed textured asset use, minimal presentation and eased interaction. `ScottieFox/caustic-volume` was reviewed as a water-light technical reference; its simulation is not bundled. Source and font licenses are linked from `public/credits/README.txt`.

Reduced motion and Motion off freeze decorative rendering while music continues. Offscreen/hidden pages suspend the animation loop. WebGL or model-load failure leaves a real rendered poster visible and all audio controls usable. App-owned observers, materials, environment render targets, renderer and WebGL context are released on unmount.

## Recording

Kevin MacLeod's Aquarium (ISRC USUAN1900026), approximately 144 seconds, is stored locally under CC BY 4.0. See [recording attribution](public/audio/ATTRIBUTION.md) for source and checksum. Changing the recording requires checking every timestamp. Visual chapters are editorial interpretations, not claims about the composer's intentions. This prototype has not been evaluated for learning outcomes.

## GitHub, publishing and cleanup

Source, necessary media and documentation live in the existing GitHub repository on `feat/aquarium-demo`. Preserve research and `old version/`; use Git history rather than dated source copies. Dependencies, `dist/`, `.tmp/`, logs and secrets are ignored. Only remove verified reproducible files for this project. Never clear other projects or app-wide caches.

Keep `.openai/hosting.json` and the existing public Sites project. Build and commit the website, then run `python web/scripts/prepare-site-source.py` from the repository root in a PTY. The helper accepts native Sites short-lived credentials on hidden stdin, pushes the committed `web/` subtree, verifies its SHA and packages `dist/` plus the hosting manifest. Credentials must never enter files, command arguments or logs. Save and deploy that version through the native Sites tools. Deployment records are in `VERIFICATION.md`.
