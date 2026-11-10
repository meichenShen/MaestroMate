import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CaseGlyph } from "./CaseGlyph";

/** A native horizontal rail: three cards fit desktop; extra cases extend it. */
export function CaseNavigator({
  items,
  active,
  revealed,
  onSelect,
}: {
  items: { id: string; title: string }[];
  active: number;
  revealed: Record<string, boolean>;
  onSelect: (index: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({
    overflow: false,
    start: true,
    end: false,
  });
  const measure = () => {
    const e = track.current;
    if (e)
      setEdges({
        overflow: e.scrollWidth > e.clientWidth + 2,
        start: e.scrollLeft < 2,
        end: e.scrollLeft + e.clientWidth >= e.scrollWidth - 2,
      });
  };
  useLayoutEffect(() => {
    const e = track.current;
    if (!e) return;
    const observer = new ResizeObserver(measure);
    observer.observe(e);
    measure();
    return () => observer.disconnect();
  }, [items.length]);
  useEffect(() => {
    const e = track.current,
      item = e?.children[active] as HTMLElement | undefined;
    if (e && item)
      e.scrollTo({
        left: item.offsetLeft - (e.clientWidth - item.offsetWidth) / 2,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }, [active, items.length]);
  const shift = (direction: number) => {
    const e = track.current;
    e?.scrollBy({
      left: direction * e.clientWidth * 0.8,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <div className={`case-rail ${edges.overflow ? "has-overflow" : ""}`}>
      <div
        className="case-overview"
        ref={track}
        onScroll={measure}
        aria-label="Sound cases"
        data-lenis-prevent
      >
        {items.map((item, i) => (
          <article
            key={item.id}
            aria-labelledby={`overview-${item.id}`}
            className={`case-preview case-${(i % 3) + 1}`}
          >
            <button
              aria-label={`Open case ${i + 1}`}
              aria-pressed={active === i}
              aria-controls="current-sound-case"
              onClick={() => onSelect(i)}
            >
              <span className="case-label">
                {String(i + 1).padStart(2, "0")}
              </span>
              <CaseGlyph kind={i % 3} />
              <h2 id={`overview-${item.id}`}>{item.title}</h2>
              <span
                className="case-done"
                aria-label={
                  revealed[item.id] ? "Discovered" : "Not yet discovered"
                }
              >
                {revealed[item.id] ? "✓" : "↗"}
              </span>
            </button>
          </article>
        ))}
      </div>
      {edges.overflow && (
        <>
          <button
            className="rail-arrow rail-back"
            aria-label="Earlier cases"
            disabled={edges.start}
            onClick={() => shift(-1)}
          >
            <ChevronLeft size={19} />
          </button>
          <button
            className="rail-arrow rail-forward"
            aria-label="More cases"
            disabled={edges.end}
            onClick={() => shift(1)}
          >
            <ChevronRight size={19} />
          </button>
        </>
      )}
    </div>
  );
}
