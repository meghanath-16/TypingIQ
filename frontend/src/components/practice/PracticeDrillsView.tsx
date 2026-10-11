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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kinetic Curriculum
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
              Adaptive Motor Training
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            Targeted Practice Drills
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
            Isolate motor memory friction, smooth out awkward transitions, and reinforce finger reach across difficult bigrams.
          </p>
        </div>

        {/* Action Controls & Mastered Widget */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateTargeted}
            disabled={isGenerating}
            variant="contained"
            sx={{
              bgcolor: '#10b981',
              color: '#022c22',
              fontWeight: 800,
              fontSize: '11px',
              borderRadius: '12px',
              px: 2.5,
              py: 1.1,
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
              '&:hover': {
                bgcolor: '#34d399',
              },
            }}
            startIcon={
              isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )
            }
          >
            <span>Generate Drill for My Mistakes</span>
          </Button>

          <div className="flex items-center gap-3 bg-slate-800/60 px-4 py-2 rounded-2xl border border-slate-700/80 shadow-sm">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Mastered</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {totalPassed} / {exercises.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {genMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{genMessage}</span>
          </div>
          <button onClick={() => setGenMessage(null)} className="text-emerald-400/60 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Exercises Grid with Vibrant Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((ex) => {
          const diffBadge =
            ex.difficulty === 'EASY'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : ex.difficulty === 'HARD'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

          return (
            <div
              key={String(ex.id)}
              className={`dark-glass-card rounded-3xl p-6 transition-all flex flex-col justify-between border ${
                ex.userPassed
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-slate-800/80 hover:border-cyan-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${diffBadge}`}>
                    {ex.difficulty}
                  </span>

                  {ex.userPassed ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Mastered
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Ready</span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{ex.title}</h3>

                {/* Target Keys Badges in Glowing Keycap Style */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ex.targetKeys.split(',').map((k, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shadow-sm hover:border-cyan-400 transition-colors"
                    >
                      {k.trim()}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 font-mono bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 mb-4">
                  "{ex.contentText}"
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 py-3 border-t border-slate-800/80 mb-4">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Target className="w-4 h-4 text-cyan-400" />
                    Target: {ex.targetAccuracy}% Acc
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Goal: {ex.targetWpm} WPM
                  </span>
                </div>

                <button
                  onClick={() => handleStartExercise(ex)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all border border-cyan-500/30 flex items-center justify-center gap-2 hover:border-cyan-400"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>{ex.userPassed ? 'Practice Again' : 'Start Drill'}</span>
                </button>
              </div>
            </div>
          );
        })}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="dark-glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-cyan-500/30 shadow-2xl relative text-slate-100 bg-[#080d1a]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Active Drill Execution
          </span>
          <h2 className="text-2xl font-bold text-white">{exercise.title}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Targets: {exercise.targetAccuracy}% Accuracy • {exercise.targetWpm} WPM Speed
          </p>
        </div>

        {/* Live HUD */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900/80 rounded-2xl p-3.5 text-center border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">
              Current WPM
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{netWpm}</span>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-3.5 text-center border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">
              Accuracy
            </span>
            <span className="text-2xl font-black text-cyan-400 font-mono">{accuracy}%</span>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-3.5 text-center border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">
              Errors
            </span>
            <span className="text-2xl font-black text-rose-400 font-mono">{incorrectKeystrokes}</span>
          </div>
        </div>

        {/* Scoped Drill Input Area Matching Main Typing Surface */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => containerRef.current?.focus()}
          className="dark-glass-card rounded-2xl p-6 min-h-[150px] border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-text select-none relative mb-6 font-mono text-xl sm:text-2xl leading-relaxed text-slate-500 shadow-inner bg-slate-950/60"
        >
          {testStatus === 'IDLE' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-[1px] rounded-2xl z-10 pointer-events-none">
              <span className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/30">
                Click here and type to begin drill
              </span>
            </div>
          )}

          {targetText.split('').map((char, index) => {
            const isTyped = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isCorrect = isTyped && inputChars[index] === char;
            const isIncorrect = isTyped && inputChars[index] !== char;

            let charClass = 'text-slate-500';
            if (isCorrect) charClass = 'text-white font-semibold';
            else if (isIncorrect) charClass = 'text-rose-300 bg-rose-950/80 border-b-2 border-rose-500 font-bold px-0.5 rounded-sm';

            return (
              <span key={index} className="relative">
                {isCurrent && testStatus !== 'COMPLETED' && (
                  <span className="absolute -left-[1px] top-0 bottom-0 w-[2.5px] bg-cyan-400 animate-caret z-10 shadow-[0_0_8px_#22d3ee]" />
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
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {attemptResult.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold block">
                  {attemptResult.passed ? 'Drill Passed Successfully!' : 'Goal Not Yet Met'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Achieved: {attemptResult.achievedWpm} WPM • {attemptResult.achievedAccuracy}% Accuracy
                </span>
              </div>
            </div>

            <Button
              onClick={() => resetTest()}
              variant="outlined"
              size="small"
              sx={{
                borderColor: attemptResult.passed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                color: attemptResult.passed ? '#34d399' : '#fbbf24',
                fontWeight: 700,
                fontSize: '11px',
                borderRadius: '10px',
                '&:hover': {
                  borderColor: attemptResult.passed ? '#10b981' : '#f59e0b',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
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
