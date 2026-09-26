# Demo risultati 2026 — GitHub Pages

Questa è una versione ridotta del sito risultati che legge **direttamente** il file Excel `data/risultati_2026.xlsx`.

## Fogli inclusi nella demo

- `ASPIRANTI` — Calcio a 7, categoria Aspiranti
- `ADOL` — Calcio a 7, categoria Adolescenti
- `BEACH-JUN` — Beach Volley, categoria Juniores

Il sito mostra:

- elenco delle categorie;
- partite raggruppate per data e sessione (mattina/pomeriggio);
- risultati inseriti nel file Excel;
- classifica già calcolata nel file Excel;
- aggiornamento automatico ogni 60 secondi.

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository GitHub, per esempio `risultati-festa-2026`.
2. Carica **tutti** i file e le cartelle di questo progetto nella root del repository.
3. Vai in **Settings → Pages**.
4. In **Build and deployment**, scegli `Deploy from a branch`.
5. Seleziona branch `main` e cartella `/ (root)`.
6. Salva e attendi la pubblicazione del sito.

## Come aggiornare i risultati

Continua a lavorare sul tuo Excel originale normalmente:

1. inserisci i risultati;
2. lascia che Excel aggiorni le classifiche;
3. salva il file;
4. nel repository sostituisci `data/risultati_2026.xlsx` con la nuova versione;
5. fai **Commit changes**.

Il commit diventa quindi il tuo comando di pubblicazione. GitHub Pages aggiornerà il file e il sito lo rileggerà automaticamente.

## Importante

Il file deve mantenere:

- lo stesso nome: `risultati_2026.xlsx`;
- i nomi dei tre fogli usati dalla demo;
- la struttura delle celle dei tre fogli.

Le formule delle classifiche vengono calcolate da Excel, non dal sito. Prima del commit è quindi importante aprire il workbook in Excel, lasciarlo ricalcolare e salvarlo.

## Test locale

Non aprire `index.html` con doppio clic (`file://`), perché i browser bloccano il caricamento del file Excel locale.

Da terminale, nella cartella del progetto, puoi usare:

```bash
python -m http.server 8000
```

poi aprire:

```text
http://localhost:8000
```

## Estensione agli altri fogli

Le categorie sono configurate all'inizio di `app.js`, nell'array `COMPETITIONS`. Dopo aver validato la demo, gli altri fogli possono essere aggiunti con la stessa logica.
