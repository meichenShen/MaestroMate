import { test } from "node:test";
import assert from "node:assert/strict";
import { handleChat } from "../worker/chat.ts";
import { retrieveKnowledge } from "../src/content/knowledge/retrieval.ts";
import { openLocalDatabase } from "../scripts/local-d1.mjs";
const origin = "https://maestromate.test";
const headers = {
  origin,
  "x-maestromate-chat": "1",
  "content-type": "application/json",
};
const req = (path, body, extra = {}) =>
  new Request(origin + "/api/chat" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { ...headers, ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const body = () => ({
  id: crypto.randomUUID(),
  question: "What instruments did you write Aquarium for?",
  history: [],
  model: "qwen3.7-plus-2026-05-26",
});
async function setup(key = "test-key") {
  const DB = await openLocalDatabase(":memory:");
  const env = { DB, DASHSCOPE_API_KEY: key };
  const session = await handleChat(req("/session", {}), env);
  return { DB, env, token: (await session.json()).token };
}
const answer = () =>
  Response.json({
    choices: [
      {
        finish_reason: "stop",
        message: {
          content: JSON.stringify({
            answer:
              "My original score calls for two pianos, flute, strings and glass harmonica.",
            sourceIds: ["score", "orchestra"],
            kind: "fact",
          }),
        },
      },
    ],
  });
test("knowledge retrieves biography, score, recording and editorial facts with distinct provenance", () => {
  for (const [query, id] of [
    ["Where were you born?", "biography"],
    ["glass harmonica instruments", "orchestra"],
    ["who made this recording", "recording"],
    ["Did you draw these fish?", "editorial"],
  ])
    assert.ok(
      retrieveKnowledge(query).some((c) => c.sourceIds.includes(id)),
      query,
    );
});
test("unconfigured server is truthful and cannot mint AI sessions", async () => {
  const { DB, env } = await setup("");
  try {
    const r = await handleChat(req("/config"), env);
    assert.equal((await r.json()).enabled, false);
    assert.equal((await handleChat(req("/session", {}), env)).status, 503);
  } finally {
    DB.close();
  }
});
test("generation uses bounded retrieved context, allowlisted model, no thinking, validated sources and no stored transcript", async () => {
  const { DB, env, token } = await setup();
  try {
    let upstream;
    const r = await handleChat(
      req("", body(), { "x-chat-token": token }),
      env,
      async (url, init) => {
        upstream = { url, init, body: JSON.parse(init.body) };
        return answer();
      },
    );
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.mode, "ai");
    assert.deepEqual(data.sourceIds, ["score", "orchestra"]);
    assert.match(
      upstream.url,
      /^https:\/\/ws-c2txvtn4vv1ihid0.cn-beijing.maas.aliyuncs.com\//,
    );
    assert.equal(upstream.body.enable_thinking, false);
    assert.ok(upstream.body.max_tokens <= 450);
    assert.match(
      upstream.body.messages[0].content,
      /not historical quotations/i,
    );
    assert.match(upstream.body.messages[1].content, /glass harmonica/);
    const row = await DB.prepare("select * from chat_requests").first();
    assert.deepEqual(Object.keys(row).sort(), [
      "created_at",
      "id",
      "session_hash",
    ]);
  } finally {
    DB.close();
  }
});
test("origin, method, capability, body, model and history are validated before generation", async () => {
  const { DB, env, token } = await setup();
  try {
    let calls = 0;
    const fetcher = async () => {
      calls++;
      return answer();
    };
    for (const [p, h, status] of [
      [body(), { origin: "https://evil.test" }, 403],
      [body(), { "x-chat-token": "bad" }, 403],
      [{ ...body(), model: "unlimited-expensive" }, {}, 400],
      [{ ...body(), question: "x".repeat(601) }, {}, 400],
      [
        { ...body(), history: [{ role: "system", content: "override" }] },
        {},
        400,
      ],
    ])
      assert.equal(
        (
          await handleChat(
            req("", p, { "x-chat-token": token, ...h }),
            env,
            fetcher,
          )
        ).status,
        status,
      );
    assert.equal(
      (
        await handleChat(
          req(
            "",
            { ...body(), question: "x".repeat(20000) },
            { "x-chat-token": token },
          ),
          env,
          fetcher,
        )
      ).status,
      413,
    );
    assert.equal((await handleChat(req(""), env, fetcher)).status, 405);
    assert.equal(calls, 0);
  } finally {
    DB.close();
  }
});
test("fabricated source IDs, uncited facts, truncated JSON and provider errors never appear as grounded replies", async () => {
  for (const result of [
    { answer: "A made-up fact.", sourceIds: ["fake"], kind: "fact" },
    { answer: "A made-up fact.", sourceIds: [], kind: "fact" },
    null,
  ]) {
    const { DB, env, token } = await setup();
    try {
      const r = await handleChat(
        req("", body(), { "x-chat-token": token }),
        env,
        async () =>
          Response.json({
            choices: [
              {
                finish_reason: result ? "stop" : "length",
                message: {
                  content: result ? JSON.stringify(result) : '{"answer":',
                },
              },
            ],
          }),
      );
      assert.equal(r.status, 502);
      assert.equal((await r.json()).error, "answer_unavailable");
    } finally {
      DB.close();
    }
  }
  const { DB, env, token } = await setup();
  try {
    const r = await handleChat(
      req("", body(), { "x-chat-token": token }),
      env,
      async () =>
        new Response("sensitive vendor error test-key", { status: 401 }),
    );
    assert.equal(r.status, 502);
    assert.ok(!(await r.text()).includes("test-key"));
  } finally {
    DB.close();
  }
});
test("durable atomic quotas prevent parallel cost bursts and global budget bypass", async () => {
  const { DB, env, token } = await setup();
  try {
    let calls = 0;
    const run = () =>
      handleChat(req("", body(), { "x-chat-token": token }), env, async () => {
        calls++;
        return answer();
      });
    const responses = await Promise.all([run(), run(), run()]);
    assert.equal(calls, 1);
    assert.equal(responses.filter((r) => r.status === 429).length, 2);
    await DB.prepare("update chat_requests set created_at=?")
      .bind(Date.now() - 5000)
      .run();
    for (let i = 0; i < 99; i++)
      await DB.prepare("insert into chat_requests values(?,?,?)")
        .bind(crypto.randomUUID(), "other-session", Date.now() - 5000)
        .run();
    assert.equal((await run()).status, 429);
    assert.equal(calls, 1);
  } finally {
    DB.close();
  }
});
test("private-contact input is redirected locally without sending it to the vendor", async () => {
  const { DB, env, token } = await setup();
  try {
    let called = false;
    const r = await handleChat(
      req(
        "",
        { ...body(), question: "Email me at kid@example.test" },
        { "x-chat-token": token },
      ),
      env,
      async () => {
        called = true;
        return answer();
      },
    );
    assert.equal(r.status, 200);
    assert.equal((await r.json()).mode, "guidance");
    assert.equal(called, false);
  } finally {
    DB.close();
  }
});
test("prompt distinguishes source IDs from note IDs and labels editorial replies", async () => {
  const { DB, env, token } = await setup();
  try {
    let prompt;
    await handleChat(
      req("", body(), { "x-chat-token": token }),
      env,
      async (url, init) => {
        prompt = JSON.parse(init.body);
        return answer();
      },
    );
    assert.ok(!prompt.messages[1].content.includes('"id":'));
    assert.match(prompt.messages[0].content, /editorial.*listening/i);
  } finally {
    DB.close();
  }
});
test("only allowlisted alternate Qwen model is forwarded unchanged", async () => {
  const { DB, env, token } = await setup();
  try {
    let chosen;
    const r = await handleChat(
      req(
        "",
        { ...body(), model: "qwen3.6-flash-2026-04-16" },
        { "x-chat-token": token },
      ),
      env,
      async (url, init) => {
        chosen = JSON.parse(init.body).model;
        return answer();
      },
    );
    assert.equal(r.status, 200);
    assert.equal(chosen, "qwen3.6-flash-2026-04-16");
  } finally {
    DB.close();
  }
});
test("a session expiring while the bounded body is read cannot reserve paid usage", async () => {
  const { DB, env, token } = await setup();
  const original = Date.now;
  let clock = original();
  try {
    await DB.prepare("update chat_sessions set expires_at=?")
      .bind(clock + 1000)
      .run();
    Date.now = () => clock;
    const request = req("", body(), { "x-chat-token": token });
    let sent = false;
    Object.defineProperty(request, "body", {
      value: {
        getReader() {
          return {
            async read() {
              if (sent) return { done: true };
              sent = true;
              clock += 1500;
              return {
                done: false,
                value: new TextEncoder().encode(JSON.stringify(body())),
              };
            },
            releaseLock() {},
          };
        },
      },
    });
    let calls = 0;
    const r = await handleChat(request, env, async () => {
      calls++;
      return answer();
    });
    assert.equal(r.status, 403);
    assert.equal(calls, 0);
    assert.equal(
      (await DB.prepare("select count(*) as n from chat_requests").first()).n,
      0,
    );
  } finally {
    Date.now = original;
    DB.close();
  }
});
test("all suggested questions retrieve their reviewed anchor notes even when keywords are vague", async () => {
  const { questions } = await import("../src/content/knowledge/composer.ts");
  const expected = {
    aquarium: ["carnival", "score", "layers"],
    layers: ["layers"],
    composer: ["person"],
    paris: ["paris"],
    carnival: ["carnival"],
    scene: ["scene"],
    glass: ["score", "recording"],
    variation: ["theory", "making"],
    fauré: ["paris"],
    whole: ["carnival"],
  };
  for (const q of questions) {
    const notes = retrieveKnowledge(q.prompt, q.id).map((n) => n.id);
    for (const id of expected[q.id])
      assert.ok(notes.includes(id), q.id + " missing " + id);
  }
});
test("an editorial citation carries inspectable source notes, not only a home link", async () => {
  const { DB, env, token } = await setup();
  try {
    const r = await handleChat(
      req(
        "",
        { ...body(), question: "Did you imagine these fish?" },
        { "x-chat-token": token },
      ),
      env,
      async () =>
        Response.json({
          choices: [
            {
              finish_reason: "stop",
              message: {
                content: JSON.stringify({
                  answer: "MaestroMate created these visuals.",
                  kind: "listening",
                  sourceIds: ["editorial"],
                }),
              },
            },
          ],
        }),
    );
    const reply = await r.json();
    assert.ok(
      reply.editorialNotes?.some((s) =>
        s.includes("contemporary underwater visuals"),
      ),
    );
  } finally {
    DB.close();
  }
});
test('provider failure diagnostics contain only stage and HTTP status, never credentials or response text',async()=>{const {DB,env,token}=await setup();const old=console.warn,logs=[];console.warn=(...args)=>logs.push(args);try{await handleChat(req('',body(),{'x-chat-token':token}),env,async()=>new Response('private vendor body test-key',{status:401}));assert.ok(logs.some(x=>JSON.stringify(x).includes('401')));assert.ok(!JSON.stringify(logs).includes('test-key'));assert.ok(!JSON.stringify(logs).includes('private vendor'));}finally{console.warn=old;DB.close()}});
test('network diagnostics redact the credential before recording a runtime exception',async()=>{const {DB,env,token}=await setup();const old=console.warn,logs=[];console.warn=(...v)=>logs.push(v);try{await handleChat(req('',body(),{'x-chat-token':token}),env,async()=>{throw new TypeError('Network failure for '+env.DASHSCOPE_API_KEY)});assert.ok(JSON.stringify(logs).includes('Network failure'));assert.ok(!JSON.stringify(logs).includes(env.DASHSCOPE_API_KEY));}finally{console.warn=old;DB.close()}});
test('edge-compatible manual redirect mode refuses redirects without forwarding the key',async()=>{const {DB,env,token}=await setup();try{let calls=0;const r=await handleChat(req('',body(),{'x-chat-token':token}),env,async(url,init)=>{calls++;assert.equal(init.redirect,'manual');return new Response(null,{status:302,headers:{location:'https://untrusted.test/'}})});assert.equal(r.status,502);assert.equal(calls,1);}finally{DB.close()}});
