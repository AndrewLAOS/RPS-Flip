// game.js

import { items } from './items.js';

// === GAME STATE ===
let playerCoins = 0;
let playerInventory = new Set(['rock', 'paper', 'scissors']); // starting items
let botInventory = Object.keys(items); // bot can choose any item

let playerChoice = null;
let botChoice = null;

let botDifficulty = 50; // 0-100 slider default

let currentShopCategory = 'all'; // for filtering shop items

// === DOM ELEMENTS ===

// Screens
const screens = {
  battle: document.getElementById('battle-screen'),
  shop: document.getElementById('shop-screen'),
  matchup: document.getElementById('matchup-screen'),
};

// UI elements
const coinsDisplay = document.getElementById('coins-display');
const botDifficultySlider = document.getElementById('bot-difficulty-slider');
const botDifficultyLabel = document.getElementById('bot-difficulty-label');

const battleChoicesDiv = document.getElementById('battle-choices');
const battleStatus = document.getElementById('battle-status');

const shopItemsDiv = document.getElementById('shop-items');
const shopStatus = document.getElementById('shop-status');

const matchupGraphDiv = document.getElementById('matchup-graph');

// Nav buttons
const navBattle = document.getElementById('nav-battle');
const navShop = document.getElementById('nav-shop');
const navMatchup = document.getElementById('nav-matchup');

const btnShopBack = document.getElementById('btn-shop-back');
const shopTabs = document.querySelectorAll('.shop-tab');

// === UTILS ===

// Check if itemA beats itemB
function doesBeat(itemA, itemB) {
  return items[itemA].beats.includes(itemB);
}

// Determine battle result: 'win', 'lose', or 'tie'
function getBattleResult(playerItem, botItem) {
  if (playerItem === botItem) return 'tie';
  if (doesBeat(playerItem, botItem)) return 'win';
  if (doesBeat(botItem, playerItem)) return 'lose';
  return 'tie'; // fallback, e.g. no beats defined
}

// Update coins display text
function updateCoins() {
  coinsDisplay.textContent = `Coins: ${playerCoins}`;
}

// Update bot difficulty label text
function updateBotDifficultyLabel() {
  botDifficultyLabel.textContent = `Bot Difficulty: ${botDifficultySlider.value}%`;
}

// Bot chooses an item based on difficulty and player choice
function botChoose(playerItem) {
  if (botDifficulty === 0 || !playerItem) {
    // Random choice from bot inventory
    return botInventory[Math.floor(Math.random() * botInventory.length)];
  }

  const difficultyPercent = botDifficulty / 100;
  const counters = botInventory.filter(item => doesBeat(item, playerItem));

  if (counters.length === 0 || Math.random() > difficultyPercent) {
    // Random if no counters or failed probability check
    return botInventory[Math.floor(Math.random() * botInventory.length)];
  }

  // Pick random counter among best counters
  return counters[Math.floor(Math.random() * counters.length)];
}

// === BATTLE SCREEN ===

// Clear battle choice buttons
function clearBattleChoices() {
  battleChoicesDiv.innerHTML = '';
}

// Render player's available items as clickable buttons
function renderBattleChoices() {
  clearBattleChoices();
  playerInventory.forEach((key) => {
    const item = items[key];
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = `${item.icon} ${item.name}`;
    btn.title = `Rarity: ${item.rarity}\nCost: ${item.cost}`;
    btn.onclick = () => handlePlayerChoice(key);
    battleChoicesDiv.appendChild(btn);
  });
}

// Handle player picking an item to battle
function handlePlayerChoice(choiceKey) {
  playerChoice = choiceKey;
  botChoice = botChoose(playerChoice);
  resolveBattle();
}

// Display result, update coins, and re-enable buttons
function resolveBattle() {
  battleStatus.textContent = '... battling ...';
  disableBattleChoices(true);

  const result = getBattleResult(playerChoice, botChoice);

  setTimeout(() => {
    if (result === 'win') {
      battleStatus.innerHTML = `You Win! 🎉<br>Your ${items[playerChoice].icon} beats Bot's ${items[botChoice].icon}`;
      playerCoins++;
    } else if (result === 'lose') {
      battleStatus.innerHTML = `You Lose! 😞<br>Bot's ${items[botChoice].icon} beats your ${items[playerChoice].icon}`;
      playerCoins = Math.max(0, playerCoins - 1);
    } else {
      battleStatus.innerHTML = `It's a Tie! 😐<br>You both chose ${items[playerChoice].icon}`;
    }
    updateCoins();
    disableBattleChoices(false);
  }, 1500);
}

// Enable or disable battle buttons
function disableBattleChoices(disable) {
  const buttons = battleChoicesDiv.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = disable);
}

// === SHOP SCREEN ===

// Clear shop items list
function clearShop() {
  shopItemsDiv.innerHTML = '';
}

// Filter and render shop items by rarity category and exclude owned items
function filterShopItems(category = 'all') {
  const allItems = Object.entries(items);
  let filtered = category === 'all'
    ? allItems.filter(([key]) => !playerInventory.has(key))
    : allItems.filter(([key, item]) => item.rarity.toLowerCase() === category.toLowerCase() && !playerInventory.has(key));

  shopItemsDiv.innerHTML = '';

  if (filtered.length === 0) {
    shopStatus.textContent = 'No items in this category.';
  } else {
    shopStatus.textContent = '';
  }

  filtered.forEach(([key, item]) => {
    const card = document.createElement('div');
    card.className = 'shop-item';
    card.innerHTML = `
      <div class="shop-icon">${item.icon}</div>
      <div class="shop-name">${item.name}</div>
      <div class="shop-rarity">${item.rarity}</div>
      <div class="shop-cost">${item.cost} Coins</div>
      <button ${playerCoins < item.cost ? 'disabled' : ''} data-key="${key}">Buy</button>
    `;
    shopItemsDiv.appendChild(card);

    const btn = card.querySelector('button');
    btn.addEventListener('click', () => buyItem(key));
  });
}

