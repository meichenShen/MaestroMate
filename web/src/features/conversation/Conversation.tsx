import {t,useLocale} from "../../i18n/locale";
import { chineseQuestions } from "../../content/knowledge/chinese";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Send, Music2, BookOpen, Sparkles, Compass, } from "lucide-react";
import { questions, questionPresentation } from "../../content/aquarium";
import { ClipButton } from "../../components/ClipButton";
import { Hint } from "../../components/Hint";
import { KnowledgeShelf } from "./KnowledgeShelf";
import { ComposerBiography } from "./ComposerBiography";
import { unitHash } from "../curriculum/PlayCatalog";
import type { useComposerChat } from "./useComposerChat";
import { ChatSettings } from "./ChatSettings";
import { references, type ReferenceId } from "../../content/knowledge/sources";
const topics = [
    {
        id: "all",
        label: "All",
        hint: "Follow any question that catches your ear.",
        Icon: Compass,
    },
    {
        id: "life",
        label: "Life",
        hint: "The early years, Paris and a life in music.",
        Icon: BookOpen,
    },
    {
        id: "music",
        label: "Music",
        hint: "The piece, its textures and a closer listen.",
        Icon: Music2,
    },
    {
        id: "play",
        label: "Mischief",
        hint: "A private musical joke and your own imagination.",
        Icon: Sparkles,
    },
];
export function Conversation({ journey = false, chat, }: {
    journey?: boolean;
    chat: ReturnType<typeof useComposerChat>;
}) {
    useLocale();
    const { turns, pending, ask: onAsk } = chat;
    const [draft, setDraft] = useState("");
    const [consent, setConsent] = useState(false);
    const zh = chat.language === "zh";
    const consentDialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { if (consent)
        consentDialog.current?.showModal();
    else
        consentDialog.current?.close(); }, [consent]);
    const thread = useRef<HTMLDivElement>(null), follow = useRef(true), questionRail = useRef<HTMLDivElement>(null);
    const [topic, setTopic] = useState("all");
    useEffect(() => {
        questionRail.current?.scrollTo({ left: 0 });
    }, [topic]);
    const latest = () => { const host = thread.current; if (!host)
        return; const target = host.querySelector<HTMLElement>('.chat-turn:last-of-type .incoming') || host.querySelector<HTMLElement>('.chat-turn:last-of-type .outgoing'); host.scrollTo({ top: target ? host.scrollTop + target.getBoundingClientRect().top - host.getBoundingClientRect().top - 8 : 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); };
    useEffect(() => {
        if (follow.current)
            latest();
    }, [turns, pending]);
    return (<section className="conversation-feature chat-studio" aria-labelledby="conversation-title">
      <aside className="artist-profile" data-lenis-prevent>
        <p className="eyebrow">{t("Meet the composer")}</p>
        <div className="artist-emblem" aria-hidden="true">
          <Music2 strokeWidth={1.1}/>
          <span>{t("C.S.")}</span>
        </div>
        <h1 id="conversation-title">{t("Camille Saint-Saëns")}</h1>
        <p className="artist-years">{t("1835 \u2014 1921")}</p>
        <p className="artist-roles">{t("Composer. Pianist. Organist.")}</p>
        <div className="composer-illustration" aria-hidden="true"><svg viewBox="0 0 240 130" fill="none"><path d="M35 82V45c0-20 105-32 140 0l30 23v30H35Z" fill="#a593e033" stroke="#a593e0" strokeWidth="2"/><path d="M35 81h170M55 82v18m22-18v18m22-18v18m22-18v18m22-18v18m22-18v18m22-18v18M48 101v19m145-19v19" stroke="#ffda8e" strokeWidth="3"/><circle cx="181" cy="24" r="8" fill="#ee2560"/><path d="M188 24V5l18 5" stroke="#ee2560" strokeWidth="3"/></svg></div>
        <p className="composer-story">{t("Saint-Saëns was a French composer, pianist and organist. Aquarium is one of fourteen movements in The Carnival of the Animals.")}</p>
        <div className="composer-facts"><span><b>{t("1835")}</b>{t('Born in Paris')}</span><span><b>{t("1886")}</b>{t('The Carnival takes shape')}</span></div>
        <ComposerBiography />
        <KnowledgeShelf />
      </aside>
      <div className="chat-main">
        <header className="chat-room-heading">
          <h2>{t("A moment with Camille.")}</h2>
          <Hint id="conversation-note" label={t("About this conversation")}>{t("An imagined educational conversation, not historical quotations. AI replies may contain mistakes; check the sources shown.")}</Hint>
          <ChatSettings config={chat.config} enabled={chat.aiEnabled} pending={pending} model={chat.model} onModel={chat.setModel} onEnable={chat.setAI}/>
        </header>
        <p className="prepared-disclosure">
          {t(chat.aiEnabled
            ? "AI preview · An imagined Camille, with sources"
            : "Prepared conversation · Imagined replies, with sources")}
        </p>
        <div className="chat-window">
          <div ref={thread} tabIndex={0} className="chat-thread" role="log" aria-label={t("Conversation with Camille")} aria-live="polite" aria-relevant="additions" data-lenis-prevent onScroll={() => {
            const e = thread.current!;
            follow.current =
                e.scrollHeight - e.scrollTop - e.clientHeight < 120;
        }}>
            <div className="chat-message incoming" data-speaker="camille">
              <span className="speaker-name">{t("Camille")}</span>
              <p>
                {t("Hello! Ask me about Aquarium, my other pieces, or how music works. Choose a question below or write your own.")}
              </p>
            </div>
            {turns.map((turn) => {
            const q = questions.find((q) => q.id === turn.questionId);
            return (<div className="chat-turn" key={turn.id}>
                  <div className="chat-message outgoing" data-speaker="you">
                    <span className="speaker-name">{t("You")}</span>
                    <p>{turn.question}</p>
                  </div>
                  {turn.replied && (<div className="chat-message incoming" data-speaker="camille">
                      <span className="speaker-name">{t("Camille")}</span>
                      <span className="reply-label">{t(turn.mode === "prepared"
                        ? "Prepared reply"
                        : turn.reply?.mode === "guidance"
                            ? "A little guidance"
                            : turn.reply?.kind === "listening"
                                ? "AI · Listening idea"
                                : turn.reply?.kind === "unknown"
                                    ? "AI · A limit to what we know"
                                    : "AI · From the knowledge shelf")}</span>
                      <p>
                        {turn.mode === "prepared"
                        ? (turn.language === "zh" && q ? chineseQuestions[q.id].answer : q?.answer)
                        : turn.reply?.answer}
                      </p>
                      {t(q?.clip && <ClipButton clip={q.clip}/>)}
                      <details className="message-source">
                        <summary>{t("Behind this reply")}</summary>
                        {turn.reply?.mode === "guidance" ? (<p>{t("This reminder is written by MaestroMate. No AI request was made for this reply.")}</p>) : turn.mode === "prepared" ? (q?.source ? (<a href={q.source} target="_blank" rel="noreferrer">
                              {t(q.sourceLabel)}{t(" \u2197")}</a>) : (<p>{t(q?.sourceLabel)}</p>)) : (<>
                            <p>{t("AI adapted these reference notes into an imagined reply. Source links are checked; factual accuracy still needs your judgement.")}</p>
                            {turn.reply?.sourceIds.map((id) => Object.hasOwn(references, id) ? (id === "editorial" ? (<div key={id} className="editorial-source">
                                    <strong>
                                      {t(references.editorial.label)}
                                    </strong>
                                    {turn.reply?.editorialNotes?.map((note, i) => (<p key={i}>{t(note)}</p>))}
                                  </div>) : (<a key={id} href={references[id as ReferenceId].url} target="_blank" rel="noreferrer">
                                    {t(references[id as ReferenceId].label)}{t(" \u2197")}</a>)) : null)}
                            {!turn.reply?.sourceIds.length && (<p>{t("No supporting reference was returned.")}</p>)}
                          </>)}
                      </details>
                      {t(q && (<a className="chat-play-link" href={unitHash(q.playUnit, journey)}>{t("Try this idea in Play")}</a>))}
                    </div>)}
                  {t(turn.error && (<div className="chat-error" role="alert">
                      <p>
                        {t(turn.error === "rate_limited"
                        ? "Our AI needs a little rest. Try again later, or explore the prepared questions."
                        : "That reply could not be checked. Try again, or use our prepared questions.")}
                      </p>
                      <div>
                        {t(chat.aiEnabled && (<button disabled={pending} onClick={() => chat.retry(turn.id)}>{t("Try that question again")}</button>))}
                        {t(q ? (<button disabled={pending} onClick={() => chat.readPrepared(turn.id)}>{t("Read the prepared reply")}</button>) : (<button disabled={pending} onClick={() => chat.setAI(false)}>{t("Use prepared questions")}</button>))}
                      </div>
                    </div>))}
                </div>);
        })}
            {t(pending && (<div className="typing-indicator" role="status">{t("Looking through the knowledge shelf\u2026")}</div>))}
          </div>
          <div className="chat-prompts">
            <div className="chat-modebar" aria-label={t("Conversation controls")}><button role="switch" aria-label={t("AI conversation")} aria-checked={chat.aiEnabled} disabled={pending || !chat.config?.enabled} onClick={() => chat.aiEnabled ? chat.setAI(false) : setConsent(true)}><i />{t('AI conversation')} {t(chat.aiEnabled ? 'On' : 'Off')}</button><select aria-label={t("AI model")} value={chat.model} disabled={pending} onChange={e => chat.setModel(e.target.value)}>{t((chat.config?.models || []).map(m => <option key={m.id} value={m.id}>{t(m.label)}</option>))}</select><select aria-label={t("Conversation language")} value={chat.language} disabled={pending} onChange={e => chat.setLanguage(e.target.value as 'en' | 'zh')}><option value="en">{t("English")}</option><option value="zh">{t("\u4E2D\u6587")}</option></select></div>
            <dialog ref={consentDialog} className="inline-consent discovery-dialog" aria-label={t("AI privacy")} onClose={() => setConsent(false)}><p>{t('AI sends your question and up to three exchanges to Alibaba Cloud. Leave out private details; children should ask a parent or teacher first.')}</p><button onClick={() => { chat.setAI(true); setConsent(false); }}>{t("Enable AI conversation")}</button><button onClick={() => setConsent(false)}>{t('Not now')}</button></dialog>

            <div className="prompt-heading">
              <p>{t("Try asking")}</p>
              <div className="question-rail-actions">
                <button aria-label={t("Previous questions")} onClick={() => questionRail.current?.scrollBy({
            left: -260,
            behavior: matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
        })}>{t("Previous")}</button>
                <button aria-label={t("More questions")} onClick={() => questionRail.current?.scrollBy({
            left: 260,
            behavior: matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
        })}>{t("More")}</button>
              </div>
              <button className="thread-bottom" aria-label={t("Show latest messages")} onClick={() => {
            follow.current = true;
            latest();
        }}>
                <ArrowDown size={18}/>
              </button>
            </div>
            <div className="question-tiles" ref={questionRail} role="group" aria-label={t("Suggested questions")}>
              {t(questions
            .filter((q) => topic === "all" ||
            questionPresentation[q.id].topic === topic)
            .map((q) => (<button className="question-tile" key={q.id} aria-label={t(zh ? chineseQuestions[q.id].prompt : q.prompt)} disabled={pending} onClick={() => {
                follow.current = true;
                onAsk(q.id);
            }}>
                    <strong>{t(zh ? "聊聊这个" : questionPresentation[q.id].label)}</strong>
                    <Send size={16}/>
                    <span className="question-full">{t(zh ? chineseQuestions[q.id].prompt : q.prompt)}</span>
                  </button>)))}
            </div>
            {t(chat.aiEnabled && (<form className="chat-compose" onSubmit={(e) => {
                e.preventDefault();
                if (!pending && draft.trim()) {
                    chat.askText(draft.trim());
                    setDraft("");
                    follow.current = true;
                }
            }}>
                <label className="sr-only" htmlFor="music-question">{t("Your music question")}</label>
                <input id="music-question" type="text" autoComplete="off" placeholder={t("What would you like to ask Camille?")} maxLength={600} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={pending} aria-describedby="chat-input-note"/>
                <button type="submit" aria-label={t("Send question")} disabled={pending || !draft.trim()}>
                  <Send size={19}/>
                  <span>{t("Send")}</span>
                </button>
              </form>))}
            <p className="chat-note" id="chat-input-note">
              {t(chat.aiEnabled
            ? "Keep private details out. AI can make mistakes; check the sources."
            : "Choose a question, or explore AI in Settings. Replies are imagined, not quotations.")}
            </p>
          </div>
        </div>
      </div>
    </section>);
}
