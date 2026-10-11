// High-frequency, smooth-flow English word dictionary (Monkeytype standard)
const COMMON_EASY_WORDS = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they',
  'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his',
  'from', 'say', 'her', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
  'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into',
  'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
  'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
  'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
  'these', 'give', 'day', 'most', 'us', 'great', 'world', 'life', 'hand', 'part', 'child',
  'eye', 'woman', 'place', 'work', 'week', 'case', 'point', 'government', 'company', 'number',
  'group', 'problem', 'fact', 'feel', 'try', 'leave', 'call', 'play', 'small', 'large',
  'high', 'long', 'little', 'right', 'big', 'old', 'water', 'tree', 'river', 'sun',
  'sky', 'light', 'star', 'air', 'road', 'book', 'word', 'home', 'mind', 'city',
  'house', 'night', 'sound', 'head', 'stand', 'keep', 'start', 'show', 'hear', 'run',
  'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'lose',
  'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch',
  'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open',
  'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve',
  'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'remain', 'simple', 'clean',
  'fast', 'speed', 'clear', 'smile', 'dream', 'quiet', 'green', 'blue', 'stone', 'field',
  'heart', 'story', 'sweet', 'music', 'peace', 'paper', 'friend', 'table', 'cloud', 'ocean'
];

const MEDIUM_WORDS = [
  'accuracy', 'balance', 'cadence', 'deliberate', 'effortless', 'frequency', 'gentle',
  'harmony', 'improve', 'journey', 'kinetic', 'luminous', 'mastery', 'natural', 'observe',
  'precision', 'quality', 'reflex', 'steady', 'tactile', 'unbroken', 'velocity', 'wisdom',
  'achieve', 'breathe', 'clarity', 'develop', 'elevate', 'fluent', 'graceful', 'habit',
  'insight', 'joyful', 'keen', 'legacy', 'motion', 'nimble', 'optimal', 'patience',
  'quietly', 'rhythm', 'subtle', 'talent', 'unique', 'vital', 'wonder', 'zenith'
];

const HARD_WORDS = [
  'algorithm', 'synchronous', 'asynchronous', 'concurrency', 'parameter', 'complexity',
  'architecture', 'distributed', 'throughput', 'bandwidth', 'microservice', 'optimization',
  'cryptography', 'polymorphism', 'encapsulation', 'abstraction', 'configuration', 'hexadecimal',
  'telemetry', 'calibration', 'equilibrium', 'perspective', 'exponential', 'infrastructure'
];

// Generate an engaging, flowing text stream of given word length
export const generateWordStream = (
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'EASY',
  wordCount: number = 180
): string => {
  const words: string[] = [];
  const pool = difficulty === 'EASY'
    ? COMMON_EASY_WORDS
    : difficulty === 'MEDIUM'
      ? [...COMMON_EASY_WORDS, ...MEDIUM_WORDS]
      : [...COMMON_EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS];

  let prevWord = '';
  for (let i = 0; i < wordCount; i++) {
    let candidate = pool[Math.floor(Math.random() * pool.length)];
    // Avoid immediate repeated words for smooth rhythm
    while (candidate === prevWord) {
      candidate = pool[Math.floor(Math.random() * pool.length)];
    }
    prevWord = candidate;
    words.push(candidate);
  }

  return words.join(' ');
};

export const getRandomText = (
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'EASY',
  wordCount: number = 180
): string => {
  return generateWordStream(difficulty, wordCount);
};
