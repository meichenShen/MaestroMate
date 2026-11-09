import { MessageCircle, ArrowUpRight, Music2 } from 'lucide-react';
import { questions } from '../../content/aquarium';
import { ClipButton } from '../../components/ClipButton';
import './conversation.css';
export function Conversation({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const question = questions.find(item => item.id === selected) || questions[0];
  return <section className="conversation-feature" aria-labelledby="conversation-title"><div className="feature-heading"><div><span className="section-overline">ASK & CONNECT</span><h2 id="conversation-title">从好奇，走近圣桑。</h2></div><span className="feature-badge"><MessageCircle size={12} /> 预设问答</span></div>
    <div className="composer-card"><div className="composer-monogram" aria-hidden="true">S<span>~</span></div><div><span className="section-overline">CAMILLE SAINT-SAËNS</span><h3>卡米耶·圣桑</h3><p>1835—1921 · 法国作曲家、钢琴家</p></div><Music2 size={42} strokeWidth={.8} className="composer-note" /></div>
    <p className="question-intro">你想先了解什么？</p><div className="question-options">{questions.map(item => <button key={item.id} aria-pressed={selected === item.id} onClick={() => onSelect(item.id)}>{item.prompt}<ArrowUpRight size={15} /></button>)}</div>
    <article className="answer-card" aria-live="polite" aria-atomic="true"><span className="answer-label"><span /> 一起了解</span><h3>{question.prompt}</h3><p>{question.answer}</p>{question.clip && <ClipButton clip={question.clip} />}<div className="answer-source">{question.source ? <a href={question.source} target="_blank" rel="noreferrer">{question.sourceLabel} <ArrowUpRight size={12} /></a> : question.sourceLabel}</div></article>
    <p className="feature-disclaimer">这是预设的导赏问答，不是实时 AI，也不代表作曲家本人发言。</p>
  </section>;
}
