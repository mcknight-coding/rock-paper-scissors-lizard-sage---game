// game.js
// Core game logic — win/loss rules, input parsing, game state.
// No DOM access in this file. Pure logic only.

const MOVES = ["Paper", "Rock", "Scissors", "Lizard", "Sage"];

// Maps each move to the two moves it beats, and the reason why
const WIN_CONDITIONS = {
  Paper:    { beats: [MOVES[1], MOVES[4]],     reasons: { Rock: "covers", Sage: "disproves" } },
  Rock:     { beats: [MOVES[2], MOVES[3]], reasons: { Scissors: "crushes", Lizard: "crushes" } },
  Scissors: { beats: [MOVES[0], MOVES[3]],   reasons: { Paper: "cuts", Lizard: "decapitates" } },
  Lizard:   { beats: [MOVES[0], MOVES[4]],    reasons: { Paper: "eats", Sage: "poisons" } },
  Sage:    { beats: [MOVES[2], MOVES[1]],  reasons: { Scissors: "smashes", Rock: "vaporizes" } }
};

// Parses raw text input from the player into a valid move string
// Returns the move string, or null if input is invalid
function parsePlayerInput(input) {
  const cleaned = input.trim().toLowerCase();

  // Number key shortcuts: 1=Paper, 2=Rock, 3=Scissors, 4=Lizard, 5=Sage
  if (cleaned === "1") return MOVES[0];
  if (cleaned === "2") return MOVES[1];
  if (cleaned === "3") return MOVES[2];
  if (cleaned === "4") return MOVES[3];
  if (cleaned === "5") return MOVES[4];

  // Letter shortcuts
  if (cleaned === "p"  || cleaned.startsWith("pa")) return MOVES[0];
  if (cleaned === "r"  || cleaned.startsWith("ro")) return MOVES[1];
  if (cleaned === "s"  || cleaned.startsWith("sc")) return MOVES[2];
  if (cleaned === "l"  || cleaned.startsWith("li")) return MOVES[3];
  if (cleaned === "sg" || cleaned.startsWith("sa")) return MOVES[4];

  return null;// invalid input
}

// Determines the result of a round
// Returns "win", "lose", or "draw"
function decideOutcome(playerMove, computerMove) {
  if (playerMove === computerMove) return "draw";
  if (WIN_CONDITIONS[playerMove].beats.includes(computerMove)) return "win";
  return "lose";
}

// Returns a human-readable reason string for the result
// e.g. "Scissors decapitates Lizard"
function getResultReason(playerMove, computerMove, outcome) {
  if (outcome === "draw") return `Both chose ${playerMove} — it's a draw!`;
  if (outcome === "win") {
    const reason = WIN_CONDITIONS[playerMove].reasons[computerMove];
    return `${playerMove} ${reason} ${computerMove} — you win!`;
  }
  // lose
  const reason = WIN_CONDITIONS[computerMove].reasons[playerMove];
  return `${computerMove} ${reason} ${playerMove} — you lose.`;
}
