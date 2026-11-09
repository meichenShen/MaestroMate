import { useEffect } from "react";
import Lenis from "lenis";
export function useSmoothPage() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    const setup = () => {
      lenis?.destroy();
      lenis = undefined;
      if (!query.matches)
        lenis = new Lenis({
          autoRaf: true,
          lerp: 0.09,
          smoothWheel: true,
          anchors: false,
          prevent: (node) =>
            node.tagName === "DIALOG" ||
            node.hasAttribute("data-lenis-prevent"),
        });
    };
    setup();
    query.addEventListener("change", setup);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    const mutations = new MutationObserver(() =>
      document
        .querySelectorAll("[data-reveal]:not(.is-visible)")
        .forEach((el) => observer.observe(el)),
    );
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      lenis?.destroy();
      query.removeEventListener("change", setup);
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
}
