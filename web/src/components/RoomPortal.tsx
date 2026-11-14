import { ArrowUpRight } from "lucide-react";
import { DrawnIcon, type DrawnKind } from "./DrawnIcon";
import { useSpringPointer } from "../hooks/useSpringPointer";
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
  const spring = useSpringPointer<HTMLAnchorElement>();
  return (
    <a
      className={`portal-node ${kind}-node`}
      href={href}
      aria-label={label}
      aria-describedby={`${kind}-hint`}
      data-enter={direction}
      {...spring}
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
