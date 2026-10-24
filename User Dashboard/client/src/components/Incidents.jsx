import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, 
    MapPin, 
    Clock, 
    ShieldAlert, 
    Activity, 
    Moon, 
    Beer, 
    ExternalLink, 
    CheckCircle2, 
    Filter, 
    Sparkles, 
    Radio, 
    Eye, 
    Flame,
    Zap,
    Layers,
    FileText
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.96 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 130, damping: 14 }
    }
};

// 60 FPS Cyber Highway Background
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
                color: Math.random() > 0.5 ? '#ef4444' : (Math.random() > 0.5 ? '#8b5cf6' : '#f59e0b'),
                len: Math.random() * 20 + 8
            });
        }

        let offset = 0;

        const render = () => {
            ctx.fillStyle = 'rgba(5, 8, 22, 0.25)';
            ctx.fillRect(0, 0, width, height);

            offset += 0.025;

            const horizonY = height * 0.52;
            const perspectiveDist = 280;

            for (let x = -width; x < width * 2; x += 120) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
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
                ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
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

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const BASE_URL = `http://${window.location.hostname}:5000`;
                const res = await fetch(`${BASE_URL}/api/road-data`);
                if (res.ok) {
                    const data = await res.json();
                    setIncidents(Array.isArray(data) ? data : []);
                } else {
                    setIncidents([]);
                }
            } catch (e) {
                console.error("Failed to fetch incidents", e);
            }
        };

        fetchIncidents();
        const interval = setInterval(fetchIncidents, 2000);
        return () => clearInterval(interval);
    }, []);

    // Robust Date & Relative Time Parser with UTC/Local Normalization
    const parseIncidentDate = (ts) => {
        if (!ts) return new Date();
        if (ts instanceof Date) return ts;
        if (typeof ts === 'number') return new Date(ts);
        let s = String(ts).trim();
        if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(s)) {
            s = s.replace(' ', 'T') + 'Z';
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
            s = s + 'Z';
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const formatIncidentTime = (ts) => {
        if (!ts) return 'Just now';
        try {
            const date = parseIncidentDate(ts);
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
            return 'Just now';
        }
    };

    const getRelativeTime = (ts) => {
        if (!ts) return 'Just now';
        try {
            const date = parseIncidentDate(ts);
            const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
            if (diffMins <= 0) return 'Just now (<1m ago)';
            if (diffMins === 1) return '1 min ago';
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            return `${diffHours}h ${diffMins % 60}m ago`;
        } catch {
            return 'Just now';
        }
    };

    const getIncidentStyle = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('sos') || t.includes('crash')) {
            return {
                cardBorder: 'border-red-500/60 bg-red-950/30 hover:border-red-400 shadow-red-600/20',
                badge: 'bg-red-500/30 text-red-300 border-red-500',
                iconBox: 'bg-red-500/20 text-red-400 border-red-500/40',
                glowDot: 'bg-red-400',
                icon: <ShieldAlert size={22} className="animate-pulse" />
            };
        }
        if (t.includes('alcohol')) {
            return {
                cardBorder: 'border-purple-500/60 bg-purple-950/30 hover:border-purple-400 shadow-purple-600/20',
                badge: 'bg-purple-500/30 text-purple-300 border-purple-500',
                iconBox: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
                glowDot: 'bg-purple-400',
                icon: <Beer size={22} />
            };
        }
        if (t.includes('drowsiness') || t.includes('drowsy') || t.includes('fatigue')) {
            return {
                cardBorder: 'border-orange-500/60 bg-orange-950/30 hover:border-orange-400 shadow-orange-600/20',
                badge: 'bg-orange-500/30 text-orange-300 border-orange-500',
                iconBox: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
                glowDot: 'bg-orange-400',
                icon: <Eye size={22} />
            };
        }
        if (t.includes('pothole') || t.includes('bump')) {
            return {
                cardBorder: 'border-amber-500/60 bg-amber-950/30 hover:border-amber-400 shadow-amber-600/20',
                badge: 'bg-amber-500/30 text-amber-300 border-amber-500',
                iconBox: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
                glowDot: 'bg-amber-400',
                icon: <AlertTriangle size={22} />
            };
        }
        return {
            cardBorder: 'border-cyan-500/50 bg-cyan-950/20 hover:border-cyan-400 shadow-cyan-600/20',
            badge: 'bg-cyan-500/30 text-cyan-300 border-cyan-500',
            iconBox: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
            glowDot: 'bg-cyan-400',
            icon: <Activity size={22} />
        };
    };

    // Filter Incidents
    const filteredIncidents = incidents.filter(item => {
        if (!item || !item.type) return false;
        const t = item.type.toLowerCase();
        if (filter === 'sos') return t.includes('sos') || t.includes('crash');
        if (filter === 'drowsiness') return t.includes('drowsiness') || t.includes('drowsy') || t.includes('fatigue');
        if (filter === 'alcohol') return t.includes('alcohol');
        if (filter === 'pothole') return t.includes('pothole') || t.includes('vibration') || t.includes('impact');
        return true;
    });

    return (
        <div className="w-full relative min-h-screen scanlines selection:bg-red-500 selection:text-white">
            
            {/* 60 FPS 3D Cyber Highway Animated Canvas Background */}
            <CyberHighwayCanvas />

            {/* Ambient Multi-layer Glowing Orbs */}
            <div className="fixed top-0 left-1/3 w-[900px] h-[550px] bg-gradient-to-br from-red-600/20 via-orange-600/20 to-purple-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-purple-600/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-float-slow" />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 text-white relative flex flex-col gap-8 pb-24"
            >
                
                {/* 1. HERO HEADER CARD WITH METRICS */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 sm:p-8 rounded-[36px] glass-card border border-red-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="flex items-center space-x-4">
                        <div className="relative p-4 rounded-3xl bg-red-600/20 text-red-400 border border-red-500/40 shadow-xl shadow-red-600/30">
                            <AlertTriangle size={32} className="animate-bounce" />
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                    Incident & Hazard Ledger
                                </h1>
                                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                                    LIVE AUDIT
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1">
                                Real-time chronological forensic event stream across all vehicle subsystems
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center font-mono">
                            <span className="text-xs text-gray-400 block">Total Logs</span>
                            <span className="text-2xl font-black text-white">{incidents.length}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center font-mono">
                            <span className="text-xs text-gray-400 block">Cloud Status</span>
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1.5">
                                <CheckCircle2 size={13} /> Supabase
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* 2. INTERACTIVE FILTER TABS */}
                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2.5">
                    {[
                        { id: 'all', label: 'All Incidents', icon: Layers, count: incidents.length },
                        { id: 'sos', label: 'SOS & Crashes', icon: ShieldAlert, count: incidents.filter(i => (i.type || '').toLowerCase().includes('sos')).length },
                        { id: 'drowsiness', label: 'Drowsiness (DMS)', icon: Eye, count: incidents.filter(i => (i.type || '').toLowerCase().includes('drowsiness')).length },
                        { id: 'alcohol', label: 'Alcohol Interlock', icon: Beer, count: incidents.filter(i => (i.type || '').toLowerCase().includes('alcohol')).length },
                        { id: 'pothole', label: 'Road Potholes & Vibrations', icon: AlertTriangle, count: incidents.filter(i => (i.type || '').toLowerCase().includes('pothole') || (i.type || '').toLowerCase().includes('vibration')).length },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = filter === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setFilter(tab.id)}
                                className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 border transition-all shadow-lg ${
                                    active 
                                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-400 shadow-red-600/30'
                                        : 'bg-black/40 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                <Icon size={14} />
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'}`}>
                                    {tab.count}
                                </span>
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* 3. ANIMATED INCIDENTS LIST */}
                {filteredIncidents.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-black/40 rounded-3xl border border-white/5 glass-card"
                    >
                        <span className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-1">
                            🟢
                        </span>
                        <span className="text-xl font-bold text-white font-mono">No Incidents Recorded</span>
                        <span className="text-xs text-gray-400 font-mono max-w-md">
                            All subsystems operating within nominal parameters. Telemetry is healthy.
                        </span>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredIncidents.map((incident, index) => {
                                const style = getIncidentStyle(incident.type);
                                const mapsLink = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;

                                return (
                                    <motion.div
                                        key={incident.id || index}
                                        initial={{ opacity: 0, y: 15, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.35, delay: index * 0.03 }}
                                        whileHover={{ scale: 1.015, y: -2 }}
                                        className={`p-5 sm:p-6 rounded-[28px] glass-card border transition-all duration-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${style.cardBorder}`}
                                    >
                                        {/* Left: Icon & Info */}
                                        <div className="flex items-start sm:items-center gap-4">
                                            <div className={`p-3.5 rounded-2xl border ${style.iconBox} shadow-lg shrink-0`}>
                                                {style.icon}
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-black text-white tracking-tight">
                                                        {incident.type}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${style.badge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${style.glowDot} animate-ping`} />
                                                        <span>LOG #{incident.id || (index + 1)}</span>
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-mono text-gray-300">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={13} className="text-cyan-400 shrink-0" />
                                                        <span className="font-bold text-white">{formatIncidentTime(incident.created_at)}</span>
                                                        <span className="text-[10px] text-gray-400">({getRelativeTime(incident.created_at)})</span>
                                                    </span>

                                                    {incident.latitude && (
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin size={13} className="text-red-400 shrink-0" />
                                                            <span>{incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}</span>
                                                        </span>
                                                    )}

                                                    {incident.vibration > 0 && (
                                                        <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                                                            <Activity size={13} />
                                                            <span>Shock: {incident.vibration.toFixed(2)}G</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Map Action Launcher */}
                                        {incident.latitude ? (
                                            <motion.a
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                href={mapsLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20 whitespace-nowrap self-start md:self-auto"
                                            >
                                                <MapPin size={14} className="text-red-400" />
                                                <span>View Location</span>
                                                <ExternalLink size={12} className="text-gray-400" />
                                            </motion.a>
                                        ) : (
                                            <span className="text-[10px] font-mono text-gray-500 italic">
                                                No GPS Fix
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

            </motion.div>
        </div>
    );
};

export default Incidents;
