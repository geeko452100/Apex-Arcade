import { Navigate, Link } from 'react-router-dom';
import { Search, Building2 } from 'lucide-react';
import { useUserRole } from '@/lib/auth/useUserRole';
import PageHeader from '@/components/PageHeader';

export default function Home({ userId }) {
  const { loading, isAdmin, isStaff } = useUserRole(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 text-sm">
        Loading your account…
      </div>
    );
  }

  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isStaff) return <Navigate to="/staff" replace />;

  return (
    <div>
      <PageHeader
        title="Welcome"
        description="Your account does not have operations or administrator privileges. Use public tracking to look up a shipment, or contact your organization administrator to request access."
      />

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        <Link
          to="/track"
          className="biz-card p-6 hover:border-blue-200 hover:shadow-md transition-all no-underline group"
        >
          <Search className="w-8 h-8 text-blue-900 mb-4" />
          <h2 className="text-base font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
            Public shipment tracking
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Look up delivery status using a tracking number. No sign-in required.
          </p>
        </Link>

        <div className="biz-card p-6 bg-slate-50">
          <Building2 className="w-8 h-8 text-slate-400 mb-4" />
          <h2 className="text-base font-semibold text-slate-700">Operations access</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Shipment management is restricted to authorized staff and administrators within your organization.
          </p>
        </div>
      </div>
    </div>
  );
}
