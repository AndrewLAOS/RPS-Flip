// -------------------- Firebase Config --------------------
const firebaseConfig = {
  apiKey: "AIzaSyAqmG4OxLp7f1kktoLwicGR4O2SLwqNBk0",
  authDomain: "rps-flip.firebaseapp.com",
  databaseURL: "https://rps-flip-default-rtdb.firebaseio.com",
  projectId: "rps-flip",
  storageBucket: "rps-flip.appspot.com",
  messagingSenderId: "1044307931173",
  appId: "1:1044307931173:web:efa8c8bcf4cd82c1e14fcc",
  measurementId: "G-57Z3NG9FJN"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// -------------------- DOM Elements --------------------
const loginSection = document.getElementById('login-section');
const btnGoogleLogin = document.getElementById('btnGoogleLogin');
const loginStatus = document.getElementById('login-status');

const matchSection = document.getElementById('match-section');
const btnCreateMatch = document.getElementById('btnCreateMatch');
const matchIdInput = document.getElementById('match-id-input');
const btnJoinMatch = document.getElementById('btnJoinMatch');
const matchStatus = document.getElementById('match-status');
const generatedMatchIdDisplay = document.getElementById('generated-match-id');

const gameSection = document.getElementById('game-section');
const playerCardInner = document.getElementById('player-card-inner');
const playerCardBack = document.getElementById('player-card-back');
const opponentCardInner = document.getElementById('opponent-card-inner');
const opponentCardBack = document.getElementById('opponent-card-back');
const playerNameLabel = document.getElementById('player-name-label');
const opponentNameLabel = document.getElementById('opponent-name-label');
const choicesDiv = document.getElementById('choices');
const statusText = document.getElementById('status-text');
const loadingSpinner = document.getElementById('loading-spinner');

// NEW: Score labels (make sure these exist in HTML)
let playerScoreLabel = document.getElementById('player-score');
let opponentScoreLabel = document.getElementById('opponent-score');

// -------------------- State Variables --------------------
let currentUser = null;
let matchId = localStorage.getItem('currentMatch') || null;
let playerNumber = null;
let opponentId = null;
let gameRef = null;
let selectedChoice = null;

// -------------------- Utility Functions --------------------
function showLoading(show) { loadingSpinner.style.display = show ? 'block' : 'none'; }

function generateMatchId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

function resetCards() {
  playerCardInner.classList.remove('flipped');
  opponentCardInner.classList.remove('flipped');
  playerCardBack.textContent = '?';
  opponentCardBack.textContent = '?';
}

// -------------------- Auth --------------------
btnGoogleLogin.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => loginStatus.textContent = 'Login failed: ' + err.message);
});

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loginStatus.textContent = `Hello, ${user.displayName}!`;
    loginSection.hidden = true;
    matchSection.hidden = false;
    generatedMatchIdDisplay.textContent = '';
    matchStatus.textContent = '';
    btnCreateMatch.disabled = false;
    btnJoinMatch.disabled = false;
    matchIdInput.disabled = false;
    gameSection.hidden = true;

    if (matchId) startMatch(matchId);
  } else {
    currentUser = null;
    loginStatus.textContent = '';
    loginSection.hidden = false;
    matchSection.hidden = true;
    gameSection.hidden = true;
  }
});

