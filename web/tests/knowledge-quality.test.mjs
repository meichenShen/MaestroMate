import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retrieveKnowledge} from '../src/content/knowledge/retrieval.ts';
test('Chinese and English questions retrieve specific reviewed topics',()=>{
 for(const [q,id] of [
  ['你还写过哪些作品？','works'],['水族馆的结构和主题是什么？','aquarium-analysis'],['你有没有给电影配过乐？','film'],
  ['What did you do outside France?','travel'],['玻璃琴怎样发声？','glass'],
  ['音色和音高有什么区别？','timbre'],['节拍和速度有什么区别？','tempo'],
  ['和弦与旋律有什么不同？','harmony'],['大调一定快乐，小调一定悲伤吗？','scales'],
 ]) assert.ok(retrieveKnowledge(q).some(n=>n.id===id),q);
});
test('Chinese follow-up inherits the previous instrument context',()=>{
 assert.ok(retrieveKnowledge('那它是怎么发声的？',undefined,'玻璃琴是什么乐器？').some(n=>n.id==='glass'));
});
test('English stopwords and word fragments do not invent topic matches',()=>{
 const ids=retrieveKnowledge('Could you tell me about something?').map(n=>n.id);
 assert.ok(!ids.includes('score'));assert.ok(!ids.includes('theory'));
});
test('Specific topics rank above the default persona notes; context remains bounded',()=>{
 const n=retrieveKnowledge('你还有哪些歌剧、交响曲、协奏曲？');
 assert.equal(n[0].id,'works');assert.ok(n.length<=9);
 assert.ok(n.some(x=>x.id==='scene'));
});
test('ordinary Chinese phrasings reach recording, biography, beat and Aquarium notes',()=>{
 for(const [q,id]of[['这首曲子是谁演奏的？','recording'],['这个网站的音乐是谁做的？','recording'],['你在哪个教堂工作？','paris'],['拍点是什么？','tempo'],['一拍是什么意思？','tempo'],['你去过哪些国家？','travel'],['水族馆的开头有什么特点？','aquarium-analysis']])assert.ok(retrieveKnowledge(q).some(n=>n.id===id),q);
});
test('explicit new topic outranks even a long unrelated previous question',()=>{
 const history='水族馆的结构、主题、半音和水流效果是什么？玻璃琴、钢琴、长笛、小提琴为什么音色不同？音高、音量、响度和快慢、速度、节拍、节奏、休止有什么区别？旋律、伴奏、和弦、三和弦、分解和弦和和声有什么关系？';
 assert.equal(retrieveKnowledge('你去哪里旅行？',undefined,history)[0].id,'travel');
});
test('several elliptical follow-ups retain the last explicit topic',()=>{
 assert.ok(retrieveKnowledge('这部片叫什么？',undefined,['你给电影配过乐吗？','那是哪一年？']).some(n=>n.id==='film'));
});
test('broad conversation reaches interests, colleagues, writing and musical humour',()=>{
 for(const[q,id]of[['除了音乐你还喜欢研究什么？','interests'],['你认识李斯特吗？','colleagues'],['你写过书和报纸文章吗？','writing'],['你有没有比赛失利过？','setbacks'],['乌龟的音乐为什么好笑？','musical-jokes']])assert.ok(retrieveKnowledge(q).some(n=>n.id===id),q);
});
test('the screenshot Paris prompt has several distinct angles available',()=>{
 const ids=retrieveKnowledge('你在巴黎的生活是什么样的？','paris').map(n=>n.id);
 assert.ok(ids.includes('paris-network'));assert.ok(ids.includes('writing'));
});
test('unrelated questions no longer get a compulsory birth and Carnival paragraph',()=>{
 const ids=retrieveKnowledge('和弦是什么意思？').map(n=>n.id);
 assert.ok(!ids.includes('person'));assert.ok(!ids.includes('carnival'));assert.ok(ids.includes('scene'));
});
test('more-about-Paris retrieves fresh facets instead of facts already told',()=>{
 const n=retrieveKnowledge('除了教堂和教课，还有呢？',undefined,['你在巴黎的生活是什么样的？'],['我在玛德莱娜教堂演奏管风琴，教过福雷，也创立了音乐协会。我给报纸写音乐评论，编辑其他人的乐谱。']);
 assert.ok(n.some(x=>x.id==='interests'||x.id==='colleagues'));
 assert.ok(!n.some(x=>x.id==='writing'));
});
test('the composing-difficulty question retrieves relevant evidence and musical reasoning',()=>{
 const notes=retrieveKnowledge('你写的时候遇过什么困难嘛？');
 assert.ok(notes.some(n=>n.id==='opera-obstacles'));assert.ok(notes.some(n=>n.id==='composing-choices'));
});
