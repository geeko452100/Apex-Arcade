import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Home, Castle, Swords, HelpCircle, Puzzle, DollarSign } from 'lucide-react';

export default function SidebarLayout({ children }) {
    const location = useLocation();

    const menuItems = [
        { path: '/', name: 'Dashboard', icon: Home },
        { path: '/game/cards', name: 'Card Battler', icon: Swords },
        { path: '/game/idle', name: 'Idle Clicker', icon: DollarSign },
        { path: '/game/puzzle', name: 'Daily Wordle', icon: Puzzle },
    ];

    return (
        <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4 sticky top-0 h-screen">
                <div>
                    <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
                        <Gamepad2 className="w-8 h-8 text-indigo-500 animate-pulse" />
                        <span className="text-xl font-black tracking-wider text-white">APEX ARCADE</span>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                    
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indig-600/20'
                                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div> 

                <div className="px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                    <p className="text-xs text-slate-500 font-mono">System Status</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-xs text-emerald-400 font-medium">Core online</span>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main> 
        </div>
    );
}
                
