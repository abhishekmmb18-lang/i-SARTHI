import React, { useState } from 'react';
import { Cpu, EyeOff, AlertOctagon, Code, ChevronDown, ChevronUp, UserX, CheckCircle, MapPin } from 'lucide-react';

export default function DrowsinessBundlesTab({ bundles = [] }) {
    const [expandedJson, setExpandedJson] = useState({});
    const [flaggedDrivers, setFlaggedDrivers] = useState({});

    const toggleJson = (id) => {
        setExpandedJson(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFlagDriver = (driverName, bundleId) => {
        setFlaggedDrivers(prev => ({ ...prev, [bundleId]: true }));
        alert(`⚠️ PILOT ${driverName} (Bundle #${bundleId}) HAS BEEN FLAGGED FOR MANDATORY MORTH SAFETY AUDIT & REFRESHER COURSE.`);
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="glass-panel p-5 rounded-2xl border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        <span>DIRECT SUPABASE DATABASE • 120S DRIVER FATIGUE CLUSTER PAYLOADS</span>
                    </div>
                    <h2 className="text-xl font-bold font-cyber text-white mt-1">
                        📦 5x Drowsiness & Critical Forensic Bundles
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                        Real-time multi-strike fatigue telemetry streamed directly from Supabase Cloud table `drowsiness_bundles`.
                    </p>
                </div>

                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-xs font-mono text-amber-300">
                    <AlertOctagon className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Live Supabase Records: <strong>{bundles.length} Bundles</strong></span>
                </div>
            </div>

            {/* List of 5x Drowsiness Bundles */}
            <div className="space-y-4">
                {bundles.map((bundle) => {
                    const payload = bundle.payload_json || {};
                    const isExpanded = expandedJson[bundle.id];
                    const isFlagged = flaggedDrivers[bundle.id];

                    const driverName = payload.driver_name || payload.driver_profile?.name || "Registered Pilot";
                    const vehicleReg = payload.vehicle_reg || payload.driver_profile?.system || "I-SARTHI Connected Vehicle";
                    const location = payload.location || {};
                    const telemetry = payload.telemetry || {};
                    const dms = telemetry.dms || {};

                    return (
                        <div
                            key={bundle.id}
                            className="glass-panel-gold p-5 rounded-2xl border-amber-500/30 transition duration-200"
                        >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

                                {/* Driver Telemetry Info */}
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                        <EyeOff className="w-7 h-7" />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-red-950 text-red-300 rounded border border-red-500/40">
                                                {bundle.event_type || 'CRITICAL_FATIGUE_CLUSTER_5X'}
                                            </span>
                                            <span className="text-xs font-mono text-slate-400">
                                                {new Date(bundle.created_at).toLocaleString()}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-cyber font-bold text-white mt-1">
                                            {driverName}
                                            <span className="text-cyan-400 text-sm font-mono ml-2">({vehicleReg})</span>
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono text-slate-300">
                                            <span>5x Events Window: <strong className="text-amber-300">{payload.window_duration_seconds || 120}s</strong></span>
                                            <span>•</span>
                                            <span>DMS State: <strong className="text-red-400 font-bold">{dms.isDrowsy ? 'DROWSINESS DETECTED' : 'CRITICAL'}</strong></span>
                                            {location.latitude && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 text-emerald-400">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {location.latitude}°, {location.longitude}°
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions & Buttons */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => handleFlagDriver(driverName, bundle.id)}
                                        disabled={isFlagged}
                                        className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition ${isFlagged
                                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                                : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50'
                                            }`}
                                    >
                                        {isFlagged ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <UserX className="w-4 h-4" />}
                                        <span>{isFlagged ? 'SAFETY AUDIT INITIATED 🟢' : 'FLAG PILOT FOR MORTH AUDIT'}</span>
                                    </button>

                                    <button
                                        onClick={() => toggleJson(bundle.id)}
                                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-xs border border-cyan-500/40 transition"
                                    >
                                        <Code className="w-4 h-4 text-cyan-400" />
                                        <span>{isExpanded ? 'HIDE JSON PAYLOAD' : 'INSPECT SUPABASE JSON PAYLOAD'}</span>
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Expandable JSON Inspector */}
                            {isExpanded && (
                                <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 overflow-x-auto text-xs font-mono text-cyan-300">
                                    <div className="flex items-center justify-between text-slate-400 mb-2 border-b border-slate-800 pb-2">
                                        <span>Supabase Table: `drowsiness_bundles` • Record ID #{bundle.id}</span>
                                        <span className="text-emerald-400 font-bold">LIVE SUPABASE RECORD ✓</span>
                                    </div>
                                    <pre className="text-emerald-400 leading-relaxed">
                                        {JSON.stringify(bundle, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
