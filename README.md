# Autoostas informācijas sistēma

Lokāla tīmekļa lietotne autoostai ar SQL datu bāzi. Sistēmā var meklēt maršrutus, izveidot kontu, pieteikties, papildināt bilanci, pirkt biļetes ar QR kodu un čeku, veidot šofera maršrutus un pārvaldīt autoostu.

## Palaišana

No projekta mapes:

```powershell
python server.py 8001
```

Pārlūkā atver:

```text
http://127.0.0.1:8001/
```

Ja 8001 ports ir aizņemts, var izmantot citu, piemēram:

```powershell
python server.py 8002
```

## Datu bāze

- SQL shēma: `database/schema.sql`
- SQLite fails: `autoosta.db`
- Backend serveris: `server.py`

Serveris glabā lietotājus, šofera pieteikumus, maršrutus, pieturas, reisa laikus, bilances iemaksas un pirktās biļetes SQL tabulās.

## Testi

```powershell
python -m unittest discover -s tests -v
```

## Dokumentācija

- Projekta dokumentācija: `docs/projekta-dokumentacija.md`
- Sistēmas apraksts pēc parauga: `docs/autoostas-sistemas-apraksts.md`
- Wireframe: `docs/lietotaja-interfeisa-wireframe.md`
- Testu plāns: `docs/testu-plans.md`
- Sistēmas modelis: `docs/sistemas-modelis.md`
- Datu vārdnīca: `docs/datu-vardnica.md`
- Ievades datu apraksts: `docs/ievades-datu-apraksts.md` un `docs/Autoostas_ievades_datu_apraksts.docx`
- Iesniegšanas pārbaude un melnraksti: `docs/iesniegsanas-parbaude-un-melnraksti.md` un `docs/Autoostas_iesniegsanas_parbaude_un_melnraksti.docx`
- ER diagramma: `autoostas-er-diagramma.md`

## Noklusējuma tehniskais konts

Sistēmas maršrutu sākotnējais lietotājs:

- konts: `sistema`
- parole: `Sistema!1`
