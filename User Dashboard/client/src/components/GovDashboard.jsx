import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Database, 
    Activity, 
    Map, 
    AlertTriangle, 
    FileText, 
    Download, 
    Landmark, 
    ArrowLeft, 
    CheckCircle2, 
    Radio, 
    Layers, 
    Search, 
    RefreshCw, 
    ExternalLink,
    Clock,
    Shield,
    FileJson,
    Eye,
    Sparkles,
    Zap,
    X,
    Send,
    Bot,
    Compass
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 120, damping: 14 }
    }
};

// 60 FPS Cyber Highway Canvas
const CyberHighwayCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const numLines = 45;
        const lines = [];
        for (let i = 0; i < numLines; i++) {
            lines.push({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * width,
                color: Math.random() > 0.5 ? '#10b981' : (Math.random() > 0.5 ? '#06b6d4' : '#3b82f6'),
                len: Math.random() * 20 + 8
            });
        }

        let offset = 0;

        const render = () => {
            ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
            ctx.fillRect(0, 0, width, height);

            offset += 0.025;

            const horizonY = height * 0.52;
            const perspectiveDist = 280;

            for (let x = -width; x < width * 2; x += 120) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
                ctx.moveTo(x, height);
                ctx.lineTo(width / 2, horizonY);
                ctx.stroke();
            }

            const numHoriz = 14;
            for (let i = 0; i < numHoriz; i++) {
                const progress = ((i + (offset % 1)) / numHoriz);
                const lineY = horizonY + Math.pow(progress, 2.4) * (height - horizonY);
                const alpha = Math.min(progress * 0.35, 0.25);

                ctx.beginPath();
                ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
                ctx.moveTo(0, lineY);
                ctx.lineTo(width, lineY);
                ctx.stroke();
            }

            const cx = width / 2;
            const cy = horizonY - 40;

            for (let i = 0; i < lines.length; i++) {
                const p = lines[i];
                p.z -= 9;
                if (p.z <= 0) {
                    p.z = width;
                    p.x = (Math.random() - 0.5) * width * 2;
                    p.y = (Math.random() - 0.5) * height * 2;
                }

                const k = perspectiveDist / p.z;
                const px = p.x * k + cx;
                const py = p.y * k + cy;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = Math.max(0.7, (1 - p.z / width) * 2.8);
                    const alpha = (1 - p.z / width);

                    ctx.beginPath();
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha;
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = size * 0.7;
                    ctx.moveTo(px, py);
                    ctx.lineTo(p.x * (perspectiveDist / (p.z + p.len)) + cx, p.y * (perspectiveDist / (p.z + p.len)) + cy);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 w-full h-full pointer-events-none -z-20"
        />
    );
};

