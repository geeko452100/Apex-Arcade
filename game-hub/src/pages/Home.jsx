import React from 'react';
import { Link } from 'react-router-dom'
import { ArrowRight, Swords, Cpu, Puzzle } from 'lucide-react';


const GAMES = [
    {
        id: 'cards', 
        title: 'CardBattler', 
        desc: 'Epic real-time multiplayer cardBattler.', 
        path: '/game/cards',
        icon: Swords,
        color: 'text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50'
    }, 

    {
        id: 'idle', 
        title: 'Idle Clicker', 
        desc: 'Idle incremental clicker to manage an empire!',
        path: '/game/idle',
        icon: Cpu,
        color: 'text-amber-400 border-amber-500/20 hover:border-amber-500/50'
    },
    {
        id: 'puzzle', 
        title: 'Daily Puzzle', 
        desc: 'New puzzle updated daily',
        path: '/game/puzzle',
        icon: Puzzle,
        color: 'text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50'
    },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <header className='text-center mb-12'>
                <h1 className='text-4xl font-extrabold text-indigo-400 mb-2'>Apex Arcade</h1>
                <p className='text-slate-400'>Welcome to Apex Arcade!</p>
            </header>


            <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
                {GAMES.map((game) => {
                    const Icon = game.icon;
                    return (
                        <div 
                            key={game.id} 
                            className={`group bg-slate-950 p-6 rounded-xl border flex flex-col justify-between transition-all duration-300 shadow-2xl hover:-translate-y-1 ${game.color}`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <Icon className="w-8 h-8" />
                                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                                        Ready to Build
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                    {game.title}
                                </h2>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                                    {game.desc}
                                </p>
                            </div>
                    
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