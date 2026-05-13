# Autoostas informācijas sistēmas modelis

## Konteksta modelis

```mermaid
flowchart LR
  Viesis["Viesis"] --> AIS["Autoostas informācijas sistēma"]
  Pasazieris["Pasažieris"] --> AIS
  Soferis["Autobusa vadītājs"] --> AIS
  Vaditajs["Autoostas vadītājs"] --> AIS
  AIS --> DB[("SQLite datu bāze")]
  AIS --> Ceks["QR kods un čeks"]
```

## 1. līmeņa datu plūsmas diagramma

```mermaid
flowchart TB
  U["Lietotājs"] --> A1["1. Reģistrācija un pieteikšanās"]
  A1 --> D1[("users")]
  D1 --> A1

  U --> A2["2. Maršrutu meklēšana"]
  A2 --> D2[("routes, route_stops, route_schedules")]
  D2 --> A2
  A2 --> U

  U --> A3["3. Bilances papildināšana"]
  A3 --> D1
  A3 --> D3[("top_ups")]

  U --> A4["4. Biļetes pirkšana"]
  A4 --> D1
  A4 --> D2
  A4 --> D4[("purchases")]
  A4 --> U

  S["Šoferis"] --> A5["5. Maršruta izveide"]
  A5 --> D2

  M["Autoostas vadītājs"] --> A6["6. Pārskatu skatīšana"]
  A6 --> D1
  A6 --> D2
  A6 --> D3
  A6 --> D4
  A6 --> M
```

## Skatu punkti

| Skatu punkts | Intereses | Sistēmas reakcija |
|---|---|---|
| Viesis | Atrast maršrutu un saprast, vai sistēmu ir vērts lietot | Maršrutu meklēšana bez pieteikšanās |
| Pasažieris | Ērti nopirkt biļeti un redzēt bilanci | Konts, bilance, pirkumi, QR kods, čeks |
| Šoferis | Veidot maršrutus ar vairākiem reisa laikiem | Atsevišķa maršruta izveides/labošanas lapa |
| Autoostas vadītājs | Pārraudzīt sistēmas datus | Pārvaldības panelis un pārskatu pogas |

## Galvenie procesi

### Reģistrācija

Lietotājs ievada vārdu, uzvārdu, vecumu, konta nosaukumu un paroli. Klienta puse pārbauda laukus, serveris vēlreiz pārbauda obligātos laukus, paroles politiku un konta nosaukuma unikalitāti. Ja dati ir korekti, serveris saglabā lietotāju SQL datu bāzē.

### Biļetes pirkšana

Lietotājs izvēlas maršrutu un reisa laiku. Serveris pārbauda lietotāju, maršrutu, reisa laiku un bilanci. Ja naudas pietiek, serveris vienā darbībā samazina bilanci un saglabā pirkumu. Klients parāda QR kodu un čeku.

### Maršruta izveide

Šoferis aizpilda maršruta formu atsevišķā lapā. Sistēma pieņem manuālus laikus vai ģenerē atkārtojošus laikus pēc norādītā intervāla. Serveris saglabā maršruta pamatdatus, pieturvietas un reisa laikus saistītās tabulās.
