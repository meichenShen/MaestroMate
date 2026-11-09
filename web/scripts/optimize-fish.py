"""Repack the CC0 glTF fish with resized WebP textures; geometry is unchanged.
Use only for this model. Source: Khronos glTF-Sample-Assets BarramundiFish.
"""
from pathlib import Path
from PIL import Image
import io,json,struct,hashlib
root=Path(__file__).resolve().parents[1]
source=root/'.tmp/modern-render/barramundi-original.glb'
target=root/'public/models/barramundi.glb'
if not source.exists():source.write_bytes(target.read_bytes())
raw=source.read_bytes();size=struct.unpack_from('<I',raw,12)[0]
data=json.loads(raw[20:20+size]);binary=raw[28+size:]
images={im['bufferView']:i for i,im in enumerate(data['images'])}
output=bytearray()
for index,view in enumerate(data['bufferViews']):
 offset=view.get('byteOffset',0);blob=binary[offset:offset+view['byteLength']]
 if index in images:
  image=Image.open(io.BytesIO(blob));image.thumbnail((1024,1024));buffer=io.BytesIO();image.save(buffer,'WEBP',quality=93,method=6);blob=buffer.getvalue()
  data['images'][images[index]]['mimeType']='image/webp'
 view['byteOffset']=len(output);view['byteLength']=len(blob);output.extend(blob);output.extend(b'\0'*(-len(output)%4))
for tex in data['textures']:tex['extensions']={'EXT_texture_webp':{'source':tex.pop('source')}}
data['extensionsUsed']=['EXT_texture_webp'];data['extensionsRequired']=['EXT_texture_webp'];data['buffers'][0]['byteLength']=len(output)
meta=json.dumps(data,separators=(',',':')).encode();meta+=b' '*(-len(meta)%4)
result=struct.pack('<III',0x46546c67,2,12+8+len(meta)+8+len(output))+struct.pack('<II',len(meta),0x4e4f534a)+meta+struct.pack('<II',len(output),0x004e4942)+output
target.write_bytes(result)
print(json.dumps({'source_bytes':len(raw),'optimized_bytes':len(result),'source_sha256':hashlib.sha256(raw).hexdigest(),'optimized_sha256':hashlib.sha256(result).hexdigest()}))
print([(a.get('min'),a.get('max'))for a in data['accessors']if a['type']=='VEC3'])
