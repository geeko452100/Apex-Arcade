import { useState } from 'react';
import { signUp } from '@/lib/auth';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegisterHub() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [screenName, setScreenName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, screenName);

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-white mb-6 text-center">Create Account</h1>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Screen Name (User ID)" onChange={(e) => setScreenName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:border-indigo-500 outline-none" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:border-indigo-500 outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:border-indigo-500 outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:border-indigo-500 outline-none" />
          </div>
        </div>

        <button onClick={handleSignUp} disabled={loading} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all">
          {loading ? 'Creating...' : 'Register Alias'} <ArrowRight className="w-4 h-4 ml-2" />
        </button>

        <Link to="/login" className="w-full block text-center text-slate-500 hover:text-white text-[10px] uppercase font-bold tracking-widest py-4 transition-colors">
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
}
