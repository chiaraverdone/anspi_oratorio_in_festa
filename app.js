const XLSX_PATH = "data/risultati_2026.xlsx";

const COMPETITIONS = [
  {
    id: "aspiranti",
    sheet: "ASPIRANTI",
    sport: "Calcio a 7",
    category: "Aspiranti",
    icon: "⚽",
    codePattern: /^ASP-/i,
    match: { code: 1, teamA: 2, teamB: 3, scoreA: 4, scoreB: 5, contextCol: 2 },
    standings: { startRow: 16, endRow: 19, teamCol: 11, pointsCol: 12 }
  },
  {
    id: "adolescenti",
    sheet: "ADOL",
    sport: "Calcio a 7",
    category: "Adolescenti",
    icon: "⚽",
    codePattern: /^\s*AD-/i,
    match: { code: 1, teamA: 2, teamB: 3, scoreA: 4, scoreB: 5, contextCol: 2 },
    standings: { startRow: 16, endRow: 19, teamCol: 11, pointsCol: 12 }
  },
  {
    id: "beach-jun",
    sheet: "BEACH-JUN",
    sport: "Beach Volley",
    category: "Juniores",
    icon: "🏐",
    codePattern: /^BJ-/i,
    match: { code: 0, teamA: 1, teamB: 2, scoreA: 3, scoreB: 4, contextCol: 1 },
    standings: { startRow: 17, endRow: 20, teamCol: 10, pointsCol: 11 }
  }
];

let competitionData = [];
let activeCompetitionId = null;

const $ = (selector) => document.querySelector(selector);
const grid = $("#competitionGrid");
const detail = $("#detailSection");
const detailHeader = $("#detailHeader");
const matchesPanel = $("#matchesPanel");
const standingsPanel = $("#standingsPanel");
const errorBox = $("#errorBox");

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function hasScore(value) {
  return value !== undefined && value !== null && clean(value) !== "" && clean(value) !== "-";
}

