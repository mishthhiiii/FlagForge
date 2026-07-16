import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Terminal, ShieldAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useFlags } from '../context/FlagContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent } from '../components/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, setCurrentUser } = useFlags();
  const [email, setEmail] = useState('sarah@flagforge.co');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate login verification
    setTimeout(() => {
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        showToast('Invalid credentials', 'error');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setIsLoading(false);
        showToast('Invalid password', 'error');
        return;
      }

      // Successful login
      setCurrentUser({
        name: email === 'sarah@flagforge.co' ? 'Sarah Connor' : email.split('@')[0],
        email: email,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        role: 'Owner',
      });
      showToast('Logged in successfully', 'success');
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Grid and Ambient Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2.5 mb-8 select-none"
      >
        <div className="p-2 bg-indigo-600 rounded-md shadow-lg shadow-indigo-600/20 border border-indigo-500/30">
          <Terminal className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white font-sans">
          Flag<span className="text-indigo-500">Forge</span>
        </span>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md z-10"
      >
        <Card hoverGlow className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <CardContent className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Welcome back</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Manage your targeting environments with surgical precision
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-400 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Work Email"
                id="email"
                type="email"
                placeholder="sarah@flagforge.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-500 hover:text-zinc-300 outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between text-xs mt-2">
                <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-850 bg-zinc-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    defaultChecked
                  />
                  <span>Keep me signed in</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast('Password reset link sent (simulated)', 'info'); }} className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                isLoading={isLoading}
              >
                Sign In to Platform
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-500">
                Authorized workspaces only. FlagForge CLI configuration available in settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Access Credentials helper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-3 bg-zinc-900/50 border border-zinc-800/40 rounded-md max-w-md w-full text-center text-xs text-zinc-400 flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
        <span>Click <strong>Sign In</strong> directly to access with full owner capabilities.</span>
      </motion.div>
    </div>
  );
};
export default Login;
