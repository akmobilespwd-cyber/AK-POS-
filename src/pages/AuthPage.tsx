import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wrench, Lock, Mail, Eye, EyeOff, ShieldCheck, 
  ArrowRight, KeyRound, Sparkles, CheckCircle, UserCheck 
} from 'lucide-react';
import { initialUsers } from '../data/mockInitialData';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const AuthPage: React.FC = () => {
  const { login } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('alex@advanceauto.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid business email address');
      return;
    }

    if (mode === 'login') {
      if (!password || password.length < 4) {
        setErrorMsg('Password must be at least 4 characters');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const success = login(email);
        if (!success) {
          setErrorMsg('Invalid credentials or unauthorized account');
        }
      }, 600);
    } else if (mode === 'register') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        login(email);
      }, 600);
    } else if (mode === 'forgot') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg(`Password reset instructions sent to ${email}`);
        setMode('reset');
      }, 600);
    } else if (mode === 'reset') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg('Your security password has been updated. Please sign in.');
        setMode('login');
      }, 600);
    }
  };

  const handleFillDemoUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 font-sans overflow-hidden">
      {/* Automotive Workshop Atmospheric Graphic Background */}
      <div className="absolute inset-0 z-0 opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl" />
        {/* Subtle grid pattern */}
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.15) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/25 mb-3">
            <Wrench className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            ADVANCE AUTO
          </h2>
          <p className="text-xs font-semibold text-amber-400 tracking-widest uppercase mt-0.5">
            Workshop Management & POS
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {mode === 'login' && 'Commercial terminal authentication'}
            {mode === 'register' && 'Register new staff technician or operator'}
            {mode === 'forgot' && 'Reset employee security key'}
            {mode === 'reset' && 'Define new system password'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2 animate-shake">
            <KeyRound className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email / System Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mechanic@advanceauto.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(''); }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[11px] text-slate-500">AES-256 Auth</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Station'}
                  {mode === 'register' && 'Create Staff Account'}
                  {mode === 'forgot' && 'Send Recovery Link'}
                  {mode === 'reset' && 'Update Password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Fill Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Instant Demo Switcher (Click to auto-fill)</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {initialUsers.slice(0, 4).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleFillDemoUser(u.email)}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 text-left transition-colors truncate"
              >
                <span className="font-semibold text-amber-400 block">{u.role}</span>
                <span className="text-slate-400 text-[10px] truncate block">{u.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle between login/register */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(''); }}
                className="text-amber-400 hover:underline font-semibold"
              >
                Register staff
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className="text-amber-400 hover:underline font-semibold"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
