import { useEffect, useRef, useState } from "react";
import type { AquariumController, RenderState } from "../rendering/aquarium";
export function AquariumView({
  time = 0,
  rate = 1,
  playing = false,
  motion = true,
  preview = false,
}: {
  time?: number;
  rate?: number;
  playing?: boolean;
  motion?: boolean;
  preview?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    controller = useRef<AquariumController | null>(null),
    latest = useRef<RenderState>({ time, rate, playing, motion, preview });
  const [status, setStatus] = useState("loading");
  latest.current = { time, rate, playing, motion, preview };
  useEffect(() => {
    let disposed = false;
    const element = host.current!;
    import("../rendering/aquarium")
      .then(({ createAquarium }) => {
        if (disposed) return;
        try {
          controller.current = createAquarium(
            element,
            latest.current,
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
  useEffect(
    () => controller.current?.update(latest.current),
    [time, rate, playing, motion, preview],
  );
  return (
    <div
      className="aquarium-art"
      data-render-status={status}
      role="img"
      aria-label="A school of textured three-dimensional fish in deep water"
    >
      <img
        className="aquarium-environment"
        src="/images/aquarium.webp"
        alt=""
      />
      {status !== "ready" && (
        <img
          className="aquarium-poster"
          src="/images/aquarium-poster.webp"
          alt="Underwater listening scene"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      )}
      <div className="aquarium-canvas" ref={host} />
      {status === "loading" && (
        <span className="scene-loading">Preparing the 3D scene…</span>
      )}
    </div>
  );
}