// -------------------- Match Creation / Join --------------------
btnCreateMatch.addEventListener('click', async () => {
  if (!currentUser) return matchStatus.textContent = 'Please sign in first.';

  try {
    btnCreateMatch.disabled = true; btnJoinMatch.disabled = true; matchIdInput.disabled = true;

    showLoading(true);

    let newMatchId = generateMatchId();
    let newMatchRef = db.ref(`matches/${newMatchId}`);
    let snapshot = await newMatchRef.once('value');
    let tries = 0;
    while (snapshot.exists() && tries < 5) {
      newMatchId = generateMatchId();
      newMatchRef = db.ref(`matches/${newMatchId}`);
      snapshot = await newMatchRef.once('value');
      tries++;
    }
    if (tries >= 5) throw new Error('Failed to generate unique match ID');

    await newMatchRef.set({
      player1: { uid: currentUser.uid, name: currentUser.displayName, choice: null, score: 0 },
      player2: null,
      turn: 'player1',
      result: null,
      started: false,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });

    matchId = newMatchId;
    localStorage.setItem('currentMatch', matchId);
    playerNumber = 'player1';
    opponentId = 'player2';

    generatedMatchIdDisplay.textContent = `Match created! Share this code: ${newMatchId}`;
    matchSection.hidden = true;
    gameSection.hidden = false;

    setupGameUI();
    listenForGameUpdates();

  } catch (e) {
    matchStatus.textContent = 'Error creating match: ' + e.message;
  } finally {
    btnCreateMatch.disabled = false;
    btnJoinMatch.disabled = false;
    matchIdInput.disabled = false;
    showLoading(false);
  }
});

btnJoinMatch.addEventListener('click', () => {
  const enteredId = matchIdInput.value.trim().toUpperCase();
  if (!enteredId) return matchStatus.textContent = 'Please enter a Match ID to join.';
  startMatch(enteredId);
});

async function startMatch(id) {
  showLoading(true);
  matchStatus.textContent = `Joining match ${id}...`;
  btnCreateMatch.disabled = true; btnJoinMatch.disabled = true; matchIdInput.disabled = true;

  gameRef = db.ref(`matches/${id}`);
  try {
    const snap = await gameRef.once('value');
    if (!snap.exists()) throw new Error('Match not found.');
    const data = snap.val();

    if (data.player2 && data.player2.uid !== currentUser.uid) {
      matchStatus.textContent = 'Match already has two players.';
      return;
    }

    if (!data.player2) {
      await gameRef.child('player2').set({ uid: currentUser.uid, name: currentUser.displayName, choice: null, score: 0 });
      await gameRef.child('started').set(true);
      playerNumber = 'player2';
      opponentId = 'player1';
    } else {
      if (data.player1.uid === currentUser.uid) { playerNumber = 'player1'; opponentId = 'player2'; }
      else if (data.player2.uid === currentUser.uid) { playerNumber = 'player2'; opponentId = 'player1'; }
      else throw new Error('Match full.');
    }

    matchId = id;
    localStorage.setItem('currentMatch', matchId);
    generatedMatchIdDisplay.textContent = '';
    matchSection.hidden = true;
    gameSection.hidden = false;

    setupGameUI();
    listenForGameUpdates();

  } catch (err) {
    matchStatus.textContent = err.message;
    btnCreateMatch.disabled = false;
    btnJoinMatch.disabled = false;
    matchIdInput.disabled = false;
  } finally { showLoading(false); }
}

// -------------------- Game UI --------------------
function setupGameUI() {
  playerNameLabel.textContent = currentUser.displayName;
  opponentNameLabel.textContent = 'Waiting for opponent...';
  playerScoreLabel.textContent = '0';
  opponentScoreLabel.textContent = '0';
  resetCards();
  renderChoices();
  statusText.textContent = 'Make your choice!';
}

function renderChoices() {
  choicesDiv.innerHTML = '';
  Object.entries(ITEMS).forEach(([key, item]) => {
    const btn = document.createElement('button');
    btn.className = 'choice btn';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', `Choose ${item.name}`);
    btn.textContent = item.icon;

    const label = document.createElement('div');
    label.className = 'choice-label';
    label.textContent = item.name;
    btn.appendChild(label);

    btn.addEventListener('click', () => selectChoice(key));
    choicesDiv.appendChild(btn);
  });
}

// -------------------- Player Choice --------------------
async function selectChoice(choiceKey) {
  if (!gameRef || !playerNumber) return;
  selectedChoice = choiceKey;
  statusText.textContent = `You selected ${ITEMS[choiceKey].name}. Waiting for opponent...`;
  Array.from(choicesDiv.children).forEach(btn => btn.disabled = true);

  try { await gameRef.child(`${playerNumber}/choice`).set(choiceKey); }
  catch (e) { 
    statusText.textContent = 'Error sending choice: ' + e.message;
    Array.from(choicesDiv.children).forEach(btn => btn.disabled = false);
  }
}

