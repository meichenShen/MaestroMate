import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createUnderwater } from "./underwater";
import { swimPose } from "./swim";
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
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.transmissionResolutionScale = 0.5;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#10152e", 0.027);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 70);
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
  const direction = new THREE.Vector3(),
    forward = new THREE.Vector3(1, 0, 0);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 16,
    height = 8.8,
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
      const p = swimPose(t, index, width, height);
      actor.mesh.position.set(p.x, p.y, p.z);
      direction.set(p.dx, p.dy, p.dz).normalize();
      actor.mesh.quaternion.setFromUnitVectors(forward, direction);
      actor.mesh.scale.setScalar(actor.scale * Math.min(1, width / 10));
      actor.clock.value = t + actor.phase;
    });
    root.position.set(
      reduced.matches || !state.motion ? 0 : rx * 0.1,
      reduced.matches || !state.motion ? 0 : ry * 0.07,
      0,
    );
    underwater?.update(t, width, height, rx, ry);
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
    height = 2 * Math.tan(THREE.MathUtils.degToRad(35 / 2)) * 14;
    width = height * aspect;
    camera.aspect = aspect;
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
      const scales = [1.35, 0.95, 1.1, 0.8, 0.7, 0.9, 1.05];
      scales.forEach((scale, index) => {
        const nx = 0,
          ny = 0;
        const material = new THREE.MeshPhysicalMaterial({
          color: [
            "#a593e0",
            "#ee5286",
            "#ffad75",
            "#80d4f6",
            "#d07bff",
            "#fa92c4",
            "#8d9cff",
          ][index],
          metalness: 0.02,
          roughness: 0.2,
          transmission: 0.38,
          thickness: 0.55,
          ior: 1.33,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
          envMapIntensity: 1.2,
        });
        const clock = { value: 0 };
        materials.push(material);
        material.onBeforeCompile = (shader) => {
          shader.uniforms.uSwimTime = clock;
          shader.vertexShader =
            "uniform float uSwimTime;\n" + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>\n float tail = smoothstep(0.1, 1.25, -position.x);\n transformed.z += sin(position.x * 4.2 + uSwimTime * 4.2) * tail * tail * 0.24;`,
          );
        };
        material.customProgramCacheKey = () => "maestromate-fish-tail-v3";
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
