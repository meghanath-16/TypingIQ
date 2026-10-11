import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { KeyboardHeatmapData, KeyMetric } from '../../types';
import { getLocalHeatmapData } from '../../utils/heatmapStorage';
import { Keyboard, CheckCircle2, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const KeyboardHeatmap: React.FC = () => {
  const [data, setData] = useState<KeyboardHeatmapData | null>(null);
  const [selectedKey, setSelectedKey] = useState<KeyMetric | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHeatmap = async () => {
    setIsLoading(true);
    try {
      const res = await api.analytics.getHeatmap();
      const hasPresses = res && res.keys && res.keys.some((k) => k.totalPresses > 0);
      if (hasPresses) {
        setData(res);
        const keyWithErrors = res.keys.find((k) => k.errorPresses > 0);
        const keyWithPresses = res.keys.find((k) => k.totalPresses > 0);
        setSelectedKey(keyWithErrors || keyWithPresses || (res.keys.length > 0 ? res.keys[0] : null));
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend heatmap fetch, falling back to local keystroke telemetry:', err);
    }

    // High precision client-side fallback
    const localData = getLocalHeatmapData();
    setData(localData);
    const keyWithErrors = localData.keys.find((k) => k.errorPresses > 0);
    const keyWithPresses = localData.keys.find((k) => k.totalPresses > 0);
    setSelectedKey(keyWithErrors || keyWithPresses || localData.keys[0]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const getKeyMetric = (char: string): KeyMetric => {
    if (!data) return { keyChar: char, totalPresses: 0, errorPresses: 0, errorRate: 0 };
    return (
      data.keys.find((k) => k.keyChar.toUpperCase() === char.toUpperCase()) || {
        keyChar: char,
        totalPresses: 0,
        errorPresses: 0,
        errorRate: 0,
      }
    );
  };

  const getKeyColor = (metric: KeyMetric): string => {
    if (metric.totalPresses === 0) {
      return 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:bg-white/10';
    }
    const acc = Math.max(0, 100 - metric.errorRate);
    if (acc >= 95) {
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50 shadow-sm shadow-emerald-500/10';
    }
    if (acc >= 85) {
      return 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:border-amber-500/50 shadow-sm shadow-amber-500/10';
    }
    return 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold hover:border-rose-500/60 shadow-md shadow-rose-500/20';
  };

  const getAccuracyPercent = (metric: KeyMetric): number => {
    if (metric.totalPresses === 0) return 100;
    return Math.max(0, Math.round((100 - metric.errorRate) * 10) / 10);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-amber-400" />
            Keyboard Accuracy Heatmap
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            See which letters you hit cleanly and which ones need more practice.
          </p>
        </div>

        <button
          onClick={fetchHeatmap}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Keyboard Grid */}
      <div className="dark-glass-card rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
        {/* Simple Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-400 font-medium">Legend:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
              <span className="text-slate-300 text-xs">95%+ (Clean)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40" />
              <span className="text-slate-300 text-xs">85 - 94% (A few typos)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40" />
              <span className="text-slate-300 text-xs">&lt; 85% (Needs practice)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
              <span className="text-slate-400 text-xs">Not typed yet</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Overall Accuracy:</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {data?.overallKeyAccuracy ?? 100}%
            </span>
          </div>
        </div>

        {/* Keyboard Layout */}
        <div className="flex flex-col items-center gap-2.5 max-w-3xl mx-auto py-2">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-2 justify-center w-full"
              style={{
                paddingLeft: rowIndex === 1 ? '1.25rem' : rowIndex === 2 ? '2.5rem' : 0,
              }}
            >
              {row.map((char) => {
                const metric = getKeyMetric(char);
                const isSelected = selectedKey?.keyChar.toUpperCase() === char.toUpperCase();
                const acc = getAccuracyPercent(metric);

                return (
                  <Tooltip
                    key={char}
                    title={`${char}: ${metric.totalPresses} strokes • ${metric.errorPresses} errors (${acc}% acc)`}
                    arrow
                  >
                    <button
                      onClick={() => setSelectedKey(metric)}
                      className={`relative w-12 sm:w-14 h-12 sm:h-14 rounded-2xl border flex flex-col items-center justify-between p-2 font-mono transition-all duration-150 select-none ${getKeyColor(
                        metric
                      )} ${
                        isSelected
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#090d16] scale-105 z-10'
                          : 'hover:scale-105'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-bold">{char}</span>
                      <span className="text-[9px] font-sans opacity-70">
                        {metric.totalPresses > 0 ? `${acc}%` : '—'}
                      </span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Space Bar */}
          <div className="mt-2 w-64 sm:w-80 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-500 font-mono">
            space
          </div>
        </div>
      </div>

      {/* Selected Key Details & Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selected Key Inspector */}
        <div className="dark-glass-card rounded-3xl p-6 md:col-span-1 border border-white/10">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Selected Letter
          </span>
          {selectedKey ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 text-white flex items-center justify-center text-2xl font-mono font-bold shadow-md">
                  {selectedKey.keyChar}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Letter</span>
                  <span
                    className={`text-base font-bold font-mono ${
                      getAccuracyPercent(selectedKey) >= 95
                        ? 'text-emerald-400'
                        : getAccuracyPercent(selectedKey) >= 85
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {selectedKey.totalPresses > 0
                      ? `${getAccuracyPercent(selectedKey)}% accurate`
                      : 'Not typed yet'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Total times typed:</span>
                  <span className="font-mono font-bold text-white">{selectedKey.totalPresses}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Typos made:</span>
                  <span className="font-mono font-bold text-rose-400">{selectedKey.errorPresses}</span>
                </div>
                <div className="py-2 text-slate-300 leading-relaxed text-[11px]">
                  {selectedKey.totalPresses === 0
                    ? 'Take a test to start tracking this letter.'
                    : selectedKey.errorPresses === 0
                    ? 'Flawless! You always hit this key accurately.'
                    : getAccuracyPercent(selectedKey) >= 90
                    ? 'Pretty solid! Just a few slips occasionally.'
                    : 'You often miss this key. Focus on steady finger reach when practicing words with this letter.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">
              Click any key above to see how well you type it.
            </div>
          )}
        </div>

        {/* Common Problem Letters */}
        <div className="dark-glass-card rounded-3xl p-6 md:col-span-2 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Letters to Practice</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Here are the letters where you make the most typos:
            </p>

            <div className="flex flex-wrap gap-2.5">
              {data?.mostFrequentErrorKeys && data.mostFrequentErrorKeys.length > 0 ? (
                data.mostFrequentErrorKeys.map((k) => {
                  const metric = getKeyMetric(k);
                  const acc = getAccuracyPercent(metric);
                  return (
                    <button
                      key={k}
                      onClick={() => setSelectedKey(metric)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2 hover:bg-rose-500/20 transition-all text-left"
                    >
                      <span className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 font-mono font-bold text-sm flex items-center justify-center">
                        {k}
                      </span>
                      <div className="text-xs">
                        <span className="font-bold block text-rose-300">{acc}% Acc</span>
                        <span className="text-[10px] text-slate-400">
                          {metric.errorPresses} typos / {metric.totalPresses}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-emerald-400 flex items-center gap-2 py-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No frequent typos found! Keep up the smooth typing.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Want to practice only your mistake letters?
            </span>
            <Button
              component={Link}
              to="/practice"
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
              endIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Practice Drills
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
