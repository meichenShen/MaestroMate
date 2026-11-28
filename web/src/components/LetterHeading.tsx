import {t,useLocale} from "../i18n/locale";
import type { CSSProperties } from "react";
/** Deterministic scattered letters settle once per scene entry, with real text. */
export function LetterHeading({ as: Tag = "h2", text, }: {
    as?: "h1" | "h2";
    text: string;
}) {
    useLocale();
    let index = 0;
    return (<Tag className="letter-heading" aria-label={t(text.replace(/\s+/g, " "))}>
      <span aria-hidden="true">
        {t(text.split("\n").map((line, row) => (<span className="arrival-line" key={row}>
            {t(line.split(" ").map((word, wordIndex) => (<span className="arrival-word" key={wordIndex}>
                {t([...word].map((char) => {
                    const i = index++, seed = (i * 47 + row * 29) % 101;
                    return (<span className="arrival-letter" key={i} style={{
                            "--letter-x": `${((seed % 7) - 3) * 8}px`,
                            "--letter-y": `${((seed % 9) - 4) * 7}px`,
                            "--letter-angle": `${(seed % 25) - 12}deg`,
                            "--letter-delay": `${seed * 3}ms`,
                        } as CSSProperties}>
                      {t(char)}
                    </span>);
                }))}
              </span>)))}
          </span>)))}
      </span>
    </Tag>);
}
