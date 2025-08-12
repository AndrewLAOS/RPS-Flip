let coins = 10;
let botDifficulty = 1;
let playerInventory = ["rock", "paper", "scissors"];

// Update UI
function updateCoins() {
  document.getElementById("coins").textContent = coins;
}

function renderItems() {
  const container = document.getElementById("player-items");
  container.innerHTML = "";
  playerInventory.forEach(itemKey => {
    const item = allItems[itemKey];
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<div>${item.emoji}</div><div>${item.name}</div>`;
    div.onclick = () => playRound(itemKey);
    container.appendChild(div);
  });
}

function renderShop() {
  const shop = document.getElementById("shop-items");
  shop.innerHTML = "";
  Object.keys(allItems).forEach(key => {
    const item = allItems[key];
    if (!playerInventory.includes(key) && item.price > 0) {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<div>${item.emoji}</div><div>${item.name}</div><div>${item.price}💰</div>`;
      div.onclick = () => buyItem(key);
      shop.appendChild(div);
    }
  });
}

function buyItem(key) {
  const item = allItems[key];
  if (coins >= item.price) {
    coins -= item.price;
    playerInventory.push(key);
    updateCoins();
    renderItems();
    renderShop();
  }
}

// Bot pick with weighted difficulty
function botPick(playerChoice) {
  const weightedArr = [];
  Object.keys(allItems).forEach(key => {
    let weight = 1;

    if (allItems[key].beats.includes(playerChoice)) {
      weight += botDifficulty; // bias to win
    }

    if (botDifficulty <= 3 && allItems[playerChoice].beats.includes(key)) {
      weight += 2; // bias to lose
    }

    for (let i = 0; i < weight; i++) {
      weightedArr.push(key);
    }
  });
  return weightedArr[Math.floor(Math.random() * weightedArr.length)];
}

// Play round
function playRound(playerChoice) {
  const botChoice = botPick(playerChoice);
  const playerSlot = document.getElementById("player-choice");
  const botSlot = document.getElementById("bot-choice");

  playerSlot.textContent = allItems[playerChoice].emoji;
  botSlot.textContent = allItems[botChoice].emoji;

  let result;
  if (playerChoice === botChoice) {
    result = "draw";
  } else if (allItems[playerChoice].beats.includes(botChoice)) {
    result = "win";
    coins += 2;
    if (botDifficulty < 10) botDifficulty++;
  } else {
    result = "lose";
    if (coins > 0) coins--;
    if (botDifficulty > 1) botDifficulty--;
  }

  updateCoins();
  document.getElementById("botDifficulty").textContent = botDifficulty;
  console.log(`You ${result}!`);
}

// Init
updateCoins();
renderItems();
renderShop();
function animateChoice(playerBtn, botBtn, playerChoice, botChoice) {
  const resetStyle = (btn) => {
    btn.style.animation = 'none';
    btn.style.filter = 'none';
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = 'none';
  };
  resetStyle(playerBtn);
  resetStyle(botBtn);

  function addAnimation(btn, animName) {
    return new Promise((resolve) => {
      btn.style.animation = `${animName} 0.7s ease forwards`;
      btn.addEventListener('animationend', () => {
        btn.style.animation = 'none';
        resolve();
      }, { once: true });
    });
  }

  const animationsMap = {
    rock: 'rockShake',
    paper: 'paperFlutter',
    scissors: 'scissorsCut',
    fire: 'fireFlicker',
    water: 'waterSplash',
    robot: 'robotBlink',
    lightning: 'lightningStrike',
    wind: 'windBlow',
    earth: 'earthPulse',
    wizard: 'wizardGlow',
    dragon: 'dragonFire',
  };

  const playerAnim = animationsMap[playerChoice] || 'pulse';
  const botAnim = animationsMap[botChoice] || 'pulse';

  playerBtn.style.transform = 'scale(1.3)';
  playerBtn.style.boxShadow = `0 0 20px 6px #4CAF50`;

  botBtn.style.transform = 'scale(1.3)';
  botBtn.style.boxShadow = `0 0 20px 6px #f44336`;

  return Promise.all([
    addAnimation(playerBtn, playerAnim),
    addAnimation(botBtn, botAnim)
  ]).then(() => {
    resetStyle(playerBtn);
    resetStyle(botBtn);
  });
}
function playRound(playerChoice) {
  const botChoice = botPick(playerChoice);
  const playerSlot = document.getElementById("player-choice");
  const botSlot = document.getElementById("bot-choice");

  playerSlot.textContent = allItems[playerChoice].emoji;
  botSlot.textContent = allItems[botChoice].emoji;

  animateChoice(playerSlot, botSlot, playerChoice, botChoice).then(() => {
    let result;
    if (playerChoice === botChoice) {
      result = "draw";
    } else if (allItems[playerChoice].beats.includes(botChoice)) {
      result = "win";
      coins += 2;
      if (botDifficulty < 10) botDifficulty++;
    } else {
      result = "lose";
      if (coins > 0) coins--;
      if (botDifficulty > 1) botDifficulty--;
    }
    updateCoins();
    document.getElementById("botDifficulty").textContent = botDifficulty;
    console.log(`You ${result}!`);
  });
}
