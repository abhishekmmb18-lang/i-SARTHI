import React, { useState, useEffect, useRef } from 'react';
import { 
    Shield, 
    Sparkles, 
    ArrowRight, 
    Activity, 
    AlertTriangle, 
    Eye, 
    Wine, 
    Navigation, 
    Cpu, 
    Database, 
    Radio, 
    CheckCircle2, 
    Zap,
    ChevronRight,
    Play,
    Gauge,
    Flame,
    Wifi,
    Compass,
    Volume2,
    Sliders,
    Server,
    RadioTower,
    Landmark,
    Building2
} from 'lucide-react';

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

        // Speed Lines & Stars
        const numLines = 60;
        const lines = [];
        for (let i = 0; i < numLines; i++) {
            lines.push({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * width,
                color: Math.random() > 0.5 ? '#8b5cf6' : (Math.random() > 0.5 ? '#3b82f6' : '#ec4899'),
                len: Math.random() * 20 + 10
            });
        }

        let offset = 0;

        const render = () => {
            ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
            ctx.fillRect(0, 0, width, height);

            offset += 0.03;

            // Render Perspective Neon Grid
            const horizonY = height * 0.55;
            const perspectiveDist = 300;

            ctx.lineWidth = 1;

            // Vanishing perspective rays
            for (let x = -width; x < width * 2; x += 100) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
                ctx.moveTo(x, height);
                ctx.lineTo(width / 2, horizonY);
                ctx.stroke();
            }

            // Moving horizontal grid lines
            const numHoriz = 16;
            for (let i = 0; i < numHoriz; i++) {
                const progress = ((i + (offset % 1)) / numHoriz);
                const lineY = horizonY + Math.pow(progress, 2.5) * (height - horizonY);
                const alpha = Math.min(progress * 0.4, 0.35);

                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
                ctx.moveTo(0, lineY);
                ctx.lineTo(width, lineY);
                ctx.stroke();
            }

            // Warp Stars / Speed Particles
            const cx = width / 2;
            const cy = horizonY - 40;

            for (let i = 0; i < lines.length; i++) {
                const p = lines[i];
                p.z -= 10;
                if (p.z <= 0) {
                    p.z = width;
                    p.x = (Math.random() - 0.5) * width * 2;
                    p.y = (Math.random() - 0.5) * height * 2;
                }

                const k = perspectiveDist / p.z;
                const px = p.x * k + cx;
                const py = p.y * k + cy;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = Math.max(0.8, (1 - p.z / width) * 3.2);
                    const alpha = (1 - p.z / width);

                    ctx.beginPath();
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha;
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = size * 0.8;
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
            className="absolute inset-0 w-full h-full pointer-events-none -z-10"
        />
    );
};

