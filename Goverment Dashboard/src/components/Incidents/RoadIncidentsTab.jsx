import React, { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    AlertTriangle,
    CheckCircle2,
    Clock,
    MapPin,
    ArrowUpDown,
    Check,
    X,
    Flame,
    FileSpreadsheet,
    FileText,
    History,
    Radio
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export default function RoadIncidentsTab({
    events = [],
    onSelectIncident,
    auditTrail = [],
    currentRole,
    currentSection = 'nhai',
    activeAuthority
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedSeverity, setSelectedSeverity] = useState('ALL');
    const [selectedHighway, setSelectedHighway] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const pageSize = 15;

    // Filter events
    const filtered = events.filter(evt => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchRoad = (evt.road_name || '').toLowerCase().includes(q);
            const matchDevice = (evt.device_id || '').toLowerCase().includes(q);
            const matchVehicle = (evt.vehicle_ref || '').toLowerCase().includes(q);
            const matchId = String(evt.id).includes(q);
            if (!matchRoad && !matchDevice && !matchVehicle && !matchId) return false;
        }

        if (selectedStatus !== 'ALL') {
            if (selectedStatus === 'Pending' && !evt.verification_status?.includes('Pending')) return false;
            if (selectedStatus === 'Verified' && !evt.verification_status?.includes('Verified')) return false;
            if (selectedStatus === 'Assigned' && evt.resolution_status !== 'Assigned') return false;
            if (selectedStatus === 'Resolved' && evt.resolution_status !== 'Resolved') return false;
        }

        if (selectedSeverity !== 'ALL' && evt.severity !== selectedSeverity) return false;

        if (selectedHighway !== 'ALL') {
            if (!evt.road_name?.includes(selectedHighway)) return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const paginatedEvents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Export to CSV
    const handleExportCSV = () => {
        const headers = [
            'Incident_ID',
            'Type',
            'Road_Name',
            'District',
            'Latitude',
            'Longitude',
            'Peak_Vibration_G',
            'Severity',
            'Verification_Status',
            'Resolution_Status',
            'Assigned_Authority',
            'Device_ID',
            'Vehicle_Ref',
            'Timestamp'
        ];

        const rows = filtered.map(e => [
            e.id,
            `"${e.type || ''}"`,
            `"${e.road_name || ''}"`,
            `"${e.district || ''}"`,
            e.latitude,
            e.longitude,
            e.vibration || 0,
            e.severity || 'Medium',
            `"${e.verification_status || ''}"`,
            `"${e.resolution_status || ''}"`,
            `"${e.assigned_authority || ''}"`,
            `"${e.device_id || ''}"`,
            `"${e.vehicle_ref || ''}"`,
            `"${e.created_at || ''}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `iSARTHI_Road_Incidents_Ledger_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">

            {/* Header & Export Controls */}
            <div className="gov-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span>
                                {currentSection === 'state'
                                    ? 'राज्य सड़क गड्ढे एवं सतह क्षति पंजीयन (State PWD Road Defects)'
                                    : currentSection === 'municipal'
                                    ? 'नगर निगम वार्ड सड़क गड्ढे एवं जलभराव (Municipal Ward Defects)'
                                    : currentSection === 'safety'
                                    ? 'चालक एवं वाहन सुरक्षा आपातकालीन लॉग (Driver DMS & Emergencies)'
                                    : 'NHAI राष्ट्रीय राजमार्ग घटना एवं सड़क अवरोध प्रबंधन (NHAI Hazards)'}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                                {events.length} {currentSection === 'state' ? 'राज्य PWD रिकॉर्ड' : currentSection === 'municipal' ? 'वार्ड सड़क रिकॉर्ड' : currentSection === 'safety' ? 'आपातकालीन अलर्ट' : 'राष्ट्रीय राजमार्ग रिकॉर्ड'}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            {currentSection === 'state'
                                ? `${activeAuthority?.selectedState ? activeAuthority.selectedState.departmentName : 'राज्य लोक निर्माण विभाग (State PWD)'} — केवल सड़क सतह क्षति, गड्ढे व मरम्मत रिकॉर्ड (चालक व निजी डेटा बहिष्कृत)`
                                : currentSection === 'municipal'
                                ? 'नगर निगम एवं स्थानीय शहरी निकाय — आंतरिक वार्ड सड़कें, जलभराव शिकायतें एवं त्वरित मरम्मत कार्य'
                                : currentSection === 'safety'
                                ? 'वाणिज्यिक वाहन बेड़ा एवं चालक सतर्कता प्रभाग — चालक उनींदापन (DMS), MQ-3 अल्कोहल सेंसर चेतावनी एवं SOS कॉल'
                                : 'भारतीय राष्ट्रीय राजमार्ग प्राधिकरण (NHAI) — एक्सप्रेसवे, राष्ट्रीय राजमार्ग एवं 1033 पेट्रोल रिकॉर्ड'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setShowAuditModal(true)}
                            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <History className="w-4 h-4 text-blue-700" />
                            <span>Audit Trail ({auditTrail.length})</span>
                        </button>

                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export CSV Report</span>
                        </button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="sm:col-span-2 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search Highway, Device, Vehicle, or ID..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600"
                        />
                    </div>

                    <div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden"
                        >
                            <option value="ALL">All Verification Status</option>
                            <option value="Pending">Pending Verification</option>
                            <option value="Verified">Verified by AI / Official</option>
                            <option value="Assigned">Assigned to Department</option>
                            <option value="Resolved">Resolved / Completed</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedSeverity}
                            onChange={(e) => {
                                setSelectedSeverity(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden"
                        >
                            <option value="ALL">All Severities</option>
                            <option value="Critical">Critical Severity</option>
                            <option value="High">High Severity</option>
                            <option value="Medium">Medium Severity</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedHighway}
                            onChange={(e) => {
                                setSelectedHighway(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden"
                        >
                            <option value="ALL">All Highway Corridors</option>
                            <option value="NH-44">NH-44 (Delhi - Jaipur)</option>
                            <option value="NH-48">NH-48 (Mumbai - Pune)</option>
                            <option value="AH-43">AH-43 (Bengaluru Ring Road)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Incidents Table */}
            <div className="gov-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3.5">ID</th>
                                <th className="px-4 py-3.5">Incident Type</th>
                                <th className="px-4 py-3.5">Highway / Road Segment</th>
                                <th className="px-4 py-3.5">GPS Coordinates</th>
                                <th className="px-4 py-3.5">Vibration Shock</th>
                                <th className="px-4 py-3.5">AI Confidence</th>
                                <th className="px-4 py-3.5">Verification Status</th>
                                <th className="px-4 py-3.5">Assigned Authority</th>
                                <th className="px-4 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {paginatedEvents.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-14 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-2.5">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center">
                                                <Radio className="w-6 h-6 animate-pulse" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">
                                                📡 वास्तविक समय सेंसर डेटा प्रतीक्षारत (Awaiting Live Sensor Telemetry)
                                            </div>
                                            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                                                समस्त पिछला डेमो डेटा हटा दिया गया है। जैसे ही आपके हार्डवेयर सेंसर (ESP32, Raspberry Pi, या Supabase) से नया टेलीमेट्री डेटा भेजा जाएगा, वह यहां स्वतः वास्तविक समय में प्रदर्शित होगा।
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedEvents.map((evt) => {
                                const isSOS = (evt.type || '').includes('SOS') || evt.sos_alert;
                                return (
                                    <tr
                                        key={evt.id}
                                        onClick={() => onSelectIncident(evt)}
                                        className="hover:bg-blue-50/40 transition cursor-pointer"
                                    >
                                        <td className="px-4 py-3.5 font-bold text-blue-900">#{evt.id}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                {isSOS && <Flame className="w-4 h-4 text-rose-600 shrink-0" />}
                                                <span>{evt.type}</span>
                                            </div>
                                            <span className="text-[11px] text-blue-950 font-medium font-mono flex items-center gap-1 mt-0.5 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/60 w-fit">
                                                <Clock className="w-3 h-3 text-blue-700" />
                                                <span>{formatDateTime(evt.created_at || evt.timestamp)}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-700 max-w-xs">
                                            <div className="font-medium truncate">{evt.road_name}</div>
                                            <div className="text-[11px] text-slate-400">{evt.district}</div>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-slate-600">
                                            {Number(evt.latitude || 0).toFixed(4)}°, {Number(evt.longitude || 0).toFixed(4)}°
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {evt.vibration > 0 ? (
                                                <span className={`font-bold ${evt.vibration > 4.5 ? 'text-rose-700' : 'text-amber-700'}`}>
                                                    {evt.vibration} G
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 font-medium text-slate-700">
                                            {evt.ai_confidence || 92}%
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${evt.verification_status?.includes('Verified') ? 'badge-verified' : 'badge-warning'
                                                }`}>
                                                {evt.verification_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600">
                                            <span className="font-medium text-slate-800">
                                                {evt.assigned_authority || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectIncident(evt);
                                                }}
                                                className="px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition cursor-pointer"
                                            >
                                                Inspect
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div>
                        Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> incidents
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="px-2 font-semibold text-slate-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Audit Trail Modal */}
            {showAuditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
                        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <History className="w-5 h-5 text-blue-400" />
                                <h3 className="text-base font-bold text-white">
                                    Official Incident Audit Trail &amp; Action Log
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="text-slate-300 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-3 text-xs">
                            {auditTrail.length === 0 ? (
                                <p className="text-slate-500 text-center py-6">
                                    No audit entries recorded yet. Actions taken on incidents will be logged here with timestamps and official signatures.
                                </p>
                            ) : (
                                auditTrail.map((log) => (
                                    <div key={log.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                                        <div className="flex items-center justify-between font-semibold text-slate-800">
                                            <span className="text-blue-900">{log.action}</span>
                                            <span className="text-slate-400 font-mono text-[11px]">
                                                {new Date(log.timestamp).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="text-slate-600">
                                            By: <strong>{log.actor}</strong> • Incident: <strong className="font-mono">{log.incident_id}</strong>
                                        </div>
                                        {log.notes && (
                                            <div className="text-slate-700 bg-white p-2 rounded border border-slate-200 mt-1 font-mono text-[11px]">
                                                {log.notes}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                            >
                                Close Audit Log
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
