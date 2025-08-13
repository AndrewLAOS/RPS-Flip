/* online-game.js
   Updated: match ID display fixed
*/

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
const matchIdDisplay = document.getElementById('matchIdDisplay'); // display span for Match ID

const gameSection = document.getElementById('game-section');
const playerCardInner = document.getElementById('player-card-inner');
const playerCardBack = document.getElementById('player-card-back');
const opponentCardInner = document.getElementById('opponent-card-inner');
const opponentCardBack = document.getElementById('opponent-card-back');
const playerNameLabel = document.getElementById('player-name-label');
const opponentNameLabel = document.getElementById('opponent-name-label');
const playerScoreLabel = document.getElementById('player-score');
const opponentScoreLabel = document.getElementById('opponent-score');
const choicesDiv = document.getElementById('choices');
const statusText = document.getElementById('status-text');
const loadingSpinner = document.getElementById('loading-spinner');

const shopSection = document.getElementById('shop-section');
const coinBalanceEl = document.getElementById('coin-balance');
const shopItemsEl = document.getElementById('shop-items');
const inventoryItemsEl = document.getElementById('inventory-items');
const btnClaimDaily = document.getElementById('btnClaimDaily');

// -------------------- State --------------------
let currentUser = null;
let matchId = localStorage.getItem('currentMatch') || null;
let playerNumber = null;
let opponentId = null;
let gameRef = null;

// Fallback ITEMS if not globally provided
const DEFAULT_ITEMS = {
  rock:     { name: 'Rock',     icon: '🪨', beats: ['scissors'] },
  paper:    { name: 'Paper',    icon: '📄', beats: ['rock'] },
  scissors: { name: 'Scissors', icon: '✂️', beats: ['paper'] }
};
const ITEM_MAP = (typeof ITEMS !== 'undefined' && ITEMS) ? ITEMS : DEFAULT_ITEMS;

// Simple cosmetic shop items
const SHOP_ITEMS = [
  { id: 'hat_top',   name: 'Top Hat',    price: 120, icon: '🎩' },
  { id: 'shades',    name: 'Cool Shades',price: 100, icon: '😎' },
  { id: 'sparkles',  name: 'Sparkles',   price: 80,  icon: '✨' },
  { id: 'fire_trail',name: 'Fire Trail', price: 150, icon: '🔥' },
];

// -------------------- Utils --------------------
function showLoading(show) { if (loadingSpinner) loadingSpinner.style.display = show ? 'block' : 'none'; }
function generateMatchId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}
function flipCard(cardInner, cardBack, icon) { if (cardBack) cardBack.textContent = icon; if (cardInner) cardInner.classList.add('flipped'); }
function resetCard(cardInner, cardBack) { if (cardBack) cardBack.textContent = '?'; if (cardInner) cardInner.classList.remove('flipped'); }
function resetCards() { resetCard(playerCardInner, playerCardBack); resetCard(opponentCardInner, opponentCardBack); }
function showConfetti() { if (!window.confetti) return; confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } }); }

// -------------------- Auth --------------------
btnGoogleLogin?.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => loginStatus.textContent = 'Login failed: ' + err.message);
});

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    loginStatus.textContent = `Hello, ${user.displayName}!`;
    loginSection.hidden = true;
    matchSection.hidden = false;
    gameSection.hidden = true;
    shopSection.hidden = false;

    await ensureUserDoc(user);
    startUserListeners(user);

    if (matchId) startMatch(matchId);
  } else {
    currentUser = null;
    loginStatus.textContent = '';
    loginSection.hidden = false;
    matchSection.hidden = true;
    gameSection.hidden = true;
    shopSection.hidden = true;
    stopUserListeners();
  }
});

// -------------------- User Profile & Shop --------------------
const userRefs = { profile: null, coins: null, inventory: null };
const userUnsubs = [];

async function ensureUserDoc(user) {
  const baseRef = db.ref(`users/${user.uid}`);
  const snap = await baseRef.once('value');
  if (!snap.exists()) {
    await baseRef.set({
      name: user.displayName || 'Player',
      coins: 200,
      inventory: {},
      equipped: null,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      lastDaily: 0
    });
  }
}

