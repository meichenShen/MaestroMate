import { t, useLocale } from "../../i18n/locale";
import { composerBiography } from "../../content/knowledge/biography";
import { references } from "../../content/knowledge/sources";

export function ComposerBiography() {
  useLocale();
  const sourceIds = [...new Set(composerBiography.flatMap((chapter) => chapter.sourceIds))];
  return (
    <details className="composer-biography" onToggle={(event) => {
      const details = event.currentTarget;
      const pane = details.closest<HTMLElement>(".artist-profile");
      if (!details.open || !pane || pane.scrollHeight <= pane.clientHeight) return;
      // Bring the opened story into the existing sidebar, leaving the page and
      // question controls stationary. A naturally sized mobile panel needs no jump.
      pane.scrollTo({
        top: pane.scrollTop + details.getBoundingClientRect().top - pane.getBoundingClientRect().top - 16,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }}>
      <summary>{t("Read more about his life and music")}</summary>
      <div className="composer-biography-chapters">
        {composerBiography.map((chapter) => (
          <section key={chapter.title}>
            <h3>{t(chapter.title)}</h3>
            <p>{t(chapter.text)}</p>
          </section>
        ))}
      </div>
      <footer className="composer-biography-sources">
        <span>{t("Sources")}</span>
        {sourceIds.map((id) => (
          <a key={id} href={references[id].url} target="_blank" rel="noreferrer">
            {t(references[id].label)}
          </a>
        ))}
      </footer>
    </details>
  );
}
