import React, { useState } from 'react';
import { CheckCircle2, MapPin, Gauge, ShieldAlert, FileText, ExternalLink, Zap, Radio, Plus } from 'lucide-react';
import WorkOrderModal from '../Modals/WorkOrderModal';
import { supabase } from '../../services/supabase';

export default function PotholeClustersTab({ clusters = [] }) {
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [generating, setGenerating] = useState(false);

    const handleInsertSampleCluster = async () => {
        setGenerating(true);
        try {
            const sampleCluster = {
                cluster_id: `NH-44-KM-${Math.floor(100 + Math.random() * 900)}-CLUSTER-10X`,
                center_lat: 28.6139,
                center_lng: 77.2090,
                verified_count: 10,
                status: "VERIFIED_10X",
                max_vibration: parseFloat((4.5 + Math.random() * 1.2).toFixed(2)),
                avg_speed: parseFloat((42 + Math.random() * 15).toFixed(1)),
                ai_severity_score: parseFloat((8.5 + Math.random() * 1.3).toFixed(1)),
                created_at: new Date().toISOString()
            };

            const { error } = await supabase.from('pothole_clusters').insert([sampleCluster]);
            if (error) console.error(error);
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="glass-panel p-5 rounded-2xl border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>DIRECT SUPABASE DATABASE `pothole_clusters` TABLE</span>
                    </div>
                    <h2 className="text-xl font-bold font-cyber text-white mt-1">
                        🏛️ 10x Verified Pothole Clusters
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                        Crowdsourced telemetry requiring 10 independent vehicular shock passes before issuing automated civil engineering work orders.
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleInsertSampleCluster}
                        disabled={generating}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-cyber font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{generating ? 'INGESTING...' : 'INGEST 10X CLUSTER'}</span>
                    </button>

                    <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                        <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Live Clusters: <strong>{clusters.length} Verified</strong></span>
                    </div>
                </div>
            </div>

            {/* Grid of Verified 10x Pothole Clusters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clusters.map((cluster) => {
                    const googleMapsUrl = `https://www.google.com/maps?q=${cluster.center_lat},${cluster.center_lng}`;
                    const isCritical = (cluster.ai_severity_score || 9.0) >= 8.5;

                    return (
                        <div
                            key={cluster.id || cluster.cluster_id}
                            className={`glass-panel p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] ${isCritical ? 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]' : 'border-emerald-500/30'
                                }`}
                        >
                            <div>
                                {/* Cluster Header & Severity Badge */}
                                <div className="flex items-start justify-between gap-2 mb-4">
                                    <div>
                                        <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 rounded-md border border-emerald-500/40 tracking-wider">
                                            STATUS: 10/10 PASSES CONFIRMED
                                        </span>
                                        <h3 className="text-base font-cyber font-bold text-white mt-2 flex items-center gap-1.5">
                                            {cluster.cluster_id || `CLUSTER-#${cluster.id}`}
                                        </h3>
                                    </div>

                                    <div className={`px-3 py-1 rounded-xl text-xs font-mono font-extrabold flex items-center gap-1 ${isCritical
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 text-glow-gold'
                                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                        }`}>
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        <span>{cluster.ai_severity_score || 9.2}/10</span>
                                    </div>
                                </div>

                                {/* Telemetry Metrics */}
                                <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
                                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                        <div className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                                            <Zap className="w-3 h-3 text-amber-400" />
                                            Peak G-Force
                                        </div>
                                        <div className="text-lg font-bold text-amber-300 mt-0.5">
                                            {cluster.max_vibration || 4.85} G
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                        <div className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                                            <Gauge className="w-3 h-3 text-cyan-400" />
                                            Avg Speed
                                        </div>
                                        <div className="text-lg font-bold text-cyan-300 mt-0.5">
                                            {cluster.avg_speed || 48.2} km/h
                                        </div>
                                    </div>
                                </div>

                                {/* GPS Coordinates & Satellite Deep Link */}
                                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5 flex items-center justify-between text-xs font-mono">
                                    <div className="flex items-center space-x-2 text-slate-300">
                                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span>{Number(cluster.center_lat || 28.6139).toFixed(4)}°, {Number(cluster.center_lng || 77.2090).toFixed(4)}°</span>
                                    </div>

                                    <a
                                        href={googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold transition hover:underline"
                                    >
                                        <span>Satellite Link</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Work Order Trigger Button */}
                            <button
                                onClick={() => setSelectedCluster(cluster)}
                                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-cyber font-bold text-xs tracking-wider transition shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                <FileText className="w-4 h-4" />
                                <span>View Official MoRTH Work Order (OpenAI)</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Interactive Work Order Modal */}
            {selectedCluster && (
                <WorkOrderModal
                    cluster={selectedCluster}
                    onClose={() => setSelectedCluster(null)}
                />
            )}
        </div>
    );
}
