import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { email, password, name });
      login(response.data.token, response.data.user);
      toast.success('Account created! Welcome, ' + response.data.user.name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'We could not create your account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-6 shadow-2xl border border-zinc-800 bg-zinc-950">
            <img src="/logo.png" alt="ProTrackIt Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Create Account</h1>
          <p className="text-sm text-zinc-500 mt-2">Join ProTrackIt to start managing tasks</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
            >
              <AlertCircle size={18} />
              <p className="text-xs font-bold tracking-tight">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-700 transition-all font-medium"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 px-1">Email address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-700 transition-all font-medium"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 px-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-700 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/10"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-10 text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
