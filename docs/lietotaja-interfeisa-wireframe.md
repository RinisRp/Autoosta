# Autoostas informācijas sistēmas wireframe

Šis wireframe apraksta galvenos lietotāja saskarnes skatus pēc ķīmijas sistēmas parauga. Tas nav gala dizains, bet ekrānu izvietojuma plāns.

Vizuālā shēmas versija, kas veidota līdzīgi parauga PDF failam, atrodas failos `docs/Autoostas_vizualais_wireframe.pdf` un `docs/Autoostas_vizualais_wireframe.png`.

## 1. Sākumlapa

```text
+------------------------------------------------------------------+
| Autoostas informācijas sistēma        [Pieteikties] [Izveidot]   |
|                                                                  |
| No kurienes: [________________]  Uz kurieni: [________________]  |
|                                      [Meklēt] [Rādīt visus]      |
|                                                                  |
| Maršrutu rezultāti                                               |
| +---------------------+  +---------------------+                 |
| | Rīga - Liepāja      |  | Rīga - Daugavpils   |                 |
| | Laiki, pieturas     |  | Laiki, pieturas     |                 |
| | Cena [Izvēlēties]   |  | Cena [Izvēlēties]   |                 |
| +---------------------+  +---------------------+                 |
+------------------------------------------------------------------+
```

## 2. Pieteikšanās logs

```text
+------------------------------------+
| Pieteikties                         |
| Konta nosaukums [_______________]   |
| Parole         [_______________]    |
| [ ] Parādīt paroli                  |
| Kļūdas teksts, ja dati nav pareizi  |
|                    [Atcelt] [Ieiet] |
+------------------------------------+
```

## 3. Konta izveides logs

```text
+------------------------------------------------+
| Izveidot kontu                                  |
| Vārds [_________] Uzvārds [_________]           |
| Vecums [___] Konta nosaukums [_______________] |
| Parole [_______________]                        |
| Atkārtot paroli [_______________]               |
| Redzamas validācijas kļūdas                     |
|                              [Atcelt] [Izveidot]|
+------------------------------------------------+
```

## 4. Pasažiera skats pēc pieteikšanās

```text
+------------------------------------------------------------------+
| Jānis Bērziņš  Bilance: 25.00 EUR  [Profils] [Iziet]             |
|                                                                  |
| Maršruta izvēle                                                   |
| Rīga - Liepāja | 08:10-11:35 | 12.50 EUR                         |
| Reisa laiki: [08:10] [12:10] [16:10]                              |
|                                              [Apmaksāt]           |
|                                                                  |
| Pēc apmaksas: QR kods + [Lejupielādēt čeku]                      |
+------------------------------------------------------------------+
```

## 5. Bilances logs

```text
+------------------------------------------------+
| Bilance: 25.00 EUR                              |
| Papildināt summu [____] [Papildināt bilanci]    |
| Iepriekšējās izmaksas                           |
| - Rīga - Liepāja, 12.50 EUR, pirkuma laiks      |
| - Jelgava - Rīga, 4.20 EUR, pirkuma laiks       |
+------------------------------------------------+
```

## 6. Šofera profila un pieteikuma logs

```text
+-----------------------------------------------+
| Profils: Jānis Bērziņš                         |
| Statuss: Pasažieris                            |
| [Pieteikties par šoferi]                       |
+-----------------------------------------------+

+-----------------------------------------------+
| Šofera pieteikums                              |
| Apliecības numurs [____________]               |
| Pieredzes gadi [___]                           |
| Motivācija [______________________________]    |
| Kļūda, ja vecums - pieredze < 18               |
|                         [Atcelt] [Iesniegt]    |
+-----------------------------------------------+
```

## 7. Maršruta izveides lapa

```text
+------------------------------------------------------------------+
| Jauns maršruts                                      [Atpakaļ]     |
| Nosaukums [_________________]  Cena [____]                       |
| Sākumpunkts [_______________]  Galapunkts [_______________]      |
|                                                                  |
| Pieturvietas                                                     |
| [Saldus________________] [-]                                      |
|             [+]                                                  |
| [Brocēni_______________] [-]                                      |
|             [+]                                                  |
| [Grobiņa_______________] [-]                                      |
|                                                                  |
| Reisa laiki: [Manuāli] [Atkārtojas]                              |
| Manuāli: [08:00] [11:00] [+ laiks]                               |
| Atkārtojas: No [08:00] līdz [18:00] ik pēc [1h v] ilgums [180]   |
|                                                                  |
|                                               [Saglabāt maršrutu] |
+------------------------------------------------------------------+
```

## 8. Autoostas vadītāja pārvaldības lapa

```text
+------------------------------------------------------------------+
| Autoostas pārvaldība                            [Atpakaļ]        |
| Lietotāji | Maršruti | Iemaksas | Biļetes                       |
|                                                                  |
| Pārskati: [Visvairāk iztērēts] [Populārākais maršruts]           |
|           [Visizdevīgākais brauciens] [Kopējie ienākumi]         |
|                                                                  |
| Tabula ar izvēlētajiem datiem                                     |
+------------------------------------------------------------------+
```
