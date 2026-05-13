# Autoostas informācijas sistēmas datu vārdnīca

## `users`

| Lauks | Tips | Apraksts |
|---|---|---|
| `username` | TEXT, PK | Unikāls konta nosaukums |
| `first_name` | TEXT | Lietotāja vārds |
| `last_name` | TEXT | Lietotāja uzvārds |
| `age` | INTEGER | Lietotāja vecums |
| `password_hash` | TEXT | Sālīts paroles hash |
| `balance` | REAL | Konta bilance EUR |
| `is_driver` | INTEGER | Vai lietotājs ir autobusa vadītājs |
| `is_station_manager` | INTEGER | Vai lietotājs ir autoostas vadītājs |
| `driver_since` | TEXT | Datums/laiks, kad lietotājs kļuva par šoferi |
| `station_manager_since` | TEXT | Datums/laiks, kad lietotājs kļuva par autoostas vadītāju |
| `created_at` | TEXT | Izveides laiks |
| `updated_at` | TEXT | Pēdējo izmaiņu laiks |

## `driver_applications`

| Lauks | Tips | Apraksts |
|---|---|---|
| `id` | TEXT, PK | Pieteikuma identifikators |
| `username` | TEXT, FK | Lietotājs, kurš piesakās par šoferi |
| `first_name` | TEXT | Vārds pieteikuma brīdī |
| `last_name` | TEXT | Uzvārds pieteikuma brīdī |
| `license_number` | TEXT | Vadītāja apliecības numurs |
| `experience_years` | INTEGER | Pieredze gados |
| `motivation` | TEXT | Pieteikuma pamatojums |
| `created_at` | TEXT | Pieteikuma izveides laiks |

## `routes`

| Lauks | Tips | Apraksts |
|---|---|---|
| `id` | TEXT, PK | Maršruta identifikators |
| `name` | TEXT | Maršruta nosaukums |
| `start_point` | TEXT | Sākumpunkts |
| `end_point` | TEXT | Galapunkts |
| `price` | REAL | Biļetes cena EUR |
| `driver_username` | TEXT, FK | Šoferis, kas izveidoja maršrutu |
| `departure` | TEXT | Noklusētais izbraukšanas laiks |
| `arrival` | TEXT | Noklusētais ierašanās laiks |
| `schedule_mode` | TEXT | Manuāls vai atkārtojošs reisa laiku režīms |
| `recurrence_start_time` | TEXT | Atkārtošanās sākuma laiks |
| `recurrence_end_time` | TEXT | Atkārtošanās beigu laiks |
| `recurrence_interval_minutes` | INTEGER | Atkārtošanās intervāls minūtēs |
| `recurrence_duration_minutes` | INTEGER | Brauciena ilgums minūtēs |
| `created_at` | TEXT | Izveides laiks |
| `updated_at` | TEXT | Pēdējo izmaiņu laiks |

## `route_stops`

| Lauks | Tips | Apraksts |
|---|---|---|
| `id` | TEXT, PK | Pieturvietas ieraksta identifikators |
| `route_id` | TEXT, FK | Saistītais maršruts |
| `stop_name` | TEXT | Pieturvietas nosaukums |
| `sequence_number` | INTEGER | Pieturvietas secība maršrutā |

## `route_schedules`

| Lauks | Tips | Apraksts |
|---|---|---|
| `id` | TEXT, PK | Reisa laika identifikators |
| `route_id` | TEXT, FK | Saistītais maršruts |
| `departure` | TEXT | Izbraukšanas laiks |
| `arrival` | TEXT | Ierašanās laiks |
| `sequence_number` | INTEGER | Laika secība sarakstā |

## `purchases`

| Lauks | Tips | Apraksts |
|---|---|---|
| `id` | TEXT, PK | Pirkuma identifikators |
| `ticket_number` | TEXT | Biļetes numurs |
| `username` | TEXT, FK | Pircējs |
| `first_name` | TEXT | Pircēja vārds pirkuma brīdī |
| `last_name` | TEXT | Pircēja uzvārds pirkuma brīdī |
| `route_id` | TEXT, FK | Nopirktais maršruts |
| `route_name` | TEXT | Maršruta nosaukums pirkuma brīdī |
| `start_point` | TEXT | Sākumpunkts |
| `end_point` | TEXT | Galapunkts |
| `departure` | TEXT | Izbraukšanas laiks |
| `arrival` | TEXT | Ierašanās laiks |
| `schedule_id` | TEXT | Izvēlētais reisa laiks |
| `price` | REAL | Samaksātā cena |
| `paid` | INTEGER | Vai pirkums ir apmaksāts |
| `created_at` | TEXT | Pirkuma laiks |

## `top_ups`

| Lauks | Tips | Apraksts |
|---|---|---|
| `id` | TEXT, PK | Iemaksas identifikators |
| `username` | TEXT, FK | Lietotājs, kurš papildināja bilanci |
| `first_name` | TEXT | Vārds iemaksas brīdī |
| `last_name` | TEXT | Uzvārds iemaksas brīdī |
| `amount` | REAL | Iemaksātā summa |
| `balance_after` | REAL | Bilance pēc iemaksas |
| `created_at` | TEXT | Iemaksas laiks |
