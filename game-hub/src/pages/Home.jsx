import { Navigate, Link } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { useUserRole } from '@/lib/auth/useUserRole';

export default function Home({ userId }) {
  const { loading, isAdmin, isStaff } = useUserRole(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sky-400 font-semibold">
        Loading...
      </div>
    );
  }

  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isStaff) return <Navigate to="/staff" replace />;

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white">Package Tracker</h1>
        <p className="mt-2 text-slate-400 text-sm max-w-xl">
          Your account does not have staff or admin access. Use the public tracker to look up a shipment, or contact an administrator for access.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
        <Link
          to="/track"
          className="group bg-slate-950 p-6 rounded-xl border border-sky-500/20 hover:border-sky-500/50 flex flex-col gap-4 transition-all hover:-translate-y-1"
        >
          <Search className="w-8 h-8 text-sky-400" />
          <div>
            <h2 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
              Track a Package
            </h2>
            <p className="text-slate-400 text-xs mt-1">Look up shipment status by tracking ID — no login needed.</p>
          </div>
        </Link>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col gap-4 opacity-60">
          <Package className="w-8 h-8 text-slate-500" />
          <div>
            <h2 className="text-lg font-bold text-slate-400">Staff / Admin Access</h2>
            <p className="text-slate-500 text-xs mt-1">
              Shipment management requires a staff or admin account assigned by your organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
