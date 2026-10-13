import React, { useState } from 'react';
import {
    Shield,
    Copy,
    Check,
    Download,
    AlertTriangle,
    Truck,
    X,
    FileText,
    Printer,
    MapPin,
    Calendar,
    Clock
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export default function WorkOrderModal({ cluster, onClose, currentSection = 'nhai', activeAuthority }) {
    const [copied, setCopied] = useState(false);
    const [dispatched, setDispatched] = useState(false);

    if (!cluster) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(cluster.ai_report || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleExportJSON = () => {
        const payload = {
            work_order_metadata: {
                cluster_id: cluster.cluster_id,
                severity_score: cluster.ai_severity_score,
                gps: { lat: cluster.center_lat, lng: cluster.center_lng },
                verified_passes: cluster.verified_count,
                contributing_vehicles: cluster.distinct_devices?.length || 10,
                max_vibration_g: cluster.max_vibration,
                avg_speed_kmh: cluster.avg_speed,
                generated_at: cluster.created_at || new Date().toISOString()
            },
            work_order_markdown: cluster.ai_report,
            raw_telemetry_shocks: cluster.observations || cluster.raw_logs_json
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentSection === 'state' ? 'StatePWD' : currentSection === 'municipal' ? 'NagarNigam' : 'MoRTH_NHAI'}_WorkOrder_${cluster.cluster_id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDispatchCrew = () => {
        setDispatched(true);
        setTimeout(() => {
            const dispatchMsg = currentSection === 'state'
                ? `🚨 ${activeAuthority?.selectedState ? activeAuthority.selectedState.departmentName : 'राज्य PWD'} त्वरित मरम्मत दल को KM निर्देशांक: ${cluster.center_lat?.toFixed(4)}, ${cluster.center_lng?.toFixed(4)} पर भेजा गया। PWD अधिशासी अभियंता को कार्य आदेश प्रेषित।`
                : currentSection === 'municipal'
                ? `🚨 नगर निगम वार्ड पैच रिपेयर व सफाई टीम को वार्ड स्थल ${cluster.center_lat?.toFixed(4)}, ${cluster.center_lng?.toFixed(4)} पर रवाना किया गया।`
                : `🚨 NHAI 1033 गश्ती दल एवं राष्ट्रीय राजमार्ग त्वरित मरम्मत दल (PIU) को निर्देशांक ${cluster.center_lat?.toFixed(4)}, ${cluster.center_lng?.toFixed(4)} पर रवाना किया गया। ठेकेदार को हॉट-मिक्स कार्य आदेश प्रेषित।`;
            alert(dispatchMsg);
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden">

                {/* Official Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-900 border border-blue-700 flex items-center justify-center text-white">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-800 text-blue-100 rounded">
                                    {currentSection === 'state'
                                        ? `${activeAuthority?.selectedState?.nameHindi?.split(' ')[0] || 'राज्य'} PWD सिविल कार्य आदेश`
                                        : currentSection === 'municipal'
                                        ? 'नगर निगम वार्ड मरम्मत कार्य आदेश'
                                        : 'MoRTH / NHAI CIVIL WORK ORDER'}
                                </span>
                                <span className="text-slate-300 text-xs font-mono">10x VERIFIED ROAD REPAIR</span>
                            </div>
                            <h2 className="text-base font-bold text-white mt-0.5">
                                {cluster.cluster_id} • {cluster.road_name || 'Designated Road Corridor'}
                            </h2>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-200">
                                <Clock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                                <span>अलर्ट समय व दिनांक: <strong className="font-mono text-white">{formatDateTime(cluster.created_at || cluster.most_recent || cluster.timestamp)}</strong></span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200 gap-3 text-xs">
                    <div className="flex items-center space-x-4">
                        <span className="text-slate-600">
                            Severity Index: <strong className="text-rose-700 font-bold">{cluster.ai_severity_score}/10</strong>
                        </span>
                        <span className="text-slate-600">
                            Peak Shock: <strong className="text-slate-900 font-bold">{cluster.max_vibration} G</strong>
                        </span>
                        <span className="text-slate-600">
                            Contributing Vehicles: <strong className="text-blue-900 font-bold">{cluster.distinct_devices?.length || 10} Units</strong>
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Work Order</span>
                        </button>

                        <button
                            onClick={handleCopy}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition cursor-pointer"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                        </button>

                        <button
                            onClick={handleExportJSON}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export JSON</span>
                        </button>

                        <button
                            onClick={handleDispatchCrew}
                            disabled={dispatched}
                            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-white font-semibold transition cursor-pointer ${dispatched
                                    ? 'bg-emerald-700'
                                    : 'bg-rose-700 hover:bg-rose-800'
                                }`}
                        >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{dispatched ? 'Repair Crew Dispatched 🟢' : 'Dispatch PWD Repair Crew'}</span>
                        </button>
                    </div>
                </div>

                {/* Document Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-800">

                    {/* Formatted Markdown Report Box */}
                    <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap">
                        {cluster.ai_report}
                    </div>

                    {/* Underlying Vehicle Passes Table */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-blue-700" />
                            Independent Vehicle Telemetry Passes ({cluster.observations?.length || 10} Passes)
                        </h4>

                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2.5">Pass #</th>
                                        <th className="px-4 py-2.5">Device / Vehicle ID</th>
                                        <th className="px-4 py-2.5">Suspension Shock (G-Force)</th>
                                        <th className="px-4 py-2.5">Speed (km/h)</th>
                                        <th className="px-4 py-2.5">Date & Time (दिनांक व समय)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {(cluster.observations || cluster.raw_logs_json || []).map((log, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 font-bold text-blue-900">Pass {idx + 1}</td>
                                            <td className="px-4 py-2 font-mono text-slate-800">{log.device_id || log.vehicle_id}</td>
                                            <td className="px-4 py-2 font-bold text-rose-700">{log.vibration_g} G</td>
                                            <td className="px-4 py-2 text-slate-600">{log.speed_kmh} km/h</td>
                                            <td className="px-4 py-2 text-slate-700 font-mono text-[11px] font-medium">{formatDateTime(log.timestamp || log.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>MoRTH Engineering Work Order Formulation Protocol</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                    >
                        Close Work Order
                    </button>
                </div>

            </div>
        </div>
    );
}
