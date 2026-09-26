# Portale Festa Nazionale 2026 — demo GitHub Pages

Versione ridotta e funzionante con 4 sezioni:

- **Risultati**: legge direttamente `data/risultati_2026.xlsx` e gestisce `ASPIRANTI`, `ADOL`, `BEACH-JUN`.
- **Mappa**: usa Leaflet + OpenStreetMap e legge `data/luoghi.json`.
- **Contatti**: legge `data/contatti.json`.
- **Documenti**: legge `data/documenti.json`; i PDF vanno inseriti in `documents/`.

## Pubblicazione su GitHub Pages

1. Crea un repository GitHub.
2. Carica tutto il contenuto di questa cartella nella root del repository.
3. Vai in **Settings → Pages**.
4. In **Build and deployment**, scegli **Deploy from a branch**.
5. Seleziona `main` e `/ (root)`.
6. Salva.

## Aggiornare i risultati

1. Aggiorna il tuo Excel originale.
2. Lascialo ricalcolare e salvalo.
3. Sostituisci `data/risultati_2026.xlsx` nel repository.
4. Fai commit.

Il sito controlla automaticamente il file ogni 60 secondi.

## Aggiornare luoghi e contatti

Modifica rispettivamente:

- `data/luoghi.json`
- `data/contatti.json`

## Aggiungere documenti

Esempio:

1. copia `regolamento-calcio7.pdf` dentro `documents/`;
2. in `data/documenti.json`, imposta:

```json
{"titolo":"Regolamento Calcio a 7","descrizione":"Regolamento sportivo","file":"regolamento-calcio7.pdf","icona":"⚽"}
```

## Test locale

Dalla cartella del progetto:

```bash
python -m http.server 8000
```

poi visita `http://localhost:8000`.
