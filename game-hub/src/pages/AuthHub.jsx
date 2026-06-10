import { useState } from 'react';
import { signIn } from '@/lib/auth';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthHub() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-white mb-2">Platform Access</h1>
          <p className="text-slate-400 text-xs">Authenticate to initialize your session.</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleAuth}
            disabled={loading}
            className="col-span-2 w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>

          <Link
            to="/register"
            className="col-span-2 text-slate-500 hover:text-white text-[10px] uppercase font-bold tracking-widest py-2 text-center transition-colors"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}