function startUserListeners(user) {
  userRefs.profile = db.ref(`users/${user.uid}`);
  userRefs.coins = userRefs.profile.child('coins');
  userRefs.inventory = userRefs.profile.child('inventory');

  const coinsCb = userRefs.coins.on('value', s => {
    const coins = s.val() || 0;
    if (coinBalanceEl) coinBalanceEl.textContent = coins;
    renderShop(coins);
  });
  userUnsubs.push(() => userRefs.coins.off('value', coinsCb));

  const invCb = userRefs.inventory.on('value', s => {
    const inv = s.val() || {};
    renderInventory(inv);
    userRefs.coins.once('value').then(c => renderShop(c.val() || 0, inv));
  });
  userUnsubs.push(() => userRefs.inventory.off('value', invCb));
}

function stopUserListeners() { userUnsubs.splice(0).forEach(unsub => unsub()); }

function renderShop(coins, inventory = null) {
  if (!shopItemsEl) return;
  const inv = inventory || {};
  shopItemsEl.innerHTML = '';
  SHOP_ITEMS.forEach(item => {
    const owned = !!inv[item.id];
    const li = document.createElement('div');
    li.className = 'shop-item';
    li.innerHTML = `<span class="shop-icon">${item.icon}</span><span class="shop-name">${item.name}</span><span class="shop-price">🪙 ${item.price}</span>`;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = owned ? 'Owned' : 'Buy';
    btn.disabled = owned || (coins < item.price);
    btn.addEventListener('click', () => buyItem(item));
    li.appendChild(btn);
    shopItemsEl.appendChild(li);
  });
}

function renderInventory(inventory) {
  if (!inventoryItemsEl) return;
  inventoryItemsEl.innerHTML = '';
  const ids = Object.keys(inventory || {});
  if (ids.length === 0) {
    inventoryItemsEl.textContent = 'You have no cosmetics yet.';
    return;
  }
  ids.forEach(id => {
    const def = SHOP_ITEMS.find(i => i.id === id);
    const div = document.createElement('div');
    div.className = 'inv-item';
    div.textContent = def ? `${def.icon} ${def.name}` : id;
    inventoryItemsEl.appendChild(div);
  });
}

async function buyItem(item) {
  if (!currentUser) return;
  const coinsRef = db.ref(`users/${currentUser.uid}/coins`);
  const invRef = db.ref(`users/${currentUser.uid}/inventory/${item.id}`);
  const result = await coinsRef.transaction(c => { c = c || 0; if (c < item.price) return; return c - item.price; });
  if (!result.committed) { alert('Not enough coins.'); return; }
  await invRef.set(true);
}

btnClaimDaily?.addEventListener('click', async () => {
  if (!currentUser) return;
  const profileRef = db.ref(`users/${currentUser.uid}`);
  await profileRef.transaction(data => {
    if (!data) return data;
    const now = Date.now();
    const gap = 20 * 60 * 60 * 1000;
    if (!data.lastDaily || (now - data.lastDaily) >= gap) { data.lastDaily = now; data.coins = (data.coins || 0) + 50; }
    return data;
  });
});

