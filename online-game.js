/* online-game.js */

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
const generatedMatchIdDisplay = document.querySelectorAll('#generated-match-id');

const gameSection = document.getElementById('game-section');
const btnLeaveMatch = document.getElementById('btnLeaveMatch');

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

// -------------------- Items & Shop --------------------
const ITEMS = {
  rock: { name: 'Rock', icon: '🪨', beats: ['scissors'] },
  paper: { name: 'Paper', icon: '📄', beats: ['rock'] },
  scissors: { name: 'Scissors', icon: '✂️', beats: ['paper'] }
};

const SHOP_ITEMS = [
  { id: 'hat_top',   name: 'Top Hat',     price: 120, icon: '🎩' },
  { id: 'shades',    name: 'Cool Shades',price: 100, icon: '😎' },
  { id: 'sparkles',  name: 'Sparkles',   price: 80,  icon: '✨' },
  { id: 'fire_trail',name: 'Fire Trail', price: 150, icon: '🔥' },
];

// -------------------- Utils --------------------
function showLoading(show){ loadingSpinner.style.display = show ? 'block':'none'; }
function generateMatchId(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let id='';
  for(let i=0;i<6;i++) id+=chars.charAt(Math.floor(Math.random()*chars.length));
  return id;
}
function flipCard(inner, back, icon){ if(back) back.textContent=icon; if(inner) inner.classList.add('flipped'); }
function resetCard(inner, back){ if(back) back.textContent='?'; if(inner) inner.classList.remove('flipped'); }
function resetCards(){ resetCard(playerCardInner, playerCardBack); resetCard(opponentCardInner, opponentCardBack); }
function showConfetti(){ if(window.confetti) confetti({particleCount:50,spread:70,origin:{y:0.6}}); }

// -------------------- Auth --------------------
btnGoogleLogin?.addEventListener('click', ()=>{
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err=>loginStatus.textContent='Login failed: '+err.message);
});

auth.onAuthStateChanged(async user=>{
  if(user){
    currentUser=user;
    loginStatus.textContent=`Hello, ${user.displayName}!`;
    loginSection.hidden=true;
    matchSection.hidden=false;
    gameSection.hidden=true;
    shopSection.hidden=false;

    await ensureUserDoc(user);
    startUserListeners(user);

    if(matchId) startMatch(matchId);
  }else{
    currentUser=null;
    loginStatus.textContent='';
    loginSection.hidden=false;
    matchSection.hidden=true;
    gameSection.hidden=true;
    shopSection.hidden=true;
    stopUserListeners();
  }
});

// -------------------- User Profile & Shop --------------------
const userRefs={ profile:null, coins:null, inventory:null };
const userUnsubs=[];

async function ensureUserDoc(user){
  const baseRef=db.ref(`users/${user.uid}`);
  const snap=await baseRef.once('value');
  if(!snap.exists()){
    await baseRef.set({ name:user.displayName||'Player', coins:200, inventory:{}, equipped:null, createdAt:firebase.database.ServerValue.TIMESTAMP, lastDaily:0 });
  }
}

function startUserListeners(user){
  userRefs.profile=db.ref(`users/${user.uid}`);
  userRefs.coins=userRefs.profile.child('coins');
  userRefs.inventory=userRefs.profile.child('inventory');

  const coinsCb=userRefs.coins.on('value', s=>{
    const coins=s.val()||0;
    if(coinBalanceEl) coinBalanceEl.textContent=coins;
    renderShop(coins);
  });
  userUnsubs.push(()=>userRefs.coins.off('value', coinsCb));

  const invCb=userRefs.inventory.on('value', s=>{
    const inv=s.val()||{};
    renderInventory(inv);
    userRefs.coins.once('value').then(c=>renderShop(c.val()||0, inv));
  });
  userUnsubs.push(()=>userRefs.inventory.off('value', invCb));
}

function stopUserListeners(){ userUnsubs.splice(0).forEach(f=>f()); }

function renderShop(coins, inventory=null){
  if(!shopItemsEl) return;
  const inv=inventory||{};
  shopItemsEl.innerHTML='';
  SHOP_ITEMS.forEach(item=>{
    const owned=!!inv[item.id];
    const li=document.createElement('div');
    li.className='shop-item';
    li.innerHTML=`<span class="shop-icon">${item.icon}</span><span class="shop-name">${item.name}</span><span class="shop-price">🪙 ${item.price}</span>`;
    const btn=document.createElement('button');
    btn.className='btn'; btn.textContent=owned?'Owned':'Buy';
    btn.disabled=owned||(coins<item.price);
    btn.addEventListener('click', ()=>buyItem(item));
    li.appendChild(btn);
    shopItemsEl.appendChild(li);
  });
}

function renderInventory(inventory){
  if(!inventoryItemsEl) return;
  inventoryItemsEl.innerHTML='';
  const ids=Object.keys(inventory||{});
  if(ids.length===0){ inventoryItemsEl.textContent='You have no cosmetics yet.'; return; }
  ids.forEach(id=>{
    const def=SHOP_ITEMS.find(i=>i.id===id);
    const div=document.createElement('div'); div.className='inv-item';
    div.textContent=def?`${def.icon} ${def.name}`:id;
    inventoryItemsEl.appendChild(div);
  });
}

