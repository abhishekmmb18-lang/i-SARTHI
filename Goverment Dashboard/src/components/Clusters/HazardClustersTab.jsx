import React, { useState } from 'react';
import {
    CheckCircle2,
    MapPin,
    Gauge,
    AlertTriangle,
    FileText,
    ExternalLink,
    Zap,
    Users,
    Layers,
    ArrowRight,
    Search,
    Clock,
    Plus
} from 'lucide-react';
import WorkOrderModal from '../Modals/WorkOrderModal';
import { formatDateTime } from '../../utils/dateUtils';

export default function HazardClustersTab({
    clusters = [],
    onSelectCluster,
    currentSection = 'nhai',
    activeAuthority
}) {
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filtered = clusters.filter(cl => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchRoad = (cl.road_name || '').toLowerCase().includes(q);
            const matchId = (cl.cluster_id || '').toLowerCase().includes(q);
            if (!matchRoad && !matchId) return false;
        }
        if (filterStatus !== 'ALL') {
            if (filterStatus === 'Verified' && !cl.verification_status?.includes('Verified')) return false;
            if (filterStatus === 'Pending' && !cl.verification_status?.includes('Pending')) return false;
        }
        return true;
    });

    return (
        <div className="space-y-6">

            {/* Explanation & Summary Banner */}
            <div className="gov-card p-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white border-blue-950">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-200 uppercase">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>
                                {currentSection === 'state'
                                    ? 'राज्य PWD बहु-वाहन सत्यापन प्रोटोकॉल (10x Passes)'
                                    : currentSection === 'municipal'
                                    ? 'नगर निगम वार्ड स्तर सत्यापन प्रोटोकॉल (10x Passes)'
                                    : 'NHAI / MoRTH Multi-Vehicle Verification Protocol (10x Passes)'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {currentSection === 'state'
                                ? 'राज्य PWD सड़क गड्ढा क्लस्टर एवं कार्य आदेश'
                                : currentSection === 'municipal'
                                ? 'वार्ड सड़क गड्ढे एवं जलभराव समाधान क्लस्टर'
                                : 'राष्ट्रीय राजमार्ग ब्लैकस्पॉट एवं हॉट-मिक्स क्लस्टर'}
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                            {currentSection === 'state'
                                ? `${activeAuthority?.selectedState ? activeAuthority.selectedState.departmentName : 'राज्य लोक निर्माण विभाग'} — 35 मीटर के दायरे में स्वतंत्र वाहनों से दर्ज सड़क झटकों का समूहीकरण। 10 प्रमाणित पास पूरे होने पर सहायक अभियंता को स्वतः कार्य आदेश जारी।`
                                : currentSection === 'municipal'
                                ? 'नगर निगम — शहर की आंतरिक सड़कों पर बार-बार होने वाले झटकों व जलभराव की स्वचालित पहचान। वार्ड रखरखाव टीम को त्वरित पैच आदेश प्रेषित।'
                                : 'भारतीय राष्ट्रीय राजमार्ग प्राधिकरण (NHAI) — 35 मीटर के दायरे में स्वतंत्र वाहन झटकों का स्थानिक समूहीकरण। 10 स्वतंत्र पास पूरे होने पर MoRTH / NHAI ब्लैकस्पॉट निवारण कार्य आदेश सृजित।'}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 bg-blue-950/60 p-3 rounded-xl border border-blue-800 shrink-0 text-xs">
                        <div>
                            <div className="text-blue-300 font-medium">
                                {currentSection === 'state' ? 'PWD क्लस्टर' : currentSection === 'municipal' ? 'वार्ड क्लस्टर' : 'NHAI ब्लैकस्पॉट'}
                            </div>
                            <div className="text-xl font-bold text-white mt-0.5">{clusters.length} Segments</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="gov-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search Corridor or Cluster ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-medium">Filter Status:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden"
                    >
                        <option value="ALL">All Clusters</option>
                        <option value="Verified">Verified (10x Passes)</option>
                        <option value="Pending">Pending Verification</option>
                    </select>
                </div>
            </div>

            {/* Grid of Clusters */}
            {filtered.length === 0 ? (
                <div className="gov-card p-12 text-center border-dashed border-2 border-slate-200 bg-white">
                    <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800 font-hindi">
                        📡 कोई सक्रिय खतरा क्लस्टर नहीं (Awaiting Live Sensor Hazard Clusters)
                    </h3>
                    <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
                        समस्त पिछला डेमो क्लस्टर डेटा हटा दिया गया है। जब सेंसर से लैस वाहन सड़क पर गड्ढों व तीव्र झटकों से गुजरेंगे, 35 मीटर के दायरे में 10 स्वतंत्र पास होने पर यहां क्लस्टर व कार्य आदेश स्वतः सृजित होंगे।
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((cluster) => {
                    const isVerified = cluster.verification_status?.includes('Verified');
                    const isCritical = (cluster.ai_severity_score || 0) >= 8.0;
                    const googleMapsUrl = `https://www.google.com/maps?q=${cluster.center_lat},${cluster.center_lng}`;
                    const contributingVehicles = cluster.distinct_devices?.length || 10;

                    return (
                        <div
                            key={cluster.id || cluster.cluster_id}
                            className="gov-card p-5 flex flex-col justify-between hover:border-blue-400 transition"
                        >
                            <div>
                                {/* Header with Badge */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${isVerified ? 'badge-verified' : 'badge-warning'
                                            }`}>
                                            {cluster.verification_status}
                                        </span>
                                        <h3 className="text-base font-bold text-slate-900 mt-2">
                                            {cluster.cluster_id}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {cluster.road_name || 'Highway Corridor'}
                                        </p>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 mt-1.5 w-fit">
                                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span>अलर्ट समय व दिनांक: <strong className="font-mono">{formatDateTime(cluster.most_recent || cluster.created_at || cluster.timestamp)}</strong></span>
                                        </div>
                                    </div>

                                    <div className={`px-2.5 py-1 rounded text-xs font-bold text-center shrink-0 ${isCritical ? 'badge-critical' : 'badge-warning'
                                        }`}>
                                        <div className="text-[10px] font-medium uppercase">Severity</div>
                                        <div className="text-sm font-bold">{cluster.ai_severity_score || 8.8}/10</div>
                                    </div>
                                </div>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 gap-2.5 my-4 text-xs">
                                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                                        <div className="text-slate-500 text-[11px] flex items-center gap-1">
                                            <Zap className="w-3.5 h-3.5 text-rose-600" />
                                            Peak Impact Shock
                                        </div>
                                        <div className="text-base font-bold text-rose-700 mt-0.5">
                                            {cluster.max_vibration || 4.85} G
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                                        <div className="text-slate-500 text-[11px] flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 text-blue-700" />
                                            Distinct Vehicles
                                        </div>
                                        <div className="text-base font-bold text-blue-900 mt-0.5">
                                            {contributingVehicles} / 10 Units
                                        </div>
                                    </div>
                                </div>

                                {/* GPS Coordinates and Satellite link */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-1.5 text-slate-700 font-mono text-[11px]">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{Number(cluster.center_lat || 28.6139).toFixed(4)}°, {Number(cluster.center_lng || 77.2090).toFixed(4)}°</span>
                                    </div>

                                    <a
                                        href={googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 text-[11px]"
                                    >
                                        <span>Map</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>

                                {/* Contributing vehicle passes explanation */}
                                <div className="text-[11px] text-slate-500 mb-4">
                                    Total Observations: <strong>{cluster.total_observations || 10} strikes</strong> across <strong>{contributingVehicles} unique vehicle sensors</strong>. Average impact velocity: <strong>{cluster.avg_speed || 48} km/h</strong>.
                                </div>
                            </div>

                            {/* View Work Order Action */}
                            <button
                                onClick={() => setSelectedCluster(cluster)}
                                className="w-full py-2.5 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
                            >
                                <FileText className="w-4 h-4" />
                                <span>
                                    {currentSection === 'state'
                                        ? 'Inspect State PWD Work Order'
                                        : currentSection === 'municipal'
                                        ? 'Inspect Ward Repair Order'
                                        : 'Inspect MoRTH / NHAI Work Order'}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
            )}

            {/* Work Order Modal */}
            {selectedCluster && (
                <WorkOrderModal
                    cluster={selectedCluster}
                    onClose={() => setSelectedCluster(null)}
                    currentSection={currentSection}
                    activeAuthority={activeAuthority}
                />
            )}

        </div>
    );
}
