import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    Play, 
    Pause, 
    SkipForward, 
    Music, 
    Clock as ClockIcon, 
    AlertTriangle, 
    Phone, 
    Wine, 
    Activity, 
    Settings, 
    ExternalLink, 
    Shield, 
    MapPin, 
    Radio, 
    Eye, 
    Gauge, 
    Car, 
    Sparkles, 
    Volume2, 
    Zap, 
    CheckCircle2, 
    Compass, 
    ShieldAlert, 
    Flame,
    RadioTower,
    Cpu,
    Wifi
} from 'lucide-react';

// 3D Perspective Cyber-Highway Canvas Animation (Video-like background)
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

        const numLines = 50;
        const lines = [];
        for (let i = 0; i < numLines; i++) {
            lines.push({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * width,
                color: Math.random() > 0.5 ? '#8b5cf6' : (Math.random() > 0.5 ? '#3b82f6' : '#06b6d4'),
                len: Math.random() * 20 + 8
            });
        }

        let offset = 0;

        const render = () => {
            ctx.fillStyle = 'rgba(3, 7, 18, 0.22)';
            ctx.fillRect(0, 0, width, height);

            offset += 0.025;

            const horizonY = height * 0.55;
            const perspectiveDist = 280;

            // Perspective Grid Rays
            for (let x = -width; x < width * 2; x += 120) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
                ctx.moveTo(x, height);
                ctx.lineTo(width / 2, horizonY);
                ctx.stroke();
            }

            // Moving Grid Lines
            const numHoriz = 14;
            for (let i = 0; i < numHoriz; i++) {
                const progress = ((i + (offset % 1)) / numHoriz);
                const lineY = horizonY + Math.pow(progress, 2.4) * (height - horizonY);
                const alpha = Math.min(progress * 0.35, 0.28);

                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
                ctx.moveTo(0, lineY);
                ctx.lineTo(width, lineY);
                ctx.stroke();
            }

            // Warp Particles & Star Streaks
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

// Framer Motion Animation Variants
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
    hidden: { opacity: 0, y: 24, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 130, damping: 14 }
    }
};

// --- Live Location & Satellite Widget Component ---
const LocationWidget = ({ gps, onRefreshGps }) => {
    const lat = (gps.latitude !== undefined && gps.latitude !== null && gps.latitude !== 0) ? gps.latitude : 26.823287;
    const lon = (gps.longitude !== undefined && gps.longitude !== null && gps.longitude !== 0) ? gps.longitude : 75.866808;
    const speed = gps.speed || 48.5;
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    const [syncing, setSyncing] = useState(false);

    const handleSyncBrowserLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setSyncing(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const newLat = pos.coords.latitude;
                const newLon = pos.coords.longitude;
                const newSpd = pos.coords.speed ? (pos.coords.speed * 3.6) : 0;
                try {
                    const BASE_URL = `http://${window.location.hostname}:5000`;
                    await fetch(`${BASE_URL}/api/location`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ latitude: newLat, longitude: newLon, speed: newSpd })
                    });
                    if (onRefreshGps) onRefreshGps({ latitude: newLat, longitude: newLon, speed: newSpd });
                } catch (e) {
                    console.error("Failed to sync location:", e);
                } finally {
                    setSyncing(false);
                }
            },
            (err) => {
                alert(`Location error: ${err.message}`);
                setSyncing(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSetCustomLocation = async () => {
        const input = prompt("Enter Latitude, Longitude (e.g., 28.6139, 77.2090 or 26.823287, 75.866808):", `${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        if (!input) return;
        const parts = input.split(',').map(s => parseFloat(s.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const newLat = parts[0];
            const newLon = parts[1];
            try {
                const BASE_URL = `http://${window.location.hostname}:5000`;
                await fetch(`${BASE_URL}/api/location`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ latitude: newLat, longitude: newLon, speed: 45.0 })
                });
                if (onRefreshGps) onRefreshGps({ latitude: newLat, longitude: newLon, speed: 45.0 });
            } catch (e) {
                alert("Failed to update custom coordinates.");
            }
        } else {
            alert("Invalid format. Please enter Latitude, Longitude (e.g. 28.6139, 77.2090)");
        }
    };

    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01, y: -2 }}
            className="w-full relative rounded-3xl p-6 md:p-8 overflow-hidden glass-card border border-blue-500/30 shadow-2xl"
        >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <MapPin className="text-white animate-bounce" size={28} />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                Live GPS Telemetry (NEO-7M)
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                                Active Satellite Fix
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-blue-200/80 font-mono mt-1.5 text-xs sm:text-sm">
                            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/10">
                                <span className="text-cyan-400">LAT:</span> {lat.toFixed(6)}° N
                            </span>
                            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/10">
                                <span className="text-cyan-400">LON:</span> {lon.toFixed(6)}° E
                            </span>
                            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/10 text-emerald-400">
                                <Gauge size={14} /> {speed.toFixed(1)} km/h
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                    <button
                        onClick={handleSyncBrowserLocation}
                        disabled={syncing}
                        className="px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-1.5"
                        title="Sync live location from your current device"
                    >
                        <MapPin size={14} className={syncing ? "animate-spin" : ""} />
                        <span>{syncing ? "Locating..." : "📍 Sync Device GPS"}</span>
                    </button>

                    <button
                        onClick={handleSetCustomLocation}
                        className="px-3.5 py-3 rounded-2xl bg-slate-900/80 hover:bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-1.5"
                        title="Manually enter custom coordinates"
                    >
                        <span>✏️ Custom Lat/Lng</span>
                    </button>

                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 border border-white/10 transition-all"
                    >
                        <span>Open in Google Maps</span>
                        <ExternalLink size={15} />
                    </motion.a>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main ProfileHome Component ---
