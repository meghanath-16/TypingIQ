import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TypingTestView } from './components/typing/TypingTestView';
import { DashboardView } from './components/dashboard/DashboardView';
import { TrendCharts } from './components/analytics/TrendCharts';
import { KeyboardHeatmap } from './components/analytics/KeyboardHeatmap';
import { AiIntelligenceCenter } from './components/ai/AiIntelligenceCenter';
import { PracticeDrillsView } from './components/practice/PracticeDrillsView';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ShieldCheck, Cpu, Database } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
            {/* Top Global Navigation Bar */}
            <Navbar />

            {/* Main Application Content Body */}
            <main className="flex-1 pb-16">
              <Routes>
                <Route path="/" element={<TypingTestView />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/history" element={<TrendCharts />} />
                <Route path="/heatmap" element={<KeyboardHeatmap />} />
                <Route path="/ai-insights" element={<AiIntelligenceCenter />} />
                <Route path="/practice" element={<PracticeDrillsView />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Dark Aesthetic Footer */}
            <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-500 bg-[#070a10]/80 backdrop-blur-md">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white tracking-wider">TypingIQ</span>
                  <span className="text-slate-400">— AI-Powered Intelligent Typing Analytics & Optimization System</span>
                </div>

                <div className="flex items-center gap-5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    MongoDB Native
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    Spring Boot 3 + FastAPI ML
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Zero Background Logging
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
