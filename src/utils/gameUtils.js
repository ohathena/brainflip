// Cute animal emojis for cards
const EMOJI_OPTIONS = [
  '🐯',
  '🐼',
  '🐘',
  '🐵',
  '🦁',
  '🐮',
  '🦊',
  '🐻',
  '🐸',
  '🦒',
  '🐨',
  '🦋',
  '🐢',
  '🦉',
  '🦋',
  '🐧',
  '🐬',
  '🦎',
];

// Shuffle array using Fisher-Yates algorithm
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate cards based on difficulty level
export const generateCards = (difficulty) => {
  let pairsCount = 6; // Easy: 6 pairs = 12 cards

  if (difficulty === 'medium') {
    pairsCount = 8; // Medium: 8 pairs = 16 cards
  } else if (difficulty === 'hard') {
    pairsCount = 10; // Hard: 10 pairs = 20 cards
  }

  const selectedEmojis = EMOJI_OPTIONS.slice(0, pairsCount);
  const cards = [];

  selectedEmojis.forEach((emoji, index) => {
    cards.push({ id: index * 2, emoji, pairId: index });
    cards.push({ id: index * 2 + 1, emoji, pairId: index });
  });

  return shuffleArray(cards);
};

// Check if two cards match
export const cardsMatch = (card1, card2) => {
  return card1.pairId === card2.pairId;
};