function extractDateLabel(text) {
  const value = clean(text).replace(/\s+/g, " ");
  if (!value) return "";
  const match = value.match(/(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+\d{1,2}\s+\w+\s+20\d{2}/i);
  if (match) return match[0].replace(/^./, c => c.toUpperCase());
  return "";
}

function detectSession(text) {
  const value = clean(text).toLowerCase();
  if (value.includes("mattina")) return "Mattina";
  if (value.includes("pomeriggio")) return "Pomeriggio";
  return "";
}

function parseCompetition(workbook, config) {
  const ws = workbook.Sheets[config.sheet];
  if (!ws) throw new Error(`Foglio ${config.sheet} non trovato nel file Excel.`);

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
  let currentDate = "";
  let currentSession = "";
  const matches = [];

  rows.forEach((row, rowIndex) => {
    const context = clean(row[config.match.contextCol]);
    const session = detectSession(context);
    if (session) currentSession = session;

    const date = extractDateLabel(context);
    if (date) currentDate = date;

    const code = clean(row[config.match.code]);
    if (!config.codePattern.test(code)) return;

    const scoreAValue = row[config.match.scoreA];
    const scoreBValue = row[config.match.scoreB];
    const played = hasScore(scoreAValue) && hasScore(scoreBValue);

    matches.push({
      code,
      row: rowIndex + 1,
      teamA: clean(row[config.match.teamA]),
      teamB: clean(row[config.match.teamB]),
      scoreA: played ? clean(scoreAValue) : null,
      scoreB: played ? clean(scoreBValue) : null,
      played,
      date: currentDate || "Data da definire",
      session: currentSession || ""
    });
  });

  const standings = [];
  for (let r = config.standings.startRow; r <= config.standings.endRow; r++) {
    const row = rows[r] || [];
    const team = clean(row[config.standings.teamCol]);
    const points = clean(row[config.standings.pointsCol]);
    if (!team || team.toLowerCase().includes("classifica")) continue;
    standings.push({ team, points: points === "" ? "–" : points });
  }

  return {
    ...config,
    matches,
    standings,
    playedCount: matches.filter(m => m.played).length
  };
}

async function loadWorkbook({ preserveView = true } = {}) {
  const previous = activeCompetitionId;
  errorBox.classList.add("hidden");
  $("#syncPill").textContent = "Aggiornamento…";

  try {
    const response = await fetch(`${XLSX_PATH}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Impossibile leggere ${XLSX_PATH} (${response.status}).`);
    const lastModified = response.headers.get("last-modified");
    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    competitionData = COMPETITIONS.map(config => parseCompetition(workbook, config));
    renderCompetitionGrid();

    const now = new Date();
    $("#syncPill").textContent = "Dati caricati";
    if (lastModified) {
      const d = new Date(lastModified);
      $("#lastUpdate").textContent = `File pubblicato: ${d.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}`;
    } else {
      $("#lastUpdate").textContent = `Controllo effettuato: ${now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`;
    }

    if (preserveView && previous) openCompetition(previous, false);
  } catch (error) {
    console.error(error);
    $("#syncPill").textContent = "Errore";
    errorBox.textContent = `${error.message} Apri il sito tramite GitHub Pages o un web server locale: il browser non può leggere il file Excel se index.html viene aperto direttamente con file://.`;
    errorBox.classList.remove("hidden");
  }
}

function renderCompetitionGrid() {
  grid.innerHTML = competitionData.map(c => `
    <button class="competition-card" type="button" data-competition="${c.id}">
      <span class="sport-icon" aria-hidden="true">${c.icon}</span>
      <span class="sport-label">${c.sport}</span>
      <span class="competition-name">${c.category}</span>
      <span class="competition-meta">
        <span class="result-count">${c.playedCount}/${c.matches.length} risultati</span>
        <span class="arrow">→</span>
      </span>
    </button>
  `).join("");

  grid.querySelectorAll("[data-competition]").forEach(button => {
    button.addEventListener("click", () => openCompetition(button.dataset.competition));
  });
}

function openCompetition(id, scroll = true) {
  const data = competitionData.find(c => c.id === id);
  if (!data) return;
  activeCompetitionId = id;

  grid.closest("section").classList.add("hidden");
  detail.classList.remove("hidden");

  detailHeader.innerHTML = `
    <div class="detail-title-card">
      <div class="sport-label">${data.icon} ${data.sport}</div>
      <h2>${data.category}</h2>
      <div class="detail-stats">
        <span class="stat-chip">${data.matches.length} partite</span>
        <span class="stat-chip">${data.playedCount} risultati inseriti</span>
        <span class="stat-chip">${data.standings.length} squadre</span>
      </div>
    </div>
  `;

  renderMatches(data);
  renderStandings(data);
  activateTab("matches");
  if (scroll) detail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function groupMatches(matches) {
  const groups = [];
  matches.forEach(match => {
    const key = `${match.date}__${match.session}`;
    let group = groups.find(g => g.key === key);
    if (!group) {
      group = { key, date: match.date, session: match.session, matches: [] };
      groups.push(group);
    }
    group.matches.push(match);
  });
  return groups;
}

function renderMatches(data) {
  if (!data.matches.length) {
    matchesPanel.innerHTML = `<div class="empty-state">Nessuna partita trovata nel foglio ${data.sheet}.</div>`;
    return;
  }

  matchesPanel.innerHTML = groupMatches(data.matches).map(group => `
    <div class="day-block">
      <div class="day-heading">
        <h4>${group.date}</h4>
        ${group.session ? `<span class="session-badge">${group.session}</span>` : ""}
      </div>
      ${group.matches.map(match => `
        <article class="match-card">
          <div class="team">${match.teamA}</div>
          <div class="score ${match.played ? "played" : ""}">${match.played ? `${match.scoreA} – ${match.scoreB}` : "—"}</div>
          <div class="team away">${match.teamB}</div>
          <div class="match-sub">
            <span>${match.code}</span>
            <span>${match.played ? "Risultato inserito" : "Da giocare"}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `).join("");
}

function renderStandings(data) {
  if (!data.standings.length) {
    standingsPanel.innerHTML = `<div class="empty-state">Classifica non disponibile nel foglio ${data.sheet}.</div>`;
    return;
  }
  standingsPanel.innerHTML = `
    <div class="standings-card">
      ${data.standings.map((row, index) => `
        <div class="standing-row">
          <div class="rank">${index + 1}</div>
          <div class="standing-team">${row.team}</div>
          <div class="points">${row.points}<small>punti</small></div>
        </div>
      `).join("")}
    </div>
  `;
}

function activateTab(tab) {
  document.querySelectorAll(".segment").forEach(button => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  matchesPanel.classList.toggle("hidden", tab !== "matches");
  standingsPanel.classList.toggle("hidden", tab !== "standings");
}

$("#backBtn").addEventListener("click", () => {
  activeCompetitionId = null;
  detail.classList.add("hidden");
  grid.closest("section").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#refreshBtn").addEventListener("click", () => loadWorkbook({ preserveView: true }));

document.querySelectorAll(".segment").forEach(button => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
});

loadWorkbook({ preserveView: false });
setInterval(() => loadWorkbook({ preserveView: true }), 60_000);
