import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, X, CheckCircle, AlertTriangle, Shield, MapPin, Clock, ArrowRight } from 'lucide-react';
import { DEMO_ALERTS } from '../../data/landingData';

export default function AlertManagementSection({ onOpenDashboard }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortAsc, setSortAsc] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Selected Alert for Details Drawer Modal
    const [inspectingAlert, setInspectingAlert] = useState(null);

    // Filtering and Searching
    const filteredAlerts = useMemo(() => {
        return DEMO_ALERTS.filter((item) => {
            const matchesSearch =
                item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

            return matchesSearch && matchesSeverity && matchesStatus;
        }).sort((a, b) => {
            return sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        });
    }, [searchQuery, severityFilter, statusFilter, sortAsc]);

    // Pagination
    const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage) || 1;
    const paginatedAlerts = filteredAlerts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getSeverityBadge = (sev) => {
        switch (sev) {
            case 'गंभीर':
                return 'bg-red-50 text-red-800 border-red-300 font-bold';
            case 'उच्च':
                return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
            case 'मध्यम':
                return 'bg-yellow-50 text-yellow-800 border-yellow-300 font-medium';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'नई चेतावनी':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'समीक्षा जारी':
                return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'कार्रवाई पूर्ण':
                return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <section
            id="alerts-section"
            aria-labelledby="alerts-title"
            className="w-full bg-white py-10 sm:py-16 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-blue-900" />
                            <span>प्रशासनिक घटना लॉग (Incident Management Registry)</span>
                        </div>
                        <h2
                            id="alerts-title"
                            className="text-2xl sm:text-3xl font-bold text-slate-900 font-hindi"
                        >
                            हालिया सड़क सुरक्षा चेतावनियाँ
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            राजमार्ग सेंसरों व वाहन टेलीमेट्री द्वारा संकलित स्वचालित सुरक्षा अलर्ट, गंभीरता स्तर एवं स्थिति रिपोर्ट
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                            सत्यापित अभिलेख (Verified Incident Records)
                        </span>
                    </div>
                </div>

                {/* Search & Filters Control Toolbar */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="क्रमांक, स्थान, प्रकार या वाहन संख्या खोजें..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                        {/* Severity Filter */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">गंभीरता:</span>
                            <select
                                value={severityFilter}
                                onChange={(e) => {
                                    setSeverityFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                            >
                                <option value="all">सभी गंभीरता</option>
                                <option value="गंभीर">गंभीर</option>
                                <option value="उच्च">उच्च</option>
                                <option value="मध्यम">मध्यम</option>
                                <option value="सामान्य">सामान्य</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">स्थिति:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                            >
                                <option value="all">सभी स्थितियाँ</option>
                                <option value="नई चेतावनी">नई चेतावनी</option>
                                <option value="समीक्षा जारी">समीक्षा जारी</option>
                                <option value="कार्रवाई पूर्ण">कार्रवाई पूर्ण</option>
                            </select>
                        </div>

                        {/* Sort Toggle */}
                        <button
                            onClick={() => setSortAsc(!sortAsc)}
                            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer"
                            title="क्रम बदलें"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">{sortAsc ? 'आरोही' : 'अवरोही'}</span>
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="rounded-lg border border-slate-200 overflow-x-auto shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#0f274e] text-white border-b border-slate-700">
                                <th className="py-3 px-3.5 font-bold font-hindi">चेतावनी क्रमांक</th>
                                <th className="py-3 px-3 font-bold font-hindi">समय</th>
                                <th className="py-3 px-3 font-bold font-hindi">स्थान</th>
                                <th className="py-3 px-3 font-bold font-hindi">चेतावनी का प्रकार</th>
                                <th className="py-3 px-3 font-bold font-hindi">गंभीरता</th>
                                <th className="py-3 px-3 font-bold font-hindi">स्थिति</th>
                                <th className="py-3 px-3.5 font-bold text-center font-hindi">कार्रवाई</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {paginatedAlerts.length > 0 ? (
                                paginatedAlerts.map((row) => (
                                    <tr key={row.id} className="hover:bg-blue-50/50 transition">
                                        <td className="py-3 px-3.5 font-mono font-bold text-blue-900">
                                            {row.id}
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                                            {row.time}
                                        </td>
                                        <td className="py-3 px-3 font-medium text-slate-800">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{row.location}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-slate-900">
                                            {row.type}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getSeverityBadge(row.severity)}`}>
                                                {row.severity}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getStatusBadge(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3.5 text-center">
                                            <button
                                                onClick={() => setInspectingAlert(row)}
                                                className="px-2.5 py-1 rounded bg-[#0f274e] text-white hover:bg-blue-900 font-bold text-[11px] transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" />
                                                <span>विवरण देखें</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                                        कोई मेल खाती चेतावनी उपलब्ध नहीं है। कृपया खोज शब्द या फ़िल्टर बदलें।
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Toolbar */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <div>
                        दिखाए जा रहे हैं: <strong>{paginatedAlerts.length}</strong> / कुल <strong>{filteredAlerts.length}</strong> रिकॉर्ड
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="पिछला पृष्ठ"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-slate-700">
                            पृष्ठ {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="अगला पृष्ठ"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Details Drawer / Modal for the Inspected Alert */}
            {inspectingAlert && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-300 space-y-4 animate-in fade-in duration-200">
                        {/* Drawer Header */}
                        <div className="flex items-start justify-between border-b pb-3">
                            <div>
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-200">
                                    {inspectingAlert.id}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 font-hindi mt-1">
                                    {inspectingAlert.type}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    घटना समय: {inspectingAlert.time} &bull; स्थान: {inspectingAlert.location}
                                </p>
                            </div>
                            <button
                                onClick={() => setInspectingAlert(null)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Severity & Status */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                                <span className="text-slate-500 block text-[11px]">गंभीरता स्तर:</span>
                                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs border ${getSeverityBadge(inspectingAlert.severity)}`}>
                                    {inspectingAlert.severity}
                                </span>
                            </div>
                            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                                <span className="text-slate-500 block text-[11px]">वर्तमान स्थिति:</span>
                                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs border ${getStatusBadge(inspectingAlert.status)}`}>
                                    {inspectingAlert.status}
                                </span>
                            </div>
                        </div>

                        {/* Detailed Description */}
                        <div className="space-y-1 text-xs">
                            <div className="font-bold text-slate-800">विस्तृत घटना विवरण:</div>
                            <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 leading-relaxed">
                                {inspectingAlert.description}
                            </p>
                        </div>

                        {/* Recommended Action */}
                        <div className="space-y-1 text-xs">
                            <div className="font-bold text-slate-800">प्रणाली द्वारा अनुशंसित कार्रवाई:</div>
                            <div className="p-3 bg-blue-50/70 rounded border border-blue-200 text-blue-950 font-medium">
                                {inspectingAlert.recommendedAction}
                            </div>
                        </div>

                        {/* Telemetry Footnote */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t font-mono">
                            <span>वाहन ID: <strong>{inspectingAlert.vehicleId}</strong></span>
                            <span>GPS: {inspectingAlert.lat}° N, {inspectingAlert.lng}° E</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setInspectingAlert(null)}
                                className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                            >
                                बंद करें
                            </button>
                            <button
                                onClick={() => {
                                    setInspectingAlert(null);
                                    onOpenDashboard();
                                }}
                                className="px-4 py-1.5 rounded bg-blue-900 text-white hover:bg-blue-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>डैशबोर्ड में पूर्ण कार्रवाई करें</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