// -------------------- Match Creation / Join --------------------
btnCreateMatch?.addEventListener('click', async () => {
  if (!currentUser) return matchStatus.textContent = 'Please sign in first.';
  try {
    btnCreateMatch.disabled = true; btnJoinMatch.disabled = true; matchIdInput.disabled = true;
    showLoading(true);

// After successfully creating the match
matchId = newMatchId;
localStorage.setItem('currentMatch', matchId);
playerNumber = 'player1';
opponentId = 'player2';

// ✅ Display the match ID immediately
if (generatedMatchIdDisplay) generatedMatchIdDisplay.textContent = `Match ID: ${newMatchId}`;
if (document.getElementById('matchIdDisplay')) document.getElementById('matchIdDisplay').textContent = `Share this code: ${newMatchId}`;

matchStatus.textContent = '';
matchSection.hidden = true;
gameSection.hidden = false;

setupGameUI();
listenForGameUpdates();


    let newMatchId = generateMatchId();
    let newMatchRef = db.ref(`matches/${newMatchId}`);
    let tries = 0;
    while ((await newMatchRef.once('value')).exists() && tries < 5) {
      newMatchId = generateMatchId();
      newMatchRef = db.ref(`matches/${newMatchId}`);
      tries++;
    }
    if (tries >= 5) throw new Error('Failed to generate unique match ID');

    await newMatchRef.set({
      player1: { uid: currentUser.uid, name: currentUser.displayName, choice: null, score: 0 },
      player2: null,
      started: false,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      lastMoveAt: firebase.database.ServerValue.TIMESTAMP
    });

    matchId = newMatchId;
    localStorage.setItem('currentMatch', matchId);
    playerNumber = 'player1';
    opponentId = 'player2';

    // Display match ID
    if (matchIdDisplay) matchIdDisplay.textContent = `Match ID: ${matchId}`;
    generatedMatchIdDisplay.textContent = `Share this code with your friend!`;
    matchStatus.textContent = '';
    matchSection.hidden = true;
    gameSection.hidden = false;

    setupGameUI();
    listenForGameUpdates();
  } catch (e) {
    matchStatus.textContent = 'Error creating match: ' + e.message;
  } finally {
    btnCreateMatch.disabled = false; btnJoinMatch.disabled = false; matchIdInput.disabled = false;
    showLoading(false);
  }
});

btnJoinMatch?.addEventListener('click', () => {
  const enteredId = (matchIdInput.value || '').trim().toUpperCase();
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

    if (data.player2 && ![data.player1?.uid, data.player2?.uid].includes(currentUser.uid)) {
      matchStatus.textContent = 'Match already has two players.'; return;
    }

    if (!data.player2) {
      await gameRef.child('player2').set({ uid: currentUser.uid, name: currentUser.displayName, choice: null, score: 0 });
      await gameRef.child('started').set(true);
      playerNumber = 'player2';
      opponentId = 'player1';
    } else {
      if (data.player1?.uid === currentUser.uid) { playerNumber = 'player1'; opponentId = 'player2'; }
      else if (data.player2?.uid === currentUser.uid) { playerNumber = 'player2'; opponentId = 'player1'; }
      else throw new Error('Match full.');
    }

    matchId = id;
    localStorage.setItem('currentMatch', matchId);
    if (matchIdDisplay) matchIdDisplay.textContent = `Match ID: ${matchId}`;
    generatedMatchIdDisplay.textContent = '';
    matchStatus.textContent = '';
    matchSection.hidden = true;
    gameSection.hidden = false;

    setupGameUI();
    listenForGameUpdates();
  } catch (err) {
    matchStatus.textContent = err.message;
    btnCreateMatch.disabled = false; btnJoinMatch.disabled = false; matchIdInput.disabled = false;
  } finally { showLoading(false); }
}

// -------------------- Game UI --------------------
function setupGameUI() {
  playerNameLabel.textContent = currentUser?.displayName || 'You';
  opponentNameLabel.textContent = 'Waiting for opponent...';
  playerScoreLabel.textContent = '0';
  opponentScoreLabel.textContent = '0';
  resetCards();
  renderChoices();
  statusText.textContent = 'Make your choice!';
}

