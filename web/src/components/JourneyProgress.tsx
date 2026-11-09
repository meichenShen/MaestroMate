import { Check } from "lucide-react";
import type { ActivityId } from "../content/aquarium";
import { activityHash, navigate } from "../navigation/routes";
const steps = [
  { id: "theater" as const, label: "Listen" },
  { id: "conversation" as const, label: "Chat" },
  { id: "detective" as const, label: "Play" },
];
export function JourneyProgress({
  active,
  visited,
}: {
  active: ActivityId;
  visited: ActivityId[];
}) {
  return (
    <nav
      className="journey-progress"
      aria-label="Your Program"
      data-journey-progress
    >
      <p>Your Aquarium Program</p>
      <div>
        {steps.map((step, index) => (
          <button
            key={step.id}
            aria-current={step.id === active ? "step" : undefined}
            onClick={() => navigate(activityHash(step.id, true))}
          >
            <span>
              {visited.includes(step.id) && step.id !== active ? (
                <Check size={16} />
              ) : (
                index + 1
              )}
            </span>
            {step.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
