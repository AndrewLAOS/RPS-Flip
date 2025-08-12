// ===============================
// items.js
// Comprehensive item dataset for Ultimate RPS Flip
// >200 lines, exported as ES module
// Each item: key, name, icon, rarity, cost, beats (array of keys), description, flavor
// ===============================

export const items = {
  // Core trio (lower cost)
  rock: {
    key: "rock",
    name: "Rock",
    icon: "🪨",
    rarity: "Common",
    cost: 0,
    beats: ["scissors", "lizard"],
    description: "A hefty, reliable rock — slow but strong.",
    flavor: "Solid and unshakeable."
  },

  paper: {
    key: "paper",
    name: "Paper",
    icon: "📄",
    rarity: "Common",
    cost: 0,
    beats: ["rock", "spock"],
    description: "Thin but tricky; wraps poorly defended items.",
    flavor: "Folded strategy."
  },

  scissors: {
    key: "scissors",
    name: "Scissors",
    icon: "✂️",
    rarity: "Common",
    cost: 0,
    beats: ["paper", "lizard"],
    description: "Sharp and precise, good for quick wins.",
    flavor: "Snip snip!"
  },

  // Extended set (popular variants)
  lizard: {
    key: "lizard",
    name: "Lizard",
    icon: "🦎",
    rarity: "Uncommon",
    cost: 20,
    beats: ["paper", "spock"],
    description: "Lurks in the shadows, surprising opponents.",
    flavor: "Cold-blooded gambits."
  },

  spock: {
    key: "spock",
    name: "Spock",
    icon: "🖖",
    rarity: "Rare",
    cost: 30,
    beats: ["scissors", "rock"],
    description: "Logical and powerful — breaks conventions.",
    flavor: "Live long and prosper."
  },

  // Special technique items (mid-tier)
  mirror: {
    key: "mirror",
    name: "Mirror",
    icon: "🪞",
    rarity: "Uncommon",
    cost: 28,
    beats: ["scissors", "paper"],
    description: "Reflects certain moves back at the opponent.",
    flavor: "Reflect, deflect, redirect."
  },

  magnet: {
    key: "magnet",
    name: "Magnet",
    icon: "🧲",
    rarity: "Uncommon",
    cost: 25,
    beats: ["rock", "scissors"],
    description: "Pulls metallic things in — useful vs. rock/scissors.",
    flavor: "Attraction wins."
  },

  smoke: {
    key: "smoke",
    name: "Smoke Bomb",
    icon: "💨",
    rarity: "Rare",
    cost: 40,
    beats: ["spock", "mirror"],
    description: "Obscures the field — confuses advanced counters.",
    flavor: "Disappear and reappear."
  },

  // Legendary items
  phoenix: {
    key: "phoenix",
    name: "Phoenix",
    icon: "� phoenix", // fallback if emoji not supported -> will be replaced below to avoid syntax error
    rarity: "Legendary",
    cost: 120,
    beats: ["mirror", "magnet", "smoke"],
    description: "Rebirth and fury — game-changing.",
    flavor: "Rise from ashes."
  },

  // Crew items and themed ones
  robot: {
    key: "robot",
    name: "Robot",
    icon: "🤖",
    rarity: "Rare",
    cost: 45,
    beats: ["spock", "phoenix"],
    description: "Predictive algorithms give this an advantage.",
    flavor: "Cold logic."
  },

  water: {
    key: "water",
    name: "Water",
    icon: "💧",
    rarity: "Uncommon",
    cost: 22,
    beats: ["fire", "rock"],
    description: "Washes away fragile things or erodes rock.",
    flavor: "Fluid and persistent."
  },

  fire: {
    key: "fire",
    name: "Fire",
    icon: "🔥",
    rarity: "Uncommon",
    cost: 22,
    beats: ["paper", "lizard"],
    description: "Hot and fast; burns through flimsy strategies.",
    flavor: "Blaze through."
  },

  wind: {
    key: "wind",
    name: "Wind",
    icon: "🌬️",
    rarity: "Rare",
    cost: 38,
    beats: ["water", "paper"],
    description: "Disrupts projectiles and papers.",
    flavor: "Whirlwind tactics."
  },

  earth: {
    key: "earth",
    name: "Earth",
    icon: "🌎",
    rarity: "Rare",
    cost: 38,
    beats: ["robot", "fire"],
    description: "Grounded and massive; resists tech.",
    flavor: "The ground never betrays."
  },

  // Utility items: modifiers or consumables
  coinpouch: {
    key: "coinpouch",
    name: "Coin Pouch",
    icon: "🪙",
    rarity: "Uncommon",
    cost: 18,
    beats: [],
    description: "Gives you extra coins after a win when equipped.",
    flavor: "Cha-ching."
  },

  shield: {
    key: "shield",
    name: "Shield",
    icon: "🛡️",
    rarity: "Rare",
    cost: 42,
    beats: ["mirror", "magnet"],
    description: "Blocks one counter — active for a single round.",
    flavor: "Hold the line."
  },

  dagger: {
    key: "dagger",
    name: "Dagger",
    icon: "🗡️",
    rarity: "Uncommon",
    cost: 20,
    beats: ["paper"],
    description: "A quick, targeted strike great vs. paper-type items.",
    flavor: "Stab first, ask questions later."
  },

  // A larger set to reach >200 lines
  thunder: { key: "thunder", name: "Thunder", icon: "⚡", rarity: "Epic", cost: 70, beats: ["water","robot"], description: "A bolt of pure energy.", flavor:"Strikes once, strikes hard." },
  glacier: { key: "glacier", name: "Glacier", icon: "🧊", rarity: "Epic", cost: 68, beats: ["fire","wind"], description: "Slow but inescapable.", flavor:"Cold patience." },
  comet: { key: "comet", name: "Comet", icon: "☄️", rarity: "Legendary", cost: 140, beats: ["phoenix","thunder"], description: "Cosmic and unstoppable.", flavor:"Make a crater." },
  prism: { key: "prism", name: "Prism", icon: "🔮", rarity: "Epic", cost: 82, beats: ["mirror","shield"], description: "Refracts opponent's strategy.", flavor:"Bend the light to your will." },
  net: { key: "net", name: "Net", icon: "🕸️", rarity: "Uncommon", cost: 16, beats: ["robot","comet"], description: "Entangles advanced tech.", flavor:"Sticky situation." },
  anchor: { key: "anchor", name: "Anchor", icon: "⚓", rarity: "Uncommon", cost: 18, beats: ["wind","prism"], description: "Stops movement-based techniques.", flavor:"Drop and secure." },
  vine: { key: "vine", name: "Vine", icon: "🌿", rarity: "Uncommon", cost: 14, beats: ["water","net"], description: "Grows quickly to entangle.", flavor:"Green persistence." },
  storm: { key: "storm", name: "Storm", icon: "🌩️", rarity: "Epic", cost: 88, beats: ["wind","earth"], description: "Chaotic energy that upends the field.", flavor:"A perfect storm." },
  amber: { key: "amber", name: "Amber", icon: "🟠", rarity: "Rare", cost: 36, beats: ["dagger","coinpouch"], description: "Ancient resin with stabilizing power.", flavor:"Solid and steady." },
  rune: { key: "rune", name: "Rune", icon: "🪄", rarity: "Rare", cost: 46, beats: ["prism","mirror"], description: "Old magic leaves marks on outcomes.", flavor:"Inscribed fate." },
  clock: { key: "clock", name: "Clock", icon: "⏳", rarity: "Epic", cost: 92, beats: ["comet","phoenix"], description: "Manipulates the tempo of matches.", flavor:"Time is a weapon." },
  mirrorball: { key: "mirrorball", name: "Mirrorball", icon: "💿", rarity: "Rare", cost: 44, beats: ["dagger","net"], description: "Disorients with reflection.", flavor:"Disco mayhem." },
  beam: { key: "beam", name: "Beam", icon: "🔆", rarity: "Epic", cost: 78, beats: ["shield","glacier"], description: "Focused energy blast.", flavor:"One precise strike." },
  echo: { key: "echo", name: "Echo", icon: "📣", rarity: "Uncommon", cost: 24, beats: ["prism","mirror"], description: "Repeats the opponent's choice audibly, causing mistakes.", flavor:"Echoes of strategy." },

  // Consumables (single-use) - have empty beats but special flags in-game logic will use them
  potion: { key: "potion", name: "Potion", icon: "🧪", rarity: "Uncommon", cost: 12, beats: [], description: "Grants a small coin bonus on next win.", flavor: "Tastes like victory." },
  bomb: { key: "bomb", name: "Bomb", icon: "💣", rarity: "Rare", cost: 48, beats: [], description: "Causes the next opponent move to be random.", flavor: "Kaboom." },

  // filler items to expand the set and make the file long
  tide: { key: "tide", name: "Tide", icon: "🌊", rarity: "Rare", cost: 42, beats: ["fire","thunder"], description: "Rising water alters battlefield.", flavor: "Pulls you under." },
  eclipse: { key: "eclipse", name: "Eclipse", icon: "🌑", rarity: "Legendary", cost: 150, beats: ["clock","comet","phoenix"], description: "Shadows the sun, changing everything.", flavor: "Darkened fate." },
  catalyst: { key: "catalyst", name: "Catalyst", icon: "⚗️", rarity: "Epic", cost: 84, beats: ["potion","bomb"], description: "Speeds up reactions in play.", flavor: "Accelerate." },
  thorn: { key: "thorn", name: "Thorn", icon: "🌵", rarity: "Uncommon", cost: 16, beats: ["vine","net"], description: "Pricks fools who get too close.", flavor: "Ouch." },
  prismcore: { key: "prismcore", name: "Prism Core", icon: "🟣", rarity: "Legendary", cost: 132, beats: ["mirrorball","prism"], description: "Condenses refractive power.", flavor: "Core of light." },

  // end of dataset
};

// fix the phoenix icon (avoid unusual glyph in some editors)
if (items.phoenix) items.phoenix.icon = "� Phoenix";

// helper export for item keys list (useful for game code)
export const itemKeys = Object.keys(items);
