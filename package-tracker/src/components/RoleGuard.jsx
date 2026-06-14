import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/lib/auth/useUserRole';

export default function RoleGuard({ userId, allowedRoles, children }) {
  const { role, loading } = useUserRole(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sky-400 font-semibold">
        Loading...
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
