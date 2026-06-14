import { useState } from 'react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';

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
    <div className="min-h-screen bg-slate-50">
      <PublicHeader showStaffLink={false} />

      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md biz-card">
          <div className="biz-card-body">
            <div className="mb-8">
              <h1 className="text-xl font-semibold text-slate-900">Operations portal</h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Sign in with your organization credentials to manage shipments and update delivery status.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="biz-label">Work email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="biz-input pl-10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="biz-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    placeholder="Enter your password"
                    className="biz-input pl-10"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="biz-btn-primary w-full py-2.5"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center mt-6 text-sm text-slate-500">
              Tracking a shipment?{' '}
              <Link to="/track" className="font-medium text-blue-900 hover:text-blue-700 no-underline">
                Use public tracking
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
