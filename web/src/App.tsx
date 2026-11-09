import { useState } from 'react';
import { AudioProvider } from './audio/AudioProvider';
import { type ActivityId } from './content/aquarium';
import { BrandHeader } from './components/BrandHeader';
import { WorkIntro } from './components/WorkIntro';
import { ActivityNav } from './components/ActivityNav';
import { ContextPanel } from './components/ContextPanel';
import { Player } from './components/Player';
import { Theater } from './features/theater/Theater';
import { Conversation } from './features/conversation/Conversation';
import { Detective, initialProgress } from './features/detective/Detective';
export function App() {
  const [activity,setActivity] = useState<ActivityId>('theater');
  const [selectedQuestion,setSelectedQuestion] = useState('aquarium');
  const [progress,setProgress] = useState(initialProgress);
  const [motion,setMotion] = useState(true);
  return <AudioProvider><a href="#main" className="skip-link">跳到主要内容</a><div className="site-shell"><BrandHeader /><WorkIntro />
    <main id="main" className="exploration-layout" tabIndex={-1}><ActivityNav active={activity} onChange={setActivity} /><div id="activity-panel" className="activity-panel">{activity === 'theater' ? <Theater onDiscover={() => setActivity('detective')} motion={motion} onMotionChange={setMotion} /> : activity === 'conversation' ? <Conversation selected={selectedQuestion} onSelect={setSelectedQuestion} /> : <Detective progress={progress} onChange={setProgress} />}</div><ContextPanel activity={activity} /></main>
    <div className="page-footnote"><span>MAESTROMATE</span><p>聆听没有标准的想象，好奇心就是你的入场券。</p><span>一部作品 · 无限可能</span></div>
  </div><Player /></AudioProvider>;
}
