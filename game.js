import { items } from './items.js';

// === GAME STATE ===
let playerCoins = 0;
let playerInventory = new Set(['rock', 'paper', 'scissors']); // starting items

let botCoins = 0;
let botInventory = new Set(['rock', 'paper', 'scissors']); // bot starting items

let playerChoice = null;
let botChoice = null;

let botDifficulty = 50; // 0-100 slider

// Screen refs
const screens = {
  battle: document.getElementById('battle-screen'),
  shop: document.getElementById('shop-screen'),
  matchup: document.getElementById('matchup-screen'),
};

// UI elements
const coinsDisplay = document.getElementById('coins-display');
const botCoinsDisplay = document.getElementById('bot-coins-display'); // Add this to your HTML
const botDifficultySlider = document.getElementById('bot-difficulty-slider');
const botDifficultyLabel = document.getElementById('bot-difficulty-label');

const battleChoicesDiv = document.getElementById('battle-choices');
const battleStatus = document.getElementById('battle-status');

const shopItemsDiv = document.getElementById('shop-items');
const shopStatus = document.getElementById('shop-status');

const matchupGraphDiv = document.getElementById('matchup-graph');

// === UTILS ===

// Check if itemA beats itemB
function doesBeat(itemA, itemB) {
  return items[itemA].beats.includes(itemB);
}

// Get result of battle
// Returns 'win', 'lose', or 'tie'
function getBattleResult(playerItem, botItem) {
  if (playerItem === botItem) return 'tie';
  if (doesBeat(playerItem, botItem)) return 'win';
  if (doesBeat(botItem, playerItem)) return 'lose';
  return 'tie'; // fallback
}

// Update coin display
function updateCoins() {
  coinsDisplay.textContent = `Coins: ${playerCoins}`;
}

function updateBotCoinsDisplay() {
  botCoinsDisplay.textContent = `Bot Coins: ${botCoins}`;
}

// Update bot difficulty label
function updateBotDifficultyLabel() {
  botDifficultyLabel.textContent = `Bot Difficulty: ${botDifficultySlider.value}%`;
}

// Choose bot item based on difficulty (only from botInventory):
// 0 = random choice, 100 = picks best counter to player item if known
function botChoose(playerItem) {
  const botItems = Array.from(botInventory);

  if (botDifficulty === 0 || !playerItem) {
    // pure random from bot inventory
    return botItems[Math.floor(Math.random() * botItems.length)];
  }

  const difficultyPercent = botDifficulty / 100;

  const counters = botItems.filter(item => doesBeat(item, playerItem));

  if (counters.length === 0 || Math.random() > difficultyPercent) {
    return botItems[Math.floor(Math.random() * botItems.length)];
  }

  return counters[Math.floor(Math.random() * counters.length)];
}

// === BATTLE SCREEN ===

// Clear previous choices UI
function clearBattleChoices() {
  battleChoicesDiv.innerHTML = '';
}

// Populate battle choices buttons with player's owned items
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

// Handle player choosing an item
function handlePlayerChoice(choiceKey) {
  playerChoice = choiceKey;
  botChoice = botChoose(playerChoice);
  resolveBattle();
}

// Show battle result and update coins/inventory
function resolveBattle() {
  battleStatus.textContent = '... battling ...';
  disableBattleChoices(true);

  const result = getBattleResult(playerChoice, botChoice);

  setTimeout(() => {
    if (result === 'win') {
      battleStatus.innerHTML = `You Win! 🎉<br>Your ${items[playerChoice].icon} beats Bot's ${items[botChoice].icon}`;
      playerCoins++;
      botCoins = Math.max(0, botCoins - 1); // bot loses coins on loss
    } else if (result === 'lose') {
      battleStatus.innerHTML = `You Lose! 😞<br>Bot's ${items[botChoice].icon} beats your ${items[playerChoice].icon}`;
      playerCoins = Math.max(0, playerCoins - 1);
      botCoins++;
    } else {
      battleStatus.innerHTML = `It's a Tie! 😐<br>You both chose ${items[playerChoice].icon}`;
      // No coins exchanged
    }

    updateCoins();
    updateBotCoinsDisplay();
    disableBattleChoices(false);

    botTryToBuyItem();

  }, 1500);
}

// Enable or disable battle choices buttons
function disableBattleChoices(disable) {
  const buttons = battleChoicesDiv.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = disable);
}

// === SHOP SCREEN ===

// Clear shop items
function clearShop() {
  shopItemsDiv.innerHTML = '';
}