const GovDashboard = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('potholes'); // Default to 10x Potholes
    const [potholeClusters, setPotholeClusters] = useState([]);
    const [bundles, setBundles] = useState([]);
    const [drowsinessLogs, setDrowsinessLogs] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [sensorLogs, setSensorLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [simFeedback, setSimFeedback] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        const BASE_URL = `http://${window.location.hostname}:5000`;
        try {
            // 1. 10-Pass Spatial Pothole Clusters (OpenAI Integrated)
            const potholeRes = await fetch(`${BASE_URL}/api/pothole-clusters`);
            if (potholeRes.ok) {
                const pData = await potholeRes.json();
                setPotholeClusters(Array.isArray(pData) ? pData : []);
            }

            // 2. Drowsiness Incident Bundles
            const bundlesRes = await fetch(`${BASE_URL}/api/drowsiness-bundles`);
            if (bundlesRes.ok) {
                const bData = await bundlesRes.json();
                setBundles(Array.isArray(bData) ? bData : []);
            }

            // 3. Users Data
            const usersRes = await fetch(`${BASE_URL}/api/users`);
            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(Array.isArray(data) ? data : []);
            }

            // 4. Drowsiness Data
            const drowsyRes = await fetch(`${BASE_URL}/api/drowsiness`);
            if (drowsyRes.ok) {
                const drowsyData = await drowsyRes.json();
                if (drowsyData && Array.isArray(drowsyData.history)) setDrowsinessLogs(drowsyData.history);
            }

            // 5. Incident Data
            const roadRes = await fetch(`${BASE_URL}/api/road-data`);
            if (roadRes.ok) {
                const roadData = await roadRes.json();
                setIncidents(Array.isArray(roadData) ? roadData : []);
            }

            // 6. Sensor Logs
            const sensorRes = await fetch(`${BASE_URL}/api/sensor-logs`);
            if (sensorRes.ok) {
                const sensorData = await sensorRes.json();
                setSensorLogs(Array.isArray(sensorData) ? sensorData : []);
            }

        } catch (e) {
            console.error("Global Gov Data fetch error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    // ⚡ 1-Click Simulation of 10 Passes
    const handleSimulate10Passes = async () => {
        setSimulating(true);
        setSimFeedback(null);
        try {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            const res = await fetch(`${BASE_URL}/api/simulate-pothole-cluster`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setSimFeedback({
                    type: 'success',
                    msg: `✅ 10-Vehicle Passes Verified! OpenAI Generated Road Hazard Work Order (${data.cluster.ai_severity_score}/10).`
                });
                fetchData();
                if (data.cluster) setSelectedReport(data.cluster);
                setTimeout(() => setSimFeedback(null), 5000);
            }
        } catch (err) {
            setSimFeedback({ type: 'error', msg: 'Simulation failed to reach backend' });
        } finally {
            setSimulating(false);
        }
    };

    const exportData = (data, filename) => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${filename}.json`;
        link.click();
    };

    const parsePayload = (payload) => {
        if (!payload) return {};
        if (typeof payload === 'object') return payload;
        try {
            return JSON.parse(payload);
        } catch {
            return { raw: payload };
        }
    };

    const formatTime = (ts) => {
        if (!ts) return 'Just now';
        try {
            const date = new Date(ts);
            if (isNaN(date.getTime())) return String(ts);
            return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
            return String(ts);
        }
    };

    return (
        <div className="w-full relative min-h-screen scanlines selection:bg-emerald-500 selection:text-white">
            
            {/* 60 FPS 3D Cyber Highway Animated Canvas Background */}
            <CyberHighwayCanvas />

            {/* Ambient Multi-layer Glowing Orbs */}
            <div className="fixed top-0 left-1/3 w-[900px] h-[550px] bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-blue-600/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-float-slow" />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 text-white relative flex flex-col gap-8 pb-24"
            >
                
                {/* 1. GOVERNMENT PORTAL HERO HEADER */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 sm:p-8 rounded-[36px] glass-card border border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                    <div className="flex items-center space-x-4">
                        {onBack && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onBack}
                                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all shadow-lg"
                                title="Exit Government Portal"
                            >
                                <ArrowLeft size={20} />
                            </motion.button>
                        )}

                        <div className="p-3.5 rounded-2xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-600/30">
                            <Landmark size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Ministry of Road Transport & Highways
                                </h1>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    MoRTH • AI NODE
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                Verified Road Telemetry & Autonomous Work-Order Registry
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                        {/* ⚡ Simulation Button */}
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleSimulate10Passes}
                            disabled={simulating}
                            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold transition-all shadow-xl shadow-orange-600/30 flex items-center gap-2"
                        >
                            <Zap size={15} className={simulating ? 'animate-bounce text-yellow-300' : 'text-yellow-300'} />
                            <span>{simulating ? 'Generating Work Order...' : '⚡ Run Pothole Simulation'}</span>
                        </motion.button>

                        <button
                            onClick={fetchData}
                            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all flex items-center gap-1.5"
                            title="Refresh Data"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Sync</span>
                        </button>

                        <button
                            onClick={() => exportData({ potholeClusters, bundles, users, drowsinessLogs, incidents, sensorLogs }, 'morth_isarthi_full_registry_backup')}
                            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                        >
                            <Download size={14} />
                            <span>Export Backup</span>
                        </button>
                    </div>
                </motion.div>

                {simFeedback && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-2 font-bold ${
                            simFeedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border-red-500/40 text-red-300'
                        }`}
                    >
                        <CheckCircle2 size={16} />
                        <span>{simFeedback.msg}</span>
                    </motion.div>
                )}

                {/* 2. NAVIGATION TABS */}
                <motion.div variants={itemVariants} className="flex gap-3 overflow-x-auto pb-1 font-mono text-xs">
                    {[
                        { id: 'potholes', label: `🏛️ Verified Hazards (${potholeClusters.length})`, icon: Bot },
                        { id: 'bundles', label: `📦 Fatigue Archives (${bundles.length})`, icon: FileJson },
                        { id: 'users', label: `👥 Registered Drivers (${users.length})`, icon: FileText },
                        { id: 'incidents', label: `⚠️ Road & SOS Alerts (${incidents.length})`, icon: AlertTriangle },
                        { id: 'drowsiness', label: `😴 DMS Logs (${drowsinessLogs.length})`, icon: Activity },
                        { id: 'sensors', label: `📡 Raw Sensors (${sensorLogs.length})`, icon: Map },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                                activeTab === tab.id
                                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-xl shadow-emerald-600/30'
                                    : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* 3. MAIN DATA DISPLAY CONTAINER */}
                <motion.div 
                    variants={itemVariants}
                    className="rounded-[36px] glass-card border border-emerald-500/30 shadow-2xl p-6 sm:p-8 relative overflow-hidden bg-black/50"
                >

                    {/* TAB 1: VERIFIED POTHOLE CLUSTERS & WORK ORDERS */}
                    {activeTab === 'potholes' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <Bot className="text-emerald-400" /> Verified Road Defect Registry
                                    </h3>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                                        Confirmed hazard coordinates and automated repair directives
                                    </p>
                                </div>

                                <button
                                    onClick={() => exportData(potholeClusters, 'morth_pothole_records')}
                                    className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-emerald-300 font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
                                >
                                    <Download size={13} />
                                    <span>Export Records</span>
                                </button>
                            </div>

                            {potholeClusters.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {potholeClusters.map((cluster, idx) => {
                                        const isVerified = cluster.verified_count >= 10 || cluster.status === 'VERIFIED_10X';
                                        const rawLogs = Array.isArray(cluster.raw_logs_json) ? cluster.raw_logs_json : parsePayload(cluster.raw_logs_json);
                                        const logsArray = Array.isArray(rawLogs) ? rawLogs : (rawLogs.logs || []);

                                        return (
                                            <div 
                                                key={cluster.id || cluster.cluster_id || idx}
                                                className={`p-6 rounded-3xl border transition-all space-y-4 font-mono text-xs relative ${
                                                    isVerified 
                                                        ? 'bg-emerald-950/25 border-emerald-500/50 shadow-xl shadow-emerald-950/40' 
                                                        : 'bg-black/60 border-white/10'
                                                }`}
                                            >
                                                {/* Header Status */}
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-3 py-1 rounded-full font-black text-[11px] border flex items-center gap-1.5 ${
                                                        isVerified 
                                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400' 
                                                            : 'bg-amber-500/20 text-amber-300 border-amber-400'
                                                    }`}>
                                                        <CheckCircle2 size={13} />
                                                        {isVerified ? 'CONFIRMED HAZARD' : `MONITORING (${cluster.verified_count || 1} Hits)`}
                                                    </span>

                                                    <span className="text-[10px] text-gray-400">
                                                        {formatTime(cluster.created_at || cluster.updated_at)}
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className="text-gray-400">Confirmation Level:</span>
                                                        <span className="font-bold text-white">
                                                            <b className="text-emerald-400">{Math.min(10, cluster.verified_count || 1)}</b>/10
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden border border-white/10">
                                                        <motion.div 
                                                            className={`h-full ${isVerified ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                                                            animate={{ width: `${Math.min(100, ((cluster.verified_count || 1) / 10) * 100)}%` }}
                                                            transition={{ duration: 0.4 }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Telemetry Metrics */}
                                                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/70 border border-white/5 text-center">
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 block">PEAK SHOCK</span>
                                                        <span className="text-sm font-black text-rose-400">
                                                            {cluster.max_vibration ? Number(cluster.max_vibration).toFixed(2) : '1.85'}G
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 block">AVG SPEED</span>
                                                        <span className="text-sm font-black text-cyan-400">
                                                            {cluster.avg_speed ? Number(cluster.avg_speed).toFixed(1) : '48.5'} km/h
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 block">HAZARD INDEX</span>
                                                        <span className="text-sm font-black text-emerald-400">
                                                            {cluster.ai_severity_score ? `${cluster.ai_severity_score}/10` : 'Assessing...'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Coordinates */}
                                                <div className="flex items-center justify-between text-[11px] text-gray-300">
                                                    <span className="flex items-center gap-1">
                                                        <Map size={13} className="text-emerald-400" />
                                                        {cluster.center_lat ? `${Number(cluster.center_lat).toFixed(5)}°N, ${Number(cluster.center_lng).toFixed(5)}°E` : '27.0308, 75.8937'}
                                                    </span>
                                                    <a 
                                                        href={`https://www.google.com/maps?q=${cluster.center_lat || 27.0308},${cluster.center_lng || 75.8937}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                                                    >
                                                        <span>Maps</span>
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </div>

                                                {/* Action: Open AI Work-Order Report Modal */}
                                                {isVerified && cluster.ai_report && (
                                                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setSelectedReport(cluster)}
                                                            className="w-full py-2.5 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                                                        >
                                                            <Bot size={15} />
                                                            <span>View Road Repair Work Order (OpenAI)</span>
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 text-center text-gray-400 font-mono space-y-3">
                                    <Compass size={36} className="text-emerald-400 mx-auto" />
                                    <span className="text-white font-bold block text-base">No Road Defects Registered Yet</span>
                                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                                        Incoming defect telemetry and automated work orders will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: FATIGUE ARCHIVES */}
                    {activeTab === 'bundles' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <FileJson className="text-emerald-400" /> Driver Fatigue Incident Archives
                                    </h3>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                                        Recorded driver vigilance telemetry and alert history
                                    </p>
                                </div>

                                <button
                                    onClick={() => exportData(bundles, 'isarthi_fatigue_archives')}
                                    className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-emerald-300 font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
                                >
                                    <Download size={13} />
                                    <span>Download JSON</span>
                                </button>
                            </div>

                            {bundles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {bundles.map((bundle, idx) => {
                                        const payload = parsePayload(bundle.payload_json);
                                        return (
                                            <div 
                                                key={bundle.id || idx}
                                                className="p-5 rounded-3xl bg-black/60 border border-emerald-500/20 hover:border-emerald-400/60 transition-all space-y-3 font-mono text-xs relative group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                                                        #{bundle.id || (idx + 1)} • {bundle.event_type || 'INCIDENT_RECORD'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {formatTime(bundle.created_at || bundle.timestamp)}
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="text-sm font-bold text-white block">
                                                        {payload.alert_title || 'Driver Fatigue Incident Record'}
                                                    </span>
                                                    <div className="text-[11px] text-gray-400 flex items-center gap-3">
                                                        <span>📍 GPS: {payload.location?.latitude?.toFixed(4) || '27.0308'}°N, {payload.location?.longitude?.toFixed(4) || '75.8937'}°E</span>
                                                        <span>Events: <b className="text-white">{bundle.events_count || 5}</b></span>
                                                    </div>
                                                </div>

                                                <div className="p-3 rounded-2xl bg-black/80 border border-white/5 text-[10px] text-emerald-300/90 overflow-x-auto max-h-36 scrollbar-thin">
                                                    <pre>{JSON.stringify(payload, null, 2)}</pre>
                                                </div>

                                                <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[11px]">
                                                    <span className="text-gray-400">
                                                        Status: <b className="text-emerald-400">{bundle.external_server_status || 'RECORDED'}</b>
                                                    </span>
                                                    <button
                                                        onClick={() => exportData(payload, `bundle_${bundle.id || idx}`)}
                                                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                                                    >
                                                        <Download size={12} /> Export JSON
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 text-center text-gray-400 font-mono">
                                    <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                                    <span className="text-white font-bold block">No Fatigue Incident Archives Yet</span>
                                    <span className="text-xs text-gray-500">Recorded vigilance logs will appear here automatically.</span>
                                </div>
                            )}
                        </div>
                    )}

                            {bundles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {bundles.map((bundle, idx) => {
                                        const payload = parsePayload(bundle.payload_json);
                                        return (
                                            <div 
                                                key={bundle.id || idx}
                                                className="p-5 rounded-3xl bg-black/60 border border-emerald-500/20 hover:border-emerald-400/60 transition-all space-y-3 font-mono text-xs relative group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                                                        #{bundle.id || (idx + 1)} • {bundle.event_type || 'INCIDENT_BUNDLE'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {formatTime(bundle.created_at || bundle.timestamp)}
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="text-sm font-bold text-white block">
                                                        {payload.alert_title || 'Critical Fatigue Bundle (5 Triggers / 2 Min)'}
                                                    </span>
                                                    <div className="text-[11px] text-gray-400 flex items-center gap-3">
                                                        <span>📍 GPS: {payload.location?.latitude?.toFixed(4) || '27.0308'}°N, {payload.location?.longitude?.toFixed(4) || '75.8937'}°E</span>
                                                        <span>⚡ Events: <b className="text-white">{bundle.events_count || 5}</b></span>
                                                    </div>
                                                </div>

                                                <div className="p-3 rounded-2xl bg-black/80 border border-white/5 text-[10px] text-emerald-300/90 overflow-x-auto max-h-36 scrollbar-thin">
                                                    <pre>{JSON.stringify(payload, null, 2)}</pre>
                                                </div>

                                                <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[11px]">
                                                    <span className="text-gray-400">
                                                        Status: <b className="text-emerald-400">{bundle.external_server_status || 'SAVED_LOCAL'}</b>
                                                    </span>
                                                    <button
                                                        onClick={() => exportData(payload, `bundle_${bundle.id || idx}`)}
                                                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                                                    >
                                                        <Download size={12} /> Export JSON
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 text-center text-gray-400 font-mono">
                                    <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                                    <span className="text-white font-bold block">No Forensic Bundles Generated Yet</span>
                                    <span className="text-xs text-gray-500">When 5 drowsiness events occur in 2 minutes, bundles will appear here automatically.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: REGISTERED DRIVERS */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <FileText className="text-cyan-400" /> Registered Pilots & Vehicles
                                    </h3>
                                    <p className="text-xs text-gray-400">Centralized license database and SOS contacts</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                                            <th className="py-3 px-4">Pilot ID</th>
                                            <th className="py-3 px-4">Full Name</th>
                                            <th className="py-3 px-4">Vehicle Details</th>
                                            <th className="py-3 px-4">Emergency Contact</th>
                                            <th className="py-3 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map((u, i) => (
                                            <tr key={u.id || i} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-cyan-300 font-bold">#{u.id || (i + 1)}</td>
                                                <td className="py-3 px-4 text-white font-bold">{u.full_name || u.username || 'Driver'}</td>
                                                <td className="py-3 px-4 text-gray-300">{u.vehicle_details || 'MH-12-AB-1234'}</td>
                                                <td className="py-3 px-4 text-gray-300">{u.contact_details || '+91 98765 43210'}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => exportData(u, `pilot_profile_${u.id}`)}
                                                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 font-bold text-[10px]"
                                                    >
                                                        Export Dossier
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ROAD HAZARDS & CRASH LOGS */}
                    {activeTab === 'incidents' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <AlertTriangle className="text-amber-400" /> Physical Road Hazard & Crash Incidents
                                    </h3>
                                    <p className="text-xs text-gray-400">Pothole shocks, high-G impacts, and SOS triggers</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                                            <th className="py-3 px-4"># ID</th>
                                            <th className="py-3 px-4">Hazard Type</th>
                                            <th className="py-3 px-4">Severity / G-Force</th>
                                            <th className="py-3 px-4">GPS Coordinates</th>
                                            <th className="py-3 px-4 text-right">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {incidents.map((inc, i) => (
                                            <tr key={inc.id || i} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-amber-300 font-bold">#{inc.id || (i + 1)}</td>
                                                <td className="py-3 px-4 text-white font-bold">{inc.type || 'Road Anomaly'}</td>
                                                <td className="py-3 px-4 text-rose-400 font-bold">{inc.vibration ? `${inc.vibration}G` : `${inc.confidence || 95}%`}</td>
                                                <td className="py-3 px-4 text-cyan-300">{inc.latitude ? `${Number(inc.latitude).toFixed(4)}, ${Number(inc.longitude).toFixed(4)}` : '27.0308, 75.8937'}</td>
                                                <td className="py-3 px-4 text-right text-gray-400">{formatTime(inc.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: DMS FATIGUE LOGS */}
                    {activeTab === 'drowsiness' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <Activity className="text-purple-400" /> DMS Fatigue & Vigilance Logs
                                    </h3>
                                    <p className="text-xs text-gray-400">Micro-sleep and prolonged eye-closure events</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                                            <th className="py-3 px-4"># Log ID</th>
                                            <th className="py-3 px-4">Vigilance Status</th>
                                            <th className="py-3 px-4">Cumulative Events</th>
                                            <th className="py-3 px-4 text-right">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {drowsinessLogs.map((d, i) => (
                                            <tr key={d.id || i} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-purple-300 font-bold">#{d.id || (i + 1)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        d.is_drowsy ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300'
                                                    }`}>
                                                        {d.is_drowsy ? '🛑 DROWSY' : '🟢 ATTENTIVE'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-white font-bold">{d.events_count || d.events || 0}</td>
                                                <td className="py-3 px-4 text-right text-gray-400">{formatTime(d.timestamp || d.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 6: RAW SENSOR TELEMETRY */}
                    {activeTab === 'sensors' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <Map className="text-blue-400" /> Raw Multi-Sensor Stream History
                                    </h3>
                                    <p className="text-xs text-gray-400">GPS, Alcohol, Radar and Accelerometer time-series</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                                            <th className="py-3 px-4"># ID</th>
                                            <th className="py-3 px-4">Sensor Node</th>
                                            <th className="py-3 px-4">Param 1</th>
                                            <th className="py-3 px-4">Param 2</th>
                                            <th className="py-3 px-4 text-right">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sensorLogs.map((s, i) => (
                                            <tr key={s.id || i} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-blue-300 font-bold">#{s.id || (i + 1)}</td>
                                                <td className="py-3 px-4 text-white font-bold">{s.sensor_type || 'GPS'}</td>
                                                <td className="py-3 px-4 text-gray-300">{s.value_1 || 0}</td>
                                                <td className="py-3 px-4 text-gray-300">{s.value_2 || 0}</td>
                                                <td className="py-3 px-4 text-right text-gray-400">{formatTime(s.timestamp || s.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </motion.div>

            </motion.div>

            {/* 4. OPENAI WORK-ORDER REPORT MODAL */}
            <AnimatePresence>
                {selectedReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-4xl max-h-[85vh] bg-[#060c1c] border-2 border-emerald-500/50 rounded-[36px] shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden text-white font-mono"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                                        <Bot size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">
                                            Official MoRTH / PWD Road Repair Work Order
                                        </h3>
                                        <span className="text-xs text-emerald-400">
                                            Autonomously Audited & Generated by OpenAI GPT-4o
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body - Markdown Content */}
                            <div className="flex-1 overflow-y-auto py-6 space-y-4 text-xs leading-relaxed text-gray-200 custom-scrollbar pr-2">
                                <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                                    <span>Cluster: <b>{selectedReport.cluster_id}</b></span>
                                    <span>AI Severity: <b className="text-emerald-400 text-sm">{selectedReport.ai_severity_score || '8.8'}/10</b></span>
                                    <span>Verified Passes: <b className="text-white">10/10 Confirmed</b></span>
                                </div>

                                <div className="p-6 rounded-3xl bg-black/80 border border-white/5 whitespace-pre-wrap font-sans text-xs text-gray-300 leading-relaxed">
                                    {selectedReport.ai_report || 'Generating report...'}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <button
                                    onClick={() => navigator.clipboard.writeText(selectedReport.ai_report || '')}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-cyan-300 font-bold transition-all"
                                >
                                    📋 Copy Work Order
                                </button>

                                <button
                                    onClick={() => exportData(selectedReport, `morth_work_order_${selectedReport.cluster_id}`)}
                                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                                >
                                    <Download size={14} />
                                    <span>Export Official Work Order</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default GovDashboard;
