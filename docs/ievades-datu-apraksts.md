# Autoostas informācijas sistēmas ievades datu apraksts

## Dokumenta mērķis

Šajā dokumentā aprakstīts, kādus datus lietotājs var ievadīt Autoostas informācijas sistēmā, kādi dati ir atļauti vai aizliegti, kur dati tiek saglabāti un kādam nolūkam tie tiek izmantoti. Apraksts veidots pēc reālajiem ievades laukiem sistēmas lapās `index.html`, `route.html` un `manager.html`.

## 1. Maršrutu meklēšana sākumlapā

| Lauks | Atļautie dati | Aizliegtie dati / ierobežojumi | Kur saglabā | Saglabāšanas un izmantošanas mērķis |
|---|---|---|---|---|
| No kurienes brauksi? (`fromInput`) | Teksts, piemēram, pilsēta, autoosta vai pieturvietas nosaukums: `Rīga`, `Jelgava AO`, `Rīga SAO`. Lauku drīkst atstāt tukšu, ja lietotājs grib skatīt visus maršrutus. | Nav speciālas datu bāzes validācijas. Ja ievadītais teksts neatbilst nevienam maršrutam, sistēma vienkārši neatrod rezultātus. | Netiek saglabāts SQL datu bāzē. Īslaicīgi glabājas pārlūka stāvoklī `state.filters.from`. | Izmanto tikai maršrutu filtrēšanai pēc sākumpunkta vai pieturvietām. |
| Uz kurieni brauksi? (`toInput`) | Teksts, piemēram, pilsēta, autoosta vai galapunkts: `Liepāja`, `Daugavpils AO`. Lauku drīkst atstāt tukšu. | Nav speciālas datu bāzes validācijas. Nepareizs vai neeksistējošs teksts nedod rezultātus. | Netiek saglabāts SQL datu bāzē. Īslaicīgi glabājas pārlūka stāvoklī `state.filters.to`. | Izmanto maršrutu filtrēšanai pēc galapunkta vai pieturvietām. |

## 2. Pieteikšanās dati

| Lauks | Atļautie dati | Aizliegtie dati / ierobežojumi | Kur saglabā | Saglabāšanas un izmantošanas mērķis |
|---|---|---|---|---|
| Konta nosaukums (`loginUsername`) | Esošs konta nosaukums, kas jau saglabāts lietotāju tabulā. Pirms pārbaudes tiek noņemtas liekās atstarpes sākumā un beigās. | Tukšs lauks vai konta nosaukums, kas nav reģistrēts. | Pieteikšanās brīdī jauns ieraksts netiek veidots. Pēc veiksmīgas pieteikšanās konta nosaukums tiek saglabāts pārlūkā `localStorage` atslēgā `ais.currentUser`. | Nepieciešams lietotāja identificēšanai un sesijas atjaunošanai pēc lapas pārlādes. |
| Parole (`loginPassword`) | Parole, kas atbilst saglabātajam paroles hash datu bāzē. | Tukša parole vai parole, kas neatbilst lietotāja kontam. | Parole atklātā tekstā netiek saglabāta. Serveris to salīdzina ar `users.password_hash`. | Nodrošina lietotāja autentifikāciju. |
| Parādīt paroli (`showLoginPassword`) | Izvēles rūtiņa: ieslēgta vai izslēgta. | Nav aizliegtu vērtību, jo tā ir tikai vizuāla opcija. | Netiek saglabāts datu bāzē. | Ļauj lietotājam redzēt vai paslēpt ievadīto paroli pieteikšanās formā. |

## 3. Konta izveides dati

