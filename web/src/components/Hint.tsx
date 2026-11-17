import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";
/** Hover, focus and tap share one description; the trigger never moves. */
export function Hint({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="hint"
      data-open={open}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="hint-trigger"
        aria-label={label}
        aria-describedby={id}
        onClick={() => setOpen((v) => !v)}
      >
        <Info size={19} />
      </button>
      <span className="hint-popup" id={id} role="tooltip">
        {children}
      </span>
    </span>
  );
}
