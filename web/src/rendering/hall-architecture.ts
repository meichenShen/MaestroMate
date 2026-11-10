import * as THREE from "three";

export interface HallResources {
  geometry: <T extends THREE.BufferGeometry>(value: T) => T;
  material: (
    color: THREE.ColorRepresentation,
    roughness?: number,
    metalness?: number,
  ) => THREE.MeshStandardMaterial;
}

/** An original, roof-open concert hall. Every surface is texture-free geometry. */
export function buildHall(
  root: THREE.Group,
  { geometry, material }: HallResources,
) {
  const ivory = material("#EEE8DB");
  const ink = material("#1C1B21");
  const blue = material("#45D9FD");
  const violet = material("#A593E0");
  const coral = material("#EE2560");
  const gold = material("#FFDA8E", 0.55, 0.12);
  const darkBlue = material("#343B68");
  const add = (
    shape: THREE.BufferGeometry,
    surface: THREE.Material,
    parent: THREE.Object3D = root,
  ) => {
    const mesh = new THREE.Mesh(geometry(shape), surface);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const box = (w: number, h: number, d: number, surface: THREE.Material) =>
    add(new THREE.BoxGeometry(w, h, d), surface);
  function roundRect(w: number, d: number, r: number) {
    const s = new THREE.Shape(),
      x = -w / 2,
      z = -d / 2;
    s.moveTo(x + r, z);
    s.lineTo(x + w - r, z);
    s.quadraticCurveTo(x + w, z, x + w, z + r);
    s.lineTo(x + w, z + d - r);
    s.quadraticCurveTo(x + w, z + d, x + w - r, z + d);
    s.lineTo(x + r, z + d);
    s.quadraticCurveTo(x, z + d, x, z + d - r);
    s.lineTo(x, z + r);
    s.quadraticCurveTo(x, z, x + r, z);
    return s;
  }
  function slab(
    shape: THREE.Shape,
    depth: number,
    surface: THREE.Material,
    y: number,
    z = 0,
  ) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 2,
      curveSegments: 48,
    });
    g.rotateX(-Math.PI / 2);
    const m = add(g, surface);
    m.position.set(0, y, z);
    return m;
  }
  // The broad foundation, entry apron and circulation paths establish the scale.
  slab(roundRect(29.6, 26.8, 5.2), 0.45, ink, 0, -0.15);
  slab(roundRect(29.3, 26.5, 5.1), 0.1, gold, 0.46, -0.15);
  slab(roundRect(29.2, 26.4, 5.1), 0.18, ivory, 0.56, -0.15);
  for (let i = 0; i < 3; i++) {
    slab(
      roundRect(8.6 + i * 0.55, 0.65, 0.2),
      0.16,
      ivory,
      0.12 + i * 0.18,
      12.25 - i * 0.48,
    );
  }

  // Arcs are solid sections with genuine thickness, not lines or painted textures.
  function arc(
    inner: number,
    outer: number,
    start: number,
    end: number,
    y: number,
    depth: number,
    surface: THREE.Material,
    centerZ = -5.6,
  ) {
    const shape = new THREE.Shape();
    const n = Math.max(20, Math.ceil((end - start) * 32));
    for (let i = 0; i <= n; i++) {
      const a = start + ((end - start) * i) / n;
      const x = Math.sin(a) * outer,
        z = Math.cos(a) * outer;
      if (i === 0) shape.moveTo(x, -z);
      else shape.lineTo(x, -z);
    }
    for (let i = n; i >= 0; i--) {
      const a = start + ((end - start) * i) / n;
      shape.lineTo(Math.sin(a) * inner, -Math.cos(a) * inner);
    }
    shape.closePath();
    return slab(shape, depth, surface, y, centerZ);
  }

  // Thirteen rising curved rows, with three generous radial circulation aisles.
  const seats: {
    x: number;
    y: number;
    z: number;
    angle: number;
    balcony: boolean;
  }[] = [];
  for (let row = 0; row < 13; row++) {
    const radius = 5.7 + row * 0.63;
    const y = 0.78 + row * 0.115;
    arc(
      radius - 0.35,
      radius + 0.33,
      -0.94,
      0.94,
      y - 0.12,
      0.12,
      row % 3 === 0 ? darkBlue : ink,
    );
    const count = Math.floor((radius * 1.88) / 0.58);
    for (let i = 0; i < count; i++) {
      const angle = -0.91 + (i * 1.82) / (count - 1);
      if (Math.abs(angle) < 0.052 || Math.abs(Math.abs(angle) - 0.49) < 0.043)
        continue;
      seats.push({
        x: Math.sin(angle) * radius,
        y,
        z: -5.6 + Math.cos(angle) * radius,
        angle,
        balcony: false,
      });
    }
  }

  // Two open horseshoe galleries. The missing front section is a real cutaway.
  for (let level = 0; level < 2; level++) {
    const deckY = 3.5 + level * 2.65;
    for (const side of [-1, 1]) {
      const start = side === -1 ? -1.65 : 0.77;
      const end = side === -1 ? -0.77 : 1.65;
      arc(12.05, 14.1, start, end, deckY, 0.28, ivory);
      arc(
        12.05,
        12.23,
        start,
        end,
        deckY + 0.28,
        0.73,
        level === 0 ? blue : violet,
      );
      arc(12.0, 12.27, start, end, deckY + 1.01, 0.08, gold);
      for (let row = 0; row < 2; row++) {
        const radius = 12.63 + row * 0.72;
        const count = 19;
        for (let i = 0; i < count; i++) {
          const angle = start + 0.06 + (i * (end - start - 0.12)) / (count - 1);
          seats.push({
            x: Math.sin(angle) * radius,
            y: deckY + 0.31 + row * 0.14,
            z: -5.6 + Math.cos(angle) * radius,
            angle,
            balcony: true,
          });
        }
      }
    }
  }

  // Shared geometry keeps hundreds of upholstered seats to four draw calls.
  const cushionGeometry = geometry(new THREE.BoxGeometry(0.49, 0.15, 0.48));
  const backGeometry = geometry(
    new THREE.ExtrudeGeometry(roundRect(0.51, 0.6, 0.1), {
      depth: 0.11,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 2,
      curveSegments: 8,
    }),
  );
  const legGeometry = geometry(new THREE.BoxGeometry(0.11, 0.32, 0.23));
  const armGeometry = geometry(new THREE.BoxGeometry(0.055, 0.08, 0.43));
  const upholstery = material("#FFFFFF");
  const cushions = new THREE.InstancedMesh(
    cushionGeometry,
    upholstery,
    seats.length,
  );
  const backs = new THREE.InstancedMesh(backGeometry, upholstery, seats.length);
  const legs = new THREE.InstancedMesh(legGeometry, ink, seats.length);
  const arms = new THREE.InstancedMesh(armGeometry, ink, seats.length * 2);
  const transform = new THREE.Object3D(),
    offset = new THREE.Vector3();
  const colors = [
    new THREE.Color("#45D9FD"),
    new THREE.Color("#A593E0"),
    new THREE.Color("#EE2560"),
  ];
  const instance = (
    mesh: THREE.InstancedMesh,
    index: number,
    s: (typeof seats)[number],
    x: number,
    y: number,
    z: number,
  ) => {
    offset.set(x, y, z).applyAxisAngle(THREE.Object3D.DEFAULT_UP, s.angle);
    transform.position.set(s.x + offset.x, s.y + offset.y, s.z + offset.z);
    transform.rotation.set(0, s.angle, 0);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  };
  seats.forEach((s, i) => {
    instance(cushions, i, s, 0, 0.35, 0);
    instance(backs, i, s, 0, 0.63, 0.18);
    instance(legs, i, s, 0, 0.16, 0.04);
    instance(arms, i * 2, s, -0.27, 0.52, 0);
    instance(arms, i * 2 + 1, s, 0.27, 0.52, 0);
    const color = colors[s.balcony ? 1 : i % 17 === 0 ? 2 : 0];
    cushions.setColorAt(i, color);
    backs.setColorAt(i, color);
  });
  for (const mesh of [cushions, backs, legs, arms]) {
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
  }

  // Tall exterior wings, structural ribs and the upper crown create hall volume.
  for (const side of [-1, 1]) {
    const start = side === -1 ? -1.68 : 0.82,
      end = side === -1 ? -0.82 : 1.68;
    arc(14.05, 14.35, start, end, 0.78, 8.45, ivory);
    arc(14.0, 14.5, start, end, 9.18, 0.22, side === -1 ? blue : coral);
    for (let i = 0; i < 9; i++) {
      const a = start + ((end - start) * i) / 8;
      const rib = box(0.2, 8.12, 0.26, i % 3 === 0 ? gold : ivory);
      rib.position.set(Math.sin(a) * 13.93, 4.84, -5.6 + Math.cos(a) * 13.93);
      rib.rotation.y = a;
    }
    // Open side passage portals remain readable below the gallery.
    for (let i = 0; i < 3; i++) {
      const a = side * (0.99 + i * 0.22);
      const portal = box(0.95, 1.8, 0.08, ink);
      portal.position.set(
        Math.sin(a) * 13.88,
        1.68,
        -5.6 + Math.cos(a) * 13.88,
      );
      portal.rotation.y = a;
    }
  }

  // A continuous rear enclosure joins the galleries into one building volume.
  // Its open crown and cut front keep the auditorium visible at an overhead view.
  for (const side of [-1, 1]) {
    const start = side === -1 ? -Math.PI / 2 : 0;
    const end = side === -1 ? 0 : Math.PI / 2;
    const outline = new THREE.Shape();
    for (let i = 0; i <= 40; i++) {
      const a = start + ((end - start) * i) / 40;
      if (i === 0) outline.moveTo(Math.sin(a) * 14.35, Math.cos(a) * 7.6);
      else outline.lineTo(Math.sin(a) * 14.35, Math.cos(a) * 7.6);
    }
    for (let i = 40; i >= 0; i--) {
      const a = start + ((end - start) * i) / 40;
      outline.lineTo(Math.sin(a) * 14.05, Math.cos(a) * 7.32);
    }
    outline.closePath();
    slab(outline, 8.45, ivory, 0.78, -5.6);
    slab(outline, 0.22, side === -1 ? blue : coral, 9.18, -5.6);
  }

  // A generous stage with curved edge, orchestra risers and a sculpted shell.
  slab(roundRect(15.6, 8.2, 2.0), 0.56, ink, 0.74, -6.8);
  slab(roundRect(15.75, 8.3, 2.0), 0.1, gold, 1.3, -6.8);
  slab(roundRect(15.65, 8.2, 2.0), 0.12, ivory, 1.4, -6.8);
  for (let i = 0; i < 3; i++) {
    slab(
      roundRect(5.2 + i * 0.65, 0.7, 0.22),
      0.2,
      ivory,
      0.78 + i * 0.21,
      -2.78 - i * 0.44,
    );
  }
  for (let i = 0; i < 3; i++) {
    slab(
      roundRect(13.3 - i * 0.6, 1.2, 0.3),
      0.18,
      i % 2 ? violet : ivory,
      1.53 + i * 0.2,
      -7.5 - i * 1.0,
    );
  }
  const shellVertices: number[] = [],
    shellIndices: number[] = [];
  for (let i = 0; i <= 60; i++) {
    const a = -1.2 + (i * 2.4) / 60,
      top = 9.05 - Math.abs(Math.sin(a)) * 1.4;
    for (const [r, y] of [
      [8.0, 1.5],
      [8.0, top],
      [8.35, 1.5],
      [8.35, top],
    ]) {
      shellVertices.push(Math.sin(a) * r, y, -4.4 - Math.cos(a) * r);
    }
    if (i < 60) {
      const k = i * 4;
      shellIndices.push(
        k,
        k + 4,
        k + 1,
        k + 1,
        k + 4,
        k + 5,
        k + 2,
        k + 3,
        k + 6,
        k + 3,
        k + 7,
        k + 6,
        k + 1,
        k + 5,
        k + 3,
        k + 3,
        k + 5,
        k + 7,
      );
    }
  }
  const shellGeometry = new THREE.BufferGeometry();
  shellGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(shellVertices, 3),
  );
  shellGeometry.setIndex(shellIndices);
  shellGeometry.computeVertexNormals();
  add(shellGeometry, violet);
  for (let i = 0; i < 19; i++) {
    const a = -1.14 + (i * 2.28) / 18,
      h = 5.9 - Math.abs(Math.sin(a)) * 0.9;
    const fin = box(0.18, h, 0.38, i % 6 === 0 ? gold : i < 8 ? coral : blue);
    fin.position.set(Math.sin(a) * 7.8, 1.6 + h / 2, -4.4 - Math.cos(a) * 7.8);
    fin.rotation.y = -a;
  }
  // Floating acoustic reflectors explicitly leave the roof open.
  for (let i = 0; i < 4; i++) {
    const reflector = slab(
      roundRect(6.6 - i * 0.65, 1.2, 0.5),
      0.12,
      i % 2 ? gold : ivory,
      8.0 + i * 0.3,
      -7.8 + i * 1.43,
    );
    reflector.rotation.z = -0.04 + i * 0.025;
    for (const side of [-1, 1]) {
      const wire = box(0.025, 1.1, 0.025, ink);
      wire.position.set(
        side * (2.3 - i * 0.24),
        8.65 + i * 0.3,
        -7.8 + i * 1.43,
      );
    }
  }
  return { seatCount: seats.length };
}
