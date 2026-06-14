import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import RoleGuard from './components/RoleGuard';
import Home from './pages/Home';
import AuthHub from './pages/AuthHub';
import TrackPackage from './pages/TrackPackage';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { supabase } from '@/games/card-battler/lib/supabaseClient';
import { useUserRole } from '@/lib/auth/useUserRole';

function AuthenticatedRoutes({ session }) {
  const { role, loading } = useUserRole(session.user.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <SidebarLayout role={role}>
      <Routes>
        <Route path="/" element={<Home userId={session.user.id} />} />
        <Route
          path="/admin"
          element={
            <RoleGuard userId={session.user.id} allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/staff"
          element={
            <RoleGuard userId={session.user.id} allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </RoleGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SidebarLayout>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes — no login required */}
      <Route path="/track" element={<TrackPackage />} />
      <Route path="/track/:trackingId" element={<TrackPackage />} />

      <Route path="/login" element={!session ? <AuthHub /> : <Navigate to="/" />} />

      {/* Authenticated routes */}
      <Route
        path="/*"
        element={
          session ? (
            <AuthenticatedRoutes session={session} />
          ) : (
            <Navigate to="/track" />
          )
        }
      />
    </Routes>
  );
}
