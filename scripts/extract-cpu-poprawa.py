import zipfile,io,json,sys,xml.etree.ElementTree as E
from pathlib import Path
from pypdf import PdfReader
archive=Path(sys.argv[1]);out=Path('source/cpu-poprawa');out.mkdir(parents=True,exist_ok=True)
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def text(p):
 return ''.join((n.text or '') if n.tag.endswith('}t') else '\n' if n.tag.endswith(('}br','}cr')) else '' for n in p.iter())
docs=[]
with zipfile.ZipFile(archive) as z:
 for member in z.infolist():
  if member.is_dir():continue
  name=Path(member.filename).name
  if name!=member.filename:raise ValueError('Nested path')
  raw=z.read(member);(out/name).write_bytes(raw);rows=[]
  if name.lower().endswith('.pdf'):
   lines='\n'.join(p.extract_text() for p in PdfReader(io.BytesIO(raw)).pages).splitlines()
  else:
   with zipfile.ZipFile(io.BytesIO(raw)) as doc:
    tree=E.fromstring(doc.read('word/document.xml'))
    lines=[text(p).strip() for p in tree.findall('.//w:p',ns) if text(p).strip()]
    rows=[['\n'.join(text(p) for p in cell.findall('.//w:p',ns)).strip() for cell in row.findall('w:tc',ns)] for row in tree.findall('.//w:tr',ns)]
  docs.append({'file':name,'lines':lines,'rows':rows})
Path('data/cpu-poprawa-extracted.json').write_text(json.dumps(docs,ensure_ascii=False,indent=2),encoding='utf8')
for i,d in enumerate(docs):print(i,d['file'],len(d['lines']),'lines',len(d['rows']),'rows',repr('\n'.join(d['lines'])[:350]))
