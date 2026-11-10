# MaestroMate project conventions

- The active website is in `web/`; preserve the research documents, assets and `old version/`.
- Keep navigation, work introduction, contextual notes and player as separate components. Keep each activity in its own feature directory.
- Shared audio belongs to one provider above the activity switch. Never mount another audio element for a question or remount it when switching activities.
- Put recording-specific content, questions, chapter times and attribution in `web/src/content/`. Changing a recording requires reviewing every timestamp.
- Use `web/src/styles/tokens.css` for design variables and `layout.css` for column widths and responsive breakpoints. Avoid cross-feature CSS dependencies.
- Put short-lived downloads, QA screenshots, logs and packaging artifacts under the ignored `web/.tmp/` directory. Do not create dated copies of the source tree; use Git history.
- Do not commit dependencies, build outputs, caches, secrets or test artifacts. Keep original source material and Git history. Only remove verified reproducible artifacts belonging to this project; never clear app-wide or other projects' caches.
- Keep browser QA and the editing guide current after behavior changes. Public publishing is authorized for this demo; preserve that audience on updates.
- Approved visual direction: Outfit + Onest, mainly black, readable normal-case copy and large rendered imagery. Keep artwork in the programme and keep its browsing vertical.
- First-entry choices have two primary pictorial actions. Just looking is a subordinate action only in that dialog; do not turn it into a homepage feature.
- Real-time fish rendering belongs in `web/src/rendering/` and `AquariumView`; pre-rendered illustrations belong in `web/public/images/`. Preserve that distinction in credits and claims. Model/source licenses live with the assets.

- Listen, Chat and Play are independent routes/features. Program is an optional guided route through them; show progress/next only for explicit Program URLs.
- Retain ordered prepared chat turns above route switches; do not turn them into one replaceable answer or enable free AI input.
- Home-only scene snapping must respect dialogs, nested chat scrolling and reduced motion. Keep libraries and rooms freely scrollable.
- Theatre art is original texture-free3D geometry. Large icons may draw their strokes. Do not reintroduce generated theatre/portrait/environment rasters; static fallback should be captured from actual rendering.

- Approved baseline is Git tag `baseline/rooms-v5`. Refine its design; avoid unrelated redesigns. Desktop is the current priority; keep mobile functional.
- Use light periwinkle/peach/yellow/blue accents and neutral violet/ink surfaces. Do not restore green UI panels.
- Hover may reveal descriptions, but names and stable accessible entry targets remain visible; keyboard focus reveals the same information and touch keeps it readable.
- Composer replies are labelled fictional first-person adaptations with institutional biographical sources, never fabricated historical quotations. Nested conversation scrolling must release the page at thread boundaries.

- Latest palette comes from the user's LOL screenshots: #45D9FD cyan, #EE2560 rose, #FFDA8E amber, with #A593E0 lavender and #80D4F6 sky as supporting colours. Earlier interim purple/coral tokens are superseded. No green UI or default model material.
- Desktop activity pages must fit one viewport above the measured player: core actions never require document scrolling. Keep three case overviews, animate the active fixed answer stage, and retain previous/next plus feedback in place. Source notes open in a separate dialog. Chat history may scroll internally.

- Question prompts are essential and always visible. Case navigation is a local horizontal rail with data-derived counts; it never replaces the fixed answer stage with a long page.
- Hall passive hover is gentle; wide damped drag starts only on a mesh hit. Keep orchestra resources registered through the existing factories and reuse instanced geometry.
- Homepage settling is proximity-only; never restore mandatory page correction. Letter arrivals and Program fireworks are finite, accessible and reduced-motion-safe. Explicit Restart Program resets answers/chat and cancels pending replies without remounting audio.
- Preview cards must avoid every icon, with readable contrast; keep the original stationary entry targets.

- Answer layout is owned by `web/src/features/detective/detective.css`: question/audio, choices and feedback/action are separate rows. Keep every control inside its card and separated from previous/next at short desktop heights, including600px with the expanded error player.
- The theatre opening follows pointer direction; passive span is about34°. Preserve mesh-hit drag, damping and durable interruption behavior. Program fireworks use the existing renderer/camera; no second canvas, infinite animation, external runtime asset or decoration under reduced motion.
