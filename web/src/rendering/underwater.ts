import * as THREE from "three";
/** Original geometry and light layers; shares the aquarium's audio-time clock. */
export function createUnderwater() {
  const group = new THREE.Group(),
    geometries: THREE.BufferGeometry[] = [],
    materials: THREE.Material[] = [];
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => {
    geometries.push(g);
    if (!materials.includes(m)) materials.push(m);
    const o = new THREE.Mesh(g, m);
    group.add(o);
    return o;
  };
  const sand = new THREE.MeshStandardMaterial({
    color: "#353849",
    roughness: 1,
  });
  const stone = new THREE.MeshStandardMaterial({
    color: "#59596e",
    roughness: 0.95,
  });
  const plant = new THREE.MeshStandardMaterial({
    color: "#827dba",
    roughness: 0.8,
  });
  materials.push(plant);
  const beds: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const b = mesh(new THREE.SphereGeometry(1, 24, 12), sand);
    b.position.set((i - 2) * 3, -3, -3.5 - (i % 2));
    b.scale.set(2.8, 0.8, 1.5);
    beds.push(b);
  }
  for (let i = 0; i < 7; i++) {
    const rock = mesh(new THREE.IcosahedronGeometry(0.35, 2), stone);
    rock.position.set((i - 3) * 1.9, -2.17, -2.8 - (i % 3) * 0.7);
    rock.scale.set(1.1 + (i % 2) * 0.5, 0.7, 1);
    rock.rotation.set(i * 0.37, i * 0.5, 0);
  }
  const stems: THREE.Group[] = [];
  for (const side of [-1, 1])
    for (let i = 0; i < 4; i++) {
      const root = new THREE.Group();
      root.position.set(side * (3.2 + i * 0.38), -2.25, -2.5 - i * 0.2);
      group.add(root);
      stems.push(root);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(side * 0.16, 0.4, 0),
        new THREE.Vector3(-side * 0.09, 0.85, 0.05),
        new THREE.Vector3(side * 0.14, 1.25 + i * 0.12, 0),
      ]);
      const g = new THREE.TubeGeometry(
        curve,
        18,
        0.035 + (i % 2) * 0.012,
        5,
        false,
      );
      geometries.push(g);
      const stem = new THREE.Mesh(g, plant);
      root.add(stem);
    }
  const rays: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.MeshBasicMaterial({
      color: "#c3bdf9",
      transparent: true,
      opacity: 0.027,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const r = mesh(new THREE.PlaneGeometry(0.45 + i * 0.14, 8), m);
    r.position.set(i * 2.2 - 1.8, 0.8, -5);
    r.rotation.z = -0.38;
    rays.push(r);
  }
  const dustPositions = new Float32Array(24 * 3);
  for (let i = 0; i < 24; i++) {
    dustPositions[i * 3] = Math.sin(i * 5.7) * 7;
    dustPositions[i * 3 + 1] = Math.cos(i * 3.1) * 2.5;
    dustPositions[i * 3 + 2] = -4 + (i % 4);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3),
  );
  geometries.push(dustGeometry);
  const dustMaterial = new THREE.PointsMaterial({
    color: "#bbb9eb",
    size: 0.022,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  materials.push(dustMaterial);
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  group.add(dust);
  return {
    group,
    update(t: number, width: number) {
      group.scale.x = Math.max(0.45, width / 16);
      stems.forEach((s, i) => (s.rotation.z = Math.sin(t * 0.55 + i) * 0.08));
      rays.forEach(
        (r, i) => (r.position.x = i * 2.2 - 1.8 + Math.sin(t * 0.12 + i) * 0.4),
      );
      dust.position.y = Math.sin(t * 0.1) * 0.16;
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      group.removeFromParent();
    },
  };
}
