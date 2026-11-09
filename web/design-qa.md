# MaestroMate independent rooms — design QA

## Target and evidence

The latest user request takes precedence over earlier raster-art directions: three genuinely independent rooms, an optional whole-work Program, an actual designed3D theatre, large stroke-drawn icons, directional animation and continuous scrolling that settles on a homepage scene. Retain font A, English, black as the main background and the vertical two-work Program. LOL Colors supplies the mint/coral/lilac/blue accents.

The local production build was captured in Chromium at1440×1000 and390×844. Actual captures were opened and inspected, including:

- `.tmp/qa/rooms/home-final.png`, `home-mobile-final.png`: original geometry with a full grand piano and curved acoustic stage; headline occupies the separate left space on desktop and sits above the stage on mobile.
- `doors-final.png`, `doors-mobile-final.png`: three large, staggered icon entrances with room names and readable supporting text. No ruled card grid or peer “Just looking” portal.
- `listen-final.png`, `program-final.png`: separate listening directory and whole-work Program. Within the Program collection both vertical work entries fit the desktop viewport; Aquarium has a real preview and The Swan is visibly coming soon.
- `chat-final.png`, `chat-mobile-final.png`: outgoing and incoming bubbles, prepared question chips, source disclosure, one shared player. The log scrolls separately; pages remain freely scrollable.
- `game-final.png`: a separate Play destination and clear game entrance, without Program progress.

## Functional design checks

`tests/rooms.mjs` checks actual distinct routes, absence of guided progress in standalone rooms, accumulated chat history, one audio element, guided steps, wheel settling and mobile overflow. `tests/snap.mjs` checks motion during a multi-event wheel gesture, final alignment, nested conversation scrolling and reduced motion. `entry.mjs` preserves the two-primary/one-subordinate entrance hierarchy. Dedicated keyboard and focus checks cover modal dismissal, browser back, deep-link first Tab and route focus.

Three-dimensional surfaces contain no generated or photographed environment. The theatre is original geometry; the CC0 fish mesh uses matte materials with its photo textures removed. The aquarium poster was recaptured from this renderer. Icon shapes are Lucide geometry drawn with native path animation, with Smooothy/Vivus acknowledged as technique references.

## Limits

The inspected viewports establish layout and legibility for those states; they do not establish the user's final aesthetic preference or physical-phone GPU performance. Native Sites deployment results verify publication separately. The cloud allowlist blocks an independent public HTTP visit, so local production inspection is not described as a public browser test.
