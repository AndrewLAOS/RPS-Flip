// --- items.js ---

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

const baseItems = {
  // Common Tier
  rock: {key:"rock", name:"Rock", icon:icons.rock, rarity:"Common", cost:5},
  paper: {key:"paper", name:"Paper", icon:icons.paper, rarity:"Common", cost:10},
  scissors: {key:"scissors", name:"Scissors", icon:icons.scissors, rarity:"Common", cost:15},
  thorn: {key:"thorn", name:"Thorn", icon:icons.thorn, rarity:"Common", cost:20},
  tide: {key:"tide", name:"Tide", icon:icons.tide, rarity:"Common", cost:25},
  vine: {key:"vine", name:"Vine", icon:icons.vine, rarity:"Common", cost:30},
  spock: {key:"spock", name:"Spock", icon:icons.spock, rarity:"Common", cost:35},

  // Uncommon Tier
  dagger: {key:"dagger", name:"Dagger", icon:icons.dagger, rarity:"Uncommon", cost:40},
  magnet: {key:"magnet", name:"Magnet", icon:icons.magnet, rarity:"Uncommon", cost:45},
  mirror: {key:"mirror", name:"Mirror", icon:icons.mirror, rarity:"Uncommon", cost:50},
  bomb: {key:"bomb", name:"Bomb", icon:icons.bomb, rarity:"Uncommon", cost:55},
  earth: {key:"earth", name:"Earth", icon:icons.earth, rarity:"Uncommon", cost:60},
  robot: {key:"robot", name:"Robot", icon:icons.robot, rarity:"Uncommon", cost:65},
  shield: {key:"shield", name:"Shield", icon:icons.shield, rarity:"Uncommon", cost:70},

  // Rare Tier
  prism: {key:"prism", name:"Prism", icon:icons.prism, rarity:"Rare", cost:75},
  ice_beam: {key:"ice_beam", name:"Ice Beam", icon:icons.ice_beam, rarity:"Rare", cost:80},
  clock: {key:"clock", name:"Clock", icon:icons.clock, rarity:"Rare", cost:85},
  storm: {key:"storm", name:"Storm", icon:icons.storm, rarity:"Rare", cost:90},
  thunder: {key:"thunder", name:"Thunder", icon:icons.thunder, rarity:"Rare", cost:95},
  comet: {key:"comet", name:"Comet", icon:icons.comet, rarity:"Rare", cost:100},
  phoenix: {key:"phoenix", name:"Phoenix", icon:icons.phoenix, rarity:"Rare", cost:105},

  // Epic Tier
  eclipse: {key:"eclipse", name:"Eclipse", icon:icons.eclipse, rarity:"Epic", cost:110},
  storm_king: {key:"storm_king", name:"Storm King", icon:icons.storm_king, rarity:"Epic", cost:115},
  thunder_god: {key:"thunder_god", name:"Thunder God", icon:icons.thunder_god, rarity:"Epic", cost:120},

  // Legendary Tier
  void: {key:"void", name:"Void", icon:icons.void, rarity:"Legendary", cost:125},
};

// Randomized beats generator
function generateBeats(itemKey, rarity, itemsObj) {
  const rarities = ["Common","Uncommon","Rare","Epic","Legendary"];
  const currentIndex = rarities.indexOf(rarity);
  const beats = [];

  for (let key in itemsObj) {
    if (key === itemKey) continue;
    const targetIndex = rarities.indexOf(itemsObj[key].rarity);

    // Void can only be beaten by Clock
    if (itemsObj[key].key === "void") {
      if (itemKey === "clock") beats.push("void");
      continue;
    }

    // Higher rarities beat lower rarities ~80% of the time
    if (targetIndex < currentIndex && Math.random() < 0.8) beats.push(key);

    // Lower rarities beat higher rarities ~20% of the time (randomly)
    if (targetIndex > currentIndex && Math.random() < 0.2) beats.push(key);
  }

  // Classic RPS overrides
  if (itemKey === "rock") beats.push("scissors");
  if (itemKey === "paper") beats.push("rock");
  if (itemKey === "scissors") beats.push("paper");

  // Logical wins for flavor
  const logicalWins = {
    scissors: ["vine","tide"],
    thorn: ["vine","dagger"],
    paper: ["spock"],
    rock: ["thorn"]
  };
  if (logicalWins[itemKey]) logicalWins[itemKey].forEach(k => {
    if (!beats.includes(k)) beats.push(k);
  });

  return [...new Set(beats)];
}

// Final items object
export const items = {};
for (let key in baseItems) {
  items[key] = {...baseItems[key]};
  items[key].beats = generateBeats(key, baseItems[key].rarity, baseItems);
}

export const itemKeys = Object.keys(items);
