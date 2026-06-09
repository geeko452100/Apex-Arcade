import { Link } from 'react-router-dom';
import { ArrowRight, Swords, Cpu, Puzzle } from 'lucide-react';

const GAMES = [
  { 
    id: 'cards', 
    title: 'Card Battler', 
    desc: 'Distributed real-time state synchronization via WebSocket infrastructure.', 
    path: '/game/cards',
    icon: Swords,
    color: 'text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50',
    status: 'live',
  },
  { 
    id: 'idle', 
    title: 'Tycoon Terminal', 
    desc: 'Build businesses, hire managers, and stack upgrades in an Adventure Capitalist-style idle economy.', 
    path: '/game/idle',
    icon: Cpu,
    color: 'text-amber-400 border-amber-500/20 hover:border-amber-500/50',
    status: 'live',
  },
  { 
    id: 'puzzle', 
    title: 'Daily Puzzle', 
    desc: 'Time-synchronized state invalidation, persistent client caching, and global metrics rollups.', 
    path: '/game/puzzle',
    icon: Puzzle,
    color: 'text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50',
    status: 'live',
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Platform Dashboard
        </h1>
        <p className="mt-2 text-slate-400 max-w-2xl text-sm leading-relaxed">
          Select a micro-application from the core directory below to launch its isolated runtime engine. Each instance evaluates separate state-management models and architectural targets.
        </p>
      </header>
      
      {/* Game Application Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <div 
              key={game.id} 
              className={`group bg-slate-950 p-6 rounded-xl border flex flex-col justify-between transition-all duration-300 shadow-2xl hover:-translate-y-1 ${game.color}`}
            >
              <div>
                {/* Card Icon & Header */}
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8" />
                  <span className={`text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md border ${
                    game.status === 'live'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-slate-500 bg-slate-900 border-slate-800'
                  }`}>
                    {game.status === 'live' ? 'Live' : 'Coming Soon'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {game.title}
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  {game.desc}
                </p>
              </div>

              {/* Action Button Link */}
              <Link 
                to={game.path}
                className="w-full inline-flex items-center justify-between bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-xs font-semibold tracking-wide text-slate-300 hover:text-white py-3 px-4 rounded-lg transition-all duration-200 shadow-inner group/btn"
              >
                <span>Launch Core Engine</span>
                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}