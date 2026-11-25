import { useCallback, useEffect, useRef, useState } from "react";
import { questions } from "../../content/aquarium";
import {
  type ChatConfig,
  type ChatReply,
  chatModels,
} from "../../content/knowledge/chat-contract";
import {
  requestChat,
  historyForRequest,
  ChatRequestError,
  type ChatSession,
} from "./chat-client";
export interface ChatTurn {
  id: number;
  questionId?: string;
  question: string;
  replied: boolean;
  mode: "prepared" | "ai";
  reply?: ChatReply;
  error?: string;
}
export function useComposerChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]),
    [pending, setPending] = useState(false),
    [config, setConfig] = useState<ChatConfig | null>(null),
    [aiEnabled, setAiEnabled] = useState(false),
    [model, setModel] = useState<string>(chatModels[0].id);
  const busy = useRef(false),
    nextId = useRef(1),
    controller = useRef<AbortController | undefined>(undefined),
    session = useRef<ChatSession | undefined>(undefined),
    items = useRef(turns);
  items.current = turns;
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/chat/config", { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (v && typeof v.enabled === "boolean" && Array.isArray(v.models))
          setConfig(v);
        else setConfig({ enabled: false, models: [] });
      })
      .catch(() => {
        if (!c.signal.aborted) setConfig({ enabled: false, models: [] });
      });
    return () => {
      c.abort();
      controller.current?.abort();
    };
  }, []);
  const run = useCallback(
    async (question: string, questionId?: string, retryId?: number) => {
      if (busy.current || !question.trim() || question.length > 600) return;
      const prepared = questionId
        ? questions.find((q) => q.id === questionId)
        : undefined;
      if (!aiEnabled && !prepared) return;
      busy.current = true;
      setPending(true);
      const c = new AbortController();
      controller.current = c;
      const id = retryId ?? nextId.current++;
      const mode = aiEnabled ? "ai" : "prepared";
      const turn: ChatTurn = {
        id,
        question,
        questionId,
        replied: !aiEnabled,
        mode,
      };
      const retryIndex =
        retryId === undefined
          ? -1
          : items.current.findIndex((t) => t.id === retryId);
      const previous =
        retryIndex < 0 ? items.current : items.current.slice(0, retryIndex);
      setTurns((list) =>
        retryIndex < 0
          ? [...list, turn]
          : list.map((t) => (t.id === retryId ? turn : t)),
      );
      if (!aiEnabled) {
        busy.current = false;
        setPending(false);
        return;
      }
      const timer = setTimeout(() => c.abort(), 25000);
      try {
        const result = await requestChat({
          question,
          model,
          history: historyForRequest(previous),
          session: session.current,
          onSession: (s) => {
            if (controller.current === c) session.current = s;
          },
          signal: c.signal,
        });
        if (c.signal.aborted || controller.current !== c) return;
        session.current = result.session;
        setTurns((list) =>
          list.map((t) =>
            t.id === id ? { ...t, reply: result.reply, replied: true } : t,
          ),
        );
      } catch (e) {
        if (controller.current !== c) return;
        const error = c.signal.aborted
          ? "timeout"
          : e instanceof ChatRequestError
            ? e.code
            : "unavailable";
        if (error === "invalid_session") session.current = undefined;
        setTurns((list) =>
          list.map((t) => (t.id === id ? { ...t, error } : t)),
        );
      } finally {
        clearTimeout(timer);
        if (controller.current === c) {
          busy.current = false;
          setPending(false);
        }
      }
    },
    [aiEnabled, model],
  );
  const ask = useCallback(
    (questionId: string) => {
      const q = questions.find((q) => q.id === questionId);
      if (q) void run(q.prompt, q.id);
    },
    [run],
  );
  const askText = useCallback(
    (text: string) => {
      void run(text);
    },
    [run],
  );
  const retry = useCallback(
    (id: number) => {
      const t = items.current.find((x) => x.id === id);
      if (aiEnabled && t?.error) void run(t.question, t.questionId, id);
    },
    [run, aiEnabled],
  );
  const reset = useCallback(() => {
    controller.current?.abort();
    controller.current = undefined;
    busy.current = false;
    setTurns([]);
    setPending(false);
  }, []);
  const setAI = useCallback(
    (value: boolean) => {
      if (!busy.current) setAiEnabled(value && !!config?.enabled);
    },
    [config],
  );
  const readPrepared = useCallback((id: number) => {
    if (!busy.current)
      setTurns((list) =>
        list.map((t) =>
          t.id === id && t.questionId
            ? {
                ...t,
                mode: "prepared",
                reply: undefined,
                error: undefined,
                replied: true,
              }
            : t,
        ),
      );
  }, []);
  return {
    turns,
    pending,
    ask,
    askText,
    retry,
    readPrepared,
    reset,
    config,
    aiEnabled,
    setAI,
    model,
    setModel,
  };
}
