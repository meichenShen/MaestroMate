import{useSyncExternalStore}from'react';
import{translate,type Language}from'./translate';
const listeners=new Set<()=>void>();
function initial():Language {try{const saved=localStorage.getItem('maestromate-language');if(saved==='en'||saved==='zh')return saved;return navigator.language.toLowerCase().startsWith('zh')?'zh':'en'}catch{return'en'}}
let language:Language=initial();
export function setLanguage(next:Language){if(next!=='en'&&next!=='zh')return;language=next;try{localStorage.setItem('maestromate-language',next)}catch{/* preferences remain visit-local if storage is unavailable */}document.documentElement.lang=next==='zh'?'zh-CN':'en';document.title=next==='zh'?'MaestroMate · 走近音乐':'MaestroMate — A closer kind of listening.';listeners.forEach(fn=>fn())}
export function useLocale(){const current=useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>language,()=> 'en' as Language);return{language:current,setLanguage}}
export function t<T>(value:T,context?:string):T{return translate(value,language,context)}
