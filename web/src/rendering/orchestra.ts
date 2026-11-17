import * as THREE from "three";
import type { HallResources } from "./hall-architecture";

/** Original miniature orchestra: shared forms are instanced by section/material. */
export function buildOrchestra(
  root: THREE.Group,
  { geometry, material }: HallResources,
) {
  const ivory = material("#F4F4F4"),
    ink = material("#25232F"),
    strings = material("#EE2560", 0.58),
    viola = material("#A593E0", 0.6),
    gold = material("#FFDA8E", 0.48, 0.28),
    blue = material("#80D4F6", 0.52),
    black = material("#111119");
  const cube = geometry(new THREE.BoxGeometry(1, 1, 1)),
    sphere = geometry(new THREE.SphereGeometry(1, 12, 8)),
    cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 10)),
    ring = geometry(new THREE.TorusGeometry(0.24, 0.032, 7, 22));
  const part = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = sx,
    sz = sx,
  ) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    parent.add(o);
    return o;
  };
  const box = (
    p: THREE.Group,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) => part(cube, m, p, x, y, z, w, h, d);
  const ball = (
    p: THREE.Group,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    w: number,
    h = w,
    d = w,
  ) => part(sphere, m, p, x, y, z, w, h, d);
  const rod = (
    p: THREE.Group,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
  ) => part(cylinder, m, p, x, y, z, r, h, r);
  const person = (seated = true) => {
    const p = new THREE.Group();
    if (seated) {
      box(p, ink, 0, 0.43, 0, 0.42, 0.08, 0.42);
      box(p, ink, 0, 0.74, -0.19, 0.42, 0.48, 0.055);
      for (const x of [-0.16, 0.16]) box(p, ink, x, 0.2, -0.1, 0.04, 0.4, 0.04);
    }
    const lift = seated ? 0 : 0.2;
    ball(p, ink, 0, 0.77 + lift, 0, 0.19, 0.31, 0.14);
    ball(p, ivory, 0, 1.18 + lift, 0.025, 0.125, 0.15, 0.12);
    for (const x of [-0.11, 0.11]) {
      box(p, ink, x, 0.23 + lift, 0.13, 0.095, 0.43, 0.1);
      box(p, black, x, 0.055 + lift, 0.22, 0.13, 0.09, 0.24);
    }
    return p;
  };
  const stand = () => {
    const p = new THREE.Group();
    rod(p, ink, 0, 0.48, 0, 0.018, 0.96);
    box(p, ink, 0, 0.98, 0, 0.48, 0.32, 0.04).rotation.x = -0.24;
    box(p, ivory, 0, 0.99, 0.035, 0.38, 0.24, 0.008).rotation.x = -0.24;
    for (const x of [-0.16, 0.16])
      box(p, ink, x, 0.04, 0, 0.3, 0.035, 0.04).rotation.y = x * 4;
    return p;
  };
  const violin = (surface: THREE.Material) => {
    const p = new THREE.Group();
    ball(p, surface, 0, 0.16, 0, 0.18, 0.2, 0.065);
    ball(p, surface, 0, 0.4, 0, 0.14, 0.15, 0.06);
    box(p, black, 0, 0.66, 0.03, 0.052, 0.45, 0.035);
    ball(p, surface, 0, 0.93, 0.03, 0.055, 0.07, 0.05);
    box(p, ivory, 0, 0.29, 0.077, 0.12, 0.045, 0.02);
    box(p, gold, 0, 0.54, 0.08, 0.009, 0.67, 0.008);
    return p;
  };
  const fiddle = person();
  const f = violin(strings);
  f.position.set(-0.1, 0.55, 0.22);
  f.scale.setScalar(0.65);
  f.rotation.z = -0.8;
  fiddle.add(f);
  box(fiddle, gold, 0.22, 0.91, 0.24, 0.012, 0.69, 0.012).rotation.z = -0.38;
  const violaPlayer = fiddle.clone(true);
  violaPlayer.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material === strings) o.material = viola;
  });
  const cellist = person();
  const c = violin(strings);
  c.position.set(0, 0.17, 0.35);
  c.scale.set(1, 1.1, 1);
  cellist.add(c);
  rod(cellist, gold, 0, 0.09, 0.35, 0.012, 0.18);
  box(cellist, gold, 0.19, 0.66, 0.45, 0.012, 0.72, 0.012).rotation.z = -1.05;
  const bassist = person(false);
  const bass = violin(viola);
  bass.scale.set(1.35, 1.8, 1.3);
  bass.position.set(0.18, 0.14, 0.36);
  bassist.add(bass);
  rod(bassist, gold, 0.18, 0.07, 0.36, 0.015, 0.14);
  const wind = (kind: string) => {
    const p = person();
    if (kind === "flute") {
      const o = rod(p, blue, 0.31, 1.04, 0.22, 0.035, 0.75);
      o.rotation.z = Math.PI / 2;
    } else {
      rod(
        p,
        kind === "bassoon" ? strings : black,
        0.1,
        0.8,
        0.26,
        kind === "bassoon" ? 0.055 : 0.035,
        kind === "bassoon" ? 1.1 : 0.64,
      );
      for (let i = 0; i < 5; i++)
        ball(p, gold, 0.1, 0.6 + i * 0.09, 0.3, 0.018);
    }
    return p;
  };
  const horn = person();
  const coil = part(ring, gold, horn, 0.08, 0.8, 0.3);
  coil.rotation.x = 0.12;
  const bellGeometry = geometry(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.032, 0),
        new THREE.Vector2(0.046, 0.16),
        new THREE.Vector2(0.1, 0.3),
        new THREE.Vector2(0.21, 0.38),
      ],
      16,
    ),
  );
  const bell = part(bellGeometry, gold, horn, 0.27, 0.7, 0.3);
  bell.rotation.z = -Math.PI / 2;
  const trumpet = person();
  rod(trumpet, gold, 0.15, 0.99, 0.32, 0.035, 0.48).rotation.x = Math.PI / 2;
  const tb = part(bellGeometry, gold, trumpet, 0.15, 0.99, 0.52, 0.65);
  tb.rotation.x = Math.PI / 2;
  const trombone = trumpet.clone(true);
  box(trombone, gold, 0.2, 0.94, 0.6, 0.025, 0.025, 0.75);
  box(trombone, gold, 0.1, 0.94, 0.6, 0.025, 0.025, 0.75);
  box(trombone, gold, 0.15, 0.94, 0.98, 0.12, 0.025, 0.025);
  const tuba = person();
  part(ring, gold, tuba, 0.12, 0.75, 0.3, 1.4);
  const tubaBell = part(bellGeometry, gold, tuba, 0.32, 0.91, 0.3, 1.3);
  tubaBell.rotation.z = -0.15;
  const drum = () => {
    const p = new THREE.Group();
    ball(p, gold, 0, 0.66, 0, 0.39, 0.33, 0.39);
    rod(p, ivory, 0, 0.84, 0, 0.4, 0.035);
    for (const x of [-0.24, 0.24]) rod(p, ink, x, 0.33, 0, 0.025, 0.55);
    return p;
  };
  const percussion = new THREE.Group();
  percussion.add(person(false));
  for (let i = 0; i < 3; i++) {
    const d = drum();
    d.position.set(-0.65 + i * 0.58, 0, 0.65 - Math.abs(i - 1) * 0.16);
    d.scale.setScalar(0.8 + i * 0.1);
    percussion.add(d);
  }
  const mallets = new THREE.Group();
  const player = person(false);
  player.position.z = -0.38;
  mallets.add(player);
  box(mallets, ink, 0, 0.7, 0.35, 1.2, 0.1, 0.65);
  for (let i = 0; i < 10; i++) {
    box(
      mallets,
      i % 2 ? blue : ivory,
      -0.52 + i * 0.115,
      0.79,
      0.35,
      0.09,
      0.035,
      0.58 - i * 0.025,
    );
    rod(mallets, gold, -0.52 + i * 0.115, 0.48, 0.35, 0.025, 0.43 - i * 0.02);
  }
  for (const x of [-0.4, 0.4]) rod(mallets, ink, x, 0.35, 0.35, 0.03, 0.7);
  const groups: Record<string, THREE.Group> = {};
  const counts: Record<string, number> = {};
  const place = (
    family: string,
    model: THREE.Group,
    x: number,
    z: number,
    y = 0,
    angle = 0,
    withStand = true,
  ) => {
    const g = groups[family] ?? (groups[family] = new THREE.Group());
    const copy = model.clone(true);
    copy.position.set(x, y, z);
    copy.rotation.y = angle;
    g.add(copy);
    counts[family] = (counts[family] || 0) + 1;
    if (withStand) {
      const desk = stand();
      desk.position.set(x + 0.32, y, z + 0.6);
      desk.rotation.y = angle;
      g.add(desk);
    }
  };
  // Strings form the front semicircle, then winds, brass and the rear percussion.
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 4; col++)
      place(
        "Strings",
        fiddle,
        -4.5 + col * 0.85,
        2.35 - row * 0.92,
        0.02,
        -0.18,
      );
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 3; col++)
      place(
        "Strings",
        violaPlayer,
        0.65 + col * 0.75,
        2.2 - row * 0.93,
        0.02,
        0.15,
      );
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 2; col++)
      place("Strings", cellist, 3.4 + col * 0.87, 2.3 - row * 1.05, 0.02, 0.22);
  for (let i = 0; i < 3; i++)
    place("Strings", bassist, 5.6 + i * 0.25, 0.4 - i * 1.05, 0.03, 0.2);
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 4; col++)
      place(
        "Woodwinds",
        wind(["flute", "oboe", "clarinet", "bassoon"][col]),
        -1.8 + col * 1.05,
        -0.6 - row * 0.95,
        0.2 + row * 0.12,
      );
  for (let i = 0; i < 3; i++)
    place("Brass", horn, -3.25 + i * 0.85, -2.25, 0.4);
  for (let i = 0; i < 2; i++)
    place("Brass", trumpet, 0.15 + i * 0.9, -2.3, 0.4);
  place("Brass", trombone, 2.1, -2.35, 0.4);
  place("Brass", tuba, 3.25, -2.4, 0.4);
  place("Percussion", percussion, -5.05, -2.75, 0.25, 0, false);
  place("Percussion", mallets, 4.6, -3.1, 0.3, 0, false);
  const conductor = new THREE.Group();
  box(conductor, ivory, 0, 0.1, 0, 1, 0.2, 0.8);
  const leader = person(false);
  leader.position.y = 0.2;
  conductor.add(leader);
  box(conductor, gold, 0.27, 1.35, 0.22, 0.012, 0.52, 0.012).rotation.z = -0.7;
  place("Conductor", conductor, 0, 3.1, 0, Math.PI, false);
  // Batch identical geometry/material pairs per family. Parent owns all resources.
  for (const [name, source] of Object.entries(groups)) {
    source.updateMatrixWorld(true);
    const batches = new Map<
      string,
      { g: THREE.BufferGeometry; m: THREE.Material; matrices: THREE.Matrix4[] }
    >();
    source.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const m = o.material as THREE.Material,
          k = o.geometry.uuid + m.uuid,
          b = batches.get(k) ?? {
            g: o.geometry,
            m,
            matrices: [] as THREE.Matrix4[],
          };
        b.matrices.push(o.matrixWorld.clone());
        batches.set(k, b);
      }
    });
    const section = new THREE.Group();
    section.name = name;
    section.position.set(0, 1.53, -6.7);
    for (const b of batches.values()) {
      const mesh = new THREE.InstancedMesh(b.g, b.m, b.matrices.length);
      b.matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      section.add(mesh);
    }
    root.add(section);
  }
  return counts;
}
