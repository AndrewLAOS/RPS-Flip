// items.js
export const rarities = ["Common","Uncommon","Rare","Epic","Legendary","Mythic"];

/*
  allItems:
  - name, emoji, rarity, cost (coins), beats: array of keys
  - 'chaos' is special: beats everything except 'void'
*/
export const allItems = {
  rock:      { name:"Rock",      emoji:"🪨", rarity:"Common",    cost:0,  beats:["scissors","thorn","metal"] },
  paper:     { name:"Paper",     emoji:"📜", rarity:"Common",    cost:0,  beats:["rock","water","light"] },
  scissors:  { name:"Scissors",  emoji:"✂️", rarity:"Common",    cost:0,  beats:["paper","thorn","mirror"] },
  thorn:     { name:"Thorn",     emoji:"🌵", rarity:"Common",    cost:5,  beats:["paper","spirit"] },
  mirror:    { name:"Mirror",    emoji:"🪞", rarity:"Uncommon",  cost:12, beats:["wizard","shadow"] },
  fire:      { name:"Fire",      emoji:"🔥", rarity:"Uncommon",  cost:15, beats:["paper","scissors","ice"] },
  water:     { name:"Water",     emoji:"💧", rarity:"Uncommon",  cost:15, beats:["fire","rock","poison"] },
  wind:      { name:"Wind",      emoji:"💨", rarity:"Uncommon",  cost:18, beats:["water","poison","mirror"] },
  spirit:    { name:"Spirit",    emoji:"✨", rarity:"Rare",      cost:28, beats:["metal","mirror","shadow"] },
  earth:     { name:"Earth",     emoji:"🌍", rarity:"Rare",      cost:30, beats:["lightning","water","fire"] },
  ice:       { name:"Ice",       emoji:"🧊", rarity:"Rare",      cost:32, beats:["fire","wind","dragon"] },
  poison:    { name:"Poison",    emoji:"☠️", rarity:"Rare",      cost:30, beats:["earth","robot","spirit"] },
  metal:     { name:"Metal",     emoji:"⚙️", rarity:"Epic",      cost:44, beats:["ice","scissors","paper"] },
  robot:     { name:"Robot",     emoji:"🤖", rarity:"Epic",      cost:48, beats:["fire","earth","wizard"] },
  wizard:    { name:"Wizard",    emoji:"🧙‍♂️", rarity:"Epic",    cost:55, beats:["water","wind","dragon"] },
  shadow:    { name:"Shadow",    emoji:"🌑", rarity:"Epic",      cost:60, beats:["wizard","phoenix","light"] },
  light:     { name:"Light",     emoji:"💡", rarity:"Epic",      cost:58, beats:["shadow","void","dragon"] },
  dragon:    { name:"Dragon",    emoji:"🐉", rarity:"Legendary", cost:85, beats:["fire","earth","robot","metal"] },
  phoenix:   { name:"Phoenix",   emoji:"🦅", rarity:"Legendary", cost:90, beats:["wizard","dragon","spirit"] },
  time:      { name:"Time",      emoji:"⏳", rarity:"Mythic",    cost:140,beats:["phoenix","dragon","wizard","robot"] },
  void:      { name:"Void",      emoji:"🌌", rarity:"Mythic",    cost:160,beats:["time","phoenix","dragon"] },
  chaos:     { name:"Chaos",     emoji:"🌀", rarity:"Mythic",    cost:180,beats:["all"] }, // special: beats all except void
  beast:     { name:"Beast",     emoji:"🦁", rarity:"Rare",      cost:34, beats:["thorn","scissors","metal"] },
  mirrorblade:{name:"Mirror Blade", emoji:"🔪", rarity:"Epic",  cost:62, beats:["beast","scissors","shadow"] }
};

// beatsItem helper to evaluate results
export function beatsItem(a, b) {
  if (!a || !b) return false;
  if (a === b) return false;

  // chaos special: beats everything except void
  if (a === "chaos") return b !== "void";
  if (b === "chaos") return a === "void"; // chaos loses to void

  // standard direct checks
  const aItem = allItems[a];
  if (!aItem) return false;

  // 'all' means this item beats everything (rare special; used only by chaos)
  if (aItem.beats.includes("all")) return b !== "void";

  // direct explicit beats
  if (aItem.beats.includes(b)) return true;

  // fallback: rarity-based heuristic (higher rarity tends to beat lower)
  const rarityRank = { "Common":0, "Uncommon":1, "Rare":2, "Epic":3, "Legendary":4, "Mythic":5 };
  const aRank = rarityRank[aItem.rarity] ?? 0;
  const bRank = rarityRank[allItems[b].rarity] ?? 0;

  // small chance for lower rarities to beat higher: if difference > 1 prefer higher
  if (aRank > bRank + 1) return true;
  if (bRank > aRank + 1) return false;

  // otherwise tie-like; return false here (handled as tie)
  return false;
}
