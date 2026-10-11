import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTypingEngine, TestDuration, TestDifficulty } from '../../hooks/useTypingEngine';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TypingSession, SessionSubmitPayload } from '../../types';
import {
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  AlertCircle,
  Clock,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Keyboard,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

export const TypingTestView: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [completedSession, setCompletedSession] = useState<TypingSession | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isGeneratingDrill, setIsGeneratingDrill] = useState<boolean>(false);

  // Floating Smooth Caret coordinates
  const [caretCoords, setCaretCoords] = useState<{ left: number; top: number; height: number }>({
    left: 0,
    top: 0,
    height: 32,
  });
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  const handleTestComplete = async (payload: SessionSubmitPayload) => {
    // Show report IMMEDIATELY without waiting for network roundtrip
    const immediateSession: TypingSession = {
      id: 'session-' + Date.now(),
      ...payload,
      completedAt: new Date().toISOString(),
    };
    setCompletedSession(immediateSession);

    // Save to local session history
    try {
      const stored = localStorage.getItem('typingiq_local_sessions');
      const sessions = stored ? JSON.parse(stored) : [];
      sessions.unshift(immediateSession);
      localStorage.setItem('typingiq_local_sessions', JSON.stringify(sessions.slice(0, 50)));
    } catch {
      // ignore
    }

    // Persist to backend MongoDB
    try {
      const saved = await api.sessions.submit(payload);
      setCompletedSession(saved);
      setSaveSuccess(true);
    } catch (err) {
      console.warn('Session persisted locally. Server sync error:', err);
    }
  };

  const {
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
  } = useTypingEngine({
    initialDuration: 30,
    initialDifficulty: 'EASY',
    onTestComplete: handleTestComplete,
  });

  // Calculate Caret Coordinate relative to active letter
  useLayoutEffect(() => {
    if (!textContainerRef.current) return;
    const container = textContainerRef.current;
    const activeCharEl = document.getElementById(`char-${currentIndex}`);

    if (activeCharEl) {
      const containerRect = container.getBoundingClientRect();
      const charRect = activeCharEl.getBoundingClientRect();
      setCaretCoords({
        left: charRect.left - containerRect.left,
        top: charRect.top - containerRect.top + 4,
        height: Math.max(28, charRect.height - 8),
      });

      activeCharEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      const lastCharEl = document.getElementById(`char-${targetText.length - 1}`);
      if (lastCharEl) {
        const containerRect = container.getBoundingClientRect();
        const charRect = lastCharEl.getBoundingClientRect();
        setCaretCoords({
          left: charRect.right - containerRect.left,
          top: charRect.top - containerRect.top + 4,
          height: Math.max(28, charRect.height - 8),
        });
      }
    }
  }, [currentIndex, targetText]);

  useEffect(() => {
    const handleResize = () => {
      const activeCharEl = document.getElementById(`char-${currentIndex}`);
      if (activeCharEl && textContainerRef.current) {
        const containerRect = textContainerRef.current.getBoundingClientRect();
        const charRect = activeCharEl.getBoundingClientRect();
        setCaretCoords({
          left: charRect.left - containerRect.left,
          top: charRect.top - containerRect.top + 4,
          height: Math.max(28, charRect.height - 8),
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  const handleDurationChange = (dur: TestDuration) => {
    setDuration(dur);
    setCompletedSession(null);
    setSaveSuccess(false);
    resetTest(dur, difficulty);
  };

  const handleDifficultyChange = (diff: TestDifficulty) => {
    setDifficulty(diff);
    setCompletedSession(null);
    setSaveSuccess(false);
    resetTest(duration, diff);
  };

  const restartCurrentTest = () => {
    setCompletedSession(null);
    setSaveSuccess(false);
    resetTest();
  };

  // Keyboard shortcut: Tab to restart
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setCompletedSession(null);
        setSaveSuccess(false);
        resetTest();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [resetTest]);

  // Keep typing container focused whenever clicking canvas
  useEffect(() => {
    containerRef.current?.focus();
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.closest('a') && !target.closest('input')) {
        containerRef.current?.focus();
      }
    };
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  const repeatSameText = () => {
    const sameText = targetText;
    setCompletedSession(null);
    setSaveSuccess(false);
    resetTest(duration, difficulty, sameText);
  };

  const handleGenerateCustomDrill = async () => {
    try {
      setIsGeneratingDrill(true);
      await api.exercises.generateTargeted();
      navigate('/practice');
    } catch (err) {
      navigate('/practice');
    } finally {
      setIsGeneratingDrill(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-100">
      {/* If test is COMPLETED, show Post-Test Diagnostic Report View in Dark Theme */}
      {completedSession ? (
        <div className="animate-fade-in space-y-8">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20 inline-block mb-1">
                Completed Test Assessment
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Diagnostic Results
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {completedSession.durationSeconds}s assessment • {new Date(completedSession.completedAt).toLocaleTimeString()}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5">
              <Button
                onClick={restartCurrentTest}
                variant="contained"
                sx={{
                  bgcolor: '#f59e0b',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderRadius: '12px',
                  px: 2.5,
                  py: 1,
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
                  '&:hover': {
                    bgcolor: '#fbbf24',
                  },
                }}
                startIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Next Test (Tab)
              </Button>
              <button
                onClick={repeatSameText}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-all flex items-center gap-1.5"
              >
                Repeat Text
              </button>
            </div>
          </div>

          {/* Hero KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* WPM Hero */}
            <div className="dark-glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Net WPM
              </div>
              <div className="text-5xl font-black text-amber-400 font-mono tracking-tight my-2">
                {completedSession.netWpm}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Gross: <span className="text-slate-200 font-semibold">{completedSession.grossWpm}</span> WPM
              </div>
            </div>

            {/* Accuracy Hero */}
            <div className="dark-glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Accuracy
              </div>
              <div className="text-5xl font-black text-emerald-400 font-mono tracking-tight my-2">
                {completedSession.accuracyPercentage}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {completedSession.correctKeystrokes}/{completedSession.totalKeystrokes} Keystrokes
              </div>
            </div>

            {/* Error Correction Hero */}
            <div className="dark-glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Fix Ratio
              </div>
              <div className="text-5xl font-black text-rose-400 font-mono tracking-tight my-2">
                {completedSession.correctionRate}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {completedSession.correctedErrors} Corrected • {completedSession.uncorrectedErrors} Left
              </div>
            </div>

            {/* Cadence Latency Hero */}
            <div className="dark-glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Key Latency
              </div>
              <div className="text-5xl font-black text-cyan-400 font-mono tracking-tight my-2">
                {Math.round(completedSession.avgInterKeyIntervalMs)}<span className="text-xl font-normal text-slate-500">ms</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Hesitation: <span className="text-slate-200">{Math.round(completedSession.avgPauseDurationMs)}ms</span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Telemetry Curve */}
          <div className="dark-glass-card rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Velocity Trajectory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Second-by-second acceleration curve recorded during test execution.
                </p>
              </div>
              <Chip
                label={`${completedSession.telemetry?.length ?? 0} Datapoints`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
            </div>

            {completedSession.telemetry && completedSession.telemetry.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={completedSession.telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="secondMarker"
                      stroke="#64748b"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      unit="s"
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#f59e0b"
                      domain={['dataMin - 10', 'dataMax + 10']}
                      tick={{ fontSize: 11, fill: '#f59e0b' }}
                      label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: '#f59e0b' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      domain={[70, 100]}
                      tick={{ fontSize: 11, fill: '#10b981' }}
                      label={{ value: 'Acc %', angle: 90, position: 'insideRight', fill: '#10b981' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="instantWpm"
                      name="Instant WPM"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#f59e0b' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="instantAccuracy"
                      name="Accuracy %"
                      stroke="#10b981"
                      strokeWidth={1.8}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500 font-mono">
                No telemetry recorded for this assessment.
              </div>
            )}
          </div>

          {/* Friction Points & Synthesis Generator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mistyped Characters */}
            <div className="dark-glass-card rounded-2xl p-6 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Character Friction Points
              </h4>

              {completedSession.charErrors && completedSession.charErrors.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {completedSession.charErrors.map((c, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-white">'{c.targetChar}'</span>
                        <span className="text-rose-400">→</span>
                        <span className="text-rose-400 font-bold">'{c.typedChar}'</span>
                        <span className="text-[10px] text-slate-400">({c.occurrenceCount}x)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero character errors recorded! Exceptional accuracy.</span>
                </div>
              )}
            </div>

            {/* Targeted Muscle Memory Synthesis */}
            <div className="dark-glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  AI Drill Synthesizer
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Synthesize an adaptive practice drill targeting your exact friction keys and bigram slips from this session.
                </p>
              </div>

              <div className="space-y-2.5">
                <Button
                  onClick={handleGenerateCustomDrill}
                  disabled={isGeneratingDrill}
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: '#f59e0b',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '12px',
                    borderRadius: '12px',
                    py: 1.2,
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
                    '&:hover': {
                      bgcolor: '#fbbf24',
                    },
                  }}
                  startIcon={<Sparkles className="w-4 h-4" />}
                >
                  {isGeneratingDrill ? 'Synthesizing Drill...' : 'Generate Drill for My Mistakes'}
                </Button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                  <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1 font-medium">
                    <span>Analytics Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/heatmap" className="hover:text-white transition-colors flex items-center gap-1 font-medium">
                    <span>Keyboard Heatmap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Typing Test View - Clean Monkeytype Dark Format */
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
          {/* Top Mode Bar */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4 bg-[#1e2024]/80 px-5 py-2.5 rounded-2xl text-xs font-mono text-[#646669] border border-white/5 shadow-xl backdrop-blur-md transition-all">
              {/* Mode Selection */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => resetTest(duration, 'EASY')}
                  className="flex items-center gap-1.5 text-[#e2b714] font-bold transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>timed</span>
                </button>
              </div>

              <div className="w-[1px] h-3.5 bg-white/10" />

              {/* Duration Options */}
              <div className="flex items-center gap-2">
                {([15, 30, 60] as TestDuration[]).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => handleDurationChange(dur)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      duration === dur
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>

              <div className="w-[1px] h-3.5 bg-white/10" />

              {/* Difficulty Options */}
              <div className="flex items-center gap-1.5">
                {(['EASY', 'MEDIUM', 'HARD'] as TestDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all ${
                      difficulty === diff
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {diff.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unified Dark HUD Matching Dashboard Cards */}
          <div className="grid grid-cols-4 gap-3.5 max-w-3xl mx-auto">
            <div className="dark-glass-card rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Time Remaining
              </span>
              <span className="text-3xl font-black text-amber-400 font-mono">{timeLeft}s</span>
            </div>
            <div className="dark-glass-card rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Live Net WPM
              </span>
              <span className="text-3xl font-black text-white font-mono">{netWpm}</span>
            </div>
            <div className="dark-glass-card rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Accuracy
              </span>
              <span className="text-3xl font-black text-emerald-400 font-mono">{accuracy}%</span>
            </div>
            <div className="dark-glass-card rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Errors
              </span>
              <span className="text-3xl font-black text-rose-400 font-mono">{incorrectKeystrokes}</span>
            </div>
          </div>

          {/* Main Typing Surface with Amber Caret */}
          <div
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={() => containerRef.current?.focus()}
            className="dark-glass-card rounded-3xl p-8 sm:p-12 min-h-[220px] max-h-[320px] overflow-hidden border border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-text select-none relative transition-all shadow-2xl"
          >
            {/* Click to Focus Overlay when Idle */}
            {testStatus === 'IDLE' && currentIndex === 0 && (
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                  Click or type any key to begin
                </span>
              </div>
            )}

            {/* Target Words Container with Smooth Amber Caret */}
            <div
              ref={textContainerRef}
              className="relative font-mono text-2xl sm:text-3xl leading-relaxed tracking-wide text-slate-600 transition-all"
            >
              {/* Smooth Gliding Floating Caret */}
              {testStatus !== 'COMPLETED' && (
                <div
                  className="smooth-caret caret-pulse"
                  style={{
                    left: `${caretCoords.left}px`,
                    top: `${caretCoords.top}px`,
                    height: `${caretCoords.height}px`,
                  }}
                />
              )}

              {/* Word & Character Stream */}
              {targetText.split('').map((char, index) => {
                const isTyped = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isCorrect = isTyped && inputChars[index] === char;
                const isIncorrect = isTyped && inputChars[index] !== char;

                let charClass = 'text-slate-600';
                if (isCorrect) {
                  charClass = 'text-slate-100 font-medium';
                } else if (isIncorrect) {
                  charClass = 'text-rose-400 bg-rose-500/20 font-bold rounded-sm px-0.5';
                }

                return (
                  <span
                    key={index}
                    id={`char-${index}`}
                    className={`transition-colors duration-75 ${charClass} ${
                      isCurrent ? 'opacity-100' : ''
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Bottom Keyboard Controls Hint */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono text-[11px]">
                Tab
              </span>
              <span>instantly restarts current test</span>
            </div>

            <button
              onClick={restartCurrentTest}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
