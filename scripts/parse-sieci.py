import json,re
from pathlib import Path
docs=json.loads(Path('data/sieci-extracted.json').read_text(encoding='utf8'))
records=[]
for i,d in enumerate(docs):
 pairs=[]
 if d['rows']:
  for row in d['rows']:
   cells=[c.strip() for c in row if c.strip()]
   if not cells:continue
   if i==22 and cells[0]=='Zadania':continue # Footer metadata, not a question.
   if re.fullmatch(r'\d+[.]?',cells[0]):cells=cells[1:]
   if cells and cells[0].lower() in ['lp.','lp','l.p','pytania','pytanie']:continue
   if len(cells)==1:
    assert i==22 and cells[0].startswith('Zadania'),(i,cells)
    continue
   assert len(cells)==2,(i,cells)
   pairs.append(cells)
 elif i==10:
  pairs=[line.split('\n',1) for line in d['lines']]
 elif i==11:
  for line in d['lines'][1:]:
   if re.match(r'^\d+\.',line):pairs.append(re.split(r'\s*[-–]\s*odp:\s*',line,maxsplit=1,flags=re.I))
   else:pairs[-1][1]+=' '+line
 elif i in [8,13,15]:
  lines=d['lines'][1:] if i==15 else d['lines']
  pairs=[re.split(r'\s+[–-]\s+',line,maxsplit=1) for line in lines]
 elif i==21:
  for line in d['lines']:
   m=re.search(r'\?|to:',line)
   assert m,line
   pairs.append([line[:m.end()],line[m.end():].strip()])
 else:
  lines=d['lines'][1:] if i in [5,16,19] else d['lines']
  assert len(lines)%2==0,(i,len(lines))
  pairs=[lines[n:n+2] for n in range(0,len(lines),2)]
 name=re.sub(r'\.docx$','',d['file'],flags=re.I)
 name=re.sub(r'^Pytania\.docx\s*','',name,flags=re.I)
 author=re.sub(r'[_-]+',' ',name).title()
 for n,pair in enumerate(pairs,1):
  assert len(pair)==2,(i,n,pair)
  q,a=pair
  q=re.sub(r'^\d+\.\s*','',q).strip()
  a=re.sub(r'^(?:Odp\.|Odpowiedz)\s*','',a,flags=re.I).strip()
  assert q and a,(i,n,pair)
  records.append({'id':f'net1-s{i:02}-{n:02}','file':d['file'],'number':n,'question':q,'answer':a,'author':author,'subjectId':'sieci-1'})
 print(i,d['file'],len(pairs))
Path('data/sieci-records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
Path('data/sieci-audit.txt').write_text('\n'.join(r['id']+' | '+re.sub(r'\s+',' ',r['question'])+' | '+re.sub(r'\s+',' ',r['answer']) for r in records),encoding='utf8')
print('TOTAL',len(records))
