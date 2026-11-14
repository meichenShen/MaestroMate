# Aquarium rendering references

Checked2026-11-14 against original repositories, source headers and documentation. This is source research, not a claim of running or validating the external demos. Keep the listening scene separate from the surface-view Music Pool instrument.

| Source | Suitable techniques | License evidence | Integration considerations |
|---|---|---|---|
| [WebGL Aquarium](https://github.com/WebGLSamples/WebGLSamples.github.io/tree/master/aquarium), [live sample](https://webglsamples.org/aquarium/aquarium.html) | Fish at different depths, glass enclosure, lighting, instancing and underwater ambience | [Root LICENSE.md](https://github.com/WebGLSamples/WebGLSamples.github.io/blob/master/LICENSE.md): BSD3 by default, unless a file says otherwise | Closest match to looking into an actual aquarium. Older TDL/WebGL architecture is not a drop-in Three.js component. Verify individual asset/file notices before taking textures/models; do not import its full benchmark or thousands of fish. |
| [Evan Wallace WebGL Water](https://github.com/evanw/webgl-water), [demo](https://madebyevan.com/webgl-water/) | Height-field ripples, refracted/reflected light, underwater caustics and soft shadows | Original `index.html` explicitly says copyright2011 Evan Wallace, MIT | Strong water/light reference; contains a pool and sphere, not an aquarium ecosystem. Older LightGL code and floating-point texture requirements add migration cost. Tile/cubemap assets require their own provenance checks. |
| [idootop/webgl2-water](https://github.com/idootop/webgl2-water) | A modern TypeScript/Three.js adaptation of the water simulation | README identifies MIT and credits Evan Wallace | Closer technical fit, but its sunlit tiled pool/duck aesthetic is not the selected MaestroMate aquarium. Evaluate simulation/light code separately from the appearance and verify included assets. |

## Proposed listening direction

A **gallery aquarium / viewing window** is a better subject match than a pond: camera looks into a contained volume; fish pass through the foreground/middle/background; restrained rocks/plants and overhead moving light give a sense of depth. Keep the existing CC0 optimized fish, deterministic audio-time movement, one renderer, pause/seek synchronisation and static fallback. The next visual experiment should compare this contained aquarium with the current open underwater view before replacing the listening background.

Do not automatically inherit the sample's saturated blue or green. Preserve MaestroMate's black/ink surroundings, cyan/sky accents and controlled rose/amber highlights. Speech, music controls and readable text stay in the normal document; decoration must not compete with listening tasks.

## What this iteration actually uses

Music Pool uses an original analytical ripple shader with a shallow circular stage, procedural light, original geometry and five synthesized notes. It does not copy code or textures from the above projects and does not claim a physical fluid simulation. It is a separate creative activity, not the Saint-Saëns recording.

[HTML-in-Canvas Wishing Pond](https://html-in-canvas.dev/demos/wishing-pond/), [3D Room](https://html-in-canvas.dev/demos/3d-room-live-content/) and [Elastic Bulge](https://html-in-canvas.dev/demos/elastic-bulge/) informed interaction ideas. Their showcase [repository](https://github.com/en-dash-consulting/html-in-canvas-dot-dev) is marked MIT. Our controls remain ordinary HTML, with Three.js and CSS spring/perspective effects rather than depending on the newer HTML-in-Canvas API. No native browser flags, extra runtime package, third-party font CDN or remote demo iframe is required.
