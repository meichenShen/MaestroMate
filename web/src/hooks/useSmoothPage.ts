import { useCallback, useEffect, useRef } from "react";
import Lenis from "lenis";
import { nearSceneStop } from "../navigation/scene-settle";
export function useSmoothPage(home = false) {
  const instance = useRef<Lenis | null>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined,
      settleTimer: ReturnType<typeof setTimeout> | undefined,
      removeInput: (() => void) | undefined,
      resize: ResizeObserver | undefined,
      mutations: MutationObserver | undefined,
      observer: IntersectionObserver | undefined,
      stops: number[] = [];
    let settlingAllowed = true;
    let disposed = false;
    const clear = () => {
      clearTimeout(settleTimer);
      removeInput?.();
      lenis?.destroy();
      resize?.disconnect();
      mutations?.disconnect();
      observer?.disconnect();
      removeInput = undefined;
      lenis = undefined;
      instance.current = null;
      stops = [];
    };
    const setup = () => {
      clear();
      document.documentElement.classList.toggle("home-route", home);
      document.documentElement.dataset.scrollMode = media.matches
        ? "native"
        : "smooth";
      if (!media.matches) {
        lenis = new Lenis({
          autoRaf: true,
          lerp: 0.075,
          smoothWheel: true,
          anchors: false,
          prevent: (node) =>
            node.tagName === "DIALOG" ||
            node.hasAttribute("data-lenis-prevent"),
        });
        instance.current = lenis;
      }
      const scenes = [...document.querySelectorAll<HTMLElement>(".snap-scene")];
      if (home && lenis && scenes.length) {
        const current = lenis;
        const points = () => {
          const header =
            document.querySelector("header")?.getBoundingClientRect().height ||
            0;
          stops = scenes.map((scene) =>
            Math.max(
              0,
              Math.round(
                scene.getBoundingClientRect().top + window.scrollY - header,
              ),
            ),
          );
        };
        points();
        resize = new ResizeObserver(points);
        scenes.forEach((scene) => resize!.observe(scene));
        document.fonts.ready.then(() => {
          if (!disposed) points();
        });
        removeInput = current.on("virtual-scroll", ({ event, deltaY }) => {
          if (event.type === "touchmove" || !deltaY) return;
          clearTimeout(settleTimer);
          settleTimer = setTimeout(() => {
            if (
              disposed ||
              !settlingAllowed ||
              document.querySelector("dialog[open]")
            )
              return;
            // Use the user's intended stopping point, not a velocity-biased guess.
            const target = Math.max(
              0,
              Math.min(current.limit, current.targetScroll),
            );
            const stop = nearSceneStop(target, stops, innerHeight);
            if (stop !== null && Math.abs(stop - target) > 1)
              current.scrollTo(stop, {
                duration: 0.95,
                easing: (t) => 1 - Math.pow(1 - t, 3),
                lock: false,
                userData: { initiator: "scene-settle" },
              });
          }, 280);
        });
      }
      const modal = () => {
        settlingAllowed = !document.querySelector("dialog[open]");
        if (!settlingAllowed) {
          clearTimeout(settleTimer);
          if (lenis?.userData?.initiator === "scene-settle")
            lenis.scrollTo(lenis.scroll, { immediate: true, force: true });
        }
      };
      modal();
      mutations = new MutationObserver(modal);
      mutations.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["open"],
      });
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle(
              "scene-visible",
              entry.isIntersecting,
            );
            if (entry.intersectionRatio > 0.55) {
              document
                .querySelectorAll<HTMLElement>("[data-scene-link]")
                .forEach((link) => {
                  if (link.dataset.sceneLink === entry.target.id)
                    link.setAttribute("aria-current", "step");
                  else link.removeAttribute("aria-current");
                });
            }
          });
        },
        { threshold: [0, 0.15, 0.55] },
      );
      scenes.forEach((s) => observer!.observe(s));
    };
    setup();
    media.addEventListener("change", setup);
    return () => {
      disposed = true;
      clear();
      media.removeEventListener("change", setup);
      document.documentElement.classList.remove("home-route");
    };
  }, [home]);
  return useCallback((target: HTMLElement | number, immediate = false) => {
    const header =
      document.querySelector("header")?.getBoundingClientRect().height || 0;
    const top =
      typeof target === "number"
        ? target
        : Math.max(
            0,
            target.getBoundingClientRect().top + window.scrollY - header,
          );
    if (instance.current)
      instance.current.scrollTo(top, { immediate, duration: 0.8, force: true });
    else
      window.scrollTo({
        top,
        behavior:
          immediate || matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
      });
  }, []);
}