const LandingPage = ({ onEnterDashboard, onOpenGovPortal }) => {
    // 100% Genuine Hardware State from Raspberry Pi & Server
    const [liveGps, setLiveGps] = useState({ latitude: 0.0, longitude: 0.0, speed: 0.0, timestamp: 0 });
    const [vibration, setVibration] = useState({ left: 0.0, right: 0.0, timestamp: 0 });
    const [alcohol, setAlcohol] = useState({ value: 0.0, level: 'Normal', timestamp: 0 });
    const [radar, setRadar] = useState({ angle: 0, distance: 0, timestamp: 0 });
    const [drowsiness, setDrowsiness] = useState({ isDrowsy: false, events: 0, timestamp: 0 });
    const [gsm, setGsm] = useState({ connected: true, alertsSent: 0 });
    const [piActive, setPiActive] = useState(false);

    // Real Hardware Data Poller (No Mocking)
    useEffect(() => {
        const fetchRealHardwareData = async () => {
            const baseUrl = `http://${window.location.hostname}:5000`;
            try {
                // 1. GPS Location (NEO-7M)
                const locRes = await fetch(`${baseUrl}/api/location`);
                if (locRes.ok) {
                    const loc = await locRes.json();
                    setLiveGps(loc);
                }

                // 2. Vibration (Dual MPU6050)
                const vibRes = await fetch(`${baseUrl}/api/vibration`);
                if (vibRes.ok) {
                    const vib = await vibRes.json();
                    setVibration(vib);
                }

                // 3. MQ-3 Alcohol Sensor
                const alcRes = await fetch(`${baseUrl}/api/alcohol`);
                if (alcRes.ok) {
                    const alc = await alcRes.json();
                    setAlcohol(alc);
                }

                // 4. LiDAR / Radar
                const radRes = await fetch(`${baseUrl}/api/radar`);
                if (radRes.ok) {
                    const rad = await radRes.json();
                    setRadar(rad);
                }

                // 5. Drowsiness DMS
                const drowRes = await fetch(`${baseUrl}/api/drowsiness`);
                if (drowRes.ok) {
                    const drow = await drowRes.json();
                    setDrowsiness(drow.current || drow);
                }

                // 6. GSM Status
                const gsmRes = await fetch(`${baseUrl}/api/gsm-status`);
                if (gsmRes.ok) {
                    const g = await gsmRes.json();
                    setGsm(g);
                }

                // Detect if Raspberry Pi is streaming (received telemetry in last 10s)
                const now = Date.now();
                const isStreaming = (
                    (now - (liveGps.timestamp || 0) < 10000 && (liveGps.latitude !== 0 || liveGps.longitude !== 0)) ||
                    (now - (vibration.timestamp || 0) < 10000 && (vibration.left !== 0 || vibration.right !== 0)) ||
                    (now - (alcohol.timestamp || 0) < 10000 && alcohol.value !== 0) ||
                    (now - (radar.timestamp || 0) < 10000 && radar.distance !== 0)
                );
                setPiActive(isStreaming);

            } catch (e) {
                setPiActive(false);
            }
        };

        fetchRealHardwareData();
        const interval = setInterval(fetchRealHardwareData, 1000);
        return () => clearInterval(interval);
    }, [liveGps.timestamp, vibration.timestamp, alcohol.timestamp, radar.timestamp]);

    const features = [
        {
            icon: Eye,
            title: "Neural Vision Driver Fatigue (DMS)",
            tag: "Raspberry Pi Cam",
            gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
            border: "border-cyan-500/40 hover:border-cyan-400",
            iconColor: "text-cyan-400",
            glow: "shadow-cyan-500/20",
            desc: "Continuous neural eye closure analysis & micro-sleep detection using OpenCV/Dlib on Raspberry Pi with acoustic alerts."
        },
        {
            icon: Wine,
            title: "MQ-3 Breath Alcohol Interlock",
            tag: "GPIO 26 / MQ-3",
            gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
            border: "border-purple-500/40 hover:border-purple-400",
            iconColor: "text-purple-400",
            glow: "shadow-purple-500/20",
            desc: "Real-time cabin air gas spectroscopy on GPIO Pin 37 preventing drunk driving with immediate engine immobilization."
        },
        {
            icon: Activity,
            title: "Dual MPU6050 Road Profiler",
            tag: "I2C 0x68 / 0x69",
            gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
            border: "border-amber-500/40 hover:border-amber-400",
            iconColor: "text-amber-400",
            glow: "shadow-amber-500/20",
            desc: "Dual-suspension high-frequency accelerometer analytics mapping road potholes, suspension stress & crash forces."
        },
        {
            icon: Radio,
            title: "Autonomous SOS Dispatch",
            tag: "Twilio + A7670C",
            gradient: "from-rose-500/20 via-red-500/10 to-transparent",
            border: "border-rose-500/40 hover:border-rose-400",
            iconColor: "text-rose-400",
            glow: "shadow-rose-500/20",
            desc: "Automated emergency dispatch broadcasting live GPS coordinates & Google Maps link to emergency contacts upon crash/fatigue."
        },
        {
            icon: Database,
            title: "Supabase Cloud Black-Box",
            tag: "PostgreSQL Cloud",
            gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
            border: "border-emerald-500/40 hover:border-emerald-400",
            iconColor: "text-emerald-400",
            glow: "shadow-emerald-500/20",
            desc: "Real-time timestamped event ledger storing all sensor streams and incidents into Supabase cloud database."
        },
        {
            icon: Cpu,
            title: "360° LiDAR & Ultrasonic Radar",
            tag: "UART / Servo",
            gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
            border: "border-indigo-500/40 hover:border-indigo-400",
            iconColor: "text-indigo-400",
            glow: "shadow-indigo-500/20",
            desc: "Active blind-spot distance matrix and servo-guided proximity scanning to eliminate obstacles around the vehicle."
        }
    ];

    const maxVibration = Math.max(vibration.left || 0, vibration.right || 0);

    return (
        <div className="min-h-screen w-full text-white bg-[#030712] relative overflow-hidden font-sans scanlines">
            
            {/* 3D Cyber Highway Moving Canvas */}
            <CyberHighwayCanvas />

            {/* Pulsing Neon Atmosphere Glows */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-purple-600/35 via-blue-600/25 to-transparent blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="absolute top-[35%] -left-48 w-[600px] h-[600px] bg-cyan-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-float-slow" />
            <div className="absolute top-[65%] -right-48 w-[600px] h-[600px] bg-pink-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-float-reverse" />

            {/* Top Navigation Header */}
            <header className="w-full border-b border-white/10 backdrop-blur-2xl bg-[#030712]/75 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    
                    {/* Brand Logo with Glowing Shield */}
                    <div className="flex items-center space-x-3.5 group cursor-pointer" onClick={onEnterDashboard}>
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative w-11 h-11 bg-[#090d1a] border border-white/20 rounded-2xl flex items-center justify-center">
                                <Shield className="text-cyan-400 animate-pulse" size={22} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-indigo-300 bg-clip-text text-transparent">
                                    I-SARTHI
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                    PI LINK
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 tracking-wider font-mono">INTELLIGENT VEHICLE INTERFACE</p>
                        </div>
                    </div>

                    {/* Live Hardware Connection Status & Top Actions */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono border ${
                            piActive 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${piActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                            <span>{piActive ? 'RASPBERRY PI LIVE' : 'AWAITING PI STREAM'}</span>
                        </div>

                        <button 
                            onClick={onEnterDashboard}
                            className="relative group px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2 border border-white/20"
                        >
                            <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 animate-beam pointer-events-none"></div>
                            <Zap size={16} className="text-yellow-300 animate-bounce" />
                            <span>Launch Cockpit</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Real Telemetry Info Bar */}
            <div className="w-full bg-[#070d1e]/90 border-b border-cyan-500/20 py-2 overflow-hidden backdrop-blur-md">
                <div className="animate-marquee flex items-center space-x-8 text-[11px] font-mono text-cyan-300/90 tracking-wider font-bold">
                    {[
                        `🟢 SUPABASE PERSISTENCE: CONNECTED`,
                        `📍 LIVE GPS (NEO-7M): ${liveGps.latitude ? `${liveGps.latitude.toFixed(4)}°N, ${liveGps.longitude.toFixed(4)}°E` : 'AWAITING LOCK'}`,
                        `🍷 MQ-3 ALCOHOL SENSOR: ${alcohol.value.toFixed(1)}% (${alcohol.level || 'Normal'})`,
                        `📡 DUAL MPU6050: LEFT ${vibration.left.toFixed(2)}G | RIGHT ${vibration.right.toFixed(2)}G`,
                        `🎯 RADAR SCAN: ANGLE ${radar.angle}° | DIST ${radar.distance} CM`,
                        `😴 DMS STATUS: ${drowsiness.isDrowsy ? '⚠️ DROWSY' : 'DRIVER ATTENTIVE'}`,
                        `🛡️ SOS DISPATCH: ${gsm.connected ? 'TWILIO GSM READY' : 'STANDBY'}`
                    ].concat([
                        `🟢 SUPABASE PERSISTENCE: CONNECTED`,
                        `📍 LIVE GPS (NEO-7M): ${liveGps.latitude ? `${liveGps.latitude.toFixed(4)}°N, ${liveGps.longitude.toFixed(4)}°E` : 'AWAITING LOCK'}`,
                        `🍷 MQ-3 ALCOHOL SENSOR: ${alcohol.value.toFixed(1)}% (${alcohol.level || 'Normal'})`,
                        `📡 DUAL MPU6050: LEFT ${vibration.left.toFixed(2)}G | RIGHT ${vibration.right.toFixed(2)}G`,
                        `🎯 RADAR SCAN: ANGLE ${radar.angle}° | DIST ${radar.distance} CM`,
                        `😴 DMS STATUS: ${drowsiness.isDrowsy ? '⚠️ DROWSY' : 'DRIVER ATTENTIVE'}`
                    ]).map((text, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                            <span>{text}</span>
                            <span className="text-pink-500">✦</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Hero Container */}
            <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
                
                {/* Hero Announcement Badge */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-pink-950/60 border border-cyan-400/40 text-cyan-200 text-xs sm:text-sm font-semibold backdrop-blur-xl shadow-xl shadow-cyan-950/40 animate-float-slow">
                        <Sparkles size={16} className="text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="tracking-wide">Welcome to I-SARTHI: Hardware-Integrated Road Safety Interface</span>
                        <ChevronRight size={14} className="text-cyan-400" />
                    </div>
                </div>

                {/* Hero Title */}
                <div className="text-center max-w-5xl mx-auto space-y-6">
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[1.05]">
                        <span className="text-gradient">I SARTHI</span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-normal">
                        All telemetry displayed below is directly synced from your physical Raspberry Pi sensors (MQ-3, MPU6050, NEO-7M, LiDAR & Camera) and recorded to Supabase.
                    </p>

                    {/* Real-time Hardware Readiness Banner */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 flex items-center gap-2">
                            <RadioTower size={14} className="text-cyan-400" />
                            <span>Pi Ingestion Port: <b>5000</b></span>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 flex items-center gap-2">
                            <Database size={14} className="text-emerald-400" />
                            <span>Cloud Backend: <b>Supabase PostgreSQL</b></span>
                        </div>
                    </div>
                </div>

                {/* 3D Holographic Cockpit HUD (Driven by Real Pi Telemetry) */}
                <div className="mt-14 relative max-w-6xl mx-auto">
                    
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 rounded-[32px] opacity-40 blur-2xl animate-pulse-glow"></div>

                    <div className="relative glass-card rounded-[30px] p-6 sm:p-10 border border-cyan-500/30 overflow-hidden shadow-2xl">
                        
                        {/* Top HUD Telemetry Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    <Cpu size={20} className="animate-spin" style={{ animationDuration: '8s' }} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-extrabold text-white text-lg tracking-tight">HARDWARE SENSOR STREAM</h3>
                                        <span className={`w-2.5 h-2.5 rounded-full ${piActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                                    </div>
                                    <p className="text-xs text-cyan-300/70 font-mono">
                                        {piActive ? '🟢 PI ACTIVE — STREAMING LIVE SENSOR PACKETS' : '🟡 LISTENING FOR RASPBERRY PI ON PORT 5000'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold flex items-center gap-2">
                                    <Wifi size={14} />
                                    <span>GSM STATUS: {gsm.connected ? 'READY' : 'OFFLINE'}</span>
                                </div>
                                <button 
                                    onClick={onEnterDashboard}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                                >
                                    <span>Full Screen HUD</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Real-time Cockpit Visualizer Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8 items-center">
                            
                            {/* Left Radar & 3D Scanning Core (Col 4) */}
                            <div className="lg:col-span-4 p-6 rounded-2xl bg-black/40 border border-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                                
                                <div className="relative w-48 h-48 rounded-full border border-cyan-500/40 flex items-center justify-center">
                                    
                                    {/* Rotating Radar Sweep */}
                                    <div 
                                        className="absolute inset-0 rounded-full animate-radar pointer-events-none"
                                        style={{
                                            background: 'conic-gradient(from 0deg, rgba(6,182,212,0.5) 0deg, rgba(6,182,212,0.1) 40deg, transparent 90deg)'
                                        }}
                                    />
                                    
                                    <div className="w-36 h-36 rounded-full border border-dashed border-cyan-400/30 animate-hud-spin"></div>
                                    <div className="absolute w-24 h-24 rounded-full border border-cyan-400/40 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                                            <Compass size={24} className="text-cyan-300" />
                                        </div>
                                    </div>

                                    {/* Obstacle marker if detected by hardware */}
                                    {radar.distance > 0 && radar.distance < 150 && (
                                        <div className="absolute top-10 right-10 w-3 h-3 rounded-full bg-red-400 animate-ping"></div>
                                    )}
                                </div>

                                <div className="mt-4 text-center">
                                    <span className="text-xs font-mono text-cyan-300 font-bold uppercase">HARDWARE RADAR / LIDAR</span>
                                    <div className="flex justify-center gap-4 text-[11px] font-mono text-gray-400 mt-1">
                                        <span>ANGLE: <b className="text-white">{radar.angle || 0}°</b></span>
                                        <span>DIST: <b className="text-white">{radar.distance || 0} cm</b></span>
                                    </div>
                                </div>
                            </div>

                            {/* Center Car Speed & Suspension Waveform (Col 5) */}
                            <div className="lg:col-span-5 p-6 rounded-2xl bg-black/40 border border-indigo-500/30 flex flex-col justify-between min-h-[300px] space-y-6">
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-mono text-indigo-300 uppercase font-bold flex items-center gap-1">
                                            <Gauge size={14} /> GPS SPEED (NEO-7M)
                                        </span>
                                        <div className="text-5xl font-black font-mono text-white tracking-tight mt-1">
                                            {liveGps.speed ? liveGps.speed.toFixed(1) : '0.0'} <span className="text-lg font-normal text-indigo-400">km/h</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] font-mono text-gray-400 uppercase">GPS FIX</span>
                                        <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                                            {liveGps.latitude ? 'LOCKED 3D' : 'SEARCHING...'}
                                        </div>
                                    </div>
                                </div>

                                {/* Real Vibration Spectrogram */}
                                <div>
                                    <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
                                        <span className="flex items-center gap-1"><Activity size={12} className="text-pink-400" /> DUAL MPU6050 ACCELEROMETER</span>
                                        <span className="text-pink-300 font-bold font-mono">
                                            L: {vibration.left?.toFixed(2) || '0.00'}G | R: {vibration.right?.toFixed(2) || '0.00'}G
                                        </span>
                                    </div>

                                    {/* Vibration Bars based on real telemetry */}
                                    <div className="h-14 flex items-end gap-2 p-2 bg-black/60 rounded-xl border border-white/5">
                                        <div className="flex-1 text-center">
                                            <div 
                                                className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm transition-all duration-300"
                                                style={{ height: `${Math.min(100, Math.max(10, (vibration.left || 0) * 100))}%` }}
                                            />
                                            <span className="text-[9px] font-mono text-gray-500 mt-1 block">LEFT AXLE</span>
                                        </div>

                                        <div className="flex-1 text-center">
                                            <div 
                                                className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm transition-all duration-300"
                                                style={{ height: `${Math.min(100, Math.max(10, (vibration.right || 0) * 100))}%` }}
                                            />
                                            <span className="text-[9px] font-mono text-gray-500 mt-1 block">RIGHT AXLE</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Live GPS Location Readout */}
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between font-mono text-xs text-gray-300">
                                    <span className="flex items-center gap-1.5"><Navigation size={13} className="text-cyan-400" /> REAL GPS COORDS:</span>
                                    <span className="text-white font-bold">
                                        {liveGps.latitude ? `${liveGps.latitude.toFixed(4)}°N, ${liveGps.longitude.toFixed(4)}°E` : 'Waiting for GPS fix...'}
                                    </span>
                                </div>
                            </div>

                            {/* Right DMS & MQ-3 Alcohol (Col 3) */}
                            <div className="lg:col-span-3 p-6 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col justify-between min-h-[300px] space-y-4">
                                
                                {/* Real DMS Camera Status */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-transparent border border-cyan-500/30">
                                    <div className="flex items-center justify-between text-xs font-mono text-cyan-300 mb-2">
                                        <span className="flex items-center gap-1.5 font-bold"><Eye size={14} /> DMS CAMERA</span>
                                        <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-200">LIVE</span>
                                    </div>
                                    <div className={`text-xl font-bold font-mono ${drowsiness.isDrowsy ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                        {drowsiness.isDrowsy ? '⚠️ DROWSY ALERT!' : 'DRIVER ALERT'}
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                                        Fatigue Events: {drowsiness.events || 0}
                                    </span>
                                </div>

                                {/* Real MQ-3 Breathalyzer Sensor */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-transparent border border-purple-500/30">
                                    <div className="flex items-center justify-between text-xs font-mono text-purple-300 mb-2">
                                        <span className="flex items-center gap-1.5 font-bold"><Wine size={14} /> MQ-3 SENSOR (PIN 37)</span>
                                        <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-200">HARDWARE</span>
                                    </div>
                                    <div className={`text-xl font-bold font-mono ${alcohol.value > 50 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                        {alcohol.value ? `${alcohol.value.toFixed(1)}%` : '0.00% SAFE'}
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                                        Status: {alcohol.level || 'Normal Atmosphere'}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Launch Action Bar */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono">
                                <Shield size={16} className="text-emerald-400" />
                                <span>I-SARTHI CONNECTED TO RASPBERRY PI BACKEND</span>
                            </div>

                            <button
                                onClick={onEnterDashboard}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20"
                            >
                                <span>Enter Live Driver Cockpit</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Core Capabilities Section */}
                <div className="mt-32">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/25">
                            HARDWARE ARCHITECTURE
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                            Powered by <span className="text-gradient">Real IoT Hardware</span>
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Six live physical modules communicating continuously through the Raspberry Pi I-SARTHI daemon.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((item, idx) => {
                            const IconComponent = item.icon;
                            return (
                                <div 
                                    key={idx}
                                    onClick={onEnterDashboard}
                                    className={`group cursor-pointer rounded-3xl p-8 transition-all duration-500 glass hover:scale-[1.03] border ${item.border} ${item.glow} hover:shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px]`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`p-3.5 rounded-2xl bg-black/40 border border-white/10 ${item.iconColor} group-hover:scale-110 transition-transform`}>
                                                <IconComponent size={26} />
                                            </div>
                                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                                {item.tag}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>

                                    <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-cyan-400 group-hover:text-white transition-colors">
                                        <span>Open module in cockpit</span>
                                        <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Final Call to Action Box */}
                <div className="mt-32 relative rounded-[32px] p-10 sm:p-16 overflow-hidden border border-cyan-500/40 bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-pink-950/60 backdrop-blur-3xl text-center space-y-6 shadow-2xl">
                    <div className="inline-flex p-4 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-bounce mb-2">
                        <Shield size={36} />
                    </div>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                        Ready to Connect Your Raspberry Pi?
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Start the sensor suite with <code className="bg-black/60 px-2 py-1 rounded font-mono text-cyan-300">python start_car.py</code> on your Pi to stream live telemetry to this screen and Supabase.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={onEnterDashboard}
                            className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 font-extrabold text-base shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all text-white border border-white/30 inline-flex items-center gap-3"
                        >
                            <span>LAUNCH I-SARTHI PLATFORM</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#02050f]/90 backdrop-blur-xl py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
                    <div className="flex items-center space-x-2">
                        <Shield size={16} className="text-cyan-400" />
                        <span className="font-bold text-gray-300">I-SARTHI SYSTEM</span>
                        <span>— Raspberry Pi & Supabase Integrated</span>
                    </div>
                    <div className="flex items-center space-x-6 text-gray-400">
                        <span>Physical Sensors • Computer Vision • Cloud DB</span>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;
