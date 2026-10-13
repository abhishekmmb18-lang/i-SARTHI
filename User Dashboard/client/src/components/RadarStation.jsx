import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, 
    Activity, 
    Radio, 
    Cpu, 
    Gauge, 
    Sparkles, 
    Compass, 
    AlertTriangle, 
    CheckCircle2, 
    Car, 
    ExternalLink, 
    Wifi, 
    Zap,
    Sliders,
    Target,
    Radar,
    Maximize2,
    RotateCw,
    ShieldAlert,
    RadioTower,
    Scan,
    RadioReceiver
} from 'lucide-react';

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

const RadarStation = () => {
    // 100% Real Hardware State from Raspberry Pi (No Mock / Dummy Data)
    const [radar, setRadar] = useState({ angle: 0, distance: 0 });
    const [piConnected, setPiConnected] = useState(false);
    const [lastPacketTime, setLastPacketTime] = useState(null);

    // Live Hardware Telemetry Poller
    useEffect(() => {
        const fetchRadarTelemetry = async () => {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            try {
                const resRad = await fetch(`${BASE_URL}/api/radar`);
                if (resRad.ok) {
                    const rad = await resRad.json();
                    setRadar(rad);
                    
                    if (rad.distance > 0 || rad.angle > 0) {
                        setPiConnected(true);
                        setLastPacketTime(new Date().toLocaleTimeString());
                    }
                }
            } catch (err) {
                setPiConnected(false);
            }
        };

        fetchRadarTelemetry();
        const interval = setInterval(fetchRadarTelemetry, 800);
        return () => clearInterval(interval);
    }, []);

    const activeAngle = radar.angle || 0;
    const activeDistance = radar.distance || 0;

    // Polar-to-Cartesian obstacle projection around the vehicle
    const clampedDist = Math.max(20, Math.min(240, activeDistance));
    const pixelRadius = 50 + (clampedDist / 240) * 160;
    
    // Offset by -90 deg so 0 deg is front
    const rad = (activeAngle - 90) * (Math.PI / 180);
    const obstacleX = Math.cos(rad) * pixelRadius;
    const obstacleY = Math.sin(rad) * pixelRadius;

    // Real Hardware Threat proximity level
    const isCritical = activeDistance > 0 && activeDistance < 60;
    const isWarning = activeDistance >= 60 && activeDistance < 130;
    const hasObstacle = activeDistance > 0 && activeDistance < 240;

    return (
        <div className="w-full relative min-h-screen scanlines selection:bg-cyan-500 selection:text-white">
            
            {/* 60 FPS 3D Cyber Highway Animated Canvas Background */}
            <CyberHighwayCanvas />

            {/* Ambient Multi-layer Glowing Orbs */}
            <div className="fixed top-0 left-1/3 w-[900px] h-[550px] bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-indigo-600/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-float-slow" />

            <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 text-white relative flex flex-col gap-6 pb-24">
                
                {/* 1. TOP HEADER & TELEMETRY STATUS */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-cyan-500/30 shadow-2xl">
                    <div className="flex items-center space-x-3.5">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/30 text-white">
                            <Radar size={28} className="animate-spin" style={{ animationDuration: '14s' }} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                    360° LiDAR Radar Station
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    HARDWARE LINK
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                Physical 360° Servo LiDAR Point-Cloud Stream & Collision Guard
                            </p>
                        </div>
                    </div>

                    {/* Hardware Link Badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className={`px-4 py-2 rounded-full text-xs font-mono font-bold border flex items-center gap-2 ${
                            piConnected 
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${piConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                            <span>{piConnected ? '🟢 RASPBERRY PI STREAM LIVE' : '🟡 AWAITING PI STREAM ON PORT 5000'}</span>
                        </div>
                    </div>
                </div>

                {/* 2. MASTER FULL-SCREEN 3D CAR LIDAR STATION HERO */}
                <div className="relative w-full h-[480px] sm:h-[580px] rounded-[36px] glass-card border border-cyan-500/40 p-6 sm:p-10 flex flex-col items-center justify-center overflow-hidden shadow-2xl shadow-cyan-950/60">
                    
                    {/* Background Light Beam Sweep */}
                    <div className="absolute inset-0 w-1/2 h-full bg-white/5 transform -skew-x-12 animate-beam pointer-events-none" />

                    {/* Concentric LiDAR Range Distance Rings */}
                    <div className="absolute w-[140px] h-[140px] rounded-full border border-cyan-500/15 pointer-events-none flex items-center justify-center">
                        <span className="absolute top-1 text-[8px] font-mono text-cyan-400/50">50 cm</span>
                    </div>
                    <div className="absolute w-[240px] h-[240px] rounded-full border border-cyan-500/20 pointer-events-none flex items-center justify-center">
                        <span className="absolute top-1 text-[8px] font-mono text-cyan-400/50">100 cm</span>
                    </div>
                    <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-cyan-400/25 animate-hud-spin pointer-events-none flex items-center justify-center">
                        <span className="absolute top-1 text-[9px] font-mono text-cyan-400/50">150 cm</span>
                    </div>
                    <div className="absolute w-[480px] h-[480px] rounded-full border border-blue-500/20 animate-hud-spin-reverse pointer-events-none flex items-center justify-center">
                        <span className="absolute top-1 text-[9px] font-mono text-blue-400/50">200 cm</span>
                    </div>

                    {/* Continuous Conic 360° LiDAR Radar Sweep Beam */}
                    <div 
                        className="absolute w-[480px] h-[480px] rounded-full animate-radar pointer-events-none"
                        style={{
                            background: 'conic-gradient(from 0deg, rgba(6,182,212,0.45) 0deg, rgba(6,182,212,0.08) 45deg, transparent 90deg)'
                        }}
                    />

                    {/* Threat Status Pill in Center Top */}
                    <div className="absolute top-6 left-8 flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-black border flex items-center gap-2 shadow-xl ${
                            isCritical 
                                ? 'bg-red-600/30 border-red-500 text-red-300 animate-bounce' 
                                : isWarning 
                                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 animate-pulse' 
                                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        }`}>
                            <AlertTriangle size={14} className={isCritical ? 'text-red-400 animate-spin' : ''} />
                            <span>{isCritical ? '🛑 CRITICAL COLLISION PROXIMITY' : isWarning ? '⚠️ CAUTION: OBJECT NEARBY' : 'RADAR CLEAR — PATH SAFE'}</span>
                        </div>
                    </div>

                    <div className="absolute top-6 right-8 hidden sm:flex items-center gap-4 text-xs font-mono text-gray-400 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                        <span>LIDAR ANGLE: <b className="text-cyan-300">{activeAngle}°</b></span>
                        <span>DISTANCE: <b className={isCritical ? 'text-red-400' : 'text-emerald-400'}>{activeDistance ? `${activeDistance} cm` : 'Path Clear'}</b></span>
                    </div>

                    {/* 3D CAR CHASSIS MODEL & LASER TARGET SYSTEM */}
                    <div className="relative z-10 flex flex-col items-center justify-center scale-95 sm:scale-110 transition-transform">
                        
                        {/* Dynamic Laser Line to Real Obstacle */}
                        {hasObstacle && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                                <line
                                    x1="0"
                                    y1="0"
                                    x2={obstacleX}
                                    y2={obstacleY}
                                    stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#06b6d4'}
                                    strokeWidth="3"
                                    strokeDasharray="5 5"
                                    className="animate-pulse"
                                />
                            </svg>
                        )}

                        {/* Real Detected 3D Obstacle Target Object */}
                        {hasObstacle && (
                            <div 
                                className="absolute z-30 transition-all duration-300 pointer-events-none flex flex-col items-center"
                                style={{
                                    transform: `translate(${obstacleX}px, ${obstacleY}px)`
                                }}
                            >
                                <div className={`relative p-2.5 rounded-2xl border flex items-center justify-center shadow-2xl ${
                                    isCritical 
                                        ? 'bg-red-600/90 border-red-300 text-white shadow-red-600/70 animate-bounce' 
                                        : isWarning 
                                            ? 'bg-amber-500/90 border-amber-200 text-black shadow-amber-500/60 animate-pulse' 
                                            : 'bg-cyan-500/80 border-cyan-200 text-white shadow-cyan-500/60'
                                }`}>
                                    <Target size={20} className="animate-spin" style={{ animationDuration: '4s' }} />
                                </div>
                                
                                <div className="mt-1 px-2.5 py-1 rounded-xl bg-black/90 border border-white/20 text-[10px] font-mono font-black text-white whitespace-nowrap shadow-2xl">
                                    ⚠️ {activeDistance} cm ({activeAngle}°)
                                </div>
                            </div>
                        )}

                        {/* Headlights Light Beams */}
                        <div className="absolute -top-20 flex justify-between w-28">
                            <div className="w-12 h-24 bg-gradient-to-t from-cyan-400/60 via-cyan-400/15 to-transparent blur-md transform -rotate-12 rounded-t-full"></div>
                            <div className="w-12 h-24 bg-gradient-to-t from-cyan-400/60 via-cyan-400/15 to-transparent blur-md transform rotate-12 rounded-t-full"></div>
                        </div>

                        {/* High-Detail 3D Car Chassis Body */}
                        <div className="relative w-32 h-52 rounded-[40px] bg-gradient-to-b from-[#0e244d] via-[#091733] to-[#040a18] border-2 border-cyan-400 shadow-[0_0_45px_rgba(6,182,212,0.45)] flex flex-col items-center justify-between p-4">
                            
                            {/* Front Aerodynamic Windshield */}
                            <div className="w-24 h-12 rounded-t-2xl bg-cyan-500/25 border border-cyan-400/50 flex items-center justify-center shadow-inner">
                                <span className="text-[9px] font-mono text-cyan-200 font-bold tracking-wider">WINDSHIELD</span>
                            </div>

                            {/* Center Roof 360° LiDAR Dome Emitter */}
                            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 border-2 border-white flex items-center justify-center shadow-[0_0_20px_#06b6d4]">
                                <Compass size={20} className="text-white animate-spin" style={{ animationDuration: '6s' }} />
                                <span className="absolute -inset-1 rounded-full border border-cyan-300 animate-ping opacity-80" />
                            </div>

                            {/* Rear Windshield */}
                            <div className="w-24 h-9 rounded-b-2xl bg-indigo-500/25 border border-indigo-400/50 flex items-center justify-center">
                                <span className="text-[9px] font-mono text-indigo-200 font-bold tracking-wider">REAR</span>
                            </div>

                            {/* 4 Cyber Wheels */}
                            {/* Front Left */}
                            <div className="absolute -left-4 top-7 w-4 h-12 rounded-full bg-cyan-400 shadow-[0_0_15px_#06b6d4] animate-pulse" />
                            {/* Front Right */}
                            <div className="absolute -right-4 top-7 w-4 h-12 rounded-full bg-cyan-400 shadow-[0_0_15px_#06b6d4] animate-pulse" />
                            {/* Rear Left */}
                            <div className="absolute -left-4 bottom-7 w-4 h-12 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-pulse" />
                            {/* Rear Right */}
                            <div className="absolute -right-4 bottom-7 w-4 h-12 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-pulse" />
                        </div>

                        {/* Taillights Red Glow */}
                        <div className="absolute -bottom-7 flex justify-between w-24">
                            <div className="w-8 h-9 bg-red-500/60 blur-sm rounded-full"></div>
                            <div className="w-8 h-9 bg-red-500/60 blur-sm rounded-full"></div>
                        </div>
                    </div>

                    {/* Bottom Status Bar inside the radar hero */}
                    <div className="absolute bottom-4 w-full px-8 flex items-center justify-between text-xs font-mono text-gray-400 border-t border-white/10 pt-3">
                        <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                            <Scan size={15} />
                            <span>LIDAR MATRIX: <b>ACTIVE 360°</b></span>
                        </span>

                        <span className="text-gray-300 hidden md:inline">
                            RADAR RANGE: <b>0.2m - 4.0m</b>
                        </span>

                        <span className="text-emerald-400 font-bold">
                            COLLISION OVERRIDE: READY
                        </span>
                    </div>
                </div>

                {/* 3. HARDWARE OBSTACLE QUADRANTS & SPECIFICATION DIAGNOSTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left: 4-Quadrant Sector Breakdown (Col 7) */}
                    <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 glass-card border border-cyan-500/30 flex flex-col justify-between space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-2">
                                <Shield size={16} /> BLIND SPOT & QUADRANT SECTORS
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">60 FPS</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                                <span className="text-[10px] font-mono text-gray-400 uppercase">FRONT RADAR (45° - 135°)</span>
                                <div className="text-xl font-bold font-mono text-cyan-300">
                                    {activeAngle >= 45 && activeAngle <= 135 && activeDistance > 0 ? `${activeDistance} cm (DETECTED)` : 'Path Clear'}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                                <span className="text-[10px] font-mono text-gray-400 uppercase">RIGHT FLANK (135° - 225°)</span>
                                <div className="text-xl font-bold font-mono text-indigo-300">
                                    {activeAngle > 135 && activeAngle <= 225 && activeDistance > 0 ? `${activeDistance} cm (DETECTED)` : 'Path Clear'}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                                <span className="text-[10px] font-mono text-gray-400 uppercase">REAR SECTOR (225° - 315°)</span>
                                <div className="text-xl font-bold font-mono text-purple-300">
                                    {activeAngle > 225 && activeAngle <= 315 && activeDistance > 0 ? `${activeDistance} cm (DETECTED)` : 'Path Clear'}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                                <span className="text-[10px] font-mono text-gray-400 uppercase">LEFT FLANK (315° - 45°)</span>
                                <div className="text-xl font-bold font-mono text-emerald-300">
                                    {(activeAngle > 315 || activeAngle < 45) && activeDistance > 0 ? `${activeDistance} cm (DETECTED)` : 'Path Clear'}
                                </div>
                            </div>
                        </div>

                        <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between border-t border-white/5 pt-3">
                            <span>Ingestion Endpoint: <b className="text-white">POST /api/radar</b></span>
                            <span className="text-cyan-400">Point-Cloud Ledger Sync</span>
                        </div>
                    </div>

                    {/* Right: Real Hardware Diagnostics & Specs Deck (Col 5) */}
                    <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 glass-card border border-white/10 flex flex-col justify-between space-y-4 shadow-2xl">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-2">
                                    <RadioTower size={16} /> HARDWARE SPECIFICATIONS
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">
                                    {lastPacketTime ? `Last Packet: ${lastPacketTime}` : 'Awaiting Packets'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                Live status of physical sensor link connected to Raspberry Pi:
                            </p>
                        </div>

                        <div className="space-y-2.5 font-mono text-xs">
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-gray-400">Sensor Model</span>
                                <span className="text-white font-bold">360° LiDAR / Ultrasonic Servo</span>
                            </div>

                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-gray-400">Active Sweep Angle</span>
                                <span className="text-cyan-300 font-bold">{activeAngle}°</span>
                            </div>

                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-gray-400">Measured Distance</span>
                                <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {activeDistance ? `${activeDistance} cm` : '0 cm (Clear)'}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-gray-400">Collision Avoidance Override</span>
                                <span className="text-emerald-400 font-bold">ARMED</span>
                            </div>
                        </div>

                        <div className="text-[11px] font-mono text-gray-500 flex items-center justify-between border-t border-white/5 pt-3">
                            <span>Daemon: <b>python radar_system.py</b></span>
                            <span className="text-cyan-400">Port 5000</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default RadarStation;
