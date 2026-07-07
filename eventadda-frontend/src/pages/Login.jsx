import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login({ email, password });
      if (response.role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 relative select-none">
      <div className="w-full max-w-md glass border border-slate-800 rounded-3xl p-8 shadow-md relative">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center text-slate-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to check and manage your events schedule</p>
        </div>

        {/* Error Indicator */}
        {error && (
          <div className="p-3.5 mb-6 text-xs text-rose-450 bg-rose-500/10 border border-rose-500/20 rounded-xl text-left">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative flex items-center bg-slate-950 border border-slate-850 focus-within:border-slate-650 rounded-xl transition-all duration-300">
              <Mail className="w-4 h-4 text-slate-600 absolute left-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">Password</label>
            </div>
            <div className="relative flex items-center bg-slate-950 border border-slate-850 focus-within:border-slate-650 rounded-xl transition-all duration-300">
              <Lock className="w-4 h-4 text-slate-600 absolute left-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-250 text-slate-950 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all duration-300 hover:gap-3 cursor-pointer"
          >
            {loading ? 'Verifying...' : (
              <>
                Sign In <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Register Footer */}
        <div className="mt-8 text-center text-xs text-slate-550">
          New to Event Adda?{' '}
          <Link to="/register" className="text-slate-100 font-bold hover:underline transition-colors">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
