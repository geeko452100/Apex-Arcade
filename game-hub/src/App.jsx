import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout";
import CardBattlerEngine from './games/card-battler/CardBattlerEngine';
import Home from './pages/Home';
import AuthHub from "./pages/AuthHub";
import RegisterHub from "./pages/RegisterHub";
import { supabase } from "@/games/card-battler/lib/supabaseClient";
import MatchmakingHub from "./games/card-battler/MatchmakingHub";
import IdleEngine from "./games/idle/IdleEngine";
import PuzzleEngine from "./games/puzzle/PuzzleEngine";

// Clean wrapper to isolate matchmaking navigation logic
function MatchmakingWrapper({ userId }) {
  const navigate = useNavigate(); 
  return (
    <MatchmakingHub
      userId={userId} 
      onGameStart={(gameId) => navigate(`/game/play/${gameId}`)} 
    />
  );
}

// Extract URL parameter and pass it alongside authenticated currentUserId to the PvP Engine
function GameWrapper({ userId }) {
  const { gameId } = useParams();
  return <CardBattlerEngine gameId={gameId} currentUserId={userId} />;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user's current authentication status on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Explicitly listen to login/logout/token state alterations
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-amber-400 font-bold">Loading...</div>;

  return (        
    <Routes>
      {/* Public Guest Routes */}
      <Route path="/login" element={!session ? <AuthHub /> : <Navigate to="/" />} />
      <Route path="/register" element={!session ? <RegisterHub /> : <Navigate to="/" />} />

      {/* Protected Authenticated Session Routes */}
      <Route path="/*" element={
        session ? (
          <SidebarLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/cards" element={<MatchmakingWrapper userId={session.user.id} />} />
              <Route path="/game/idle" element={<IdleEngine userId={session.user.id} />} />
              <Route path="/game/puzzle" element={<PuzzleEngine userId={session.user.id} />} />
              <Route path="/game/play/:gameId" element={<GameWrapper userId={session.user.id} />} />
            </Routes>
          </SidebarLayout>
        ) : (
          <Navigate to="/login" />
        )
      } />
    </Routes>
  );
}