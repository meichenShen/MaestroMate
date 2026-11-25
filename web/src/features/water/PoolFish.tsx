import {t,useLocale} from "../../i18n/locale";
export function PoolFish() {
    useLocale();
    return (<svg viewBox="0 0 140 70" fill="none" aria-hidden="true">
      <path d="M12 34 2 14l28 10C53 2 93 6 126 34c-33 28-73 33-96 9L2 56z" fill="currentColor"/>
      <path d="m51 22 17-16 17 13m-34 29 17 15 17-13" fill="currentColor" opacity=".5"/>
      <circle cx="105" cy="30" r="3" fill="#101321"/>
      <path d="M42 28q20-13 44-7" stroke="#ffffef" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round"/>
    </svg>);
}
