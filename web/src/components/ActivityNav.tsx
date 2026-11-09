import {
  Clapperboard,
  MessageCircle,
  Search,
  ArrowRight,
  Compass,
} from "lucide-react";
import { activities, type ActivityId } from "../content/aquarium";
const icons = {
  theater: Clapperboard,
  conversation: MessageCircle,
  detective: Search,
};
export function ActivityNav({
  active,
  onChange,
}: {
  active: ActivityId;
  onChange: (id: ActivityId) => void;
}) {
  return (
    <nav className="activity-nav" aria-label="探索方式">
      <p className="section-overline">CHOOSE YOUR WAY</p>
      <h2>你想怎样开始？</h2>
      <div className="activity-options">
        {activities.map((activity) => {
          const Icon = icons[activity.id];
          return (
            <button
              key={activity.id}
              className={`activity-option ${active === activity.id ? "is-active" : ""}`}
              aria-current={active === activity.id ? "page" : undefined}
              onClick={() => onChange(activity.id)}
              aria-controls="activity-panel"
            >
              <span className="activity-icon">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <span className="activity-option-copy">
                <small>{activity.number}</small>
                <strong>{activity.title}</strong>
                <span>{activity.subtitle}</span>
              </span>
              <ArrowRight className="nav-arrow" size={16} />
            </button>
          );
        })}
      </div>
      <div className="nav-footnote">
        <Compass size={23} strokeWidth={1.4} />
        <p>
          没有规定的顺序。
          <br />
          跟着好奇心，自由探索。
        </p>
      </div>
    </nav>
  );
}
