import ui from './ui.zh.json' with {type:'json'};
import content from './content.zh.json' with {type:'json'};
export type Language='en'|'zh';
const catalog:Record<string,string>={...content,...ui,'Listen':'聆听','Chat':'对话','Play':'游玩','Program':'音乐旅程','Guide':'使用指引','Aquarium':'《水族馆》','Camille Saint-Saëns':'卡米耶·圣桑','off':'关闭','on':'开启','strong':'响','soft':'轻','empty':'空白'};
export function translate<T>(value:T,language:Language,context?:string):T {
 if(language==='en'||typeof value!=='string')return value;
 if(context==='media'&&value==='Play')return '播放' as T;
 const key=value.replace(/\s+/g,' ').trim();
 if(!key||/^[A-G]$/.test(key)||key==='English'||key==='中文')return value;
 let result=catalog[key];
 if(!result){
  const patterns:[RegExp,(m:RegExpMatchArray)=>string][]=[
   [/^Play ([A-G])$/,m=>`演奏 ${m[1]}`],
   [/^(Step|Ripple note) (\d+): (.+)$/,m=>`第 ${m[2]} ${m[1]==='Step'?'步':'个音符'}：${translate(m[3],'zh')}`],
   [/^Question (\d+) of (\d+)$/,m=>`第 ${m[1]} / ${m[2]} 题`],
   [/^Lesson (\d+) · (.+)$/,m=>`第 ${m[1]} 课 · ${translate(m[2],'zh')}`],
   [/^Next: (.+)$/,m=>`下一步：${translate(m[1],'zh')}`],
   [/^(?:Note space|Note|Step|Beat|Rhythm step|Creation beat|Demo beat) (\d+)$/,m=>`第 ${m[1]} 步`],
   [/^Choose ([A-G])$/,m=>`选择 ${m[1]}`],
   [/^([A-G]), step (\d+)$/,m=>`${m[1]}，第 ${m[2]} 步`],
   [/^Sound (on|off)$/,m=>`声音${m[1]==='on'?'开启':'关闭'}`],
   [/^Motion (on|off)$/,m=>`动画${m[1]==='on'?'开启':'关闭'}`],
   [/^(.+) · (Learn|Complete|Try \d+ \/ \d+)$/,m=>`${translate(m[1],'zh')} · ${translate(m[2],'zh')}`],
   [/^Try (\d+) \/ (\d+)$/,m=>`练习 ${m[1]} / ${m[2]}`],
   [/^(.+) · (Still yours to explore|Learned & explored)$/,m=>`${translate(m[1],'zh')} · ${translate(m[2],'zh')}`],
  ];
  for(const [pattern,format]of patterns){const match=key.match(pattern);if(match){result=format(match);break}}
 }
 if(!result && key.startsWith('← Back to '))result='← 返回'+translate(key.slice(10),'zh');
 if(!result && key.includes(' · ')){const parts=key.split(' · ');const localized=parts.map(p=>translate(p,'zh'));if(localized.some((p,i)=>p!==parts[i]))result=localized.join(' · ')}
 if(!result)return value;
 return (value.match(/^\s*/)?.[0]+result+(value.match(/\s*$/)?.[0]||'')) as T;
}
export const hasTranslation=(value:string)=>Object.hasOwn(catalog,value.replace(/\s+/g,' ').trim());
