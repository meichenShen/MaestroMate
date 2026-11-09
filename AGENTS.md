# MaestroMate project conventions

- The active website is in `web/`; preserve the research documents, assets and `old version/`.
- Keep navigation, work introduction, contextual notes and player as separate components. Keep each activity in its own feature directory.
- Shared audio belongs to one provider above the activity switch. Never mount another audio element for a question or remount it when switching activities.
- Put recording-specific content, questions, chapter times and attribution in `web/src/content/`. Changing a recording requires reviewing every timestamp.
- Use `web/src/styles/tokens.css` for design variables and `layout.css` for column widths and responsive breakpoints. Avoid cross-feature CSS dependencies.
- Put short-lived downloads, QA screenshots, logs and packaging artifacts under the ignored `web/.tmp/` directory. Do not create dated copies of the source tree; use Git history.
- Do not commit dependencies, build outputs, caches, secrets or test artifacts. Keep original source material and Git history. Only remove verified reproducible artifacts belonging to this project; never clear app-wide or other projects' caches.
- Keep browser QA and the editing guide current after behavior changes. Public publishing is authorized for this demo; preserve that audience on updates.
