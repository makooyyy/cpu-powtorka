'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),write=(f,v)=>fs.writeFileSync(path.join(root,f),v);
const raw=JSON.parse(read('data/cpu-poprawa-records.json')),old=JSON.parse(read('data/cpu.json'));
const lines=read('data/cpu-poprawa-concepts.txt').trim().split(/\r?\n/).map(l=>l.split(' '));
const choices=new Map(read('data/cpu-poprawa-distractors.txt').trim().split(/\r?\n/).map(l=>{const[k,...v]=l.split('|');if(v.length!==3)throw Error(k);return[k,v];}));
for(const l of read('data/cpu-poprawa-refined.txt').trim().split(/\r?\n/)){const[k,...v]=l.split('|');if(v.length!==3)throw Error(k);choices.set(k,v);}
const reasons={
 importance:"Nie ma jednego obiektywnie najważniejszego elementu procesora. Wskazanie ALU wymaga kontekstu konkretnego schematu lub materiału z lekcji.",...JSON.parse(read('data/review-reasons.json')),
 alupart:'Definicja ALU pomija operacje logiczne. Nie dopisano ich do oryginalnego klucza; odpowiedź wymaga uzupełnienia przez autora.',
 short:'Odpowiedź jest urwana, zbyt ogólna albo nie podaje istotnego elementu definicji. Zachowano oryginał bez dopisywania poprawnego klucza.',
 levelcount:'Liczba poziomów cache zależy od konkretnej architektury. Trzy poziomy są częste, ale nie stanowią uniwersalnej reguły dla wszystkich komputerów.',
 riscspell:'Rozwinięcie RISC zawiera „Reducted”, podczas gdy standardowy wyraz to „Reduced”. Klucz wymaga korekty autora.',
 cacheword:'Pamięć cache jest pamięcią podręczną, nie „szybkością pamięci”. W pliku pomylono definicję z parametrem.',
 cachewrong:'Odpowiedź miesza obsługę cache i pamięci wirtualnej. Fragment o cache nie wskazuje jednoznacznie sposobu zarządzania.',
 l2model:'Położenie pamięci L2 zależy od generacji i konstrukcji procesora. Brakuje modelu lub kontekstu historycznego.',
 htspell:'Odpowiedź „Hyper trading” nie jest rozwinięciem technologii Hyper-Threading. Oryginalny klucz zachowano do omówienia.',
 ciscslow:'Architektura CISC sama w sobie nie oznacza powolnego wykonania. Odpowiedź przedstawia uproszczone porównanie jako bezwarunkową regułę.',
 compare:'Porównanie szybkości pamięci i procesora wymaga określenia parametru oraz urządzeń. Sama odpowiedź nie daje jednoznacznego kryterium.',
 romcontext:'Pytanie wymaga kontekstu konkretnego schematu sterowania lub prezentacji. Nie każda jednostka sterująca zawiera taki sam ROM.',
 binary:'Pytanie ma dwie odpowiedzi logiczne albo sam klucz tak/nie. Zachowano je w trybie bez oceny zamiast tworzyć trzy sztuczne warianty.',
 mooregeneral:'Prawo Moore’a dotyczy trendu liczby tranzystorów. Nie jest uniwersalną gwarancją rozwoju wszystkich parametrów komputera.',
 grapheneclaim:'Opis właściwości grafenu jest niepełny lub zbyt ogólny. Porównania przewodnictwa i wytrzymałości wymagają warunków pomiaru, a sama obecność węgla nie definiuje grafenu.',
 analogy:'To pytanie opiera się na metaforze kierownika i robotnika. Dwa metaforyczne warianty nie tworzą jednoznacznego testu z czterema odpowiedziami.',
 resetcause:'Samoczynny restart ma wiele możliwych przyczyn, np. zasilanie, pamięć, sterowniki lub temperaturę. Bez diagnostyki nie można wskazać jednej.',
 busdefinition:'Odpowiedź wymienia zawartość przesyłaną magistralą zamiast definiować samą magistralę. Pytanie wymaga doprecyzowania.',
 osinstruction:'Rozkaz maszynowy nie musi pochodzić od systemu operacyjnego. Może należeć do programu użytkownika; podana definicja jest zbyt wąska.',
 ircycle:'Rejestr IR przechowuje kod rozkazu, nie cykl instrukcji. W odpowiedzi pomieszano te pojęcia.',
 cachefast:'Rejestry procesora zwykle mają krótszy dostęp niż cache. Nie można uznać cache za bezwarunkowo najszybszą pamięć całego komputera.',
 acronym:'Rozwinięcie skrótu urywa się na słowie „Set” i pomija „Computer”. Nie dopisano brakującego wyrazu do odpowiedzi źródłowej.',
 riscexample:'Rodzaj urządzenia nie wskazuje jednoznacznie architektury instrukcji. Trzeba podać konkretny procesor lub architekturę.',
 ciscopt:'Duża lista instrukcji nie oznacza małej optymalizacji. Podany opis miesza cechę zestawu instrukcji z oceną implementacji.',
 battery:'AX oznacza akumulator jako rejestr procesora, a nie baterię. Oryginalną odpowiedź pozostawiono do omówienia.',
 transistorcount:'Liczba tranzystorów różni się między procesorami o wiele rzędów wielkości. Nie ma jednej liczby dla całej klasy urządzeń.',
 photowording:'Fotolitografia służy do odwzorowania wzorów struktur, a nie nanoszenia monokryształu krzemu. Pytanie myli etapy produkcji.',
 current_socket:'Sformułowanie „obecnie Intel” nie określa modeli ani segmentu. AM5 jest LGA, lecz nie opisuje wszystkich obudów procesorów Intel.',
 tdpword:'Odpowiedź myli moc cieplną procesora z mocą pobieraną przez chłodzenie. Wymaga wyjaśnienia, a nie automatycznego uznania za poprawny klucz.',
 am5word:'AM5 to platforma/gniazdo, a nie nazwa generacji procesorów. Pytanie i odpowiedź używają różnych kategorii pojęć.',
 tdpmax:'TDP nie jest bezwarunkową maksymalną mocą procesora. Pobór w trybie Turbo może przekraczać wartość projektową; potrzebne są warunki pracy.'
};
const norm=s=>s.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9]/g,'');
const clean=s=>s.replace(/\s+/g,' ').trim();
const qBySource=new Map(old.questions.map(q=>[q.sourceId,q]));
const bank=new Map();for(const s of old.sources){const q=qBySource.get(s.id);if(q){if(!bank.has(s.concept))bank.set(s.concept,[]);bank.get(s.concept).push({s,q});}}
const custom=fs.existsSync(path.join(root,'data/cpu-poprawa-overrides.json'))?JSON.parse(read('data/cpu-poprawa-overrides.json')):{};
const style=(t,a)=>{t=t.replace(/[.!;?,]+$/,'');if(!/^[A-Z]{2}/.test(t)){if(/^[a-ząćęłńóśźż]/.test(a))t=t[0].toLocaleLowerCase('pl')+t.slice(1);else t=t[0].toLocaleUpperCase('pl')+t.slice(1);}return t+(a.match(/[.!;?,]+$/)?.[0]||'');};
const questions=[],issues=[],sources=[];
for(let f=0;f<23;f++){
 const rows=raw.filter(r=>r.id.startsWith('cpur-s'+String(f).padStart(2,'0')+'-'));if(rows.length!==lines[f].length)throw Error('Coverage '+f);
 rows.forEach((r,i)=>{
  r={...r,concept:lines[f][i]};sources.push(r);const k=r.concept,a=clean(r.answer);
  if(k.startsWith('!')){const reason=reasons[k.slice(1)];if(!reason)throw Error('Missing reason '+k);r.status='review';issues.push({id:'review-'+r.id,subjectId:'cpu-poprawa',reason,records:[r]});return;}
  let wrong=choices.get(k),category='CPU — podstawy';
  if(!wrong){let candidates=bank.get(k);if(!candidates)throw Error('Missing '+k);candidates=[...candidates].sort((x,y)=>{const score=z=>(norm(z.s.answer)===norm(a)?10000:0)+(norm(z.s.question)===norm(r.question)?100:0)-Math.abs(clean(z.s.answer).length-a.length);return score(y)-score(x);});const q=candidates[0].q;wrong=q.options.filter(o=>o.id!==q.correctOptionId).map(o=>o.text);category=q.category;}
  // Source-shaped numeric choices keep units and sentence form consistent.
  const numbers={bytes32:['4',['2','8','16']],bytes64:['8',['4','16','32']],bytes96:['12',['8','16','24']],threads8:['8',['4','6','16']],moore_year:['1965',['1955','1975','1985']]};
  if(numbers[k]&&a.includes(numbers[k][0]))wrong=numbers[k][1].map(n=>a.replace(numbers[k][0],n));
  const labels={fastest:['L1',['L2','L3','L4']],largest:['L3',['L1','L2','L4']],slowest_cache:['L3',['L1','L2','L4']],cpu:['Central Processing Unit',['Central Program Utility','Control Processing Unit','Central Peripheral Unit']],alu_en:['Arithmetic Logic Unit',['Arithmetic Load Unit','Address Logic Unit','Advanced Logic Unit']],tdp_en:['Thermal Design Power',['Thermal Dissipation Performance','Total Design Power','Thermal Dynamic Power']],speed_vendor:['Intel',['AMD','IBM','VIA']],ht_vendor:['Intel',['AMD','IBM','VIA']],cool_vendor:['AMD',['Intel','IBM','VIA']]};
  if(labels[k]){const [from,vals]=labels[k],re=new RegExp(from,'i');if(re.test(a))wrong=vals.map(v=>a.replace(re,v));}
  if(k==='turbo')wrong=a.length<55?['Zwiększa liczbę wątków aktywnego rdzenia','Podnosi stałą częstotliwość bazową CPU','Obniża zegar po osiągnięciu limitu temperatury']:['Automatycznie zwiększa liczbę wątków logicznych, gdy procesor jest bardziej obciążony','Podnosi częstotliwość bazową na stałe i utrzymuje ją również po spadku obciążenia','Po osiągnięciu limitu temperatury zwiększa częstotliwość rdzeni ponad wartość bazową'];
  if(k==='turbo'&&/^automatycznie/i.test(a))wrong=['Automatycznie zwiększa liczbę wątków logicznych przy wzroście obciążenia','Automatycznie podnosi bazowe taktowanie na stałe po wzroście obciążenia','Automatycznie zwiększa taktowanie po osiągnięciu limitu temperatury'];
  wrong=require('./cpu-poprawa-forms.cjs')(k,a,r.question,wrong);
  if(custom[r.id])wrong=custom[r.id];wrong=wrong.map(t=>style(t,a));
  const first=t=>t.toLocaleLowerCase('pl').match(/[\p{L}\p{N}]+/u)?.[0];
  if(first(wrong[0])===first(wrong[1])&&first(wrong[1])===first(wrong[2])&&first(a)!==first(wrong[0]))throw Error('Review repeated prefix: '+r.id+' '+wrong.join(' | '));
  r.status='ready';r.questionId=r.id;
  questions.push({id:r.id,subjectId:'cpu-poprawa',question:clean(r.question)+' ('+r.author+')',options:[{id:'correct',text:a},...wrong.map((text,i)=>({id:'d'+(i+1),text}))],correctOptionId:'correct',category,sourceId:r.id,sources:[r.id],author:r.author});
 });
}
require('../core.js').validate(questions);
const meta={version:1,sourceFiles:23,sourceRecords:sources.length,readyQuestions:questions.length,reviewRecords:issues.length,reviewGroups:issues.length,mergedRecords:0};
write('data/cpu-poprawa.json',JSON.stringify({meta,questions,issues,sources},null,2));
write('data/cpu-poprawa-options-audit.txt',questions.map(q=>q.id+' | '+q.question+'\n'+q.options.map(o=>(o.id==='correct'?'✓ ':'  ')+o.text).join('\n')).join('\n\n'));
console.log(meta);
