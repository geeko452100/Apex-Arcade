import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/games/card-battler/lib/supabaseClient';
import { Lock, Mail, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SCREEN_NAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

export default function RegisterHub() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [screenName, setScreenName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');

    const trimmedName = screenName.trim();
    if (!SCREEN_NAME_PATTERN.test(trimmedName)) {
      setError('Screen name must be 3–20 characters (letters, numbers, _ or -).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const { data: available, error: lookupError } = await supabase.rpc(
      'is_screen_name_available',
      { p_screen_name: trimmedName },
    );

    if (lookupError) {
      setError(lookupError.message);
      setLoading(false);
      return;
    }

    if (available === false) {
      setError('That screen name is already taken. Try another.');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { screen_name: trimmedName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    if (data.session) {
      navigate('/');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-3">Account Created</h1>
          <p className="text-slate-400 text-sm mb-6">
            Check your email to confirm your account, then sign in to start playing.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all"
          >
            Go to Sign In <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-white mb-6 text-center">Create Account</h1>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Screen Name"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Register Alias'} <ArrowRight className="w-4 h-4 ml-2" />
        </button>

        <Link
          to="/login"
          className="w-full block text-center text-slate-500 hover:text-white text-[10px] uppercase font-bold tracking-widest py-4 transition-colors"
        >
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
}
