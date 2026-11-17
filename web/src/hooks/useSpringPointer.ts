import { useEffect, useRef, type PointerEvent } from "react";
import { springStep } from "../animation/spring";
export function useSpringPointer<T extends HTMLElement>() {
  const ref = useRef<T>(null),
    frame = useRef(0),
    last = useRef(0);
  const target = useRef({ x: 0, y: 0 }),
    x = useRef({ value: 0, velocity: 0 }),
    y = useRef({ value: 0, velocity: 0 });
  const inside = useRef(false),
    presence = useRef({ value: 0, velocity: 0 });
  const reduced = useRef(false),
    mounted = useRef(false);
  const paint = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--spring-x", x.current.value.toFixed(5));
    el.style.setProperty("--spring-y", y.current.value.toFixed(5));
    el.style.setProperty(
      "--spring-stretch",
      String(1 + Math.abs(x.current.value) * 0.1),
    );
    el.style.setProperty(
      "--spring-squash",
      String(1 - Math.abs(x.current.value) * 0.06),
    );
    const amount = Math.max(0, Math.min(1, presence.current.value));
    el.style.setProperty("--spring-presence", String(amount));
    const field = el.querySelector("[data-elastic-field]"),
      displacement = el.querySelector("[data-elastic-displacement]");
    const art = el.querySelector<HTMLElement>(".portal-art");
    if (field && displacement && art) {
      const w = art.clientWidth,
        h = art.clientHeight,
        size = Math.max(w, h) * 0.9;
      field.setAttribute(
        "x",
        String(w * (0.5 + x.current.value * 0.32) - size / 2),
      );
      field.setAttribute(
        "y",
        String(h * (0.5 + y.current.value * 0.32) - size / 2),
      );
      field.setAttribute("width", String(size));
      field.setAttribute("height", String(size));
      displacement.setAttribute("scale", String(amount * 95));
    }
  };
  const reset = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    last.current = 0;
    target.current = { x: 0, y: 0 };
    x.current = { value: 0, velocity: 0 };
    y.current = { value: 0, velocity: 0 };
    inside.current = false;
    presence.current = { value: 0, velocity: 0 };
    paint();
    if (ref.current)
      ref.current.dataset.springState = reduced.current ? "disabled" : "idle";
  };
  const tick = (now: number) => {
    frame.current = 0;
    if (!mounted.current || reduced.current || document.hidden) return reset();
    const dt = last.current ? (now - last.current) / 1000 : 1 / 60;
    last.current = now;
    x.current = springStep(x.current, target.current.x, dt);
    y.current = springStep(y.current, target.current.y, dt);
    presence.current = springStep(presence.current, inside.current ? 1 : 0, dt);
    paint();
    const settled = [
      x.current.value - target.current.x,
      y.current.value - target.current.y,
      x.current.velocity,
      y.current.velocity,
      presence.current.value - (inside.current ? 1 : 0),
      presence.current.velocity,
    ].every((n) => Math.abs(n) < 0.0005);
    if (settled) {
      x.current = { value: target.current.x, velocity: 0 };
      y.current = { value: target.current.y, velocity: 0 };
      presence.current = { value: inside.current ? 1 : 0, velocity: 0 };
      paint();
      last.current = 0;
      if (ref.current)
        ref.current.dataset.springState =
          target.current.x === 0 && target.current.y === 0 ? "idle" : "settled";
    } else frame.current = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!frame.current) {
      last.current = 0;
      frame.current = requestAnimationFrame(tick);
    }
    if (ref.current) ref.current.dataset.springState = "moving";
  };
  useEffect(() => {
    mounted.current = true;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = media.matches;
    reset();
    const change = () => {
        reduced.current = media.matches;
        reset();
      },
      hide = () => {
        if (document.hidden) reset();
      };
    media.addEventListener("change", change);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", reset);
    return () => {
      mounted.current = false;
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      media.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", reset);
    };
  }, []);
  return {
    ref,
    onPointerMove(event: PointerEvent<T>) {
      if (event.pointerType !== "mouse" || reduced.current) return;
      const rect = event.currentTarget.getBoundingClientRect();
      inside.current = true;
      target.current = {
        x: Math.max(
          -1,
          Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
        ),
        y: Math.max(
          -1,
          Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
        ),
      };
      start();
    },
    onPointerLeave() {
      if (reduced.current) return;
      target.current = { x: 0, y: 0 };
      inside.current = false;
      start();
    },
  };
}