| Lauks | Atļautie dati | Aizliegtie dati / ierobežojumi | Kur saglabā | Saglabāšanas un izmantošanas mērķis |
|---|---|---|---|---|
| Vārds (`registerFirstName`) | Netukšs teksts. Piemērs: `Jānis`. Sistēma tehniski pārbauda, lai lauks nav tukšs. | Tukšs lauks vai tikai atstarpes. | `users.first_name` | Izmanto lietotāja attēlošanai profilā, čekā, biļetēs, iemaksās un pārvaldības skatā. |
| Uzvārds (`registerLastName`) | Netukšs teksts. Piemērs: `Bērziņš`. Sistēma tehniski pārbauda, lai lauks nav tukšs. | Tukšs lauks vai tikai atstarpes. | `users.last_name` | Izmanto kopā ar vārdu lietotāja identificēšanai sistēmā un čekos. |
| Vecums (`registerAge`) | Vesels skaitlis no 1 līdz 120. | Tukšs lauks, teksts, negatīvs skaitlis, 0 vai skaitlis virs 120. | `users.age` | Izmanto lietotāja profilā un šofera pieteikuma pārbaudē. |
| Konta nosaukums (`registerUsername`) | Netukšs unikāls teksts. Konta nosaukums nedrīkst atkārtoties arī tad, ja atšķiras tikai lielie/mazie burti. | Tukšs lauks vai jau eksistējošs konta nosaukums. | `users.username` kā primārā atslēga. Pēc pieteikšanās arī `localStorage` atslēgā `ais.currentUser`. | Galvenais lietotāja identifikators datu bāzē un saistītajās tabulās. |
| Parole (`registerPassword`) | Vismaz 8 simboli, vismaz 1 lielais burts, vismaz 1 cipars un vismaz 1 speciālais simbols. Piemērs: `Parole!1`. | Parole zem 8 simboliem, bez lielā burta, bez cipara vai bez speciālā simbola. | Atklātā tekstā netiek saglabāta. Serveris saglabā tikai `users.password_hash` kā sālītu PBKDF2 hash. | Nepieciešama drošai pieteikšanās pārbaudei, neglabājot īsto paroli. |
| Atkārtot paroli (`registerPasswordRepeat`) | Jābūt tieši tādai pašai kā laukā `registerPassword`. | Atšķirīga parole vai tukšs lauks. | Netiek saglabāts datu bāzē. | Izmanto tikai reģistrācijas brīdī, lai samazinātu kļūdaini ievadītas paroles risku. |

## 4. Bilances papildināšana

| Lauks | Atļautie dati | Aizliegtie dati / ierobežojumi | Kur saglabā | Saglabāšanas un izmantošanas mērķis |
|---|---|---|---|---|
| Papildināmā summa (`topUpAmount`) | Decimālskaitlis virs 0 un ne lielāks par 200 EUR. Piemēri: `5`, `20.50`, `200`. | 0, negatīvs skaitlis, teksts, tukšs lauks vai summa virs 200 EUR. | Lietotāja jaunā bilance: `users.balance`. Iemaksas ieraksts: `top_ups.amount`, `top_ups.balance_after`, `top_ups.username`, `top_ups.created_at`. | Saglabā lietotāja konta bilanci un vēsturi, lai vēlāk var redzēt iemaksas pārvaldības panelī. |

## 5. Biļetes iegāde

| Ievades punkts | Atļautie dati | Aizliegtie dati / ierobežojumi | Kur saglabā | Saglabāšanas un izmantošanas mērķis |
|---|---|---|---|---|
| Izvēlētais maršruts (`selectedRouteId`) | Maršruta identifikators, kas eksistē tabulā `routes`. Lietotājs to izvēlas ar pogu, nevis raksta ar roku. | Neeksistējošs maršruta ID vai tukša izvēle. | Pirkuma brīdī saglabājas `purchases.route_id`, `purchases.route_name`, `purchases.start_point`, `purchases.end_point`. | Fiksē, par kuru reisu biļete nopirkta, arī tad, ja maršruta nosaukums vēlāk mainās. |
| Izvēlētais reisa laiks (`selectedScheduleId`) | Reisa laika identifikators, kas pieder izvēlētajam maršrutam tabulā `route_schedules`. | Reisa laiks, kas neeksistē vai nepieder izvēlētajam maršrutam. | `purchases.schedule_id`, `purchases.departure`, `purchases.arrival`. | Fiksē konkrēto izbraukšanas un ierašanās laiku biļetei un čekam. |
| Apmaksa no bilances | Lietotāja bilancei jābūt vienādai ar biļetes cenu vai lielākai par to. | Ja bilance ir mazāka par cenu, pirkums netiek veikts. | No `users.balance` tiek noņemta cena. Pirkums saglabājas `purchases.price`, `purchases.paid`, `purchases.created_at`, `purchases.ticket_number`. | Nodrošina biļetes iegādi, QR koda informāciju, čeka izveidi un izmaksu vēsturi. |

