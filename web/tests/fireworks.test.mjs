import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createFireworks } from "../src/rendering/fireworks.ts";
test("celebration is spatial, bounded and truly finishes after active time", () => {
  const scene = new THREE.Scene(),
    f = createFireworks(scene);
  const cloud = scene.getObjectByName("Celebration sparks");
  assert.ok(cloud instanceof THREE.Points);
  const directions = cloud.geometry.getAttribute("aDirection");
  let min = 1,
    max = -1;
  for (let i = 0; i < directions.count; i++) {
    min = Math.min(min, directions.getZ(i));
    max = Math.max(max, directions.getZ(i));
  }
  assert.ok(min < -0.8 && max > 0.8, "Burst expands in real depth");
  f.advance(2, true);
  const time = f.elapsed;
  assert.ok(time > 0 && f.active);
  f.advance(20, false);
  assert.equal(f.elapsed, time, "Suspended decoration does not advance");
  f.advance(20, true);
  assert.equal(f.active, false);
  assert.equal(cloud.visible, false);
  let gd = 0,
    md = 0;
  cloud.geometry.addEventListener("dispose", () => gd++);
  cloud.material.addEventListener("dispose", () => md++);
  f.dispose();
  f.dispose();
  assert.equal(gd, 1);
  assert.equal(md, 1);
  assert.equal(scene.children.length, 0);
});
