import { items } from './items.js';
import { animateBattle } from './animations.js';

const $ = (sel, root = document) => root.querySelector(sel);

// ---------------------- DOM Elements ----------------------
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
const matchIdDisplay = $('#match-id-display');

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

const btnBackToBot = $('#btnBackToBot');
const btnMatchupChart = $('#btnMatchupChart');

const shopList = $('#shop-list');
const btnToggleShop = $('#btnToggleShop');
const btnResetInventory = $('#btnResetInventory');

// ---------------------- Game State ----------------------
let state = {
  playerId: null,
  playerName: '',
  matchId: null,
  matchRef: null,
  playerChoice: null,
  opponentChoice: null,
  hasChosenThisRound: false,
  playerScore: 0,
  opponentScore: 0,
  coins: 0,
  inventory: {
    rock: { owned: true, level: 1 },
    paper: { owned: true, level: 1 },
    scissors: { owned: true, level: 1 }
  },
  choices: new Set(['rock','paper','scissors']),
  roundInProgress: false
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
if (btnGoogleLogin) {
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
      await loadPlayerData();
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };
}

// ---------------------- Load & Save Player Data ----------------------
async function loadPlayerData() {
  if (!state.playerId) return;
  const snapshot = await db.ref('players/' + state.playerId).get();
  if (snapshot.exists()) {
    const data = snapshot.val();
    state.coins = data.coins ?? 0;
    state.inventory = { ...state.inventory, ...(data.inventory || {}) };
    Object.keys(state.inventory).forEach(key => { if (state.inventory[key]?.owned) state.choices.add(key); });
  } else {
    state.coins = 0;
  }
  renderInventory();
  renderChoices();
  renderShop();
  updateCoinsDisplay();
}

function savePlayerData() {
  if (!state.playerId) return;
  db.ref('players/' + state.playerId).set({
    coins: state.coins,
    inventory: state.inventory
  });
}

// ---------------------- UI Renders ----------------------
function updateCoinsDisplay() {
  if (playerCoinsEl) playerCoinsEl.textContent = state.coins;
}

function renderInventory() {
  if (!inventoryList) return;
  inventoryList.innerHTML = '';
  Object.keys(items).forEach(key => {
    const invItem = state.inventory[key] || { owned: (key==='rock'||key==='paper'||key==='scissors'), level: 1 };
    if (!invItem.owned) return;
    const item = items[key];
    const div = document.createElement('div');
    div.className = `inventory-item rarity-${item.rarity} owned`;
    div.innerHTML = `
      <div class="icon">${item.icon}</div>
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="level">Lvl ${invItem.level}</div>
      </div>
    `;
    inventoryList.appendChild(div);
  });
}

function renderShop() {
  if (!shopList) return;
  shopList.innerHTML = '';
  Object.keys(items).forEach(key => {
    const item = items[key];
    const invItem = state.inventory[key] || { owned: false, level: 1 };
    const div = document.createElement('div');
    div.className = `shop-item rarity-${item.rarity} ${invItem.owned ? 'owned' : ''}`;
    div.innerHTML = `
      <div class="icon">${item.icon}</div>
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="level">Lvl ${invItem.level}</div>
        <div class="cost">Cost: ${item.cost || 100} 🪙</div>
      </div>
      <button>${invItem.owned ? 'Upgrade' : 'Buy'}</button>
      <div class="purchased-text" style="color:green;font-size:0.8em;display:none;">Purchased</div>
    `;
    const btn = div.querySelector('button');
    const purchasedText = div.querySelector('.purchased-text');

    btn.onclick = () => {
      if (invItem.owned) {
        const cost = 50 * (invItem.level + 1);
        if (state.coins >= cost) {
          state.coins -= cost;
          invItem.level++;
          state.inventory[key] = invItem;
          savePlayerData();
          renderShop();
          renderChoices();
          updateCoinsDisplay();
        } else alert('Not enough coins to upgrade.');
      } else {
        const cost = item.cost || 100;
        if (state.coins >= cost) {
          state.coins -= cost;
          invItem.owned = true;
          invItem.level = 1;
          state.inventory[key] = invItem;
          state.choices.add(key);
          if (purchasedText) purchasedText.style.display = 'block';
          savePlayerData();
          renderShop();
          renderChoices();
          updateCoinsDisplay();
        } else alert('Not enough coins to buy.');
      }
    };
    shopList.appendChild(div);
  });
}

if (btnToggleShop) {
  btnToggleShop.onclick = () => {
    const panel = document.getElementById('shop-panel');
    if (panel) panel.hidden = !panel.hidden;
  };
}

