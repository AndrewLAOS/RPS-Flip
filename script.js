// script.js
import { allItems, beatsItem } from './items.js';

let coins = 0;
let botDifficulty = 5;
let playerWins = 0;
let botWins = 0;

// Owned items start with classic trio
const owned = new Set(['rock','paper','scissors']);

// DOM refs
const coinsEl = document.getElementById('coins');
const difficultyInput = document.getElementById('difficulty');
const difficultyValue = document.getElementById('difficulty-value');
const choicesWrap = document.getElementById('choices');
const inventoryEl = document.getElementById('inventory');
const shopItemsEl = document.getElementById('shop-items');
const playerSlot = document.getElementById('player-slot');
const botSlot = document.getElementById('bot-slot');
const resultEl = document.getElementById('result');
const playerScoreEl = document.querySelector('#player-score span');
const botScoreEl = document.querySelector('#bot-score span');

// update UI helpers
function renderCoins(){ coinsEl.textContent = coins; }
function renderScores(){ playerScoreEl.textContent = playerWins; botScoreEl.textContent = botWins; }
function setResult(text, tone='neutral'){ resultEl.textContent = text; resultEl.style.opacity = 1; if(tone==='win') resultEl.style.color='#c9ffd6'; else if(tone==='lose') resultEl.style.color='#ffd6d6'; else resultEl.style.color='#dbe8ff'; }

// build choices (buttons for each owned item)
function renderChoices(){
  choicesWrap.innerHTML = '';
  const arr = Array.from(owned);
  arr.sort((a,b)=> a.localeCompare(b));
  for(const key of arr){
    const item = allItems[key];
    const card = document.createElement('button');
    card.className = 'item';
    card.setAttribute('data-key', key);
    card.innerHTML = `<div class="icon">${item.emoji}</div>
                      <div class="meta"><div class="name">${item.name}</div>
                      <div class="rarity rarity-${item.rarity}">${item.rarity}</div></div>`;
    card.addEventListener('click', ()=> playRound(key, card));
    choicesWrap.appendChild(card);
  }
}

// render inventory (small)
function renderInventory(){
  inventoryEl.innerHTML = '';
  Array.from(owned).forEach(key=>{
    const it = allItems[key];
    const card = document.createElement('div');
    card.className = 'shop-card';
    card.innerHTML = `<div class="icon">${it.emoji}</div><div style="font-weight:800">${it.name}</div><div class="rarity rarity-${it.rarity}">${it.rarity}</div>`;
    inventoryEl.appendChild(card);
  });
}

// shop list (items not owned)
function renderShop(){
  shopItemsEl.innerHTML = '';
  Object.keys(allItems).sort().forEach(key=>{
    if(owned.has(key)) return;
    const it = allItems[key];
    const card = document.createElement('div');
    card.className = 'shop-card';
    if (coins < it.cost) card.classList.add('disabled');
    card.innerHTML = `<div class="icon">${it.emoji}</div>
                      <div style="font-weight:800">${it.name}</div>
                      <div class="rarity rarity-${it.rarity}">${it.rarity}</div>
                      <div class="price">${it.cost} 🪙</div>`;
    card.addEventListener('click', ()=> buyItem(key));
    shopItemsEl.appendChild(card);
  });
}

// buy logic
function buyItem(key){
  const it = allItems[key];
  if(owned.has(key)) return;
  if(coins >= it.cost){
    coins -= it.cost;
    owned.add(key);
    setResult(`You purchased ${it.name}.`, 'win');
    renderAll();
  } else {
    setResult(`Not enough coins for ${it.name}.`, 'lose');
  }
}

// bot pick with weighted randomness influenced by difficulty and rarity
function botPick(playerChoice){
  const weighted = [];
  // rarity ranks influence base weight
  const rarityRank = {"Common":1,"Uncommon":2,"Rare":3,"Epic":4,"Legendary":5,"Mythic":6};
  for(const key of Object.keys(allItems)){
    let weight = 1 + (rarityRank[allItems[key].rarity] || 1); // base favors higher rarity a bit
    // difficulty bias: higher difficulty favors counters
    if(beatsItem(key, playerChoice)) weight += Math.round(botDifficulty * 1.6);
    // small bias to pick something similar if difficulty low
    if(botDifficulty <= 3 && allItems[playerChoice].rarity === allItems[key].rarity) weight += 2;
    // random jitter
    weight += Math.floor(Math.random()*3);
    for(let i=0;i<weight;i++) weighted.push(key);
  }
  return weighted[Math.floor(Math.random()*weighted.length)];
}

