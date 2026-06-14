import { useState } from 'react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';
import { Lock, Mail, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackToPortfolio from '@/components/BackToPortfolio';

export default function AuthHub() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <BackToPortfolio className="absolute left-6 top-6" />
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 mb-4">
            <Package className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Staff Sign In</h1>
          <p className="text-slate-400 text-xs">Sign in to manage shipments and update delivery status.</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              placeholder="Password"
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-3 rounded-lg transition-all"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>

        <p className="text-center mt-6 text-xs text-slate-600">
          Looking for your package?{' '}
          <Link to="/track" className="text-sky-400 hover:text-sky-300 transition-colors">
            Track without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}
