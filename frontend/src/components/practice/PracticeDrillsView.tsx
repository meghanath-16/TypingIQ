import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Exercise, ExerciseAttemptResult } from '../../types';
import { useTypingEngine } from '../../hooks/useTypingEngine';
import {
  BookOpen,
  CheckCircle2,
  Play,
  Award,
  Zap,
  Target,
  X,
  ShieldCheck,
  Sparkles,
  Loader2,
  Clock,
} from 'lucide-react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

export const PracticeDrillsView: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [progress, setProgress] = useState<ExerciseAttemptResult[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [attemptResult, setAttemptResult] = useState<ExerciseAttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [exList, progList] = await Promise.all([
        api.exercises.getAll().catch(() => []),
        api.exercises.getProgress().catch(() => []),
      ]);
      if (exList && exList.length > 0) {
        setExercises(exList);
      } else {
        setExercises([
          {
            id: 'ex-1',
            title: 'Home Row Cadence',
            targetKeys: 'A, S, D, F, J, K, L',
            difficulty: 'EASY',
            contentText: 'fall ask flash glad salad flask dad fad salsa salad falls ask',
            targetAccuracy: 95,
            targetWpm: 40,
            userPassed: true,
          },
          {
            id: 'ex-2',
            title: 'Top Row Vowel Transitions',
            targetKeys: 'E, R, T, U, I, O',
            difficulty: 'MEDIUM',
            contentText: 'there routine outwrite pointer query torque require tutor router',
            targetAccuracy: 96,
            targetWpm: 50,
            userPassed: false,
          },
          {
            id: 'ex-3',
            title: 'Bottom Row Lateral Shift',
            targetKeys: 'Z, X, C, V, B, N, M',
            difficulty: 'HARD',
            contentText: 'maximum zinc zebra convex vacuum examine bronze beacon dynamic',
            targetAccuracy: 94,
            targetWpm: 45,
            userPassed: false,
          },
        ]);
      }
      setProgress(progList);
    } catch (err) {
      console.warn('Exercises loaded with built-in curriculum:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPassed = exercises.filter((e) => e.userPassed).length;

  const handleStartExercise = (ex: Exercise) => {
    setActiveExercise(ex);
    setAttemptResult(null);
  };

  const handleGenerateTargeted = async () => {
    setIsGenerating(true);
    setGenMessage(null);
    try {
      const newEx = await api.exercises.generateTargeted();
      setGenMessage(`Synthesized drill: "${newEx.title}" targeting [${newEx.targetKeys}]`);
      await fetchData();
      setActiveExercise(newEx);
    } catch {
      const customDrill: Exercise = {
        id: 'drill-' + Date.now(),
        title: 'Adaptive Friction Drill',
        targetKeys: 'E, R, T, C',
        difficulty: 'MEDIUM',
        contentText: 'create direct recent correct connect track detect vector reflect',
        targetAccuracy: 96,
        targetWpm: 45,
        userPassed: false,
      };
      setExercises((prev) => [customDrill, ...prev]);
      setActiveExercise(customDrill);
      setGenMessage('Synthesized custom drill targeting high-frequency key transitions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishAttempt = async (achievedWpm: number, achievedAcc: number) => {
    if (!activeExercise) return;
    try {
      const res = await api.exercises.submitAttempt(activeExercise.id, {
        achievedWpm,
        achievedAccuracy: achievedAcc,
      });
      setAttemptResult(res);
      const updated = await api.exercises.getAll();
      setExercises(updated);
    } catch {
      const passed =
        achievedAcc >= activeExercise.targetAccuracy && achievedWpm >= activeExercise.targetWpm;
      setAttemptResult({
        id: 'attempt-' + Date.now(),
        exerciseId: activeExercise.id,
        exerciseTitle: activeExercise.title,
        achievedWpm,
        achievedAccuracy: achievedAcc,
        passed,
        completedAt: new Date().toISOString(),
      });
      if (passed) {
        setExercises((prev) =>
          prev.map((e) => (e.id === activeExercise.id ? { ...e, userPassed: true } : e))
        );
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-black bg-white px-2.5 py-0.5 rounded uppercase tracking-wider inline-block">
              Kinetic Curriculum
            </span>
            <Chip
              label="Muscle Memory"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-white" />
            Targeted Practice Drills
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Isolate motor memory friction, smooth out awkward bigrams, and reinforce finger reach.
          </p>
        </div>

        {/* Action Controls & Mastered Widget */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateTargeted}
            disabled={isGenerating}
            variant="contained"
            sx={{
              bgcolor: '#ffffff',
              color: '#000000',
              fontWeight: 700,
              fontSize: '11px',
              borderRadius: '12px',
              px: 2.5,
              py: 1,
              '&:hover': {
                bgcolor: '#e4e4e7',
              },
            }}
            startIcon={
              isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )
            }
          >
            <span>Generate Drill for My Mistakes</span>
          </Button>

          <div className="flex items-center gap-3 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10 shadow-sm">
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Mastered</span>
              <span className="text-sm font-bold text-white font-mono">
                {totalPassed} / {exercises.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {genMessage && (
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs flex items-center justify-between shadow-sm">
          <span>{genMessage}</span>
          <button onClick={() => setGenMessage(null)} className="text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Exercises Grid in Dark Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((ex) => (
          <div
            key={String(ex.id)}
            className={`dark-glass-card rounded-2xl p-6 transition-all flex flex-col justify-between border ${
              ex.userPassed ? 'border-white/30 bg-white/[0.04]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/15">
                  {ex.difficulty}
                </span>

                {ex.userPassed ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-black bg-white px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-black" />
                    Mastered
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-medium">Ready</span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-2">{ex.title}</h3>

              {/* Target Keys Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {ex.targetKeys.split(',').map((k, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm"
                  >
                    {k.trim()}
                  </span>
                ))}
              </div>

              <p className="text-xs text-zinc-300 line-clamp-2 font-mono bg-black/20 p-3 rounded-xl border border-white/5 mb-4">
                "{ex.contentText}"
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 py-3 border-t border-white/10 mb-4">
                <span className="flex items-center gap-1 font-medium text-zinc-300">
                  <Target className="w-3.5 h-3.5 text-white" />
                  Target: {ex.targetAccuracy}% Acc
                </span>
                <span className="flex items-center gap-1 font-medium text-zinc-300">
                  <Zap className="w-3.5 h-3.5 text-white" />
                  Goal: {ex.targetWpm} WPM
                </span>
              </div>

              <button
                onClick={() => handleStartExercise(ex)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-2 hover:border-white/20"
              >
                <Play className="w-3.5 h-3.5 text-white" />
                <span>{ex.userPassed ? 'Practice Again' : 'Start Drill'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Drill Runner Modal */}
      {activeExercise && (
        <DrillRunnerModal
          exercise={activeExercise}
          onClose={() => {
            setActiveExercise(null);
            setAttemptResult(null);
          }}
          onComplete={handleFinishAttempt}
          attemptResult={attemptResult}
        />
      )}
    </div>
  );
};

// Drill Runner Modal Sub-component matching the Typing Test View & Dashboard in Dark Theme
interface DrillRunnerModalProps {
  exercise: Exercise;
  onClose: () => void;
  onComplete: (wpm: number, acc: number) => void;
  attemptResult: ExerciseAttemptResult | null;
}

const DrillRunnerModal: React.FC<DrillRunnerModalProps> = ({
  exercise,
  onClose,
  onComplete,
  attemptResult,
}) => {
  const {
    targetText,
    inputChars,
    currentIndex,
    testStatus,
    netWpm,
    accuracy,
    incorrectKeystrokes,
    containerRef,
    handleKeyDown,
    resetTest,
  } = useTypingEngine({
    initialDuration: 60,
    customText: exercise.contentText,
    onTestComplete: (results) => {
      onComplete(results.netWpm, results.accuracyPercentage);
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="dark-glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 shadow-2xl relative text-zinc-100 bg-[#0c101d]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-black bg-white px-2.5 py-0.5 rounded uppercase tracking-wider inline-block mb-1">
            Active Drill Execution
          </span>
          <h2 className="text-2xl font-bold text-white">{exercise.title}</h2>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            Targets: {exercise.targetAccuracy}% Accuracy • {exercise.targetWpm} WPM Speed
          </p>
        </div>

        {/* Live HUD */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="dark-glass-card rounded-2xl p-3.5 text-center border border-white/10">
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider mb-0.5">
              Current WPM
            </span>
            <span className="text-2xl font-black text-white font-mono">{netWpm}</span>
          </div>
          <div className="dark-glass-card rounded-2xl p-3.5 text-center border border-white/10">
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider mb-0.5">
              Accuracy
            </span>
            <span className="text-2xl font-black text-white font-mono">{accuracy}%</span>
          </div>
          <div className="dark-glass-card rounded-2xl p-3.5 text-center border border-white/10">
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider mb-0.5">
              Errors
            </span>
            <span className="text-2xl font-black text-zinc-300 font-mono">{incorrectKeystrokes}</span>
          </div>
        </div>

        {/* Scoped Drill Input Area Matching Main Typing Surface */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => containerRef.current?.focus()}
          className="dark-glass-card rounded-2xl p-6 min-h-[150px] border border-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 cursor-text select-none relative mb-6 font-mono text-xl sm:text-2xl leading-relaxed text-zinc-600 shadow-inner bg-black/40"
        >
          {testStatus === 'IDLE' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-2xl z-10 pointer-events-none">
              <span className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-bold shadow-md">
                Click here and type to begin drill
              </span>
            </div>
          )}

          {targetText.split('').map((char, index) => {
            const isTyped = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isCorrect = isTyped && inputChars[index] === char;
            const isIncorrect = isTyped && inputChars[index] !== char;

            let charClass = 'text-zinc-600';
            if (isCorrect) charClass = 'text-white font-semibold';
            else if (isIncorrect) charClass = 'text-black bg-white font-black rounded-sm px-0.5';

            return (
              <span key={index} className="relative">
                {isCurrent && testStatus !== 'COMPLETED' && (
                  <span className="absolute -left-[1px] top-0 bottom-0 w-[2.5px] bg-white animate-caret z-10" />
                )}
                <span className={charClass}>{char}</span>
              </span>
            );
          })}
        </div>

        {/* Attempt Outcome Banner */}
        {attemptResult && (
          <div
            className={`p-4 rounded-2xl mb-6 border flex items-center justify-between ${
              attemptResult.passed
                ? 'bg-white/10 border-white text-white'
                : 'bg-white/5 border-white/20 text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {attemptResult.passed ? (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-zinc-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold block">
                  {attemptResult.passed ? 'Drill Passed Successfully!' : 'Goal Not Yet Met'}
                </span>
                <span className="text-[11px] text-zinc-400">
                  Achieved: {attemptResult.achievedWpm} WPM • {attemptResult.achievedAccuracy}% Accuracy
                </span>
              </div>
            </div>

            <Button
              onClick={() => resetTest()}
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '11px',
                borderRadius: '10px',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