// Render shop items player doesn't own
function renderShop(category = 'all') {
  clearShop();
  let anyAffordable = false;

  // Filter items by category rarity if needed
  const allItems = Object.entries(items).filter(([key, item]) => !playerInventory.has(key));
  const filteredItems = category === 'all'
    ? allItems
    : allItems.filter(([key, item]) => item.rarity.toLowerCase() === category.toLowerCase());

  if (filteredItems.length === 0) {
    shopStatus.textContent = 'No items available in this category.';
    return;
  } else {
    shopStatus.textContent = '';
  }

  filteredItems.forEach(([key, item]) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'shop-item';

    itemDiv.innerHTML = `
      <span class="shop-icon">${item.icon}</span>
      <span class="shop-name">${item.name}</span>
      <span class="shop-rarity">${item.rarity}</span>
      <span class="shop-cost">${item.cost} coins</span>
    `;

    const buyBtn = document.createElement('button');
    buyBtn.textContent = 'Buy';
    buyBtn.disabled = playerCoins < item.cost;
    buyBtn.onclick = () => buyItem(key);

    itemDiv.appendChild(buyBtn);
    shopItemsDiv.appendChild(itemDiv);

    if (playerCoins >= item.cost) anyAffordable = true;
  });

  if (!anyAffordable) {
    shopStatus.textContent = 'No items available to buy or insufficient coins.';
  }
}

// Buy an item if enough coins
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

// === BOT BUYING LOGIC ===

// Bot tries to buy an affordable item it doesn't own after each battle
function botTryToBuyItem() {
  const affordable = Object.entries(items)
    .filter(([key, item]) => !botInventory.has(key) && botCoins >= item.cost);

  if (affordable.length === 0) return; // nothing to buy

  // Bot randomly picks one to buy
  const [key, item] = affordable[Math.floor(Math.random() * affordable.length)];

  botCoins -= item.cost;
  botInventory.add(key);

  console.log(`Bot bought ${item.name}!`);
  updateBotCoinsDisplay();
}

// === BOT DIFFICULTY ===

botDifficultySlider.oninput = () => {
  botDifficulty = Number(botDifficultySlider.value);
  updateBotDifficultyLabel();
};

// === SCREEN NAVIGATION ===

function showScreen(screenName) {
  for (const key in screens) {
    screens[key].hidden = key !== screenName;
  }
  if (screenName === 'battle') {
    renderBattleChoices();
    battleStatus.textContent = 'Choose your item to battle!';
  } else if (screenName === 'shop') {
    renderShop();
    shopStatus.textContent = '';
  } else if (screenName === 'matchup') {
    renderMatchupGraph();
  }
}

// === MATCHUP GRAPH ===

function renderMatchupGraph() {
  matchupGraphDiv.innerHTML = ''; // clear

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

  keys.forEach((key, i) => {
    const angle = (i / keys.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodePositions[key] = { x, y };
  });

  const rarityColors = {
    Common: "#a0a0a0",
    Uncommon: "#3cb371",
    Rare: "#1e90ff",
    Epic: "#ba55d3",
    Legendary: "#ff8c00",
    Mythic: "#dc143c",
  };

  // Arrow defs (once)
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

  // Draw nodes
  keys.forEach((key) => {
    const pos = nodePositions[key];
    const color = rarityColors[items[key].rarity] || "#666";

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

    const title = document.createElementNS(svgNS, "title");
    title.textContent = `${items[key].name} (${items[key].rarity})`;
    circle.appendChild(title);
  });
}

// === INIT ===

updateCoins();
updateBotCoinsDisplay();
updateBotDifficultyLabel();

showScreen('battle');

// === NAVIGATION BUTTONS ===

document.getElementById('nav-battle').onclick = () => showScreen('battle');
document.getElementById('nav-shop').onclick = () => showScreen('shop');
document.getElementById('nav-matchup').onclick = () => showScreen('matchup');
const botInventoryScreen = document.getElementById('bot-inventory-screen');
const botInventoryItemsDiv = document.getElementById('bot-inventory-items');
const navBotInventory = document.getElementById('nav-bot-inventory');

// Extend screens object:
screens.botInventory = botInventoryScreen;

// Render bot inventory items
function renderBotInventory() {
  botInventoryItemsDiv.innerHTML = '';

  if (botInventory.size === 0) {
    botInventoryItemsDiv.textContent = "Bot has no items.";
    return;
  }

  botInventory.forEach(key => {
    const item = items[key];
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';

    itemDiv.innerHTML = `
      <div class="inventory-icon">${item.icon}</div>
      <div class="inventory-name">${item.name}</div>
      <div class="inventory-rarity">${item.rarity}</div>
    `;

    botInventoryItemsDiv.appendChild(itemDiv);
  });
}

// Modify showScreen function to include bot inventory screen
function showScreen(screenName) {
  for (const key in screens) {
    screens[key].hidden = key !== screenName;
  }
  if (screenName === 'battle') {
    renderBattleChoices();
    battleStatus.textContent = 'Choose your item to battle!';
  } else if (screenName === 'shop') {
    renderShop();
    shopStatus.textContent = '';
  } else if (screenName === 'matchup') {
    renderMatchupGraph();
  } else if (screenName === 'botInventory') {
    renderBotInventory();
  }
}

// Add nav button event listener
navBotInventory.addEventListener('click', () => showScreen('botInventory'));
