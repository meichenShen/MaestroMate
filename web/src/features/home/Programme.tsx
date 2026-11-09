import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDown, Plus, Minus } from "lucide-react";
import { DrawnIcon } from "../../components/DrawnIcon";
import { AquariumView } from "../../components/AquariumView";
export function Programme({
  open,
  onOpen,
  onClose,
  onEnter,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEnter: () => void;
}) {
  const [closing, setClosing] = useState(false);
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
  return (
    <section id="programme" className="programme-section section-anchor">
      <div className="programme-heading">
        <div>
          <p className="eyebrow">Your next little adventure</p>
          <h2>Pick a piece.</h2>
          <p>Listen, chat, then play — all in one Program.</p>
        </div>
        <div className="programme-tools">
          {open && (
            <button
              className="text-button"
              aria-label="Close Program"
              onClick={close}
              disabled={closing}
            >
              Close Program <Minus size={18} />
            </button>
          )}
        </div>
      </div>
      {!open ? (
        <button
          className="programme-cover"
          aria-label="Open Program"
          onClick={onOpen}
        >
          <img src="/images/aquarium-poster.webp" alt="" />
          <span className="cover-heading">
            A closer kind
            <br />
            of listening.
          </span>
          <span className="cover-action">
            Open your Program <Plus size={24} />
          </span>
        </button>
      ) : (
        <div className={`programme-list ${closing ? "is-closing" : ""}`}>
          <article className="work-entry" data-work="aquarium">
            <div className="work-preview">
              <AquariumView preview />
            </div>
            <div className="work-information">
              <div>
                <h3>Aquarium</h3>
                <p>Camille Saint-Saëns · 1886</p>
              </div>
              <button
                className="round-link"
                onClick={onEnter}
                aria-label="Start Aquarium Program"
              >
                <span>
                  Start Program <small>Listen · Chat · Play</small>
                </span>
                <ArrowUpRight size={25} />
              </button>
            </div>
          </article>
          <article className="work-entry" data-work="swan">
            <div className="work-preview">
              <DrawnIcon kind="swan" />
            </div>
            <div className="work-information">
              <div>
                <h3>The Swan</h3>
                <p>Camille Saint-Saëns · 1886</p>
              </div>
              <button className="coming-soon" disabled>
                Coming soon <ArrowUpRight size={22} />
              </button>
            </div>
          </article>
          <p className="programme-direction">
            Scroll to explore <ArrowDown size={16} />
          </p>
        </div>
      )}
    </section>
  );
}
