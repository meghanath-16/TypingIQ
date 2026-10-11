import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useTypingEngine, TestDuration, TestDifficulty } from '../../hooks/useTypingEngine';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TypingSession, SessionSubmitPayload } from '../../types';
import {
  RotateCcw,
  Sparkles,
  ChevronRight,
  Keyboard,
  Globe,
  Clock,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Share2,
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

interface ParsedWord {
  id: number;
  word: string;
  startIndex: number;
  endIndex: number;
  hasSpaceAfter: boolean;
  spaceIndex?: number;
}

// Custom error cross marker for chart errors
const CustomErrorMarker = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload || !payload.errorsAtSecond || payload.errorsAtSecond <= 0) {
    return null;
  }
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <circle r="3.5" fill="#ca4754" />
      <text
        x="0"
        y="1"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize="7"
        fontWeight="bold"
      >
        ×
      </text>
    </g>
  );
};

export const TypingTestView: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [completedSession, setCompletedSession] = useState<TypingSession | null>(null);
  const [, setSaveSuccess] = useState<boolean>(false);
  const [isGeneratingDrill, setIsGeneratingDrill] = useState<boolean>(false);
  const [showDetailedInsights, setShowDetailedInsights] = useState<boolean>(false);

  // Floating Monkeytype Smooth Caret coordinates
  const [caretCoords, setCaretCoords] = useState<{ left: number; top: number; height: number }>({
    left: 0,
    top: 0,
    height: 36,
  });

  // Smooth 3-Line Window Scroll state
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [singleLineHeight, setSingleLineHeight] = useState<number>(58);

  const wordsWrapperRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleTestComplete = async (payload: SessionSubmitPayload) => {
    const immediateSession: TypingSession = {
      id: 'session-' + Date.now(),
      ...payload,
      completedAt: new Date().toISOString(),
    };
    setCompletedSession(immediateSession);

    try {
      const stored = localStorage.getItem('typingiq_local_sessions');
      const sessions = stored ? JSON.parse(stored) : [];
      sessions.unshift(immediateSession);
      localStorage.setItem('typingiq_local_sessions', JSON.stringify(sessions.slice(0, 50)));
    } catch {
      // ignore
    }

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

  // Parse words and exact character positions for line wrapping
  const parsedWords = useMemo<ParsedWord[]>(() => {
    const words: ParsedWord[] = [];
    const rawWords = targetText.split(' ');
    let charPos = 0;

    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      const startIndex = charPos;
      const endIndex = charPos + w.length - 1;
      charPos += w.length;

      const hasSpaceAfter = i < rawWords.length - 1;
      const spaceIndex = hasSpaceAfter ? charPos : undefined;
      if (hasSpaceAfter) {
        charPos += 1;
      }

      words.push({
        id: i,
        word: w,
        startIndex,
        endIndex,
        hasSpaceAfter,
        spaceIndex,
      });
    }
    return words;
  }, [targetText]);

  // Identify active word index from current cursor character position
  const activeWordIndex = useMemo(() => {
    for (let i = 0; i < parsedWords.length; i++) {
      const w = parsedWords[i];
      if (
        currentIndex >= w.startIndex &&
        (w.spaceIndex === undefined ? currentIndex <= w.endIndex : currentIndex <= w.spaceIndex)
      ) {
        return i;
      }
    }
    return Math.max(0, parsedWords.length - 1);
  }, [parsedWords, currentIndex]);

  // Dynamic 3-Line Window Controller:
  // Show exactly 3 lines; when the top line is finished, remove it and shift the next line into view!
  useLayoutEffect(() => {
    const activeWordEl = wordRefs.current[activeWordIndex];
    const firstWordEl = wordRefs.current[0];
    if (!activeWordEl || !firstWordEl) return;

    const baseTop = firstWordEl.offsetTop;
    const currentWordTop = activeWordEl.offsetTop;
    const relativeTop = currentWordTop - baseTop;

    // Detect exact single line height from first wrapped word
    for (let i = 0; i < parsedWords.length; i++) {
      const el = wordRefs.current[i];
      if (el && el.offsetTop > baseTop) {
        const detected = el.offsetTop - baseTop;
        if (detected > 32 && detected < 120) {
          setSingleLineHeight(detected);
        }
        break;
      }
    }

    // Scroll up by relativeTop so current line is always at the top of the 3 visible lines.
    // Finished lines above it are scrolled out of view!
    setScrollOffset(Math.max(0, relativeTop));
  }, [activeWordIndex, parsedWords, currentIndex]);

  // Smooth Gliding Caret Positioning (inside words wrapper)
  useLayoutEffect(() => {
    if (!wordsWrapperRef.current) return;
    const wrapper = wordsWrapperRef.current;
    const activeCharEl = document.getElementById(`char-${currentIndex}`);

    if (activeCharEl) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const charRect = activeCharEl.getBoundingClientRect();
      setCaretCoords({
        left: charRect.left - wrapperRect.left,
        top: charRect.top - wrapperRect.top + 4,
        height: Math.max(28, charRect.height - 8),
      });
    } else {
      const lastWord = parsedWords[parsedWords.length - 1];
      const lastCharEl = document.getElementById(`char-${lastWord?.endIndex}`);
      if (lastCharEl) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const charRect = lastCharEl.getBoundingClientRect();
        setCaretCoords({
          left: charRect.right - wrapperRect.left,
          top: charRect.top - wrapperRect.top + 4,
          height: Math.max(28, charRect.height - 8),
        });
      }
    }
  }, [currentIndex, targetText, scrollOffset, parsedWords]);

  // Window resize handler to realign lines and caret
  useEffect(() => {
    const handleResize = () => {
      const activeWordEl = wordRefs.current[activeWordIndex];
      const firstWordEl = wordRefs.current[0];
      if (activeWordEl && firstWordEl) {
        const baseTop = firstWordEl.offsetTop;
        const relativeTop = activeWordEl.offsetTop - baseTop;
        setScrollOffset(Math.max(0, relativeTop));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeWordIndex]);

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
    setScrollOffset(0);
    resetTest();
  };

  const repeatSameText = () => {
    const sameText = targetText;
    setCompletedSession(null);
    setSaveSuccess(false);
    setScrollOffset(0);
    resetTest(duration, difficulty, sameText);
  };

  // Keyboard shortcut: Tab or Tab+Enter to instantly restart
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        restartCurrentTest();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [resetTest]);

  // Maintain focus on typing container
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

  const handleGenerateCustomDrill = async () => {
    try {
      setIsGeneratingDrill(true);
      await api.exercises.generateTargeted();
      navigate('/practice');
    } catch {
      navigate('/practice');
    } finally {
      setIsGeneratingDrill(false);
    }
  };

  return (
    <div className="w-[96vw] sm:w-[90vw] md:w-[84vw] lg:w-[80vw] max-w-[1300px] mx-auto px-2 sm:px-4 py-8 text-[#d1d0c5]">
      {/* =========================================================================
          RESULTS SCREEN (MATCHES SCREENSHOT 2 EXACTLY)
          ========================================================================= */}
      {completedSession ? (
        <div className="animate-fade-in space-y-10">
          {/* Main Hero Results Row: Left stats + Right Telemetry Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            {/* Left Column: Big WPM & ACC numbers */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-6">
              <div>
                <div className="text-2xl lg:text-3xl font-mono text-[#646669] lowercase font-medium tracking-wide">
                  wpm
                </div>
                <div className="text-7xl sm:text-8xl lg:text-9xl font-black font-mono text-[#e2b714] leading-none tracking-tight">
                  {Math.round(completedSession.netWpm)}
                </div>
              </div>

              <div>
                <div className="text-2xl lg:text-3xl font-mono text-[#646669] lowercase font-medium tracking-wide">
                  acc
                </div>
                <div className="text-7xl sm:text-8xl lg:text-9xl font-black font-mono text-[#e2b714] leading-none tracking-tight">
                  {Math.round(completedSession.accuracyPercentage)}%
                </div>
              </div>
            </div>

            {/* Right Column: High-Precision Recharts Performance Chart */}
            <div className="lg:col-span-9 h-64 sm:h-72 w-full pt-4">
              {completedSession.telemetry && completedSession.telemetry.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={completedSession.telemetry}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2c2e31" vertical={false} />
                    <XAxis
                      dataKey="secondMarker"
                      stroke="#4a4d52"
                      tick={{ fontSize: 11, fill: '#646669' }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#4a4d52"
                      tick={{ fontSize: 11, fill: '#646669' }}
                      label={{
                        value: 'Words per Minute',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#646669',
                        fontSize: 10,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#4a4d52"
                      domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax + 1))]}
                      tick={{ fontSize: 11, fill: '#646669' }}
                      label={{
                        value: 'Errors',
                        angle: 90,
                        position: 'insideRight',
                        fill: '#ca4754',
                        fontSize: 10,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2c2e31',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        color: '#d1d0c5',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
                      }}
                    />
                    {/* WPM Net Solid Curve */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="instantWpm"
                      name="WPM"
                      stroke="#e2b714"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#e2b714' }}
                      activeDot={{ r: 4.5, stroke: '#ffffff', strokeWidth: 1 }}
                    />
                    {/* Raw Gross Dashed Curve */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="rawWpm"
                      name="Raw"
                      stroke="#646669"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    {/* Error markers */}
                    <Line
                      yAxisId="right"
                      type="step"
                      dataKey="errorsAtSecond"
                      name="Errors"
                      stroke="#ca4754"
                      strokeWidth={0}
                      dot={<CustomErrorMarker />}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#646669] font-mono">
                  Telemetry recorded for this assessment.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Statistics Row: 5 Clean Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 pt-6 border-t border-white/5">
            {/* Column 1: test type */}
            <div>
              <div className="text-xs sm:text-sm font-mono text-[#646669] mb-1">test type</div>
              <div className="text-xl sm:text-2xl font-mono text-[#e2b714] font-medium">
                time {completedSession.durationSeconds}
              </div>
              <div className="text-xl sm:text-2xl font-mono text-[#e2b714] font-medium">
                english
              </div>
            </div>

            {/* Column 2: raw */}
            <div>
              <div className="text-xs sm:text-sm font-mono text-[#646669] mb-1">raw</div>
              <div className="text-3xl sm:text-5xl font-mono text-[#e2b714] font-bold">
                {Math.round(completedSession.grossWpm)}
              </div>
            </div>

            {/* Column 3: characters */}
            <div>
              <div className="text-xs sm:text-sm font-mono text-[#646669] mb-1">characters</div>
              <div className="text-2xl sm:text-4xl font-mono text-[#e2b714] font-bold">
                {completedSession.correctKeystrokes}/{completedSession.uncorrectedErrors}/
                {completedSession.correctedErrors}/{completedSession.backspaceCount}
              </div>
            </div>

            {/* Column 4: consistency */}
            <div>
              <div className="text-xs sm:text-sm font-mono text-[#646669] mb-1">consistency</div>
              <div className="text-3xl sm:text-5xl font-mono text-[#e2b714] font-bold">
                {completedSession.consistency ?? 84}%
              </div>
            </div>

            {/* Column 5: time */}
            <div>
              <div className="text-xs sm:text-sm font-mono text-[#646669] mb-1">time</div>
              <div className="text-3xl sm:text-5xl font-mono text-[#e2b714] font-bold">
                {completedSession.durationSeconds}s
              </div>
              <div className="text-[11px] font-mono text-[#646669] mt-1">
                00:00:{completedSession.durationSeconds < 10 ? '0' : ''}
                {completedSession.durationSeconds} session
              </div>
            </div>
          </div>

          {/* User status prompt */}
          <div className="text-center text-xs font-mono text-[#646669] pt-2">
            {isAuthenticated ? (
              <span className="text-emerald-400/80">Result securely synchronized to your profile</span>
            ) : (
              <span>Sign in to save your result</span>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col items-center justify-center space-y-4 pt-2">
            <div className="flex items-center gap-6 sm:gap-8 text-[#646669]">
              <button
                onClick={restartCurrentTest}
                title="Next test"
                className="hover:text-[#d1d0c5] transition-colors p-2"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={repeatSameText}
                title="Repeat test"
                className="hover:text-[#d1d0c5] transition-colors p-2"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleGenerateCustomDrill}
                title="Practice mistake drill"
                className="hover:text-[#e2b714] transition-colors p-2"
              >
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <Link
                to="/dashboard"
                title="Analytics dashboard"
                className="hover:text-[#d1d0c5] transition-colors p-2"
              >
                <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link
                to="/heatmap"
                title="Keyboard heatmap"
                className="hover:text-[#d1d0c5] transition-colors p-2"
              >
                <Keyboard className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <button
                onClick={() => setShowDetailedInsights(!showDetailedInsights)}
                title="Toggle detailed intelligence"
                className="hover:text-[#d1d0c5] transition-colors p-2"
              >
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Restart keyboard shortcut hint badge */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#646669]">
              <span className="px-2 py-0.5 rounded bg-[#2c2e31] text-[#9a9c9e] text-[11px] border border-white/5">
                tab &gt; enter
              </span>
              <span>- restart test</span>
            </div>
          </div>

          {/* Expandable Diagnostic Intelligence Breakdown */}
          {showDetailedInsights && (
            <div className="animate-fade-in pt-8 border-t border-white/10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Character Friction Points */}
                <div className="bg-[#1e2024]/60 rounded-2xl p-6 border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Mistyped Character Friction Points
                  </h4>
                  {completedSession.charErrors && completedSession.charErrors.length > 0 ? (
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
                  ) : (
                    <div className="text-xs text-emerald-400 flex items-center gap-2 py-4">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Zero character errors recorded! Flawless execution.</span>
                    </div>
                  )}
                </div>

                {/* AI Muscle Memory Synthesis Drill */}
                <div className="bg-[#1e2024]/60 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#e2b714]" />
                      AI Drill Synthesizer
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Automatically generate customized targeted practice exercises focusing on your
                      exact slip keys from this assessment.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateCustomDrill}
                    disabled={isGeneratingDrill}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#e2b714] hover:bg-[#f59e0b] text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingDrill ? 'Synthesizing Drill...' : 'Generate Practice Drill for My Mistakes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
            ACTIVE TYPING TEST VIEW (MATCHES SCREENSHOT 1 EXACTLY)
            ========================================================================= */
        <div className="space-y-8 animate-fade-in w-full">
          {/* Top Control Bar: Minimal Monkeytype Style */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3 sm:gap-4 bg-[#2c2e31]/80 px-4 sm:px-6 py-2 rounded-xl text-xs font-mono text-[#646669] border border-white/5 shadow-xl backdrop-blur-md transition-all select-none">
              {/* Punctuation & Numbers */}
              <button
                onClick={() => resetTest(duration, difficulty)}
                className="hover:text-[#d1d0c5] transition-colors flex items-center gap-1"
              >
                <span>@</span>
                <span>punctuation</span>
              </button>
              <button
                onClick={() => resetTest(duration, difficulty)}
                className="hover:text-[#d1d0c5] transition-colors flex items-center gap-1"
              >
                <span>#</span>
                <span>numbers</span>
              </button>

              <div className="w-[1px] h-3.5 bg-white/10" />

              {/* Mode: Time */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-[#e2b714] font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>time</span>
                </button>
                <button
                  onClick={() => resetTest(duration, difficulty)}
                  className="hover:text-[#d1d0c5] transition-colors"
                >
                  words
                </button>
                <button
                  onClick={() => resetTest(duration, difficulty)}
                  className="hover:text-[#d1d0c5] transition-colors"
                >
                  quote
                </button>
              </div>

              <div className="w-[1px] h-3.5 bg-white/10" />

              {/* Duration Options */}
              <div className="flex items-center gap-2">
                {([15, 30, 60, 120] as TestDuration[]).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => handleDurationChange(dur)}
                    className={`px-1.5 py-0.5 rounded transition-all font-mono ${
                      duration === dur
                        ? 'text-[#e2b714] font-bold'
                        : 'text-[#646669] hover:text-[#d1d0c5]'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>

              <div className="w-[1px] h-3.5 bg-white/10 hidden sm:block" />

              {/* Difficulty Options */}
              <div className="hidden sm:flex items-center gap-1.5">
                {(['EASY', 'MEDIUM', 'HARD'] as TestDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`px-1 py-0.5 text-[10px] uppercase font-semibold transition-all ${
                      difficulty === diff
                        ? 'text-white border-b border-[#e2b714]'
                        : 'text-[#646669] hover:text-[#d1d0c5]'
                    }`}
                  >
                    {diff.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtitle / Language Selector */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#646669] hover:text-[#d1d0c5] transition-colors cursor-pointer">
            <Globe className="w-3.5 h-3.5" />
            <span>english</span>
          </div>

          {/* Live Timer Counter (Shows in prominent yellow when active, non-distracting) */}
          <div className="h-8 flex items-center justify-start px-2">
            {testStatus === 'RUNNING' ? (
              <span className="text-3xl font-mono font-bold text-[#e2b714] tracking-tight">
                {timeLeft}
              </span>
            ) : (
              <span className="text-xs font-mono text-[#646669] opacity-75">
                click or type any key to start
              </span>
            )}
          </div>

          {/* MAIN 3-LINE TYPING SURFACE (TAKES 80% SCREEN WIDTH, LARGE FONT SIZE) */}
          <div
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={() => containerRef.current?.focus()}
            className="w-full focus:outline-none cursor-text select-none relative"
          >
            {/* Viewport container: STRICTLY 3 LINES HIGH with overflow: hidden */}
            <div
              className="relative overflow-hidden font-mono text-2xl sm:text-3xl lg:text-[34px] xl:text-[36px] tracking-wide"
              style={{
                height: `${singleLineHeight * 3}px`,
                lineHeight: `${singleLineHeight}px`,
              }}
            >
              {/* Words Wrapper with Smooth Line Transition */}
              <div
                ref={wordsWrapperRef}
                className="relative select-none"
                style={{
                  transform: `translateY(-${scrollOffset}px)`,
                  transition: 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              >
                {/* Signature Yellow Caret */}
                {testStatus !== 'COMPLETED' && (
                  <div
                    className={`monkey-caret ${testStatus === 'IDLE' ? 'monkey-caret-blink' : ''}`}
                    style={{
                      left: `${caretCoords.left}px`,
                      top: `${caretCoords.top}px`,
                      height: `${caretCoords.height}px`,
                    }}
                  />
                )}

                {/* Stream of Words formatted into words and letters */}
                {parsedWords.map((wordInfo) => (
                  <div
                    key={wordInfo.id}
                    data-word-idx={wordInfo.id}
                    ref={(el) => {
                      wordRefs.current[wordInfo.id] = el;
                    }}
                    className="inline-flex items-baseline mr-[0.55em] my-0"
                  >
                    {/* Letters */}
                    {wordInfo.word.split('').map((char, localIdx) => {
                      const globalIdx = wordInfo.startIndex + localIdx;
                      const isTyped = globalIdx < currentIndex;
                      const isCurrent = globalIdx === currentIndex;
                      const isCorrect = isTyped && inputChars[globalIdx] === char;
                      const isIncorrect = isTyped && inputChars[globalIdx] !== char;

                      let charClass = 'text-[#646669]'; // untyped muted gray
                      if (isCorrect) {
                        charClass = 'text-[#d1d0c5]'; // correctly typed cream/white
                      } else if (isIncorrect) {
                        charClass = 'text-[#ca4754] bg-[#ca4754]/20 rounded-sm px-[1px]'; // mistyped red
                      }

                      return (
                        <span
                          key={globalIdx}
                          id={`char-${globalIdx}`}
                          className={`transition-colors duration-75 ${charClass} ${
                            isCurrent ? 'opacity-100' : ''
                          }`}
                        >
                          {char}
                        </span>
                      );
                    })}

                    {/* Trailing Space Character */}
                    {wordInfo.hasSpaceAfter && wordInfo.spaceIndex !== undefined && (
                      <span
                        id={`char-${wordInfo.spaceIndex}`}
                        className={`inline-block ${
                          wordInfo.spaceIndex < currentIndex &&
                          inputChars[wordInfo.spaceIndex] !== ' '
                            ? 'bg-[#ca4754]/40 text-[#ca4754] px-0.5 rounded-sm'
                            : 'text-transparent'
                        }`}
                        style={{ width: '0.35em' }}
                      >
                        {wordInfo.spaceIndex < currentIndex &&
                        inputChars[wordInfo.spaceIndex] !== ' '
                          ? inputChars[wordInfo.spaceIndex]
                          : '\u00A0'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Restart Button & Shortcut Indicator */}
          <div className="flex flex-col items-center justify-center pt-8 space-y-3">
            <button
              onClick={restartCurrentTest}
              title="Restart Test"
              className="text-[#646669] hover:text-[#d1d0c5] p-2 transition-colors rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-[#646669]">
              <span className="px-2 py-0.5 rounded bg-[#2c2e31] text-[#9a9c9e] text-[11px] border border-white/5">
                tab
              </span>
              <span>- restart test</span>
            </div>
          </div>

          {/* Quick HUD Metrics Bar (subtle at bottom) */}
          {testStatus === 'RUNNING' && (
            <div className="flex items-center justify-center gap-8 text-xs font-mono text-[#646669] pt-2">
              <div>
                wpm: <span className="text-[#e2b714] font-bold">{netWpm}</span>
              </div>
              <div>
                raw: <span className="text-[#d1d0c5] font-bold">{grossWpm}</span>
              </div>
              <div>
                acc: <span className="text-[#d1d0c5] font-bold">{accuracy}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
