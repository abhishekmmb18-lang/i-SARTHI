import React, { useState } from 'react';
import {
    X,
    CheckCircle2,
    XCircle,
    Send,
    MapPin,
    AlertTriangle,
    Shield,
    Clock,
    User,
    Building2,
    FileText,
    History,
    Check,
    ExternalLink
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export default function IncidentDrawer({
    incident,
    onClose,
    onExecuteAction,
    currentRole
}) {
    if (!incident) return null;

    const [selectedAction, setSelectedAction] = useState('VERIFY');
    const [assignedDept, setAssignedDept] = useState(incident.assigned_authority || 'NHAI Project Implementation Unit (PIU) Jaipur');
    const [maintenanceStatus, setMaintenanceStatus] = useState(incident.resolution_status || 'Under Maintenance');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionSuccess, setActionSuccess] = useState(false);

    const isReadOnly = currentRole === 'Read-Only Viewer';

    const stages = [
        { id: 'Detected', label: '1. Detected' },
        { id: 'Pending Verification', label: '2. Pending Verification' },
        { id: 'Verified', label: '3. Verified' },
        { id: 'Assigned', label: '4. Assigned' },
        { id: 'Under Maintenance', label: '5. Maintenance' },
        { id: 'Resolved', label: '6. Resolved' }
    ];

    const currentStageIndex = stages.findIndex(s =>
        incident.resolution_status?.toLowerCase().includes(s.id.toLowerCase()) ||
        incident.verification_status?.toLowerCase().includes(s.id.toLowerCase())
    );
    const activeStage = currentStageIndex >= 0 ? currentStageIndex : 1;

    const handleSubmitAction = async (e) => {
        e.preventDefault();
        if (isReadOnly) {
            alert('Your active role is Read-Only Viewer. Action permission denied.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onExecuteAction({
                incident_id: incident.id,
                action: selectedAction,
                official_role: currentRole,
                official_name: 'Authorised Government Official',
                assigned_department: assignedDept,
                maintenance_status: maintenanceStatus,
                notes: notes.trim()
            });
            setActionSuccess(true);
            setTimeout(() => {
                setActionSuccess(false);
                onClose();
            }, 1200);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const googleMapsUrl = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-200">

                {/* Drawer Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300 uppercase">
                            <span>Incident Inspection File</span>
                            <span>•</span>
                            <span>ID #{incident.id}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white mt-0.5">
                            {incident.type}
                        </h2>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-200">
                            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>अलर्ट समय व दिनांक (Alert Date & Time): <strong className="font-mono text-white">{formatDateTime(incident.created_at || incident.timestamp)}</strong></span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Incident Lifecycle Stepper */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-700" />
                            Incident Lifecycle Tracking
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px] font-semibold">
                            {stages.map((st, idx) => {
                                const isPassed = idx <= activeStage;
                                const isCurrent = idx === activeStage;
                                return (
                                    <div
                                        key={st.id}
                                        className={`p-1.5 rounded border ${isCurrent
                                                ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                                                : isPassed
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                    : 'bg-white text-slate-400 border-slate-200'
                                            }`}
                                    >
                                        <div>{st.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Incident Overview Card */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-500 block text-[11px]">Severity Rating</span>
                            <span className={`inline-block mt-1 font-bold px-2 py-0.5 rounded ${incident.severity === 'Critical' ? 'badge-critical' : 'badge-warning'
                                }`}>
                                {incident.severity}
                            </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-500 block text-[11px]">AI Detection Confidence</span>
                            <span className="text-slate-900 font-bold text-sm block mt-1">
                                {incident.ai_confidence || 92}% Verified
                            </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-500 block text-[11px]">Suspension Peak Shock</span>
                            <span className="text-rose-700 font-bold text-sm block mt-1">
                                {incident.vibration || 0} G-Force
                            </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-500 block text-[11px]">Verification Status</span>
                            <span className="text-emerald-800 font-semibold block mt-1">
                                {incident.verification_status || 'Pending Verification'}
                            </span>
                        </div>
                    </div>

                    {/* Location & GPS Data */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-blue-700" />
                                Highway &amp; GPS Coordinates
                            </span>
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 font-semibold hover:underline flex items-center gap-1 text-xs"
                            >
                                Satellite View <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <div className="text-slate-700 font-semibold text-sm">
                            {incident.road_name}
                        </div>

                        <div className="text-slate-500 font-mono text-xs">
                            Latitude: {Number(incident.latitude || 0).toFixed(5)}° N | Longitude: {Number(incident.longitude || 0).toFixed(5)}° E
                        </div>

                        <div className="text-slate-500 text-[11px]">
                            District / Jurisdiction: <strong className="text-slate-700">{incident.district || 'Jaipur, Rajasthan'}</strong>
                        </div>
                    </div>

                    {/* Device & Vehicle Telemetry Reference */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="font-bold text-slate-800">
                            Hardware Ingestion Reference
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Reporting Device ID:</span>
                            <strong className="text-slate-800 font-mono">{incident.device_id || 'SARTHI-RPI5-DL01'}</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Patrol Vehicle Ref:</span>
                            <strong className="text-slate-800 font-mono">{incident.vehicle_ref || 'DL-01-CA-9981'}</strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 bg-amber-50/70 p-2 rounded border border-amber-200">
                            <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-700" />
                                Detection Date & Time:
                            </span>
                            <span className="text-amber-950 font-mono font-bold text-xs">
                                {formatDateTime(incident.created_at || incident.timestamp)}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Assigned Department:</span>
                            <span className="font-semibold text-blue-900">{incident.assigned_authority || 'Unassigned'}</span>
                        </div>
                    </div>

                    {/* Action Form for Official Workflow */}
                    <div className="gov-card p-5 border-blue-200 bg-blue-50/20 space-y-4">
                        <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-800" />
                                Official Workflow Action
                            </h3>
                            <span className="text-[11px] text-slate-500">
                                Role: <strong>{currentRole}</strong>
                            </span>
                        </div>

                        {isReadOnly ? (
                            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs">
                                <strong>Read-Only Mode:</strong> Officials logged in as Read-Only Viewer cannot modify incident records or issue work orders. Please switch roles in the header to take action.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitAction} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Select Official Action:
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAction('VERIFY')}
                                            className={`p-2 rounded-lg border font-semibold text-center cursor-pointer ${selectedAction === 'VERIFY'
                                                    ? 'bg-emerald-700 text-white border-emerald-800'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            ✓ Verify Incident
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAction('REJECT')}
                                            className={`p-2 rounded-lg border font-semibold text-center cursor-pointer ${selectedAction === 'REJECT'
                                                    ? 'bg-rose-700 text-white border-rose-800'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            ✕ Reject (False Positive)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAction('ASSIGN')}
                                            className={`p-2 rounded-lg border font-semibold text-center cursor-pointer ${selectedAction === 'ASSIGN'
                                                    ? 'bg-blue-800 text-white border-blue-900'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            → Assign Department
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAction('UPDATE_MAINTENANCE')}
                                            className={`p-2 rounded-lg border font-semibold text-center cursor-pointer ${selectedAction === 'UPDATE_MAINTENANCE'
                                                    ? 'bg-slate-800 text-white border-slate-900'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            🛠 Maintenance Status
                                        </button>
                                    </div>
                                </div>

                                {selectedAction === 'ASSIGN' && (
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Responsible Department / PIU:
                                        </label>
                                        <select
                                            value={assignedDept}
                                            onChange={(e) => setAssignedDept(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden"
                                        >
                                            <option value="NHAI Project Implementation Unit (PIU) Jaipur">NHAI PIU Jaipur Corridor</option>
                                            <option value="NHAI Regional Office Delhi-NCR">NHAI Regional Office Delhi-NCR</option>
                                            <option value="Rajasthan State PWD Division 2">Rajasthan State PWD Division 2</option>
                                            <option value="Maharashtra Highway Police & PWD">Maharashtra Highway Police & PWD</option>
                                            <option value="Concessionaire Rapid Repair Unit">Concessionaire Rapid Repair Unit</option>
                                        </select>
                                    </div>
                                )}

                                {selectedAction === 'UPDATE_MAINTENANCE' && (
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Maintenance Progress Stage:
                                        </label>
                                        <select
                                            value={maintenanceStatus}
                                            onChange={(e) => setMaintenanceStatus(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden"
                                        >
                                            <option value="Assigned">Assigned to Contractor</option>
                                            <option value="Field Inspection Completed">Field Inspection Completed</option>
                                            <option value="Under Maintenance">Under Maintenance (Hot Mix Asphalt)</option>
                                            <option value="Resolved">Resolved & Quality Approved</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Official Inspection / Engineering Notes:
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add inspection notes, contractor reference number, or repair instructions..."
                                        className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-blue-600"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || actionSuccess}
                                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-white transition flex items-center justify-center space-x-2 cursor-pointer ${actionSuccess
                                            ? 'bg-emerald-600'
                                            : 'bg-blue-900 hover:bg-blue-800 active:scale-98'
                                        }`}
                                >
                                    {actionSuccess ? (
                                        <>
                                            <Check className="w-4 h-4 text-white" />
                                            <span>Action Recorded Successfully!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>{isSubmitting ? 'Recording Action...' : 'Submit Official Action & Update Ledger'}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Historical Notes & Audit Logs */}
                    {incident.maintenance_notes && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <History className="w-4 h-4 text-blue-700" />
                                Existing Official Notes
                            </div>
                            <pre className="text-slate-600 whitespace-pre-wrap font-sans text-xs bg-white p-2.5 rounded border border-slate-200">
                                {incident.maintenance_notes}
                            </pre>
                        </div>
                    )}

                </div>

                {/* Drawer Footer */}
                <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Confidential Official Telemetry File</span>
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                    >
                        Close Drawer
                    </button>
                </div>

            </div>
        </div>
    );
}