## 6. Šofera pieteikums

| Lauks | Atļautie dati | Aizliegtie dati / ierobežojumi | Kur saglabā | Saglabāšanas un izmantošanas mērķis |
|---|---|---|---|---|
| Vadītāja apliecības numurs (`licenseNumber`) | Netukšs teksts, piemēram, apliecības numurs vai kods. | Tukšs lauks vai tikai atstarpes. | `driver_applications.license_number` | Saglabā šofera pieteikuma informāciju pārbaudei. |
| Pieredzes gadi (`experienceYears`) | Vesels skaitlis no 0 uz augšu. Papildus tiek pārbaudīts, lai lietotāja vecums mīnus pieredzes gadi nebūtu mazāks par 18. | Negatīvs skaitlis, teksts, tukšs lauks vai situācija, kur `vecums - pieredze < 18`. | `driver_applications.experience_years` | Izmanto, lai pārbaudītu, vai šofera pieredze ir ticama pēc tiesību iegūšanas vecuma. |
| Motivācija (`driverMotivation`) | Netukšs teksts, kur lietotājs paskaidro, kāpēc vēlas kļūt par šoferi. | Tukšs lauks vai tikai atstarpes. | `driver_applications.motivation` | Saglabā šofera pieteikuma pamatojumu. |
| Šofera statuss | Tiek piešķirts tikai pēc veiksmīga pieteikuma. | Netiek piešķirts, ja pieteikuma dati nav derīgi. | `users.is_driver`, `users.driver_since` | Nosaka, vai lietotājs drīkst veidot un labot maršrutus. |

## 7. Maršruta izveide un labošana

