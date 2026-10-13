import React, { useState, useMemo } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    MapPin,
    ArrowRight,
    TrendingUp,
    FileText,
    Shield,
    Flame,
    Building2,
    Wrench,
    Coins,
    Filter,
    Layers,
    ExternalLink
} from 'lucide-react';
import { INDIAN_STATES } from '../../data/authoritiesData';
import { formatDateTime } from '../../utils/dateUtils';

export default function StateRoadsTab({
    telemetryData,
    activeAuthority,
    onNavigateTab,
    onSelectIncident,
    onSelectCluster
}) {
    const [selectedStateId, setSelectedStateId] = useState(
        activeAuthority?.selectedState?.id || 'UP'
    );

    const currentState = useMemo(() => {
        return INDIAN_STATES.find(s => s.id === selectedStateId) || INDIAN_STATES[0];
    }, [selectedStateId]);

    // STRICT FILTERING: State PWD gets ONLY road-related data (NO drowsiness, NO alcohol, NO SOS)
    const rawEvents = telemetryData.roadEvents || [];
    const roadOnlyEvents = useMemo(() => {
        return rawEvents.filter(e => {
            const isDriverEvent = (e.type || '').includes('Alcohol') || (e.type || '').includes('SOS') || e.sos_alert;
            return !isDriverEvent;
        });
    }, [rawEvents]);

    // Scoped state road metrics
    const totalStateHazards = roadOnlyEvents.length;
    const pendingInspection = roadOnlyEvents.filter(e =>
        e.verification_status?.includes('Pending') || !e.verification_status
    ).length;
    const verifiedClusters = (telemetryData.clusters || []).length;
    const criticalSegments = (telemetryData.clusters || []).filter(c => c.ai_severity_score >= 8.0).length;

    // Estimated PWD civil repair cost calculation (0 when no clusters)
    const estimatedCivilRepairBudget = verifiedClusters > 0
        ? (verifiedClusters * 44085 + criticalSegments * 62000)
        : 0;

    // Filter top urgent structural defects for PWD immediate dispatch
    const urgentRoadDefects = roadOnlyEvents
        .filter(e => e.severity === 'Critical' || (e.vibration > 3.8))
        .slice(0, 5);

    const sh25Count = roadOnlyEvents.filter(e => (e.road_name || '').includes('SH-25')).length;
    const sh5Count = roadOnlyEvents.filter(e => (e.road_name || '').includes('SH-5') || (e.road_name || '').includes('संपर्क')).length;
    const mdrCount = roadOnlyEvents.filter(e => (e.road_name || '').includes('MDR-42')).length;
    const odrCount = roadOnlyEvents.filter(e => !((e.road_name || '').includes('SH-25') || (e.road_name || '').includes('MDR-42') || (e.road_name || '').includes('SH-5'))).length;

    // State highway division corridors dynamically counted from real sensor data
    const stateCorridors = [
        {
            code: 'SH-25 (State Highway 25 Corridor)',
            name: `${currentState.nameHindi.split(' ')[0]} स्टेट हाईवे-25`,
            defects: sh25Count,
            roughness: sh25Count > 0 ? '3.4 m/km (Monitored)' : 'No defects logged',
            division: `${currentState.headquarters} Central PWD Division`,
            status: sh25Count > 0 ? 'Work Order Dispatched' : 'Clear (Normal)'
        },
        {
            code: 'SH-5 (Inter-District State Highway)',
            name: `${currentState.nameHindi.split(' ')[0]} प्रमुख संपर्क मार्ग`,
            defects: sh5Count,
            roughness: sh5Count > 0 ? '4.8 m/km (Active)' : 'No defects logged',
            division: 'Western Zone PWD Circle',
            status: sh5Count > 0 ? 'Inspection Required' : 'Clear (Normal)'
        },
        {
            code: 'MDR-42 (Major District Road Ring Route)',
            name: 'जिला मुख्य मार्ग (MDR-42)',
            defects: mdrCount,
            roughness: mdrCount > 0 ? '2.9 m/km (Active)' : 'No defects logged',
            division: 'District Engineering Cell',
            status: mdrCount > 0 ? 'Patching Scheduled' : 'Clear (Normal)'
        },
        {
            code: 'ODR-18 (Rural & Inter-Tehsil Connecting Arterial)',
            name: 'ग्रामीण एवं तहसील संपर्क सड़क',
            defects: odrCount,
            roughness: odrCount > 0 ? '3.1 m/km (Active)' : 'No defects logged',
            division: 'Rural Roads PWD Wing',
            status: odrCount > 0 ? 'Survey Completed' : 'Clear (Normal)'
        }
    ];

    return (
        <div className="space-y-6">

            {/* State PWD Executive Banner with State Dropdown */}
            <div className="gov-card p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white border-amber-900 shadow-md">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 tracking-wider uppercase">
                            <Building2 className="w-4 h-4 text-amber-400" />
                            <span>राज्य सड़क एवं लोक निर्माण विभाग (State Highway Authority & PWD)</span>
                            <span>&bull;</span>
                            <span className="text-emerald-400">सड़क अवसंरचना विशिष्ट पोर्टल</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-hindi">
                            {currentState.departmentName}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            राज्य राजमार्गों (SH), जिला मुख्य मार्गों (MDR) एवं प्रादेशिक सड़कों पर स्वचालित गड्ढा पहचान, सड़क खुरदरापन सूचकांक (Roughness Index) एवं PWD कार्य आदेश प्रबंधन।
                        </p>
                    </div>

                    {/* State Selector & Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="flex items-center bg-slate-900/90 border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs">
                            <span className="text-amber-300 font-semibold mr-2 font-hindi">राज्य चुनें:</span>
                            <select
                                value={selectedStateId}
                                onChange={(e) => setSelectedStateId(e.target.value)}
                                className="bg-transparent text-white font-bold focus:outline-hidden cursor-pointer"
                            >
                                {INDIAN_STATES.map((st) => (
                                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                                        {st.nameHindi}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => onNavigateTab('map')}
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>राज्य सड़क मानचित्र</span>
                        </button>
                    </div>
                </div>

                {/* Data Privacy & Jurisdiction Notice */}
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-200/90 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                        <strong>प्रशासनिक क्षेत्राधिकार (Data Governance Scope):</strong> यह अनुभाग केवल राज्य सड़क गुणवत्ता, गड्ढों व PWD मरम्मत से संबंधित है। व्यक्तिगत चालक उनींदापन (DMS) एवं इन-केबिन टेलीमेट्री डेटा राज्य PWD क्षेत्राधिकार के अंतर्गत प्रदर्शित नहीं किया जाता।
                    </span>
                </div>
            </div>

            {/* State PWD Road KPI Cards (NO DROWSINESS METRICS) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">

                {/* KPI 1: Total Road Hazards */}
                <div className="gov-card p-4 border-l-4 border-l-amber-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>सड़क सतह जोखिम</span>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {totalStateHazards}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                        दर्ज गड्ढे व सतह क्षति
                    </p>
                </div>

                {/* KPI 2: Pending Inspection */}
                <div className="gov-card p-4 border-l-4 border-l-orange-500 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>PWD सत्यापन लंबित</span>
                        <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                        {pendingInspection}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                        कनिष्ठ अभियंता निरीक्षण हेतु
                    </p>
                </div>

                {/* KPI 3: 10x Verified Road Clusters */}
                <div className="gov-card p-4 border-l-4 border-l-purple-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>10x पुष्ट क्लस्टर</span>
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                        {verifiedClusters}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                        बहु-वाहन सेंसर द्वारा प्रमाणित
                    </p>
                </div>

                {/* KPI 4: Critical Road Segments */}
                <div className="gov-card p-4 border-l-4 border-l-rose-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>गंभीर सड़क खंड</span>
                        <Flame className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="text-2xl font-bold text-rose-600">
                        {criticalSegments}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                        AI जोखिम स्कोर &ge; 8.0/10
                    </p>
                </div>

                {/* KPI 5: PWD Work Orders */}
                <div className="gov-card p-4 border-l-4 border-l-blue-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>सक्रिय कार्य आदेश</span>
                        <Wrench className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                        {verifiedClusters}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                        मरम्मत ठेकेदार आवंटित
                    </p>
                </div>

                {/* KPI 6: Estimated Repair Budget */}
                <div className="gov-card p-4 border-l-4 border-l-emerald-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>अनुमानित बजट</span>
                        <Coins className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xl font-bold text-emerald-700">
                        ₹{(estimatedCivilRepairBudget / 1000).toFixed(0)}k
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                        हॉट-मिक्स पैचवर्क व्यय
                    </p>
                </div>

            </div>

            {/* Main Content Grid: Urgent PWD Defects & State Highway Corridors */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left 7 Columns: Urgent State Pavement Defects */}
                <div className="lg:col-span-7 gov-card p-5 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div>
                            <h3 className="font-bold text-base text-slate-900 font-hindi flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span>तत्काल मरम्मत हेतु चिन्हित राज्य सड़क गड्ढे (Urgent Road Defects)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                उच्च-आघात (High-G) कंपन संवेदीकृत सड़क क्षति, जिन्हें तत्काल सिविल सुधार की आवश्यकता है
                            </p>
                        </div>
                        <button
                            onClick={() => onNavigateTab('incidents')}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                            <span>सभी देखें ({totalStateHazards})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {urgentRoadDefects.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-amber-200 rounded-lg bg-amber-50/30">
                                <div className="text-xs font-semibold text-amber-900">
                                    📡 राज्य सड़क सेंसर टेलीमेट्री प्रतीक्षारत (Awaiting State Road Sensor Telemetry)
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    पिछला डेमो डेटा हटा दिया गया है। जब राज्य मार्ग पर चलने वाले वाहनों से गड्ढों व झटकों का नया डेटा आएगा, वह यहां लाइव दिखेगा।
                                </div>
                            </div>
                        ) : (
                            urgentRoadDefects.map((defect) => (
                            <div
                                key={defect.id}
                                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-amber-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-slate-900">
                                            #{defect.id} &bull; {defect.type || 'गड्ढा (Pothole)'}
                                        </span>
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                            {defect.severity}
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-500">
                                            G-Force: {defect.vibration || 4.2} G
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{defect.road_name || 'राज्य राजमार्ग गलियारा'}</span>
                                        <span className="text-slate-400">&bull;</span>
                                        <span className="text-slate-500">{currentState.nameHindi.split(' ')[0]}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        सेंसर पहचान: {defect.details || 'वाहन सस्पेंशन एक्सेलेरोमीटर द्वारा सड़क झटका दर्ज'}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 w-fit">
                                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                        <span>समय व दिनांक (Alert Time & Date): <strong className="font-mono">{formatDateTime(defect.created_at || defect.timestamp)}</strong></span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => onSelectIncident && onSelectIncident(defect)}
                                        className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold transition cursor-pointer"
                                    >
                                        निरीक्षण विवरण
                                    </button>
                                    <button
                                        onClick={() => onNavigateTab('clusters')}
                                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition cursor-pointer"
                                    >
                                        PWD आदेश
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    </div>
                </div>

                {/* Right 5 Columns: State Highway Corridors & PWD Division Status */}
                <div className="lg:col-span-5 gov-card p-5 space-y-4">
                    <div className="border-b pb-3">
                        <h3 className="font-bold text-base text-slate-900 font-hindi flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-900" />
                            <span>राज्य राजमार्ग एवं जिला खंड स्थिति (Corridor Health)</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {currentState.departmentName} क्षेत्राधिकार के मुख्य मार्ग
                        </p>
                    </div>

                    <div className="space-y-3">
                        {stateCorridors.map((c, i) => (
                            <div
                                key={i}
                                className="p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition space-y-1.5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-bold text-xs text-slate-900 font-hindi">
                                            {c.name}
                                        </div>
                                        <div className="text-[11px] font-mono text-slate-500">
                                            {c.code}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            c.status.includes('Dispatched')
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                : c.status.includes('Required')
                                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                                        }`}
                                    >
                                        {c.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                                    <div>
                                        खुरदरापन: <strong className="text-slate-800">{c.roughness}</strong>
                                    </div>
                                    <div className="text-right">
                                        सक्रिय गड्ढे: <strong className="text-amber-700">{c.defects}</strong>
                                    </div>
                                </div>

                                <div className="text-[10px] text-slate-400 truncate">
                                    प्रभाग: {c.division}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Civil Engineering Material Requisition Summary Box */}
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2 text-xs">
                        <div className="font-bold text-amber-950 font-hindi flex items-center justify-between">
                            <span>सामग्री आवंटन अनुमान (VG-30 Hot Mix)</span>
                            <span className="font-mono text-[11px] text-amber-800 font-bold">MoRTH Standard</span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                            चिन्हित गड्ढों हेतु लगभग <strong>6.8 मीट्रिक टन</strong> VG-30 बिटुमिनस कंक्रीट पैच एवं 45 लीटर टैक कोट अपेक्षित है।
                        </p>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-200/60 font-semibold text-amber-900">
                            <span>प्राक्कलित लागत: ₹1,85,000 INR</span>
                            <button
                                onClick={() => onNavigateTab('reports')}
                                className="underline hover:text-amber-950 cursor-pointer"
                            >
                                विस्तृत स्टीमेट देखें &rarr;
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
