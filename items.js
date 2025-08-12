export const RARITY = {
  COMMON: 'Common',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
};

export const allItems = {
  rock: { icon: '✊', name: 'Rock', cost: 0, rarity: RARITY.COMMON, beats: ['scissors', 'fire'], color: '#A9A9A9' },
  paper: { icon: '✋', name: 'Paper', cost: 0, rarity: RARITY.COMMON, beats: ['rock', 'robot'], color: '#FFFFFF' },
  scissors: { icon: '✌️', name: 'Scissors', cost: 0, rarity: RARITY.COMMON, beats: ['paper', 'water'], color: '#C0C0C0' },
  fire: { icon: '🔥', name: 'Fire', cost: 15, rarity: RARITY.RARE, beats: ['paper', 'robot'], color: '#FF4500' },
  water: { icon: '💧', name: 'Water', cost: 15, rarity: RARITY.RARE, beats: ['rock', 'fire'], color: '#1E90FF' },
  robot: { icon: '🤖', name: 'Robot', cost: 20, rarity: RARITY.RARE, beats: ['scissors', 'water'], color: '#708090' },
  lightning: { icon: '⚡', name: 'Lightning', cost: 40, rarity: RARITY.EPIC, beats: ['water', 'fire', 'robot'], color: '#FFD700' },
  wind: { icon: '🌪️', name: 'Wind', cost: 40, rarity: RARITY.EPIC, beats: ['fire', 'rock', 'scissors'], color: '#87CEEB' },
  earth: { icon: '🌍', name: 'Earth', cost: 45, rarity: RARITY.EPIC, beats: ['water', 'lightning'], color: '#8B4513' },
  wizard: { icon: '🧙‍♂️', name: 'Wizard', cost: 80, rarity: RARITY.LEGENDARY, beats: ['robot', 'earth', 'scissors', 'wind'], color: '#6A0DAD' },
  dragon: { icon: '🐉', name: 'Dragon', cost: 100, rarity: RARITY.LEGENDARY, beats: ['wizard', 'lightning', 'fire'], color: '#FF4500' },
};