function renderChoices() {
  if (!choicesDiv) return;
  choicesDiv.innerHTML = '';
  Array.from(state.choices).forEach(key => {
    const item = items[key];
    if (!item) return;
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerHTML = `<div class="icon">${item.icon}</div><div class="choice-label">${item.name}</div>`;
    btn.onclick = () => makeChoice(key);
    choicesDiv.appendChild(btn);
  });
}

function disableChoices(disabled) {
  if (!choicesDiv) return;
  Array.from(choicesDiv.children).forEach(btn => { btn.disabled = disabled; });
}

// ---------------------- Choice & Match Updates ----------------------
function makeChoice(key) {
  if (!state.matchRef || state.roundInProgress || state.playerChoice) return;
  state.playerChoice = key;
  state.hasChosenThisRound = true;
  disableChoices(true);
  state.matchRef.child('players/' + state.playerId + '/choice').set(key);
  if (statusText) statusText.textContent = 'Choice made! Waiting for opponent...';
}

function handleMatchUpdate(data) {
  if (!data) return;
  const players = data.players || {};
  const opponentId = Object.keys(players).find(pid => pid !== state.playerId);
  const playerData = players[state.playerId];
  const opponentData = opponentId ? players[opponentId] : null;

  if (opponentId) {
    if (opponentNameLabel) opponentNameLabel.textContent = players[opponentId]?.name || 'Opponent';
    state.opponentScore = players[opponentId]?.score || 0;
    if (opponentScoreEl) opponentScoreEl.textContent = state.opponentScore;
  }

  // Start round only when both have chosen
  if (playerData && opponentData && playerData.choice && opponentData.choice && !state.roundInProgress) {
    resolveRound(playerData.choice, opponentData.choice, opponentId);
  }
}

// ---------------------- Battle Logic ----------------------
function getResult(p1, p2) {
  if (p1 === p2) return 'tie';
  return items[p1].beats.includes(p2) ? 'win' : 'lose';
}

// ---------------------- Updated Resolve Round ----------------------
async function resolveRound(playerKey, opponentKey, opponentId) {
  const playerCard = playerCardInner;
  const opponentCard = opponentCardInner;

  state.roundInProgress = true;
  disableChoices(true);

  await Promise.all([
    animateFlip(playerCard, items[playerKey].icon, items[playerKey].name),
    animateFlip(opponentCard, items[opponentKey].icon, items[opponentKey].name),
  ]);

  await animateBattle(playerCard, playerKey, opponentCard, opponentKey);

  const result = getResult(playerKey, opponentKey);
  const rarityValues = { Common:1, Uncommon:2, Rare:3, Epic:4, Legendary:5 };
  const baseWin = 5;
  const baseLose = 2;
  const playerRarity = rarityValues[items[playerKey].rarity] || 1;

  if (result === 'win') {
    const coinsEarned = baseWin * playerRarity;
    state.coins += coinsEarned;
    state.playerScore++;
    if (statusText) statusText.textContent = `You Win! +${coinsEarned} 🪙`;
  } else if (result === 'lose') {
    const coinsLost = baseLose * playerRarity;
    state.coins = Math.max(0, state.coins - coinsLost);
    state.opponentScore++;
    if (statusText) statusText.textContent = `You Lose! -${coinsLost} 🪙`;
  } else {
    if (statusText) statusText.textContent = 'Tie!';
  }

  if (playerScoreEl) playerScoreEl.textContent = state.playerScore;
  if (opponentScoreEl) opponentScoreEl.textContent = state.opponentScore;
  updateCoinsDisplay();
  savePlayerData();
  confettiBurst(result);

  // Reset Firebase choices
  if (state.matchRef) {
    await state.matchRef.child('players/' + state.playerId + '/choice').set(null);
    if (opponentId) await state.matchRef.child('players/' + opponentId + '/choice').set(null);
  }

  // Reset local state
  state.playerChoice = null;
  state.opponentChoice = null;
  state.hasChosenThisRound = false;

  setTimeout(() => {
    resetBattleCards();
    renderChoices();
    disableChoices(false);
    state.roundInProgress = false;
    if (statusText) statusText.textContent = 'Make your choice!';
  }, 300);
}