// -------------------- Listen for Game Updates --------------------
function listenForGameUpdates() {
  if (!matchId) return;
  if (gameRef) gameRef.off();

  gameRef = db.ref(`matches/${matchId}`);
  gameRef.on('value', snapshot => {
    const data = snapshot.val();
    if (!data) return statusText.textContent = 'Match data lost.';
    if (!data.started) { 
      statusText.textContent = 'Waiting for opponent...';
      opponentNameLabel.textContent = 'Waiting for opponent...';
      resetCards();
      Array.from(choicesDiv.children).forEach(btn => btn.disabled = true);
      return;
    }

    // Update names and scores
    if (data[playerNumber]) { playerNameLabel.textContent = data[playerNumber].name; playerScoreLabel.textContent = data[playerNumber].score; }
    if (data[opponentId]) { opponentNameLabel.textContent = data[opponentId].name; opponentScoreLabel.textContent = data[opponentId].score; } 
    else { opponentNameLabel.textContent = 'Waiting for opponent...'; opponentScoreLabel.textContent = '0'; }

    const playerChoice = data[playerNumber]?.choice;
    const opponentChoice = data[opponentId]?.choice;

    if (playerChoice) flipCard(playerCardInner, playerCardBack, ITEMS[playerChoice].icon);
    else resetCard(playerCardInner, playerCardBack);
    if (opponentChoice) flipCard(opponentCardInner, opponentCardBack, ITEMS[opponentChoice].icon);
    else resetCard(opponentCardInner, opponentCardBack);

    if (playerChoice && opponentChoice) {
      const result = determineResult(playerChoice, opponentChoice);
      if (result === 'win') { statusText.innerHTML = `<span class="win-text">You Win! 🎉</span>`; showConfetti(); }
      else if (result === 'lose') statusText.innerHTML = `<span class="lose-text">You Lose. 😞</span>`;
      else statusText.innerHTML = `<span class="tie-text">It's a Tie! 🤝</span>`;

      if (result === 'win') gameRef.child(`${playerNumber}/score`).transaction(score => (score || 0) + 1);
      if (result === 'lose') gameRef.child(`${opponentId}/score`).transaction(score => (score || 0) + 1);

      setTimeout(() => {
        gameRef.child(`${playerNumber}/choice`).set(null);
        gameRef.child(`${opponentId}/choice`).set(null);
        selectedChoice = null;
        statusText.textContent = 'Make your choice!';
        Array.from(choicesDiv.children).forEach(btn => btn.disabled = false);
        resetCards();
      }, 3000);
    } else {
      if (!playerChoice) { statusText.textContent = 'Make your choice!'; Array.from(choicesDiv.children).forEach(btn => btn.disabled = false); }
      else { statusText.textContent = 'Waiting for opponent...'; Array.from(choicesDiv.children).forEach(btn => btn.disabled = true); }
    }
  });
}

// -------------------- Result Logic --------------------
function determineResult(playerChoice, opponentChoice) {
  if (playerChoice === opponentChoice) return 'tie';
  if (ITEMS[playerChoice].beats.includes(opponentChoice)) return 'win';
  if (ITEMS[opponentChoice].beats.includes(playerChoice)) return 'lose';
  return 'tie';
}

// -------------------- Card Flip Helpers --------------------
function flipCard(cardInner, cardBack, icon) { cardBack.textContent = icon; cardInner.classList.add('flipped'); }
function resetCard(cardInner, cardBack) { cardBack.textContent = '?'; cardInner.classList.remove('flipped'); }

// -------------------- Confetti --------------------
function showConfetti() {
  if (!window.confetti) return;
  confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
}

// -------------------- Back to Bot Mode --------------------
document.getElementById('btnBackToBot').addEventListener('click', () => {
  localStorage.removeItem('currentMatch');
  window.location.href = 'index.html';
});
