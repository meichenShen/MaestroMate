# MaestroMate — a listening room

An English, Smooothy-inspired music experience built around Saint-Saëns' **Aquarium**. The homepage offers work-first, experience-first and browsing entrances. The vertical programme keeps previews inside each work; Aquarium is playable and The Swan is explicitly a coming-soon placeholder. The first-visit guide can be reopened from the header.

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
| Theatre entrance, activity entries, about and feedback links | `src/features/home/Home.tsx` |
| Programme cover, work previews and work metadata | `src/features/home/Programme.tsx` |
| Introductory guide | `src/components/Guide.tsx` |
| Original unlit 3D studies and static fallback | `src/components/Sculpture.tsx` |
| Precise outline icons | `src/components/Mark.tsx` |
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

Desktop work pages place the activity next to contextual notes. At 720px, notes move below the activity and the player uses two rows; at 380px, notes become one column. Heights follow content, and work pages reserve space below the fixed player. Programme items always scroll vertically.

Hash routes (`#programme`, `#experiences`, `#about`, `#work/aquarium/theater`, `conversation`, `detective`) support browser back/forward. One AudioProvider stays mounted across every route. Changing activities preserves playback position and answer state; returning to the homepage pauses audio. Page refresh resets activity progress; the guide is remembered only for the browser session. Composer questions are scripted, with no free text or model calls.

## Visual references and assets

The design follows Smooothy's black/white base, large playful type, Geist text, precise SVG line reveals, eased scrolling and unlit 3D. The actual source and its own preview images were inspected at commit `a235a4867e21a0428b62d2340fcf8c71c6e94fdf`. This site uses original music sculptures and open DynaPuff typography, rather than copying food assets, branded lettering or a separately licensed display font. Attribution and licenses are in `public/credits/`.

There are no rejected concept images, paper textures, glossy lighting, glass effects or external 3D downloads. Local fonts and the recording ship with the site. WebGL has a static fallback; reduced-motion preferences disable eased scrolling and continuous sculpture animation. Offscreen sculpture rendering pauses.

## Recording

Kevin MacLeod's Aquarium (ISRC USUAN1900026), approximately 144 seconds, is stored locally under CC BY 4.0. See [recording attribution](public/audio/ATTRIBUTION.md) for source and checksum. Changing the recording requires checking every timestamp. Visual chapters are editorial interpretations, not claims about the composer's intentions. This prototype has not been evaluated for learning outcomes.

## GitHub, publishing and cleanup

Source, necessary media and documentation live in the existing GitHub repository on `feat/aquarium-demo`. Preserve research and `old version/`; use Git history rather than dated source copies. Dependencies, `dist/`, `.tmp/`, logs and secrets are ignored. Only remove verified reproducible files for this project. Never clear other projects or app-wide caches.

Keep `.openai/hosting.json` and the existing public Sites project. Build and commit the website, then run `python web/scripts/prepare-site-source.py` from the repository root in a PTY. The helper accepts native Sites short-lived credentials on hidden stdin, pushes the committed `web/` subtree, verifies its SHA and packages `dist/` plus the hosting manifest. Credentials must never enter files, command arguments or logs. Save and deploy that version through the native Sites tools. Deployment records are in `VERIFICATION.md`.
