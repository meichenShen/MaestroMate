import { useCallback, useEffect, useRef } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";
export function useSmoothPage(home = false) {
  const instance = useRef<Lenis | null>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined,
      snap: Snap | undefined,
      resize: ResizeObserver | undefined,
      mutations: MutationObserver | undefined,
      observer: IntersectionObserver | undefined,
      stops: (() => void)[] = [];
    let disposed = false;
    const clear = () => {
      snap?.stop();
      snap?.destroy();
      lenis?.destroy();
      resize?.disconnect();
      mutations?.disconnect();
      observer?.disconnect();
      snap = undefined;
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
          lerp: 0.1,
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
        snap = new Snap(lenis, {
          type: "mandatory",
          debounce: 180,
          duration: 0.72,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
        const points = () => {
          stops.forEach((remove) => remove());
          const header =
            document.querySelector("header")?.getBoundingClientRect().height ||
            0;
          stops = scenes.map((scene) =>
            snap!.add(
              Math.max(
                0,
                Math.round(
                  scene.getBoundingClientRect().top + window.scrollY - header,
                ),
              ),
            ),
          );
        };
        points();
        resize = new ResizeObserver(points);
        scenes.forEach((s) => resize!.observe(s));
        document.fonts.ready.then(() => {
          if (!disposed && snap) points();
        });
      }
      const modal = () => {
        if (document.querySelector("dialog[open]")) snap?.stop();
        else snap?.start();
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