| Lauks | Atļautie dati | Aizliegtie dati / ierobežojumi | Kur saglabā | Saglabāšanas un izmantošanas mērķis |
|---|---|---|---|---|
| Reisa nosaukums (`routeNameInput`) | Netukšs teksts, piemēram, `Rīga - Liepāja ekspresis`. | Tukšs lauks vai tikai atstarpes. | `routes.name` | Parāda maršruta nosaukumu sarakstos, biļetēs, čekos un pārskatos. |
| Cena (`routePriceInput`) | Decimālskaitlis virs 0. Piemērs: `12.50`. | 0, negatīvs skaitlis, teksts vai tukšs lauks. | `routes.price` | Izmanto biļetes cenas aprēķinam un pārskatiem. |
| Sākums (`routeStartInput`) | Netukšs teksts, piemēram, `Rīga SAO`. | Tukšs lauks vai tikai atstarpes. | `routes.start_point` | Izmanto maršrutu meklēšanā, kartītēs, biļetēs un čekos. |
| Galapunkts (`routeEndInput`) | Netukšs teksts, piemēram, `Liepāja AO`. | Tukšs lauks vai tikai atstarpes. | `routes.end_point` | Izmanto maršrutu meklēšanā, kartītēs, biļetēs un čekos. |
| Pieturvietas (`stopsList`) | Teksta lauki pieturvietām. Parasti sākumā ir 3 pieturvietas, bet šoferis var pievienot vai noņemt pieturas ar plus/mīnus pogām. | Tukšas pieturvietas netiek saglabātas kā derīgi pieturu nosaukumi. | `route_stops.stop_name`, `route_stops.route_id`, `route_stops.sequence_number`. | Saglabā starppieturas un to secību, lai tās var rādīt maršrutā un čekā. |
| Manuālais izbraukšanas laiks | Laiks formātā `HH:MM`, piemēram, `08:10`. | Tukšs laiks vai pāris, kur nav izbraukšanas vai ierašanās laika. | `route_schedules.departure` | Nosaka konkrētu reisa sākuma laiku. |
| Manuālais ierašanās laiks | Laiks formātā `HH:MM`, piemēram, `11:35`. | Tukšs laiks vai pāris, kur nav izbraukšanas vai ierašanās laika. | `route_schedules.arrival` | Nosaka konkrētu reisa beigu laiku. |
| Atkārtošanās sākuma laiks (`recurrenceStartInput`) | Laiks formātā `HH:MM`, piemēram, `08:00`. | Tukšs lauks atkārtošanās režīmā. | `routes.recurrence_start_time`; ģenerētie laiki arī `route_schedules.departure`. | Nosaka, no cikiem sākas atkārtojošie reisi. |
| Atkārtošanās beigu laiks (`recurrenceEndInput`) | Laiks formātā `HH:MM`, piemēram, `18:00`. | Tukšs lauks vai beigu laiks, kas neveido nevienu reisu. | `routes.recurrence_end_time` | Nosaka, līdz cikiem tiek ģenerēti reisi. |
| Atkārtošanās intervāls (`recurrenceIntervalInput`) | Viena no izvēlētajām vērtībām minūtēs, piemēram, 30, 45, 60, 90, 120 vai 180. | Nederīgs intervāls, 0 vai negatīva vērtība. | `routes.recurrence_interval_minutes` | Nosaka, cik bieži tiek ģenerēts viens un tas pats maršruts. |
| Brauciena ilgums (`recurrenceDurationInput`) | Skaitlis minūtēs no 1 līdz 1440. | 0, negatīvs skaitlis, teksts vai vērtība virs 1440. | `routes.recurrence_duration_minutes`; aprēķinātais ierašanās laiks arī `route_schedules.arrival`. | Aprēķina ierašanās laiku atkārtojošajiem reisiem. |
| Šoferis, kas izveido maršrutu | Tiek paņemts no pašreiz pieslēgtā lietotāja. Lietotājam jābūt šoferim. | Maršrutu nedrīkst saglabāt nepieslēdzies lietotājs vai lietotājs bez šofera statusa. | `routes.driver_username` | Saista maršrutu ar šoferi un ļauj labot tikai savus maršrutus. |

## 8. Autoostas vadītāja pārvaldības lapa

Autoostas vadītāja lapā nav brīvas teksta ievades datu saglabāšanai. Tajā ir pārskatu pogas, kas izmanto jau saglabātos datus:

| Poga | Ievadītie dati | Kurus datus izmanto | Mērķis |
|---|---|---|---|
| Visvairāk iztērēts | Lietotājs neko neievada, tikai nospiež pogu. | `purchases.username`, `purchases.price`, `users.first_name`, `users.last_name` | Noskaidro, kurš lietotājs visvairāk iztērējis biļetēm. |
| Visizdevīgākais brauciens | Lietotājs neko neievada. | `routes.price`, `routes.name`, `routes.start_point`, `routes.end_point` | Atrod lētāko maršrutu. |
| Populārākais maršruts | Lietotājs neko neievada. | `purchases.route_id`, `purchases.route_name` | Noskaidro maršrutu ar visvairāk nopirktām biļetēm. |
| Lielākā iemaksa | Lietotājs neko neievada. | `top_ups.amount`, `top_ups.username`, `top_ups.created_at` | Atrod lielāko konta papildinājumu. |
| Kopējie ienākumi | Lietotājs neko neievada. | `purchases.price`, `top_ups.amount` | Aprēķina kopējo naudas plūsmu sistēmā. |

## 9. Dati, kas tiek ģenerēti automātiski

