const itemList = [
  "rock", "paper", "scissors", "thorn", "tide", "vine", "spock",
  "dagger", "magnet", "mirror",
  "bomb", "earth", "robot",  "shield", "prism",
  "ice_beam","clock", "storm", "thunder", "comet",
  "phoenix", "eclipse", "storm_king",
  "thunder_god", "void"
];

// Assign rarities arbitrarily or by grouping by index
const rarities = [
  "Common","Common","Common","Common","Common","Common","Common","Common",
  "Uncommon","Uncommon","Uncommon","Uncommon","Uncommon","Uncommon","Uncommon","Uncommon",
  "Rare","Rare","Rare","Rare","Rare","Rare","Rare","Rare",
  "Epic","Epic","Epic","Epic","Epic","Epic","Epic","Epic",
  "Legendary","Legendary","Legendary","Legendary","Legendary","Legendary","Legendary","Legendary"
];

// Sample base data with icons, costs, etc. could be filled as needed.

function generateItems(itemKeys, rarities) {
  const n = itemKeys.length;
  let items = {};
  for(let i=0; i<n; i++) {
    const key = itemKeys[i];
    // Compute beats: next half of items cyclically (n/2 = 20 here)
    let beats = [];
    for(let j=1; j<=n/2; j++) {
      beats.push(itemKeys[(i+j) % n]);
    }
    items[key] = {
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      icon: "❓", // placeholder
      rarity: rarities[i],
      cost: (i+1)*5, // just an example cost
      beats,
      description: `This is the ${key} item.`,
      flavor: "Balanced for perfect interaction."
    };
  }
  return items;
}

export const items = generateItems(itemList, rarities);
export const itemKeys = itemList;
