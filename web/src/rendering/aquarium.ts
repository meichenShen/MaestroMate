import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createUnderwater } from "./underwater";
import { loadFish } from "./model";
export interface RenderState {
  time: number;
  rate: number;
  playing: boolean;
  motion: boolean;
  preview: boolean;
}
export interface AquariumController {
  update: (state: RenderState) => void;
  dispose: () => void;
}
// Shared CC0 geometry, original matte materials and audio-timed tail motion.
export function createAquarium(
  host: HTMLElement,
  initial: RenderState,
  onReady: () => void,
  onFailure: () => void,
): AquariumController {
  let disposed = false,
    contextLost = false,
    visible = true,
    frame = 0,
    lastFrame = 0,
    elapsed = 0,
    baseAt = performance.now();
  let state = { ...initial };
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#101323", 0.025);
  const camera = new THREE.OrthographicCamera(-8, 8, 3, -3, 0.1, 60);
  camera.position.set(0, 0, 14);
  const pmrem = new THREE.PMREMGenerator(renderer),
    room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.08);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight("#e6e1ff", "#24263f", 1.7));
  const key = new THREE.DirectionalLight("#fff2e9", 4.0);
  key.position.set(3, 5, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight("#919dda", 1.7);
  fill.position.set(-5, 1, -2);
  scene.add(fill);
  const root = new THREE.Group();
  scene.add(root);
  const underwater = initial.preview ? null : createUnderwater();
  if (underwater) scene.add(underwater.group);
  const actors: {
    mesh: THREE.Mesh;
    nx: number;
    ny: number;
    phase: number;
    scale: number;
    clock: { value: number };
  }[] = [];
  const materials: THREE.Material[] = [];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 16,
    height = 5.2,
    ready = false,
    pointerX = 0,
    pointerY = 0,
    rx = 0,
    ry = 0,
    frozenTime = 0;
  const active = () => !disposed && !contextLost && visible && !document.hidden;
  const animated = () =>
    state.motion && !reduced.matches && (state.preview || state.playing);
  const time = () => {
    if (reduced.matches || !state.motion) return frozenTime;
    return state.preview
      ? elapsed
      : state.time +
          (state.playing
            ? ((performance.now() - baseAt) / 1000) * state.rate
            : 0);
  };
  const render = (now = performance.now()) => {
    if (!active()) return;
    const dt = Math.min(0.1, (now - lastFrame) / 1000 || 0);
    lastFrame = now;
    if (animated() && state.preview) elapsed += dt;
    const t = time();
    frozenTime = t;
    rx += (pointerX - rx) * 0.06;
    ry += (pointerY - ry) * 0.06;
    actors.forEach((actor, index) => {
      actor.mesh.position.set(
        actor.nx * width + Math.sin(t * 0.13 + actor.phase) * 0.25,
        actor.ny * height + Math.sin(t * 0.52 + actor.phase) * 0.15,
        index === 0 ? 1.5 : -1.2 + (index % 3) * 0.55,
      );
      actor.mesh.rotation.set(
        0.02,
        Math.sin(t * 0.42 + actor.phase) * 0.22 + 0.38,
        Math.sin(t * 0.38 + actor.phase) * 0.045,
      );
      actor.mesh.scale.setScalar(
        actor.scale * Math.min(1, width / 10) * (state.preview ? 1 : 0.74),
      );
      actor.clock.value = t + actor.phase * 3;
    });
    root.position.set(
      reduced.matches || !state.motion ? 0 : rx * 0.1,
      reduced.matches || !state.motion ? 0 : ry * 0.07,
      0,
    );
    underwater?.update(t, width);
    renderer.render(scene, camera);
    renderer.domElement.dataset.frame = String(
      Number(renderer.domElement.dataset.frame || 0) + 1,
    );
  };
  const loop = (now: number) => {
    frame = 0;
    if (!active() || !animated()) return;
    if (now - lastFrame >= 32) render(now);
    frame = requestAnimationFrame(loop);
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (active()) {
      render();
      if (animated()) frame = requestAnimationFrame(loop);
    }
  };
  const resize = () => {
    const rect = host.getBoundingClientRect();
    const aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
    height = 5.2;
    width = height * aspect;
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    schedule();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    schedule();
  });
  intersection.observe(host);
  const visibility = () => schedule();
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", schedule);
  const pointer = (event: PointerEvent) => {
    if (!state.motion || reduced.matches) return;
    const rect = host.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = 0.5 - (event.clientY - rect.top) / rect.height;
    if (!animated()) schedule();
  };
  const leave = () => {
    pointerX = pointerY = 0;
    if (!animated()) schedule();
  };
  host.addEventListener("pointermove", pointer);
  host.addEventListener("pointerleave", leave);
  const lost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    onFailure();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  loadFish()
    .then((template) => {
      if (disposed || contextLost) return;
      const positions = [
        [0.01, -0.01, 2.45],
        [0.32, 0.26, 1.18],
        [-0.34, 0.28, 1.0],
        [0.39, -0.25, 0.9],
        [-0.18, -0.3, 0.75],
        [-0.4, -0.2, 0.84],
      ];
      positions.forEach(([nx, ny, scale], index) => {
        const material = (
          template.material as THREE.MeshStandardMaterial
        ).clone();
        material.envMapIntensity = 0.5;
        material.map = null;
        material.normalMap = null;
        material.metalnessMap = null;
        material.roughnessMap = null;
        material.aoMap = null;
        material.color.set(
          ["#B9B5FF", "#FFAE9D", "#F6D881", "#9DCCFF", "#B9B5FF", "#FFAE9D"][
            index
          ],
        );
        if (index > 0)
          material.color.lerp(new THREE.Color("#4c4d75"), 0.16 + index * 0.035);
        material.metalness = 0.08;
        material.roughness = 0.44;
        const clock = { value: 0 };
        materials.push(material);
        material.onBeforeCompile = (shader) => {
          shader.uniforms.uSwimTime = clock;
          shader.vertexShader =
            "uniform float uSwimTime;\n" + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>\n float tail = smoothstep(0.1, 1.25, -position.x);\n transformed.z += sin(position.x * 4.2 + uSwimTime * 3.5) * tail * tail * 0.19;`,
          );
        };
        material.customProgramCacheKey = () => "maestromate-fish-tail-v2";
        const mesh = new THREE.Mesh(template.geometry, material);
        mesh.scale.setScalar(scale);
        root.add(mesh);
        actors.push({ mesh, nx, ny, phase: index * 1.73, scale, clock });
      });
      ready = true;
      schedule();
      onReady();
    })
    .catch(() => {
      if (!disposed) {
        contextLost = true;
        cancelAnimationFrame(frame);
        onFailure();
      }
    });
  resize();
  return {
    update(next) {
      const wasAnimated = animated();
      const motionChanged = state.motion !== next.motion;
      state = { ...next };
      baseAt = performance.now();
      if (
        ready &&
        (wasAnimated ||
          animated() ||
          motionChanged ||
          (state.motion && !reduced.matches))
      )
        schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", schedule);
      host.removeEventListener("pointermove", pointer);
      host.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      materials.forEach((m) => m.dispose());
      underwater?.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