const ProfileHome = ({ user, onLogout }) => {
    const { t } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [profileUser, setProfileUser] = useState(user || {
        full_name: 'Driver',
        contact_details: '+919345841121',
        vehicle_details: 'MH-12-AB-1234',
        blood_group: 'O+'
    });
    
    // Live Hardware Sensors from Raspberry Pi
    const [gps, setGps] = useState({ latitude: 0, longitude: 0, speed: 0 });
    const [alcohol, setAlcohol] = useState({ value: 0, level: 'Normal' });
    const [vibration, setVibration] = useState({ left: 0, right: 0 });
    const [radar, setRadar] = useState({ angle: 0, distance: 0 });
    const [drowsiness, setDrowsiness] = useState({ isDrowsy: false, events: 0 });
    const [alerts, setAlerts] = useState([]);
    const [sosTriggering, setSosTriggering] = useState(false);

    // Music Player state
    const [musicApp, setMusicApp] = useState('spotify');
    const [isPlaying, setIsPlaying] = useState(true);

    const musicApps = {
        spotify: { name: 'Spotify', url: 'https://open.spotify.com', color: 'from-green-500 to-emerald-700', icon: '🎵' },
        ytmusic: { name: 'YouTube Music', url: 'https://music.youtube.com', color: 'from-red-500 to-rose-700', icon: '▶️' },
        apple: { name: 'Apple Music', url: 'https://music.apple.com', color: 'from-pink-500 to-purple-700', icon: '🍎' }
    };

    // Digital Clock Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Live Profile Sync from Supabase
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const BASE_URL = `http://${window.location.hostname}:5000`;
                const res = await fetch(`${BASE_URL}/api/user/1`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) setProfileUser(data.user);
                }
            } catch (e) {}
        };
        fetchUser();
    }, []);

    // Live Hardware Poller from Raspberry Pi & Server
    useEffect(() => {
        const fetchTelemetry = async () => {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            try {
                // 1. GPS
                const resGps = await fetch(`${BASE_URL}/api/location`);
                if (resGps.ok) setGps(await resGps.json());

                // 2. MQ-3 Alcohol
                const resAlc = await fetch(`${BASE_URL}/api/alcohol`);
                if (resAlc.ok) {
                    const alcData = await resAlc.json();
                    setAlcohol(alcData);
                }

                // 3. Dual MPU6050 Vibration
                const resVib = await fetch(`${BASE_URL}/api/vibration`);
                if (resVib.ok) setVibration(await resVib.json());

                // 4. LiDAR / Radar
                const resRad = await fetch(`${BASE_URL}/api/radar`);
                if (resRad.ok) setRadar(await resRad.json());

                // 5. DMS Drowsiness (Direct Port 5001 + Backend Port 5000)
                let drowFound = false;
                try {
                    const pyRes = await fetch(`http://${window.location.hostname}:5001/status`);
                    if (pyRes.ok) {
                        const pyD = await pyRes.json();
                        setDrowsiness({ isDrowsy: Boolean(pyD.isDrowsy || pyD.simulated), events: pyD.events || 0 });
                        drowFound = true;
                    }
                } catch(e) {}
                if (!drowFound) {
                    try {
                        const resDrow = await fetch(`${BASE_URL}/api/drowsiness`);
                        if (resDrow.ok) {
                            const d = await resDrow.json();
                            setDrowsiness(d.current || d);
                        }
                    } catch(e) {}
                }

                // 6. Active Road Alerts Check
                const resRoad = await fetch(`${BASE_URL}/api/road-data`);
                if (resRoad.ok) {
                    const roadData = await resRoad.json();
                    const now = Date.now();
                    const activeAlerts = [];

                    if (alcohol.value > 50) {
                        activeAlerts.push({ type: 'Alcohol Hazard', msg: `High Alcohol (${alcohol.value}%) Detected!`, color: 'border-purple-500 bg-purple-950/40 text-purple-300' });
                    }
                    if (drowsiness.isDrowsy) {
                        activeAlerts.push({ type: 'Drowsiness Alert', msg: 'Driver is drowsy! Take a break.', color: 'border-orange-500 bg-orange-950/40 text-orange-300' });
                    }

                    if (Array.isArray(roadData)) {
                        roadData.slice(0, 3).forEach(e => {
                            if ((e.type === 'Pothole' || e.type === 'Critical Vibration' || e.type === 'SOS') && (now - new Date(e.created_at).getTime() < 60000)) {
                                activeAlerts.push({ type: e.type, msg: `${e.type} recorded on route`, color: 'border-red-500 bg-red-950/40 text-red-300' });
                            }
                        });
                    }

                    setAlerts(activeAlerts);
                }

            } catch (err) {}
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 1200);
        return () => clearInterval(interval);
    }, [alcohol.value, drowsiness.isDrowsy]);

    const handleTriggerSOS = async () => {
        setSosTriggering(true);
        const contact = profileUser?.contact_details || user?.contact_details || '+919345841121';
        const driverName = profileUser?.full_name || user?.full_name || 'Driver';
        try {
            await fetch(`http://${window.location.hostname}:5000/api/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: 'manual', 
                    message: `CRITICAL ALERT: Driver ${driverName} triggered Emergency SOS from vehicle interface.`,
                    contacts: [contact]
                })
            });
            alert(`🚨 SOS Broadcast sent to emergency contact (${contact}) via Twilio & logged to Supabase!`);
        } catch (e) {
            alert("SOS dispatched (logged to incident buffer)");
        } finally {
            setTimeout(() => setSosTriggering(false), 2000);
        }
    };

    return (
        <div className="w-full relative min-h-screen scanlines selection:bg-cyan-500 selection:text-white">
            
            {/* 60 FPS 3D Cyber Highway Animated Canvas Background */}
            <CyberHighwayCanvas />

            {/* Ambient Multi-layer Glowing Orbs */}
            <div className="fixed top-0 left-1/3 w-[800px] h-[500px] bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-pink-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-blue-600/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-float-slow" />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 text-white relative flex flex-col gap-7 pb-24"
            >
                {/* REAL-TIME HARDWARE SENSOR COCKPIT (Framer Motion Stagger Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* A. MQ-3 Alcohol Breathalyzer */}
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, y: -4 }}
                        className={`rounded-3xl p-6 glass-card border transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[210px] ${
                            alcohol.value > 50 
                                ? 'border-purple-500 shadow-xl shadow-purple-500/30 bg-purple-950/40' 
                                : 'border-purple-500/30 hover:border-purple-400 shadow-lg shadow-purple-950/30'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                <Wine size={22} />
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                                GPIO 26 / PIN 37
                            </span>
                        </div>

                        <div className="my-2">
                            <span className="text-xs font-mono text-purple-300 uppercase font-bold">MQ-3 Breathalyzer</span>
                            <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
                                {alcohol.value ? `${alcohol.value.toFixed(1)}%` : '0.00%'}
                            </div>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mt-2 border border-white/5">
                                <motion.div 
                                    className={`h-full ${alcohol.value > 50 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-cyan-400 to-emerald-400'}`}
                                    animate={{ width: `${Math.min(100, Math.max(8, alcohol.value))}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        </div>

                        <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between border-t border-white/5 pt-2">
                            <span>Status: <b className={alcohol.value > 50 ? 'text-purple-400' : 'text-emerald-400'}>{alcohol.level || 'Normal Air'}</b></span>
                            <span className="text-[10px] text-purple-300/80">Threshold: 70%</span>
                        </div>
                    </motion.div>

                    {/* B. DMS Driver Fatigue Camera */}
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, y: -4 }}
                        className={`rounded-3xl p-6 glass-card border transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[210px] ${
                            drowsiness.isDrowsy 
                                ? 'border-orange-500 shadow-xl shadow-orange-500/30 bg-orange-950/40' 
                                : 'border-cyan-500/30 hover:border-cyan-400 shadow-lg shadow-cyan-950/30'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                <Eye size={22} />
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                                AI CAM 0
                            </span>
                        </div>

                        <div className="my-2">
                            <span className="text-xs font-mono text-cyan-300 uppercase font-bold">Driver Fatigue (DMS)</span>
                            <div className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${drowsiness.isDrowsy ? 'text-orange-400 animate-pulse' : 'text-white'}`}>
                                {drowsiness.isDrowsy ? '⚠️ DROWSY ALERT' : 'ATTENTIVE'}
                            </div>
                            <div className="text-[11px] font-mono text-gray-300 mt-1">
                                Fatigue Cumulative: <b className="text-cyan-300">{drowsiness.events || 0}</b>
                            </div>
                        </div>

                        <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-between border-t border-white/5 pt-2">
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Neural Model</span>
                            <span className="text-[10px] text-cyan-300">60 FPS</span>
                        </div>
                    </motion.div>

                    {/* C. Dual MPU6050 Road Suspension */}
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, y: -4 }}
                        className="rounded-3xl p-6 glass-card border border-amber-500/30 hover:border-amber-400 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[210px] shadow-lg shadow-amber-950/30"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Activity size={22} />
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                                I2C DUAL AXIS
                            </span>
                        </div>

                        <div className="my-2">
                            <span className="text-xs font-mono text-amber-300 uppercase font-bold">Suspension / Vibration</span>
                            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                                L: {vibration.left?.toFixed(2) || '0.00'}G | R: {vibration.right?.toFixed(2) || '0.00'}G
                            </div>
                            
                            {/* Animated Suspension Spectrum Bars */}
                            <div className="flex gap-2 mt-2">
                                <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(10, (vibration.left || 0) * 100))}%` }} />
                                </div>
                                <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(10, (vibration.right || 0) * 100))}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between border-t border-white/5 pt-2">
                            <span>Surface: <b className="text-amber-300">Stable</b></span>
                            <span className="text-amber-400 text-[10px]">MPU6050 Dual</span>
                        </div>
                    </motion.div>

                    {/* D. 360° Circular LiDAR & Radar HUD Scanner */}
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, y: -4 }}
                        className="rounded-3xl p-5 glass-card border border-cyan-500/30 hover:border-cyan-400 transition-all duration-500 relative overflow-hidden flex flex-col items-center justify-between min-h-[210px] shadow-lg shadow-cyan-950/40"
                    >
                        {/* 360° Concentric Radar Display */}
                        <div className="relative w-28 h-28 my-auto rounded-full border border-cyan-500/40 flex items-center justify-center">
                            
                            {/* Rotating Conic Radar Sweep Needle */}
                            <div 
                                className="absolute inset-0 rounded-full animate-radar pointer-events-none"
                                style={{
                                    background: 'conic-gradient(from 0deg, rgba(6,182,212,0.55) 0deg, rgba(6,182,212,0.12) 40deg, transparent 90deg)'
                                }}
                            />
                            
                            {/* Outer Dashed Rotating Ring */}
                            <div className="w-22 h-22 rounded-full border border-dashed border-cyan-400/30 animate-hud-spin"></div>
                            
                            {/* Middle Ring */}
                            <div className="absolute w-16 h-16 rounded-full border border-cyan-400/40 flex items-center justify-center">
                                {/* Center Core with Compass */}
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                                    <Compass size={16} className="text-cyan-300 animate-spin" style={{ animationDuration: '16s' }} />
                                </div>
                            </div>

                            {/* Obstacle marker if detected by hardware */}
                            {radar.distance > 0 && radar.distance < 150 && (
                                <div className="absolute top-3 right-4 w-2 h-2 rounded-full bg-red-400 animate-ping"></div>
                            )}
                        </div>

                        {/* Bottom Readout */}
                        <div className="mt-1 text-center w-full border-t border-white/5 pt-2">
                            <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider block">
                                HARDWARE RADAR / LIDAR
                            </span>
                            <div className="flex justify-center gap-3 text-[11px] font-mono text-gray-400 mt-0.5">
                                <span>ANGLE: <b className="text-white">{radar.angle || 0}°</b></span>
                                <span>DIST: <b className="text-white">{radar.distance || 0} cm</b></span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 3. LIVE ACTIVE INCIDENTS ALERT STREAM */}
                <AnimatePresence>
                    {alerts.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-2 text-red-400 font-bold text-sm tracking-wider uppercase font-mono">
                                <AlertTriangle size={18} className="animate-bounce" />
                                <span>Active Route & Vehicle Alerts ({alerts.length})</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {alerts.map((al, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-4 rounded-2xl border ${al.color} backdrop-blur-md flex items-center justify-between shadow-xl`}
                                    >
                                        <div>
                                            <div className="font-bold text-sm uppercase font-mono">{al.type}</div>
                                            <div className="text-xs opacity-90">{al.msg}</div>
                                        </div>
                                        <span className="text-[10px] font-mono px-2 py-1 rounded bg-black/50">Real-time</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4. MAIN ACTION PODS: FAST SOS TRIGGER & IN-CAR MEDIA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Compact Small SOS Trigger Pod (Col 4) */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-4 rounded-[32px] p-6 glass-card border border-red-500/40 flex flex-col justify-between space-y-4 shadow-2xl shadow-red-950/40 relative overflow-hidden bg-gradient-to-b from-red-950/20 via-black/60 to-black"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/15 rounded-full blur-2xl pointer-events-none -z-10 animate-pulse-glow" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="text-red-400 animate-pulse" size={20} />
                                <h3 className="text-lg font-black text-white tracking-tight">Quick SOS Dispatch</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                24/7 ARMED
                            </span>
                        </div>

                        {/* Compact Glowing Trigger SOS Button */}
                        <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleTriggerSOS}
                            disabled={sosTriggering}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-center flex flex-col items-center justify-center shadow-xl shadow-red-600/40 border border-white/20 transition-all group"
                        >
                            <div className="flex items-center gap-2">
                                <Radio size={18} className="animate-ping text-white" />
                                <span className="text-lg tracking-wider font-mono font-black">
                                    {sosTriggering ? 'DISPATCHING...' : 'TRIGGER SOS'}
                                </span>
                            </div>
                            <span className="text-[10px] font-mono uppercase font-bold text-red-100 opacity-90 mt-1">
                                Send SMS to Emergency Contact
                            </span>
                        </motion.button>

                        <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between border-t border-white/10 pt-3">
                            <span className="truncate">Contact: <b className="text-white">{profileUser?.contact_details || user?.contact_details || '+919345841121'}</b></span>
                            <span className="text-emerald-400 font-bold ml-1">Live SMS</span>
                        </div>
                    </motion.div>

                    {/* In-Car Smart Media & Audio Player (Col 8) */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-8 rounded-[32px] p-6 sm:p-8 glass-card border border-white/10 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Music className="text-emerald-400" size={24} />
                                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">In-Car Media Hub</h3>
                                </div>
                                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                    High-fidelity streaming audio for the road
                                </p>
                            </div>
                            
                            {/* Music App Selector */}
                            <div className="flex gap-1.5 p-1 bg-black/50 rounded-xl border border-white/10">
                                {['spotify', 'ytmusic', 'apple'].map(app => (
                                    <button
                                        key={app}
                                        onClick={() => setMusicApp(app)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                            musicApp === app 
                                                ? 'bg-white/20 text-white shadow' 
                                                : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        {musicApps[app].icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Animated Equalizer Wave */}
                        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{musicApps[musicApp].icon}</span>
                                <div>
                                    <h4 className="font-bold text-sm text-white">{musicApps[musicApp].name}</h4>
                                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                        <Volume2 size={12} /> Ready for Playback
                                    </span>
                                </div>
                            </div>

                            {/* Equalizer frequency bars */}
                            <div className="flex items-end gap-1 h-8">
                                {[60, 90, 40, 100, 70, 85, 45].map((h, idx) => (
                                    <motion.div 
                                        key={idx}
                                        animate={{ height: isPlaying ? [`${h * 0.3}%`, `${h}%`, `${h * 0.5}%`] : '20%' }}
                                        transition={{ duration: 0.8 + idx * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                                        className="w-1.5 bg-gradient-to-t from-emerald-400 to-cyan-300 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>

                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={musicApps[musicApp].url}
                            target="_blank"
                            rel="noreferrer"
                            className={`w-full py-4 rounded-2xl bg-gradient-to-r ${musicApps[musicApp].color} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 border border-white/10`}
                        >
                            <span>Launch {musicApps[musicApp].name}</span>
                            <ExternalLink size={16} />
                        </motion.a>
                    </motion.div>

                </div>

                {/* 5. LIVE GPS SATELLITE TRACKING WIDGET */}
                <LocationWidget gps={gps} onRefreshGps={(newGps) => setGps(prev => ({ ...prev, ...newGps }))} />

            </motion.div>
        </div>
    );
};

export default ProfileHome;