// ---------------------- Card Flip Animation ----------------------
async function animateFlip(cardEl, icon, name) {
  if (!cardEl) return;
  const iconEl = cardEl.querySelector('.card-front') || cardEl.querySelector('.icon');
  const nameEl = cardEl.querySelector('.card-back') || cardEl.querySelector('.small.muted');
  await cardEl.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], { duration: 200 }).finished;
  if (iconEl) iconEl.textContent = icon;
  if (nameEl) nameEl.textContent = name;
  await cardEl.animate([{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0deg)' }], { duration: 200 }).finished;
}

function resetBattleCards() {
  [playerCardInner, opponentCardInner].forEach(card => {
    if (!card) return;
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');
    if (front) front.textContent = '?';
    if (back) back.textContent = '?';
  });
}

// ---------------------- Confetti ----------------------
function confettiBurst(result) {
  if (!confettiWrap) return;
  confettiWrap.innerHTML = '';
  if (result === 'tie') return;
  for (let i = 0; i < 50; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.backgroundColor = `hsl(${Math.random()*360},100%,70%)`;
    dot.style.animationDelay = (Math.random() * 2) + 's';
    confettiWrap.appendChild(dot);
  }
  setTimeout(() => confettiWrap.innerHTML = '', 3000);
}

// ---------------------- Match ID Helpers ----------------------
function generateMatchId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let str = '';
  for (let i = 0; i < length; i++) str += chars[Math.floor(Math.random() * chars.length)];
  return str;
}

function showMatchId(id) {
  if (generatedMatchId) generatedMatchId.textContent = id ? `Match ID: ${id}` : '';
  if (matchIdDisplay) matchIdDisplay.textContent = id ? `Match: ${id}` : '';
}

// ---------------------- Create / Join / Leave Match ----------------------
if (btnCreateMatch) {
  btnCreateMatch.onclick = async () => {
    if (!state.playerId) return alert('Please sign in first.');
    const id = generateMatchId();
    state.matchId = id;
    showMatchId(id);
    if (matchStatus) matchStatus.textContent = 'Waiting for opponent...';
    if (gameSection) gameSection.hidden = false;
    if (matchSection) matchSection.hidden = true;

    const matchRef = db.ref('matches/' + id);
    state.matchRef = matchRef;

    await matchRef.set({
      players: { [state.playerId]: { name: state.playerName, score: 0, choice: null } },
      createdAt: Date.now()
    });

    matchRef.on('value', snap => handleMatchUpdate(snap.val()));
    renderChoices();
    disableChoices(false);
    if (statusText) statusText.textContent = 'Make your choice!';
  };
}

if (btnJoinMatch) {
  btnJoinMatch.onclick = async () => {
    if (!state.playerId) return alert('Please sign in first.');
    const id = (matchIdInput.value || '').trim().toUpperCase();
    if (!id) return alert('Enter a valid Match ID');

    const matchRef = db.ref('matches/' + id);
    const snapshot = await matchRef.get();
    if (!snapshot.exists()) return alert('Match not found');

    state.matchId = id;
    state.matchRef = matchRef;
    if (matchSection) matchSection.hidden = true;
    if (gameSection) gameSection.hidden = false;
    showMatchId(id);

    await matchRef.child('players/' + state.playerId).set({ name: state.playerName, score: 0, choice: null });

    matchRef.on('value', snap => handleMatchUpdate(snap.val()));
    renderChoices();
    disableChoices(false);
    if (statusText) statusText.textContent = 'Make your choice!';
  };
}

if (btnLeaveMatch) {
  btnLeaveMatch.onclick = async () => {
    if (state.matchRef) {
      await state.matchRef.child('players/' + state.playerId).remove();
      state.matchRef.off();
    }
    state.matchRef = null;
    state.matchId = null;
    state.playerChoice = null;
    state.opponentChoice = null;
    state.hasChosenThisRound = false;
    state.playerScore = 0;
    state.opponentScore = 0;
    state.roundInProgress = false;

    showMatchId('');
    resetBattleCards();
    renderChoices();
    disableChoices(false);

    if (gameSection) gameSection.hidden = true;
    if (matchSection) matchSection.hidden = false;
    if (generatedMatchId) generatedMatchId.textContent = '';
    if (statusText) statusText.textContent = '';
  };
}

// ---------------------- Reset Inventory & Coins ----------------------
if (btnResetInventory) {
  btnResetInventory.onclick = () => {
    state.coins = 0;
    state.inventory = {
      rock: { owned: true, level: 1 },
      paper: { owned: true, level: 1 },
      scissors: { owned: true, level: 1 }
    };
    state.choices = new Set(['rock','paper','scissors']);
    savePlayerData();
    renderInventory();
    renderChoices();
    renderShop();
    updateCoinsDisplay();
  };
}

// ---------------------- Top Buttons ----------------------
if (btnBackToBot) btnBackToBot.onclick = () => window.location.href = 'index.html';
if (btnMatchupChart) btnMatchupChart.onclick = () => window.location.href = 'matchups.html';
