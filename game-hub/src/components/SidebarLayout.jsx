import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Home, Cpu, Swords, Puzzle, Trophy, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    const { error } = await signOut();
    if (error) {
      alert(error.message);
      setSigningOut(false);
    } else {
      window.location.href = '/login';
    }
  };

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/game/cards', name: 'Card Battler', icon: Swords },
    { path: '/game/idle', name: 'Tycoon Terminal', icon: Cpu },
    { path: '/game/puzzle', name: 'Daily Puzzle', icon: Puzzle },
    { path: '/leaderboard', name: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4 sticky top-0 h-screen">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <Gamepad2 className="w-8 h-8 text-indigo-500 animate-pulse" />
            <span className="text-xl font-black tracking-wider text-white">GAMER STRONGHOLD</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/leaderboard'
                  ? location.pathname.startsWith('/leaderboard')
                  : location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 border border-transparent hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-300 hover:shadow-md hover:shadow-red-500/10 transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:hover:shadow-none"
          >
            <LogOut className="w-5 h-5 -scale-x-100 text-slate-500 transition-all duration-200 group-hover:text-red-400 group-hover:-translate-x-0.5 group-disabled:translate-x-0" />
            {signingOut ? 'Signing out...' : 'Log out'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
