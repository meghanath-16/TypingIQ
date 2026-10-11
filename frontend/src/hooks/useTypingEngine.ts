import { useState, useEffect, useRef, useCallback } from 'react';
import { getRandomText, generateWordStream } from '../utils/textGenerator';
import { SecondTelemetry, CharError, BigramError, SessionSubmitPayload, KeyMetric } from '../types';
import { saveKeystrokesToLocalHeatmap } from '../utils/heatmapStorage';

export type TestDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type TestDuration = 15 | 30 | 60 | 120;
export type TestStatus = 'IDLE' | 'RUNNING' | 'COMPLETED';

interface UseTypingEngineProps {
  initialDuration?: TestDuration;
  initialDifficulty?: TestDifficulty;
  customText?: string;
  onTestComplete?: (results: SessionSubmitPayload) => void;
}

export const useTypingEngine = ({
  initialDuration = 30,
  initialDifficulty = 'EASY',
  customText,
  onTestComplete,
}: UseTypingEngineProps = {}) => {
  const [duration, setDuration] = useState<TestDuration>(initialDuration);
  const [difficulty, setDifficulty] = useState<TestDifficulty>(initialDifficulty);

  // Word-Aware Engine Core: Words array and user typed array
  const [words, setWords] = useState<string[]>(() => {
    if (customText) return customText.trim().split(/\s+/);
    return getRandomText(initialDifficulty, 200).trim().split(/\s+/);
  });
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  const [testStatus, setTestStatus] = useState<TestStatus>('IDLE');
  const [timeLeft, setTimeLeft] = useState<number>(duration);

  // Live Monkeytype Standard Metrics
  const [grossWpm, setGrossWpm] = useState<number>(0);
  const [netWpm, setNetWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);

  // Refs for state that shouldn't trigger re-renders or recreate timers
  const wordsRef = useRef<string[]>(words);
  const typedWordsRef = useRef<string[]>([]);
  const currentWordIndexRef = useRef<number>(0);

  const backspaceCountRef = useRef<number>(0);
  const durationRef = useRef<TestDuration>(duration);
  const difficultyRef = useRef<TestDifficulty>(difficulty);
  const testStatusRef = useRef<TestStatus>('IDLE');
  const onTestCompleteRef = useRef(onTestComplete);

  // Sync refs with props / state changes
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    typedWordsRef.current = typedWords;
  }, [typedWords]);

  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  useEffect(() => {
    testStatusRef.current = testStatus;
  }, [testStatus]);

  useEffect(() => {
    onTestCompleteRef.current = onTestComplete;
  }, [onTestComplete]);

  // Telemetry & Timing Refs
  const startTimeRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number | null>(null);
  const lastErrorTimeRef = useRef<number | null>(null);

  const ikiListRef = useRef<number[]>([]);
  const pauseListRef = useRef<number[]>([]);
  const recoveryTimesRef = useRef<number[]>([]);

  const correctedErrorsCountRef = useRef<number>(0);
  const telemetryRef = useRef<SecondTelemetry[]>([]);
  const charErrorsRef = useRef<Map<string, CharError>>(new Map());
  const bigramErrorsRef = useRef<Map<string, BigramError>>(new Map());
  const keyStatsRef = useRef<Map<string, { total: number; errors: number }>>(new Map());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Helper: compute total keystrokes & correct characters across typedWords
  const computeKeystrokes = useCallback(() => {
    const target = wordsRef.current;
    const typed = typedWordsRef.current;
    let correct = 0;
    let incorrect = 0;
    let totalTypedChars = 0;

    for (let w = 0; w < typed.length; w++) {
      const tWord = typed[w] || '';
      const targetWord = target[w] || '';
      totalTypedChars += tWord.length;

      // Completed words had a space typed after them (if w < typed.length - 1)
      if (w < typed.length - 1) {
        totalTypedChars += 1;
        correct += 1; // Correct space keystroke
      }

      for (let c = 0; c < tWord.length; c++) {
        if (c < targetWord.length && tWord[c] === targetWord[c]) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }

    const totalKeys = totalTypedChars + backspaceCountRef.current;
    return { correct, incorrect, totalKeys };
  }, []);

  // Finalize test calculation
  const finalizeTest = useCallback(() => {
    if (testStatusRef.current === 'COMPLETED') return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    testStatusRef.current = 'COMPLETED';
    setTestStatus('COMPLETED');
    setTimeLeft(0);

    const { correct, incorrect, totalKeys } = computeKeystrokes();
    const corrected = correctedErrorsCountRef.current;
    const totalMistakes = incorrect + corrected;
    const correctionRate = totalMistakes > 0 ? (corrected / totalMistakes) * 100.0 : 100.0;

    const testDuration = durationRef.current;
    const elapsedMs = startTimeRef.current
      ? Math.max(1000, Date.now() - startTimeRef.current)
      : testDuration * 1000;
    const elapsedMins = elapsedMs / 60000.0;

    const calculatedGross = elapsedMins > 0 ? totalKeys / 5.0 / elapsedMins : 0;
    const calculatedNet = elapsedMins > 0 ? Math.max(0, correct / 5.0 / elapsedMins) : 0;
    const calculatedAcc = totalKeys > 0 ? (correct / totalKeys) * 100.0 : 100.0;

    const avgIki =
      ikiListRef.current.length > 0
        ? ikiListRef.current.reduce((a, b) => a + b, 0) / ikiListRef.current.length
        : 0;

    const avgPause =
      pauseListRef.current.length > 0
        ? pauseListRef.current.reduce((a, b) => a + b, 0) / pauseListRef.current.length
        : 0;

    const avgRecovery =
      recoveryTimesRef.current.length > 0
        ? recoveryTimesRef.current.reduce((a, b) => a + b, 0) / recoveryTimesRef.current.length
        : 0;

    const keyStatsList: KeyMetric[] = Array.from(keyStatsRef.current.entries()).map(([k, v]) => ({
      keyChar: k,
      totalPresses: v.total,
      errorPresses: v.errors,
      errorRate: v.total > 0 ? Math.round((v.errors / v.total) * 100.0 * 10.0) / 10.0 : 0.0,
    }));

    let calculatedConsistency = 100;
    const recordedWpms = telemetryRef.current.map((t) => t.instantWpm).filter((w) => w > 0);
    if (recordedWpms.length > 1) {
      const mean = recordedWpms.reduce((a, b) => a + b, 0) / recordedWpms.length;
      if (mean > 0) {
        const variance =
          recordedWpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recordedWpms.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100;
        calculatedConsistency = Math.max(30, Math.min(99, Math.round(100 - cv)));
      }
    }

    const finalPayload: SessionSubmitPayload = {
      durationSeconds: testDuration,
      difficulty: difficultyRef.current,
      grossWpm: Math.round(calculatedGross * 10.0) / 10.0,
      netWpm: Math.round(calculatedNet * 10.0) / 10.0,
      accuracyPercentage: Math.round(calculatedAcc * 10.0) / 10.0,
      totalKeystrokes: totalKeys,
      correctKeystrokes: correct,
      errorCount: totalMistakes,
      backspaceCount: backspaceCountRef.current,
      correctedErrors: corrected,
      uncorrectedErrors: incorrect,
      correctionRate: Math.round(correctionRate * 10.0) / 10.0,
      avgInterKeyIntervalMs: Math.round(avgIki * 10.0) / 10.0,
      avgPauseDurationMs: Math.round(avgPause * 10.0) / 10.0,
      errorRecoveryTimeMs: Math.round(avgRecovery * 10.0) / 10.0,
      telemetry: [...telemetryRef.current],
      charErrors: Array.from(charErrorsRef.current.values()),
      bigramErrors: Array.from(bigramErrorsRef.current.values()),
      keyStats: keyStatsList,
      consistency: calculatedConsistency,
    };

    saveKeystrokesToLocalHeatmap(keyStatsList);

    if (onTestCompleteRef.current) {
      onTestCompleteRef.current(finalPayload);
    }
  }, [computeKeystrokes]);

  // Reset or initialize test
  const resetTest = useCallback(
    (newDuration?: TestDuration, newDifficulty?: TestDifficulty, newText?: string) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      const dur = newDuration !== undefined ? newDuration : durationRef.current;
      const diff = newDifficulty !== undefined ? newDifficulty : difficultyRef.current;
      const raw = newText || (customText ? customText : getRandomText(diff, 200));
      const wordList = raw.trim().split(/\s+/);

      setDuration(dur);
      setDifficulty(diff);
      setWords(wordList);
      setTypedWords([]);
      setCurrentWordIndex(0);
      setTestStatus('IDLE');
      setTimeLeft(dur);

      wordsRef.current = wordList;
      typedWordsRef.current = [];
      currentWordIndexRef.current = 0;
      backspaceCountRef.current = 0;
      testStatusRef.current = 'IDLE';

      setGrossWpm(0);
      setNetWpm(0);
      setAccuracy(100);
      setCorrectKeystrokes(0);
      setIncorrectKeystrokes(0);
      setBackspaceCount(0);

      startTimeRef.current = null;
      lastKeyTimeRef.current = null;
      lastErrorTimeRef.current = null;

      ikiListRef.current = [];
      pauseListRef.current = [];
      recoveryTimesRef.current = [];
      correctedErrorsCountRef.current = 0;

      telemetryRef.current = [];
      charErrorsRef.current.clear();
      bigramErrorsRef.current.clear();
      keyStatsRef.current.clear();

      setTimeout(() => {
        containerRef.current?.focus();
      }, 50);
    },
    [customText]
  );

  // Precision Wall-Clock Timer
  useEffect(() => {
    if (testStatus !== 'RUNNING') return;

    const startTimestamp = startTimeRef.current || Date.now();
    const durationMs = durationRef.current * 1000;
    let lastSecondRecorded = 0;

    timerIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTimestamp;
      const remainingSeconds = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));
      const elapsedSeconds = Math.floor(elapsedMs / 1000);

      setTimeLeft(remainingSeconds);

      // Record second-by-second telemetry snapshot
      if (elapsedSeconds > lastSecondRecorded && elapsedSeconds <= durationRef.current) {
        lastSecondRecorded = elapsedSeconds;
        const currentElapsedMins = Math.max(0.001, elapsedSeconds / 60.0);
        const { correct, incorrect, totalKeys } = computeKeystrokes();

        const instGross = totalKeys / 5.0 / currentElapsedMins;
        const instWpm = correct / 5.0 / currentElapsedMins;
        const instAcc = totalKeys > 0 ? (correct / totalKeys) * 100.0 : 100.0;
        const currentTotalErrors = incorrect + correctedErrorsCountRef.current;
        const prevCumulative =
          telemetryRef.current.length > 0
            ? telemetryRef.current[telemetryRef.current.length - 1].cumulativeErrors
            : 0;
        const errorsThisSecond = Math.max(0, currentTotalErrors - prevCumulative);

        telemetryRef.current.push({
          secondMarker: elapsedSeconds,
          instantWpm: Math.round(instWpm * 10.0) / 10.0,
          rawWpm: Math.round(instGross * 10.0) / 10.0,
          instantAccuracy: Math.round(instAcc * 10.0) / 10.0,
          cumulativeErrors: currentTotalErrors,
          errorsAtSecond: errorsThisSecond,
        });
      }

      // Finish test on duration expiry
      if (elapsedMs >= durationMs || remainingSeconds <= 0) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        finalizeTest();
      }
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [testStatus, finalizeTest, computeKeystrokes]);

  // Word-Aware Keystroke Handler: Completely prevents cascading errors!
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (testStatusRef.current === 'COMPLETED' || testStatus === 'COMPLETED') {
      return;
    }

    if ([' ', 'Backspace', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }

    const now = Date.now();
    const currentWIdx = currentWordIndexRef.current;
    const currentTyped = typedWordsRef.current[currentWIdx] || '';
    const targetWord = wordsRef.current[currentWIdx] || '';

    // Handle Backspace
    if (e.key === 'Backspace') {
      if (currentTyped.length > 0) {
        const nextBackspace = backspaceCountRef.current + 1;
        backspaceCountRef.current = nextBackspace;
        setBackspaceCount(nextBackspace);

        const updatedTyped = currentTyped.slice(0, -1);
        const updatedList = [...typedWordsRef.current];
        updatedList[currentWIdx] = updatedTyped;
        typedWordsRef.current = updatedList;
        setTypedWords(updatedList);

        // Check if removing error
        const charIdx = updatedTyped.length;
        if (charIdx < targetWord.length && currentTyped[charIdx] !== targetWord[charIdx]) {
          correctedErrorsCountRef.current += 1;
          if (lastErrorTimeRef.current !== null) {
            recoveryTimesRef.current.push(now - lastErrorTimeRef.current);
            lastErrorTimeRef.current = null;
          }
        }
      } else if (currentWIdx > 0) {
        // Allow backspacing to previous word if previous word had errors
        const prevWIdx = currentWIdx - 1;
        const prevTyped = typedWordsRef.current[prevWIdx] || '';
        const prevTarget = wordsRef.current[prevWIdx] || '';
        if (prevTyped !== prevTarget) {
          currentWordIndexRef.current = prevWIdx;
          setCurrentWordIndex(prevWIdx);
        }
      }
      return;
    }

    // Handle Space bar: Clean Word Advancement
    if (e.key === ' ') {
      if (currentTyped.length === 0) {
        // Prevent accidental skipping on extra space
        return;
      }

      // Start timer if not running
      if (testStatusRef.current === 'IDLE') {
        startTimeRef.current = now;
        lastKeyTimeRef.current = now;
        testStatusRef.current = 'RUNNING';
        setTestStatus('RUNNING');
      }

      const nextWIdx = currentWIdx + 1;
      currentWordIndexRef.current = nextWIdx;
      setCurrentWordIndex(nextWIdx);

      // Stream more words if approaching end of word bank
      if (nextWIdx + 30 >= wordsRef.current.length) {
        const extraWords = generateWordStream(difficultyRef.current, 60).trim().split(/\s+/);
        const extendedWords = [...wordsRef.current, ...extraWords];
        wordsRef.current = extendedWords;
        setWords(extendedWords);
      }
      return;
    }

    // Handle printable character keystroke
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const typedChar = e.key;

      // Start timer on first valid keypress
      if (testStatusRef.current === 'IDLE') {
        startTimeRef.current = now;
        lastKeyTimeRef.current = now;
        testStatusRef.current = 'RUNNING';
        setTestStatus('RUNNING');
      }

      // Measure Inter-Key Interval
      if (lastKeyTimeRef.current !== null) {
        const iki = now - lastKeyTimeRef.current;
        ikiListRef.current.push(iki);
        if (iki >= 400) {
          pauseListRef.current.push(iki);
        }
      }
      lastKeyTimeRef.current = now;

      const charIdx = currentTyped.length;
      const targetChar = charIdx < targetWord.length ? targetWord[charIdx] : '';

      if (targetChar && typedChar === targetChar) {
        setCorrectKeystrokes((c) => c + 1);
      } else {
        setIncorrectKeystrokes((errs) => errs + 1);
        if (lastErrorTimeRef.current === null) {
          lastErrorTimeRef.current = now;
        }

        if (targetChar) {
          // Record character confusion pair
          const mistakeKey = `${targetChar}->${typedChar}`;
          const existingChar = charErrorsRef.current.get(mistakeKey);
          if (existingChar) {
            existingChar.occurrenceCount += 1;
          } else {
            charErrorsRef.current.set(mistakeKey, {
              targetChar,
              typedChar,
              occurrenceCount: 1,
            });
          }

          // Record bigram confusion pair
          if (charIdx > 0) {
            const targetBigram = `${targetWord[charIdx - 1]}${targetChar}`;
            const typedBigram = `${currentTyped[charIdx - 1] || targetWord[charIdx - 1]}${typedChar}`;
            const bKey = `${targetBigram}->${typedBigram}`;
            const existingBigram = bigramErrorsRef.current.get(bKey);
            if (existingBigram) {
              existingBigram.occurrenceCount += 1;
            } else {
              bigramErrorsRef.current.set(bKey, {
                targetBigram,
                typedBigram,
                occurrenceCount: 1,
              });
            }
          }
        }
      }

      // Record physical key attempts for accurate keyboard heatmap
      const targetKeyChar = (targetChar || typedChar).toUpperCase();
      if (targetKeyChar >= 'A' && targetKeyChar <= 'Z') {
        const keyStat = keyStatsRef.current.get(targetKeyChar) || { total: 0, errors: 0 };
        keyStat.total += 1;
        if (typedChar !== targetChar) {
          keyStat.errors += 1;
        }
        keyStatsRef.current.set(targetKeyChar, keyStat);
      }

      // Update typed string for current word
      const nextTyped = currentTyped + typedChar;
      const updatedList = [...typedWordsRef.current];
      updatedList[currentWIdx] = nextTyped;
      typedWordsRef.current = updatedList;
      setTypedWords(updatedList);

      // Recompute Live Monkeytype Metrics
      if (startTimeRef.current) {
        const elapsedMins = Math.max(0.001, (now - startTimeRef.current) / 60000.0);
        const { correct, totalKeys } = computeKeystrokes();

        const liveGross = totalKeys / 5.0 / elapsedMins;
        const liveNet = correct / 5.0 / elapsedMins;
        const liveAcc = totalKeys > 0 ? (correct / totalKeys) * 100.0 : 100.0;

        setGrossWpm(Math.round(liveGross));
        setNetWpm(Math.round(liveNet));
        setAccuracy(Math.round(liveAcc));
      }
    }
  };

  const targetText = words.join(' ');
  const inputChars: string[] = [];
  for (let w = 0; w < typedWords.length; w++) {
    const t = typedWords[w] || '';
    for (let c = 0; c < t.length; c++) {
      inputChars.push(t[c]);
    }
    if (w < typedWords.length - 1) {
      inputChars.push(' ');
    }
  }
  const currentIndex = inputChars.length;

  return {
    duration,
    difficulty,
    words,
    typedWords,
    currentWordIndex,
    targetText,
    inputChars,
    currentIndex,
    testStatus,
    timeLeft,
    grossWpm,
    netWpm,
    accuracy,
    correctKeystrokes,
    incorrectKeystrokes,
    backspaceCount,
    containerRef,
    handleKeyDown,
    resetTest,
    setDuration,
    setDifficulty,
  };
};
