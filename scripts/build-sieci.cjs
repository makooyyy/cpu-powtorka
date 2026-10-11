'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),write=(f,v)=>fs.writeFileSync(path.join(root,f),v);
const records=JSON.parse(read('data/sieci-records.json'));
const lines=read('data/sieci-concepts.txt').trim().split(/\r?\n/).map(x=>x.split(' '));
const choices=new Map(read('data/sieci-distractors.txt').trim().split(/\r?\n/).map(l=>{const[k,...a]=l.split('|');if(a.length!==3)throw Error(k);return[k,a];}));
const compact=new Map(read('data/sieci-compact.txt').trim().split(/\r?\n/).map(l=>{const[k,...a]=l.split('|');if(a.length!==3)throw Error(k);return[k,a];}));
const reasons={
poland:'Data w pliku nie odpowiada początkowi polskiego Internetu TCP/IP (17 sierpnia 1991). Wcześniejsza poczta i sieci akademickie to inne wydarzenia; trzeba wskazać, o które chodzi.',
coaxspeed:'Brakuje standardu transmisji. 10 Mb/s dotyczy historycznego Ethernetu 10BASE2/10BASE5, nie granicy możliwości wszystkich kabli koncentrycznych.',
coax_same_speed:'Równa szybkość dotyczy porównania 10BASE2 i 10BASE5. Pytanie nie podaje standardu ani warunków transmisji.',
coax_obsolete:'Kabel koncentryczny nadal ma zastosowania, m.in. w sieciach operatorów. Trzeba ograniczyć stwierdzenie do historycznych sieci LAN Ethernet.',
lan_small:'Określenie „najmniejszy obszar” pomija sieć osobistą PAN. Samo LAN oznacza sieć lokalną, a nie najmniejszą z możliwych sieci.',
bestwifi:'Nie wskazano porównywanych standardów ani kryterium. Odpowiedź o „najszybszym” Wi-Fi zależy od wersji standardu i konfiguracji.',
wrongtopology:'Pytanie dotyczy topologii fizycznych, natomiast odpowiedź wymienia topologie logiczne.',
bus_speed:'Prędkość 10 Mb/s dotyczy konkretnego historycznego Ethernetu, nie każdej sieci o topologii magistrali.',
download_time:'Nie podano prędkości łącza i narzutu protokołów. Czasu pobierania nie można wyznaczyć z samego rozmiaru pliku.',
incomplete_host:'Definicja hosta jest urwana: brakuje informacji, czego host jest nadawcą lub odbiorcą.',
medium_device:'Medium transmisyjne to nośnik sygnału. Nie należy utożsamiać go z urządzeniem końcowym lub aktywnym urządzeniem sieciowym.',
incomplete_dns:'Odpowiedź urywa definicję i nie wskazuje adresu IP jako wyniku rozwiązywania nazwy.',
missingmedium:'Pytanie nie określa medium ani rodzaju złączy. Lista odpowiedzi wymaga kontekstu poprzednich pytań.',
dns_service:'Rozwinięcie DNS w pliku zawiera „Service”. Standardowe rozwinięcie akronimu to Domain Name System.',
dns_reverse:'Odpowiedź nie wskazuje, co jest zamieniane na nazwę. Wymaga doprecyzowania, czy chodzi o zwykłe czy odwrotne zapytanie DNS.',
topology_vague:'Odpowiedź nie określa jednoznacznie sposobu połączenia urządzeń lub przekazywania danych.',
ring_incomplete:'Opis pierścienia jest niepełny: nie precyzuje połączeń z dwoma sąsiadami tworzących zamknięty obwód.',
utp_incomplete:'Podany opis UTP jest niepełny; nie wskazuje jednoznacznie braku ekranowania.',
hub_incomplete:'Opis koncentratora nie wskazuje istotnego zachowania: powtarzania odbieranego sygnału na pozostałe porty.',
wrong_mail:'Odpowiedź utożsamia usługę pocztową z klientem poczty. Potrzebne jest rozróżnienie usługi/serwera i programu klienckiego.',
binaryunits:'W odpowiedzi pomieszano przedrostki dziesiętne (kilo, mega…) z binarnymi (kibi, mebi…). Np. GB i GiB nie są tą samą jednostką.',
star_incomplete:'Opis gwiazdy pomija wspólny centralny punkt połączeń i jest przez to niepełny.',
modem_half:'Modem wykonuje modulację i demodulację. Odpowiedź opisuje tylko jeden kierunek konwersji.',
intranet_vague:'Odpowiedź jest zbyt ogólna, aby odróżnić intranet od innych rodzajów sieci.',
sc_name:'Rozwinięcie nazwy SC wymaga ustalenia użytej terminologii. W materiałach i opisach złączy spotyka się różne rozwinięcia tej nazwy.',
dispersion_confused:'Pytanie miesza tłumienie z dyspersją. Osłabienie amplitudy sygnału i rozmycie impulsu to różne zjawiska.',
irda_remote:'Podczerwień w pilocie nie oznacza automatycznie standardu transmisji danych IrDA.',
token_incomplete:'Samo „wysłanie tokena” nie wyjaśnia metody dostępu. Istotne jest prawo do nadawania wynikające z posiadania żetonu.',
tcp_utp:'Odpowiedź miesza nazwę protokołu TCP z oznaczeniem skrętki UTP.',
www_vague:'Pytanie nie wskazuje konkretnego programu klienckiego lub kontekstu; wskazany przykład jest nieprecyzyjny.',
dns_example:'Odpowiedź podaje konkretny adres IP witryny bez daty i źródła. Taki adres może się zmieniać i nie jest trwałym kluczem testowym.',
rj45_cable:'RJ45/8P8C jest złączem, a nie nazwą rodzaju kabla. W pytaniu i odpowiedzi pomieszano te pojęcia.',
bestcategory:'Brakuje listy porównywanych kategorii i kryterium „najlepsza”. Kategorie należy porównywać dla konkretnego standardu i długości łącza.',
n_max_frequency:'802.11n może działać w pasmach 2,4 GHz i 5 GHz. Podana wartość lub określenie „maksymalna” nie stanowi kompletnego opisu.',
ca_rts_required:'RTS/CTS to opcjonalny mechanizm. Nie każda transmisja CSMA/CA wymaga obowiązkowej wymiany RTS i CTS.',
host_typo:'Odpowiedź ma błąd/urwany fragment w kluczowej definicji hosta; wymaga doprecyzowania przez autora.',
extra_internet:'Extranet wymaga autoryzowanego dostępu do wybranych zasobów organizacji; nie jest po prostu publicznym Internetem.',
cd_incomplete:'Opis CSMA/CD jest urwany lub pomija wykrywanie kolizji oraz reakcję na kolizję.',
ca_incomplete:'Opis CSMA/CA jest niepełny i nie wyjaśnia unikania kolizji przed rozpoczęciem nadawania.',
resistance_mixed:'W odpowiedzi pomieszano rezystancję z innym parametrem transmisyjnym. Rezystancja jest oporem elektrycznym wyrażanym w omach.',
byte_symbol_conflict:'Wielkość litery ma znaczenie: b oznacza bit, a B bajt. W pliku zapisano niespójne oznaczenie.',
thin100:'W historycznym 10BASE2 maksymalna długość segmentu wynosi 185 m, nie podaną w pliku wartość.',
propagation_nvp:'Pytanie dotyczy czasu propagacji, a odpowiedź miesza go z NVP, czyli względną prędkością propagacji.',
attenuation_incomplete:'Definicja tłumienia jest niepełna i nie określa porównywanych poziomów sygnału.',
bendradius:'Dopuszczalny promień gięcia zależy od rodzaju kabla i warunków instalacji; nie ma jednej uniwersalnej wartości.',
token_ring_general:'Metoda dostępu z żetonem nie jest uniwersalną cechą każdej sieci o fizycznym kształcie pierścienia.',
star_point_general:'Fizyczna gwiazda nie przesądza o topologii logicznej: koncentrator i przełącznik zachowują się inaczej.',
dhcp_port_wording:'DHCPv4 używa portów UDP 67 (serwer) i 68 (klient). Pytanie wymaga określenia strony komunikacji.',
gateway_incomplete:'Definicja bramy jest urwana lub zbyt ogólna, by jednoznacznie wskazywała jej funkcję.',
utp_stp:'Odpowiedź zamienia cechy UTP i STP. UTP nie ma ekranu; STP jest oznaczeniem skrętki ekranowanej.',
terminator_conflict:'Odpowiedź przypisuje terminatorowi niewłaściwe zadanie. Terminator ogranicza odbicia sygnału na końcu toru.',
fiber_absolute:'Kategoryczne stwierdzenie pomija ograniczenia światłowodu, m.in. tłumienie, dyspersję i dopuszczalny promień gięcia.',
classful_context:'Odpowiedź wymaga kontekstu historycznej adresacji klasowej; współczesny podział prefiksów opisuje CIDR.',
ap_security_context:'Funkcje bezpieczeństwa zależą od konfiguracji i modelu punktu dostępowego; odpowiedź nie jest uniwersalną definicją.',
extranet_wrong:'Definicja w pliku nie opisuje poprawnie kontrolowanego dostępu partnerów do wybranych zasobów intranetu.',
dns_vague:'Odpowiedź nie określa kierunku ani rodzaju rozwiązywania nazw i nie stanowi jednoznacznego klucza.',
category_vague:'Pytanie nie wskazuje konkretnego standardu, kategorii lub warunków, do których odnosi się odpowiedź.',
kb_wrong:'Wielkość jednostki i przedrostek w odpowiedzi są niespójne. Kilobit to 1000 bitów; nie należy mylić go z kilobajtem lub kibibitem.',
mysql_vague:'Odpowiedź nie określa funkcji MySQL jako systemu zarządzania bazami danych.',
router_devices:'Odpowiedź mówi ogólnie o łączeniu urządzeń. Wyróżnikiem routera jest przekazywanie pakietów między sieciami.',
bend_max:'W instalacji określa się minimalny dopuszczalny promień gięcia, a nie jedną maksymalną wartość dla wszystkich kabli.',
propagation_typo:'Pytanie i odpowiedź zawierają niespójny opis propagacji; nie da się jednoznacznie ustalić zamierzonego parametru.',
fiber_count:'Liczba modów światła i liczba fizycznych włókien w kablu to różne wielkości; odpowiedź je miesza.',
wifi_anywhere:'Dostęp do Wi-Fi wymaga zasięgu i uprawnień; nie jest dostępny w dowolnym miejscu bez ograniczeń.'
};
const numbers={ipv4bits:['32',['16','48','128']],ipv6bits:['128',['32','64','256']],macbits:['48',['32','64','128']],bytebits:['8',['4','16','32']],thin_length:['185',['100','200','500']],thick_length:['500',['185','250','1000']],thin_diameter:['5',['2','8','10']],thick_diameter:['10',['5','8','12']],utp_length:['100',['90','185','500']],a_speed:['54',['11','150','600']],dns_port:['53',['67','68','80']],a_frequency:['5',['2,4','6','60']],ac_frequency:['5',['2,4','6','60']],twisted_wires:['8',['4','6','12']],twisted_pairs:['4',['2','6','8']]};
const normalize=x=>x.replace(/\s+/g,' ').trim();
// Match the author's surface style, never alter the source answer or use typography as a clue.
function style(text,answer){text=text.replace(/[.!;]+$/,'');const end=answer.match(/[.!;]+$/)?.[0]||'';if(answer[0]===answer[0].toLocaleLowerCase('pl')&&/[a-ząćęłńóśźż]/i.test(answer[0]))text=text[0].toLocaleLowerCase('pl')+text.slice(1);else text=text[0].toLocaleUpperCase('pl')+text.slice(1);return text+end;}
const overrides=JSON.parse(read('data/sieci-overrides.json'));
const questions=[],issues=[];
for(let f=0;f<23;f++){
 const rows=records.filter(r=>r.id.startsWith('net1-s'+String(f).padStart(2,'0')+'-'));if(rows.length!==lines[f].length)throw Error('Classification length '+f);
 rows.forEach((r,i)=>{
  r.concept=lines[f][i];const key=r.concept;
  if(key.startsWith('!')){const reason=reasons[key.slice(1)];if(!reason)throw Error('Missing reason '+key);r.status='review';issues.push({id:'review-'+r.id,subjectId:'sieci-1',reason,records:[r]});return;}
  const answer=normalize(r.answer);let wrong=choices.get(key);
  if(numbers[key]){const[from,to]=numbers[key];if(!answer.includes(from))throw Error('Number '+r.id);wrong=to.map(n=>answer.replace(from,n).replace(/\((\d+) bajtów\)/,`(${Number(n)/8} bajtów)`));}
  if(answer.length<55&&compact.has(key))wrong=compact.get(key);
  // Source-shaped alternatives avoid a long source sentence among three terse labels.
  const tokens={bnc:['BNC',['RJ45','SC','LC']],arpanet:['ARPANET',['NSFNET','BITNET','Ethernet']],eightp:['8P8C',['6P6C','8P6C','6P4C']],rj45:['RJ45',['RJ11','BNC','SC']]};
  if(tokens[key]&&answer.toUpperCase().includes(tokens[key][0])){const[from,to]=tokens[key];wrong=to.map(v=>answer.replace(new RegExp(from,'gi'),v));if(key==='rj45')wrong=wrong.map((v,i)=>v.replace('8P8C',['6P4C','złącze koncentryczne','złącze optyczne'][i]));}
  if(key==='byte'&&answer.includes('8'))wrong=['4','16','32'].map(n=>answer.replace('8',n));
  if(key==='bit'&&answer.length>20)wrong=['Jednostka informacji składająca się z ośmiu bitów','Wielkość określająca liczbę zmian sygnału na sekundę','Jednostka określająca szybkość przesyłania danych w łączu'];
  if(['bit_symbol','byte_symbol'].includes(key)&&answer.length>5){const b=key==='bit_symbol';wrong=[b?'Dużą literą B':'Małą literą b','Literą s','Symbolem Hz'];if(/^Bit|^Bajt/.test(answer))wrong=wrong.map(t=>(b?'Bit':'Bajt')+' oznaczamy '+t[0].toLowerCase()+t.slice(1));}
  if(key==='attenuation_unit')wrong=[['omach','Ω'],['hercach','Hz'],['nanosekundach','ns']].map(([v,u])=>answer.replace(/decybelach/i,v).replace(/db/i,u));
  if(key==='resistance_unit')wrong=[['decybelach','dB'],['hercach','Hz'],['woltach','V']].map(([v,u])=>answer.replace(/omach|omah/i,v).replace('Ω',u));
  if(key==='radio_range')wrong=[['3kHz','3MHz'],['30MHz','300MHz'],['300THz','3PHz']].map(([a,b])=>answer.replace(/3\s*Hz/i,a).replace(/3\s*THz/i,b));
  if(key==='fiber_types'&&answer.length>38)wrong=['Światłowód cienki oraz światłowód gruby','Światłowód prosty oraz światłowód skrosowany','Światłowód ekranowany oraz światłowód nieekranowany'];
  if(key==='copper_types')wrong=['Kabel jednomodowy i kabel wielomodowy','Światłowód szklany i światłowód plastikowy','Włókno optyczne ST i włókno optyczne SC'];
  if(key==='coax_types'&&answer.length>40)wrong=['Wyróżniamy dwa typy: kabel jednomodowy oraz wielomodowy','Wyróżniamy dwa typy: kabel prosty oraz kabel skrosowany','Wyróżniamy dwa typy: kabel jednoparowy oraz czteroparowy'];
  if(key==='fiber_signal'&&answer.length>50)wrong=['To impuls elektryczny, którego napięcie zmienia się zgodnie z przesyłanymi danymi','Sygnałem jest drganie mechaniczne rdzenia wywołane falą ultradźwiękową','Przepływ elektronów w metalowym rdzeniu przenosi informację pomiędzy końcami kabla'];
  if(key==='dns'&&answer.length>75){const prefix=answer.match(/^.*?(?:zadaniem jest|celem jest|ma na celu)\s*/i)?.[0]||'Usługa sieciowa, której zadaniem jest ';wrong=['automatyczne przydzielanie hostom adresów IP, masek podsieci i adresu bramy domyślnej','ustalanie adresu sprzętowego MAC interfejsu na podstawie znanego adresu IPv4 w segmencie lokalnym','wybieranie trasy przesyłania pakietów między sieciami na podstawie docelowego adresu IP'].map(t=>prefix+t);}
  if(key==='dhcp'&&answer.length>70&&/protok[oó][łl]/i.test(answer)){const prefix=answer.match(/^.*?protok[oó][łl](?:em)?\s*/i)?.[0]||'Protokół ';wrong=['rozwiązywania nazw domenowych, odwzorowujący nazwy hostów na adresy IP zapisane w strefie','ustalania adresów sprzętowych, pozwalający znaleźć adres MAC na podstawie znanego adresu IPv4','wyboru tras, umożliwiający przekazywanie informacji o drogach do docelowych sieci IP'].map(t=>prefix+t);}
  if(overrides[r.id])wrong=overrides[r.id];
  if(r.id==='net1-s00-19')wrong=choices.get('dns');
  if(key==='wan'&&answer.length<55)wrong=['Lokalna sieć jednego budynku','Sieć osobista użytkownika','Miejska sieć jednej aglomeracji'];
  if(key==='man'&&answer.length<55)wrong=['Osobista sieć użytkownika','Sieć lokalna jednego budynku','Rozległa sieć wielu krajów'];
  if(key==='network'&&answer.length<55)wrong=['Usługi działające na jednym komputerze','Zbiór folderów na wspólnym dysku','Urządzenia ze wspólnym zasilaniem'];
  if(key==='fiber_types'&&answer.startsWith('Wyróżniamy dwa typy'))wrong=wrong.map(t=>'Wyróżniamy dwa typy: '+t.toLowerCase());
  if(!wrong)throw Error('Missing options '+key);
  const q={id:r.id,subjectId:'sieci-1',question:normalize(r.question)+' ('+r.author+')',options:[{id:'correct',text:answer},...wrong.map((t,n)=>({id:'d'+(n+1),text:['bit_symbol','byte_symbol'].includes(key)?(answer.startsWith('[')?'['+t+']':t):style(t,answer)}))],correctOptionId:'correct',category:category(key),sourceId:r.id,sources:[r.id],author:r.author};
  r.questionId=q.id;r.status='ready';questions.push(q);
 });
}
function category(k){if(/fiber|copper|coax|twisted|utp|ftp_cable|stp|bnc|rj45|eightp|cat6|cat7|resistance|attenuation|dispersion|shielding|terminator|single_|multi_|next|thin_|thick_|sf$/.test(k))return 'Okablowanie i transmisja';if(/star|ring|bus|mesh|topolog|physical|logical|point|broadcast|token|^cd|^ca_/.test(k))return 'Topologie i dostęp do medium';if(/wifi|frequency|ac_|a_speed|n_fastest|radio|irda|bluetooth|wimax|wireless|wep|infrared|adhoc/.test(k))return 'Sieci bezprzewodowe';if(/dns|dhcp|arp|tcp|udp|http|smtp|pop3|ftp_protocol|protocol|transport/.test(k))return 'Protokoły i usługi';if(/bit|byte|address|^ip|mac|bps|^kb$|^mb$|^gb$|^tb$/.test(k))return 'Adresowanie i jednostki';return 'Podstawy sieci i urządzenia';}
const d={meta:{version:4,sourceFiles:23,sourceRecords:records.length,readyQuestions:questions.length,reviewRecords:issues.length,reviewGroups:issues.length,mergedRecords:0},questions,issues,sources:records};
require('../core.js').validate(questions);write('data/sieci-1.json',JSON.stringify(d,null,2));
write('data/sieci-options-audit.txt',questions.map(q=>[q.id+' '+q.question,...q.options.map(o=>(o.id==='correct'?'✓ ':'  ')+o.text)].join('\n')).join('\n\n'));
console.log('SIECI',d.meta);
