import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthRequiredCardProps {
  title: string;
  description: string;
}

export const AuthRequiredCard: React.FC<AuthRequiredCardProps> = ({ title, description }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
      <div className="bg-[#1e2024]/80 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#e2b714] flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
          {title}
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#e2b714] hover:bg-[#f59e0b] text-black font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
