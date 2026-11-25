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
test("layered teaching audio cancels pending startup and schedules both parts on one context", async () => {
  const f = fakeContext(),
    engine = new PoolAudio(() => f.ctx);
  assert.equal(typeof engine.playLayers, "function");
  const pending = engine.playLayers(
    [{ notes: [0, 2, 4, null] }, { notes: [0, 0, 0, 0] }],
    () => {},
    () => {},
    4,
  );
  engine.stop();
  f.release();
  assert.equal(await pending, false);
  assert.equal(f.ctx.created, 0);
  assert.equal(
    await engine.playLayers(
      [{ notes: [0, 2, 4, null] }, { notes: [0, 0, 0, 0] }],
      () => {},
      () => {},
      4,
    ),
    true,
  );
  assert.equal(f.ctx.created, 14);
  engine.dispose();
});
test("studio BPM controls the actual spacing of eighth-note steps", async () => {
  for (const bpm of [60, 140]) {
    const f = fakeContext(),
      starts = [];
    const make = f.ctx.createOscillator;
    f.ctx.createOscillator = () => {
      const osc = make();
      osc.start = (t) => starts.push(t);
      return osc;
    };
    const engine = new PoolAudio(() => f.ctx);
    const pending = engine.playLayers(
      [{ notes: [0, 1] }],
      () => {},
      () => {},
      2,
      bpm,
    );
    f.release();
    assert.equal(await pending, true);
    assert.ok(Math.abs(starts[2] - starts[0] - 60 / bpm / 2) < 1e-8);
    engine.dispose();
  }
});
test('a piano waiting for sample download cannot sound after cancellation',async()=>{
 const f=fakeContext();let resolveSamples;const samples=new Promise(r=>resolveSamples=r);
 f.ctx.decodeAudioData=async()=>({duration:2});let sources=0;
 f.ctx.createBufferSource=()=>{sources++;return{connect(){},disconnect(){},playbackRate:{value:1},start(){},stop(){}}};
 const engine=new PoolAudio(()=>f.ctx,'piano',()=>samples);
 const pending=engine.note(0);f.release();await new Promise(r=>setTimeout(r,0));engine.stop();
 resolveSamples([{midi:60,bytes:new ArrayBuffer(4)}]);
 assert.equal(await pending,false);assert.equal(sources,0);engine.dispose();
});
test('sampled piano repitches on the existing context and stops every active source',async()=>{
 const f=fakeContext(),sources=[];f.ctx.decodeAudioData=async()=>({duration:2});
 f.ctx.createBufferSource=()=>{const source={playbackRate:{value:1},connect(){},disconnect(){},start(){},stop(){source.stopped=true}};sources.push(source);return source};
 const engine=new PoolAudio(()=>f.ctx,'piano',async()=>[{midi:60,bytes:new ArrayBuffer(4)}]);
 const pending=engine.note(1);f.release();assert.equal(await pending,true);
 assert.equal(sources.length,1);assert.ok(Math.abs(sources[0].playbackRate.value-2**(2/12))<1e-8);
 engine.stop();assert.ok(sources.every(s=>s.stopped));engine.dispose();
});
test('single-layer pool playback forwards the selected tempo',async()=>{
 const f=fakeContext(),starts=[];const make=f.ctx.createOscillator;f.ctx.createOscillator=()=>{const o=make();o.start=t=>starts.push(t);return o};
 const engine=new PoolAudio(()=>f.ctx);const pending=engine.play([0,1],()=>{},()=>{},2,60);f.release();await pending;
 assert.ok(Math.abs(starts[2]-starts[0]-.5)<1e-8);engine.dispose();
});
test('a glass phrase finishes its audible release instead of cutting it at the grid boundary',async()=>{
 const f=fakeContext(),engine=new PoolAudio(()=>f.ctx,'glass');let done=false;
 const pending=engine.play([0],()=>{},()=>{done=true},1,140);f.release();assert.equal(await pending,true);
 await new Promise(r=>setTimeout(r,300));assert.equal(done,false);
 await new Promise(r=>setTimeout(r,440));assert.equal(done,true);engine.dispose();
});
test('rapid taps during first sample loading play only the latest pending note',async()=>{
 const f=fakeContext();f.ctx.state='running';let resolve;const samples=new Promise(r=>resolve=r);let count=0;
 f.ctx.decodeAudioData=async()=>({duration:2});f.ctx.createBufferSource=()=>{count++;return{playbackRate:{value:1},connect(){},disconnect(){},start(){},stop(){}}};
 const engine=new PoolAudio(()=>f.ctx,'piano',()=>samples);const first=engine.note(0),last=engine.note(4);
 resolve([{midi:60,bytes:new ArrayBuffer(4)}]);assert.equal(await first,false);assert.equal(await last,true);assert.equal(count,1);engine.dispose();
});
