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
    RadioReceiver,
    Eye,
    Layers,
    Trash2,
    RefreshCw
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

        const numLines = 45;
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
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
                ctx.moveTo(x, height);
                ctx.lineTo(width / 2, horizonY);
                ctx.stroke();
            }

            const numHoriz = 12;
            for (let i = 0; i < numHoriz; i++) {
                const progress = ((i + (offset % 1)) / numHoriz);
                const lineY = horizonY + Math.pow(progress, 2.4) * (height - horizonY);
                const alpha = Math.min(progress * 0.35, 0.2);

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
                p.z -= 8;
                if (p.z <= 0) {
                    p.z = width;
                    p.x = (Math.random() - 0.5) * width * 2;
                    p.y = (Math.random() - 0.5) * height * 2;
                }

                const k = perspectiveDist / p.z;
                const px = p.x * k + cx;
                const py = p.y * k + cy;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = Math.max(0.7, (1 - p.z / width) * 2.5);
                    const alpha = (1 - p.z / width);

                    ctx.beginPath();
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha;
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();
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

// ==========================================
// FULL 3D INTERACTIVE LIDAR POINT CLOUD CANVAS
// ==========================================
const Lidar3DPointCloudCanvas = ({ points, activeAngle, activeDistance, viewMode, autoRotate }) => {
    const canvasRef = useRef(null);
    const rotationRef = useRef({ yaw: 0.35, pitch: 0.45 });
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const zoomRef = useRef(1.0);

    // Mouse orbit controls
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const onMouseDown = (e) => {
            isDraggingRef.current = true;
            lastMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            const dx = e.clientX - lastMouseRef.current.x;
            const dy = e.clientY - lastMouseRef.current.y;
            rotationRef.current.yaw += dx * 0.008;
            rotationRef.current.pitch = Math.max(-0.2, Math.min(1.4, rotationRef.current.pitch + dy * 0.008));
            lastMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseUp = () => {
            isDraggingRef.current = false;
        };

        const onWheel = (e) => {
            e.preventDefault();
            zoomRef.current = Math.max(0.5, Math.min(2.5, zoomRef.current - e.deltaY * 0.0015));
        };

        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('wheel', onWheel);
        };
    }, []);

    // Set fixed view angles per viewMode
    useEffect(() => {
        if (viewMode === 'top') {
            rotationRef.current = { yaw: 0, pitch: 1.57 }; // 90 deg down
            zoomRef.current = 1.0;
        } else if (viewMode === 'fpv') {
            rotationRef.current = { yaw: 0, pitch: 0.08 }; // Cockpit forward
            zoomRef.current = 1.35;
        } else {
            rotationRef.current = { yaw: 0.4, pitch: 0.5 }; // 3D Orbit
        }
    }, [viewMode]);

    // Render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const render = () => {
            const width = canvas.width = canvas.parentElement.clientWidth;
            const height = canvas.height = canvas.parentElement.clientHeight;
            ctx.clearRect(0, 0, width, height);

            if (autoRotate && !isDraggingRef.current && viewMode === '3d') {
                rotationRef.current.yaw += 0.005;
            }

            const yaw = rotationRef.current.yaw;
            const pitch = rotationRef.current.pitch;
            const zoom = zoomRef.current;

            const cx = width / 2;
            const cy = height / 2 + (viewMode === 'fpv' ? 60 : 20);

            // 3D Perspective Projection function
            const project3D = (x, y, z) => {
                // Rotate around Z axis (yaw)
                const cosY = Math.cos(yaw);
                const sinY = Math.sin(yaw);
                const x1 = x * cosY - y * sinY;
                const y1 = x * sinY + y * cosY;
                const z1 = z;

                // Rotate around X axis (pitch)
                const cosP = Math.cos(pitch);
                const sinP = Math.sin(pitch);
                const y2 = y1 * cosP - z1 * sinP;
                const z2 = y1 * sinP + z1 * cosP;
                const x2 = x1;

                // Perspective camera distance
                const fov = 420 * zoom;
                const cameraDist = 340;
                const depth = y2 + cameraDist;
                if (depth <= 10) return null;

                const scale = fov / depth;
                return {
                    x: cx + x2 * scale,
                    y: cy - z2 * scale,
                    scale: scale,
                    depth: depth
                };
            };

            // 1. Draw 3D Ground Grid Lines
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
            ctx.lineWidth = 1;
            const gridSize = 220;
            const step = 40;

            for (let g = -gridSize; g <= gridSize; g += step) {
                const p1 = project3D(g, -gridSize, 0);
                const p2 = project3D(g, gridSize, 0);
                if (p1 && p2) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }

                const p3 = project3D(-gridSize, g, 0);
                const p4 = project3D(gridSize, g, 0);
                if (p3 && p4) {
                    ctx.beginPath();
                    ctx.moveTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.stroke();
                }
            }

            // 2. Draw Concentric 3D Range Rings (50cm, 100cm, 150cm, 200cm)
            const ringRadii = [50, 100, 150, 200];
            ringRadii.forEach((r, idx) => {
                ctx.beginPath();
                ctx.strokeStyle = idx === 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.2)';
                ctx.setLineDash([4, 4]);

                let first = true;
                for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.12) {
                    const rx = Math.cos(a) * r;
                    const ry = Math.sin(a) * r;
                    const pr = project3D(rx, ry, 0);
                    if (pr) {
                        if (first) {
                            ctx.moveTo(pr.x, pr.y);
                            first = false;
                        } else {
                            ctx.lineTo(pr.x, pr.y);
                        }
                    }
                }
                ctx.stroke();
                ctx.setLineDash([]);
            });

            // 3. Draw 3D Wireframe Cyber Car at Center (0, 0, 0)
            const carW = 34; // Half-width
            const carL = 60; // Half-length
            const carH = 22; // Height

            const carCorners = [
                // Bottom chassis
                [-carW, -carL, 4], [carW, -carL, 4], [carW, carL, 4], [-carW, carL, 4],
                // Cabin top
                [-carW * 0.75, -carL * 0.45, carH], [carW * 0.75, -carL * 0.45, carH],
                [carW * 0.75, carL * 0.4, carH], [-carW * 0.75, carL * 0.4, carH]
            ];

            const projectedCorners = carCorners.map(c => project3D(c[0], c[1], c[2]));

            // Draw Bottom Box
            if (projectedCorners[0] && projectedCorners[1] && projectedCorners[2] && projectedCorners[3]) {
                ctx.beginPath();
                ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
                ctx.strokeStyle = '#06b6d4';
                ctx.lineWidth = 1.5;
                ctx.moveTo(projectedCorners[0].x, projectedCorners[0].y);
                ctx.lineTo(projectedCorners[1].x, projectedCorners[1].y);
                ctx.lineTo(projectedCorners[2].x, projectedCorners[2].y);
                ctx.lineTo(projectedCorners[3].x, projectedCorners[3].y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            // Draw Cabin Lines
            if (projectedCorners[4] && projectedCorners[5] && projectedCorners[6] && projectedCorners[7]) {
                ctx.beginPath();
                ctx.strokeStyle = '#38bdf8';
                ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
                ctx.moveTo(projectedCorners[4].x, projectedCorners[4].y);
                ctx.lineTo(projectedCorners[5].x, projectedCorners[5].y);
                ctx.lineTo(projectedCorners[6].x, projectedCorners[6].y);
                ctx.lineTo(projectedCorners[7].x, projectedCorners[7].y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Pillars
                [0, 1, 2, 3].forEach(i => {
                    if (projectedCorners[i] && projectedCorners[i + 4]) {
                        ctx.beginPath();
                        ctx.moveTo(projectedCorners[i].x, projectedCorners[i].y);
                        ctx.lineTo(projectedCorners[i + 4].x, projectedCorners[i + 4].y);
                        ctx.stroke();
                    }
                });
            }

            // LiDAR Emitter Dome at Center Top
            const domeProj = project3D(0, 0, carH + 6);
            if (domeProj) {
                ctx.beginPath();
                ctx.arc(domeProj.x, domeProj.y, 6 * domeProj.scale, 0, Math.PI * 2);
                ctx.fillStyle = '#06b6d4';
                ctx.shadowColor = '#06b6d4';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // 4. Draw Active Sweep Laser Line
            const beamDist = 200;
            const beamAngleRad = (activeAngle - 90) * (Math.PI / 180);
            const beamEndX = Math.cos(beamAngleRad) * beamDist;
            const beamEndY = Math.sin(beamAngleRad) * beamDist;
            const beamStart = project3D(0, 0, carH + 6);
            const beamEnd = project3D(beamEndX, beamEndY, 0);

            if (beamStart && beamEnd) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
                ctx.lineWidth = 2;
                ctx.moveTo(beamStart.x, beamStart.y);
                ctx.lineTo(beamEnd.x, beamEnd.y);
                ctx.stroke();
            }

            // 5. Draw 3D Point Cloud Mesh & Obstacle Points
            // Sort points by depth for correct 3D occlusion
            const projectedPoints = points
                .map(pt => {
                    const rad = (pt.angle - 90) * (Math.PI / 180);
                    const wx = Math.cos(rad) * pt.distance;
                    const wy = Math.sin(rad) * pt.distance;
                    const wz = pt.z || 8; // Slight elevation
                    const proj = project3D(wx, wy, wz);
                    const groundProj = project3D(wx, wy, 0);
                    return {
                        ...pt,
                        proj,
                        groundProj,
                        depth: proj ? proj.depth : 9999
                    };
                })
                .filter(pt => pt.proj !== null)
                .sort((a, b) => b.depth - a.depth);

            // Connect adjacent points to draw continuous 3D Obstacle Boundary Envelope
            if (projectedPoints.length > 2) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
                ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
                ctx.lineWidth = 1.5;
                projectedPoints.forEach((pt, i) => {
                    if (i === 0) ctx.moveTo(pt.proj.x, pt.proj.y);
                    else ctx.lineTo(pt.proj.x, pt.proj.y);
                });
                ctx.stroke();
                ctx.fill();
            }

            // Render Point Cloud Voxels / Spheres
            projectedPoints.forEach(pt => {
                const color = pt.distance < 50 ? '#ef4444' : pt.distance < 110 ? '#f59e0b' : '#10b981';

                // Vertical height drop line down to ground
                if (pt.groundProj) {
                    ctx.beginPath();
                    ctx.strokeStyle = `${color}44`;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 3]);
                    ctx.moveTo(pt.groundProj.x, pt.groundProj.y);
                    ctx.lineTo(pt.proj.x, pt.proj.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                // Glowing Point Sphere
                ctx.beginPath();
                const radius = Math.max(3, 5 * pt.proj.scale);
                ctx.arc(pt.proj.x, pt.proj.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animId);
    }, [points, activeAngle, activeDistance, viewMode, autoRotate]);

    return (
        <canvas 
            ref={canvasRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing block"
        />
    );
};

const Dashboard = () => {
    const [radar, setRadar] = useState({ angle: 0, distance: 0 });
    const [piConnected, setPiConnected] = useState(false);
    const [lastPacketTime, setLastPacketTime] = useState(null);

    // 3D Point Cloud Persistence Buffer
    const [pointCloud, setPointCloud] = useState([]);
    const [viewMode, setViewMode] = useState('3d'); // '3d', 'top', 'fpv'
    const [autoRotate, setAutoRotate] = useState(true);

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

                        // Add valid point to 3D Point Cloud Buffer
                        if (rad.distance > 5 && rad.distance < 240) {
                            setPointCloud(prev => {
                                // Keep only the latest 140 points across the 360/180 degree sweeps
                                const filtered = prev.filter(p => Math.abs(p.angle - rad.angle) > 2);
                                return [...filtered, {
                                    angle: rad.angle,
                                    distance: rad.distance,
                                    z: 10 + Math.sin(rad.angle * 0.05) * 8, // Realistic ground contour height
                                    timestamp: Date.now()
                                }].slice(-160);
                            });
                        }
                    }
                }
            } catch (err) {
                setPiConnected(false);
            }
        };

        fetchRadarTelemetry();
        const interval = setInterval(fetchRadarTelemetry, 500);
        return () => clearInterval(interval);
    }, []);

    const activeAngle = radar.angle || 0;
    const activeDistance = radar.distance || 0;

    const isCritical = activeDistance > 0 && activeDistance < 50;
    const isWarning = activeDistance >= 50 && activeDistance < 110;

    // Nearest obstacle in the point cloud
    const nearestObstacle = pointCloud.reduce((min, p) => p.distance < min ? p.distance : min, activeDistance || 999);

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
                                    3D LiDAR Spatial Mapping Station
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    POINT CLOUD 3D
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                Real-Time 3D Volumetric Obstacle Point-Cloud & Spatial Radar Sweep
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
                            <span>{piConnected ? '🟢 RASPBERRY PI HARDWARE LINK ACTIVE' : '🟡 AWAITING PI TELEMETRY'}</span>
                        </div>
                    </div>
                </div>

                {/* 2. MASTER 3D PERSPECTIVE POINT CLOUD HERO */}
                <div className="relative w-full h-[520px] sm:h-[620px] rounded-[36px] glass-card border border-cyan-500/40 p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden shadow-2xl shadow-cyan-950/60">
                    
                    {/* View Controls & HUD Bar */}
                    <div className="absolute top-5 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
                        
                        {/* Threat Level Banner */}
                        <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-black border flex items-center gap-2 shadow-xl backdrop-blur-md ${
                            isCritical 
                                ? 'bg-red-600/30 border-red-500 text-red-300 animate-bounce' 
                                : isWarning 
                                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 animate-pulse' 
                                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        }`}>
                            <AlertTriangle size={14} className={isCritical ? 'text-red-400 animate-spin' : ''} />
                            <span>
                                {isCritical 
                                    ? `🛑 CRITICAL COLLISION PROXIMITY (${activeDistance} cm)` 
                                    : isWarning 
                                        ? `⚠️ CAUTION: OBSTACLE AT ${activeDistance} cm` 
                                        : 'RADAR CLEAR — PATH SAFE'}
                            </span>
                        </div>

                        {/* Interactive View Mode Buttons */}
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
                            <button
                                onClick={() => setViewMode('3d')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                                    viewMode === '3d' 
                                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' 
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Compass size={13} />
                                <span>3D Orbit</span>
                            </button>

                            <button
                                onClick={() => setViewMode('fpv')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                                    viewMode === 'fpv' 
                                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' 
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Eye size={13} />
                                <span>Cockpit FPV</span>
                            </button>

                            <button
                                onClick={() => setViewMode('top')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                                    viewMode === 'top' 
                                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' 
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Layers size={13} />
                                <span>2D Top-Down</span>
                            </button>

                            <div className="w-[1px] h-4 bg-white/20 mx-1" />

                            <button
                                onClick={() => setAutoRotate(!autoRotate)}
                                title="Toggle Auto-Rotation"
                                className={`p-1.5 rounded-xl text-xs font-mono transition-all ${
                                    autoRotate 
                                        ? 'bg-white/20 text-cyan-300' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <RotateCw size={13} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '8s' }} />
                            </button>

                            <button
                                onClick={() => setPointCloud([])}
                                title="Clear Point Cloud Map"
                                className="p-1.5 rounded-xl text-xs text-gray-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>

                    {/* The Full 3D Interactive Point Cloud Visualizer */}
                    <div className="w-full h-full relative">
                        <Lidar3DPointCloudCanvas 
                            points={pointCloud} 
                            activeAngle={activeAngle} 
                            activeDistance={activeDistance} 
                            viewMode={viewMode}
                            autoRotate={autoRotate}
                        />

                        {/* Interactive Orbit Hint */}
                        <div className="absolute top-16 right-5 pointer-events-none text-[10px] font-mono text-cyan-400/80 bg-black/60 px-3 py-1.5 rounded-xl border border-cyan-500/20 backdrop-blur-md hidden sm:block">
                            🖱️ Drag to rotate 3D view • Scroll to zoom
                        </div>
                    </div>

                    {/* Bottom Status Bar inside 3D Hero */}
                    <div className="absolute bottom-4 w-full px-8 flex items-center justify-between text-xs font-mono text-gray-400 border-t border-white/10 pt-3 z-20 pointer-events-none">
                        <span className="flex items-center gap-2 text-cyan-300 font-bold">
                            <Scan size={15} />
                            <span>3D POINT CLOUD: <b>{pointCloud.length} VOXELS MAPPED</b></span>
                        </span>

                        <span className="text-gray-300 hidden md:inline">
                            LIDAR SWEEP: <b className="text-cyan-300">{activeAngle}°</b> | PROXIMITY: <b className={isCritical ? 'text-red-400' : 'text-emerald-400'}>{activeDistance ? `${activeDistance} cm` : 'Path Clear'}</b>
                        </span>

                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <Shield size={14} /> COLLISION GUARD: ACTIVE
                        </span>
                    </div>
                </div>

                {/* 3. HARDWARE OBSTACLE QUADRANTS & SPECIFICATION DIAGNOSTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left: 4-Quadrant Sector Breakdown (Col 7) */}
                    <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 glass-card border border-cyan-500/30 flex flex-col justify-between space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-2">
                                <Shield size={16} /> 360° SPATIAL PROXIMITY SECTORS
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">
                                {pointCloud.length} Active 3D Coordinates
                            </span>
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
                            <span className="text-cyan-400">3D Point-Cloud Ledger Synced</span>
                        </div>
                    </div>

                    {/* Right: Real Hardware Diagnostics & Specs Deck (Col 5) */}
                    <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 glass-card border border-white/10 flex flex-col justify-between space-y-4 shadow-2xl">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-2">
                                    <RadioTower size={16} /> 3D SENSOR TELEMETRY
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">
                                    {lastPacketTime ? `Packet: ${lastPacketTime}` : 'Awaiting Packets'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                Live VL53L0X Time-of-Flight laser rangefinder with continuous 3D spatial mapping:
                            </p>
                        </div>

                        <div className="space-y-2.5 font-mono text-xs">
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-gray-400">LiDAR Sensor</span>
                                <span className="text-white font-bold">VL53L0X (940nm ToF Laser)</span>
                            </div>

                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-gray-400">Active Sweep Angle</span>
                                <span className="text-cyan-300 font-bold">{activeAngle}°</span>
                            </div>

                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-gray-400">Closest Obstacle</span>
                                <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {nearestObstacle !== 999 ? `${nearestObstacle} cm` : 'Clear'}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <span className="text-gray-400">3D Point Cloud Buffer</span>
                                <span className="text-cyan-300 font-bold">{pointCloud.length} / 160 Points</span>
                            </div>
                        </div>

                        <div className="text-[11px] font-mono text-gray-500 flex items-center justify-between border-t border-white/5 pt-3">
                            <span>Daemon: <b>python unified_sensors.py</b></span>
                            <span className="text-emerald-400">Online</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Dashboard;
