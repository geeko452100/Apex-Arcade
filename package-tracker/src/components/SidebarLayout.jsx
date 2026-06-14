import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Search, LayoutDashboard, ClipboardList, LogOut } from 'lucide-react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';

const ROLE_LABELS = {
  admin: 'Administrator',
  staff: 'Operations Staff',
  user: 'User',
};

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
    { path: '/track', name: 'Public Tracking', icon: Search, external: true },
  ];

  if (role === 'admin') {
    menuItems.push({ path: '/admin', name: 'Administration', icon: LayoutDashboard });
    menuItems.push({ path: '/staff', name: 'Operations', icon: ClipboardList });
  } else if (role === 'staff') {
    menuItems.push({ path: '/staff', name: 'Operations', icon: ClipboardList });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          <div className="px-5 py-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-900 text-white">
                <Package className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">Package Tracker</p>
                <p className="text-[11px] text-slate-500 leading-tight">Logistics Management</p>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = !item.external && location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-900' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 space-y-3">
          {role && (
            <p className="px-3 text-xs text-slate-500">
              Signed in as{' '}
              <span className="font-medium text-slate-700">{ROLE_LABELS[role] ?? role}</span>
            </p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="border-b border-slate-200 bg-white px-8 py-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {location.pathname.startsWith('/admin')
              ? 'Administration'
              : location.pathname.startsWith('/staff')
                ? 'Operations'
                : 'Dashboard'}
          </p>
        </div>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