// Buy item if affordable and not owned
function buyItem(key) {
  const item = items[key];
  if (playerCoins >= item.cost && !playerInventory.has(key)) {
    playerCoins -= item.cost;
    playerInventory.add(key);
    updateCoins();
    renderShop();
    renderBattleChoices();
    shopStatus.textContent = `You bought ${item.name}!`;
  } else {
    shopStatus.textContent = 'Cannot buy item.';
  }
}

// Render shop according to current filter category
function renderShop() {
  filterShopItems(currentShopCategory);
}

// === BOT DIFFICULTY SLIDER ===

botDifficultySlider.oninput = () => {
  botDifficulty = Number(botDifficultySlider.value);
  updateBotDifficultyLabel();
};

// === MATCHUP GRAPH ===

function renderMatchupGraph() {
  matchupGraphDiv.innerHTML = ''; // clear old graph

  const width = 800;
  const height = 600;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.style.border = "1px solid #ccc";
  matchupGraphDiv.appendChild(svg);

  const keys = Object.keys(items);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 240;

  const nodePositions = {};

  // Arrange nodes in circle
  keys.forEach((key, i) => {
    const angle = (i / keys.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodePositions[key] = { x, y };
  });

  // Color by rarity
  const rarityColors = {
    common: "#a0a0a0",
    uncommon: "#3cb371",
    rare: "#1e90ff",
    epic: "#ba55d3",
    legendary: "#ff8c00",
    mythic: "#dc143c",
  };

  // Arrowhead marker
  const defs = document.createElementNS(svgNS, "defs");
  const marker = document.createElementNS(svgNS, "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "7");
  marker.setAttribute("refX", "0");
  marker.setAttribute("refY", "3.5");
  marker.setAttribute("orient", "auto");
  const polygon = document.createElementNS(svgNS, "polygon");
  polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
  polygon.setAttribute("fill", "#999");
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // Draw arrows for beats
  keys.forEach((key) => {
    const fromPos = nodePositions[key];
    items[key].beats.forEach((beatsKey) => {
      if (!nodePositions[beatsKey]) return;
      const toPos = nodePositions[beatsKey];

      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", fromPos.x);
      line.setAttribute("y1", fromPos.y);
      line.setAttribute("x2", toPos.x);
      line.setAttribute("y2", toPos.y);
      line.setAttribute("stroke", "#999");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("marker-end", "url(#arrowhead)");
      svg.appendChild(line);
    });
  });

  // Draw nodes (circles and icons)
  keys.forEach((key) => {
    const pos = nodePositions[key];
    const rarityKey = items[key].rarity.toLowerCase();
    const color = rarityColors[rarityKey] || "#666";

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);
    circle.setAttribute("r", 28);
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "#333");
    circle.setAttribute("stroke-width", "2");
    svg.appendChild(circle);

    const textIcon = document.createElementNS(svgNS, "text");
    textIcon.setAttribute("x", pos.x);
    textIcon.setAttribute("y", pos.y + 8);
    textIcon.setAttribute("font-size", "20");
    textIcon.setAttribute("font-family", "Arial, sans-serif");
    textIcon.setAttribute("fill", "#fff");
    textIcon.setAttribute("text-anchor", "middle");
    textIcon.textContent = items[key].icon;
    svg.appendChild(textIcon);

    // Tooltip
    const title = document.createElementNS(svgNS, "title");
    title.textContent = `${items[key].name} (${items[key].rarity})`;
    circle.appendChild(title);
  });
}

// === SCREEN NAVIGATION ===

function showScreen(screen) {
  // Hide all screens
  Object.values(screens).forEach(s => s.hidden = true);

  // Reset nav aria-selected
  navBattle.setAttribute('aria-selected', 'false');
  navShop.setAttribute('aria-selected', 'false');
  navMatchup.setAttribute('aria-selected', 'false');

  // Show selected
  screen.hidden = false;

  // Mark nav selected
  if (screen === screens.battle) navBattle.setAttribute('aria-selected', 'true');
  if (screen === screens.shop) navShop.setAttribute('aria-selected', 'true');
  if (screen === screens.matchup) navMatchup.setAttribute('aria-selected', 'true');

  // Render contents
  if (screen === screens.battle) {
    renderBattleChoices();
    battleStatus.textContent = 'Choose your item to battle!';
  }
  if (screen === screens.shop) {
    renderShop();
    shopStatus.textContent = '';
  }
  if (screen === screens.matchup) {
    renderMatchupGraph();
  }
}

// === EVENT LISTENERS ===

// Navigation buttons
navBattle.addEventListener('click', () => showScreen(screens.battle));
navShop.addEventListener('click', () => showScreen(screens.shop));
navMatchup.addEventListener('click', () => showScreen(screens.matchup));

// Shop back button returns to battle screen
btnShopBack.addEventListener('click', () => showScreen(screens.battle));

// Shop category tabs filtering
shopTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    shopTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    currentShopCategory = tab.dataset.category;
    filterShopItems(currentShopCategory);
  });
});

// Bot difficulty slider updates
botDifficultySlider.addEventListener('input', () => {
  botDifficulty = Number(botDifficultySlider.value);
  updateBotDifficultyLabel();
});

// === INITIAL SETUP ===
updateCoins();
updateBotDifficultyLabel();
showScreen(screens.battle); // default start screen
