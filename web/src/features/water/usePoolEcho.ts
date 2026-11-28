import { useEffect, useRef, useState, type RefObject } from "react";
import type { PoolAudio } from "./audio";
import { echoRounds, advanceEcho } from "./echo-model";
export function usePoolEcho(
  audio: RefObject<PoolAudio | null>,
  flash: (n: number) => void,
) {
  const [phase, setPhase] = useState<
      "free" | "watch" | "answer" | "won" | "idle"
    >("free"),
    [round, setRound] = useState(0),
    [position, setPosition] = useState(0),
    [message, setMessage] = useState("");
  const alive = useRef(false),
    ticket = useRef(0),
    latest = useRef({ phase, round, position });
  latest.current = { phase, round, position };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      ticket.current++;
    };
  }, []);
  const cancel = () => {
    ticket.current++;
    if (latest.current.phase !== "free") {
      setPhase("idle");
      setPosition(0);
      setMessage("Ready when you are.");
    }
  };
  const start = async (nextRound = latest.current.round) => {
    audio.current?.stop();
    const id = ++ticket.current;
    const pattern = echoRounds[nextRound];
    setRound(nextRound);
    setPosition(0);
    setPhase("watch");
    setMessage("Watch the fish…");
    try {
      const started = await audio.current?.play(
        [...pattern, ...Array(8 - pattern.length).fill(null)],
        (step) => {
          if (alive.current && ticket.current === id && step < pattern.length)
            flash(pattern[step]);
        },
        () => {
          if (alive.current && ticket.current === id) {
            setPhase("answer");
            setMessage("Your turn. Follow the same lights.");
          }
        },
        pattern.length,
      );
      if (alive.current && ticket.current === id && !started) {
        setPhase("idle");
        setMessage("Tap the fish to try again.");
      }
    } catch {
      if (alive.current && ticket.current === id) {
        setPhase("idle");
        setMessage("Sound did not start. Try again.");
      }
    }
  };
  const tap = (note: number) => {
    const s = latest.current;
    if (s.phase !== "answer") return;
    const id = ticket.current;
    flash(note);
    void audio.current?.note(note).catch(() => {
      if (alive.current && ticket.current === id)
        setMessage("Sound is quiet. Follow the lights.");
    });
    const next = advanceEcho(echoRounds[s.round], s.position, note);
    if (next.correct) {
      setPosition(next.position);
      setMessage(
        next.complete ? "You followed the whole trail!" : "Yes! Keep going.",
      );
      if (next.complete) setPhase("won");
    } else {
      setMessage("Try this light. No rush.");
      flash(echoRounds[s.round][s.position]);
    }
  };
  return {
    phase,
    round,
    position,
    message,
    total: echoRounds[round].length,
    active: phase !== "free",
    start,
    tap,
    cancel,
    next: () => start((latest.current.round + 1) % echoRounds.length),
    free() {
      ticket.current++;
      audio.current?.stop();
      setPhase("free");
      setPosition(0);
      setMessage("");
    },
  };
}
