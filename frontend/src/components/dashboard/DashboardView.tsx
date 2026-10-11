import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DashboardStats, TypingSession } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Zap,
  Target,
  Award,
  Flame,
  Keyboard,
  ArrowRight,
  TrendingUp,
  Brain,
  Grid3X3,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.analytics.getDashboard();
        setStats(res);
      } catch (err) {
        console.warn('Backend dashboard stats, falling back to local storage sessions:', err);
      }

      // Check local session history to populate if fresh
      try {
        const raw = localStorage.getItem('typingiq_local_sessions');
        if (raw) {
          const localSessions: TypingSession[] = JSON.parse(raw);
          if (localSessions.length > 0) {
            setStats((prev) => {
              if (prev && prev.totalSessions > 0) return prev;
              const bestWpm = Math.max(...localSessions.map((s) => s.netWpm));
              const avgWpm =
                Math.round(
                  (localSessions.reduce((acc, s) => acc + s.netWpm, 0) / localSessions.length) * 10
                ) / 10;
              const avgAcc =
                Math.round(
                  (localSessions.reduce((acc, s) => acc + s.accuracyPercentage, 0) /
                    localSessions.length) *
                    10
                ) / 10;
              const totalStrokes = localSessions.reduce((acc, s) => acc + s.totalKeystrokes, 0);
              const totalCorrect = localSessions.reduce((acc, s) => acc + s.correctKeystrokes, 0);
              const totalErrors = localSessions.reduce((acc, s) => acc + s.errorCount, 0);
              const avgIki =
                Math.round(
                  (localSessions.reduce((acc, s) => acc + s.avgInterKeyIntervalMs, 0) /
                    localSessions.length) *
                    10
                ) / 10;
              const avgPause =
                Math.round(
                  (localSessions.reduce((acc, s) => acc + s.avgPauseDurationMs, 0) /
                    localSessions.length) *
                    10
                ) / 10;
              const avgRecovery =
                Math.round(
                  (localSessions.reduce((acc, s) => acc + s.errorRecoveryTimeMs, 0) /
                    localSessions.length) *
                    10
                ) / 10;
              const avgCorrection =
                Math.round(
                  (localSessions.reduce((acc, s) => acc + s.correctionRate, 0) /
                    localSessions.length) *
                    10
                ) / 10;

              return {
                totalSessions: localSessions.length,
                bestWpm,
                avgWpm,
                avgGrossWpm: avgWpm + 4,
                avgAccuracy: avgAcc,
                totalKeystrokes: totalStrokes,
                totalCorrectKeystrokes: totalCorrect,
                totalErrorKeystrokes: totalErrors,
                avgCorrectionRate: avgCorrection,
                avgInterKeyIntervalMs: avgIki,
                avgPauseDurationMs: avgPause,
                avgErrorRecoveryTimeMs: avgRecovery,
                currentStreakDays: 1,
                recentSessions: localSessions.slice(0, 10),
              };
            });
          }
        }
      } catch {
        // ignore
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-slate-100">
      {/* Welcome Banner */}
      <div className="dark-glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider inline-block mb-1.5">
            Overview
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.username ?? 'Typist'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Here is your comprehensive keystroke velocity, motor memory consistency, and typing telemetry overview.
          </p>
        </div>

        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{
            bgcolor: '#f59e0b',
            color: '#000000',
            fontWeight: 800,
            fontSize: '12px',
            borderRadius: '14px',
            px: 3,
            py: 1.4,
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
            '&:hover': {
              bgcolor: '#fbbf24',
            },
          }}
          startIcon={<Keyboard className="w-4 h-4" />}
          endIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Start Typing Test
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="dark-glass-card rounded-2xl p-4.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Peak Speed</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {stats?.bestWpm ?? 0} <span className="text-xs text-slate-500 font-sans">wpm</span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans">Highest score</span>
        </div>

        <div className="dark-glass-card rounded-2xl p-4.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Average Speed</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.avgWpm ?? 0} <span className="text-xs text-slate-500 font-sans">wpm</span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans">Across all tests</span>
        </div>

        <div className="dark-glass-card rounded-2xl p-4.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Accuracy</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats?.avgAccuracy ?? 0}%</div>
          <span className="text-[10px] text-slate-500 font-sans">Average precision</span>
        </div>

        <div className="dark-glass-card rounded-2xl p-4.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Correction Rate</span>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">{stats?.avgCorrectionRate ?? 100}%</div>
          <span className="text-[10px] text-slate-500 font-sans">Corrected typos</span>
        </div>

        <div className="dark-glass-card rounded-2xl p-4.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>Key Latency</span>
          </div>
          <div className="text-2xl font-black text-violet-300 font-mono">
            {stats?.avgInterKeyIntervalMs ? Math.round(stats.avgInterKeyIntervalMs) : 0}
            <span className="text-xs text-slate-500 font-sans">ms</span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans">Between keystrokes</span>
        </div>

        <div className="dark-glass-card rounded-2xl p-4.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Tests</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats?.totalSessions ?? 0}</div>
          <span className="text-[10px] text-slate-500 font-sans">Completed tests</span>
        </div>
      </div>

      {/* Cadence Diagnostics Banner */}
      <div className="dark-glass-card rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border border-white/10">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Keystroke Volume</span>
          <span className="text-base font-bold text-white font-mono mt-0.5 block">
            {stats?.totalCorrectKeystrokes ?? 0} Correct / {stats?.totalErrorKeystrokes ?? 0} Errors
          </span>
          <span className="text-[11px] text-slate-400">Total volume: {stats?.totalKeystrokes ?? 0} strokes</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Pause Duration</span>
          <span className="text-base font-bold text-white font-mono mt-0.5 block">
            {stats?.avgPauseDurationMs ? Math.round(stats.avgPauseDurationMs) : 0} ms
          </span>
          <span className="text-[11px] text-slate-400">Micro-hesitations (≥400ms)</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Error Recovery Latency</span>
          <span className="text-base font-bold text-white font-mono mt-0.5 block">
            {stats?.avgErrorRecoveryTimeMs ? Math.round(stats.avgErrorRecoveryTimeMs) : 0} ms
          </span>
          <span className="text-[11px] text-slate-400">Time to backspace mistake</span>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/history"
          className="dark-glass-card rounded-2xl p-6 transition-all hover:scale-[1.02] flex flex-col justify-between group border border-white/10"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 font-bold shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Velocity & Accuracy Trends</h3>
            <p className="text-xs text-slate-400">
              Interactive charts showing how your typing speed and accuracy improve over time.
            </p>
          </div>
          <div className="flex items-center text-xs text-amber-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
            <span>View Charts</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          to="/heatmap"
          className="dark-glass-card rounded-2xl p-6 transition-all hover:scale-[1.02] flex flex-col justify-between group border border-white/10"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 font-bold shadow-md">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Keyboard Accuracy Heatmap</h3>
            <p className="text-xs text-slate-400">
              Interactive physical keyboard matrix highlighting clean keys and frequent typo zones.
            </p>
          </div>
          <div className="flex items-center text-xs text-emerald-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
            <span>View Heatmap</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          to="/ai-insights"
          className="dark-glass-card rounded-2xl p-6 transition-all hover:scale-[1.02] flex flex-col justify-between group border border-white/10"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3 font-bold shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">AI Typing Coach & Forecast</h3>
            <p className="text-xs text-slate-400">
              Personalized tips, typing profile analysis, and speed projections.
            </p>
          </div>
          <div className="flex items-center text-xs text-violet-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
            <span>View Coach</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>
      </div>

      {/* Recent Sessions Table */}
      <div className="dark-glass-card rounded-2xl p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Recent Historical Sessions</h3>
          <span className="text-xs text-slate-400 font-mono">Last 10 Assessments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02]">
                <th className="py-2.5 px-3 font-semibold">Test ID</th>
                <th className="py-2.5 px-3 font-semibold">Net WPM</th>
                <th className="py-2.5 px-3 font-semibold">Gross WPM</th>
                <th className="py-2.5 px-3 font-semibold">Accuracy</th>
                <th className="py-2.5 px-3 font-semibold">Duration</th>
                <th className="py-2.5 px-3 font-semibold">Difficulty</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {stats?.recentSessions && stats.recentSessions.length > 0 ? (
                stats.recentSessions.map((session) => (
                  <tr key={String(session.id)} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">#{String(session.id).slice(-6)}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{session.netWpm}</td>
                    <td className="py-3 px-3 text-slate-400">{session.grossWpm}</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{session.accuracyPercentage}%</td>
                    <td className="py-3 px-3 text-slate-300 font-sans">{session.durationSeconds}s</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                      {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No sessions recorded yet. Launch your first typing test!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
