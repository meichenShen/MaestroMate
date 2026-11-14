# Visible refinement after v11 feedback

User request: changes beyond Music Pool are hard to perceive; the pool is too elliptical and note graphics should be simpler. This is a bounded correction to the approved three concepts, not a new redesign. Baseline928895f/v11, existing feature branch/path, original palette/English and public audience retained.

## Confirmed causes / design

The renderer scales the entire pond by aspect*1.04 to spread note targets. That conflates hit layout and water shape, creating the very wide platter. Project a more top-down round basin with capped horizontal scale, while deriving both HTML positions and independent44px-plus target widths from shared layout math, including the no-WebGL fallback. Remove 3D note stones, note rings and per-note key badges: one coloured point plus its letter, keyboard guide in one place.

Program starts open, skipping the existing cover. Present the thin3D cover on first entry, explicitly open into the same two vertical work pages, retain open state afterwards. Amplify art-only opening/hover and add visible thin-page geometry. Headings/CTAs stay stationary; reduced motion still gives a recognisable static booklet.

Portal motion currently has mild tilt/stretch. Add an original local radial SVG displacement field plus stronger damped art response. Generate a small technical SVG field from vector math, not a photo/texture; normal HTML controls remain stationary. No experimental API or extra runtime dependency. Disable decorative filtering/movement for touch/reduced motion and dispose event/frame resources.

## Steps / ledger

- [x] RED: shared layout aspect/target spacing invariants and default Program cover; visible local bulge with stable link/title bounds.
- [x] Implement pond/notes; desktop/touch screenshots inspected; remaining lifecycle/short/fallback checks included in final suite.
- [x] Implement visible booklet and local elastic field; cover-first and actual pixel deformation tests pass. Existing tests updated for deliberately changed entry.
- [x] Inspect screenshots; unit/build/targeted tests; one fresh bounded review, fix Important RED→GREEN, final full browser suite.
- [ ] Push/update draft PR2 and publish same public Site; record exact provenance and network limits, stop owned preview.

No new listening-background replacement, AI, data collection, audio source or database schema change. Acoustic/sequence lifecycle remains covered by the existing real Web Audio tests. Source and private feedback stay separate. Pre-existing full source checkout is retained per user storage/path preference. User has already authorised the revisions and public publishing; no new approval menu.

## Evidence

- New shared-layout unit tests first failed before implementation; final unit run28/28. `refinement-browser.mjs` first failed for absent cover/local filter, then2/2 passed.
- Visual inspection found an obsolete poster with embedded controls and a5px desktop Program overflow. Replaced the poster with a clean capture of the existing actual renderer; the viewport regression failed before removing double perspective, then passed.
- Latest TypeScript/asset integrity/build passed (`web/.tmp/refine/build-checked.log`). Desktop/touch pond, clean cover and isolated before/after portal screenshots inspected under `.tmp/refine/screenshots/`.
- Fresh final review: no Critical/Minor; one Important opened-page overflow from duplicate parent/child perspective. Added desktop/phone opened-page containment regression; RED at1440 (document1472). Removed parent perspective in the single fix pass. The earlier full suite was interrupted for this correction, not counted as final QA.
- Final: fixed opened-page overflow — viewport regression RED→GREEN at all five widths; final28/28 unit tests,3/3 targeted browser tests and19/19 full browser script groups pass (exit0), with runtime source/build frozen during the final full run. Asset integrity/TypeScript/build passed; no new runtime package, audio/schema change or deferred review minor.
