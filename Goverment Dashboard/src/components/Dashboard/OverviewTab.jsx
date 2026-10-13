import React from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    AlertOctagon,
    EyeOff,
    Cpu,
    ArrowRight,
    MapPin,
    TrendingUp,
    FileText,
    Shield,
    Flame,
    Zap,
    ExternalLink
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export default function OverviewTab({
    telemetryData,
    loading,
    isStale,
    lastSyncTime,
    onNavigateTab,
    onSelectIncident,
    onSelectCluster
}) {
    const isDemoData = telemetryData.source === 'DEMO_DATA';
    const roadEvents = telemetryData.roadEvents || [];
    const clusters = telemetryData.clusters || [];
    const drowsiness = telemetryData.drowsinessBundles || [];
    const devices = telemetryData.devices || [];

    // Calculate real KPI values from data
    const totalHazards = roadEvents.length;
    const pendingPotholes = roadEvents.filter(e =>
        ((e.type || '').toLowerCase().includes('pothole') || (e.vibration > 2.5)) &&
        (e.verification_status?.includes('Pending') || !e.verification_status)
    ).length;
    const verifiedHazards = roadEvents.filter(e =>
        e.verification_status?.includes('Verified') || e.verification_status?.includes('Resolved')
    ).length;
    const criticalSegments = clusters.filter(c => c.ai_severity_score >= 8.0).length;
    const safetyAlerts = drowsiness.length + roadEvents.filter(e => (e.type || '').includes('SOS') || e.alcohol > 0).length;
    const onlineDevices = devices.filter(d => d.computed_status === 'Online').length;
    const connectedDevices = onlineDevices;
    const totalDevices = devices.length;

    const timeSinceUpdate = (date) => {
        if (!date) return 'Updating...';
        const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (sec < 5) return 'Just now';
        if (sec < 60) return `${sec}s ago`;
        return `${Math.floor(sec / 60)}m ago`;
    };

    // Filter top urgent incidents for immediate attention
    const urgentIncidents = roadEvents
        .filter(e => e.severity === 'Critical' || (e.vibration > 4.2) || (e.type || '').includes('SOS'))
        .slice(0, 5);

    // Corridor summary statistics dynamically calculated from real sensor data
    const getCorridorSeverity = (count) => {
        if (count === 0) return 'Clear';
        if (count >= 10) return 'Critical';
        if (count >= 5) return 'High';
        return 'Moderate';
    };

    const nh44Count = roadEvents.filter(e => (e.road_name || '').includes('NH-44')).length;
    const nh48Count = roadEvents.filter(e => (e.road_name || '').includes('NH-48')).length;
    const ah43Count = roadEvents.filter(e => (e.road_name || '').includes('AH-43')).length;
    const stateLinkCount = roadEvents.filter(e => !(e.road_name || '').includes('NH-') && !(e.road_name || '').includes('AH-')).length;

    const corridorStats = [
        { name: 'NH-44 (Delhi - Jaipur Expressway)', count: nh44Count, severity: getCorridorSeverity(nh44Count) },
        { name: 'NH-48 (Mumbai - Pune Corridor)', count: nh48Count, severity: getCorridorSeverity(nh48Count) },
        { name: 'AH-43 (Bengaluru Outer Ring Road)', count: ah43Count, severity: getCorridorSeverity(ah43Count) },
        { name: 'State Highway & Urban Links', count: stateLinkCount, severity: getCorridorSeverity(stateLinkCount) }
    ];

    return (
        <div className="space-y-6">

            {/* Title & Overview Banner */}
            <div className="gov-card p-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white border-blue-950">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-200 tracking-wider uppercase">
                            <span>National Highways & PWD Central Command</span>
                            <span>•</span>
                            <span>Connected Vehicle AI Telemetry</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                            iSARTHI National Road Intelligence & Monitoring Portal
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                            Real-time road-condition intelligence and vehicle-based safety monitoring. Automated pothole detection, crowd-verified road hazards, and edge AI telemetry collected from in-vehicle hardware units.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                        <button
                            onClick={() => onNavigateTab('map')}
                            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                        >
                            <MapPin className="w-4 h-4" />
                            <span>Launch Live Map</span>
                        </button>
                        <button
                            onClick={() => onNavigateTab('reports')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Executive Reports</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 6 Mandatory KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                {/* 1. Total Road Hazards Detected */}
                <div
                    onClick={() => onNavigateTab('incidents')}
                    className="gov-card-interactive p-4.5 flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Total Road Hazards</span>
                            <AlertTriangle className="w-4 h-4 text-slate-700" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mt-2">
                            {loading ? <span className="animate-pulse text-slate-400">...</span> : totalHazards}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Cumulative road defects recorded
                        </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {timeSinceUpdate(lastSyncTime)}
                        </span>
                        <span className="text-blue-700 font-semibold flex items-center">
                            View <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                    </div>
                </div>

                {/* 2. Potholes Pending Verification */}
                <div
                    onClick={() => onNavigateTab('incidents')}
                    className="gov-card-interactive p-4.5 flex flex-col justify-between border-amber-200 bg-amber-50/20"
                >
                    <div>
                        <div className="flex items-center justify-between text-xs font-medium text-amber-800">
                            <span>Pending Verification</span>
                            <Clock className="w-4 h-4 text-amber-700" />
                        </div>
                        <div className="text-2xl font-bold text-amber-800 mt-2">
                            {loading ? <span className="animate-pulse text-slate-400">...</span> : pendingPotholes}
                        </div>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                            Awaiting 10 vehicle passes or official inspection
                        </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-[11px]">
                        <span className="text-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {timeSinceUpdate(lastSyncTime)}
                        </span>
                        <span className="text-amber-800 font-semibold flex items-center">
                            Verify <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                    </div>
                </div>

                {/* 3. Verified Road Hazards */}
                <div
                    onClick={() => onNavigateTab('clusters')}
                    className="gov-card-interactive p-4.5 flex flex-col justify-between border-emerald-200 bg-emerald-50/20"
                >
                    <div>
                        <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
                            <span>Verified Hazards</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-800 mt-2">
                            {loading ? <span className="animate-pulse text-slate-400">...</span> : verifiedHazards}
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                            10x crowd-verified or confirmed by PWD
                        </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {timeSinceUpdate(lastSyncTime)}
                        </span>
                        <span className="text-emerald-800 font-semibold flex items-center">
                            Inspect <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                    </div>
                </div>

                {/* 4. Critical Road Segments */}
                <div
                    onClick={() => onNavigateTab('clusters')}
                    className="gov-card-interactive p-4.5 flex flex-col justify-between border-rose-200 bg-rose-50/20"
                >
                    <div>
                        <div className="flex items-center justify-between text-xs font-medium text-rose-800">
                            <span>Critical Segments</span>
                            <AlertOctagon className="w-4 h-4 text-rose-700" />
                        </div>
                        <div className="text-2xl font-bold text-rose-800 mt-2">
                            {loading ? <span className="animate-pulse text-slate-400">...</span> : criticalSegments}
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                            Severity &gt;= 8.0 / Peak Shock &gt; 4.5G
                        </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center justify-between text-[11px]">
                        <span className="text-rose-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-rose-600" />
                            {timeSinceUpdate(lastSyncTime)}
                        </span>
                        <span className="text-rose-800 font-semibold flex items-center">
                            Orders <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                    </div>
                </div>

                {/* 5. Driver-Safety Alerts */}
                <div
                    onClick={() => onNavigateTab('safety')}
                    className="gov-card-interactive p-4.5 flex flex-col justify-between border-blue-200 bg-blue-50/20"
                >
                    <div>
                        <div className="flex items-center justify-between text-xs font-medium text-blue-900">
                            <span>Driver-Safety Alerts</span>
                            <EyeOff className="w-4 h-4 text-blue-800" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mt-2">
                            {loading ? <span className="animate-pulse text-slate-400">...</span> : safetyAlerts}
                        </div>
                        <p className="text-[11px] text-blue-800 mt-0.5">
                            Fatigue 5x, alcohol, and SOS distress
                        </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between text-[11px]">
                        <span className="text-blue-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            {timeSinceUpdate(lastSyncTime)}
                        </span>
                        <span className="text-blue-900 font-semibold flex items-center">
                            Safety <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                    </div>
                </div>

                {/* 6. Connected Hardware Devices */}
                <div
                    onClick={() => onNavigateTab('devices')}
                    className="gov-card-interactive p-4.5 flex flex-col justify-between border-teal-200 bg-teal-50/20"
                >
                    <div>
                        <div className="flex items-center justify-between text-xs font-medium text-teal-900">
                            <span>Connected Devices</span>
                            <Cpu className="w-4 h-4 text-teal-700" />
                        </div>
                        <div className="text-2xl font-bold text-teal-900 mt-2">
                            {loading ? (
                                <span className="animate-pulse text-slate-400">...</span>
                            ) : (
                                <span>{onlineDevices} <span className="text-xs font-normal text-slate-500">/ {totalDevices}</span></span>
                            )}
                        </div>
                        <p className="text-[11px] text-teal-800 mt-0.5">
                            Raspberry Pi 5, Jetson &amp; ESP32 nodes
                        </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-teal-100 flex items-center justify-between text-[11px]">
                        <span className="text-teal-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-teal-600" />
                            {timeSinceUpdate(lastSyncTime)}
                        </span>
                        <span className="text-teal-900 font-semibold flex items-center">
                            Fleet <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                    </div>
                </div>

            </div>

            {/* Two Column Layout: Urgent Priority Incidents & Highway Corridor Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left (2 cols): High Priority Road Hazards Needing Action */}
                <div className="lg:col-span-2 gov-card p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                            <Flame className="w-5 h-5 text-rose-600" />
                            <h3 className="text-base font-bold text-slate-900">
                                High-Priority Road Incidents & Urgent Alerts
                            </h3>
                        </div>
                        <button
                            onClick={() => onNavigateTab('incidents')}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                        >
                            <span>View All ({roadEvents.length})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {urgentIncidents.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
                                <div className="text-xs font-semibold text-slate-700">
                                    📡 कोई सक्रिय खतरा नहीं (Awaiting Hardware Sensor Telemetry)
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    समस्त पिछला डेमो डेटा हटा दिया गया है। जैसे ही वाहन सेंसर से टेलीमेट्री आएगी, वह यहां स्वतः दिखाई देगी।
                                </div>
                            </div>
                        ) : (
                            urgentIncidents.map((incident) => {
                            const isSOS = (incident.type || '').includes('SOS') || incident.sos_alert;
                            return (
                                <div
                                    key={incident.id}
                                    onClick={() => onSelectIncident(incident)}
                                    className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-lg shrink-0 ${isSOS ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {isSOS ? <Flame className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-sm text-slate-900">
                                                    #{incident.id} • {incident.type}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${incident.severity === 'Critical' ? 'badge-critical' : 'badge-warning'
                                                    }`}>
                                                    {incident.severity}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    GPS: {Number(incident.latitude || 0).toFixed(4)}°, {Number(incident.longitude || 0).toFixed(4)}°
                                                </span>
                                            </div>

                                            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                                                <span className="flex items-center gap-1 font-semibold text-blue-950 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-200">
                                                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                                                    <span>{formatDateTime(incident.created_at || incident.timestamp)}</span>
                                                </span>
                                                <span className="flex items-center gap-1 font-medium text-slate-700">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {incident.road_name}
                                                </span>
                                                {incident.vibration > 0 && (
                                                    <span className="font-semibold text-rose-700">
                                                        Peak Shock: {incident.vibration} G
                                                    </span>
                                                )}
                                                <span className="text-slate-400">
                                                    Device: {incident.device_id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${incident.verification_status?.includes('Verified') ? 'badge-verified' : 'badge-warning'
                                            }`}>
                                            {incident.verification_status}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectIncident(incident);
                                            }}
                                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 cursor-pointer"
                                        >
                                            Inspect
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    </div>
                </div>

                {/* Right (1 col): Highway Corridor Condition Summary & Quick Actions */}
                <div className="space-y-6">

                    {/* Corridor Condition Index */}
                    <div className="gov-card p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-700" />
                                Highway Corridor Monitoring
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {corridorStats.map((corridor, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                        <span>{corridor.name}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                            corridor.count === 0 ? 'bg-emerald-100 text-emerald-800' :
                                            corridor.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                                            corridor.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {corridor.severity}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                                        <span>Detections Logged</span>
                                        <span className="font-semibold text-slate-700">{corridor.count} Records</span>
                                    </div>
                                    {/* Progress bar indicator */}
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                corridor.count === 0 ? 'bg-emerald-500' :
                                                corridor.severity === 'Critical' ? 'bg-rose-600' :
                                                corridor.severity === 'High' ? 'bg-amber-500' :
                                                'bg-blue-600'
                                            }`}
                                            style={{ width: corridor.count === 0 ? '0%' : `${Math.min(100, Math.max(15, corridor.count * 10))}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access Card */}
                    <div className="gov-card p-5 space-y-3 bg-slate-900 text-white border-slate-950">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-blue-400" />
                            Official Operational Workflows
                        </h4>
                        <p className="text-xs text-slate-300">
                            Authorised officials can review 10x verified pothole clusters, issue civil engineering repair orders, and simulate hardware telemetry ingestion.
                        </p>
                        <div className="pt-2 flex flex-col gap-2">
                            <button
                                onClick={() => onNavigateTab('clusters')}
                                className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-between cursor-pointer transition"
                            >
                                <span>Generate AI Civil Work Orders</span>
                                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button
                                onClick={() => onNavigateTab('devices')}
                                className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-between cursor-pointer transition"
                            >
                                <span>Hardware Test Ingestion Console</span>
                                <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                            </button>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
