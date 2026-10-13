import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Radio, Flame, Check, MapPin } from 'lucide-react';

export default function RoadEventsLedgerTab({ events = [] }) {
    const [filterType, setFilterType] = useState('ALL');
    const [acknowledged, setAcknowledged] = useState({});

    const filteredEvents = events.filter((evt) => {
        if (filterType === 'ALL') return true;
        const typeUpper = (evt.type || '').toUpperCase();
        if (filterType === 'SOS') return typeUpper.includes('SOS') || evt.sos_alert;
        if (filterType === 'Alcohol') return typeUpper.includes('ALCOHOL') || (evt.alcohol > 0);
        if (filterType === 'Pothole') return typeUpper.includes('POTHOLE');
        if (filterType === 'Vibration') return typeUpper.includes('VIBRATION') || (evt.vibration > 0);
        return true;
    });

    const handleAcknowledge = (id) => {
        setAcknowledged(prev => ({ ...prev, [id]: true }));
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="glass-panel p-5 rounded-2xl border-red-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-xs font-mono text-red-400">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>DIRECT SUPABASE DATABASE `road_events` TELEMETRY TABLE</span>
                    </div>
                    <h2 className="text-xl font-bold font-cyber text-white mt-1">
                        ⚠️ Real-Time Road Hazard & Emergency SOS Ledger
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                        Live hazard ledger stream from Supabase Cloud table `road_events` ({events.length} Live Database Records).
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {['ALL', 'SOS', 'Alcohol', 'Vibration', 'Pothole'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${filterType === type
                                    ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Table / Feed */}
            <div className="space-y-3">
                {filteredEvents.slice(0, 50).map((evt) => {
                    const typeStr = evt.type || (evt.sos_alert ? 'SOS' : 'Road Event');
                    const isSOS = typeStr.toUpperCase().includes('SOS') || evt.sos_alert;
                    const isAlcohol = typeStr.toUpperCase().includes('ALCOHOL') || (evt.alcohol > 0);
                    const isAcked = acknowledged[evt.id];

                    return (
                        <div
                            key={evt.id}
                            className={`p-4 rounded-2xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isSOS
                                    ? 'glass-panel-red border-red-500/60 neon-glow-red'
                                    : isAlcohol
                                        ? 'glass-panel-gold border-amber-500/50'
                                        : 'glass-panel border-emerald-500/30'
                                }`}
                        >
                            {/* Event Info */}
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-2xl border ${isSOS
                                        ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-bounce'
                                        : isAlcohol
                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                    }`}>
                                    {isSOS ? <Flame className="w-6 h-6" /> : isAlcohol ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded border ${isSOS
                                                ? 'bg-red-950 text-red-300 border-red-500/50'
                                                : isAlcohol
                                                    ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                                            }`}>
                                            RECORD #{evt.id} • {typeStr}
                                        </span>

                                        <span className="text-xs font-mono text-cyan-400 font-bold">
                                            Confidence: {evt.confidence || 100}%
                                        </span>

                                        <span className="text-xs font-mono text-slate-400">
                                            {evt.created_at ? new Date(evt.created_at).toLocaleString() : 'Live'}
                                        </span>
                                    </div>

                                    <p className="text-sm font-cyber font-bold text-white mt-1">
                                        {isSOS ? 'CRITICAL PILOT EMERGENCY DISTRESS SIGNAL TRIGGERED' : isAlcohol ? `MQ-3 SENSOR: ALCOHOL DETECTED (${evt.alcohol} PPM)` : `Road Event #${evt.id} - ${typeStr}`}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-1">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                            Lat: {evt.latitude?.toFixed(5) || 0}°, Lng: {evt.longitude?.toFixed(5) || 0}°
                                        </span>
                                        {evt.vibration > 0 && <span className="text-amber-300 font-bold">Vibration: {evt.vibration} G</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleAcknowledge(evt.id)}
                                disabled={isAcked}
                                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-1.5 shrink-0 ${isAcked
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 active:scale-95'
                                    }`}
                            >
                                {isAcked ? <Check className="w-4 h-4 text-emerald-400" /> : <Radio className="w-4 h-4 text-red-400" />}
                                <span>{isAcked ? 'POLICE ALERT SENT 🟢' : 'ACKNOWLEDGE & ALERT POLICE'}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
