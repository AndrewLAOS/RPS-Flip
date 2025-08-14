// online-game.js
import { items, itemKeys } from './items.js';
import { animateBattle } from './animations.js';

const $ = (sel, root = document) => root.querySelector(sel);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------------------- DOM References ----------------------
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

const coinsDisplay = $('#coins-display');
const shopItemsDiv = $('#shop-items');
const battleChoicesDiv = $('#battle-choices');
const battleStatus = $('#battle-status');
const playerIcon = $('#player-icon');
const opponentIcon = $('#bot-icon'); // reuse bot card as opponent
const playerItemName = $('#player-item-name');
const opponentItemName = $('#bot-item-name');
const roundCounter = $('#round-counter');
const streakCounter = $('#streak-counter');
const confettiWrap = $('#confetti-wrap');
const resetBtn = $('#reset-btn');

// ---------------------- Back to Bot ----------------------
const backToBotButtons = [
  $('#btnBackToBotLogin'),
  $('#btnBackToBotMatch'),
  $('#btnBackToBotGame')
];
backToBotButtons.forEach(btn => btn.onclick = () => window.location.href = 'bot.html');

// ---------------------- Firebase ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyAqmG4OxLp7f1kktoLwicGR4O2SLwqNBk0",
  authDomain: "rps-flip.firebaseapp.com",
    databaseURL: "https://rps-flip-default-rtdb.firebaseio.com",
  projectId: "rps-flip",
  storageBucket: "rps-flip.appspot.com",
  messagingSenderId: "1044307931173",
  appId: "1:1044307931173:web:efa8c8bcf4cd82c1e14fcc"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ---------------------- Game State ----------------------
let state = {
  playerId: null,
  playerName: '',
  matchId: null,
  playerChoice: null,
  opponentChoice: null,
  playerScore: 0,
  opponentScore: 0,
  matchRef: null,
  coins: 0,
  streak: 0,
  round: 0,
  shopOrder: [...itemKeys],
  inventory: new Set(['rock', 'paper', 'scissors']),
};

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
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
};

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
    players: { [state.playerId]: { name: state.playerName, score: 0, choice: null, coins: 0, inventory: [...state.inventory] } },
    createdAt: Date.now()
  });

  matchRef.on('value', snap => handleMatchUpdate(snap.val()));
  renderBattleChoices();
  renderCoins();
  renderShop();
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

  await matchRef.child('players/' + state.playerId).set({ name: state.playerName, score: 0, choice: null, coins: 0, inventory: [...state.inventory] });
  matchRef.on('value', snap => handleMatchUpdate(snap.val()));
  renderBattleChoices();
  renderCoins();
  renderShop();
};

// ---------------------- Render Functions ----------------------
function renderCoins() {
  coinsDisplay.textContent = state.coins;
}

function renderShop() {
  shopItemsDiv.innerHTML = '';
  state.shopOrder.forEach(key => {
    const item = items[key];
    if (!item) return;
    const owned = state.inventory.has(key);
    const div = document.createElement('div');
    div.className = `shop-item rarity-${item.rarity}${owned ? ' owned' : ''}`;
    div.innerHTML = `
      <div class="icon">${item.icon}</div>
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="rarity">Cost: ${item.cost} 🪙</div>
      </div>
      <button ${owned ? 'disabled' : ''}>${owned ? 'Owned' : 'Buy'}</button>
    `;
    const btn = div.querySelector('button');
    btn.onclick = () => {
      if (state.coins < item.cost) return;
      state.coins -= item.cost;
      state.inventory.add(key);
      renderCoins();
      renderShop();
      renderBattleChoices();
    };
    shopItemsDiv.appendChild(div);
  });
}

function renderBattleChoices() {
  battleChoicesDiv.innerHTML = '';
  Array.from(state.inventory).forEach(key => {
    const item = items[key];
    if (!item) return;
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = `${item.icon} ${item.name}`;
    btn.onclick = () => makeChoice(key);
    battleChoicesDiv.appendChild(btn);
  });
}

