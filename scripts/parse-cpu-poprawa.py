import json,re,unicodedata,difflib
from pathlib import Path
docs=json.loads(Path('data/cpu-poprawa-extracted.json').read_text(encoding='utf8'));records=[]
def stripnum(s):return re.sub(r'^\d+[.)]\s*','',s.strip())
for i,d in enumerate(docs):
 pairs=[]
 if d['rows']:
  for row in d['rows']:
   cells=[c.strip() for c in row]
   if len(cells)==3:cells=cells[1:]
   if not any(cells) or cells[0].lower() in ['pytanie','pytania']:continue
   assert len(cells)==2,(i,cells)
   if not cells[0] and not cells[1]:continue
   pairs.append(cells)
 elif i in [11,14,16,17,19]:
  lines=d['lines']
  if i in [17,19]:lines=re.split(r'(?<!\d)(?=\b\d+\.\s)', ' '.join(lines))[1:]
  for line in lines:
   if i==14:
    if line in ['Pytania i odpowiedzi','CPU']:continue
    p=re.split(r'\s*[-–]\s*odp:\s*',line,maxsplit=1,flags=re.I)
   else:p=re.split(r'\s+[-–]\s+',line,maxsplit=1)
   assert len(p)==2,(i,line)
   pairs.append(p)
 elif i==13:
  lines=d['lines'];j=0
  while j<len(lines):
   p=lines[j].split('\n',1)
   if len(p)==1:j+=1;p.append(lines[j])
   pairs.append(p);j+=1
 else:
  lines=d['lines'][1:] if i in [6,8,21] else d['lines']
  assert len(lines)%2==0,(i,len(lines))
  pairs=[lines[n:n+2] for n in range(0,len(lines),2)]
 name=re.sub(r'(\.docx)+$|\.pdf$','',d['file'],flags=re.I)
 name=re.sub(r'[_ ]*pytania cpu$|[_ ]*CPU$','',name,flags=re.I).replace('PatrykWitczak','Patryk Witczak')
 author=re.sub(r'[_.]+',' ',name).title()
 for n,(q,a) in enumerate(pairs,1):
  q=stripnum(q);a=re.sub(r'^(?:Odpowiedz|Odpowiedź|Odp)(?:\.?\s+)','',a.strip(),flags=re.I)
  assert q,(i,n)
  records.append(dict(id=f'cpur-s{i:02}-{n:02}',file=d['file'],number=n,question=q,answer=a,author=author,subjectId='cpu-poprawa'))
 print(i,d['file'],len(pairs))
Path('data/cpu-poprawa-records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
Path('data/cpu-poprawa-audit.txt').write_text('\n'.join(r['id']+' | '+re.sub(r'\s+',' ',r['question'])+' | '+re.sub(r'\s+',' ',r['answer']) for r in records),encoding='utf8')
print('TOTAL',len(records))
