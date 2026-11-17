import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { hallCameraPose, pointerHallView } from "../src/rendering/hall-view.ts";
const degrees = (r) => (r * 180) / Math.PI;
test("passive pointer travel remains a gentle local view", () => {
  const a = pointerHallView(-0.5, 0),
    b = pointerHallView(0.5, 0);
  assert.ok(
    Math.abs(degrees(b.yaw - a.yaw)) <= 40,
    "Hover never gives a full turn",
  );
  assert.ok(
    Math.abs(degrees(b.yaw - a.yaw)) >= 30,
    "The gentle response remains visible",
  );
});
test("gentle hover is centered and has a small pitch envelope", () => {
  assert.deepEqual(pointerHallView(0, 0), { yaw: 0, pitch: 0 });
  assert.ok(Math.abs(pointerHallView(0, -0.5).pitch) < 0.1);
});
test("out-of-range and nonfinite pointer coordinates stay finite", () => {
  assert.deepEqual(pointerHallView(20, -20), pointerHallView(0.5, -0.5));
  for (const v of [NaN, Infinity, -Infinity])
    assert.deepEqual(pointerHallView(v, v), { yaw: 0, pitch: 0 });
});

test("opening-following camera convention reverses pointer azimuth", () => {
  assert.ok(
    pointerHallView(0.4, 0).yaw < 0,
    "Rightward pointer shows a right-facing opening",
  );
  assert.ok(pointerHallView(-0.4, 0).yaw > 0);
});

test("the projected front opening follows pointer right and down", () => {
  const project = (x, y) => {
    const v = pointerHallView(x, y),
      p = hallCameraPose(v.yaw, v.pitch),
      c = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.1, 160);
    c.position.set(p.x, p.y, p.z);
    c.lookAt(0, 4, -0.3);
    c.updateMatrixWorld();
    return new THREE.Vector3(0, 1.5, 12).project(c);
  };
  assert.ok(project(0.4, 0).x > project(-0.4, 0).x);
  assert.ok(project(0, 0.4).y < project(0, -0.4).y);
});
