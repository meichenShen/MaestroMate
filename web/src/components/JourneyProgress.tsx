import {t,useLocale} from "../i18n/locale";
import { Check } from "lucide-react";
import type { ActivityId } from "../content/aquarium";
import { activityHash, navigate } from "../navigation/routes";
const steps = [
    { id: "theater" as const, label: "Listen" },
    { id: "conversation" as const, label: "Chat" },
    { id: "detective" as const, label: "Play" },
];
export function JourneyProgress({ active, visited, }: {
    active: ActivityId;
    visited: ActivityId[];
}) {
    useLocale();
    return (<nav className="journey-progress" aria-label={t("Your Program")} data-journey-progress>
      <p>{t("Your Aquarium Program")}</p>
      <div>
        {t(steps.map((step, index) => (<button key={step.id} aria-current={step.id === active ? "step" : undefined} onClick={() => navigate(activityHash(step.id, true))}>
            <span>
              {t(visited.includes(step.id) && step.id !== active ? (<Check size={16}/>) : (index + 1))}
            </span>
            {t(step.label)}
          </button>)))}
      </div>
      <a className="solid-button journey-shortcut" href={active === "theater"
            ? activityHash("conversation", true)
            : active === "conversation"
                ? activityHash("detective", true)
                : "#program/aquarium/done"}>
        {t(active === "theater"
            ? "Next: Chat"
            : active === "conversation"
                ? "Next: Play"
                : "Finish your visit")}{t(" ")}{t("\u2197")}</a>
    </nav>);
}
