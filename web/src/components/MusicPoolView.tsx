import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { PoolScene } from "../rendering/music-pool";
import type { PoolLayout } from "../features/water/layout";
export interface PoolViewHandle {
  pulse(note: number): void;
  splash(x: number, y: number): void;
}
export const MusicPoolView = forwardRef<
  PoolViewHandle,
  { motion: boolean; active: boolean; layout: PoolLayout }
>(function MusicPoolView({ motion, active, layout }, ref) {
  const host = useRef<HTMLDivElement>(null),
    scene = useRef<PoolScene | null>(null);
  const latest = useRef({ motion, active });
  latest.current = { motion, active };
  const [status, setStatus] = useState("loading");
  useImperativeHandle(
    ref,
    () => ({
      pulse: (n) => scene.current?.pulse(n),
      splash: (x, y) => scene.current?.splash(x, y),
    }),
    [],
  );
  useEffect(() => {
    let disposed = false;
    import("../rendering/music-pool")
      .then(({ createMusicPool }) => {
        if (disposed) return;
        try {
          scene.current = createMusicPool(host.current!, () => {
            if (!disposed) setStatus("fallback");
          });
          scene.current.update(latest.current.motion, latest.current.active);
          setStatus("ready");
        } catch {
          if (!disposed) setStatus("fallback");
        }
      })
      .catch(() => {
        if (!disposed) setStatus("fallback");
      });
    return () => {
      disposed = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);
  useEffect(() => scene.current?.update(motion, active), [motion, active]);
  return (
    <div className="pool-art" data-pool-render={status} aria-hidden="true">
      {status !== "ready" && (
        <svg
          className="pool-fallback"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="pool-floor">
              <stop stopColor="#30334e" />
              <stop offset=".75" stopColor="#20243c" />
              <stop offset="1" stopColor="#0b0b10" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse
            cx="500"
            cy="500"
            rx={layout.surface.width * 5}
            ry={layout.surface.height * 5}
            fill="url(#pool-floor)"
          />
        </svg>
      )}
      <div
        className="pool-canvas"
        ref={host}
        style={status === "fallback" ? { visibility: "hidden" } : undefined}
      />
    </div>
  );
});