function renderChoices() {
  if (!choicesDiv) return;
  choicesDiv.innerHTML = '';
  Object.entries(ITEM_MAP).forEach(([key, item]) => {
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

async function selectChoice(choiceKey) {
  if (!gameRef || !playerNumber) return;
  statusText.textContent = `You selected ${ITEM_MAP[choiceKey].name}. Waiting for opponent...`;
  Array.from(choicesDiv.children).forEach(btn => btn.disabled = true);
  try {
    await gameRef.child(`${playerNumber}/choice`).set(choiceKey);
    await gameRef.child('lastMoveAt').set(firebase.database.ServerValue.TIMESTAMP);
  } catch (e) {
    statusText.textContent = 'Error sending choice: ' + e.message;
    Array.from(choicesDiv.children).forEach(btn => btn.disabled = false);
  }
}

// -------------------- Real-time Game Sync --------------------
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

    if (data[playerNumber]) { playerNameLabel.textContent = data[playerNumber].name; playerScoreLabel.textContent = data[playerNumber].score || 0; }
    if (data[opponentId]) { opponentNameLabel.textContent = data[opponentId].name; opponentScoreLabel.textContent = data[opponentId].score || 0; }
    else { opponentNameLabel.textContent = 'Waiting for opponent...'; opponentScoreLabel.textContent = '0'; }

    const playerChoice = data[playerNumber]?.choice;
    const opponentChoice = data[opponentId]?.choice;

    if (playerChoice) flipCard(playerCardInner, playerCardBack, ITEM_MAP[playerChoice].icon);
    else resetCard(playerCardInner, playerCardBack);
    if (opponentChoice) flipCard(opponentCardInner, opponentCardBack, ITEM_MAP[opponentChoice].icon);
    else resetCard(opponentCardInner, opponentCardBack);

    if (playerChoice && opponentChoice) {
      const result = determineResult(playerChoice, opponentChoice);
      if (result === 'win') { statusText.innerHTML = `<span class="win-text">You Win! 🎉</span>`; showConfetti(); }
      else if (result === 'lose') statusText.innerHTML = `<span class="lose-text">You Lose. 😞</span>`;
      else statusText.innerHTML = `<span class="tie-text">It's a Tie! 🤝</span>`;

      if (result === 'win') gameRef.child(`${playerNumber}/score`).transaction(s => (s || 0) + 1);
      if (result === 'lose') gameRef.child(`${opponentId}/score`).transaction(s => (s || 0) + 1);

      if (result === 'win' && currentUser) db.ref(`users/${currentUser.uid}/coins`).transaction(c => (c || 0) + 5);

      setTimeout(() => {
        gameRef.child(`${playerNumber}/choice`).set(null);
        gameRef.child(`${opponentId}/choice`).set(null);
        statusText.textContent = 'Make your choice!';
        Array.from(choicesDiv.children).forEach(btn => btn.disabled = false);
        resetCards();
      }, 2200);
    } else {
      if (!playerChoice) { statusText.textContent = 'Make your choice!'; Array.from(choicesDiv.children).forEach(btn => btn.disabled = false); }
      else { statusText.textContent = 'Waiting for opponent...'; Array.from(choicesDiv.children).forEach(btn => btn.disabled = true); }
    }
  });

  // Auto-cleanup inactive matches (>2 hours)
  setTimeout(async () => {
    try {
      const snap = await db.ref(`matches/${matchId}`).once('value');
      if (!snap.exists()) return;
      const data = snap.val();
      const last = data.lastMoveAt || 0;
      if (Date.now() - last > 2 * 60 * 60 * 1000) {
        await db.ref(`matches/${matchId}`).remove();
        if (localStorage.getItem('currentMatch') === matchId) localStorage.removeItem('currentMatch');
      }
    } catch {}
  }, 5000);
}

// -------------------- Result Logic --------------------
function determineResult(playerChoice, opponentChoice) {
  if (playerChoice === opponentChoice) return 'tie';
  if (ITEM_MAP[playerChoice].beats?.includes(opponentChoice)) return 'win';
  if (ITEM_MAP[opponentChoice].beats?.includes(playerChoice)) return 'lose';
  return 'tie';
}

// -------------------- Back to Bot Mode --------------------
document.getElementById('btnBackToBot')?.addEventListener('click', () => {
  localStorage.removeItem('currentMatch');
  window.location.href = 'index.html';
  const btnLeaveMatch = document.getElementById('btnLeaveMatch');

btnLeaveMatch?.addEventListener('click', async () => {
  if (!matchId || !playerNumber) return;

  // Remove this player from the match in Firebase
  try {
    await db.ref(`matches/${matchId}/${playerNumber}`).remove();

    // If both players gone, delete the match
    const snap = await db.ref(`matches/${matchId}`).once('value');
    if (!snap.exists() || (!snap.val().player1 && !snap.val().player2)) {
      await db.ref(`matches/${matchId}`).remove();
    }
  } catch (e) {
    console.error('Error leaving match:', e);
  }

  // Reset local match state
  localStorage.removeItem('currentMatch');
  matchId = null;
  playerNumber = null;
  opponentId = null;

  // Reset UI
  gameSection.hidden = true;
  matchSection.hidden = false;
  resetCards();
  statusText.textContent = '';
  generatedMatchIdDisplay.textContent = '';
});
});
