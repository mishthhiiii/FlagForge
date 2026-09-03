import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';

export function LoginPage({ onLoginSuccess }) {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('admin@flagforge.local');
  const [password, setPassword] = useState('password123');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2 font-black text-xl">
            FF
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Sign in to FlagForge</h1>
          <p className="text-xs text-slate-400">
            Feature Flag Management with AI-Powered Rollout Insights
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-email"
                type="email"
                required
                placeholder="admin@flagforge.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            id="btn-submit-login"
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isLoading}
            icon={ArrowRight}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Role Accounts Quick Select */}
        <div className="bg-[#070b14] border border-[#1e293b] rounded-lg p-3 text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pre-configured Role Accounts
          </div>
          <p className="text-[11px] text-slate-400">
            Sign in with a role account to manage feature rollouts and monitor deployment insights.
          </p>
          <div className="font-mono text-[11px] text-slate-300 bg-[#0f172a] p-2.5 rounded border border-[#1e293b] space-y-2">
            <div
              className="flex justify-between items-center cursor-pointer hover:bg-slate-800/60 px-1.5 py-1 rounded transition-colors"
              onClick={() => { setEmail('admin@flagforge.local'); setPassword('password123'); }}
            >
              <span className="text-indigo-300">admin@flagforge.local</span>
              <span className="text-rose-400 text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">Admin</span>
            </div>
            <div
              className="flex justify-between items-center cursor-pointer hover:bg-slate-800/60 px-1.5 py-1 rounded transition-colors"
              onClick={() => { setEmail('developer@flagforge.local'); setPassword('password123'); }}
            >
              <span className="text-indigo-300">developer@flagforge.local</span>
              <span className="text-indigo-400 text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">Developer</span>
            </div>
            <div
              className="flex justify-between items-center cursor-pointer hover:bg-slate-800/60 px-1.5 py-1 rounded transition-colors"
              onClick={() => { setEmail('viewer@flagforge.local'); setPassword('password123'); }}
            >
              <span className="text-indigo-300">viewer@flagforge.local</span>
              <span className="text-emerald-400 text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Viewer</span>
            </div>
            <div className="pt-2 border-t border-[#1e293b]">
              {!showDemoCredentials ? (
                <button
                  type="button"
                  id="btn-show-demo-credentials"
                  onClick={() => setShowDemoCredentials(true)}
                  className="w-full text-center py-1.5 px-2 rounded text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show Demo Credentials</span>
                </button>
              ) : (
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Demo Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300 font-semibold font-mono">password123</span>
                    <button
                      type="button"
                      id="btn-hide-demo-credentials"
                      onClick={() => setShowDemoCredentials(false)}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                      title="Hide Demo Credentials"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
