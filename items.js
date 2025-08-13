// --- items.js ---

// Icons mapped by key:
export const icons = {
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

// Manually defined items with curated beats arrays for strategic gameplay
export const items = {
  // Common Tier (Cost 5-35)
  rock: {
    key: "rock", name: "Rock", icon: icons.rock, rarity: "Common", cost: 5,
    beats: ["scissors", "thorn", "earth", "bomb", "robot", "ice_beam", "thunder", "comet"],
  },
  paper: {
    key: "paper", name: "Paper", icon: icons.paper, rarity: "Common", cost: 10,
    beats: ["rock", "spock", "dagger", "mirror", "bomb", "shield", "prism", "ice_beam", "thunder"],
  },
  scissors: {
    key: "scissors", name: "Scissors", icon: icons.scissors, rarity: "Common", cost: 15,
    beats: ["paper", "vine", "spock", "dagger", "magnet", "robot", "prism", "clock"],
  },
  thorn: {
    key: "thorn", name: "Thorn", icon: icons.thorn, rarity: "Common", cost: 20,
    beats: ["paper", "vine", "tide", "dagger", "bomb", "prism", "phoenix"], // Surprising win against Phoenix
  },
  tide: {
    key: "tide", name: "Tide", icon: icons.tide, rarity: "Common", cost: 25,
    beats: ["rock", "vine", "magnet", "earth", "robot", "storm", "thunder"],
  },
  vine: {
    key: "vine", name: "Vine", icon: icons.vine, rarity: "Common", cost: 30,
    beats: ["paper", "tide", "magnet", "shield", "phoenix", "eclipse", "void"], // Surprising win against Void
  },
  spock: {
    key: "spock", name: "Spock", icon: icons.spock, rarity: "Common", cost: 35,
    beats: ["rock", "scissors", "dagger", "magnet", "bomb", "earth", "storm"],
  },

  // Uncommon Tier (Cost 40-70)
  dagger: {
    key: "dagger", name: "Dagger", icon: icons.dagger, rarity: "Uncommon", cost: 40,
    beats: ["paper", "thorn", "tide", "vine", "robot", "clock", "storm_king", "thunder_god"],
  },
  magnet: {
    key: "magnet", name: "Magnet", icon: icons.magnet, rarity: "Uncommon", cost: 45,
    beats: ["scissors", "dagger", "bomb", "robot", "shield", "comet", "eclipse"],
  },
  mirror: {
    key: "mirror", name: "Mirror", icon: icons.mirror, rarity: "Uncommon", cost: 50,
    beats: ["rock", "thorn", "spock", "bomb", "ice_beam", "storm", "comet"],
  },
  bomb: {
    key: "bomb", name: "Bomb", icon: icons.bomb, rarity: "Uncommon", cost: 55,
    beats: ["tide", "vine", "spock", "dagger", "prism", "comet", "eclipse", "void"], // Surprising win against Void
  },
  earth: {
    key: "earth", name: "Earth", icon: icons.earth, rarity: "Uncommon", cost: 60,
    beats: ["rock", "spock", "mirror", "shield", "ice_beam", "storm", "storm_king", "thunder_god"],
  },
  robot: {
    key: "robot", name: "Robot", icon: icons.robot, rarity: "Uncommon", cost: 65,
    beats: ["paper", "scissors", "thorn", "tide", "mirror", "clock", "phoenix", "void"], // Surprising win against Void
  },
  shield: {
    key: "shield", name: "Shield", icon: icons.shield, rarity: "Uncommon", cost: 70,
    beats: ["paper", "thorn", "vine", "spock", "bomb", "storm_king", "thunder_god", "void"], // Surprising win against Void
  },

  // Rare Tier (Cost 75-105)
  prism: {
    key: "prism", name: "Prism", icon: icons.prism, rarity: "Rare", cost: 75,
    beats: ["paper", "scissors", "spock", "dagger", "magnet", "bomb", "robot", "shield", "phoenix"],
  },
  ice_beam: {
    key: "ice_beam", name: "Ice Beam", icon: icons.ice_beam, rarity: "Rare", cost: 80,
    beats: ["rock", "scissors", "vine", "tide", "magnet", "mirror", "earth", "robot", "thunder_god"],
  },
  clock: {
    key: "clock", name: "Clock", icon: icons.clock, rarity: "Rare", cost: 85,
    beats: ["rock", "paper", "thorn", "tide", "spock", "dagger", "magnet", "mirror", "bomb", "earth"],
  },
  storm: {
    key: "storm", name: "Storm", icon: icons.storm, rarity: "Rare", cost: 90,
    beats: ["paper", "scissors", "tide", "vine", "dagger", "magnet", "mirror", "bomb", "robot", "void"], // Surprising win against Void
  },
  thunder: {
    key: "thunder", name: "Thunder", icon: icons.thunder, rarity: "Rare", cost: 95,
    beats: ["paper", "thorn", "tide", "vine", "spock", "magnet", "mirror", "bomb", "earth", "robot", "void"], // Surprising win against Void
  },
  comet: {
    key: "comet", name: "Comet", icon: icons.comet, rarity: "Rare", cost: 100,
    beats: ["rock", "scissors", "thorn", "vine", "spock", "dagger", "mirror", "bomb", "earth", "robot", "void"], // Surprising win against Void
  },
  phoenix: {
    key: "phoenix", name: "Phoenix", icon: icons.phoenix, rarity: "Rare", cost: 105,
    beats: ["rock", "paper", "scissors", "tide", "spock", "dagger", "magnet", "mirror", "bomb", "earth", "robot", "shield"],
  },

  // Epic Tier (Cost 110-120)
  eclipse: {
    key: "eclipse", name: "Eclipse", icon: icons.eclipse, rarity: "Epic", cost: 110,
    beats: ["rock", "paper", "thorn", "tide", "spock", "dagger", "magnet", "mirror", "bomb", "earth", "robot", "shield", "prism", "ice_beam"],
  },
  storm_king: {
    key: "storm_king", name: "Storm King", icon: icons.storm_king, rarity: "Epic", cost: 115,
    beats: ["paper", "scissors", "thorn", "tide", "vine", "spock", "magnet", "mirror", "bomb", "earth", "robot", "shield", "prism", "ice_beam", "clock"],
  },
  thunder_god: {
    key: "thunder_god", name: "Thunder God", icon: icons.thunder_god, rarity: "Epic", cost: 120,
    beats: ["paper", "scissors", "thorn", "tide", "vine", "spock", "dagger", "magnet", "mirror", "bomb", "earth", "robot", "shield", "prism", "ice_beam", "clock", "storm", "comet"],
  },

  // Legendary Tier (Cost 125)
  void: {
    key: "void", name: "Void", icon: icons.void, rarity: "Legendary", cost: 125,
    beats: ["rock", "paper", "scissors", "tide", "spock", "dagger", "magnet", "mirror", "earth", "robot", "shield", "prism", "ice_beam", "clock", "storm", "thunder", "comet", "phoenix", "eclipse", "storm_king", "thunder_god"],
  },
};

// Use this for the item keys
export const itemKeys = Object.keys(items);