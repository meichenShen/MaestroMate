import type {
  ChatHistoryItem,
  ChatReply,
} from "../../content/knowledge/chat-contract.ts";
export class ChatRequestError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}
export interface ChatSession {
  token: string;
  expiresAt: number;
}
export async function requestChat(
  input: {
    question: string;
    model: string;
    language?: "en"|"zh";
    questionId?: string;
    history: ChatHistoryItem[];
    signal: AbortSignal;
    session?: ChatSession;
    onSession?: (session: ChatSession) => void;
  },
  fetcher: typeof fetch = fetch,
): Promise<{ reply: ChatReply; session: ChatSession }> {
  const headers = {
    "content-type": "application/json",
    "x-maestromate-chat": "1",
  };
  async function checked(response: Response) {
    if (!response.ok)
      throw new ChatRequestError(
        response.status === 429
          ? "rate_limited"
          : response.status === 403
            ? "invalid_session"
            : response.status === 503
              ? "unavailable"
              : "answer_unavailable",
      );
    return response.json();
  }
  let session = input.session;
  if (!session || session.expiresAt <= Date.now())
    session = await checked(
      await fetcher("/api/chat/session", {
        method: "POST",
        headers,
        body: "{}",
        signal: input.signal,
      }),
    );
  input.onSession?.(session!);
  const reply = await checked(
    await fetcher("/api/chat", {
      method: "POST",
      headers: { ...headers, "x-chat-token": session!.token },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        question: input.question,
        model: input.model,
        language: input.language,
        questionId: input.questionId,
        history: input.history,
      }),
      signal: input.signal,
    }),
  );
  if (
    typeof reply.answer !== "string" ||
    !Array.isArray(reply.sourceIds) ||
    !["ai", "guidance"].includes(reply.mode)
  )
    throw new ChatRequestError("answer_unavailable");
  return { reply, session: session! };
}
export function historyForRequest(
  turns: {
    question: string;
    reply?: { answer: string; mode?: string };
    mode: string;
    replied: boolean;
  }[],
): ChatHistoryItem[] {
  const pairs = turns
    .filter(
      (t) =>
        t.mode === "ai" && t.replied && t.reply && t.reply.mode !== "guidance",
    )
    .slice(-3)
    .map((t) => [
      { role: "user" as const, content: t.question.slice(0, 600) },
      { role: "assistant" as const, content: t.reply!.answer.slice(0, 900) },
    ]);
  while (new TextEncoder().encode(JSON.stringify(pairs.flat())).length > 4500)
    pairs.shift();
  return pairs.flat();
}
