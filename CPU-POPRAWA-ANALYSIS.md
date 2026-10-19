# CPU poprawa — raport importu

Dodano osobny temat `cpu-poprawa`. Przeczytano wszystkie 23 dokumenty z archiwum CPU pytania.zip, w tym obie strony PDF. Zachowano 907 par, w tym powtarzające się pytania różnych autorów. 762 pary mają cztery opcje i uczestniczą w testach; 145 zapisów jest dostępnych w trybie Dziwne pytania bez punktacji.

| Plik | Zapisy | Oceniane | Do wyjaśnienia |
|---|---:|---:|---:|
| Alan_Grobelski.docx | 40 | 32 | 8 |
| Aleksander_Kozłowski.docx | 40 | 37 | 3 |
| Artem_Shcherbakov.docx | 40 | 39 | 1 |
| bartek_swoboda_pytania cpu.docx | 38 | 25 | 13 |
| Bartosz_Ogień.docx | 40 | 34 | 6 |
| Blazej_Ciesielski.docx | 40 | 39 | 1 |
| Dawid_Sieradzki.docx | 40 | 36 | 4 |
| Dima_Shlapakov.docx | 40 | 30 | 10 |
| Filip_Majewski.docx | 40 | 30 | 10 |
| franek_karolak.docx.docx | 39 | 31 | 8 |
| Grzegorz.Cezak.docx | 40 | 37 | 3 |
| Jakub_ZychCPU.docx | 40 | 32 | 8 |
| Jan Sołtysiński.docx | 40 | 36 | 4 |
| jan_babski.docx | 40 | 34 | 6 |
| Kacper_Nemec.docx | 40 | 29 | 11 |
| Kacper_Zurek.docx | 40 | 35 | 5 |
| Kamil_BireckiCPU.docx | 40 | 24 | 16 |
| Kurylchuk_Kostiantyn.docx | 30 | 28 | 2 |
| Maciek_Kacprzak.docx | 40 | 37 | 3 |
| Maksymilian_Kowalczyk.pdf | 40 | 39 | 1 |
| Natalia_Urbańska.docx | 40 | 31 | 9 |
| PatrykWitczakCpu.docx | 40 | 29 | 11 |
| szymon_jozwiak.docx | 40 | 38 | 2 |

## Pokrycie i wyjątki

W pliku Bartka Swobody są dwa puste wiersze, a w pliku Franka Karolaka jeden pusty wiersz (nr 32). Nie tworzą pytań. Dokument Kurylchuka zawiera 30 pytań; sklejone pozycje 13 i 14 rozdzielono. Nagłówki i numeracja nie są pytaniami. W PDF połączono zawinięte linie. Każdy rzeczywisty zapis ma własny identyfikator cpur-sXX-NN.

Zachowano odpowiedzi i błędy pisowni autorów. Nie poprawiano kluczy na podstawie domysłu. Wątpliwe pytania obejmują między innymi AX opisany jako bateria, cache jako szybkość, niepełne definicje, bezwarunkowe TDP jako moc maksymalną, nieokreślone modele procesorów, oceny „najważniejszego” elementu i pytania czysto tak/nie. Powody są zapisane przy każdym rekordzie w `issues`.

## Redakcja wariantów

Alternatywy dobrano do pojęcia i formy źródłowej: liczby rdzeni zachowują zapis liczbowy albo nazwę Dual/Quad/Six/Octa-Core, jednostki i skróty pozostają porównywalne, a opisy rejestrów dotyczą funkcji sąsiednich rejestrów. Rozbudowane odpowiedzi mają rozbudowane warianty. Kontrola wykrywa wspólny początek trzech błędnych wariantów wyróżniający klucz. To kontrola pomocnicza, nie dowód merytorycznej poprawności; warianty przejrzano także redakcyjnie.

## Weryfikacja terminów

- [Intel: TDP a pobór mocy](https://www.intel.com/content/www/us/en/support/articles/000055611/processors.html)
- [Intel: Hyper-Threading](https://www.intel.com/content/www/us/en/gaming/resources/hyper-threading.html)
- [AMD: platforma AM5](https://www.amd.com/en/products/processors/chipsets/am5.html)

Źródła techniczne służyły oznaczeniu niejasności. Poprawne odpowiedzi oceniane nadal pochodzą wyłącznie z dokumentów.

## Testy wydania

24 testy automatyczne zakończone poprawnie. W przeglądarce: 7/10 = 70%, 34/40 = 85%, przegląd błędów, odtworzenie pytania 2/40 po przeładowaniu, ujawnienie odpowiedzi i uwagi w trybie spornym. Widok 390 × 844 sprawdzony dla testu i uwag; brak błędów konsoli.

