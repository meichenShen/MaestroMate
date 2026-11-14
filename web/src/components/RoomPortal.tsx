import { ArrowUpRight } from "lucide-react";
import { DrawnIcon, type DrawnKind } from "./DrawnIcon";
import { useSpringPointer } from "../hooks/useSpringPointer";
import { ElasticField } from "./ElasticField";
import type { CSSProperties } from "react";
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
  const fieldId = "portal-bulge-" + kind;
  return (
    <a
      className={`portal-node ${kind}-node`}
      href={href}
      aria-label={label}
      aria-describedby={`${kind}-hint`}
      data-enter={direction}
      style={{ "--portal-filter": "url(#" + fieldId + ")" } as CSSProperties}
      {...spring}
    >
      <span className="portal-art">
        <ElasticField id={fieldId} />
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