// animateChoice (exports earlier style, adapted to the slot elements)
function animateChoice(playerElem, botElem, playerKey, botKey){
  const animationsMap = {
    rock: 'rockShake', paper:'paperFlutter', scissors:'scissorsCut',
    fire:'fireFlicker', water:'waterSplash', robot:'robotBlink', lightning:'lightningStrike',
    wind:'windBlow', earth:'earthPulse', wizard:'wizardGlow', dragon:'dragonFire',
    phoenix:'phoenixRise', ice:'waterSplash', shadow:'pulse', light:'pulse', chaos:'pulse',
    time:'pulse', void:'pulse', metal:'pulse', poison:'pulse', beast:'pulse', mirror:'pulse', thorn:'pulse', spirit:'pulse', mirrorblade:'scissorsCut'
  };

  const playerAnim = animationsMap[playerKey] || 'pulse';
  const botAnim = animationsMap[botKey] || 'pulse';

  function runAnim(el, anim){
    return new Promise(resolve=>{
      el.style.animation = `${anim} 0.75s ease both`;
      el.addEventListener('animationend', ()=>{
        el.style.animation = '';
        resolve();
      }, { once:true });
    });
  }

  // glow color: green for player, red for bot
  playerElem.style.boxShadow = '0 0 28px rgba(64,222,128,0.18)';
  botElem.style.boxShadow = '0 0 28px rgba(255,110,110,0.16)';
  playerElem.style.transform = 'scale(1.06)';
  botElem.style.transform = 'scale(1.06)';

  return Promise.all([ runAnim(playerElem, playerAnim), runAnim(botElem, botAnim) ]).then(()=>{
    playerElem.style.boxShadow = '';
    botElem.style.boxShadow = '';
    playerElem.style.transform = '';
    botElem.style.transform = '';
  });
}


// play round
async function playRound(playerKey, playerBtn){
  const botKey = botPick(playerKey);

  // show emoji in slots
  playerSlot.textContent = allItems[playerKey].emoji;
  botSlot.textContent = allItems[botKey].emoji;

  // disable choices while animating
  Array.from(document.querySelectorAll('.item')).forEach(b=> b.disabled = true);

  // animate slots (use the slot elements)
  await animateChoice(playerSlot, botSlot, playerKey, botKey);

  // determine winner
  let outcome = 'draw';
  if(playerKey === botKey){ outcome = 'draw'; setResult(`Tie — both picked ${allItems[playerKey].name}.`); }
  else if(beatsItem(playerKey, botKey)){ outcome = 'player'; playerWins++; coins = Math.max(0, coins + 1); setResult(`You win — ${allItems[playerKey].name} beats ${allItems[botKey].name}!`, 'win'); }
  else if(beatsItem(botKey, playerKey)){ outcome = 'bot'; botWins++; coins = Math.max(0, coins - 1); setResult(`You lost — ${allItems[botKey].name} beats ${allItems[playerKey].name}.`, 'lose'); }
  else { // fallback to rarity heuristic
    setResult(`Standoff — ${allItems[playerKey].name} and ${allItems[botKey].name} neutralize each other.`);
  }

  renderAll();

  // enable
  Array.from(document.querySelectorAll('.item')).forEach(b=> b.disabled = false);
}

// render everything
function renderAll(){
  renderCoins();
  renderChoices();
  renderInventory();
  renderShop();
  renderScores();
  difficultyValue.textContent = botDifficulty;
}

// difficulty slider handler
difficultyInput.addEventListener('input', e=>{
  botDifficulty = Number(e.target.value);
  difficultyValue.textContent = botDifficulty;
});

// initial render
renderAll();
setResult('Ready. Select an item to play!', 'neutral');