// ---------------------- Make Choice ----------------------
function makeChoice(key) {
  if (!state.matchRef) return;
  state.playerChoice = key;
  disableChoices(true);
  state.matchRef.child('players/' + state.playerId + '/choice').set(key);
  statusText.textContent = 'Choice made! Waiting for opponent...';
}

// ---------------------- Handle Match Updates ----------------------
function handleMatchUpdate(data) {
  if (!data) return;
  const players = data.players || {};
  const opponentId = Object.keys(players).find(pid => pid !== state.playerId);
  const playerData = players[state.playerId];
  const opponentData = opponentId ? players[opponentId] : null;

  if (opponentId) {
    opponentNameLabel.textContent = players[opponentId].name;
    opponentScoreEl.textContent = players[opponentId].score || 0;
    if (!opponentData.choice) matchStatus.textContent = 'Opponent joined! Make your choice!';
  }

  if (playerData && opponentData && playerData.choice && opponentData.choice) {
    resolveRound(playerData.choice, opponentData.choice, opponentId);
  }
}

// ---------------------- Battle Logic ----------------------
const rarityValues = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5 };

function getResult(p1, p2) {
  if (p1 === p2) return 'tie';
  return items[p1].beats.includes(p2) ? 'win' : 'lose';
}

async function animateFlip(cardEl, newIcon, newName) {
  await cardEl.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], { duration: 200 }).finished;
  cardEl.querySelector('.card-front').textContent = newIcon;
  cardEl.querySelector('.small-muted')?.textContent = newName;
  await cardEl.animate([{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0deg)' }], { duration: 200 }).finished;
}

async function resolveRound(playerKey, opponentKey, opponentId) {
  const playerCardFront = playerCardInner.querySelector('.card-front');
  const opponentCardFront = opponentCardInner.querySelector('.card-front');

  await Promise.all([
    animateFlip(playerCardInner, items[playerKey].icon, items[playerKey].name),
    animateFlip(opponentCardInner, items[opponentKey].icon, items[opponentKey].name)
  ]);

  const result = getResult(playerKey, opponentKey);
  const playerRarity = rarityValues[items[playerKey].rarity] || 1;
  const opponentRarity = rarityValues[items[opponentKey].rarity] || 1;

  if (result === 'win') {
    state.playerScore++;
    state.coins += 5 * playerRarity;
    battleStatus.textContent = `You Win! +${5 * playerRarity} coins`;
  } else if (result === 'lose') {
    state.opponentScore++;
    battleStatus.textContent = 'You Lose!';
  } else {
    battleStatus.textContent = 'Tie!';
  }

  roundCounter.textContent = ++state.round;
  streakCounter.textContent = result === 'win' ? ++state.streak : 0;
  playerScoreEl.textContent = state.playerScore;
  opponentScoreEl.textContent = state.opponentScore;
  renderCoins();

  if (state.coins >= 200) confettiBurst();

  // Reset after 2 seconds
  setTimeout(() => {
    state.matchRef.child('players/' + state.playerId + '/choice').set(null);
    if (opponentId) state.matchRef.child('players/' + opponentId + '/choice').set(null);
    disableChoices(false);
    statusText.textContent = 'Make your choice!';
    playerCardFront.textContent = '?';
    opponentCardFront.textContent = '?';
  }, 2000);
}

// ---------------------- Confetti ----------------------
function confettiBurst() {
  confettiWrap.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
    dot.style.animationDelay = (Math.random() * 2) + 's';
    confettiWrap.appendChild(dot);
  }
  setTimeout(() => confettiWrap.innerHTML = '', 3000);
}

// ---------------------- Helpers ----------------------
function disableChoices(disabled) {
  Array.from(battleChoicesDiv.children).forEach(btn => btn.disabled = disabled);
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

// ---------------------- Init ----------------------
statusText.textContent = 'Sign in to start playing!';
renderBattleChoices();
renderCoins();
renderShop();
