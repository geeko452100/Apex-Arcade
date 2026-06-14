import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Search, Shield, Users, LogOut } from 'lucide-react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';
import BackToPortfolio from '@/components/BackToPortfolio';

export default function SidebarLayout({ children, role }) {
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      setSigningOut(false);
    }
  };

  const menuItems = [
    { path: '/track', name: 'Track Package', icon: Search, external: true },
  ];

  if (role === 'admin') {
    menuItems.push({ path: '/admin', name: 'Admin Dashboard', icon: Shield });
    menuItems.push({ path: '/staff', name: 'Staff Dashboard', icon: Users });
  } else if (role === 'staff') {
    menuItems.push({ path: '/staff', name: 'Staff Dashboard', icon: Users });
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4 sticky top-0 h-screen">
        <div>
          <BackToPortfolio className="mb-4 px-2" />
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <Package className="w-8 h-8 text-sky-500" />
            <span className="text-xl font-black tracking-wider text-white">PKG TRACKER</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = !item.external && location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
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
