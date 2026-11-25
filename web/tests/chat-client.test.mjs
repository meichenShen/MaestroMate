import { test } from "node:test";
import assert from "node:assert/strict";
import {
  requestChat,
  ChatRequestError,
  historyForRequest,
} from "../src/features/conversation/chat-client.ts";
const reply = {
  mode: "ai",
  kind: "fact",
  answer: "Aquarium is movement seven.",
  sourceIds: ["score"],
};
test("client obtains a capability then sends only allowed bounded conversation", async () => {
  const calls = [];
  const r = await requestChat(
    {
      question: "Why Aquarium?",
      model: "qwen3.7-plus-2026-05-26",
      history: [],
      signal: new AbortController().signal,
    },
    async (url, init) => {
      calls.push({ url, init });
      return Response.json(
        url.endsWith("session")
          ? { token: "session", expiresAt: Date.now() + 10000 }
          : reply,
      );
    },
  );
  assert.deepEqual(r.reply, reply);
  assert.equal(calls.length, 2);
  assert.equal(JSON.parse(calls[1].init.body).question, "Why Aquarium?");
  assert.equal(calls[1].init.headers["x-chat-token"], "session");
});
test("error types keep secrets out and permit explicit session renewal", async () => {
  await assert.rejects(
    () =>
      requestChat(
        {
          question: "Why?",
          model: "qwen3.7-plus-2026-05-26",
          history: [],
          signal: new AbortController().signal,
        },
        async () =>
          Response.json({ error: "sensitive vendor body" }, { status: 429 }),
      ),
    (e) =>
      e instanceof ChatRequestError &&
      e.code === "rate_limited" &&
      !e.message.includes("sensitive"),
  );
});
test("history excludes pending, failed and prepared turns and stays within server limits", () => {
  const turns = Array.from({ length: 20 }, (_, i) => ({
    question: "q".repeat(600),
    reply: { ...reply, answer: "a".repeat(1700) },
    replied: true,
    mode: i % 2 ? "ai" : "prepared",
  }));
  const h = historyForRequest(turns);
  assert.ok(h.length <= 6);
  assert.ok(h.reduce((n, x) => n + x.content.length, 0) <= 4800);
  assert.equal(h.at(-1).role, "assistant");
});
test("a minted session remains available after a provider failure, avoiding fresh sessions on retries", async () => {
  let minted;
  await assert.rejects(() =>
    requestChat(
      {
        question: "Why?",
        model: "qwen3.7-plus-2026-05-26",
        history: [],
        signal: new AbortController().signal,
        onSession: (s) => {
          minted = s;
        },
      },
      async (url) =>
        url.endsWith("/session")
          ? Response.json({
              token: "kept-token",
              expiresAt: Date.now() + 10000,
            })
          : Response.json({ error: "answer_unavailable" }, { status: 502 }),
    ),
  );
  assert.equal(minted?.token, "kept-token");
});
test("non-ASCII conversation stays within the byte-limited request envelope", () => {
  const h = historyForRequest(
    Array.from({ length: 3 }, () => ({
      question: "音".repeat(600),
      reply: { answer: "魚".repeat(900) },
      mode: "ai",
      replied: true,
    })),
  );
  assert.ok(new TextEncoder().encode(JSON.stringify(h)).length <= 4500);
});
test("local privacy guidance is never replayed into AI history", () => {
  assert.deepEqual(
    historyForRequest([
      {
        question: "email kid@example.test",
        replied: true,
        mode: "ai",
        reply: { answer: "Keep private details out.", mode: "guidance" },
      },
    ]),
    [],
  );
});
