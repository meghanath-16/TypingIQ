import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Keyboard, Lock, User, AlertCircle, Database } from 'lucide-react';
import Button from '@mui/material/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in text-zinc-100">
      <div className="dark-glass-card rounded-3xl p-8 sm:p-10 max-w-md w-full border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-white/10 font-bold">
            <Keyboard className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to TypingIQ</h2>
          <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-zinc-300" />
            <span>MongoDB Connected • AI Telemetry</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="typist_user"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-white transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#ffffff',
              color: '#000000',
              fontWeight: 700,
              fontSize: '12px',
              borderRadius: '12px',
              py: 1.2,
              mt: 1,
              '&:hover': {
                bgcolor: '#e4e4e7',
              },
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
