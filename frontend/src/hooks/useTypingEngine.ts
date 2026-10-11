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
  const [targetText, setTargetText] = useState<string>(() => customText || getRandomText(initialDifficulty, 200));

  const [inputChars, setInputChars] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
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
  const inputCharsRef = useRef<string[]>([]);
  const backspaceCountRef = useRef<number>(0);
  const targetTextRef = useRef<string>(targetText);
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
    targetTextRef.current = targetText;
  }, [targetText]);

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

    const currentInputs = inputCharsRef.current;
    const currentTarget = targetTextRef.current;
    const currentBackspaces = backspaceCountRef.current;

    const totalKeypresses = currentInputs.length + currentBackspaces;
    let correct = 0;
    let uncorrected = 0;

    for (let i = 0; i < currentInputs.length; i++) {
      if (currentInputs[i] === currentTarget[i]) {
        correct++;
      } else {
        uncorrected++;
      }
    }

    const corrected = correctedErrorsCountRef.current;
    const totalMistakes = corrected + uncorrected;
    const correctionRate = totalMistakes > 0 ? (corrected / totalMistakes) * 100 : 100.0;

    const testDuration = durationRef.current;
    const elapsedMs = startTimeRef.current
      ? Math.max(1000, Date.now() - startTimeRef.current)
      : testDuration * 1000;
    const elapsedMins = elapsedMs / 60000.0;

    const calculatedGross = elapsedMins > 0 ? (totalKeypresses / 5.0) / elapsedMins : 0;
    const calculatedNet = elapsedMins > 0 ? Math.max(0, (correct / 5.0) / elapsedMins) : 0;
    const calculatedAcc = totalKeypresses > 0 ? (correct / totalKeypresses) * 100.0 : 100.0;

    const avgIki = ikiListRef.current.length > 0
      ? ikiListRef.current.reduce((a, b) => a + b, 0) / ikiListRef.current.length
      : 0;

    const avgPause = pauseListRef.current.length > 0
      ? pauseListRef.current.reduce((a, b) => a + b, 0) / pauseListRef.current.length
      : 0;

    const avgRecovery = recoveryTimesRef.current.length > 0
      ? recoveryTimesRef.current.reduce((a, b) => a + b, 0) / recoveryTimesRef.current.length
      : 0;

    const keyStatsList: KeyMetric[] = Array.from(keyStatsRef.current.entries()).map(([k, v]) => ({
      keyChar: k,
      totalPresses: v.total,
      errorPresses: v.errors,
      errorRate: v.total > 0 ? Math.round(((v.errors / v.total) * 100.0) * 10.0) / 10.0 : 0.0,
    }));

    let calculatedConsistency = 100;
    const recordedWpms = telemetryRef.current.map((t) => t.instantWpm).filter((w) => w > 0);
    if (recordedWpms.length > 1) {
      const mean = recordedWpms.reduce((a, b) => a + b, 0) / recordedWpms.length;
      if (mean > 0) {
        const variance = recordedWpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recordedWpms.length;
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
      totalKeystrokes: totalKeypresses,
      correctKeystrokes: correct,
      errorCount: totalMistakes,
      backspaceCount: currentBackspaces,
      correctedErrors: corrected,
      uncorrectedErrors: uncorrected,
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
  }, []);

  // Reset or initialize test
  const resetTest = useCallback(
    (newDuration?: TestDuration, newDifficulty?: TestDifficulty, newText?: string) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      const dur = newDuration !== undefined ? newDuration : durationRef.current;
      const diff = newDifficulty !== undefined ? newDifficulty : difficultyRef.current;
      const txt = newText || (customText ? customText : getRandomText(diff, 200));

      setDuration(dur);
      setDifficulty(diff);
      setTargetText(txt);
      setInputChars([]);
      setCurrentIndex(0);
      setTestStatus('IDLE');
      setTimeLeft(dur);

      durationRef.current = dur;
      difficultyRef.current = diff;
      targetTextRef.current = txt;
      inputCharsRef.current = [];
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

  // Rock-solid Wall-Clock Timer
  // Starts on RUNNING, ticks smoothly, and FORCE-STOPS exactly when time runs out
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
        const currentInput = inputCharsRef.current;
        const currentTarget = targetTextRef.current;
        const currentBackspace = backspaceCountRef.current;

        let correct = 0;
        let uncorrected = 0;
        for (let i = 0; i < currentInput.length; i++) {
          if (currentInput[i] === currentTarget[i]) correct++;
          else uncorrected++;
        }
        const totalKeys = currentInput.length + currentBackspace;
        const instWpm = (correct / 5.0) / currentElapsedMins;
        const instGross = (totalKeys / 5.0) / currentElapsedMins;
        const instAcc = totalKeys > 0 ? (correct / totalKeys) * 100.0 : 100.0;
        const currentTotalErrors = uncorrected + correctedErrorsCountRef.current;
        const prevCumulative = telemetryRef.current.length > 0
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

      // Exact time completion -> Force stop immediately!
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
  }, [testStatus, finalizeTest]);

  // Scoped Keystroke Handler (Active ONLY inside the focused typing container)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Force stop: Ignore any typing if test is already completed
    if (testStatusRef.current === 'COMPLETED' || testStatus === 'COMPLETED') {
      return;
    }

    if ([' ', 'Backspace', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }

    const now = Date.now();

    // Start timer on first valid keypress
    if (testStatusRef.current === 'IDLE') {
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        startTimeRef.current = now;
        lastKeyTimeRef.current = now;
        testStatusRef.current = 'RUNNING';
        setTestStatus('RUNNING');
      } else {
        return;
      }
    }

    // Measure Inter-Key Interval (IKI) and Pauses
    if (lastKeyTimeRef.current !== null) {
      const iki = now - lastKeyTimeRef.current;
      ikiListRef.current.push(iki);
      if (iki >= 400) {
        pauseListRef.current.push(iki);
      }
    }
    lastKeyTimeRef.current = now;

    // Handle Backspace
    if (e.key === 'Backspace') {
      if (currentIndex > 0) {
        const nextBackspace = backspaceCountRef.current + 1;
        backspaceCountRef.current = nextBackspace;
        setBackspaceCount(nextBackspace);

        const prevIdx = currentIndex - 1;
        const currentInputs = inputCharsRef.current;
        const currentTarget = targetTextRef.current;

        if (currentInputs[prevIdx] !== currentTarget[prevIdx]) {
          correctedErrorsCountRef.current += 1;
          if (lastErrorTimeRef.current !== null) {
            recoveryTimesRef.current.push(now - lastErrorTimeRef.current);
            lastErrorTimeRef.current = null;
          }
        }

        const updatedChars = currentInputs.slice(0, -1);
        inputCharsRef.current = updatedChars;
        setInputChars(updatedChars);
        setCurrentIndex(prevIdx);
      }
      return;
    }

    // Handle printable character keystroke
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const typed = e.key;
      const target = targetTextRef.current[currentIndex];

      if (typed !== target) {
        setIncorrectKeystrokes((errs) => errs + 1);
        if (lastErrorTimeRef.current === null) {
          lastErrorTimeRef.current = now;
        }

        // Record Character Confusion Pair
        const mistakeKey = `${target}->${typed}`;
        const existingChar = charErrorsRef.current.get(mistakeKey);
        if (existingChar) {
          existingChar.occurrenceCount += 1;
        } else {
          charErrorsRef.current.set(mistakeKey, {
            targetChar: target,
            typedChar: typed,
            occurrenceCount: 1,
          });
        }

        // Record Bigram Mistake Pair
        if (currentIndex > 0) {
          const targetBigram = `${targetTextRef.current[currentIndex - 1]}${target}`;
          const prevTyped = inputCharsRef.current[currentIndex - 1] || targetTextRef.current[currentIndex - 1];
          const typedBigram = `${prevTyped}${typed}`;
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
      } else {
        setCorrectKeystrokes((c) => c + 1);
      }

      // Record physical key attempts for accurate keyboard heatmap
      const targetKeyChar = target.toUpperCase();
      if (targetKeyChar >= 'A' && targetKeyChar <= 'Z') {
        const keyStat = keyStatsRef.current.get(targetKeyChar) || { total: 0, errors: 0 };
        keyStat.total += 1;
        if (typed !== target) {
          keyStat.errors += 1;
        }
        keyStatsRef.current.set(targetKeyChar, keyStat);
      }

      const newInput = [...inputCharsRef.current, typed];
      inputCharsRef.current = newInput;
      setInputChars(newInput);

      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      // Recompute Live Monkeytype Metrics
      if (startTimeRef.current) {
        const elapsedMins = Math.max(0.001, (now - startTimeRef.current) / 60000.0);
        const totalKeys = newInput.length + backspaceCountRef.current;
        let correctCount = 0;
        for (let i = 0; i < newInput.length; i++) {
          if (newInput[i] === targetTextRef.current[i]) correctCount++;
        }

        const liveGross = (totalKeys / 5.0) / elapsedMins;
        const liveNet = (correctCount / 5.0) / elapsedMins;
        const liveAcc = totalKeys > 0 ? (correctCount / totalKeys) * 100.0 : 100.0;

        setGrossWpm(Math.round(liveGross));
        setNetWpm(Math.round(liveNet));
        setAccuracy(Math.round(liveAcc));
      }

      // Stream more words dynamically if approaching end of word bank, so typist never runs out of words
      if (nextIdx + 40 >= targetTextRef.current.length) {
        const additionalWords = generateWordStream(difficultyRef.current, 60);
        const extendedText = `${targetTextRef.current} ${additionalWords}`;
        targetTextRef.current = extendedText;
        setTargetText(extendedText);
      }
    }
  };

  return {
    duration,
    difficulty,
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
