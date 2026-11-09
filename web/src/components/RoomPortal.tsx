import type { PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { DrawnIcon, type DrawnKind } from "./DrawnIcon";
export function RoomPortal({
  kind,
  title,
  hint,
  href,
  label,
  direction,
}: {
  kind: DrawnKind;
  title: string;
  hint: string;
  href: string;
  label: string;
  direction: string;
}) {
  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    if (
      event.pointerType !== "mouse" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const r = event.currentTarget.getBoundingClientRect(),
      x = (event.clientX - r.left) / r.width - 0.5,
      y = (event.clientY - r.top) / r.height - 0.5;
    event.currentTarget.style.setProperty("--px", `${x * 24}px`);
    event.currentTarget.style.setProperty("--py", `${y * 18}px`);
    event.currentTarget.style.setProperty("--tilt", `${x * 9}deg`);
  };
  return (
    <a
      className={`portal-node ${kind}-node`}
      href={href}
      aria-label={label}
      aria-describedby={`${kind}-hint`}
      data-enter={direction}
      onPointerMove={move}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty("--px", "0px");
        e.currentTarget.style.setProperty("--py", "0px");
        e.currentTarget.style.setProperty("--tilt", "0deg");
      }}
    >
      <span className="portal-art">
        <DrawnIcon kind={kind} />
      </span>
      <strong>
        {title}
        <span className="portal-arrow">
          <ArrowUpRight size={24} />
        </span>
      </strong>
      <span className="portal-hint" id={`${kind}-hint`}>
        {hint}
      </span>
    </a>
  );
}
