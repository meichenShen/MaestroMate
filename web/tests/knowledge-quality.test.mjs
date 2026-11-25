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
