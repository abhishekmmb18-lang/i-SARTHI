import React, { useState } from 'react';
import { Users, Search, Phone, Droplet, Car, BellRing, Filter } from 'lucide-react';

export default function FleetDirectoryTab({ users = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [bloodFilter, setBloodFilter] = useState('ALL');

    const filteredUsers = users.filter((user) => {
        const name = user.name || user.full_name || 'Driver';
        const blood = user.blood_group || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlood = bloodFilter === 'ALL' || blood.toLowerCase().includes(bloodFilter.toLowerCase());
        return matchesSearch && matchesBlood;
    });

    const handlePingPilot = (name, phone) => {
        alert(`📡 Emergency beacon sent to ${name} (${phone}).`);
    };

    return (
        <div className="space-y-6">
            {/* Header & Search Bar */}
            <div className="glass-panel p-5 rounded-2xl border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold font-cyber text-white">
                        Fleet Directory & Registered Drivers
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Active drivers, emergency contacts, and vehicle profiles.
                    </p>
                </div>

                {/* Search & Filter Inputs */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-56">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search Driver..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 transition"
                        />
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            value={bloodFilter}
                            onChange={(e) => setBloodFilter(e.target.value)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="ALL">All Blood Types</option>
                            <option value="O+">O+</option>
                            <option value="A+">A+</option>
                            <option value="B+">B+</option>
                            <option value="AB+">AB+</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid of Pilot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => {
                    const name = user.name || user.full_name || 'Driver';
                    const phone = user.emergency_contact || '+91 93458 41121';

                    return (
                        <div
                            key={user.id}
                            className="glass-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col justify-between hover:border-cyan-400/60 transition"
                        >
                            <div>
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold font-cyber text-base">
                                            {name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-cyber font-bold text-white">
                                                {name}
                                            </h3>
                                            <div className="text-xs font-mono text-cyan-400 flex items-center gap-1 mt-0.5">
                                                <Car className="w-3.5 h-3.5" />
                                                <span>Driver ID #{user.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-xs font-mono mb-4">
                                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                                        <span className="text-slate-400 flex items-center gap-1">
                                            <Droplet className="w-3.5 h-3.5 text-red-400" />
                                            Blood Group:
                                        </span>
                                        <span className="text-red-300 font-bold">{user.blood_group || 'O+'}</span>
                                    </div>

                                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                                        <span className="text-slate-400 flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                            Emergency Contact:
                                        </span>
                                        <span className="text-emerald-300 font-semibold">{phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handlePingPilot(name, phone)}
                                className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-cyber font-bold text-xs border border-cyan-500/40 transition active:scale-95"
                            >
                                <BellRing className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Ping Emergency Contact</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
