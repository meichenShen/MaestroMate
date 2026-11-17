import { useEffect, useRef } from "react";
import {
  Headphones,
  MessagesSquare,
  Dices,
  BookOpen,
  Bird,
  Music2,
} from "lucide-react";
export type DrawnKind =
  | "listen"
  | "chat"
  | "play"
  | "program"
  | "swan"
  | "music";
const icons = {
  listen: Headphones,
  chat: MessagesSquare,
  play: Dices,
  program: BookOpen,
  swan: Bird,
  music: Music2,
};
// SVG geometry is Lucide (ISC). Stroke-by-stroke reveal follows the measured
// path technique used by Smooothy Draw and Vivus, implemented with native WAAPI.
export function DrawnIcon({
  kind,
  className = "",
}: {
  kind: DrawnKind;
  className?: string;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const Icon = icons[kind];
  useEffect(() => {
    const element = host.current!;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    const geometry = [
      ...element.querySelectorAll<SVGGeometryElement>(
        "path,line,circle,rect,polyline,polygon,ellipse",
      ),
    ];
    const clear = () => {
      animations.forEach((a) => a.cancel());
      animations = [];
      geometry.forEach((p) => {
        p.style.strokeDasharray = "none";
        p.style.strokeDashoffset = "0";
      });
    };
    const draw = () => {
      clear();
      if (media.matches) return;
      geometry.forEach((path, index) => {
        let length = 0;
        try {
          length = path.getTotalLength();
        } catch {
          return;
        }
        path.style.strokeDasharray = String(length);
        animations.push(
          path.animate(
            [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
            {
              duration: 850,
              delay: index * 110,
              easing: "cubic-bezier(.2,.6,.25,1)",
              fill: "both",
            },
          ),
        );
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) draw();
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    const change = () => {
      if (media.matches) clear();
      else draw();
    };
    media.addEventListener("change", change);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", change);
      clear();
    };
  }, [kind]);
  return (
    <span
      ref={host}
      className={"drawn-icon " + className}
      data-drawn-icon={kind}
      aria-hidden="true"
    >
      <Icon size={220} strokeWidth={1.25} />
    </span>
  );
}