async function buyItem(item){
  if(!currentUser) return;
  const coinsRef=db.ref(`users/${currentUser.uid}/coins`);
  const invRef=db.ref(`users/${currentUser.uid}/inventory/${item.id}`);
  const result=await coinsRef.transaction(c=>{ c=c||0; if(c<item.price) return; return c-item.price; });
  if(!result.committed){ alert('Not enough coins.'); return; }
  await invRef.set(true);
}

btnClaimDaily?.addEventListener('click', async()=>{
  if(!currentUser) return;
  const profileRef=db.ref(`users/${currentUser.uid}`);
  await profileRef.transaction(data=>{
    if(!data) return data;
    const now=Date.now(); const gap=20*60*60*1000;
    if(!data.lastDaily||(now-data.lastDaily)>=gap){ data.lastDaily=now; data.coins=(data.coins||0)+50; }
    return data;
  });
});

// -------------------- Match Creation / Join --------------------
btnCreateMatch?.addEventListener('click', async()=>{
  if(!currentUser) return;
  matchId=generateMatchId(); localStorage.setItem('currentMatch', matchId);
  const matchRef=db.ref(`matches/${matchId}`);
  await matchRef.set({ players:{ [currentUser.uid]:{ name:currentUser.displayName, score:0, choice:null } }, createdAt:firebase.database.ServerValue.TIMESTAMP });
  playerNumber=1; startMatch(matchId);
});

btnJoinMatch?.addEventListener('click', async()=>{
  if(!currentUser) return;
  const input=matchIdInput.value.trim().toUpperCase(); if(!input) return;
  const matchRef=db.ref(`matches/${input}`);
  const snap=await matchRef.once('value');
  if(!snap.exists()){ matchStatus.textContent='Match not found!'; return; }
  matchId=input; localStorage.setItem('currentMatch', matchId);
  const players=snap.val().players||{};
  if(Object.keys(players).length>=2){ matchStatus.textContent='Match full!'; return; }
  playerNumber=2; await matchRef.child('players/'+currentUser.uid).set({ name:currentUser.displayName, score:0, choice:null });
  startMatch(matchId);
});

// -------------------- Match Logic --------------------
function startMatch(id){
  if(!id) return;
  matchSection.hidden=true; gameSection.hidden=false;
  gameRef=db.ref(`matches/${id}/players`);
  gameRef.on('value', snap=>{
    const players=snap.val()||{};
    const ids=Object.keys(players);
    const opponentKey=ids.find(i=>i!==currentUser.uid);
    opponentId=opponentKey||null;

    playerNameLabel.textContent=players[currentUser.uid]?.name||'You';
    playerScoreLabel.textContent=players[currentUser.uid]?.score||0;

    if(opponentId){
      opponentNameLabel.textContent=players[opponentId]?.name||'Opponent';
      opponentScoreLabel.textContent=players[opponentId]?.score||0;
    }else opponentNameLabel.textContent='Waiting for opponent...';

    resetCards();
    renderChoices();
    statusText.textContent='Make your choice!';
  });
}

btnLeaveMatch?.addEventListener('click', async()=>{
  if(!currentUser||!matchId) return;
  await db.ref(`matches/${matchId}/players/${currentUser.uid}`).remove();
  matchId=null; localStorage.removeItem('currentMatch');
  gameSection.hidden=true; matchSection.hidden=false;
  if(gameRef) gameRef.off();
});

// -------------------- Choices --------------------
function renderChoices(){
  if(!choicesDiv) return;
  choicesDiv.innerHTML='';
  Object.keys(ITEMS).forEach(key=>{
    const itm=ITEMS[key];
    const btn=document.createElement('button');
    btn.className='choice btn';
    btn.innerHTML=`<div>${itm.icon}</div><div class="choice-label">${itm.name}</div>`;
    btn.addEventListener('click', ()=>makeChoice(key));
    choicesDiv.appendChild(btn);
  });
}

async function makeChoice(choiceKey){
  if(!currentUser||!gameRef) return;
  showLoading(true);
  await gameRef.child(currentUser.uid).update({ choice: choiceKey });
  checkResult();
  showLoading(false);
}

function checkResult(){
  if(!gameRef||!opponentId) return;
  gameRef.once('value').then(snap=>{
    const players=snap.val()||{};
    const me=players[currentUser.uid];
    const op=players[opponentId];
    if(!me.choice || !op?.choice) return;

    flipCard(playerCardInner, playerCardBack, ITEMS[me.choice].icon);
    flipCard(opponentCardInner, opponentCardBack, ITEMS[op.choice].icon);

    const meChoice=ITEMS[me.choice];
    const opChoice=ITEMS[op.choice];

    if(meChoice.beats.includes(op.choice)){
      statusText.textContent='You Win!'; statusText.className='win-text';
      gameRef.child(currentUser.uid+'/score').transaction(c=>c?c+1:1); showConfetti();
    }else if(opChoice.beats.includes(me.choice)){
      statusText.textContent='You Lose!'; statusText.className='lose-text';
      gameRef.child(opponentId+'/score').transaction(c=>c?c+1:1);
    }else{
      statusText.textContent='Tie!'; statusText.className='tie-text';
    }

    // Reset choices after 1.5s
    setTimeout(()=>{ gameRef.child(currentUser.uid+'/choice').set(null); if(opponentId) gameRef.child(opponentId+'/choice').set(null); resetCards(); statusText.textContent='Make your choice!'; statusText.className=''; }, 1500);
  });
}
