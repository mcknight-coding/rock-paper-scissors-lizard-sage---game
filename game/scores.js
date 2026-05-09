// scores.js
// Handles loading, updating, saving, and exporting score data.
// All score state lives here — no other file should touch scores directly.

const DATA_PATH = "./data/results.json";
const DEFAULT_STATS = () => ({
  Paper: 0, Rock: 0, Scissors: 0, Lizard: 0, Sage: 0,
  Wins: 0, Loses: 0, Draws: 0
});

// In-memory score store keyed by player/opponent name
let scores = {
  Player:   DEFAULT_STATS(),
  Charmin:  DEFAULT_STATS(),
  Rocky:    DEFAULT_STATS(),
  Cutter:   DEFAULT_STATS(),
  Iggy:     DEFAULT_STATS(),
  Leonard:  DEFAULT_STATS()
};

// Loads scores from results.json into memory
// Returns a promise so callers can await it
async function loadScores() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();
    scores = data;
    console.log("Scores loaded successfully.");
  } catch (error) {
    console.warn("Could not load scores, using defaults.", error);
    // scores stays as DEFAULT_STATS — game still works
  }
}

// Records one move for a named player (e.g. "Player" or "Cutter")
function recordMove(name, move) {
  if (!scores[name]) return;
  scores[name][move]++;
}

// Records the outcome for both player and opponent
function recordOutcome(playerName, opponentName, outcome) {
  if (outcome === "win") {
    scores[playerName].Wins++;
    scores[opponentName].Loses++;
  } else if (outcome === "lose") {
    scores[playerName].Loses++;
    scores[opponentName].Wins++;
  } else {
    scores[playerName].Draws++;
    scores[opponentName].Draws++;
  }
}

// Returns scores for a specific player as an object
function getScores(name) {
  return scores[name] || DEFAULT_STATS();
}

// Serializes all scores to a JSON string for download
function exportScoresAsJSON() {
  return JSON.stringify(scores, null, 2);
}

// Builds a human-readable summary of the player's session
function buildPlayerSummary() {
  const p = scores.Player;
  return [
    "===== Your Results =====",
    `Rock: ${p.Rock}    Paper: ${p.Paper}    Scissors: ${p.Scissors}`,
    `Lizard: ${p.Lizard}    Sage: ${p.Sage}`,
    `Wins: ${p.Wins}  |  Losses: ${p.Loses}  |  Draws: ${p.Draws}`
  ].join("\n");
}

// Generates a downloadable Blob URL from the current scores
function generateDownloadUrl() {
  const content = exportScoresAsJSON();
  const blob = new Blob([content], { type: "application/json" });

  // Revoke old URL to avoid memory leaks
  if (generateDownloadUrl._lastUrl) {
    URL.revokeObjectURL(generateDownloadUrl._lastUrl);
  }
  const url = URL.createObjectURL(blob);
  generateDownloadUrl._lastUrl = url;
  return url;
}
