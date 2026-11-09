# Three-dimensional fish

BarramundiFish, Microsoft / Public (2017), distributed by the Khronos glTF Sample Assets project under CC0 1.0 Universal.

- Source repository: https://github.com/KhronosGroup/glTF-Sample-Assets
- Fixed source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/8f492390ddc7a2ae221a1369ef560589cf8c70fb/Models/BarramundiFish
- Source license: https://creativecommons.org/publicdomain/zero/1.0/legalcode
- Upstream GLB: 12,488,144 bytes; SHA-256 `ecc3bafb6b00f2c8b810863c388e3768a7b7ea0d0335e8cb8c574c266e571f4a`.
- Website GLB:129,452 bytes; SHA-256 `fb51c712f0b51834341f0e28b6c5a0d6ee63eaf5760da783dcb9ca46f25285cc`.
- Geometry buffer views are copied byte-for-byte. Embedded photographic textures, images, samplers and texture extensions are removed; runtime matte coloured materials provide the current design. `python scripts/optimize-fish.py` reproduces the conversion, downloading and checking the fixed upstream source. Only Python's standard library is required; downloads stay under ignored `.tmp/`.
- Runtime lighting, model arrangement, subtle tail deformation, audio-driven scene time and rendering lifecycle are MaestroMate code built with Three.js (MIT).

This scene is an artistic interpretation, not an assertion about the species intended by Saint-Saëns.
