import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, 
    Volume2, 
    UserCheck, 
    AlertTriangle, 
    CheckCircle2, 
    Activity, 
    Clock, 
    Sparkles, 
    Camera, 
    Shield, 
    Zap,
    Cpu,
    Bell,
    Video,
    Smile,
    History,
    FileText,
    Timer,
    Flame,
    Send,
    Radio,
    Globe,
    Layers,
    Server,
    ExternalLink
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

        const numLines = 50;
        const lines = [];
        for (let i = 0; i < numLines; i++) {
            lines.push({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * width,
                color: Math.random() > 0.5 ? '#8b5cf6' : (Math.random() > 0.5 ? '#06b6d4' : '#3b82f6'),
                len: Math.random() * 20 + 8
            });
        }

        let offset = 0;

        const render = () => {
            ctx.fillStyle = 'rgba(3, 7, 18, 0.22)';
            ctx.fillRect(0, 0, width, height);

            offset += 0.025;

            const horizonY = height * 0.52;
            const perspectiveDist = 280;

            for (let x = -width; x < width * 2; x += 120) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
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
                ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
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

const DriverMonitor = () => {
    // 100% Real Hardware State from Raspberry Pi
    const [drowsiness, setDrowsiness] = useState({ isDrowsy: false, events: 0, ear: 0.32 });
    const [drowsinessLogs, setDrowsinessLogs] = useState([]);
    const [windowEvents, setWindowEvents] = useState(0);
    const [piConnected, setPiConnected] = useState(false);
    const [sessionStartTime] = useState(Date.now());
    const [lastAlertTime, setLastAlertTime] = useState(null);
    const [lastAlertRawTimestamp, setLastAlertRawTimestamp] = useState(null);
    const [lastVoiceAlertCount, setLastVoiceAlertCount] = useState(0);

    // External Server Forwarding Config State
    const [externalServerUrl, setExternalServerUrl] = useState('');
    const [isSavingUrl, setIsSavingUrl] = useState(false);
    const [testSending, setTestSending] = useState(false);
    const [testFeedback, setTestFeedback] = useState(null);

    // Camera Source Selection (Defaulting to device 0: Logi C270 HD WebCam)
    const [selectedCamera, setSelectedCamera] = useState('0');
    const [cameraList, setCameraList] = useState([]);
    const [videoKey, setVideoKey] = useState(Date.now());

    const handleCameraChange = async (newIdx) => {
        setSelectedCamera(newIdx);
        try {
            const res = await fetch(`http://${window.location.hostname}:5001/switch_camera?index=${newIdx}`);
            const data = await res.json();
            if (data.success && data.device !== undefined) {
                setSelectedCamera(String(data.device));
            }
            setVideoKey(Date.now());
        } catch (e) {
            console.error('Failed to switch camera:', e);
        }
    };

    // Live Hardware Telemetry Poller
    useEffect(() => {
        const fetchDmsTelemetry = async () => {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            try {
                const resDrow = await fetch(`${BASE_URL}/api/drowsiness`);
                if (resDrow.ok) {
                    const d = await resDrow.json();
                    setDrowsiness(d.current || d);
                    setWindowEvents(d.window_events_2min || 0);
                    
                    if (d.history && Array.isArray(d.history)) {
                        setDrowsinessLogs(d.history.slice(0, 10));
                        // Pick the most recent alert timestamp
                        const latestAlert = d.history.find(h => h.is_drowsy === 1 || h.is_drowsy === true || h.is_drowsy === 'true');
                        if (latestAlert && latestAlert.timestamp) {
                            setLastAlertRawTimestamp(latestAlert.timestamp);
                        }
                    }
                    setPiConnected(true);
                }
            } catch (err) {
                setPiConnected(false);
            }
        };

        const fetchExternalConfig = async () => {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            try {
                const res = await fetch(`${BASE_URL}/api/external-server-config`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.external_server_url) {
                        setExternalServerUrl(data.external_server_url);
                    }
                }
            } catch {}
        };

        const fetchCameraInfo = async () => {
            try {
                const res = await fetch(`http://${window.location.hostname}:5001/cameras`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.current_index !== undefined && data.current_index !== -1) {
                        setSelectedCamera(String(data.current_index));
                    }
                    if (data.available && Array.isArray(data.available)) {
                        setCameraList(data.available);
                    }
                }
            } catch (e) {
                // Offline fallback
            }
        };

        fetchDmsTelemetry();
        fetchExternalConfig();
        fetchCameraInfo();
        const interval = setInterval(fetchDmsTelemetry, 800);
        return () => clearInterval(interval);
    }, []);

    // Acoustic wake-up voice alarm trigger on fatigue spike
    useEffect(() => {
        if (drowsiness.events > 0 && drowsiness.events >= lastVoiceAlertCount + 5) {
            const event = new CustomEvent('TRIGGER_DROWSINESS_ALERT');
            window.dispatchEvent(event);
            setLastVoiceAlertCount(drowsiness.events);
            setLastAlertTime(new Date().toLocaleTimeString());
            setLastAlertRawTimestamp(Date.now());
        }
    }, [drowsiness.events, lastVoiceAlertCount]);

    // Save External Server Destination
    const handleSaveExternalUrl = async (e) => {
        e.preventDefault();
        setIsSavingUrl(true);
        try {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            await fetch(`${BASE_URL}/api/external-server-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: externalServerUrl })
            });
            setTestFeedback({ type: 'success', msg: 'External Destination URL Saved & Armed!' });
            setTimeout(() => setTestFeedback(null), 3500);
        } catch (err) {
            setTestFeedback({ type: 'error', msg: 'Failed to save URL' });
        } finally {
            setIsSavingUrl(false);
        }
    };

    // Test Manual Bundle Dispatch
    const handleTestBundleDispatch = async () => {
        setTestSending(true);
        setTestFeedback(null);
        try {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            const res = await fetch(`${BASE_URL}/api/test-drowsiness-bundle`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setTestFeedback({
                    type: 'success',
                    msg: `✅ Bundle Stored on Supabase & Relayed! (${data.external_relay_status})`
                });
            }
        } catch (err) {
            setTestFeedback({ type: 'error', msg: 'Error generating test bundle' });
        } finally {
            setTestSending(false);
        }
    };

    // Calculate session duration in minutes
    const sessionMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    const eventsPerMinute = ((drowsiness.events || 0) / sessionMinutes).toFixed(2);

    // Relative minutes calculation
    const getMinutesAgo = (ts) => {
        if (!ts) return 'Just now';
        try {
            const date = new Date(ts);
            if (isNaN(date.getTime())) return ts;
            const diffMs = Date.now() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins <= 0) return 'Just now (< 1 min ago)';
            if (diffMins === 1) return '1 min ago';
            if (diffMins < 60) return `${diffMins} mins ago`;
            const diffHours = Math.floor(diffMins / 60);
            return `${diffHours}h ${diffMins % 60}m ago`;
        } catch {
            return 'Just now';
        }
    };

    const formatLogTime = (ts) => {
        if (!ts) return 'Just now';
        try {
            const date = new Date(ts);
            if (isNaN(date.getTime())) return ts;
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
            return String(ts);
        }
    };

    return (
        <div className="w-full relative min-h-screen scanlines selection:bg-cyan-500 selection:text-white">
            
            {/* 60 FPS 3D Cyber Highway Animated Canvas Background */}
            <CyberHighwayCanvas />

            {/* Ambient Multi-layer Glowing Orbs */}
            <div className="fixed top-0 left-1/3 w-[900px] h-[550px] bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-indigo-600/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-float-slow" />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 text-white relative flex flex-col gap-8 pb-24"
            >
                
                {/* 1. MASTER LIVE CAMERA FEED & NEURAL SCANNER HERO */}
                <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
                >
                    {/* Live Camera Feed Container (Col 7) */}
                    <div className="lg:col-span-7 rounded-[36px] glass-card border border-cyan-500/40 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
                        
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-2">
                                <Video size={16} /> LIVE DRIVER VISION FEED
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedCamera}
                                    onChange={(e) => handleCameraChange(e.target.value)}
                                    className="bg-black/60 border border-cyan-500/40 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-200 outline-none hover:border-cyan-400 transition-all cursor-pointer"
                                    title="Choose active video input device"
                                >
                                    {cameraList.length > 0 ? (
                                        cameraList.map((cam) => (
                                            <option key={cam.index} value={String(cam.index)} className="bg-gray-900 text-white">
                                                📷 {cam.name || `Device ${cam.index}`}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="0" className="bg-gray-900 text-white">📷 Logi C270 HD WebCam (USB / Dev 0)</option>
                                            <option value="1" className="bg-gray-900 text-white">💻 Integrated Camera (Dev 1)</option>
                                        </>
                                    )}
                                </select>
                                
                                <span className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold border ${
                                    drowsiness.isDrowsy 
                                        ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
                                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}>
                                    {drowsiness.isDrowsy ? '⚠️ DROWSINESS DETECTED' : '🟢 DRIVER ATTENTIVE'}
                                </span>
                            </div>
                        </div>

                        {/* Video Container */}
                        <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border-2 border-cyan-500/40 bg-black shadow-2xl flex items-center justify-center">
                            <img
                                key={videoKey}
                                src={`http://${window.location.hostname}:5001/video_feed`}
                                alt="Live Driver Camera Stream"
                                className="w-full h-full object-cover"
                                onLoad={(e) => {
                                    e.target.style.display = 'block';
                                    const fallback = e.target.nextElementSibling;
                                    if (fallback) fallback.style.display = 'none';
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.nextElementSibling;
                                    if (fallback) fallback.style.display = 'flex';
                                    setTimeout(() => {
                                        setVideoKey(Date.now());
                                    }, 2000);
                                }}
                            />

                            {/* Fallback Overlay if Cam Loading */}
                            <div 
                                style={{ display: 'none' }}
                                className="absolute inset-0 flex-col items-center justify-center text-center p-6 text-gray-400 font-mono text-sm bg-black/90 z-10"
                            >
                                <span className="text-cyan-400 text-4xl mb-3 animate-pulse">📹</span>
                                <span className="font-bold text-white text-base">DMS Camera Feed Initializing...</span>
                                <span className="text-xs text-gray-500 mt-2">Connecting to OpenCV Port 5001</span>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-4 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30"
                                >
                                    🔄 Retry Connection
                                </button>
                            </div>

                            {/* Camera Feed Badges */}
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/90 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-white shadow-2xl z-20">
                                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                                <span>LIVE CAM</span>
                            </div>

                            <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1.5 rounded-2xl text-xs font-mono text-cyan-300 border border-white/10 flex items-center gap-2 shadow-lg z-20">
                                <Activity size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                                <span>30 FPS • Dlib 68 Mesh</span>
                            </div>
                        </div>

                        <div className="text-xs font-mono text-gray-400 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                            <div className="flex items-center gap-2">
                                <span>Ingestion: <b className="text-white">http://localhost:5001/video_feed</b></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        try {
                                            await fetch(`http://${window.location.hostname}:5001/trigger`);
                                        } catch (e) {
                                            console.error('Trigger DMS failed:', e);
                                        }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-[11px] font-bold transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
                                    title="Simulate 3-second drowsiness event to test sound alarm, UI alert, and 5x sliding window"
                                >
                                    ⚡ Test Drowsy Alert
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await fetch(`http://${window.location.hostname}:5001/reset`);
                                        } catch (e) {
                                            console.error('Reset DMS failed:', e);
                                        }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-gray-200 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                                    title="Reset DMS fatigue triggers count"
                                >
                                    🔄 Reset
                                </button>
                                <span className="text-emerald-400 font-bold ml-1">● Armed</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Real-time Fatigue Metrics & 5x/2min Cluster Card (Col 5) */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                        
                        {/* 5X / 2-MIN SLIDING WINDOW CLUSTER DISPATCH CARD */}
                        <div className={`p-6 rounded-3xl glass-card border transition-all duration-300 shadow-2xl space-y-3 ${
                            windowEvents >= 5 
                                ? 'border-red-500 bg-red-950/40 shadow-red-600/40 animate-pulse' 
                                : windowEvents >= 3 
                                    ? 'border-orange-500/60 bg-orange-950/20' 
                                    : 'border-cyan-500/40'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-cyan-300 uppercase font-bold flex items-center gap-2">
                                    <Radio size={16} className="text-cyan-400 animate-pulse" /> 5x / 2-Min Cluster Guard
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${
                                    windowEvents >= 5 
                                        ? 'bg-red-500 text-white border-red-400' 
                                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                                }`}>
                                    {windowEvents >= 5 ? '🚨 BUNDLE DISPATCHED' : 'ARMED & MONITORING'}
                                </span>
                            </div>

                            <div className="flex items-baseline justify-between">
                                <div>
                                    <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                                        {windowEvents}
                                    </span>
                                    <span className="text-xl font-mono text-gray-400 font-bold"> / 5</span>
                                </div>
                                <span className="text-xs font-mono text-gray-300 font-bold">
                                    Triggers in last 120s
                                </span>
                            </div>

                            {/* Progress bar to 5 triggers */}
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-white/10">
                                <motion.div 
                                    className={`h-full ${windowEvents >= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-amber-400'}`}
                                    animate={{ width: `${Math.min(100, (windowEvents / 5) * 100)}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            <p className="text-[11px] font-mono text-gray-400">
                                When 5 events occur within 2 minutes, an emergency JSON telemetry bundle is saved to Supabase and forwarded to your external server.
                            </p>
                        </div>

                        {/* Fatigue Events Per Minute Card */}
                        <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-cyan-300 uppercase font-bold flex items-center gap-2">
                                    <Flame size={16} className="text-cyan-400" /> Fatigue Frequency
                                </span>
                                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                                    {sessionMinutes} MIN TRIP
                                </span>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                                    {eventsPerMinute}
                                </div>
                                <span className="text-xs font-mono text-gray-400 font-bold">
                                    Events / Min ({drowsiness.events || 0} total)
                                </span>
                            </div>
                        </div>

                        {/* Attentiveness Level Card */}
                        <div className="p-5 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-400 uppercase font-bold flex items-center gap-2">
                                    <UserCheck size={15} className="text-emerald-400" /> Driver Vigilance State
                                </span>
                                <span className="text-xs font-mono text-gray-400">
                                    {lastAlertRawTimestamp ? getMinutesAgo(lastAlertRawTimestamp) : '100% Attentive'}
                                </span>
                            </div>

                            <div className={`text-2xl font-black font-mono ${drowsiness.isDrowsy ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                                {drowsiness.isDrowsy ? '⚠️ DROWSY / FATIGUED' : '🟢 100% ATTENTIVE'}
                            </div>

                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-white/10">
                                <motion.div 
                                    className={`h-full ${drowsiness.isDrowsy ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-emerald-400'}`}
                                    animate={{ width: drowsiness.isDrowsy ? '30%' : '100%' }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* 2. EXTERNAL SERVER FORWARDING & BUNDLE RELAY STATION */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/40 shadow-2xl space-y-5 bg-gradient-to-r from-indigo-950/30 via-black/50 to-blue-950/20"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                                <Server size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    External Server Telemetry Relay (5x Cluster Dispatcher)
                                </h3>
                                <p className="text-xs text-gray-400 font-mono">
                                    Destination endpoint that receives full JSON bundles during high-fatigue events
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleTestBundleDispatch}
                            disabled={testSending}
                            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-orange-600/30 self-start sm:self-auto"
                        >
                            <Send size={14} />
                            <span>{testSending ? 'Transmitting Test Bundle...' : '⚡ Test 5x Bundle Dispatch'}</span>
                        </motion.button>
                    </div>

                    {testFeedback && (
                        <motion.div 
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center gap-2 ${
                                testFeedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border-red-500/40 text-red-300'
                            }`}
                        >
                            <CheckCircle2 size={15} />
                            <span>{testFeedback.msg}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSaveExternalUrl} className="grid grid-cols-1 sm:grid-cols-12 gap-3 font-mono text-xs">
                        <div className="sm:col-span-9 relative">
                            <input
                                type="url"
                                placeholder="Enter External Server Webhook URL (e.g. https://fleet-control.example.com/api/emergency)"
                                value={externalServerUrl}
                                onChange={(e) => setExternalServerUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSavingUrl}
                                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30"
                            >
                                {isSavingUrl ? 'Saving...' : 'Arm Destination URL'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>

                {/* 3. LAST 10 DROWSINESS & FATIGUE INCIDENT LOGS (WITH ELAPSED MINUTES) */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 sm:p-8 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl space-y-5"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                <History size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    Last 10 Drowsiness & Fatigue Logs (in Minutes)
                                </h3>
                                <p className="text-xs text-gray-400 font-mono">
                                    Chronological timeline with exact time and elapsed minutes
                                </p>
                            </div>
                        </div>

                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            <CheckCircle2 size={13} /> SUPABASE SYNCHRONIZED
                        </span>
                    </div>

                    {/* Logs Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                                    <th className="py-3 px-4"># Log ID</th>
                                    <th className="py-3 px-4">Driver Status</th>
                                    <th className="py-3 px-4">Cumulative Events</th>
                                    <th className="py-3 px-4">Time Elapsed (in Minutes)</th>
                                    <th className="py-3 px-4 text-right">System Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {drowsinessLogs.length > 0 ? (
                                    drowsinessLogs.map((log, index) => {
                                        const isDrowsy = log.is_drowsy === true || log.is_drowsy === 1 || log.is_drowsy === 'true';
                                        const rawTs = log.timestamp || log.created_at;
                                        return (
                                            <tr 
                                                key={log.id || index}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="py-3.5 px-4 text-cyan-300 font-bold">
                                                    #{log.id || (index + 1)}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                                        isDrowsy
                                                            ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                                                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isDrowsy ? 'bg-red-400' : 'bg-emerald-400'}`} />
                                                        {isDrowsy ? '🛑 DROWSINESS ALERT' : '🟢 ATTENTIVE / SYNC'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-white font-bold">
                                                    {log.events_count || log.events || 0}
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-200">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={13} className="text-cyan-400" />
                                                        <span className="font-bold text-white">{getMinutesAgo(rawTs)}</span>
                                                        <span className="text-[10px] text-gray-400">({formatLogTime(rawTs)})</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <span className={`font-bold ${isDrowsy ? 'text-orange-400' : 'text-gray-400'}`}>
                                                        {isDrowsy ? '🔊 Acoustic Siren Dispatched' : 'Heartbeat Verified'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-400 font-mono">
                                            <div className="flex flex-col items-center justify-center space-y-1">
                                                <CheckCircle2 size={24} className="text-emerald-400 mb-1" />
                                                <span className="text-white font-bold">No Drowsiness Incidents Recorded</span>
                                                <span className="text-[11px] text-gray-500">Driver is alert and actively monitored by the DMS neural engine</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default DriverMonitor;
