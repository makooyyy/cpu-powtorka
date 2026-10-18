import json,re
from pathlib import Path
docs=json.loads(Path('data/monitory-extracted.json').read_text(encoding='utf-8-sig'))
records=[]
for i,d in enumerate(docs):
 pairs=[]
 if d['rows']:
  for row in d['rows']:
   if not any(c.strip() for c in row):continue
   cells=[c.strip() for c in row]
   if len(cells)==3 and not cells[0]:cells=cells[1:]
   if re.fullmatch(r'\d+\.?',cells[0]):cells=cells[1:]
   if cells[0].lower().strip('.') in ['lp','l.p','pytanie','pytania']:continue
   assert len(cells)==2,(i,cells)
   pairs.append(cells)
 elif i==10:pairs=[l.split('\n',1) for l in d['lines']]
 elif i in [9,13,15]:
  for line in d['lines']:
   if line=='PYTANIA':continue
   if line.startswith('- '):pairs[-1][1]+=('\n' if pairs[-1][1] else '')+line[2:];continue
   p=re.split(r'\s+[–—]\s+',line,maxsplit=1)
   if len(p)==1:p.append('')
   pairs.append(p)
 elif i==19:
  for line in d['lines'][1:]:
   if re.match(r'^\d+\.',line) or line=='co to są Hz':
    if line.startswith('13.'):
     q,a=line.split('PDP-',1);pairs.append([q+'PDP',a])
    else:pairs.append([line,''])
   else:pairs[-1][1]+=('\n' if pairs[-1][1] else '')+line
 else:
  lines=d['lines'][1:] if i in [6,16] else d['lines']
  pairs=[lines[n:n+2] for n in range(0,len(lines),2)]
  if len(pairs[-1])==1:pairs[-1].append('')
 name=re.sub(r'\.docx$','',d['file'],flags=re.I)
 name=re.sub(r'_?monitory','',name,flags=re.I)
 if name.lower()=='bartekswoboda':name='Bartek Swoboda'
 author=re.sub(r'[_-]+',' ',name).title()
 for n,(q,a) in enumerate(pairs,1):
  q=re.sub(r'^\d+\.\s*','',q).strip()
  a=re.sub(r'^(?:Odpowiedz|Odpowiedź|Odp)\.?\s*','',a,flags=re.I).strip()
  assert q,(i,n)
  records.append(dict(id=f'mon-s{i:02}-{n:02}',file=d['file'],number=n,question=q,answer=a,author=author,subjectId='monitory'))
 print(i,d['file'],len(pairs))
Path('data/monitory-records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
Path('data/monitory-audit.txt').write_text('\n'.join(r['id']+' | '+re.sub(r'\s+',' ',r['question'])+' | '+re.sub(r'\s+',' ',r['answer']) for r in records),encoding='utf8')
print('TOTAL',len(records))
