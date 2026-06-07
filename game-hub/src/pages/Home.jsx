import React from 'react';

const GAMES = [
    {id: 'cards', title: 'CardBattler', desc: 'Epic real-time multiplayer cardBattler.', status: 'Coming Soon'}, 
    {id: 'rogue-like', title: 'Dungeon Crawler', desc: 'Turn-Based Dungeon Crawler with inventory management', status: 'Coming Soon'},
    {id: 'puzzle', title: 'Daily Wordle', desc: 'Daily wordle puzzle with high-score leaderboard.', status: 'Coming Soon'},
];

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <header className='text-center mb-12'>
                <h1 className='text-4xl font-extrabold text-indigo-400 mb-2'>Apex Arcade</h1>
                <p className='text-slate-400'>Welcome to Apex Arcade!</p>
            </header>


            <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
                {GAMES.map((game) => (
                    <div key={game.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{game.title}</h2>
                        <p className="text-slate-400 text-sm mb-4">{game.desc}</p>
                    </div>
                    <span className="inline-block bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full w-max">
                        {game.status}
                    </span>
                </div>
                ))}
            </div>
        </div>
    );
}