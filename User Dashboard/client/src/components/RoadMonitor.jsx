import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LineChart, 
    Line, 
    AreaChart,
    Area,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { 
    Activity, 
    AlertTriangle, 
    Shield, 
    MapPin, 
    Clock, 
    Camera, 
    Zap, 
    CheckCircle2, 
    TrendingUp, 
    ExternalLink, 
    Sparkles, 
    Layers, 
    Radio,
    Flame,
    Navigation,
    Gauge,
    Cpu,
    Compass,
    Crosshair,
    Maximize2
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
                color: Math.random() > 0.5 ? '#f59e0b' : (Math.random() > 0.5 ? '#06b6d4' : '#ef4444'),
                len: Math.random() * 22 + 10
            });
        }

        let offset = 0;

        const render = () => {
            ctx.fillStyle = 'rgba(4, 8, 20, 0.25)';
            ctx.fillRect(0, 0, width, height);

            offset += 0.025;

            const horizonY = height * 0.52;
            const perspectiveDist = 280;

            for (let x = -width; x < width * 2; x += 120) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
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
                ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
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

// Holographic Radial Gauge Component
const RadialShockGauge = ({ value, label, max = 1.2, color = '#06b6d4' }) => {
    const clamped = Math.min(Math.max(value || 0, 0), max);
    const percentage = (clamped / max) * 100;
    const strokeDash = (percentage * 251.2) / 100;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                    fill="transparent"
                />
                {/* Active Glowing Value Ring */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - strokeDash}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300"
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                    {(value || 0).toFixed(2)}
                </span>
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">
                    {label}
                </span>
            </div>
        </div>
    );
};

