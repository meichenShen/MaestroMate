# MaestroMate modern programme — design QA

final result: passed

## Target and evidence

- Approved direction: font A (Outfit350 + Onest), first thin-page programme image `/workspace/generated_images/exec-86b13485-0dc5-4e84-b95b-f6a8b23dc933.png`. Latest user explicitly requested realistic rendered3D imagery instead of painted/hand-drawn art and authorized implementation; the black background stays.
- Source and production-rendered programme captured at the exact same1487×1058 viewport. Compared together in `.tmp/qa/modern/comparison.jpg`; inspected the combined image, not only filenames. Current capture: `.tmp/qa/modern/programme-final.png`.
- Home, entry modal, work room and mobile captures: `.tmp/qa/modern/`; regression includes320–1440px widths. Local production preview was inspected in Chromium; public HTTP remains subject to the cloud allowlist.

## Iterations and results

1. Initial rendered programme showed the Swan's head cropped and the fish preview too small. Corrected Swan fit to preserve the complete animal, increased live model scale, and made work-view scaling responsive. Re-captured and compared the programme: both complete entries visible, metadata beneath art, no clipped headings, thin boundaries and generous black space.
2. Mobile homepage's panoramic fish crop hid the face. Adjusted the small-screen art focal point toward the head; live work rendering separately adapts model scale to available width.
3. Final comparison preserves the selected light-weight typography, normal-case readable metadata, mostly-black palette, thin programme surface, vertical pair of works and preview containment. The live CC0 fish species and new rendered Swan differ from the generated reference, as requested by the latest3D direction. The settled page is flat; the thin-fold cue appears during open/close and does not create an ornamental heavy book.
4. Homepage removes the three-peer entrance strip, uses a full theatre image and three large pictorial experience portals. EntryChoice has exactly two primary choices and one smaller browsing action; it is introduced after the guide and can be reopened.
5. Work pages provide one large activity surface with notes folded below, preserving the one shared player. Keyboard, audio regression and renderer fallback are checked separately by browser tests.

## Limits

- Generated3D-style imagery is pre-rendered; the fish scene is actual WebGL. They are not interchangeable claims.
- Native phone GPU performance and aesthetic preference cannot be established from automated Chromium captures. No unresolved P0/P1/P2 visual-layout finding remains in the inspected states.
