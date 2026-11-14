import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { PadPosition, PoolScene } from "../rendering/music-pool";
export interface PoolViewHandle {
  pulse(note: number): void;
  splash(x: number, y: number): void;
}
export const MusicPoolView = forwardRef<
  PoolViewHandle,
  { motion: boolean; active: boolean; onPositions: (p: PadPosition[]) => void }
>(function MusicPoolView({ motion, active, onPositions }, ref) {
  const host = useRef<HTMLDivElement>(null),
    scene = useRef<PoolScene | null>(null);
  const latest = useRef({ motion, active, onPositions });
  latest.current = { motion, active, onPositions };
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
          scene.current = createMusicPool(
            host.current!,
            (p) => latest.current.onPositions(p),
            () => {
              if (!disposed) setStatus("fallback");
            },
          );
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
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="pool-floor">
              <stop stopColor="#30334e" />
              <stop offset="1" stopColor="#161522" />
            </radialGradient>
          </defs>
          <ellipse
            cx="500"
            cy="280"
            rx="450"
            ry="170"
            fill="url(#pool-floor)"
            stroke="#a593e0"
            strokeOpacity=".3"
          />
          <ellipse
            cx="500"
            cy="265"
            rx="330"
            ry="110"
            fill="none"
            stroke="#45d9fd"
            strokeOpacity=".18"
          />
          <ellipse
            cx="500"
            cy="265"
            rx="180"
            ry="60"
            fill="none"
            stroke="#a593e0"
            strokeOpacity=".22"
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
