// ui.js
// Everything that touches the DOM lives here.
// Imports logic from game.js, scores.js, and opponents.js.
// This is the only file that reads from or writes to the page.

// ─── State ───────────────────────────────────────────────────────────────────

let currentOpponent  = null; // set on page load
let isPlaying        = false; // prevents spamming Play during pause
let imageResetTimer  = null;  // tracks the image reset timeout so it can be cancelled
let winStreak        = 0;  // wins in a row against current opponent
let lossStreak       = 0;  // losses in a row against current opponent

// ─── DOM helpers ─────────────────────────────────────────────────────────────

// Message player reads from result or for next actions available 
function setOutput(text) {
  document.getElementById("output1").innerHTML = text;
}

// Loads image for player to see related to results or next action available
function setImage(src) {
  document.getElementById("resultImg").src = `assets/images/${src}`;
}

// ─── Scoreboard ──────────────────────────────────────────────────────────────

// Chooses new opponent after 3x wins or loses in a row.
function checkStreakAndSwitch(outcome) {
  if (outcome === "win") {
    winStreak++;
    lossStreak = 0;
  } else if (outcome === "lose") {
    lossStreak++;
    winStreak = 0;
  } else {
    lossStreak = 0;
    winStreak = 0;
  }
  if (winStreak >= 3 || lossStreak >= 3) {
    const result = winStreak >= 3 ? "have defeated" : "were deafeted by";
    const oldName     = currentOpponent.name; // Saves OLD name before switching
    winStreak  = 0;
    lossStreak = 0;
    currentOpponent = pickRandomOpponent(); // from opponents.js
    setOutput(`You ${result} ${oldName}! New opponent: ${currentOpponent.name} — good luck!`);
  }
}

// Updates displayed player wins/loses/draws
function updateScoreboard() {
  const s = getScores("Player"); // from scores.js
  document.getElementById("scoreWins").textContent   = s.Wins;
  document.getElementById("scoreLosses").textContent = s.Loses;
  document.getElementById("scoreDraws").textContent  = s.Draws;
}

// ─── Audio ───────────────────────────────────────────────────────────────────

// Tracks which audio file is in use. 
const audioCache = {};

// Ensures initial audio file loads without delay. 
function warmUpAudio() {
  Object.values(audioCache).forEach(audio => {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
  });
}

// Queues audio files to be ready to play.
function preloadAudio() {
  const files = ["Victory.mp3", "Loser.mp3", "Draw.mp3"];
  files.forEach(filename => {
    const audio = new Audio(`assets/audio/${filename}`);
    audio.preload = "auto";
    audioCache[filename] = audio;
  });
}

// Plays selected audio file from queue.
function playAudio(filename) {
  const audio = audioCache[filename];
  if (!audio) {
    console.warn("Audio not preloaded:", filename);
    return;
  }
  audio.currentTime = 0;
  audio.play().catch(err => console.warn("Audio failed:", err));
}

// ─── UI states ───────────────────────────────────────────────────────────────

// Loads win condition images and text
function showWin(reason) {
  setOutput(reason);
  setImage("winner.png");
  playAudio("Victory.mp3");
}

// Loads lose condition images and text
function showLose(reason) {
  setOutput(reason);
  setImage("you_lose.png");
  playAudio("Loser.mp3");
}

// Loads draw condition images and text
function showDraw(reason) {
  setOutput(reason);
  setImage("draw.png");
  playAudio("Draw.mp3");
}

// Loads rules screen images and text
function showRules() {
  setOutput("How to play — see the diagram below");
  setImage("rules.png");
}

// Loads rules for valid keys.
function showPrompt() {
  document.getElementById("myInput").value =
    "Enter: p=Paper  r=Rock  s=Scissors  l=Lizard  sg=Sage";
}

// Loads reminder of what are valid keys.
function showInvalidInput() {
  setOutput("Invalid input — try: 1-5, or p, r, s, l, sg");
  showRules();
}

// ─── Main game flow ──────────────────────────────────────────────────────────

