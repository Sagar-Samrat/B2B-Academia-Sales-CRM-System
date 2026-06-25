import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Login = ({ onNavigateToSignup }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefill = (role) => {
    if (role === 'admin') {
      setEmail('admin@crm.com');
      setPassword('admin123');
    } else {
      setEmail('sales@crm.com');
      setPassword('sales123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-950 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans select-none">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Academia CRM</h2>
        <p className="text-sm text-slate-400">Sign in to manage collegiate partnerships & sales pipeline.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 dark:bg-zinc-900/50 backdrop-blur-md border border-white/10 dark:border-zinc-800/80 py-8 px-4 shadow-2xl rounded-3xl sm:px-10 space-y-6">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/40 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="name@university.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/40 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Prefill options for demo */}
          <div className="border-t border-zinc-800 pt-5 space-y-3">
            <span className="block text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePrefill('admin')}
                className="py-2 px-3 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[10px] text-slate-300 font-medium hover:bg-slate-900/60 transition-colors"
              >
                Admin Account
              </button>
              <button
                type="button"
                onClick={() => handlePrefill('sales')}
                className="py-2 px-3 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[10px] text-slate-300 font-medium hover:bg-slate-900/60 transition-colors"
              >
                Sales Exec Account
              </button>
            </div>
          </div>

          {/* Switch page link */}
          <div className="text-center">
            <button
              onClick={onNavigateToSignup}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Need a new account? Create one here
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
