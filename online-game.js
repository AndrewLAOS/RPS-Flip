// online-game.js
import { items, itemKeys } from './items.js';

const $ = (sel, root = document) => root.querySelector(sel);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// DOM references
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
const playerCardBack = $('#player-card-back');
const opponentCardInner = $('#opponent-card-inner');
const opponentCardBack = $('#opponent-card-back');
const playerNameLabel = $('#player-name-label');
const opponentNameLabel = $('#opponent-name-label');
const playerScoreEl = $('#player-score');
const opponentScoreEl = $('#opponent-score');

const choicesDiv = $('#choices');
const statusText = $('#status-text');
const loadingSpinner = $('#loading-spinner');

const btnLeaveMatch = $('#btnLeaveMatch');

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
};

// ---------------------- Firebase Setup ----------------------
const firebaseConfig = {
  apiKey: "<YOUR_FIREBASE_APIKEY>",
  authDomain: "<YOUR_PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com",
  projectId: "<YOUR_PROJECT_ID>",
  storageBucket: "<YOUR_PROJECT_ID>.appspot.com",
  messagingSenderId: "<SENDER_ID>",
  appId: "<APP_ID>"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ---------------------- Authentication ----------------------
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

// ---------------------- Match Management ----------------------
function generateMatchId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let str = '';
  for (let i = 0; i < length; i++) str += chars[Math.floor(Math.random() * chars.length)];
  return str;
}

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

  // Listen for changes
  matchRef.on('value', snapshot => handleMatchUpdate(snapshot.val()));
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

  matchRef.on('value', snapshot => handleMatchUpdate(snapshot.val()));
  renderChoices();
};

// ---------------------- Choices Rendering ----------------------
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

// ---------------------- Match Update ----------------------
function handleMatchUpdate(data) {
  if (!data) return;
  const players = data.players || {};
  let opponentId = Object.keys(players).find(pid => pid !== state.playerId);

  if (opponentId) {
    opponentNameLabel.textContent = players[opponentId].name;
    state.opponentScore = players[opponentId].score || 0;
    opponentScoreEl.textContent = state.opponentScore;
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
    playerScoreEl.textContent = state.playerScore;
  } else if (result === 'lose') {
    statusText.textContent = 'You Lose!';
    state.opponentScore++;
    opponentScoreEl.textContent = state.opponentScore;
  } else {
    statusText.textContent = 'Tie!';
  }

  // Reset choices after 2s
  setTimeout(() => {
    state.matchRef.child('players/' + state.playerId + '/choice').set(null);
    if (state.matchRef && Object.keys(state.matchRef._delegate._path.pieces_).length > 1) {
      const opponentId = Object.keys(state.matchRef._delegate._path.pieces_).find(pid => pid !== state.playerId);
      if (opponentId) state.matchRef.child('players/' + opponentId + '/choice').set(null);
    }
    disableChoices(false);
    statusText.textContent = 'Make your choice!';
    playerCardFront.textContent = '?';
    opponentCardFront.textContent = '?';
  }, 2000);
}

// ---------------------- Helpers ----------------------
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

// ---------------------- Init ----------------------
statusText.textContent = 'Sign in to start playing!';
