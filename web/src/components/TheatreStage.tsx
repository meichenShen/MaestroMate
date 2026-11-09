import { useEffect, useRef, useState } from "react";
import { Piano } from "lucide-react";
import type { TheatreController } from "../rendering/theatre";

/** The theatre is authored geometry; no picture or pre-rendered scene is used. */
export function TheatreStage({ motion = true }: { motion?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<TheatreController | null>(null);
  const latestMotion = useRef(motion);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  latestMotion.current = motion;

  useEffect(() => {
    let disposed = false;
    setStatus("loading");
    import("../rendering/theatre")
      .then(({ createTheatre }) => {
        if (disposed || !host.current) return;
        try {
          controller.current = createTheatre(
            host.current,
            latestMotion.current,
            () => {
              if (!disposed) setStatus("ready");
            },
            () => {
              if (!disposed) setStatus("fallback");
            },
          );
        } catch {
          if (!disposed) setStatus("fallback");
        }
      })
      .catch(() => {
        if (!disposed) setStatus("fallback");
      });
    return () => {
      disposed = true;
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => controller.current?.setMotion(motion), [motion]);

  return (
    <div
      className="theatre-stage"
      data-render-status={status}
      role="img"
      aria-label="A sculptural concert stage with a grand piano, pastel acoustic shells and curved ivory steps"
    >
      <div
        ref={host}
        className="theatre-stage-canvas"
        style={{ position: "absolute", inset: 0 }}
      />
      {status !== "ready" && (
        <div
          className="theatre-stage-fallback"
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "9%",
            top: "30%",
            width: "34%",
            aspectRatio: "1",
            display: "grid",
            placeItems: "center",
            color: "#C89EC4",
            background: "#151416",
            borderRadius: "48% 48% 22% 22%",
          }}
        >
          <Piano size="42%" strokeWidth={0.9} />
        </div>
      )}
    </div>
  );
}
