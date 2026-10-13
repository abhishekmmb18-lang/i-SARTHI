import React, { useEffect, useRef } from 'react';

export default function HighwayCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // Particle/vehicle beacons on the highway
        const vehicles = Array.from({ length: 14 }, () => ({
            lane: Math.floor(Math.random() * 4), // 4 lanes
            z: Math.random() * 1000, // Distance away
            speed: 3 + Math.random() * 4,
            color: Math.random() > 0.3 ? '#10b981' : Math.random() > 0.5 ? '#06b6d4' : '#f59e0b',
            pulse: Math.random() * Math.PI * 2
        }));

        let gridOffset = 0;

        const render = () => {
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);

            const horizonY = height * 0.35;
            const fov = 350;
            const cx = width / 2;

            // Draw Top Cyber Atmosphere Mesh
            const gradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
            gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.04)');
            gradient.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, horizonY);

            // Draw Horizon Glow Line
            ctx.beginPath();
            ctx.moveTo(0, horizonY);
            ctx.lineTo(width, horizonY);
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Perspective Grid Lines (Vertical/Vanishing)
            const numLanes = 6;
            const roadWidthBottom = width * 0.9;
            const roadWidthTop = width * 0.08;

            ctx.lineWidth = 1;
            for (let i = 0; i <= numLanes; i++) {
                const t = i / numLanes;
                const xBottom = cx - roadWidthBottom / 2 + t * roadWidthBottom;
                const xTop = cx - roadWidthTop / 2 + t * roadWidthTop;

                ctx.beginPath();
                ctx.moveTo(xTop, horizonY);
                ctx.lineTo(xBottom, height);

                if (i === 0 || i === numLanes) {
                    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
                    ctx.lineWidth = 2;
                } else if (i === numLanes / 2) {
                    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
                    ctx.setLineDash([12, 12]);
                } else {
                    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
                    ctx.setLineDash([]);
                }

                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Horizontal Moving Grid Lines (3D Depth Perspective)
            gridOffset = (gridOffset + 1.8) % 60;
            const numHorizontals = 22;

            for (let i = 0; i < numHorizontals; i++) {
                // Perspective distribution mapping
                const rawZ = i * 45 + gridOffset;
                const normalizedZ = rawZ / 1000;
                if (normalizedZ > 1) continue;

                const currentY = horizonY + Math.pow(normalizedZ, 2) * (height - horizonY);

                if (currentY > horizonY && currentY < height) {
                    const currentRoadWidth = roadWidthTop + Math.pow(normalizedZ, 2) * (roadWidthBottom - roadWidthTop);
                    const leftX = cx - currentRoadWidth / 2;
                    const rightX = cx + currentRoadWidth / 2;

                    ctx.beginPath();
                    ctx.moveTo(leftX, currentY);
                    ctx.lineTo(rightX, currentY);
                    const opacity = Math.pow(normalizedZ, 1.5) * 0.45;
                    ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
                    ctx.lineWidth = 1 + normalizedZ * 1.5;
                    ctx.stroke();
                }
            }

            // Render 3D Vehicles on the Highway
            vehicles.forEach(v => {
                v.z -= v.speed;
                if (v.z <= 10) {
                    v.z = 1000;
                    v.lane = Math.floor(Math.random() * 4);
                }

                const normalizedZ = 1 - v.z / 1000;
                if (normalizedZ <= 0 || normalizedZ > 1) return;

                const y = horizonY + Math.pow(normalizedZ, 2.2) * (height - horizonY);
                const laneWidth = (roadWidthTop + Math.pow(normalizedZ, 2.2) * (roadWidthBottom - roadWidthTop)) / 4;
                const roadLeft = cx - (roadWidthTop + Math.pow(normalizedZ, 2.2) * (roadWidthBottom - roadWidthTop)) / 2;
                const x = roadLeft + (v.lane + 0.5) * laneWidth;

                const size = Math.max(3, normalizedZ * 14);

                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = v.color;
                ctx.shadowColor = v.color;
                ctx.shadowBlur = 12 * normalizedZ + 4;
                ctx.fill();

                // Light trail behind vehicle
                ctx.beginPath();
                ctx.moveTo(x, y);
                const trailLength = size * 3.5;
                const trailY = y - trailLength;
                const trailX = cx + (x - cx) * 0.95;
                ctx.lineTo(trailX, trailY);
                ctx.strokeStyle = v.color;
                ctx.lineWidth = size * 0.7;
                ctx.stroke();

                ctx.restore();
            });

            // Digital Pulse Radar Node Ring overlay
            const time = Date.now() * 0.001;
            const pulseR = 40 + Math.sin(time * 2) * 10;
            ctx.beginPath();
            ctx.arc(70, 70, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();

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
            className="fixed inset-0 pointer-events-none z-0 opacity-80"
        />
    );
}
