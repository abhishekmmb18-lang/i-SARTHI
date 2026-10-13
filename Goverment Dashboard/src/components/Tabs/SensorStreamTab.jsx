import React from 'react';
import { Activity, Radio, Zap } from 'lucide-react';

export default function SensorStreamTab({ sensorLogs = [] }) {
    const recentLogs = sensorLogs.slice(0, 25).reverse();
    const value1Points = recentLogs.map(l => Number(l.value_1) || 0);

    const renderSparkline = (points, strokeColor, fillColor) => {
        if (points.length < 2) return null;
        const max = Math.max(...points, 10);
        const min = Math.min(...points, 0);
        const width = 300;
        const height = 60;

        const pathD = points.map((val, idx) => {
            const x = (idx / (points.length - 1)) * width;
            const y = height - ((val - min) / (max - min || 1)) * (height - 10) - 5;
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(' ');

        const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

        return (
            <svg className="w-full h-16 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <linearGradient id={`grad-${strokeColor}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={fillColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                <path d={areaD} fill={`url(#grad-${strokeColor})`} />
                <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
                {points.map((val, idx) => {
                    const x = (idx / (points.length - 1)) * width;
                    const y = height - ((val - min) / (max - min || 1)) * (height - 10) - 5;
                    return (
                        <circle key={idx} cx={x} cy={y} r="3" fill={strokeColor} />
                    );
                })}
            </svg>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="glass-panel p-5 rounded-2xl border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold font-cyber text-white">
                        Sensor Stream
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Time-series telemetry logs from vehicle sensors.
                    </p>
                </div>

                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>{sensorLogs.length} Packets</span>
                </div>
            </div>

            {/* Sparkline Graph */}
            <div className="glass-panel p-5 rounded-2xl border-emerald-500/30">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        Telemetry Reading Stream
                    </div>
                    <div className="text-lg font-bold font-mono text-emerald-300">
                        {value1Points[value1Points.length - 1] || 0}
                    </div>
                </div>
                {renderSparkline(value1Points, '#10b981', '#10b981')}
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl border-cyan-500/30 overflow-hidden">
                <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-cyber font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Raw Sensor Packets
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Sensor Type</th>
                                <th className="px-4 py-3">Value 1</th>
                                <th className="px-4 py-3">Value 2</th>
                                <th className="px-4 py-3">Value 3</th>
                                <th className="px-4 py-3">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {sensorLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-900/50 transition">
                                    <td className="px-4 py-2.5 text-cyan-400 font-bold">#{log.id}</td>
                                    <td className="px-4 py-2.5 text-slate-200">{log.sensor_type || 'Sensor'}</td>
                                    <td className="px-4 py-2.5 text-emerald-300 font-bold">{log.value_1}</td>
                                    <td className="px-4 py-2.5 text-slate-300">{log.value_2}</td>
                                    <td className="px-4 py-2.5 text-slate-300">{log.value_3}</td>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Live'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
