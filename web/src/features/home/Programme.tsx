import {t,useLocale} from "../../i18n/locale";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, ArrowDown, Plus, Minus } from "lucide-react";
import { DrawnIcon } from "../../components/DrawnIcon";
import { AquariumView } from "../../components/AquariumView";
import { useSpringPointer } from "../../hooks/useSpringPointer";
function ProgrammeArtwork({ children }: {
    children: ReactNode;
}) {
    useLocale();
    const spring = useSpringPointer<HTMLDivElement>();
    return (<div className="work-preview" {...spring}>
      <span className="programme-page-back" aria-hidden="true"/>
      <span className="programme-page-edge" aria-hidden="true"/>
      <div className="programme-window">
        <div className="programme-preview-art" data-elastic-art>
          {t(children)}
        </div>
      </div>
    </div>);
}
export function Programme({ open, onOpen, onClose, onEnter, }: {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    onEnter: () => void;
}) {
    useLocale();
    const [closing, setClosing] = useState(false);
    const coverSpring = useSpringPointer<HTMLButtonElement>();
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);
    const close = () => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            onClose();
            return;
        }
        setClosing(true);
        timer.current = setTimeout(() => {
            onClose();
            setClosing(false);
        }, 280);
    };
    return (<section id="programme" className="programme-section section-anchor">
      <div className="programme-heading">
        <div>
          <p className="eyebrow">{t("Your next little adventure")}</p>
          <h2>{t(open ? "Pick a piece." : "Your Program.")}</h2>
          <p>{t("Listen, chat, then play \u2014 all in one Program.")}</p>
        </div>
        <div className="programme-tools">
          {t(open && (<button className="text-button" aria-label={t("Close Program")} onClick={close} disabled={closing}>{t("Close Program ")}<Minus size={18}/>
            </button>))}
        </div>
      </div>
      {t(!open ? (<button className="programme-cover" aria-label={t("Open Program")} onClick={onOpen} {...coverSpring}>
          <span className="cover-paper cover-paper-back" aria-hidden="true"/>
          <span className="cover-paper cover-paper-front" aria-hidden="true"/>
          <span className="programme-cover-art" data-elastic-art>
            <img src="/images/program-cover.png" alt={t("")}/>
            <span className="cover-fold"/>
          </span>
          <span className="cover-heading">{t("A closer kind")}<br />{t("of listening.")}</span>
          <span className="cover-action">{t("Open your Program ")}<Plus size={24}/>
          </span>
        </button>) : (<div className={`programme-list ${closing ? "is-closing" : ""}`}>
          <article className="work-entry" data-work="aquarium">
            <ProgrammeArtwork>
              <AquariumView preview/>
            </ProgrammeArtwork>
            <div className="work-information">
              <div>
                <h3>{t("Aquarium")}</h3>
                <p>{t("Camille Saint-Sa\u00EBns \u00B7 1886")}</p>
              </div>
              <button className="round-link" onClick={onEnter} aria-label={t("Start Aquarium Program")}>
                <span>{t("Start Program ")}<small>{t("Listen \u00B7 Chat \u00B7 Play")}</small>
                </span>
                <ArrowUpRight size={25}/>
              </button>
            </div>
          </article>
          <article className="work-entry" data-work="swan">
            <ProgrammeArtwork>
              <DrawnIcon kind="swan"/>
            </ProgrammeArtwork>
            <div className="work-information">
              <div>
                <h3>{t("The Swan")}</h3>
                <p>{t("Camille Saint-Sa\u00EBns \u00B7 1886")}</p>
              </div>
              <button className="coming-soon" disabled>{t("Coming soon ")}<ArrowUpRight size={22}/>
              </button>
            </div>
          </article>
          <p className="programme-direction">{t("Scroll to explore ")}<ArrowDown size={16}/>
          </p>
        </div>))}
    </section>);
}
