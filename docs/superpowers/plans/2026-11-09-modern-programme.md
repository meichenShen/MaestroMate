# MaestroMate modern programme and 3D render implementation

User approved font A (Outfit + Onest), a thin minimal programme with large images, black base with restrained accents, larger normal-case copy, larger pictorial entrances, and realistic rendered 3D informed by provided video and Smooothy. Explicitly asked to implement and show the website. No further design approval is required for this pass.

## Constraints and decisions
- Continue in the existing feature branch and checkout; no duplicate worktree/dependency copy. Preserve research and old versions.
- Font A is explicit. Use the first thin-page programme image as the approved visual direction; latest realistic-3D instruction supersedes painterly reference styling.
- Intro guide remains available. After first guide dismissal, show two prominent pictorial entrance choices; Just looking is a subordinate text action only there, with Escape equivalent to browsing. Never repeat it as a homepage peer.
- Programme opens as a thin sheet, then scrolls vertically. Two entries visible together on desktop; preview remains inside programme, above metadata. Swan remains a disabled coming-soon work.
- One shared AudioProvider, existing fixed recording and tested timestamps. Scripted composer questions remain closed to free text.
- Live fish use glTF model + physically based material/light, optional animated caustic references, reduced motion and offscreen suspension; static rendered art remains available on WebGL/model failure.
- Original offline-rendered theatre, swan, composer and detective images are assets, not substitutes for a live 3D claim. Document this distinction and source licenses.

## Tasks
1. Add a failing browser contract for first-entry hierarchy, larger readable type, programme open/close, render/fallback, no repeating browse action. Run against current site and observe red. Keep audio/keyboard regression.
2. Implement EntryChoice and revised Home/Programme with independently editable CSS; font tokens; normal-case copy; meaningful images; modern fold animation; large experience portals; notes integrated into foldouts.
3. Implement isolated AquariumView + renderer lifecycle and model optimization; keep audio-driven time/phase, pause, seek and reduced-motion behavior. Render assets in actual positions.
4. Production build, timeline + full browser suites, desktop/mobile screenshots, source-to-app visual comparison; fix material issues. One fresh final review, fixes verified.
5. Commit/push existing PR; package exact web subtree and deploy to same public Sites project. Verify terminal deployment status and open URL. Record limitations and editing guide.

## Files
- `components/EntryChoice.tsx`, `features/home/{Home,Programme}.tsx`, `features/home/home.css`: entry and homepage flows.
- `components/AquariumView.tsx`, `rendering/{aquarium,model}.ts`: rendering only, no own audio/state.
- `styles/{tokens,base,layout,experience}.css`: shared type/layout and activities.
- `public/{models,images,fonts,credits}`: necessary sources only, no build/dependency caches.
- `tests/modern.mjs`: added end-to-end contract, existing suites preserve regression.

## Ledger
- Baseline HEAD b784130. Existing audio/browser tests passed in previous release; new hierarchy/type/render contract will demonstrate current deficiencies.
- Ruling: retain the existing feature branch to avoid extra storage, as previously requested. Assets delegated only under Product Design's explicit asset-production instructions; app source and publishing stay with the owner.
- Task1 complete: new entry contract failed on old interface, then passed on implementation. Motion-off frame contract failed (10 vs8), fixed and green.
- Tasks2–3 complete: font A, thin programme, modern pictorial home/entry, local render assets,639KB CC0 fish model and isolated shared-audio-driven renderer implemented. Actual screenshots inspected.
- Task4 complete: production build,3/3 unit tests and all6 browser scripts pass. Separate fresh review found1P2 late-model/context-loss race; reproduced RED, fixed with disposed/contextLost guard, dedicated regression and whole suite GREEN. Offscreen freeze, escape/focus and navigation-away-while-loading also checked by reviewer.
- Visual QA: same1487×1058 source and implementation inspected in one combined comparison. Swan crop and preview scale fixed; final mobile-only static image focal point adjusted, rebuilt and screenshot reviewed. No further application state/renderer changes after green suite.

- Task5 complete: version4 deployed succeeded at the existing public URL. Runtime GitHub359adcd50083dde71f31a0e8cf6ebae7d7881390, Sites01117b21030273eaaaeab58b7ddea47171fb4a07. Deployment appgdep_6af1a81f8e108191afc62b33d5b8146f. Public browser opened; managed cloud direct URL remains outside its enforced allowlist.
