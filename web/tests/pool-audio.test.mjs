import { test } from "node:test";
import assert from "node:assert/strict";
import { PoolAudio } from "../src/features/water/audio.ts";
function fakeContext() {
  let resume, rejectResume;
  const ctx = {
    state: "suspended",
    currentTime: 0,
    destination: {},
    created: 0,
    closed: false,
    resume: () =>
      new Promise((r, reject) => {
        rejectResume = reject;
        resume = () => {
          ctx.state = "running";
          r();
        };
      }),
    close: async () => {
      ctx.closed = true;
      ctx.state = "closed";
    },
    createDynamicsCompressor: () => ({
      threshold: { value: 0 },
      knee: { value: 0 },
      ratio: { value: 0 },
      attack: { value: 0 },
      release: { value: 0 },
      connect() {},
    }),
    createGain: () => ({
      gain: {
        value: 0,
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      connect() {},
      disconnect() {},
    }),
    createOscillator: () => {
      ctx.created++;
      return {
        frequency: { value: 0 },
        type: "sine",
        connect() {},
        start() {},
        stop() {},
        disconnect() {},
        onended: null,
      };
    },
  };
  return {
    ctx,
    release: () => resume(),
    reject: () => rejectResume(new Error("permission denied")),
  };
}
test("a note waiting for sound permission never starts after stop or dispose", async () => {
  const f = fakeContext();
  const engine = new PoolAudio(() => f.ctx);
  const pending = engine.note(0);
  engine.stop();
  f.release();
  assert.equal(await pending, false);
  assert.equal(f.ctx.created, 0);
  engine.dispose();
  assert.equal(f.ctx.closed, true);
});
test("a pending melody cannot schedule callbacks or voices after disposal", async () => {
  const f = fakeContext();
  const engine = new PoolAudio(() => f.ctx);
  let updates = 0;
  const pending = engine.play(
    [0, 1, null, null, null, null, null, null],
    () => updates++,
    () => updates++,
  );
  engine.dispose();
  f.release();
  assert.equal(await pending, false);
  assert.equal(f.ctx.created, 0);
  assert.equal(updates, 0);
});
test("a rejected permission request after cancellation is ignored", async () => {
  const f = fakeContext(),
    engine = new PoolAudio(() => f.ctx);
  const pending = engine.note(0);
  engine.stop();
  f.reject();
  assert.equal(await pending, false);
  assert.equal(f.ctx.created, 0);
  engine.dispose();
});
