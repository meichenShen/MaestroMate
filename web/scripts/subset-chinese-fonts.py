from pathlib import Path
from fontTools.ttLib import TTCollection
from fontTools import subset
import argparse
parser=argparse.ArgumentParser(description="Rebuild renamed SC font subsets. Requires fonttools[woff] and Noto CJK TTC regular/bold source fonts; runtime builds do not require these tools.")
parser.add_argument('--font-dir',type=Path,default=Path('/usr/share/fonts/opentype/noto'))
font_dir=parser.parse_args().font_dir
root=Path(__file__).resolve().parents[1]
chars=set()
for lead in range(0xA1,0xF8):
 for tail in range(0xA1,0xFF):
  try: chars.update(bytes([lead,tail]).decode('gb2312'))
  except UnicodeDecodeError: pass
for p in (root/'src/i18n').glob('*.json'): chars.update(p.read_text())
chars.update(chr(i) for i in range(0x3000,0x3040))
# Keep Latin in the existing fonts. This SC subset covers GB2312 plus UI glyphs;
# less common AI/user characters continue through the normal system fallback.
chars={c for c in chars if ord(c)>255}
for weight,name in [('Regular','400'),('Bold','700')]:
 font=TTCollection(str(font_dir/('NotoSansCJK-'+weight+'.ttc'))).fonts[2]
 opts=subset.Options();opts.flavor='woff2';opts.layout_features=['*']
 sub=subset.Subsetter(options=opts);sub.populate(text=''.join(chars));sub.subset(font)
 # Give this modified subset its own family name (OFL reserved-name rule).
 for record in font['name'].names:
  if record.nameID in (1,4,6,16,17):
   value={'1':'Maestro Chinese','4':'Maestro Chinese '+weight,'6':'MaestroChinese-'+weight,'16':'Maestro Chinese','17':weight}[str(record.nameID)]
   record.string=value.encode(record.getEncoding(),errors='replace')
 font.flavor='woff2';out=root/'public/fonts'/('MaestroChinese-'+name+'.woff2');font.save(out);print(out,out.stat().st_size)
