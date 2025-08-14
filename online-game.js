// online-game.js
import { items, itemKeys } from './items.js';

const $ = (sel, root = document) => root.querySelector(sel);

// ---------------------- DOM ----------------------
const loginSection = $('#login-section');
const matchSection = $('#match-section');
const gameSection = $('#game-section');
const btnGoogleLogin = $('#btnGoogleLogin');
const loginStatus = $('#login-status');

const btnCreateMatch = $('#btnCreateMatch');
const btnJoinMatch = $('#btnJoinMatch');
const matchIdInput = $('#match-id-input');
const matchStatus = $('#match-status');
const generatedMatchId = $('#generated-match-id');

const playerCardInner = $('#player-card-inner');
const opponentCardInner = $('#opponent-card-inner');
const playerNameLabel = $('#player-name-label');
const opponentNameLabel = $('#opponent-name-label');
const playerScoreEl = $('#player-score');
const opponentScoreEl = $('#opponent-score');

const choicesDiv = $('#choices');
const statusText = $('#status-text');

const btnLeaveMatch = $('#btnLeaveMatch');
const playerCoinsEl = $('#player-coins');
const inventoryList = $('#inventory-list');
const confettiWrap = $('#confetti-wrap');

// ---------------------- Game State ----------------------
let state = {
  playerId: null,
  playerName: '',
  matchId: null,
  choices: new Set(itemKeys),
  playerChoice: null,
  opponentChoice: null,
  playerScore: 0,
  opponentScore: 0,
  matchRef: null,
  coins: 0,
  inventory: {}, // key: {level, owned}
};

// ---------------------- Firebase ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyAqmG4OxLp7f1kktoLwicGR4O2SLwqNBk0",
  authDomain: "rps-flip.firebaseapp.com",
  databaseURL: "https://rps-flip-default-rtdb.firebaseio.com",
  projectId: "rps-flip",
  storageBucket: "rps-flip.firebasestorage.app",
  messagingSenderId: "1044307931173",
  appId: "1:1044307931173:web:efa8c8bcf4cd82c1e14fcc",
  measurementId: "G-57Z3NG9FJN"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ---------------------- Google Sign-In ----------------------
btnGoogleLogin.onclick = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    state.playerId = user.uid;
    state.playerName = user.displayName || 'Player';
    loginSection.hidden = true;
    matchSection.hidden = false;
    loginStatus.textContent = `Logged in as ${state.playerName}`;
    loadPlayerData();
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
};

// ---------------------- Load Player Data ----------------------
async function loadPlayerData() {
  const snapshot = await db.ref('players/' + state.playerId).get();
  if (snapshot.exists()) {
    const data = snapshot.val();
    state.coins = data.coins || 0;
    state.inventory = data.inventory || {};
  } else {
    state.coins = 0;
    state.inventory = {};
  }
  renderInventory();
  updateCoinsDisplay();
}

// ---------------------- Save Player Data ----------------------
function savePlayerData() {
  db.ref('players/' + state.playerId).set({
    coins: state.coins,
    inventory: state.inventory
  });
}

// ---------------------- Coins & Inventory ----------------------
function updateCoinsDisplay() {
  playerCoinsEl.textContent = state.coins;
}

function renderInventory() {
  inventoryList.innerHTML = '';
  itemKeys.forEach(key => {
    const item = items[key];
    const invItem = state.inventory[key] || { owned: false, level: 0 };
    const div = document.createElement('div');
    div.className = `shop-item ${invItem.owned ? 'owned' : ''} rarity-${item.rarity}`;
    div.innerHTML = `
      <div class="icon">${item.icon}</div>
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="rarity">${item.rarity}</div>
        <div class="level">Level: ${invItem.level}</div>
      </div>
      <button>${invItem.owned ? 'Upgrade' : 'Buy'}</button>
    `;
    const btn = div.querySelector('button');
    btn.onclick = () => {
      if (invItem.owned) {
        const cost = 50 * (invItem.level + 1);
        if (state.coins >= cost) {
          state.coins -= cost;
          invItem.level++;
          state.inventory[key] = invItem;
          savePlayerData();
          renderInventory();
          updateCoinsDisplay();
        } else alert('Not enough coins to upgrade.');
      } else {
        const cost = item.cost || 100;
        if (state.coins >= cost) {
          state.coins -= cost;
          invItem.owned = true;
          invItem.level = 1;
          state.inventory[key] = invItem;
          savePlayerData();
          renderInventory();
          updateCoinsDisplay();
        } else alert('Not enough coins to buy.');
      }
    };
    inventoryList.appendChild(div);
  });
}

// ---------------------- Match ID Generator ----------------------
function generateMatchId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let str = '';
  for (let i = 0; i < length; i++) str += chars[Math.floor(Math.random() * chars.length)];
  return str;
}

