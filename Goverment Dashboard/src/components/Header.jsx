import React, { useState, useMemo } from 'react';
import {
    Shield,
    RefreshCw,
    AlertCircle,
    Menu,
    Bell,
    Clock,
    AlertTriangle,
    X,
    MapPin
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

export default function Header({
    telemetryData,
    lastSyncTime,
    isStale,
    refreshing,
    onRefresh,
    currentRole,
    setCurrentRole,
    onBackToLanding,
    activeAuthority,
    onSwitchAuthority,
    isSidebarCollapsed,
    onToggleSidebar
}) {
    const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

    const activeAlerts = useMemo(() => {
        const list = [];
        (telemetryData?.roadEvents || []).forEach(e => {
            if (e.severity === 'Critical' || e.severity === 'High' || (e.vibration > 3.0)) {
                list.push({
                    id: `ALERT-${e.id}`,
                    title: e.type || 'सड़क गड्ढा / झटका (Road Defect)',
                    location: e.road_name || 'राजमार्ग कॉरिडोर',
                    severity: e.severity || 'High',
                    timestamp: e.created_at || e.timestamp,
                    vibration: e.vibration,
                    type: 'ROAD_HAZARD'
                });
            }
        });
        (telemetryData?.bundles || []).forEach(b => {
            list.push({
                id: `DMS-${b.id}`,
                title: b.event_type || 'गंभीर चालक थकान (Driver Fatigue DMS)',
                location: b.payload?.vehicle_reg || 'सेंसर वाहन',
                severity: 'Critical',
                timestamp: b.created_at || b.timestamp,
                type: 'DRIVER_FATIGUE'
            });
        });
        return list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    }, [telemetryData]);

    const formatSyncTime = (date) => {
        if (!date) return 'Initializing...';
        return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            {/* Top National Embellishment Bar */}
            <div className="bg-slate-900 text-white text-xs px-4 py-1.5 font-medium flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-semibold tracking-wide">Government of India</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300">Ministry of Road Transport & Highways (MoRTH) & National Highways Authority of India (NHAI)</span>
                </div>

                <div className="flex items-center space-x-3 text-slate-300">
                    <div className="flex items-center space-x-1.5">
                        <span>Active Role:</span>
                        <select
                            value={currentRole}
                            onChange={(e) => setCurrentRole(e.target.value)}
                            className="bg-slate-800 text-white font-medium text-xs rounded px-2 py-0.5 border border-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                        >
                            <option value="Administrator">Administrator (Full Access)</option>
                            <option value="State / District Official">State / District Official</option>
                            <option value="Field Inspector">Field Inspector</option>
                            <option value="Read-Only Viewer">Read-Only Viewer</option>
                        </select>
                    </div>

                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Portal Build v2.4 (National Release)</span>
                </div>
            </div>

            {/* Stale Data Warning Banner */}
            {isStale && (
                <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-2 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                            <strong>Stale Data Warning:</strong> Last successful synchronization was more than 30 seconds ago. Live telemetry updates may be paused or experiencing network latency.
                        </span>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="font-bold underline hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Force Reconnect</span>
                    </button>
                </div>
            )}

            {/* Main Title & Action Bar */}
            <div className="w-full px-4 py-3 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                    {/* Official Emblem & Portal Title */}
                    <div className="flex items-center space-x-3">
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                title={isSidebarCollapsed ? "साइडबार खोलें (Expand Sidebar)" : "साइडबार छुपाएं (Collapse Sidebar)"}
                                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                            >
                                <Menu className="w-4 h-4" />
                            </button>
                        )}

                        <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0 border border-blue-950">
                            <Shield className="w-6 h-6 text-white" />
                        </div>

                        <div>
                            <div className="flex items-center space-x-2 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                                    iSARTHI
                                </h1>
                                <span className="text-slate-300 font-light hidden sm:inline">|</span>
                                <span className="text-sm sm:text-base font-semibold text-blue-900 hidden sm:inline">
                                    National Road Intelligence & Monitoring Portal
                                </span>
                                {activeAuthority ? (
                                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${activeAuthority.badgeColor || 'bg-blue-900 text-white'}`}>
                                        {activeAuthority.selectedState
                                            ? `राज्य स्तर: ${activeAuthority.selectedState.nameHindi.split(' ')[0]}`
                                            : (activeAuthority.shortName || 'NHAI')}
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md">
                                        LIVE TELEMETRY
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600 mt-0.5">
                                {activeAuthority ? (
                                    <span className="font-semibold text-slate-800">
                                        {activeAuthority.selectedState
                                            ? `${activeAuthority.selectedState.departmentName}`
                                            : activeAuthority.nameHindi} &bull; <strong className="text-blue-950 font-hindi">{activeAuthority.officerName || activeAuthority.demoCredentials?.officerName || 'अधिकृत अधिकारी'}</strong>
                                    </span>
                                ) : (
                                    <span>Real-time road-condition intelligence and vehicle-based safety monitoring.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sync Status & Action Buttons */}
                    <div className="flex items-center space-x-2.5 shrink-0 self-end md:self-auto">
                        {/* Switch Authority Button */}
                        {onSwitchAuthority && (
                            <button
                                onClick={onSwitchAuthority}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                title="विभागीय पोर्टल या निकाय बदलें"
                            >
                                <span>प्राधिकरण बदलें</span>
                            </button>
                        )}

                        {/* Return to Portal Landing Page Button */}
                        {onBackToLanding && (
                            <button
                                onClick={onBackToLanding}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                title="ई-सारथी मुख्य पोर्टल पर लौटें"
                            >
                                <span>← मुख्य पोर्टल</span>
                            </button>
                        )}

                        <div className="text-right text-xs">
                            <div className="flex items-center space-x-1.5 justify-end">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                                    {telemetryData?.source === 'LIVE_SUPABASE' ? '⚡ Supabase Live Connected' : 'Cloud Gateway Active'}
                                </span>
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                                Last synced: {formatSyncTime(lastSyncTime)}
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                                title="सक्रिय अलर्ट देखें (View Active Alerts)"
                                className="relative p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                            >
                                <Bell className="w-4 h-4 text-slate-700" />
                                {activeAlerts.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold animate-pulse shadow-xs">
                                        {activeAlerts.length}
                                    </span>
                                )}
                            </button>

                            {/* Alerts Popover */}
                            {showAlertsDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                                    <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-amber-400" />
                                            <span className="font-bold text-xs">सक्रिय अलर्ट एवं समय (Active Alerts &amp; Time)</span>
                                        </div>
                                        <button
                                            onClick={() => setShowAlertsDropdown(false)}
                                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
                                        {activeAlerts.length === 0 ? (
                                            <div className="p-6 text-center text-xs text-slate-500">
                                                <div className="font-semibold text-slate-700 mb-1">📡 कोई नया अलर्ट नहीं (No Alerts)</div>
                                                <div>सेंसर से नया आघात या थकान डेटा प्राप्त होने पर यहाँ दिनांक व समय सहित प्रदर्शित होगा।</div>
                                            </div>
                                        ) : (
                                            activeAlerts.map(alert => (
                                                <div key={alert.id} className="pt-2.5 first:pt-0 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-xs text-slate-900">{alert.title}</span>
                                                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                                            alert.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {alert.severity}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span>{alert.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-900 border border-amber-200 w-fit">
                                                        <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                                                        <span>अलर्ट समय व दिनांक: <strong>{formatDateTime(alert.timestamp)}</strong></span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={onRefresh}
                            disabled={refreshing}
                            title="Refresh telemetry records"
                            className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                        >
                            <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}
