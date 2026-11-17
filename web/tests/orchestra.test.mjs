import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { buildOrchestra } from "../src/rendering/orchestra.ts";
test("orchestra covers four instrument families inside the stage envelope", () => {
  const root = new THREE.Group(),
    geometries = new Set(),
    materials = new Set();
  const result = buildOrchestra(root, {
    geometry: (g) => (geometries.add(g), g),
    material: (color, roughness = 0.7, metalness = 0) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      materials.add(m);
      return m;
    },
  });
  for (const family of ["Strings", "Woodwinds", "Brass", "Percussion"]) {
    assert.ok(result[family] > 0);
    assert.ok(root.getObjectByName(family));
  }
  const bounds = new THREE.Box3().setFromObject(root);
  assert.ok(bounds.min.x >= -7.9 && bounds.max.x <= 7.9);
  assert.ok(bounds.min.z >= -11.7 && bounds.max.z <= -2.6);
  assert.ok(Number.isFinite(bounds.max.y));
  let draws = 0;
  root.traverse((o) => {
    if (o instanceof THREE.InstancedMesh) draws++;
  });
  assert.ok(draws < 65, "Shared instances keep the ensemble bounded");
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  root.traverse((o) => {
    if (o instanceof THREE.InstancedMesh) o.dispose();
  });
});
