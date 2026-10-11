import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Keyboard,
  LayoutDashboard,
  LineChart,
  Grid3X3,
  Sparkles,
  BookOpen,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Typing Test', icon: Keyboard },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'Analytics', icon: LineChart },
    { to: '/heatmap', label: 'Heatmap', icon: Grid3X3 },
    { to: '/ai-insights', label: 'AI Coach', icon: Sparkles },
    { to: '/practice', label: 'Drills', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090d16]/85 border-b border-white/[0.08] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Keyboard className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">typing</span>
              <span className="font-extrabold text-lg tracking-tight text-amber-400">IQ</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide uppercase">Intelligent Typing Analytics</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.06] shadow-inner">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Actions with MUI */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <UserIcon className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-200">{user?.username}</span>
              </div>
              <Tooltip title="Log out">
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="small"
                sx={{
                  bgcolor: '#f59e0b',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderRadius: '12px',
                  px: 2,
                  py: 0.8,
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
                  '&:hover': {
                    bgcolor: '#fbbf24',
                  },
                }}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-between overflow-x-auto pt-2 mt-2 border-t border-white/10 gap-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold shrink-0 ${
                isActive ? 'text-amber-400 bg-amber-400/10 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mb-0.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
