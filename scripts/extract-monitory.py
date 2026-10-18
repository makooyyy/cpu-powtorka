import zipfile,io,json,sys,xml.etree.ElementTree as E
from pathlib import Path

archive=Path(sys.argv[1]) if len(sys.argv)>1 else Path('Monitory pytania.zip')
out=Path('source/monitory');out.mkdir(parents=True,exist_ok=True)
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def text(p):
 return ''.join((n.text or '') if n.tag.endswith('}t') else '\n' if n.tag.endswith(('}br','}cr')) else '' for n in p.iter())
docs=[]
with zipfile.ZipFile(archive) as z:
 for member in z.infolist():
  if member.is_dir():continue
  name=Path(member.filename).name
  if name!=member.filename:raise ValueError('Unexpected nested archive path')
  raw=z.read(member);(out/name).write_bytes(raw)
  with zipfile.ZipFile(io.BytesIO(raw)) as doc:
   if 'word/document.xml' in doc.namelist():
    tree=E.fromstring(doc.read('word/document.xml'))
    lines=[text(p).strip() for p in tree.findall('.//w:p',ns) if text(p).strip()]
    rows=[['\n'.join(text(p) for p in cell.findall('.//w:p',ns)).strip() for cell in row.findall('w:tc',ns)] for row in tree.findall('.//w:tr',ns)]
   else:
    tree=E.fromstring(doc.read('content.xml'));lines=[''.join(p.itertext()).strip() for p in tree.iter() if p.tag.endswith('}p')];rows=[]
  docs.append({'file':name,'lines':lines,'rows':rows})
Path('data/monitory-extracted.json').write_text(json.dumps(docs,ensure_ascii=False,indent=2),encoding='utf8')
for i,d in enumerate(docs):print(i,d['file'],len(d['lines']),'lines',len(d['rows']),'rows',repr('\n'.join(d['lines'])[:550]))

