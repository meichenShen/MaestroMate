import { activities, type ActivityId } from "../content/aquarium";
export function ActivityNav({
  active,
  onChange,
}: {
  active: ActivityId;
  onChange: (id: ActivityId) => void;
}) {
  return (
    <nav className="activity-nav" aria-label="Listening experiences">
      {activities.map((item, index) => (
        <button
          key={item.id}
          aria-label={item.title}
          aria-current={active === item.id ? "page" : undefined}
          onClick={() => onChange(item.id)}
        >
          <span className="micro">0{index + 1}</span>
          {item.title}
        </button>
      ))}
    </nav>
  );
}
