import {t,useLocale} from "../../i18n/locale";
import { TheatreStage } from "../../components/TheatreStage";
import { units, unitDone, type CurriculumProgress, } from "../../content/curriculum";
export function ProgramComplete({ curriculum, onRestart, motion = true, }: {
    curriculum: CurriculumProgress;
    onRestart: () => void;
    motion?: boolean;
}) {
    useLocale();
    return (<main id="main" tabIndex={-1} className="program-summary page-room">
      <TheatreStage celebrate motion={motion}/>
      <div className="completion-copy">
        <p className="eyebrow">{t("Your Aquarium Program \u00B7 Visit complete")}</p>
        <h1>{t("Lovely wandering.")}</h1>
        <p>{t("One piece. A few new discoveries.")}<br />{t("Thank you for following your ears.")}</p>
        <div className="learning-recap">
          <p>{t("Your discoveries this visit \u00B7")}{t(" ")}
            {t(units.filter((u) => u.area === "works" && unitDone(u, curriculum[u.id])).length)}{t("/")}{t(units.filter((u) => u.area === "works").length)}{t(" explored")}</p>
          {t(units
            .filter((u) => u.area === "works")
            .map((u) => (<p key={u.id}>
                {t(u.title)}{t(" \u00B7")}{t(" ")}
                {t(unitDone(u, curriculum[u.id])
                ? "Learned & explored"
                : "Still yours to explore")}
              </p>)))}
          <a href="#program/aquarium/learn">{t("Revisit your discoveries \u2197")}</a>
        </div>
        <div className="completion-actions">
          <a className="solid-button" href="#home" aria-label={t("Home")}>{t("Home \u2197")}</a>
          <button className="completion-restart" onClick={onRestart} aria-label={t("Restart Program")}>{t("Restart Program \u21BB")}</button>
          <a className="completion-another" href="#program" aria-label={t("Choose another Program")}>{t("Choose another Program \u2197")}</a>
        </div>
      </div>
    </main>);
}