| Dati | Kur saglabā | Mērķis |
|---|---|---|
| Lietotāja izveides laiks | `users.created_at` | Parāda, kad konts izveidots. |
| Lietotāja pēdējo izmaiņu laiks | `users.updated_at` | Fiksē pēdējo bilances vai lomas izmaiņu. |
| Šofera statusa piešķiršanas laiks | `users.driver_since` | Parāda, kopš kura brīža lietotājs ir šoferis. |
| Autoostas vadītāja statusa piešķiršanas laiks | `users.station_manager_since` | Parāda, kopš kura brīža lietotājs ir autoostas vadītājs. |
| Pirkuma identifikators | `purchases.id` | Unikāli identificē biļetes pirkumu. |
| Biļetes numurs | `purchases.ticket_number` | Tiek rādīts čekā un QR kodā. |
| Iemaksas identifikators | `top_ups.id` | Unikāli identificē bilances papildinājumu. |
| Maršruta, pieturas un reisa laika identifikatori | `routes.id`, `route_stops.id`, `route_schedules.id` | Saista tabulas un ļauj precīzi atrast konkrētu ierakstu. |

## 10. Nepareizu datu piemēri un programmas paziņojumi

Šajā sadaļā apkopoti piemēri, kādas nepareizas vērtības lietotājs var ievadīt un kādu paziņojumu sistēma parāda. Šie paziņojumi tiek rādīti formas kļūdas tekstā, uznirstošajā paziņojumā vai `alert` logā atkarībā no konkrētās darbības.

