import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PARTICIPANT'); // PARTICIPANT or ORGANIZER
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, role });
      await login({ email, password });
      
      if (role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 relative select-none">
      <div className="w-full max-w-md glass border border-slate-800 rounded-3xl p-8 shadow-md relative">
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center text-slate-200">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100">Create Account</h2>
          <p className="text-xs text-slate-400">Join the Event Adda circle to host or register</p>
        </div>

        {/* Error Widget */}
        {error && (
          <div className="p-3.5 mb-5 text-xs text-rose-450 bg-rose-500/10 border border-rose-500/20 rounded-xl text-left">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Role Segment Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Register As</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
              <button
                type="button"
                onClick={() => setRole('PARTICIPANT')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 ${
                  role === 'PARTICIPANT'
                    ? 'bg-slate-100 text-slate-950'
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                Participant
              </button>
              <button
                type="button"
                onClick={() => setRole('ORGANIZER')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 ${
                  role === 'ORGANIZER'
                    ? 'bg-slate-100 text-slate-950'
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                Organizer
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Full Name</label>
            <div className="relative flex items-center bg-slate-950 border border-slate-850 focus-within:border-slate-650 rounded-xl transition-all duration-300">
              <User className="w-4 h-4 text-slate-600 absolute left-4" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-700"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative flex items-center bg-slate-950 border border-slate-850 focus-within:border-slate-650 rounded-xl transition-all duration-300">
              <Mail className="w-4 h-4 text-slate-600 absolute left-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-11 pr-4 py-2.5 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-700"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative flex items-center bg-slate-950 border border-slate-850 focus-within:border-slate-650 rounded-xl transition-all duration-300">
              <Lock className="w-4 h-4 text-slate-600 absolute left-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-2.5 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-700"
                minLength="6"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 rounded-xl bg-slate-100 hover:bg-slate-250 text-slate-950 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all duration-300 hover:gap-3 cursor-pointer"
          >
            {loading ? 'Creating Account...' : (
              <>
                Create Account <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-550">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-100 font-bold hover:underline transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
