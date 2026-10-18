'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),write=(f,v)=>fs.writeFileSync(path.join(root,f),v);
const records=JSON.parse(read('data/monitory-records.json'));
const concepts=read('data/monitory-concepts.txt').trim().split(/\r?\n/).map(x=>x.split(' '));
const choices=new Map(read('data/monitory-distractors.txt').trim().split(/\r?\n/).map(l=>{const[k,...v]=l.split('|');if(v.length!==3)throw Error(k);return[k,v];}));
const reasons={
io:'Zwykły monitor jest urządzeniem wyjściowym. Funkcja wejściowa wymaga np. ekranu dotykowego, którego pytanie nie wymienia.',
pixel_contrast:'Mniejszy piksel może zwiększać szczegółowość przy porównywalnych warunkach, ale sam rozmiar piksela nie wyznacza kontrastu.',
subpixel:'Odpowiedź miesza pojedynczy subpiksel z całym pikselem RGB. Jeden subpiksel odpowiada jednej składowej barwnej.',
all_colors:'Trzy składowe RGB nie gwarantują wszystkich widzialnych barw. Dostępny zakres zależy od gamutu i głębi koloru urządzenia.',
inventor:'Odpowiedź przypisuje wynalazek monitora CRT Crookesowi. Trzeba odróżnić lampę Crookesa od kineskopu i późniejszego monitora; Braun opisał swoją lampę w 1897 r.',
rotation_cause:'Sam upadek nie pozwala ustalić przyczyny obróconego obrazu. Brakuje opisu usterki lub kontekstu diagnostycznego.',
best:'Brakuje kryterium porównania i konkretnych urządzeń. Nie można wybrać jednej uniwersalnie najlepszej technologii lub złącza.',
led_scope:'Nazwa LED bywa używana dla LCD z podświetleniem LED oraz ekranów bezpośrednio emisyjnych. Pytanie nie rozróżnia tych konstrukcji.',
oled_material:'Organiczne materiały OLED nie muszą być polimerami. Istnieją także OLED oparte na małych cząsteczkach; zapis w pliku jest zbyt wąski.',
oled_typo:'W kluczowej definicji zapisano „ograniczona” zamiast „organiczna”. Nie zmieniono odpowiedzi autora w punktowany klucz.',
shape:'Odpowiedź utożsamia cały kineskop z kulą. Opis krzywizny powierzchni ekranu wymaga odróżnienia od kształtu całej lampy.',
binary:'To pytanie ma formę dwuwariantową lub samą odpowiedź „tak/nie”. Zachowano je do omówienia, zamiast dodawać trzy sztuczne, nieporównywalne warianty.',
temperature:'Definicja temperatury barwowej jest zbyt ogólna. Nie określa odniesienia do barwy promieniowania ciała czarnego ani jednostki K.',
shape_angles:'Podane kąty nie opisują kształtu ekranu. Pytanie miesza kształt z parametrami odchylania wiązki.',
trinitron:'Odpowiedź opisuje krzywiznę ekranu, a nie zasadniczą konstrukcję Trinitron z maską szczelinową. Wymaga doprecyzowania.',
hdmi_crt:'Kategoryczna odpowiedź pomija konwertery oraz konkretne wejścia urządzenia. Trzeba wskazać model i sposób połączenia.',
area_equal:'Dla tej samej przekątnej formaty 16:9 i 16:10 mają różne powierzchnie. Podana równość jest nieprawidłowa.',
color_count:'Liczba wyświetlanych kolorów zależy od głębi sygnału i konstrukcji urządzenia. Pytanie nie określa potrzebnych parametrów.',
contrast_types:'Kontrast statyczny i dynamiczny opisują sposób pomiaru/sterowania, a nie podział na zdjęcia i filmy. Odpowiedź błędnie utożsamia te pojęcia.',
compete:'Nie określono kryterium konkurencyjności CRT i LCD. Sama odpowiedź „tak” nie daje jednoznacznego klucza wiedzy.',
temperature_wrong:'Odpowiedź definiuje OLED, a pytanie dotyczy temperatury barwowej. To niezgodność pytania z odpowiedzią.',
matte_absolute:'Matowa powierzchnia także odbija światło, ale je rozprasza. Stwierdzenie, że wcale nie odbija, jest niepoprawne.',
pixel_size:'Rozmiar piksela zależy od przekątnej, rozdzielczości i konstrukcji. Podany zakres nie jest uniwersalną granicą.',
chromaclear:'Opis „kratowa siatka” jest zbyt ogólny, aby jednoznacznie rozpoznać konstrukcję CromaClear.',
mask_definition:'Odpowiedź opisuje wrażenie krzywizny, a nie siatkę maskującą. Nie odpowiada na zadane pytanie.',
tv_vague:'Telewizory korzystają z różnych technologii. Należałoby wskazać telewizor kineskopowy, aby porównanie było jednoznaczne.',
flicker_only:'Migotanie może występować także w innych technologiach, np. przy modulacji podświetlenia. Sam podział CRT/LCD nie wystarcza.',
model:'Wartość lub porównanie zależy od konkretnego modelu, ustawień i warunków pomiaru. W pytaniu ich nie określono.',
oled_pixel:'Nie należy utożsamiać całego kolorowego piksela OLED z jedną diodą. Układ subpikseli zależy od konstrukcji panelu.',
oled_dead:'Martwy piksel, uszkodzone sterowanie i trwałe wypalenie to różne zjawiska. Odpowiedź sprowadza je do jednego.',
radiation:'Światło emitowane przez ekran jest promieniowaniem elektromagnetycznym. Pytanie musi określić rodzaj promieniowania zamiast mówić o jego całkowitym braku.',
geometry_absolute:'Stwierdzenie o zerowych zniekształceniach bez warunków jest zbyt kategoryczne. Trzeba określić rodzaj zniekształceń i sposób wyświetlania.',
incomplete:'Odpowiedź jest zbyt ogólna lub urwana, aby stanowić jednoznaczny klucz do tego pytania. Zachowano ją bez dopisywania treści.',
lcd_light:'Matryca LCD moduluje światło, lecz cały monitor z podświetleniem emituje je do obserwatora. Pytanie nie rozróżnia tych elementów.',
first_monitor:'Data 1958 kojarzy się z komputerem XYZ. Plik pyta jednak o pierwszy polski monitor; brak podstaw do przeniesienia tej daty na inne urządzenie.',
lcd_led:'LCD nie musi korzystać z LED; stosowano również inne źródła podświetlenia. Odpowiedź wymaga określenia konstrukcji.',
power:'Dla poboru mocy z sieci AC samo U × I oznacza moc pozorną. Do mocy czynnej potrzebny jest także współczynnik mocy.',
contrast:'Kontrast jest stosunkiem jasności, nie ich różnicą. Nie zastąpiono błędnej odpowiedzi własnym kluczem.',
dead_color:'Pytanie nie rozróżnia martwego i stale zapalonego piksela/subpiksela. Nie każda wada piksela ma czarny kolor.',
crt_pixels:'Brak stałej siatki adresowanych pikseli CRT nie oznacza braku fizycznych elementów luminoforu. Pytanie wymaga doprecyzowania pojęcia piksela.',
missing:'W pliku jest pytanie, ale brakuje odpowiedzi. Nie dopisano własnego poprawnego klucza.',
control_compare:'Nie podano, z czym porównywana jest kontrola jasności ani jaki układ podświetlenia zastosowano.',
oled_voltage:'Jasność OLED zależy od prądu i charakterystyki elementu; samo napięcie bez opisu sterowania nie stanowi pełnej odpowiedzi.',
dead_cause:'Czarny punkt może mieć różne przyczyny. Nie można utożsamić każdej usterki piksela wyłącznie z brakiem zasilania.',
crt_resolution:'Rozdzielczość CRT zależy od wielu parametrów, także pasma toru wideo i ostrości plamki. Samo odchylanie poziome nie jest pełnym kluczem.',
overclock:'Możliwość zmiany parametrów zależy od modelu i dopuszczalnych częstotliwości. Samo „tak” nie określa warunków.',
rgb_order:'Litery RGB rozwijają się kolejno Red, Green, Blue. W pliku kolejność nazw nie odpowiada kolejności liter.',
mask_material:'Metalowa maska kineskopu nie jest wykonana z plastiku, jak podano w pliku. Oryginalny błędny klucz pozostawiono do omówienia.',
white_rgb:'Nie każde podświetlenie LED składa się z trójkolorowych diod. Trzeba wskazać konstrukcję RGB LED, aby odpowiedź była jednoznaczna.'
};
const clean=s=>s.replace(/\s+/g,' ').trim();
function style(t,a){t=t.replace(/[.!;]+$/,'');if(/^[a-ząćęłńóśźż]/.test(a))t=t[0].toLocaleLowerCase('pl')+t.slice(1);else t=t[0].toLocaleUpperCase('pl')+t.slice(1);return t+(a.match(/[.!;]+$/)?.[0]||'');}
// Replace the factual core while retaining the author's sentence length and grammar.
const mutations={
crt_en:[/Cathod[e]?-Ray Tube/i,['Crystal-Ray Tube','Cathode-Raster Transistor','Cathode-Reflection Transducer']],
pdp_en:[/plasma display panel/i,['Pixel Display Processor','Plasma Digital Projector','Phosphor Display Plate']],
year1958:[/1958/,['1956','1960','1962']],
sony:[/sony/i,['Panasonic','Philips','NEC']],
tube:[/pr[oó]żni[ąa]/i,['neonem','ksenonem','argonem']],
 tube_shape:[/wycinka kul(?:ki|i)/i,['wycinka walca','wycinka stożka','płaskiej płyty']],
sub_count:[/trzech|trzy|trzecg|3/i,['dwóch','czterech','sześciu']],
plasma:[/jonizacji gazu/i,['polaryzacji światła','emisji polowej','elektroluminescencji organicznej']],
measure:[/przekątn[ąaeyj]+/i,['szerokość','wysokość','obwód']],
rgb:[/zielony|zielonego/i,['żółty','biały','czarny']],
ratio:[/4:3/,['5:4','16:9','16:10']],
inches:[/calach|cal/i,['milimetrach','punktach','centymetrach']]
};
const overrides=fs.existsSync(path.join(root,'data/monitory-overrides.json'))?JSON.parse(read('data/monitory-overrides.json')):{};
const questions=[],issues=[];
for(let f=0;f<21;f++){
 const rows=records.filter(r=>r.id.startsWith('mon-s'+String(f).padStart(2,'0')+'-'));
 if(rows.length!==concepts[f].length)throw Error('Coverage '+f);
 rows.forEach((r,i)=>{
  r.subjectId='monitory';r.concept=concepts[f][i];const key=r.concept;
  if(key.startsWith('!')){const reason=reasons[key.slice(1)];if(!reason)throw Error('Reason '+key);r.status='review';issues.push({id:'review-'+r.id,subjectId:'monitory',reason,records:[r]});return;}
  const a=clean(r.answer);let wrong=choices.get(key);
  if(key==='sub_count'||key==='sub_count_rgb'){
   const m=a.match(/trzech|trzy|trzecg|3/i);if(!m)throw Error(r.id+' count');
   const form=m[0]==='3'?['2','4','6']:/trzy/i.test(m[0])?['Dwa','Cztery','Sześć']:['dwóch','czterech','sześciu'];
   wrong=form.map(n=>a.replace(m[0],n).replace(/\s*\(RGB\)|:\s*(?:Zielony|czerwonego).*$/i,''));
  }else if(mutations[key]&&mutations[key][0].test(a))wrong=mutations[key][1].map(v=>a.replace(mutations[key][0],v));
  if(key==='pixel'){
   const m=a.match(/najmniejsz[ąa].*/i);
   if(m)wrong=['pojedynczy wiersz tworzący obraz na ekranie','najmniejsza jednostka opisu odcienia w palecie barw','pojedyncza klatka wyświetlana podczas odświeżania'].map(v=>a.slice(0,m.index)+v);
  }
  if(key==='sub_count_rgb')wrong=a.includes('Zielony')?['Z dwóch: Zielony, Czerwony','Z czterech: Zielony, Niebieski, Czerwony, Biały','Z sześciu: po dwa Zielone, Niebieskie i Czerwone']:['Z dwóch subpikseli: czerwonego (R) i zielonego (G)','Z czterech subpikseli: czerwonego (R), zielonego (G), niebieskiego (B) i białego (W)','Z sześciu subpikseli: po dwa czerwone (R), zielone (G) i niebieskie (B)'];
  if(key==='mono'&&/jednym/i.test(a))wrong=['dwóch kolorach','trzech kolorach','czterech kolorach'].map(v=>a.replace(/jednym(?: kolorze)?(?:\s*\([^)]*\))?/i,v).replace(/jedno działo elektronowe/i,'trzy działa elektronowe'));
  if(key==='color'){
   const prefix=a.match(/^(.*?\bw\s+)(?:trzech|3)/i)?.[1]||'W ';
   wrong=(a.length<50?['jednym kolorze','dwóch kolorach','czterech kolorach']:['jednym kolorze: białym','dwóch kolorach: czerwonym i zielonym','czterech kolorach: czerwonym, zielonym, niebieskim i białym']).map(v=>prefix+v);
  }
  if(key==='inches'&&/\bcal\b/i.test(a))wrong=['centymetr','punkt','milimetr'].map(v=>a.replace(/\bcal\b/i,v));
  if(key==='measure'&&/przekątnej/.test(a))wrong=['szerokości','wysokości','obwodu'].map(v=>a.replace('przekątnej',v));
  if(key==='oled_def'&&/^Organiczną/i.test(a))wrong=['Nieorganiczną diodą elektroluminescencyjną','Organiczną diodą fotodetekcyjną','Organicznym tranzystorem polowym'];
  if(key==='mono_guns'&&/jedno/i.test(a))wrong=['dwa','trzy','cztery'].map(n=>a.replace(/jedno działo elektronowe/i,n+' działa elektronowe'));
  if(key==='color_guns'&&/trzy/i.test(a))wrong=['jedno niezależne działo elektronowe','dwa niezależne działa elektronowe','cztery niezależne działa elektronowe'].map(v=>a.replace(/trzy.*działa elektronowe/i,v));
  if(key==='oled_def')wrong=['nieorganiczna dioda elektroluminescencyjna','organiczna dioda fotodetekcyjna','organiczny tranzystor polowy'].map(v=>/organiczn/i.test(a)?a.replace(/organiczn.*/i,v):v);
  if(key==='types')wrong=['CRT','LCD','rzutnik'].map((v,j)=>a.replace(j===0?/CRT/i:j===1?/LCD/i:/rzutnik|projektor/i,['CCD','CIS','skaner'][j]));
  if(key==='aspect')wrong=['Stosunek liczby pikseli w pionie do liczby pikseli w poziomie, zapisany jako para liczb','Iloczyn liczby pikseli w poziomie i liczby pikseli w pionie, wyrażony w megapikselach','Stosunek długości przekątnej ekranu do jego szerokości, zapisany jako para liczb'];
  if(key==='mask'&&/nakierowuje/i.test(a))wrong=['Reguluje liczbę elektronów emitowanych przez katodę','Skupia wiązkę elektronów przed układem odchylania','Wytwarza pole magnetyczne odchylające wiązkę'];
  if(key==='lcd'&&a.length>110)wrong=['Każdy piksel obrazu to komórka wypełniona gazem, umieszczona pomiędzy elektrodami, w której wyładowanie pobudza luminofor do świecenia','Warstwa organicznego półprzewodnika między anodą a katodą emituje światło każdego subpiksela, gdy przepływa przez nią prąd','Wiązka elektronów w szklanej lampie jest odchylana magnetycznie i pada na warstwę luminoforu, pobudzając kolejne punkty obrazu'];
  if(key==='dead_types'&&a.length>100)wrong=['Jasny piksel: stale zgaszony punkt; czarny piksel: stale zapalony punkt; subpiksel: jedna składowa RGB stale zapalona lub zgaszona','Jasny piksel: punkt przesunięty w pionie; czarny piksel: punkt przesunięty w poziomie; subpiksel: przesunięcie wszystkich składowych RGB','Jasny piksel: punkt odświeżany zbyt wolno; czarny piksel: punkt odświeżany zbyt szybko; subpiksel: zmienna częstotliwość całej klatki'];
  if(key==='resolution'&&a.length>75)wrong=['Maksymalna liczba odcieni, jaką może odtworzyć monitor. Liczba poziomów każdej z trzech składowych koloru','Maksymalna liczba klatek, jaką może wyświetlić monitor. Liczba pełnych odświeżeń ekranu w ciągu jednej sekundy','Fizyczny rozmiar aktywnej powierzchni ekranu. Szerokość i wysokość obrazu podane w jednostkach długości'];
  if(key==='response'&&a.length>110)wrong=['Czas od przekazania kompletnej klatki przez kartę graficzną do rozpoczęcia wyświetlania jej na monitorze, obejmujący buforowanie i przetwarzanie sygnału','Czas od rozpoczęcia przesyłania pierwszego wiersza obrazu przez przewód wideo do zakończenia transmisji ostatniego wiersza tej samej klatki','Czas pomiędzy rozpoczęciem dwóch kolejnych odświeżeń całego ekranu, odpowiadający odwrotności częstotliwości odświeżania monitora'];
  if(key==='gamma'&&a.length>70)wrong=['Ułatwia rozróżnianie konturów i drobnych krawędzi przez zmianę geometrii obrazu wyświetlanego na monitorze','Dostosowuje biel i pozostałe barwy do oświetlenia otoczenia przez zmianę temperatury barwowej ekranu','Zmniejsza migotanie i poprawia płynność ruchu przez zmianę częstotliwości odświeżania obrazu na ekranie'];
  if(key==='subpixel'&&a.length<25)wrong=['Składnik klatki','Wiersz obrazu','Poziom jasności'];
  if(key==='oled_con'&&a.length<50)wrong=['Silne zniekształcenia geometryczne','Wolne przełączanie ciekłych kryształów','Nierówne podświetlenie krawędziowe'];
  if(key==='axes')wrong=['Wiązka musi być odchylana w kierunku poziomym i wzdłuż osi głębokości','Wiązka musi być odchylana w kierunku pionowym i wzdłuż osi głębokości','Wiązka musi poruszać się wyłącznie wzdłuż przekątnej i osi głębokości'];
  if(overrides[r.id])wrong=overrides[r.id];
  if(!wrong||wrong.length!==3)throw Error('Options '+key+' '+r.id);
  wrong=wrong.map(t=>style(t,a));
  // Different sentence openings must not reveal the original key.
  const first=t=>t.toLocaleLowerCase('pl').match(/[\p{L}\p{N}]+/u)?.[0];
  if(first(wrong[0])===first(wrong[1])&&first(wrong[1])===first(wrong[2])&&first(a)!==first(wrong[0]))wrong[1]=style('To '+wrong[1][0].toLocaleLowerCase('pl')+wrong[1].slice(1),a);
  r.status='ready';r.questionId=r.id;
  questions.push({id:r.id,subjectId:'monitory',question:clean(r.question)+' ('+r.author+')',options:[{id:'correct',text:a},...wrong.map((text,j)=>({id:'d'+(j+1),text}))],correctOptionId:'correct',category:'Monitory',sourceId:r.id,sources:[r.id],author:r.author});
 });
}
require('../core.js').validate(questions);
const meta={version:1,sourceFiles:21,sourceRecords:records.length,readyQuestions:questions.length,reviewRecords:issues.length,reviewGroups:issues.length,mergedRecords:0};
write('data/monitory.json',JSON.stringify({meta,questions,issues,sources:records},null,2));
write('data/monitory-options-audit.txt',questions.map(q=>q.id+' | '+q.question+'\n'+q.options.map(o=>(o.id==='correct'?'✓ ':'  ')+o.text).join('\n')).join('\n\n'));
console.log(meta);
