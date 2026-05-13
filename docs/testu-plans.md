# Autoostas informācijas sistēmas testu plāns

## Testēšanas mērķis

Pārbaudīt, vai Autoostas informācijas sistēma izpilda prasības: lietotāju reģistrācija un pieteikšanās, maršrutu meklēšana, bilances papildināšana, biļetes pirkšana, šofera pieteikums, maršrutu izveide un autoostas vadītāja pārskati.

## Manuālie testa gadījumi

| ID | Prasība | Ievaddati | Sagaidāmais rezultāts | Statuss |
|---|---|---|---|---|
| T-01 | Lietotājs var izveidot kontu | Vārds, uzvārds, vecums, unikāls konta nosaukums, derīga parole | Konts tiek izveidots un lietotājs tiek pieslēgts | Sagatavots |
| T-02 | Paroles validācija | `abc` | Parādās kļūda, ka parole neatbilst noteikumiem | Sagatavots |
| T-03 | Konta nosaukums ir unikāls | Esošs konta nosaukums | Parādās kļūda, ka konts jau eksistē | Sagatavots |
| T-04 | Pieteikšanās kļūda ir redzama | Pareizs konts, nepareiza parole | Pieteikšanās logā parādās kļūdas ziņa | Sagatavots |
| T-05 | Maršrutu meklēšana | No: Rīga, uz: Liepāja | Tiek parādīti atbilstoši maršruti | Sagatavots |
| T-06 | Bilances papildināšana | Summa 50 EUR | Bilance palielinās par 50 EUR un iemaksa saglabājas DB | Sagatavots |
| T-07 | Bilances limits | Summa 250 EUR | Parādās brīdinājums, summa netiek saglabāta | Sagatavots |
| T-08 | Biļetes pirkšana | Izvēlēts reiss, pietiekama bilance | Tiek parādīts QR kods un lejupielādējams čeks | Sagatavots |
| T-09 | Nepietiekama bilance | Biļetes cena lielāka par bilanci | Parādās kļūda par nepietiekamiem līdzekļiem | Sagatavots |
| T-10 | Šofera pieteikuma vecuma pārbaude | Vecums 20, pieredze 3 | Parādās kļūda, jo tiesības nevarēja būt pirms 18 gadiem | Sagatavots |
| T-11 | Maršruta izveide atsevišķā lapā | Nosaukums, sākums, galapunkts, pieturas, cena, reisa laiki | Maršruts saglabājas SQL datu bāzē | Sagatavots |
| T-12 | Atkārtojošies reisa laiki | No 08:00 līdz 18:00, ik pēc 2h | Sistēma izveido vairākus reisa laikus | Sagatavots |
| T-13 | Autoostas vadītāja pārskats | Vadītājs atver pārvaldības lapu | Redz lietotājus, maršrutus, iemaksas, biļetes un pārskatus | Sagatavots |

## Automātiskie testi

Automātiskie testi atrodas mapē `tests`. Tie pārbauda servera biznesa noteikumus:

- parole tiek saglabāta kā sālīts hash un netiek atdota klientam;
- konta nosaukumi nav dublējami arī ar atšķirīgiem burtiem;
- šofera pieteikumā tiek pārbaudīts vecums mīnus pieredze;
- bilances papildināšanas limits ir no 0 līdz 200 EUR;
- biļetes pirkšana vienā darbībā noņem naudu no bilances un saglabā biļeti.

Palaišanas komanda:

```powershell
python -m unittest discover -s tests -v
```

Pēdējais rezultāts: visi 5 automātiskie testi izpildījās veiksmīgi.
