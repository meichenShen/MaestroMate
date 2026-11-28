import {t,useLocale} from "../i18n/locale";
import { Compass, ArrowUpRight, ChevronDown } from "lucide-react";
import type { Route } from "../navigation/routes";
export function BrandHeader({ route, onGuide, onEntry, }: {
    route: Route;
    onGuide: () => void;
    onEntry: () => void;
}) {
    const {language,setLanguage}=useLocale();
    const active = route.kind === "learning" || route.kind === "lesson"
        ? route.journey
            ? "program"
            : "play"
        : route.kind === "activity"
            ? route.journey
                ? "program"
                : { theater: "listen", conversation: "chat", detective: "play" }[route.activity]
            : route.kind === "library"
                ? route.intent
                : route.kind === "games" ||
                    route.kind === "pool" || route.kind === "studio" ||
                    route.kind === "playcatalog"
                    ? "play"
                    : route.kind === "summary"
                        ? "program"
                        : "";
    return (<header className="brand-header">
      <a className="brand" href="#home" aria-label={t("MaestroMate home")}>{t("MaestroMate")}</a>
      <label className="site-language">
        <span className="sr-only">Site language / 网站语言</span>
        <select aria-label="Site language / 网站语言" value={language} onChange={e=>setLanguage(e.target.value as 'en'|'zh')}>
          <option value="en">English</option><option value="zh">中文</option>
        </select>
        <ChevronDown size={14} aria-hidden="true"/>
      </label>
      <nav aria-label={t("Main navigation")}>
        <div className="room-links">
          {t([
            { id: "listen", label: "Listen" },
            { id: "chat", label: "Chat" },
            { id: "play", label: "Play" },
        ].map((item) => (<a key={item.id} href={"#" + item.id} aria-current={active === item.id ? "page" : undefined}>
              {t(item.label)}
            </a>)))}
        </div>
        <a className="program-link" href="#program" aria-current={active === "program" ? "page" : undefined}>{t("Program")}<ArrowUpRight size={16}/>
        </a>
        <button className="entry-reopen" aria-label={t("Choose a way in")} onClick={onEntry}>
          <Compass size={20}/>
        </button>
        <button className="guide-link" onClick={onGuide} aria-label={t("Open guide")}>{t("Guide")}</button>
      </nav>
    </header>);
}
