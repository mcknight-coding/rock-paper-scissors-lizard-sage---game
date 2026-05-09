// opponents.js
// Defines the 5 AI opponents and their weighted move pools.
// Each opponent favors one move by having it appear more often in their pool.

// Tracks last opponent so the same one is never picked twice in a row
let lastOpponentName = null;

const OPPONENTS = {
  Charmin: {
    name: "Charmin",
    // Charmin favors throwing Paper — appears 3x in pool
    pool: ["Paper", "Paper", "Paper", "Rock", "Scissors", "Lizard", "Sage"]
  },
  Rocky: {
    name: "Rocky",
    // Rocky favors throwing Rock
    pool: ["Rock", "Rock", "Rock", "Paper", "Scissors", "Lizard", "Sage"]
  },
  Cutter: {
    name: "Cutter",
    // Cutter favors throwing Scissors
    pool: ["Scissors", "Scissors", "Scissors", "Paper", "Rock", "Lizard", "Sage"]
  },
  Iggy: {
    name: "Iggy",
    // Iggy favors throwing Lizard
    pool: ["Lizard", "Lizard", "Lizard", "Paper", "Rock", "Scissors", "Sage"]
  },
  Leonard: {
    name: "Leonard",
    // Leonard favors throwing Sage
    pool: ["Sage", "Sage", "Sage", "Paper", "Rock", "Scissors", "Lizard"]
  }
};

// Returns a randomly selected opponent object
function pickRandomOpponent() {
  const names = Object.keys(OPPONENTS);
  let randomName;

  do {
    randomName = names[Math.floor(Math.random() * names.length)];
  } while (randomName === lastOpponentName);

  lastOpponentName = randomName;
  return OPPONENTS[randomName];
}

// Returns a random move from the given opponent's weighted pool
function getOpponentMove(opponent) {
  const pool = opponent.pool;
  return pool[Math.floor(Math.random() * pool.length)];
}