// ---------------------- Create / Join Match ----------------------
btnCreateMatch.onclick = async () => {
  const id = generateMatchId();
  state.matchId = id;
  generatedMatchId.textContent = `Match ID: ${id}`;
  matchStatus.textContent = 'Waiting for opponent...';
  gameSection.hidden = false;
  matchSection.hidden = true;

  const matchRef = db.ref('matches/' + id);
  state.matchRef = matchRef;

  await matchRef.set({
    players: { [state.playerId]: { name: state.playerName, score: 0, choice: null } },
    createdAt: Date.now()
  });

  matchRef.on('value', snap => handleMatchUpdate(snap.val()));
  renderChoices();
};

btnJoinMatch.onclick = async () => {
  const id = matchIdInput.value.trim().toUpperCase();
  if (!id) return alert('Enter a valid Match ID');
  state.matchId = id;
  const matchRef = db.ref('matches/' + id);
  const snapshot = await matchRef.get();
  if (!snapshot.exists()) return alert('Match not found');

  state.matchRef = matchRef;
  matchSection.hidden = true;
  gameSection.hidden = false;

  await matchRef.child('players/' + state.playerId).set({ name: state.playerName, score: 0, choice: null });
  matchRef.on('value', snap => handleMatchUpdate(snap.val()));
  renderChoices();
};

// ---------------------- Render Choices ----------------------
function renderChoices() {
  choicesDiv.innerHTML = '';
  state.choices.forEach(key => {
    const item = items[key];
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = item.icon;
    const label = document.createElement('div');
    label.className = 'choice-label';
    label.textContent = item.name;
    btn.appendChild(label);
    btn.onclick = () => makeChoice(key);
    choicesDiv.appendChild(btn);
  });
}

function makeChoice(key) {
  if (!state.matchRef) return;
  state.playerChoice = key;
  disableChoices(true);
  state.matchRef.child('players/' + state.playerId + '/choice').set(key);
  statusText.textContent = 'Choice made! Waiting for opponent...';
}

// ---------------------- Match Updates ----------------------
function handleMatchUpdate(data) {
  if (!data) return;
  const players = data.players || {};
  const opponentId = Object.keys(players).find(pid => pid !== state.playerId);

  if (opponentId) {
    opponentNameLabel.textContent = players[opponentId].name;
    state.opponentScore = players[opponentId].score || 0;
    opponentScoreEl.textContent = state.opponentScore;
    if (players[opponentId].choice === null) matchStatus.textContent = 'Opponent joined! Make your choice!';
  }

  const playerData = players[state.playerId];
  const opponentData = opponentId ? players[opponentId] : null;

  if (playerData && opponentData) {
    if (playerData.choice && opponentData.choice) resolveRound(playerData.choice, opponentData.choice);
  }
}

// ---------------------- Battle Logic ----------------------
function getResult(p1, p2) {
  if (p1 === p2) return 'tie';
  return items[p1].beats.includes(p2) ? 'win' : 'lose';
}

function resolveRound(playerKey, opponentKey) {
  const result = getResult(playerKey, opponentKey);
  const playerCardFront = playerCardInner.querySelector('.card-front');
  const opponentCardFront = opponentCardInner.querySelector('.card-front');

  playerCardFront.textContent = items[playerKey].icon;
  opponentCardFront.textContent = items[opponentKey].icon;

  if (result === 'win') {
    statusText.textContent = 'You Win!';
    state.playerScore++;
    state.coins += 20;
    playerScoreEl.textContent = state.playerScore;
    updateCoinsDisplay();
    spawnConfetti();
  } else if (result === 'lose') {
    statusText.textContent = 'You Lose!';
    state.opponentScore++;
    opponentScoreEl.textContent = state.opponentScore;
  } else {
    statusText.textContent = 'Tie!';
  }

  savePlayerData();

  setTimeout(() => {
    if (state.matchRef) {
      state.matchRef.child('players/' + state.playerId + '/choice').set(null);
      if (opponentKey) state.matchRef.child('players/' + Object.keys(state.matchRef._delegate._path.pieces_).find(pid => pid !== state.playerId) + '/choice').set(null);
    }
    disableChoices(false);
    statusText.textContent = 'Make your choice!';
    playerCardFront.textContent = '?';
    opponentCardFront.textContent = '?';
  }, 2000);
}

// ---------------------- Disable Choices ----------------------
function disableChoices(disabled) {
  Array.from(choicesDiv.children).forEach(btn => btn.disabled = disabled);
}

// ---------------------- Leave Match ----------------------
btnLeaveMatch.onclick = () => {
  if (!state.matchRef) return;
  state.matchRef.child('players/' + state.playerId).remove();
  state.matchRef = null;
  state.matchId = null;
  gameSection.hidden = true;
  matchSection.hidden = false;
  matchStatus.textContent = '';
  playerCardInner.querySelector('.card-front').textContent = '?';
  opponentCardInner.querySelector('.card-front').textContent = '?';
  playerScoreEl.textContent = '0';
  opponentScoreEl.textContent = '0';
};

// ---------------------- Confetti ----------------------
function spawnConfetti() {
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
    confettiWrap.appendChild(dot);
    setTimeout(() => dot.remove(), 3000);
  }
}

// ---------------------- Initialize ----------------------
statusText.textContent = 'Sign in to start playing!';
