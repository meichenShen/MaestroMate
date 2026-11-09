import * as THREE from "three";

export interface TheatreController {
  setMotion: (motion: boolean) => void;
  dispose: () => void;
}

const PALETTE = {
  mint: "#67D5B5",
  coral: "#EE7785",
  lilac: "#C89EC4",
  blue: "#84B1ED",
} as const;

// The thick, asymmetric proscenium and swept acoustic leaves are drawn as solid
// architectural sections. The piano has its own Bézier rim, open lid, soundboard,
// full keyboard and lyre: these are authored forms rather than assembled icons.
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
  const camera = new THREE.OrthographicCamera(-7, 7, 4, -4, 0.1, 70);
  const root = new THREE.Group();
  scene.add(root);
  let disposed = false;
  let contextLost = false;
  let visible = false;
  let motion = initialMotion;
  let raf = 0;
  let lastDraw = -Infinity;
  let lastTime = performance.now();
  let elapsed = 0;
  let shadowYaw = Infinity;
  let ready = false;
  let pointerX = 0,
    pointerY = 0,
    easedX = 0,
    easedY = 0;
  let measuredWidth = 0,
    measuredHeight = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.frame = "0";
  canvas.style.cssText =
    "display:block;width:100%;height:100%;pointer-events:none";
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.3));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  host.append(canvas);

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
  const ivory = material("#E6E0D5");
  const warmWhite = material("#F2EEE5", 0.65);
  const lilac = material(PALETTE.lilac);
  const coral = material(PALETTE.coral);
  const mint = material(PALETTE.mint);
  const blue = material(PALETTE.blue);
  const graphite = material("#17191B", 0.46);
  const pianoBlack = material("#101315", 0.38);
  const keyBlack = material("#080B0D", 0.56);
  const understage = material("#25282A", 0.9);
  const soundboard = material("#A9997E", 0.88);
  const metal = material("#BDB59E", 0.55, 0.32);

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
  const plinth = mesh(
    horizontalShape(roundedPlan(6.6, 4.65, 1.45), 0.22, 0.055),
    understage,
  );
  plinth.position.set(0, 0.18, 0.1);
  const reveal = mesh(
    horizontalShape(roundedPlan(6.49, 4.54, 1.39), 0.065, 0.02),
    mint,
  );
  reveal.position.set(0, 0.405, 0.1);
  const floor = mesh(
    horizontalShape(roundedPlan(6.55, 4.6, 1.4), 0.14, 0.045),
    ivory,
  );
  floor.position.set(0, 0.47, 0.1);

  // Three generous stair treads make the small concert room read as a place.
  [
    { w: 2.8, d: 0.68, y: 0.1, z: 2.96 },
    { w: 3.15, d: 0.67, y: 0.25, z: 2.64 },
    { w: 3.52, d: 0.64, y: 0.4, z: 2.32 },
  ].forEach(({ w, d, y, z }) => {
    const step = mesh(
      horizontalShape(roundedPlan(w, d, 0.17), 0.14, 0.025),
      ivory,
    );
    step.position.set(-0.15, y, z);
  });

  // A solid, gently concave wall has a changing crown height and real returns.
  function acousticLeaf(
    start: number,
    end: number,
    surface: THREE.Material,
    outward = 0,
  ) {
    const vertices: number[] = [],
      indices: number[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = start + ((end - start) * i) / segments;
      const height = 4.72 - 1.27 * Math.pow(Math.abs(Math.sin(angle)), 1.8);
      const x = Math.sin(angle) * (3.03 + outward);
      const z = -0.53 - Math.cos(angle) * (1.56 + outward);
      const backX = Math.sin(angle) * (3.24 + outward);
      const backZ = -0.53 - Math.cos(angle) * (1.77 + outward);
      vertices.push(
        x,
        0.61,
        z,
        x,
        height,
        z,
        backX,
        0.61,
        backZ,
        backX,
        height,
        backZ,
      );
      if (i < segments) {
        const k = i * 4;
        indices.push(k, k + 4, k + 1, k + 1, k + 4, k + 5);
        indices.push(k + 2, k + 3, k + 6, k + 3, k + 7, k + 6);
        indices.push(k + 1, k + 5, k + 3, k + 3, k + 5, k + 7);
        indices.push(k, k + 2, k + 4, k + 2, k + 6, k + 4);
      }
    }
    indices.push(0, 1, 2, 1, 3, 2);
    const k = segments * 4;
    indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    const value = new THREE.BufferGeometry();
    value.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    value.setIndex(indices);
    value.computeVertexNormals();
    return mesh(value, surface);
  }
  acousticLeaf(-1.12, -0.39, coral);
  acousticLeaf(-0.37, 1.12, lilac);

  const arch = new THREE.Shape();
  arch.moveTo(-3.23, 0.57);
  arch.lineTo(-3.23, 2.38);
  arch.bezierCurveTo(-3.23, 4.16, -2.02, 5.19, -0.38, 5.19);
  arch.bezierCurveTo(1.68, 5.19, 3.23, 3.97, 3.23, 2.24);
  arch.lineTo(3.23, 0.57);
  arch.lineTo(2.69, 0.57);
  arch.lineTo(2.69, 2.24);
  arch.bezierCurveTo(2.69, 3.65, 1.37, 4.64, -0.38, 4.64);
  arch.bezierCurveTo(-1.75, 4.64, -2.69, 3.8, -2.69, 2.38);
  arch.lineTo(-2.69, 0.57);
  arch.closePath();
  const proscenium = mesh(
    new THREE.ExtrudeGeometry(arch, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSize: 0.055,
      bevelThickness: 0.055,
      bevelSegments: 4,
      curveSegments: 64,
    }),
    ivory,
  );
  proscenium.position.z = -1.31;

  // Quiet, wide acoustic fins show the shell's depth without drawn-on texture.
  [-0.15, 0.17, 0.49, 0.81].forEach((angle, index) => {
    const fin = box(0.055, 2.75 - index * 0.1, 0.23, lilac);
    fin.position.set(
      Math.sin(angle) * 2.99,
      2.15 - index * 0.04,
      -0.53 - Math.cos(angle) * 1.53 + 0.06,
    );
    fin.rotation.y = -angle;
  });

  // A single small upholstered bench at the wing balances the piano's mass.
  const wingBench = new THREE.Group();
  wingBench.position.set(2.05, 0.63, 0.23);
  wingBench.rotation.y = -0.2;
  root.add(wingBench);
  const cushion = mesh(
    horizontalShape(roundedPlan(0.58, 1.15, 0.2), 0.18, 0.045),
    blue,
    wingBench,
  );
  cushion.position.y = 0.42;
  [-0.19, 0.19].forEach((x) => {
    [-0.39, 0.39].forEach((z) => {
      const leg = box(0.055, 0.44, 0.055, graphite, wingBench);
      leg.position.set(x, 0.22, z);
    });
  });

  const piano = new THREE.Group();
  piano.position.set(-0.35, 0.63, 0.17);
  piano.rotation.y = -0.23;
  piano.scale.setScalar(1.12);
  root.add(piano);

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
  for (let i = 0; i < 52; i++) {
    const key = mesh(whiteKeyGeometry, warmWhite, piano);
    key.position.set(-0.81 + i * 0.0318, 1.157, 1.04);
    key.castShadow = false;
    if (i < 51 && [0, 1, 3, 4, 5].includes(i % 7)) {
      const sharp = mesh(blackKeyGeometry, keyBlack, piano);
      sharp.position.set(-0.794 + i * 0.0318, 1.198, 0.991);
      sharp.castShadow = false;
    }
  }
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

  scene.add(new THREE.HemisphereLight("#F1ECE8", "#24242B", 1.4));
  const key = new THREE.DirectionalLight("#FFF2E4", 3.2);
  key.position.set(-3, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -7,
    right: 7,
    top: 8,
    bottom: -5,
    near: 0.1,
    far: 25,
  });
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight("#DDE5F2", 1.1);
  fill.position.set(6, 5, 0);
  scene.add(fill);
  const rimLight = new THREE.DirectionalLight("#F2EBE5", 1.25);
  rimLight.position.set(-1, 6, -5);
  scene.add(rimLight);

  const active = () => !disposed && !contextLost && visible && !document.hidden;
  const animated = () => motion && !reduced.matches;
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
    const dt = Math.min(0.08, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    if (animated()) elapsed += dt;
    const ease = 1 - Math.exp(-dt * 3.4);
    easedX += (pointerX - easedX) * ease;
    easedY += (pointerY - easedY) * ease;
    root.rotation.y = animated()
      ? easedX * 0.055 + Math.sin(elapsed * 0.22) * 0.008
      : 0;
    root.rotation.x = animated() ? -easedY * 0.023 : 0;
    root.position.y = animated() ? Math.sin(elapsed * 0.43) * 0.018 : 0;
    // Reuse the soft shadow atlas between perceptible changes in the diorama.
    if (Math.abs(root.rotation.y - shadowYaw) > 0.009) {
      renderer.shadowMap.needsUpdate = true;
      shadowYaw = root.rotation.y;
    }
    try {
      renderer.render(scene, camera);
    } catch {
      fail();
      return;
    }
    canvas.dataset.frame = String(Number(canvas.dataset.frame) + 1);
    lastDraw = now;
    if (!ready && !contextLost && !disposed) {
      ready = true;
      onReady();
    }
  };
  const loop = (now: number) => {
    raf = 0;
    if (!active() || !animated()) return;
    if (now - lastDraw >= 1000 / 30) draw(now);
    raf = requestAnimationFrame(loop);
  };
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    lastTime = performance.now();
    if (active()) {
      draw(lastTime);
      if (animated()) raf = requestAnimationFrame(loop);
    }
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
    const narrow = aspect < 1.05;
    const viewHeight = narrow
      ? Math.max(8, 8.2 / aspect)
      : Math.max(7.5, 13.5 / aspect);
    const viewWidth = viewHeight * aspect;
    const centerX = narrow ? 0.5 : 0.73;
    const centerY = narrow ? 0.72 : 0.52;
    camera.left = -viewWidth * centerX;
    camera.right = viewWidth * (1 - centerX);
    camera.top = viewHeight * centerY;
    camera.bottom = -viewHeight * (1 - centerY);
    camera.position.set(8.4, 7.2, 13.8);
    camera.lookAt(0, 2.18, 0.1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    schedule();
  };
  const pointerTarget = host.closest(".theatre-lobby") || host;
  const pointer = (event: Event) => {
    if (!animated()) return;
    const e = event as PointerEvent,
      rect = host.getBoundingClientRect();
    pointerX = THREE.MathUtils.clamp(
      (e.clientX - rect.left) / rect.width - 0.5,
      -0.5,
      0.5,
    );
    pointerY = THREE.MathUtils.clamp(
      0.5 - (e.clientY - rect.top) / rect.height,
      -0.5,
      0.5,
    );
  };
  const leave = () => {
    pointerX = 0;
    pointerY = 0;
  };
  const lost = (event: Event) => {
    event.preventDefault();
    fail();
  };
  const resizeObserver = new ResizeObserver(resize);
  const intersection = new IntersectionObserver((entries) => {
    const nextVisible = entries.some((entry) => entry.isIntersecting);
    if (visible === nextVisible) return;
    visible = nextVisible;
    schedule();
  });
  const visibility = () => schedule();
  const preference = () => {
    pointerX = pointerY = easedX = easedY = 0;
    schedule();
  };
  resizeObserver.observe(host);
  intersection.observe(host);
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", preference);
  pointerTarget.addEventListener("pointermove", pointer, { passive: true });
  pointerTarget.addEventListener("pointerleave", leave);
  canvas.addEventListener("webglcontextlost", lost);
  resize();

  return {
    setMotion(next) {
      if (motion === next) return;
      motion = next;
      pointerX = pointerY = easedX = easedY = 0;
      schedule();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
      pointerTarget.removeEventListener("pointermove", pointer);
      pointerTarget.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", lost);
      geometries.forEach((value) => value.dispose());
      materials.forEach((value) => value.dispose());
      key.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
