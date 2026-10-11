import { KeyboardHeatmapData, KeyMetric } from '../types';

const HEATMAP_STORAGE_KEY = 'typingiq_local_heatmap';
const ALL_LETTERS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

// Pre-seeded baseline keystrokes so heatmap immediately showcases dynamic typing feedback
const DEFAULT_SEED_DATA: Record<string, { total: number; errors: number }> = {
  E: { total: 42, errors: 1 },
  T: { total: 38, errors: 2 },
  A: { total: 35, errors: 0 },
  O: { total: 31, errors: 1 },
  I: { total: 29, errors: 0 },
  N: { total: 27, errors: 2 },
  S: { total: 25, errors: 1 },
  R: { total: 24, errors: 3 },
  H: { total: 22, errors: 1 },
  D: { total: 20, errors: 0 },
  L: { total: 18, errors: 1 },
  C: { total: 15, errors: 2 },
  U: { total: 14, errors: 1 },
  M: { total: 13, errors: 0 },
  W: { total: 12, errors: 1 },
  F: { total: 11, errors: 0 },
  G: { total: 10, errors: 1 },
  Y: { total: 9, errors: 0 },
  P: { total: 8, errors: 1 },
  B: { total: 7, errors: 1 },
  V: { total: 6, errors: 0 },
  K: { total: 5, errors: 1 },
  J: { total: 4, errors: 0 },
  X: { total: 3, errors: 1 },
  Z: { total: 2, errors: 0 },
  Q: { total: 2, errors: 0 },
};

export const getLocalHeatmapData = (): KeyboardHeatmapData => {
  let stored: Record<string, { total: number; errors: number }> = {};
  try {
    const raw = localStorage.getItem(HEATMAP_STORAGE_KEY);
    if (raw) {
      stored = JSON.parse(raw);
    } else {
      stored = { ...DEFAULT_SEED_DATA };
      localStorage.setItem(HEATMAP_STORAGE_KEY, JSON.stringify(stored));
    }
  } catch {
    stored = { ...DEFAULT_SEED_DATA };
  }

  const keys: KeyMetric[] = ALL_LETTERS.map((char) => {
    const stat = stored[char] || { total: 0, errors: 0 };
    const errRate = stat.total > 0 ? (stat.errors / stat.total) * 100 : 0;
    return {
      keyChar: char,
      totalPresses: stat.total,
      errorPresses: stat.errors,
      errorRate: Math.round(errRate * 10) / 10,
    };
  });

  const errorKeys = keys
    .filter((k) => k.errorPresses > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5)
    .map((k) => k.keyChar);

  const totalPresses = keys.reduce((acc, k) => acc + k.totalPresses, 0);
  const totalErrors = keys.reduce((acc, k) => acc + k.errorPresses, 0);
  const overallAcc =
    totalPresses > 0
      ? Math.round((((totalPresses - totalErrors) / totalPresses) * 100) * 10) / 10
      : 100;

  return {
    keys,
    mostFrequentErrorKeys: errorKeys,
    overallKeyAccuracy: overallAcc,
  };
};

export const saveKeystrokesToLocalHeatmap = (newStats: KeyMetric[]) => {
  if (!newStats || newStats.length === 0) return;

  let currentMap: Record<string, { total: number; errors: number }> = {};
  try {
    const raw = localStorage.getItem(HEATMAP_STORAGE_KEY);
    if (raw) {
      currentMap = JSON.parse(raw);
    } else {
      currentMap = { ...DEFAULT_SEED_DATA };
    }
  } catch {
    currentMap = { ...DEFAULT_SEED_DATA };
  }

  for (const s of newStats) {
    const char = s.keyChar.toUpperCase();
    if (!currentMap[char]) {
      currentMap[char] = { total: 0, errors: 0 };
    }
    currentMap[char].total += s.totalPresses || 0;
    currentMap[char].errors += s.errorPresses || 0;
  }

  try {
    localStorage.setItem(HEATMAP_STORAGE_KEY, JSON.stringify(currentMap));
  } catch (err) {
    console.warn('Failed to save local heatmap:', err);
  }
};
