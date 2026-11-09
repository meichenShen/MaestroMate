import { Clock3, Headphones } from 'lucide-react';
import { work } from '../content/aquarium';
export function WorkIntro() {
  return <section className="work-intro" aria-labelledby="work-title">
    <div><p className="eyebrow"><span /> THE LISTENING ROOM <span className="eyebrow-divider">/</span> 古典音乐探索室</p>
      <h1 id="work-title">潜入一场<span>声音的奇遇。</span></h1>
      <p className="intro-copy">从圣桑的《水族馆》出发。听一听，想一想，发现属于你的音乐世界。</p>
      <div className="work-meta"><span>{work.composer}</span><i /><span>{work.collection}</span><i /><span><Clock3 size={14} /> 约 2 分 28 秒</span></div>
    </div>
    <div className="intro-seal" aria-hidden="true"><span>LE CARNAVAL DES ANIMAUX</span><strong>VII</strong><em>Aquarium · 1886</em></div>
    <p className="headphone-note"><Headphones size={14} /> 戴上耳机，给耳朵一点好奇心</p>
  </section>;
}