| Ievades vieta | Nepareizas vērtības piemērs | Programmas paziņojums | Sistēmas darbība |
|---|---|---|---|
| Pieteikšanās konta nosaukums vai parole | Konta nosaukums tukšs, parole tukša | `Ievadi konta nosaukumu un paroli.` | Pieteikšanās netiek veikta, lauki tiek atzīmēti kā kļūdaini. |
| Pieteikšanās parole | Konts `janis`, parole `Nepareiza!1` | `Nepareizs konta nosaukums vai parole.` | Lietotājs netiek ielaists sistēmā. |
| Reģistrācijas vārds un uzvārds | Vārds tukšs vai uzvārds tukšs | `Vārds un uzvārds ir obligāti jāieraksta.` | Konts netiek izveidots. |
| Reģistrācijas konta nosaukums | Tukšs konta nosaukums | `Ievadi konta nosaukumu.` | Konts netiek izveidots. |
| Reģistrācijas vecums | `0`, `121`, `abc` | `Vecumam jābūt no 1 līdz 120.` | Konts netiek izveidots, dati netiek saglabāti `users` tabulā. |
| Reģistrācijas parole | `Abc!1` | `Parolei jābūt vismaz 8 simbolus garai.` | Konts netiek izveidots. |
| Reģistrācijas parole | `parole!1` | `Parolē jābūt vismaz vienam lielajam burtam.` | Konts netiek izveidots. |
| Reģistrācijas parole | `Parole!!` | `Parolē jābūt vismaz vienam ciparam.` | Konts netiek izveidots. |
| Reģistrācijas parole | `Parole11` | `Parolē jābūt vismaz vienam speciālajam simbolam.` | Konts netiek izveidots. |
| Atkārtota parole reģistrācijā | `Parole!1` un `Parole!2` | `Paroles nesakrīt.` | Konts netiek izveidots. |
| Reģistrācijas konta nosaukums | Jau esošs konts `janis` vai `Janis` | `Šāds konta nosaukums jau eksistē. Izvēlies citu.` | Sistēma nepieļauj divus vienādus konta nosaukumus. |
| Bilances papildināšanas summa | `0`, `-5`, `250`, `abc` | `Summa nav atbilstoša. Ievadi vairāk par 0 EUR un ne vairāk par 200 EUR.` | Bilance netiek papildināta, iemaksa netiek saglabāta `top_ups` tabulā. |
| Biļetes apmaksa bez pieteikšanās | Lietotājs nav pieslēdzies un nospiež `Apmaksāt` | `Lai apmaksātu biļeti, vispirms piesakies kontā.` | Tiek atvērts pieteikšanās logs, pirkums netiek veikts. |
| Biļetes apmaksa ar par mazu bilanci | Bilance `0.00 EUR`, biļetes cena `12.50 EUR` | `Nav pietiekami apmaksas līdzekļi. Papildini konta bilansi.` | Nauda netiek noņemta, biļete netiek saglabāta `purchases` tabulā. |
| Šofera pieteikums | Tukšs apliecības numurs, pieredze vai motivācija | `Aizpildi visus šofera pieteikuma jautājumus.` | Pieteikums netiek saglabāts, lietotājs nekļūst par šoferi. |
| Šofera pieredzes gadi | `abc` vai `-1` | `Aizpildi visus šofera pieteikuma jautājumus.` | Pieteikums netiek saglabāts. |
| Šofera pieredzes gadi pret vecumu | Vecums `20`, pieredze `3` | `Tas nav iespējams, jo vadītāja tiesības var būt tikai no 18 gadu vecuma.` | Pieteikums netiek saglabāts, jo `vecums - pieredze` ir mazāks par 18. |
| Autoostas vadītāja statuss | Parasts lietotājs nospiež kļūt par autoostas vadītāju | `Par autoostas vadītāju var kļūt tikai autobusa vadītājs.` | Statuss netiek piešķirts. |
| Maršruta saglabāšana | Lietotājs nav šoferis | `Maršrutus var saglabāt tikai šoferis.` | Maršruts netiek saglabāts `routes` tabulā. |
| Maršruta cena | `0`, `-2`, `abc` | `Cenai jābūt lielākai par 0 EUR.` | Maršruts netiek saglabāts. |
| Maršruta nosaukums, sākums vai galapunkts | Tukšs nosaukums, tukšs sākums vai tukšs galapunkts | `Aizpildi maršruta nosaukumu, sākumu un galapunktu.` | Maršruts netiek saglabāts. |
| Manuālie reisa laiki | Nav pievienots neviens izbraukšanas un ierašanās laiks | `Pievieno vismaz vienu reisa laiku.` | Reisa laiki netiek saglabāti `route_schedules` tabulā. |
| Manuālie reisa laiki | Izbraukšana `08:00`, ierašanās tukša | `Katram manuālajam laikam aizpildi gan izbraukšanu, gan ierašanos.` | Maršruts netiek saglabāts. |
| Atkārtojošā grafika sākums un beigas | Sākuma vai beigu laiks tukšs | `Ievadi atkārtošanās sākuma un beigu laiku.` | Reisa laiki netiek ģenerēti. |
| Atkārtojošā grafika intervāls | `0` vai negatīvs intervāls | `Izvēlies derīgu atkārtošanās intervālu.` | Reisa laiki netiek ģenerēti. |
| Atkārtojošā grafika ilgums | `0`, `-10`, `abc` | `Brauciena ilgumam jābūt lielākam par 0 minūtēm.` | Reisa laiki netiek ģenerēti. |
| Atkārtojošā grafika beigu laiks | Sākums `18:00`, beigas `08:00` | `Beigu laikam jābūt vēlākam par sākuma laiku.` | Reisa laiki netiek ģenerēti. |
| Maršruta meklēšana | `No`: `Neeksistē`, `Uz`: `Nekuriene` | `Nav atrasts neviens piemērots maršruts. Pamēģini citu sākumu vai galapunktu.` | Meklēšanas dati netiek saglabāti, lietotājam tiek parādīts tukšs rezultātu saraksts. |

## 11. Kopsavilkums

Sistēma pieņem tikai tos datus, kas ir nepieciešami autoostas darbībai: lietotāja kontu, maršrutus, reisa laikus, bilances iemaksas un biļešu pirkumus. Drošie dati, piemēram, parole, netiek glabāti atklātā tekstā. Pagaidu meklēšanas dati netiek saglabāti datu bāzē, jo tie vajadzīgi tikai rezultātu filtrēšanai. Dati, kuri nepieciešami vēsturei un pārskatiem, tiek saglabāti SQL tabulās ar atbilstošām ārējām atslēgām.
