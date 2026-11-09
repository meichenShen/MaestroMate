import { useEffect, useRef, useState } from "react";
import { Arrow } from "./Arrow";
const steps = [
  {
    number: "01",
    title: "Find your way in.",
    text: "Start with a work for a guided journey, pick an experience, or simply look around. There is no wrong entrance.",
  },
  {
    number: "02",
    title: "Take your time.",
    text: "Open the programme and scroll down to browse. Preview a work, then enter when something catches your ear.",
  },
  {
    number: "03",
    title: "Make it your own.",
    text: "Listen, meet the composer, or follow a sound clue. Pause, replay and switch experiences whenever you like. Open this guide again from the top navigation.",
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
