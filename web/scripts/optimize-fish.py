"""Prepare the texture-free CC0 fish used in the designed 3D scene.
Geometry is copied byte-for-byte from the fixed Khronos/Microsoft asset.
No Pillow, model converters, or large model cache is required at runtime.
"""
import hashlib,json,struct
from pathlib import Path
from urllib.request import urlopen
root=Path(__file__).resolve().parents[1]
url='https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/8f492390ddc7a2ae221a1369ef560589cf8c70fb/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb'
raw=urlopen(url,timeout=30).read()
assert hashlib.sha256(raw).hexdigest()=='ecc3bafb6b00f2c8b810863c388e3768a7b7ea0d0335e8cb8c574c266e571f4a'
length=struct.unpack_from('<I',raw,12)[0];data=json.loads(raw[20:20+length]);binary=raw[28+length:];image_views={item['bufferView']for item in data.get('images',[])}
output=bytearray();views=[];remap={}
for index,view in enumerate(data['bufferViews']):
 if index in image_views:continue
 blob=binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']];remap[index]=len(views);views.append({**view,'byteOffset':len(output)});output.extend(blob);output.extend(b'\0'*(-len(output)%4))
for accessor in data['accessors']:
 if 'bufferView'in accessor:accessor['bufferView']=remap[accessor['bufferView']]
data['bufferViews']=views;data['buffers'][0]['byteLength']=len(output)
data['materials']=[{'name':'MaestroMate designed matte surface','pbrMetallicRoughness':{'baseColorFactor':[.2706,.851,.992,1],'metallicFactor':.08,'roughnessFactor':.44}}]
for key in ['images','textures','samplers','extensionsUsed','extensionsRequired']:data.pop(key,None)
meta=json.dumps(data,separators=(',',':')).encode();meta+=b' '*(-len(meta)%4)
result=struct.pack('<III',0x46546c67,2,12+8+len(meta)+8+len(output))+struct.pack('<II',len(meta),0x4e4f534a)+meta+struct.pack('<II',len(output),0x004e4942)+output
(root/'public/models/barramundi.glb').write_bytes(result)
print(json.dumps({'source_bytes':len(raw),'website_bytes':len(result),'sha256':hashlib.sha256(result).hexdigest()}))
