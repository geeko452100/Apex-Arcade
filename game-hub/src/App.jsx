import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout";
import CardBattlerEngine from './games/card-battler/CardBattlerEngine';
import Home from './pages/Home';
import AuthHub from "./pages/AuthHub";
import RegisterHub from "./pages/RegisterHub";
import { getSession, onAuthStateChange } from "@/lib/auth";
import MatchmakingHub from "./games/card-battler/MatchmakingHub";
import IdleEngine from "./games/idle/IdleEngine";
import PuzzleEngine from "./games/puzzle/PuzzleEngine";
import Leaderboard from "./pages/Leaderboard";

function MatchmakingWrapper({ userId }) {
  const navigate = useNavigate();
  return (
    <MatchmakingHub
      userId={userId}
      onGameStart={(gameId) => navigate(`/game/play/${gameId}`)}
    />
  );
}

function GameWrapper({ userId }) {
  const { gameId } = useParams();
  return <CardBattlerEngine gameId={gameId} currentUserId={userId} />;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((sessionData) => {
      if (sessionData) {
        setSession({ user: sessionData.user, access_token: sessionData.access_token });
      }
      setLoading(false);
    });

    const { unsubscribe } = onAuthStateChange((sessionData) => {
      setSession(sessionData ? { user: sessionData.user, access_token: sessionData.access_token } : null);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-amber-400 font-bold">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={!session ? <AuthHub /> : <Navigate to="/" />} />
      <Route path="/register" element={!session ? <RegisterHub /> : <Navigate to="/" />} />

      <Route path="/*" element={
        session ? (
          <SidebarLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/leaderboard" element={<Leaderboard userId={session.user.id} />} />
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
