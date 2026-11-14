import { useEffect, useRef, useState } from "react";
import { Arrow } from "./Arrow";
const steps = [
  {
    number: "01",
    title: "Find your way in.",
    text: "Take a full Program around one piece, choose a room — Listen, Chat or Play — or just have a look around.",
  },
  {
    number: "02",
    title: "Take your time.",
    text: "On the home page, scroll and let each scene settle. Inside a room, take your time. In Chat, choose a question and your conversation will unfold.",
  },
  {
    number: "03",
    title: "Make it your own.",
    text: "The rooms work on their own. In Play, follow the sound clues or make a melody in Music Pool. A Program connects listening, a chat and Sound Detective. Leave or come back whenever you like.",
  },
];
export function Guide({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);
  const dismiss = () => ref.current?.close();
  return (
    <dialog
      className="guide"
      ref={ref}
      aria-labelledby="guide-title"
      onClose={onClose}
      data-lenis-prevent
    >
      <button
        className="guide-close"
        aria-label="Close guide"
        onClick={dismiss}
      >
        ×
      </button>
      <p className="micro">A small introduction / {steps[step].number}—03</p>
      <h2 id="guide-title">{steps[step].title}</h2>
      <p>{steps[step].text}</p>
      <div className="guide-actions">
        <button className="text-button" onClick={dismiss}>
          Skip the tour
        </button>
        <button
          className="solid-button"
          onClick={() => (step < 2 ? setStep(step + 1) : dismiss())}
        >
          {step < 2 ? "Next" : "Let's begin"}
          <Arrow />
        </button>
      </div>
    </dialog>
  );
}
