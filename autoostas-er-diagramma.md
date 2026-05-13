# Autoostas informācijas sistēmas realitāšu-saišu diagramma

```mermaid
erDiagram
    LIETOTAJS {
        string lietotaja_id PK
        string vards
        string uzvards
        int vecums
        string konta_nosaukums UK
        string paroles_hash
        decimal bilance
        datetime izveidots
    }

    LOMA {
        string lomas_id PK
        string nosaukums
    }

    LIETOTAJA_LOMA {
        string lietotaja_lomas_id PK
        string lietotaja_id FK
        string lomas_id FK
        datetime pieskirta
    }

    SOFERA_PIETEIKUMS {
        string pieteikuma_id PK
        string lietotaja_id FK
        string apliecibas_numurs
        int pieredzes_gadi
        string motivacija
        datetime iesniegts
    }

    MARSRUTS {
        string marsruta_id PK
        string sofera_id FK
        string nosaukums
        string sakums
        string galapunkts
        decimal cena
        datetime izveidots
        datetime atjaunots
    }

    PIETURA {
        string pieturas_id PK
        string nosaukums
    }

    MARSRUTA_PIETURA {
        string marsruta_pieturas_id PK
        string marsruta_id FK
        string pieturas_id FK
        int secibas_numurs
    }

    REISA_LAIKS {
        string reisa_laika_id PK
        string marsruta_id FK
        time izbrauksana
        time ierasanas
        string ievades_veids
        int intervals_minutes
        time atk_sakums
        time atk_beigas
    }

    BILANCES_IEMAKSA {
        string iemaksas_id PK
        string lietotaja_id FK
        decimal summa
        decimal bilance_pec_iemaksas
        datetime iemaksas_laiks
    }

    BILETE {
        string biletes_id PK
        string lietotaja_id FK
        string marsruta_id FK
        string reisa_laika_id FK
        string biletes_numurs
        decimal cena
        boolean apmaksats
        datetime pirkuma_laiks
    }

    CEKS {
        string ceka_id PK
        string biletes_id FK
        string vards
        string uzvards
        datetime pirkuma_laiks
        boolean apmaksats
    }

    LIETOTAJS ||--o{ LIETOTAJA_LOMA : "iegūst"
    LOMA ||--o{ LIETOTAJA_LOMA : "tiek piešķirta"
    LIETOTAJS ||--o{ SOFERA_PIETEIKUMS : "iesniedz"
    LIETOTAJS ||--o{ MARSRUTS : "izveido kā šoferis"
    MARSRUTS ||--o{ MARSRUTA_PIETURA : "satur"
    PIETURA ||--o{ MARSRUTA_PIETURA : "atrodas maršrutā"
    MARSRUTS ||--o{ REISA_LAIKS : "kursē laikos"
    LIETOTAJS ||--o{ BILANCES_IEMAKSA : "veic"
    LIETOTAJS ||--o{ BILETE : "pērk"
    MARSRUTS ||--o{ BILETE : "tiek pirkts"
    REISA_LAIKS ||--o{ BILETE : "izvēlētais laiks"
    BILETE ||--|| CEKS : "ģenerē"
```

## Kardinalitātes

- Viens lietotājs var iegūt vairākas lomas, piemēram, pasažieris, autobusa vadītājs un autoostas vadītājs.
- Viena loma var būt piešķirta daudziem lietotājiem.
- Viens lietotājs var iesniegt vienu vai vairākus šofera pieteikumus.
- Viens autobusa vadītājs var izveidot daudzus maršrutus.
- Vienam maršrutam var būt daudzas pieturas, un viena pietura var būt daudzos maršrutos, tāpēc ir starprealitāte `MARSRUTA_PIETURA`.
- Vienam maršrutam var būt vairāki reisa laiki, gan manuāli ievadīti, gan automātiski atkārtoti pēc intervāla.
- Viens lietotājs var veikt daudzas bilances iemaksas.
- Viens lietotājs var nopirkt daudzas biļetes.
- Viena biļete attiecas uz vienu maršrutu un vienu konkrētu reisa laiku.
- Vienai biļetei tiek ģenerēts viens čeks.

## Piezīme par pārskatiem

Pārskata pogas, piemēram, “Visvairāk iztērēts”, “Visizdevīgākais brauciens”, “Populārākais maršruts”, “Lielākā iemaksa” un “Kopējie ienākumi”, nav atsevišķas glabājamas realitātes. Tie ir aprēķināmi pārskati no `BILETE`, `BILANCES_IEMAKSA`, `LIETOTAJS` un `MARSRUTS` datiem.
