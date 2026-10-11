import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { HistoryPoint, TypingSession } from '../../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { LineChart as ChartIcon, Zap, Target, Calendar, Award } from 'lucide-react';
import Chip from '@mui/material/Chip';

export const TrendCharts: React.FC = () => {
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.analytics.getHistory();
        if (res && res.points && res.points.length > 0) {
          setPoints(res.points);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend history fetch, falling back to local session history:', err);
      }

      // Check local sessions
      try {
        const raw = localStorage.getItem('typingiq_local_sessions');
        if (raw) {
          const localSessions: TypingSession[] = JSON.parse(raw);
          if (localSessions.length > 0) {
            const mappedPoints: HistoryPoint[] = localSessions
              .slice()
              .reverse()
              .map((s, idx) => ({
                sessionIndex: idx + 1,
                sessionId: s.id,
                netWpm: s.netWpm,
                grossWpm: s.grossWpm,
                accuracy: s.accuracyPercentage,
                difficulty: s.difficulty,
                durationSeconds: s.durationSeconds,
                completedAt: s.completedAt,
              }));
            setPoints(mappedPoints);
          }
        }
      } catch {
        // ignore
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const highestWpm = points.length > 0 ? Math.max(...points.map((p) => p.netWpm)) : 0;
  const avgWpm =
    points.length > 0
      ? Math.round((points.reduce((acc, p) => acc + p.netWpm, 0) / points.length) * 10) / 10
      : 0;
  const avgAcc =
    points.length > 0
      ? Math.round((points.reduce((acc, p) => acc + p.accuracy, 0) / points.length) * 10) / 10
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-zinc-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded uppercase tracking-wider inline-block">
              Historical Diagnostics
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ChartIcon className="w-7 h-7 text-cyan-400" />
            Speed & Accuracy Trajectory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Chronological progression curves tracking velocity acceleration and precision thresholds.
          </p>
        </div>

        <Chip
          label="Telemetry Engine"
          size="small"
          sx={{
            bgcolor: 'rgba(6, 182, 212, 0.1)',
            color: '#22d3ee',
            fontSize: '10px',
            fontWeight: 700,
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
        />
      </div>

      {/* KPI Cards in Dark Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="dark-glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Peak Net Speed
          </span>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {highestWpm} <span className="text-xs text-slate-400 font-sans">wpm</span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans">Historical best</span>
        </div>

        <div className="dark-glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Average Speed
          </span>
          <div className="text-3xl font-black text-cyan-400 font-mono">
            {avgWpm} <span className="text-xs text-slate-400 font-sans">wpm</span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans">Across all tests</span>
        </div>

        <div className="dark-glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Average Accuracy
          </span>
          <div className="text-3xl font-black text-emerald-400 font-mono">{avgAcc}%</div>
          <span className="text-[10px] text-slate-500 font-sans">Overall precision</span>
        </div>

        <div className="dark-glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            Total Assessments
          </span>
          <div className="text-3xl font-black text-violet-400 font-mono">{points.length}</div>
          <span className="text-[10px] text-slate-500 font-sans">Tests completed</span>
        </div>
      </div>

      {/* Main Recharts Progression Chart */}
      <div className="dark-glass-card rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Velocity Acceleration Curve</h3>
            <p className="text-xs text-zinc-400">Net WPM vs Precision Accuracy across sessions</p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            {points.length} Historical Datapoints
          </span>
        </div>

        {points.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="sessionIndex"
                  stroke="#a1a1aa"
                  tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  label={{ value: 'Test Index', position: 'insideBottom', offset: -5, fill: '#a1a1aa' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#ffffff"
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tick={{ fontSize: 11, fill: '#ffffff' }}
                  label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#a1a1aa"
                  domain={[70, 100]}
                  tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  label={{ value: 'Accuracy %', angle: 90, position: 'insideRight', fill: '#a1a1aa' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#ffffff',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#ffffff', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="netWpm"
                  name="Net WPM"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06b6d4' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy %"
                  stroke="#10b981"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <span className="text-sm font-medium mb-1">No historical sessions recorded yet</span>
            <span className="text-xs">Complete a typing assessment to generate your progression trajectory</span>
          </div>
        )}
      </div>
    </div>
  );
};
