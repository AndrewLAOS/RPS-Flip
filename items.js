// --- items.js ---

const itemList = [
  "rock", "paper", "scissors", "thorn", "tide", "vine", "spock",
  "dagger", "magnet", "mirror", "bomb", "earth", "robot", "shield", "prism",
  "ice_beam", "clock", "storm", "thunder", "comet",
  "phoenix", "eclipse", "storm_king",
  "thunder_god", "void"
];

// Corrected rarities array to match itemList length (25 items)
const rarities = [
  "Common", "Common", "Common", "Common", "Common", "Common", "Common",
  "Uncommon", "Uncommon", "Uncommon", "Uncommon", "Uncommon", "Uncommon", "Uncommon", "Uncommon",
  "Rare", "Rare", "Rare", "Rare", "Rare", "Rare", "Rare",
  "Epic", "Epic", "Epic",
  "Legendary"
];

// Icons mapped by key:
const icons = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
  thorn: "🌵",
  tide: "🌊",
  vine: "🌿",
  spock: "🖖",
  dagger: "🗡️",
  magnet: "🧲",
  mirror: "🪞",
  bomb: "💣",
  earth: "🌍",
  robot: "🤖",
  shield: "🛡️",
  prism: "🔮",
  ice_beam: "❄️",
  clock: "⏰",
  storm: "⛈️",
  thunder: "⚡",
  comet: "☄️",
  phoenix: "🔥",
  eclipse: "🌑",
  storm_king: "⛈️👑",
  thunder_god: "⚡👑",
  void: "🕳️"
};

// --- New Logic Explained ---

// This object maps each rarity to the number of items it can beat.
// The total number of items is 25. A base beat count of 7 is less than half.
// A Legendary item beats 12, which is almost half of all items, making it very powerful.
const beatsByRarity = {
  "Common": 7,
  "Uncommon": 8,
  "Rare": 9,
  "Epic": 10,
  "Legendary": 12
};

function generateItems(itemKeys, rarities) {
  const n = itemKeys.length;
  let items = {};
  for(let i=0; i<n; i++) {
    const key = itemKeys[i];
    const rarity = rarities[i] || "Common";

    // Get the number of beats based on the item's rarity
    const numToBeat = beatsByRarity[rarity];

    let beats = [];
    for(let j=1; j<=numToBeat; j++) {
      beats.push(itemKeys[(i+j) % n]);
    }
    
    items[key] = {
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      icon: icons[key] || "❓",
      rarity,
      cost: (i+1)*5,
      beats,
      description: `This is the ${key} item.`,
      flavor: "Balanced for perfect interaction."
    };
  }
  return items;
}

export const items = generateItems(itemList, rarities);
export const itemKeys = itemList;