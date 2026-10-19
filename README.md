# Powtórka — CPU, SIECI, Monitory i CPU poprawa

Gotowa aplikacja do nauki na komputerze i telefonie. [Otwórz stronę](https://makooyyy.github.io/cpu-powtorka/).

Po kliknięciu **Rozpocznij test** wybierz **CPU**, **SIECI Część 1**, **Monitory** lub **CPU poprawa**. Szybki test ma 10 pytań, długi 40. Tematy nie mieszają się w jednej sesji. Pytania i cztery odpowiedzi są losowane. Konkretna pozycja źródłowa nie powtarza się w sesji; powtórzenia w materiałach i pytania różnych autorów są zachowane.

| Materiał | Pliki | Zapisy źródłowe | Oceniane | Do wyjaśnienia |
|---|---:|---:|---:|---:|
| CPU | 26 | 1038 | 904 | 134 |
| SIECI Część 1 | 23 | 922 | 826 | 96 |
| Monitory | 21 | 654 | 524 | 130 |
| CPU poprawa | 23 | 907 | 762 | 145 |
| Razem | 93 | 3521 | 3016 | 505 |

Każde pytanie ma podpis autora z nazwy pliku. **Dziwne pytania** losuje 10 spornych zapisów wybranego tematu, pokazuje odpowiedź autora i wyjaśnienie problemu. Nie wystawia oceny. Niejasnych odpowiedzi nie zastąpiono wymyślonymi kluczami.

Wyniki obejmują liczbę poprawnych i błędnych odpowiedzi, procent i przegląd pomyłek. „Nowy test” zachowuje temat i rozmiar testu. Baza ma wyszukiwanie, filtr materiału i kategorii oraz oznaczenia do powtórki. Historia i niedokończona sesja zapisują się w tej samej przeglądarce. Nie ma synchronizacji między telefonem a komputerem. Odpowiedzi pokazane w zakończonych testach zachowują swój historyczny tekst mimo aktualizacji bazy.

## Uruchomienie lokalne

Pobierz repozytorium jako ZIP i rozpakuj. Otwórz `index.html` albo uruchom `START.cmd`. Działa bez instalowania bibliotek i bez Internetu. Opcjonalnie, z Node.js 18+: `npm start` i adres wyświetlony w terminalu. Wszystkie pliki aplikacji muszą pozostać razem.

## Baza i kolejne części

- `data/subjects.json` — rejestr materiałów; kolejne części SIECI dodaje się jako osobne pozycje.
- `data/cpu.json`, `data/sieci-1.json`, `data/monitory.json`, `data/cpu-poprawa.json` — oddzielne banki pytań, źródeł i uwag.
- `data/questions.json`, `data/questions.js` — wygenerowana wspólna baza aplikacji; wersja JS umożliwia otwieranie z dysku bez serwera.
- `data/sieci-records.json` — wszystkie 922 oryginalne pary pytań i odpowiedzi.
- `data/sieci-concepts.txt` — jawne przypisanie każdego zapisu do pojęcia lub uwagi.
- `data/sieci-distractors.txt`, `data/sieci-compact.txt`, `data/sieci-overrides.json` — redagowane odpowiedzi błędne, krótkie warianty i wyjątki.
- `scripts/build-sieci.cjs` — generuje SIECI; poprawne odpowiedzi pozostawia zgodne ze źródłem, normalizując jedynie białe znaki.
- `scripts/build-subjects.cjs` — łączy banki z rejestru materiałów.
- `SIECI-ANALYSIS.md` — raport pokrycia dokumentów, decyzje redakcyjne i materiały weryfikacyjne.

Po zmianie gotowego banku uruchom `node scripts/build-subjects.cjs`. Po zmianie źródeł/redakcji SIECI uruchom `npm run build:data` — przebuduje SIECI, Monitory i CPU poprawa, a następnie połączy banki. Ręczne zmiany w `sieci-1.json` zostaną wtedy zastąpione przez generator.

Nowy materiał powinien mieć strukturę `meta`, `questions`, `issues`, `sources` zgodną z istniejącymi bankami, własne niepowtarzalne ID i co najmniej 40 pytań. Dopisz go do `subjects.json` i przebuduj wspólną bazę; wybór tematu jest generowany z rejestru.

Surowe DOCX nie są publikowane. Mając oryginalny ZIP, można odtworzyć ekstrakcję: `python scripts/extract-sieci.py "ścieżka/do/archiwum.zip"`, następnie `python scripts/parse-sieci.py`. Stare skrypty ekstrakcji CPU są historycznymi narzędziami importu i nie służą do przebudowy wspólnej bazy.

## Kontrola jakości

`npm test` — 24 testy: pokrycie źródeł, autorzy, cztery różne opcje, zgodność kluczy, losowanie, izolacja tematów, wyniki, historia, sporne pytania i kontrola początków dystraktorów.

Sprawdzono w przeglądarce testy 10/40, przegląd błędów, odtwarzanie sesji po przeładowaniu i układ telefonu 390 × 844. Aplikacja nie korzysta z zewnętrznych fontów, analityki ani usług sieciowych.

## Monitory

Import: `python scripts/extract-monitory.py "ścieżka/do/archiwum.zip"`, potem `python scripts/parse-monitory.py`. Klasyfikacja wszystkich 654 zapisów: `data/monitory-concepts.txt`; warianty: `data/monitory-distractors.txt` i `data/monitory-overrides.json`. Generator: `scripts/build-monitory.cjs`. Raport: [MONITORY-ANALYSIS.md](MONITORY-ANALYSIS.md). Poprawne odpowiedzi zachowano ze źródeł.

## CPU poprawa

Osobny materiał, bez zastępowania wcześniejszej bazy CPU. Pełne pokrycie 23 dokumentów: 907 zapisów, 762 oceniane i 145 do wyjaśnienia. Powtórzenia i podpisy autorów zachowano. [Raport importu](CPU-POPRAWA-ANALYSIS.md).

Import: `python scripts/extract-cpu-poprawa.py "ścieżka/do/CPU pytania.zip"`, potem `python scripts/parse-cpu-poprawa.py`. Odtwarzalny bank: `node scripts/build-cpu-poprawa.cjs` i `node scripts/build-subjects.cjs`. Pary źródłowe, klasyfikacje oraz ręcznie redagowane warianty znajdują się w plikach `data/cpu-poprawa-*`; reguły dopasowania formy w `scripts/cpu-poprawa-forms.cjs`. Generator nie zmienia tekstu poprawnych odpowiedzi poza białymi znakami.
