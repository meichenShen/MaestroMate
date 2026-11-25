import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/redesign.css";
import "./i18n/language.css";
document.documentElement.lang = (()=>{try{return localStorage.getItem("maestromate-language")==="zh"||(!localStorage.getItem("maestromate-language")&&navigator.language.startsWith("zh"))?"zh-CN":"en"}catch{return "en"}})();
document.title=document.documentElement.lang === "zh-CN" ? "MaestroMate · 走近音乐" : "MaestroMate — A closer kind of listening.";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
