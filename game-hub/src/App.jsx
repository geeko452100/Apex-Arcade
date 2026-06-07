import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout";
import Home from './pages/Home';


const CardBattlerPlaceholder = () => <h1 className="text-3xl font-bold">Game 1: Card Battler Coming Soon</h1>;
const IdleClickerPlaceholder = () => <h1 className="text-3xl font-bold">Game 2: Idle Clicker Coming Soon</h1>;
const DailyPuzzlePlaceholder = () => <h1 className="text-3xl font-bold">Game 3: Daily Puzzle Coming Soon</h1>;

export default function App() {
  return (
    <Router>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/cards" element={<CardBattlerPlaceholder />} />
          <Route path="/game/idle" element={<IdleClickerPlaceholder />} />
          <Route path="/game/puzzle" element={<DailyPuzzlePlaceholder />} />
        </Routes>
      </SidebarLayout>
    </Router>
  )
}