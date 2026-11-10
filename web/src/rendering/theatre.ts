import * as THREE from "three";
import { buildHall } from "./hall-architecture";
import { buildOrchestra } from "./orchestra";
import { pointerHallView } from "./hall-view";

export interface TheatreController {
  setMotion: (motion: boolean) => void;
  dispose: () => void;
}

/** A large original concert hall, viewed with a bounded full-turn orbit. */
export function createTheatre(
  host: HTMLElement,
  initialMotion: boolean,
  onReady: () => void,
  onFailure: () => void,
): TheatreController {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch (error) {
    onFailure();
    throw error;
  }
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);
  const camera = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.1, 160);
  const canvas = renderer.domElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let disposed = false,
    contextLost = false,
    visible = false,
    ready = false;
  let motion = initialMotion,
    raf = 0,
    lastTime = performance.now();
  let yaw = 0,
    pitch = 0,
    targetYaw = 0,
    targetPitch = 0,
    baseYaw = 0,
    basePitch = 0;
  let measuredWidth = 0,
    measuredHeight = 0;
  let drag: {
    id: number;
    x: number;
    y: number;
    yaw: number;
    pitch: number;
  } | null = null;
  const priorTouchAction = host.style.touchAction;
  const priorCursor = host.style.cursor;
  const priorAttributes = new Map(
    ["role", "tabindex", "aria-label", "aria-description"].map((name) => [
      name,
      host.getAttribute(name),
    ]),
  );
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.frame = "0";
  canvas.style.cssText =
    "display:block;width:100%;height:100%;pointer-events:none";
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  host.append(canvas);
  host.tabIndex = 0;
  host.setAttribute("role", "group");
  host.style.touchAction = "pan-y";
  const geometry = <T extends THREE.BufferGeometry>(value: T): T => {
    geometries.add(value);
    return value;
  };
  const material = (
    color: THREE.ColorRepresentation,
    roughness = 0.78,
    metalness = 0,
  ) => {
    const value = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
    });
    materials.add(value);
    return value;
  };
  const mesh = (
    shape: THREE.BufferGeometry,
    surface: THREE.Material,
    parent: THREE.Object3D = root,
  ) => {
    const value = new THREE.Mesh(geometry(shape), surface);
    value.castShadow = true;
    value.receiveShadow = true;
    parent.add(value);
    return value;
  };
  const box = (
    w: number,
    h: number,
    d: number,
    surface: THREE.Material,
    parent: THREE.Object3D = root,
  ) => mesh(new THREE.BoxGeometry(w, h, d), surface, parent);
  const ivory = material("#EEE8DB");
  const warmWhite = material("#F6F0E4", 0.65);
  const graphite = material("#212027", 0.46);
  const pianoBlack = material("#111015", 0.38);
  const keyBlack = material("#08070B", 0.56);
  const soundboard = material("#C4A26D", 0.88);
  const metal = material("#FFDA8E", 0.55, 0.32);
  const { seatCount } = buildHall(root, { geometry, material });
  host.setAttribute(
    "aria-label",
    `Interactive model of a ${seatCount}-seat concert hall with strings, woodwinds, brass, percussion, a conductor and two balcony levels`,
  );
  const ensemble = new THREE.Group();
  ensemble.position.set(-5.8, 1.22, -4.35);
  ensemble.scale.setScalar(0.55);
  root.add(ensemble);
  function roundedPlan(w: number, d: number, radius: number) {
    const x = -w / 2,
      z = -d / 2,
      s = new THREE.Shape();
    s.moveTo(x + radius, z);
    s.lineTo(x + w - radius, z);
    s.quadraticCurveTo(x + w, z, x + w, z + radius);
    s.lineTo(x + w, z + d - radius);
    s.quadraticCurveTo(x + w, z + d, x + w - radius, z + d);
    s.lineTo(x + radius, z + d);
    s.quadraticCurveTo(x, z + d, x, z + d - radius);
    s.lineTo(x, z + radius);
    s.quadraticCurveTo(x, z, x + radius, z);
    return s;
  }
  function horizontalShape(shape: THREE.Shape, depth: number, bevel = 0.025) {
    const value = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 3,
      steps: 1,
      curveSegments: 40,
    });
    value.rotateX(Math.PI / 2);
    value.translate(0, depth, 0);
    return value;
  }
  const piano = new THREE.Group();
  piano.position.set(-0.35, 0.63, 0.17);
  piano.rotation.y = -0.23;
  piano.scale.setScalar(1.12);
  ensemble.add(piano);

  function pianoPlan(scale = 1) {
    const p = new THREE.Shape();
    p.moveTo(-0.91 * scale, 0.86 * scale);
    p.lineTo(0.91 * scale, 0.86 * scale);
    p.lineTo(0.91 * scale, 0.47 * scale);
    p.bezierCurveTo(
      0.91 * scale,
      -0.03 * scale,
      0.35 * scale,
      0.05 * scale,
      0.32 * scale,
      -0.62 * scale,
    );
    p.bezierCurveTo(
      0.3 * scale,
      -1.25 * scale,
      -0.02 * scale,
      -1.57 * scale,
      -0.42 * scale,
      -1.57 * scale,
    );
    p.bezierCurveTo(
      -0.76 * scale,
      -1.57 * scale,
      -0.91 * scale,
      -1.34 * scale,
      -0.91 * scale,
      -1.04 * scale,
    );
    p.lineTo(-0.91 * scale, 0.86 * scale);
    p.closePath();
    return p;
  }
  const body = mesh(
    horizontalShape(pianoPlan(), 0.24, 0.025),
    pianoBlack,
    piano,
  );
  body.position.y = 0.94;
  const board = mesh(
    horizontalShape(pianoPlan(0.9), 0.018, 0.008),
    soundboard,
    piano,
  );
  board.position.y = 1.183;
  const rimShape = pianoPlan();
  const inner = pianoPlan(0.9);
  rimShape.holes.push(new THREE.Path(inner.getPoints(80)));
  const rim = mesh(horizontalShape(rimShape, 0.075, 0.008), pianoBlack, piano);
  rim.position.y = 1.18;

  // A triangular string fan and three cast braces remain visible under the lid.
  const stringPositions: number[] = [];
  for (let i = 0; i < 29; i++) {
    const x = -0.74 + i * 0.048;
    const tail = -1.32 + Math.pow(i / 28, 1.3) * 1.36;
    stringPositions.push(x, 1.222, 0.55, -0.66 + i * 0.026, 1.222, tail);
  }
  const stringGeometry = geometry(new THREE.BufferGeometry());
  stringGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(stringPositions, 3),
  );
  const stringMaterial = new THREE.LineBasicMaterial({
    color: "#DED3B9",
    transparent: true,
    opacity: 0.72,
  });
  materials.add(stringMaterial);
  piano.add(new THREE.LineSegments(stringGeometry, stringMaterial));
  [-0.55, -0.13, 0.29].forEach((x, index) => {
    const brace = box(0.026, 0.04, 1.7 - index * 0.35, metal, piano);
    brace.position.set(x, 1.233, -0.24 + index * 0.13);
    brace.rotation.y = -0.15;
  });

  const lidPivot = new THREE.Group();
  lidPivot.position.set(-0.91, 1.285, 0);
  lidPivot.rotation.z = 0.47;
  piano.add(lidPivot);
  const lid = mesh(
    horizontalShape(pianoPlan(), 0.055, 0.018),
    pianoBlack,
    lidPivot,
  );
  lid.position.x = 0.91;
  const lidInset = mesh(
    horizontalShape(pianoPlan(0.94), 0.008, 0.008),
    graphite,
    lidPivot,
  );
  lidInset.position.set(0.91, -0.017, 0);
  function rod(
    from: THREE.Vector3,
    to: THREE.Vector3,
    radius: number,
    surface: THREE.Material,
    parent: THREE.Object3D,
  ) {
    const direction = to.clone().sub(from);
    const value = mesh(
      new THREE.CylinderGeometry(radius, radius, direction.length(), 10),
      surface,
      parent,
    );
    value.position.copy(from).add(to).multiplyScalar(0.5);
    value.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    return value;
  }
  rod(
    new THREE.Vector3(0.62, 1.24, 0.03),
    new THREE.Vector3(0.59, 2.06, 0.03),
    0.017,
    pianoBlack,
    piano,
  );
  const hinge = box(0.035, 0.035, 2.11, metal, piano);
  hinge.position.set(-0.91, 1.285, -0.28);

  const keybed = box(1.86, 0.14, 0.45, pianoBlack, piano);
  keybed.position.set(0, 1.06, 1.03);
  const whiteKeyGeometry = geometry(new THREE.BoxGeometry(0.0295, 0.049, 0.33));
  const blackKeyGeometry = geometry(
    new THREE.BoxGeometry(0.0185, 0.042, 0.205),
  );
  const whiteKeys = new THREE.InstancedMesh(whiteKeyGeometry, warmWhite, 52);
  const blackKeyIndices = Array.from({ length: 51 }, (_, i) => i).filter((i) =>
    [0, 1, 3, 4, 5].includes(i % 7),
  );
  const blackKeys = new THREE.InstancedMesh(
    blackKeyGeometry,
    keyBlack,
    blackKeyIndices.length,
  );
  const keyTransform = new THREE.Matrix4();
  for (let i = 0; i < 52; i++) {
    keyTransform.makeTranslation(-0.81 + i * 0.0318, 1.157, 1.04);
    whiteKeys.setMatrixAt(i, keyTransform);
  }
  blackKeyIndices.forEach((i, index) => {
    keyTransform.makeTranslation(-0.794 + i * 0.0318, 1.198, 0.991);
    blackKeys.setMatrixAt(index, keyTransform);
  });
  piano.add(whiteKeys, blackKeys);
  [-0.89, 0.89].forEach((x) => {
    const cheek = box(0.085, 0.145, 0.45, pianoBlack, piano);
    cheek.position.set(x, 1.1, 1.03);
  });
  const fallboard = box(1.66, 0.15, 0.065, pianoBlack, piano);
  fallboard.position.set(0, 1.23, 0.79);
  const desk = box(0.92, 0.29, 0.035, graphite, piano);
  desk.position.set(-0.01, 1.48, 0.63);
  desk.rotation.x = -0.24;
  const deskLip = box(0.98, 0.035, 0.085, pianoBlack, piano);
  deskLip.position.set(-0.01, 1.343, 0.685);

  [
    [-0.73, 0.69],
    [0.73, 0.63],
    [-0.42, -1.24],
  ].forEach(([x, z]) => {
    const leg = mesh(
      new THREE.CylinderGeometry(0.068, 0.044, 0.84, 12),
      pianoBlack,
      piano,
    );
    leg.position.set(x, 0.51, z);
    const foot = mesh(
      new THREE.CylinderGeometry(0.066, 0.066, 0.08, 12),
      metal,
      piano,
    );
    foot.position.set(x, 0.07, z);
  });
  [-0.1, 0.1].forEach((x) => {
    rod(
      new THREE.Vector3(x, 1.02, 0.73),
      new THREE.Vector3(x * 0.7, 0.24, 0.86),
      0.019,
      pianoBlack,
      piano,
    );
  });
  [-0.085, 0, 0.085].forEach((x) => {
    const pedal = box(0.045, 0.027, 0.19, metal, piano);
    pedal.position.set(x, 0.18, 0.96);
    pedal.rotation.x = -0.12;
  });
  const bench = new THREE.Group();
  bench.position.set(-0.02, 0, 1.78);
  piano.add(bench);
  const seat = mesh(
    horizontalShape(roundedPlan(0.94, 0.46, 0.06), 0.105, 0.018),
    graphite,
    bench,
  );
  seat.position.y = 0.58;
  [-0.36, 0.36].forEach((x) =>
    [-0.14, 0.14].forEach((z) => {
      const leg = box(0.045, 0.58, 0.045, pianoBlack, bench);
      leg.position.set(x, 0.29, z);
    }),
  );

  buildOrchestra(root, { geometry, material });

  scene.add(new THREE.HemisphereLight("#F5EEE8", "#24212C", 1.3));
  const key = new THREE.DirectionalLight("#FFF3E4", 2.5);
  key.position.set(-14, 28, 20);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -23,
    right: 23,
    top: 25,
    bottom: -22,
    near: 0.1,
    far: 90,
  });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.04;
  key.shadow.radius = 3;
  scene.add(key);
  const fill = new THREE.DirectionalLight("#DCE4FF", 0.8);
  fill.position.set(16, 12, -3);
  scene.add(fill);
  const rimLight = new THREE.DirectionalLight("#FFF0DD", 0.9);
  rimLight.position.set(-2, 12, -18);
  scene.add(rimLight);

  const active = () => !disposed && !contextLost && visible && !document.hidden;
  const inputEnabled = () => active() && motion;
  const unsettled = () =>
    Math.abs(targetYaw - yaw) > 0.00015 ||
    Math.abs(targetPitch - pitch) > 0.00015;
  const center = new THREE.Vector3(0, 4.0, -0.3);
  let lastDescription = "";
  const describe = () => {
    // These values describe the displayed camera, including its brief smoothing.
    const degrees = (yaw * 180) / Math.PI;
    host.dataset.yaw = degrees.toFixed(1);
    host.dataset.pitch = ((pitch * 180) / Math.PI).toFixed(1);
    const description = `View ${Math.round(degrees)} degrees. Hover for a gentle view. Press on the hall and drag to orbit. Arrow keys turn and tilt. Home or 0 resets the view.`;
    if (description !== lastDescription) {
      host.setAttribute("aria-description", description);
      lastDescription = description;
    }
  };
  const fail = () => {
    if (disposed || contextLost) return;
    contextLost = true;
    ready = false;
    cancelAnimationFrame(raf);
    raf = 0;
    canvas.style.visibility = "hidden";
    onFailure();
  };
  const draw = (now: number) => {
    if (!active()) return;
    const dt = Math.max(1 / 120, Math.min(0.25, (now - lastTime) / 1000));
    lastTime = now;
    const ease = motion && !reduced.matches ? 1 - Math.exp(-dt * 5.5) : 1;
    yaw += (targetYaw - yaw) * ease;
    pitch += (targetPitch - pitch) * ease;
    if (!unsettled()) {
      yaw = targetYaw;
      pitch = targetPitch;
    }
    // The scene stays still, so its shadow atlas survives every camera orbit.
    // This uses the same azimuth/elevation construction as Three's OrbitControls.
    const azimuth = 0.34 + yaw;
    const elevation = 0.66 + pitch;
    const horizontal = 60 * Math.cos(elevation);
    camera.position.set(
      center.x + Math.sin(azimuth) * horizontal,
      center.y + Math.sin(elevation) * 60,
      center.z + Math.cos(azimuth) * horizontal,
    );
    camera.lookAt(center);
    describe();
    try {
      renderer.render(scene, camera);
    } catch {
      fail();
      return;
    }
    canvas.dataset.frame = String(Number(canvas.dataset.frame) + 1);
    if (!ready) {
      ready = true;
      onReady();
    }
  };
  const loop = (now: number) => {
    raf = 0;
    if (!active()) return;
    draw(now);
    if (motion && !reduced.matches && unsettled())
      raf = requestAnimationFrame(loop);
  };
  const schedule = () => {
    if (raf) return;
    if (active()) raf = requestAnimationFrame(loop);
  };
  const resize = () => {
    if (disposed || contextLost) return;
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, rect.width),
      height = Math.max(1, rect.height);
    if (width === measuredWidth && height === measuredHeight) return;
    measuredWidth = width;
    measuredHeight = height;
    const aspect = width / height;
    // A stable envelope contains the whole hall at every yaw and allowed tilt.
    const viewHeight = Math.max(31.2, 36.4 / aspect);
    camera.left = (-viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    schedule();
  };
  const pointerMove = (event: PointerEvent) => {
    if (drag && !(event.buttons & 1)) cancelDrag();
    if (!inputEnabled()) return;
    const rect = host.getBoundingClientRect();
    if (drag && event.pointerId === drag.id) {
      targetYaw =
        drag.yaw +
        ((event.clientX - drag.x) / Math.max(1, rect.width)) * Math.PI * 1.6;
      targetPitch = THREE.MathUtils.clamp(
        drag.pitch -
          ((event.clientY - drag.y) / Math.max(1, rect.height)) * 0.48,
        -0.24,
        0.24,
      );
    } else {
      if (
        event.pointerType === "touch" ||
        !finePointer.matches ||
        reduced.matches
      )
        return;
      const view = pointerHallView(
        (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5,
        (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5,
      );
      targetYaw = baseYaw + view.yaw;
      targetPitch = THREE.MathUtils.clamp(basePitch + view.pitch, -0.24, 0.24);
    }
    schedule();
  };
  const hitTest = new THREE.Raycaster();
  const pointerDown = (event: PointerEvent) => {
    // One-finger touch always keeps native vertical page scrolling.
    if (!inputEnabled() || event.button !== 0 || event.pointerType === "touch")
      return;
    const rect = host.getBoundingClientRect();
    hitTest.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        1 - ((event.clientY - rect.top) / rect.height) * 2,
      ),
      camera,
    );
    if (!hitTest.intersectObject(root, true).length) return;
    event.preventDefault();
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      yaw,
      pitch,
    };
    host.setPointerCapture(event.pointerId);
    host.focus({ preventScroll: true });
    host.style.cursor = "grabbing";
  };
  const pointerUp = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    baseYaw = targetYaw;
    basePitch = targetPitch;
    drag = null;
    if (host.hasPointerCapture(event.pointerId))
      host.releasePointerCapture(event.pointerId);
    host.style.cursor = "grab";
  };
  const cancelDrag = () => {
    if (!drag) return;
    const id = drag.id;
    drag = null;
    targetYaw = baseYaw = yaw;
    targetPitch = basePitch = pitch;
    if (host.hasPointerCapture(id)) host.releasePointerCapture(id);
    host.style.cursor = motion ? "grab" : "default";
  };
  const pointerLeave = () => {
    if (!drag && inputEnabled()) {
      targetYaw = baseYaw;
      targetPitch = basePitch;
      schedule();
    }
  };
  const keyDown = (event: KeyboardEvent) => {
    if (
      !inputEnabled() ||
      event.target !== host ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    switch (event.key) {
      case "ArrowLeft":
        targetYaw -= Math.PI / 12;
        break;
      case "ArrowRight":
        targetYaw += Math.PI / 12;
        break;
      case "ArrowUp":
        targetPitch = Math.min(0.24, targetPitch + 0.06);
        break;
      case "ArrowDown":
        targetPitch = Math.max(-0.24, targetPitch - 0.06);
        break;
      case "Home":
      case "0":
        targetYaw = 0;
        targetPitch = 0;
        break;
      default:
        return;
    }
    baseYaw = targetYaw;
    basePitch = targetPitch;
    event.preventDefault();
    schedule();
  };
  const lost = (event: Event) => {
    event.preventDefault();
    fail();
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const resizeObserver = new ResizeObserver(resize);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (active()) schedule();
    else {
      cancelDrag();
      stop();
    }
  });
  const visibility = () => {
    if (active()) schedule();
    else {
      cancelDrag();
      stop();
    }
  };
  const preference = () => {
    stop();
    yaw = targetYaw;
    pitch = targetPitch;
    schedule();
  };
  resizeObserver.observe(host);
  intersection.observe(host);
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", preference);
  host.addEventListener("pointermove", pointerMove, { passive: true });
  host.addEventListener("pointerdown", pointerDown);
  host.addEventListener("pointerleave", pointerLeave);
  host.addEventListener("pointerup", pointerUp);
  host.addEventListener("pointercancel", pointerUp);
  host.addEventListener("lostpointercapture", pointerUp);
  host.addEventListener("keydown", keyDown);
  canvas.addEventListener("webglcontextlost", lost);
  host.style.cursor = motion ? "grab" : "default";
  describe();
  resize();

  return {
    setMotion(next) {
      if (motion === next) return;
      motion = next;
      targetYaw = yaw;
      targetPitch = pitch;
      stop();
      if (drag && host.hasPointerCapture(drag.id))
        host.releasePointerCapture(drag.id);
      drag = null;
      host.style.cursor = motion ? "grab" : "default";
      schedule();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      if (drag && host.hasPointerCapture(drag.id))
        host.releasePointerCapture(drag.id);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerdown", pointerDown);
      host.removeEventListener("pointerleave", pointerLeave);
      host.removeEventListener("pointerup", pointerUp);
      host.removeEventListener("pointercancel", pointerUp);
      host.removeEventListener("lostpointercapture", pointerUp);
      host.removeEventListener("keydown", keyDown);
      canvas.removeEventListener("webglcontextlost", lost);
      root.traverse((object) => {
        if (object instanceof THREE.InstancedMesh) object.dispose();
      });
      geometries.forEach((value) => value.dispose());
      materials.forEach((value) => value.dispose());
      key.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      for (const [name, value] of priorAttributes) {
        if (value === null) host.removeAttribute(name);
        else host.setAttribute(name, value);
      }
      host.style.touchAction = priorTouchAction;
      host.style.cursor = priorCursor;
      delete host.dataset.yaw;
      delete host.dataset.pitch;
    },
  };
}
