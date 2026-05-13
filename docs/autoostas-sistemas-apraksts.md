# Autoostas informācijas sistēma

Autoostas informācijas sistēmas, tālāk tekstā Sistēmas, mērķis ir nodrošināt autobusu maršrutu apskati, biļešu iegādi, lietotāju kontu pārvaldību, šoferu maršrutu ievadi un autoostas vadītāja pārskatu vienā tīmekļa lietotnē. Sistēma glabā datus SQL datu bāzē, lai saglabātos lietotāji, maršruti, reisu laiki, konta bilance, iemaksas un nopirktās biļetes.

## Lietotāji un lomas

Sistēmai ir vairāki lietotāji, un tai ir jānodrošina lietotāju autentifikācija. Katram lietotājam sākumā ir pasažiera tiesības. Lietotājs var pieteikties par autobusa vadītāju, bet autobusa vadītājs var kļūt par autoostas vadītāju.

### Pasažieris

Pasažieris var meklēt maršrutus pēc sākumpunkta un galapunkta, izveidot kontu, pieteikties sistēmā, papildināt konta bilanci, skatīt iepriekšējās izmaksas, izvēlēties reisa laiku un iegādāties biļeti. Pēc apmaksas pasažieris saņem QR kodu un lejupielādējamu čeku.

### Autobusa vadītājs

Autobusa vadītājs var izveidot un labot maršrutus. Maršrutam tiek norādīts nosaukums, sākumpunkts, galapunkts, pieturvietas, cena un reisa laiki. Reisa laikus var ievadīt manuāli vai ģenerēt pēc atkārtošanās intervāla, piemēram, ik pēc 1 stundas vai 2 stundām noteiktā laika periodā.

### Autoostas vadītājs

Autoostas vadītājs var piekļūt pārvaldības lapai. Tajā redzami visi lietotāji, visi maršruti, bilances iemaksas, nopirktās biļetes un pārskati, piemēram, visvairāk iztērēts, populārākais maršruts, lielākā iemaksa un kopējie ienākumi.

## Datu klases

- Lietotāji
- Šofera pieteikumi
- Maršruti
- Pieturvietas
- Reisa laiki
- Bilances iemaksas
- Biļešu pirkumi
- Čeki

## Funkciju uzskaitījums

Lietotājs var ievadīt sākumpunktu un galapunktu, pēc tam nospiest pogu meklēt un saņemt atbilstošu maršrutu sarakstu. Lietotājs var pieteikties ar konta nosaukumu un paroli. Parolei pieteikšanās logā ir iespēja ieslēgt redzamību ar izvēles rūtiņu.

Ja lietotājs izveido kontu, sistēma pārbauda, vai ir ievadīts vārds, uzvārds, vecums, unikāls konta nosaukums un parole. Parolei jābūt vismaz 8 simbolus garai, tajā jābūt vienam ciparam, vienam speciālajam simbolam un vienam lielajam burtam.

Pēc pieteikšanās lietotājs redz savu vārdu, uzvārdu, bilanci un lomas atzīmi. Nospiežot uz bilances, lietotājs var papildināt kontu par summu no 0 līdz 200 EUR un apskatīt iepriekšējos biļešu pirkumus.

Ja lietotājs izvēlas reisu un kontā ir pietiekami līdzekļu, sistēma noņem biļetes cenu no bilances, saglabā pirkumu datu bāzē un parāda QR kodu un čeku. Ja līdzekļu nepietiek, sistēma parāda kļūdas paziņojumu.

Lietotājs var pieteikties par šoferi. Sistēma pārbauda šofera pieredzi: ja lietotāja vecums mīnus pieredzes gadi ir mazāks par 18, pieteikums netiek pieņemts. Šoferis var veidot maršrutus atsevišķā lapā.

Autoostas vadītājs var atvērt pārvaldības lapu, kur redz sistēmas datus un pārskatu pogas.

## Lietotāja saskarne

Wireframe un lapu apraksts ir dots dokumentā `lietotaja-interfeisa-wireframe.md`. Galvenie skati: sākumlapa, pieteikšanās logs, konta izveides logs, bilances logs, biļetes iegādes skats, šofera maršruta izveides lapa un autoostas vadītāja pārvaldības lapa.