function playGame() {
  // Block play if button is still locked
  if (isPlaying) return;

  // Cancel any pending image reset from the previous round
  if (imageResetTimer) {
    clearTimeout(imageResetTimer);
    imageResetTimer = null;
  }

  const rawInput   = document.getElementById("myInput").value;  // gets input from user
  const playerMove = parsePlayerInput(rawInput);                // from game.js

  // Checks if input is valid
  if (!playerMove) {
    showInvalidInput();
    showPrompt();
    return;
  }

  const computerMove = getOpponentMove(currentOpponent);               // from opponents.js
  const outcome      = decideOutcome(playerMove, computerMove);        // from game.js
  const reason       = getResultReason(playerMove, computerMove, outcome); // from game.js

  // Update scores
  recordMove("Player", playerMove);                        // from scores.js
  recordMove(currentOpponent.name, computerMove);          // from scores.js
  recordOutcome("Player", currentOpponent.name, outcome);  // from scores.js

  // Show result immediately
  if (outcome === "win")       showWin(reason);
  else if (outcome === "lose") showLose(reason);
  else                         showDraw(reason);

  // Update live scoreboard
  updateScoreboard();

  // Check win/loss streak — may switch opponent
  checkStreakAndSwitch(outcome);

  // Update download link
  document.getElementById("downloadLink").href = generateDownloadUrl(); // from scores.js

  // Log to console for debugging
  console.log(`${currentOpponent.name} played ${computerMove}`);
  console.log(`Result: ${outcome} — ${reason}`);

  // Lock Play button for 3 seconds
  isPlaying = true;
  const playBtn = document.querySelector(".button-row button");
  playBtn.disabled    = true;
  playBtn.textContent = "Wait...";

  setTimeout(() => {
    isPlaying           = false;
    playBtn.disabled    = false;
    playBtn.textContent = "Play";

    // Reset image 4 seconds after button unlocks
    // Stored in imageResetTimer so a new round can cancel it
    imageResetTimer = setTimeout(() => {
      setImage("rules.png");
      imageResetTimer = null;
    }, 4000);

  }, 2000);
}

// ─── Download handler ────────────────────────────────────────────────────────


function saveClicked() {
  document.getElementById("downloadLink").href = generateDownloadUrl();
}

// ─── Page init ───────────────────────────────────────────────────────────────

// Runs once after the full page (HTML, images, scripts) has loaded..
window.addEventListener("load", async () => {
  preloadAudio();          // Fetch/buffer audio files early so they play instantly later
  await loadScores();      // Pull saved score data (async — waits for it before continuing)

  // Pick a random opponent for this session and announce them
  currentOpponent = pickRandomOpponent();
  console.log(`Today's opponent: ${currentOpponent.name}`);
  setOutput(`Your opponent is ${currentOpponent.name} — good luck!`);
  setImage("rules.png");
  updateScoreboard();
  
  // Pre-assign the download URL so the link works even before saveClicked() fires
  document.getElementById("downloadLink").href = generateDownloadUrl(); 
 
  // The main text input field
  const input = document.getElementById("myInput");

  // Warm up audio on first interaction — runs once then removes itself
  function onFirstInteraction() {
    warmUpAudio();
    input.removeEventListener("click", onFirstInteraction);
    input.removeEventListener("keydown", onFirstInteraction);
  }
  input.addEventListener("click", onFirstInteraction);
  input.addEventListener("keydown", onFirstInteraction);

  // Clear the input when the user clicks into it, but only if it's showing the prompt text.
  // Clearing unconditionally wiped any value the user had already typed.
  input.addEventListener("focus", () => {
    if (input.value.startsWith("Enter:")) {
      input.value = "";
    }
  });

  // If the user clicks away and left the field empty, restores the rules prompt
  input.addEventListener("blur", () => {
    if (input.value.trim() === "") {
      showPrompt();
    }
  });

  // Submit the guess when the user presses Enter — no button click required.
  // Removed "1" shortcut here: it fired playGame() before the "1" landed in
  // the input box, so parsePlayerInput always read an empty/stale value.
  // The 1-5 shortcuts still work — type the number, then press Enter.
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      playGame();
    }
  });
});