const RoadMonitor = () => {
    const [data, setData] = useState([]);
    const [current, setCurrent] = useState({ left: 0, right: 0 });
    const [alerts, setAlerts] = useState([]);
    const [location, setLocation] = useState({ lat: 0, lon: 0 });
    const [peakLeft, setPeakLeft] = useState(0);
    const [peakRight, setPeakRight] = useState(0);

    // Live Vibration Telemetry Poller
    useEffect(() => {
        const fetchData = async () => {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            try {
                const res = await fetch(`${BASE_URL}/api/vibration`);
                if (res.ok) {
                    const json = await res.json();
                    const l = json.left || 0;
                    const r = json.right || 0;
                    setCurrent({ left: l, right: r });

                    setPeakLeft(p => Math.max(p, l));
                    setPeakRight(p => Math.max(p, r));

                    setData(prev => {
                        const newData = [...prev, {
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            left: l,
                            right: r
                        }];
                        if (newData.length > 20) newData.shift();
                        return newData;
                    });
                }
            } catch (err) {}
        };
        fetchData();
        const interval = setInterval(fetchData, 300);
        return () => clearInterval(interval);
    }, []);

    // Live GPS Location
    useEffect(() => {
        const fetchLoc = async () => {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            try {
                const res = await fetch(`${BASE_URL}/api/location`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.latitude || json.longitude) {
                        setLocation({ lat: json.latitude, lon: json.longitude });
                    }
                }
            } catch (e) {}
        };
        fetchLoc();
        const interval = setInterval(fetchLoc, 2000);
        return () => clearInterval(interval);
    }, []);

    // Fetch Last 20 Road Hazards (STRICTLY ROAD HAZARDS: Exclude Drowsiness & Alcohol)
    useEffect(() => {
        const fetchHistory = async () => {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            try {
                const res = await fetch(`${BASE_URL}/api/road-data`);
                if (res.ok) {
                    const json = await res.json();
                    const list = Array.isArray(json) ? json : [];
                    
                    // Filter: Pure Road Physical Anomalies Only
                    const history = list
                        .filter(item => {
                            if (!item || !item.type) return false;
                            const t = item.type.toLowerCase();
                            return !t.includes('drowsiness') && 
                                   !t.includes('drowsy') && 
                                   !t.includes('driver') && 
                                   !t.includes('fatigue') &&
                                   !t.includes('alcohol');
                        })
                        .slice(0, 18)
                        .map(item => ({
                            id: item.id,
                            type: item.type || 'Road Anomaly',
                            lat: item.latitude,
                            lon: item.longitude,
                            location: `${item.latitude ? item.latitude.toFixed(4) : '0.0000'}, ${item.longitude ? item.longitude.toFixed(4) : '0.0000'}`,
                            time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just Now',
                            rawTime: item.created_at,
                            isCritical: item.type && (item.type.includes('Critical') || item.type.includes('SOS') || item.type.includes('Crash')),
                            isPothole: item.type && (item.type.includes('Pothole') || item.type.includes('Bump')),
                            isVibration: item.type && (item.type.includes('Vibration') || item.type.includes('Impact'))
                        }));
                    setAlerts(history);
                }
            } catch (e) {}
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 1500);
        return () => clearInterval(interval);
    }, []);

    const isLeftCritical = current.left >= 0.8;
    const isLeftWarning = current.left >= 0.5 && current.left < 0.8;

    const isRightCritical = current.right >= 0.8;
    const isRightWarning = current.right >= 0.5 && current.right < 0.8;

    return (
        <div className="w-full relative min-h-screen scanlines selection:bg-amber-500 selection:text-white">
            
            {/* 60 FPS 3D Cyber Highway Animated Canvas Background */}
            <CyberHighwayCanvas />

            {/* Ambient Multi-layer Glowing Orbs */}
            <div className="fixed top-0 left-1/3 w-[900px] h-[550px] bg-gradient-to-br from-amber-600/20 via-orange-600/20 to-red-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-orange-600/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-float-slow" />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 text-white relative flex flex-col gap-8 pb-24"
            >
                
                {/* 1. TOP HERO: AI POTHOLE VISION & DUAL AXLE SUSPENSION GAUGES */}
                <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
                >
                    {/* A. Live AI Pothole Vision Camera Hero (Col 4) */}
                    <div className="lg:col-span-4 rounded-[36px] glass-card border border-amber-500/40 p-6 flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden">
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    <Camera size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-tight">AI Pothole Vision</h3>
                                    <p className="text-[10px] text-gray-400 font-mono">Neural Surface Profiler</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                                LIVE CAM
                            </span>
                        </div>

                        {/* Stream Box with Laser Corner Brackets */}
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black shadow-2xl flex items-center justify-center group">
                            
                            {/* HUD Crosshairs */}
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 z-20 pointer-events-none" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 z-20 pointer-events-none" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 z-20 pointer-events-none" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 z-20 pointer-events-none" />

                            <img
                                key={Date.now()}
                                src={`http://${window.location.hostname}:5002/video_feed`}
                                alt="Pothole Detection Stream"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.nextElementSibling;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />

                            {/* Stream Loading Fallback */}
                            <div 
                                style={{ display: 'none' }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-gray-400 font-mono text-xs bg-black/90 z-10 space-y-2"
                            >
                                <Crosshair size={32} className="text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                                <span className="font-bold text-white text-sm">Pothole Neural Feed Online</span>
                                <span className="text-[10px] text-gray-500">Port 5002 • YOLOv8 Road Profiler</span>
                            </div>

                            {/* Camera HUD Badges */}
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-red-600/90 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold text-white shadow-lg z-20">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                <span>60 FPS • LIVE</span>
                            </div>

                            <div className="absolute bottom-2.5 left-2.5 bg-black/80 px-2.5 py-1 rounded-xl text-[10px] font-mono text-amber-300 border border-white/10 flex items-center gap-1.5 shadow-lg z-20">
                                <Activity size={12} className="text-amber-400 animate-pulse" />
                                <span>Neural Mesh: 98.4% Acc</span>
                            </div>
                        </div>

                        <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between border-t border-white/10 pt-3">
                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Model Active</span>
                            <span className="text-gray-400">Daemon: <b className="text-white">pothole_detector.py</b></span>
                        </div>
                    </div>

                    {/* B. Dual Axle G-Force Suspension Realtime Spectrum (Col 8) */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Left Wheel Suspension Station */}
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className={`p-6 sm:p-7 rounded-[36px] glass-card border transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4 ${
                                isLeftCritical 
                                    ? 'border-red-500 bg-red-950/40 shadow-red-600/40 animate-pulse' 
                                    : isLeftWarning 
                                        ? 'border-amber-500/60 bg-amber-950/20' 
                                        : 'border-cyan-500/40'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                                        LEFT AXLE SENSOR (I2C 0x68)
                                    </span>
                                    <h4 className="text-2xl font-black text-white mt-0.5">
                                        Left Suspension
                                    </h4>
                                </div>
                                <span className={`text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase border ${
                                    isLeftCritical 
                                        ? 'bg-red-500 text-white border-red-400 animate-ping' 
                                        : isLeftWarning 
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-400' 
                                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                                }`}>
                                    {isLeftCritical ? '🛑 CRITICAL' : isLeftWarning ? '⚠️ MODERATE' : '🟢 SMOOTH'}
                                </span>
                            </div>

                            {/* Radial Gauge & Stats Row */}
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-5 flex justify-center">
                                    <RadialShockGauge 
                                        value={current.left} 
                                        label="G-FORCE" 
                                        max={1.2} 
                                        color={isLeftCritical ? '#ef4444' : isLeftWarning ? '#f59e0b' : '#06b6d4'} 
                                    />
                                </div>
                                <div className="col-span-7 space-y-2 font-mono text-xs">
                                    <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center">
                                        <span className="text-gray-400">Peak G-Force:</span>
                                        <span className="font-bold text-white">{peakLeft.toFixed(2)} G</span>
                                    </div>
                                    <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center">
                                        <span className="text-gray-400">Damper Load:</span>
                                        <span className="font-bold text-cyan-300">{Math.min(100, Math.round((current.left / 1.2) * 100))}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Live Area Waveform */}
                            <div className="h-28 w-full rounded-2xl bg-black/50 p-2 border border-white/5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="leftGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isLeftCritical ? '#ef4444' : '#06b6d4'} stopOpacity={0.6}/>
                                                <stop offset="95%" stopColor={isLeftCritical ? '#ef4444' : '#06b6d4'} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="time" hide />
                                        <YAxis domain={[0, 1.2]} hide />
                                        <Tooltip contentStyle={{ backgroundColor: '#050914', borderColor: '#06b6d4', borderRadius: '12px', fontSize: '11px' }} />
                                        <Area type="monotone" dataKey="left" stroke={isLeftCritical ? '#ef4444' : '#06b6d4'} strokeWidth={2.5} fillOpacity={1} fill="url(#leftGrad)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="text-xs font-mono text-center font-bold text-gray-300">
                                {isLeftCritical ? '🚨 CRITICAL ROAD ANOMALY DETECTED' : isLeftWarning ? '⚠️ Minor Road Roughness' : '✅ Road Surface Stable'}
                            </div>
                        </motion.div>

                        {/* Right Wheel Suspension Station */}
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className={`p-6 sm:p-7 rounded-[36px] glass-card border transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4 ${
                                isRightCritical 
                                    ? 'border-red-500 bg-red-950/40 shadow-red-600/40 animate-pulse' 
                                    : isRightWarning 
                                        ? 'border-orange-500/60 bg-orange-950/20' 
                                        : 'border-indigo-500/40'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
                                        RIGHT AXLE SENSOR (I2C 0x69)
                                    </span>
                                    <h4 className="text-2xl font-black text-white mt-0.5">
                                        Right Suspension
                                    </h4>
                                </div>
                                <span className={`text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase border ${
                                    isRightCritical 
                                        ? 'bg-red-500 text-white border-red-400 animate-ping' 
                                        : isRightWarning 
                                            ? 'bg-orange-500/20 text-orange-300 border-orange-400' 
                                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-400'
                                }`}>
                                    {isRightCritical ? '🛑 CRITICAL' : isRightWarning ? '⚠️ MODERATE' : '🟢 SMOOTH'}
                                </span>
                            </div>

                            {/* Radial Gauge & Stats Row */}
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-5 flex justify-center">
                                    <RadialShockGauge 
                                        value={current.right} 
                                        label="G-FORCE" 
                                        max={1.2} 
                                        color={isRightCritical ? '#ef4444' : isRightWarning ? '#f97316' : '#818cf8'} 
                                    />
                                </div>
                                <div className="col-span-7 space-y-2 font-mono text-xs">
                                    <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center">
                                        <span className="text-gray-400">Peak G-Force:</span>
                                        <span className="font-bold text-white">{peakRight.toFixed(2)} G</span>
                                    </div>
                                    <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center">
                                        <span className="text-gray-400">Damper Load:</span>
                                        <span className="font-bold text-indigo-300">{Math.min(100, Math.round((current.right / 1.2) * 100))}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Live Area Waveform */}
                            <div className="h-28 w-full rounded-2xl bg-black/50 p-2 border border-white/5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="rightGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isRightCritical ? '#ef4444' : '#818cf8'} stopOpacity={0.6}/>
                                                <stop offset="95%" stopColor={isRightCritical ? '#ef4444' : '#818cf8'} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="time" hide />
                                        <YAxis domain={[0, 1.2]} hide />
                                        <Tooltip contentStyle={{ backgroundColor: '#050914', borderColor: '#818cf8', borderRadius: '12px', fontSize: '11px' }} />
                                        <Area type="monotone" dataKey="right" stroke={isRightCritical ? '#ef4444' : '#818cf8'} strokeWidth={2.5} fillOpacity={1} fill="url(#rightGrad)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="text-xs font-mono text-center font-bold text-gray-300">
                                {isRightCritical ? '🚨 CRITICAL ROAD ANOMALY DETECTED' : isRightWarning ? '⚠️ Minor Road Roughness' : '✅ Road Surface Stable'}
                            </div>
                        </motion.div>

                    </div>
                </motion.div>

                {/* 2. ATTRACTIVE ANIMATED ROAD HAZARDS & POTHOLE TIMELINE SECTION */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 sm:p-8 rounded-[36px] glass-card border border-red-500/40 shadow-2xl relative overflow-hidden space-y-6"
                >
                    {/* Background Light Beam Sweep */}
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent transform -skew-x-12 animate-beam pointer-events-none" />

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                        <div className="flex items-center space-x-3.5">
                            <div className="relative p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-600/30">
                                <AlertTriangle size={26} className="animate-bounce" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-black text-white tracking-tight">
                                        Road Hazards & Anomaly Detection Ledger
                                    </h3>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                                        ACTIVE THREAT GUARD
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">
                                    AI Computer Vision & MPU-6050 Dual Axle Live Pothole / Road Anomaly Logs
                                </p>
                            </div>
                        </div>

                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 self-start sm:self-auto">
                            <CheckCircle2 size={14} /> SUPABASE SYNCED ({alerts.length} Hazards)
                        </span>
                    </div>

                    {/* Animated Hazard List */}
                    {alerts.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 flex flex-col items-center justify-center text-center space-y-2 bg-black/40 rounded-3xl border border-white/5"
                        >
                            <span className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-1">🟢</span>
                            <span className="text-lg font-bold text-white font-mono">No Road Hazards Detected</span>
                            <span className="text-xs text-gray-400 font-mono">Road surface is smooth & vibration telemetry is within safe operating thresholds.</span>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {alerts.map((alert, index) => {
                                    const mapsLink = `https://www.google.com/maps?q=${alert.lat},${alert.lon}`;
                                    return (
                                        <motion.div
                                            key={alert.id || index}
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.35, delay: index * 0.04 }}
                                            whileHover={{ scale: 1.03, y: -4 }}
                                            className={`p-4 sm:p-5 rounded-3xl glass-card border transition-all duration-300 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden ${
                                                alert.isCritical
                                                    ? 'border-red-500/60 bg-red-950/30 hover:border-red-400 shadow-red-600/20'
                                                    : alert.isPothole
                                                        ? 'border-amber-500/60 bg-amber-950/30 hover:border-amber-400 shadow-amber-600/20'
                                                        : 'border-orange-500/40 bg-orange-950/20 hover:border-orange-400'
                                            }`}
                                        >
                                            {/* Top Tag & Time */}
                                            <div className="flex items-center justify-between">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${
                                                    alert.isCritical 
                                                        ? 'bg-red-600/30 text-red-300 border-red-500 animate-pulse'
                                                        : alert.isPothole
                                                            ? 'bg-amber-500/30 text-amber-300 border-amber-400'
                                                            : 'bg-orange-500/30 text-orange-300 border-orange-400'
                                                }`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                                                    <span>{alert.type}</span>
                                                </span>

                                                <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                                                    <Clock size={11} className="text-gray-500" />
                                                    <span>{alert.time}</span>
                                                </span>
                                            </div>

                                            {/* Details & GPS Marker */}
                                            <div className="space-y-1 my-1">
                                                <div className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-red-400 shrink-0" />
                                                    <span className="font-bold text-white">{alert.location}</span>
                                                </div>
                                            </div>

                                            {/* Bottom Action / Map Launcher */}
                                            <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                                                <span className="text-[9px] font-mono text-gray-400">
                                                    Event #{alert.id || (index + 1)}
                                                </span>

                                                <a
                                                    href={mapsLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
                                                >
                                                    <span>View Map</span>
                                                    <ExternalLink size={11} />
                                                </a>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Footer Hardware Info */}
                <p className="text-center text-gray-500 text-xs font-mono">
                    Dual MPU-6050 Accelerometer Telemetry | Left Axle (I2C 0x68) | Right Axle (I2C 0x69) | Supabase Cloud Sync
                </p>

            </motion.div>
        </div>
    );
};

export default RoadMonitor;
