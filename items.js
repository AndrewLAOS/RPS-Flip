const itemList = [
  "rock", "paper", "scissors", "thorn", "tide", "vine", "spock",
  "dagger", "magnet", "mirror",
  "bomb", "earth", "robot",  "shield", "prism",
  "ice_beam","clock", "storm", "thunder", "comet",
  "phoenix", "eclipse", "storm_king",
  "thunder_god", "void"
];

// Add missing rarities array to match length (here only 26 items, so 26 rarities)
const rarities = [
  "Common","Common","Common","Common","Common","Common","Common",
  "Uncommon","Uncommon","Uncommon","Uncommon","Uncommon","Uncommon","Uncommon",
  "Rare","Rare","Rare","Rare","Rare","Rare","Rare","Epic","Epic","Epic","Epic","Legendary"
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
  phoenix: "� Phoenix",
  eclipse: "🌑",
  storm_king: "👑",
  thunder_god: "⚡👑",
  void: "🕳️"
};

function generateItems(itemKeys, rarities) {
  const n = itemKeys.length;
  let items = {};
  for(let i=0; i<n; i++) {
    const key = itemKeys[i];
    // next half beats cyclically
    let beats = [];
    for(let j=1; j<=Math.floor(n/2); j++) {
      beats.push(itemKeys[(i+j) % n]);
    }
    items[key] = {
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      icon: icons[key] || "❓",
      rarity: rarities[i] || "Common",
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
