import { useCallback, useEffect, useRef, useState } from "react";
import { questions } from "../../content/aquarium";
export interface ChatTurn {
  id: number;
  questionId: string;
  replied: boolean;
}
export function useComposerChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]),
    [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    busy = useRef(false),
    nextId = useRef(1);
  const ask = useCallback((questionId: string) => {
    if (busy.current || !questions.some((q) => q.id === questionId)) return;
    busy.current = true;
    setPending(true);
    const id = nextId.current++;
    setTurns((items) => [...items, { id, questionId, replied: false }]);
    timer.current = setTimeout(
      () => {
        setTurns((items) =>
          items.map((turn) =>
            turn.id === id ? { ...turn, replied: true } : turn,
          ),
        );
        busy.current = false;
        setPending(false);
      },
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
    );
  }, []);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );
  const reset = useCallback(() => {
    clearTimeout(timer.current);
    busy.current = false;
    nextId.current = 1;
    setTurns([]);
    setPending(false);
  }, []);
  return { turns, pending, ask, reset };
}
