import React, { useState } from 'react';
import {
    EyeOff,
    AlertOctagon,
    Code,
    ChevronDown,
    ChevronUp,
    UserX,
    CheckCircle,
    MapPin,
    Shield,
    Clock,
    Search,
    Car,
    AlertTriangle
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export default function DriverSafetyTab({
    bundles = [],
    currentRole
}) {
    const [expandedJson, setExpandedJson] = useState({});
    const [flaggedDrivers, setFlaggedDrivers] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const isReadOnly = currentRole === 'Read-Only Viewer';

    const toggleJson = (id) => {
        setExpandedJson(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFlagDriver = (driverName, bundleId) => {
        if (isReadOnly) {
            alert('Your active role is Read-Only Viewer. Action permission denied.');
            return;
        }

        const confirmed = window.confirm(`Initiate mandatory MoRTH Safety Audit & Refresher Course for pilot: ${driverName} (Bundle #${bundleId})?`);
        if (confirmed) {
            setFlaggedDrivers(prev => ({ ...prev, [bundleId]: true }));
        }
    };

    const filtered = bundles.filter(b => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const payload = b.payload_json || {};
        const driverName = (payload.driver_name || payload.driver_profile?.name || '').toLowerCase();
        const vehicle = (payload.vehicle_reg || '').toLowerCase();
        return driverName.includes(q) || vehicle.includes(q) || String(b.id).includes(q);
    });

    return (
        <div className="space-y-6">

            {/* Header Banner */}
            <div className="gov-card p-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white border-blue-950">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-200 uppercase">
                            <EyeOff className="w-4 h-4 text-amber-400" />
                            <span>In-Cabin Driver Monitoring System (DMS) &amp; Fatigue Telemetry</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                            Driver Safety &amp; Critical Fatigue Incidents
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                            Camera-based AI algorithms on the edge hardware (Raspberry Pi 5 / Jetson) detect driver microsleeps, prolonged eye closure, and inattention. When 5 consecutive drowsiness events occur within a 120-second rolling window, a critical safety incident bundle is dispatched to the central portal.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 bg-blue-950/60 p-3 rounded-xl border border-blue-800 shrink-0 text-xs">
                        <div>
                            <div className="text-blue-300 font-medium">Logged Fatigue Bundles</div>
                            <div className="text-xl font-bold text-white mt-0.5">{bundles.length} Incidents</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Input */}
            <div className="gov-card p-4 flex items-center justify-between text-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search Driver Name, Vehicle Number, or Bundle ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600"
                    />
                </div>
            </div>

            {/* List of Bundles */}
            {filtered.length === 0 ? (
                <div className="gov-card p-12 text-center border-dashed border-2 border-slate-200 bg-white">
                    <EyeOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800 font-hindi">
                        📡 कोई थकान / अल्कोहल घटना दर्ज नहीं (Awaiting Driver DMS Sensor Telemetry)
                    </h3>
                    <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
                        समस्त पिछला डेमो डेटा हटा दिया गया है। जैसे ही वाहन में स्थापित DMS कैमरा AI या MQ-3 अल्कोहल सेंसर से वास्तविक टेलीमेट्री आएगी, वह यहां स्वतः लाइव प्रदर्शित होगी।
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((bundle) => {
                        const payload = bundle.payload_json || {};
                        const isExpanded = expandedJson[bundle.id];
                    const isFlagged = flaggedDrivers[bundle.id];

                    const driverName = payload.driver_name || payload.driver_profile?.name || "Registered Pilot";
                    const vehicleReg = payload.vehicle_reg || payload.driver_profile?.system || "iSARTHI Monitored Vehicle";
                    const location = payload.location || {};
                    const telemetry = payload.telemetry || {};
                    const dms = telemetry.dms || {};

                    return (
                        <div
                            key={bundle.id}
                            className="gov-card p-5 border-amber-200/80 bg-white hover:border-amber-300 transition"
                        >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

                                {/* Incident Info */}
                                <div className="flex items-start space-x-3.5">
                                    <div className="p-3 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                                        <EyeOff className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded badge-critical">
                                                {bundle.event_type || 'CRITICAL_FATIGUE_CLUSTER_5X'}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200">
                                                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <span>अलर्ट समय व दिनांक: {formatDateTime(bundle.created_at || bundle.timestamp)}</span>
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                                            <span>{driverName}</span>
                                            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {vehicleReg}
                                            </span>
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                                            <span>5-Event Window: <strong className="text-slate-800">{payload.window_duration_seconds || 120}s</strong></span>
                                            <span>•</span>
                                            <span>DMS Detection: <strong className="text-rose-700 font-semibold">{dms.isDrowsy ? 'Drowsiness Confirmed' : 'Microsleep Event'}</strong></span>
                                            {location.latitude && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 text-slate-600 font-mono">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        {location.latitude}°, {location.longitude}°
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleFlagDriver(driverName, bundle.id)}
                                        disabled={isFlagged}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${isFlagged
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                : 'bg-rose-700 hover:bg-rose-800 text-white'
                                            }`}
                                    >
                                        {isFlagged ? (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                                <span>Audit Initiated ✓</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserX className="w-3.5 h-3.5" />
                                                <span>Flag for Safety Audit</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => toggleJson(bundle.id)}
                                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <Code className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{isExpanded ? 'Hide Payload' : 'Inspect JSON Payload'}</span>
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Expandable JSON Payload Inspector */}
                            {isExpanded && (
                                <div className="mt-4 p-4 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto">
                                    <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800">
                                        <span>Record ID #{bundle.id} • Supabase Table: `drowsiness_bundles`</span>
                                        <span className="text-emerald-400 font-bold">STRUCTURED EDGE AI EVENT</span>
                                    </div>
                                    <pre className="text-emerald-300 leading-relaxed">
                                        {JSON.stringify(bundle, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}

        </div>
    );
}
