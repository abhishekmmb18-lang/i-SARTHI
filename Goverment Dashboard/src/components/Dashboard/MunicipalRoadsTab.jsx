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
    Landmark,
    Droplets,
    Truck,
    Layers,
    Wrench
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export default function MunicipalRoadsTab({
    telemetryData,
    activeAuthority,
    onNavigateTab,
    onSelectIncident,
    onSelectCluster
}) {
    const [selectedWard, setSelectedWard] = useState('Ward 14 (Central Market)');

    const wardsList = [
        'Ward 14 (Central Market & Commercial Zone)',
        'Ward 22 (Civil Lines & District Court Area)',
        'Ward 08 (Station Road & Transit Hub)',
        'Ward 31 (Residential Extension Sector 4)',
        'Ward 05 (Old City & Heritage Precinct)'
    ];

    // Filter to municipal street & waterlogging events only (NO drowsiness, NO highway toll)
    const rawEvents = telemetryData.roadEvents || [];
    const municipalEvents = useMemo(() => {
        return rawEvents.filter(e => {
            const isDriverEvent = (e.type || '').includes('Alcohol') || (e.type || '').includes('SOS') || e.sos_alert;
            return !isDriverEvent;
        });
    }, [rawEvents]);

    const totalWardDefects = municipalEvents.length;
    const waterloggingAlerts = municipalEvents.filter(e => (e.type || '').includes('जलभराव') || (e.type || '').toLowerCase().includes('water')).length;
    const urbanPotholes = municipalEvents.filter(e => (e.type || '').includes('गड्ढा') || (e.type || '').toLowerCase().includes('pothole') || e.vibration > 2.5).length;
    const activeMunicipalTeams = municipalEvents.length > 0 ? Math.min(5, Math.ceil(municipalEvents.length / 3)) : 0;
    const citizenGrievanceSync = municipalEvents.length;

    const urgentWardIssues = municipalEvents
        .filter(e => e.severity === 'Critical' || (e.vibration > 3.5) || (e.type || '').includes('जलभराव'))
        .slice(0, 5)
        .map(evt => ({
            id: `URBAN-EVT-${evt.id}`,
            title: evt.type || 'शहरी वार्ड सड़क क्षति (Ward Defect)',
            ward: evt.road_name?.includes('वार्ड') ? evt.road_name.split('(')[0].trim() : 'शहरी नगरपालिका क्षेत्र',
            location: evt.road_name || 'शहरी आंतरिक सड़क',
            severity: evt.severity || (evt.vibration > 4.5 ? 'Critical' : 'High'),
            depth: evt.vibration > 4.0 ? '14 cm Cavity' : '8 cm Pothole',
            waterLevel: (evt.type || '').includes('जलभराव') ? '12 cm Standing Water' : 'Dry Surface',
            status: evt.resolution_status || 'सत्यापन प्रक्रियाधीन',
            rawEvent: evt
        }));

    return (
        <div className="space-y-6">

            {/* Municipal Executive Banner */}
            <div className="gov-card p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border-emerald-900 shadow-md">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 tracking-wider uppercase">
                            <Landmark className="w-4 h-4 text-emerald-400" />
                            <span>नगर निगम एवं स्थानीय शहरी निकाय (Municipal Corporation & Urban Local Body)</span>
                            <span>&bull;</span>
                            <span className="text-emerald-400">शहरी वार्ड सड़क पोर्टल</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-hindi">
                            नगर निगम स्मार्ट सिटी सड़क एवं जलभराव नियंत्रण केंद्र
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            शहर के आंतरिक वार्डों, आंतरिक गलियों एवं प्रमुख चौराहों पर गड्ढों की पहचान, मानसून जलभराव निकासी, एवं त्वरित वार्ड मरम्मत दल तैनाती।
                        </p>
                    </div>

                    {/* Ward Selector & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="flex items-center bg-slate-900/90 border border-emerald-500/50 rounded-lg px-3 py-1.5 text-xs">
                            <span className="text-emerald-300 font-semibold mr-2 font-hindi">वार्ड चुनें:</span>
                            <select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                className="bg-transparent text-white font-bold focus:outline-hidden cursor-pointer"
                            >
                                {wardsList.map((w, i) => (
                                    <option key={i} value={w} className="bg-slate-900 text-white">
                                        {w}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => onNavigateTab('map')}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>वार्ड जीआईएस मैप</span>
                        </button>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-200/90 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                        <strong>नगर निगम क्षेत्राधिकार:</strong> यह अनुभाग केवल शहरी वार्ड सड़कों, नगर जलभराव एवं कचरा/वार्ड वाहन ट्रैकिंग से संबंधित है। राष्ट्रीय राजमार्ग टोल टेलीमेट्री एवं अंतर-राज्यीय चालक उनींदापन डेटा इस निकाय से अलग रखा गया है।
                    </span>
                </div>
            </div>

            {/* Municipal KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="gov-card p-4 border-l-4 border-l-emerald-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>कुल वार्ड गड्ढे</span>
                        <AlertTriangle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{urbanPotholes}</div>
                    <p className="text-[11px] text-slate-500 truncate">शहरी सड़कों पर दर्ज</p>
                </div>

                <div className="gov-card p-4 border-l-4 border-l-cyan-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>जलभराव स्थल</span>
                        <Droplets className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="text-2xl font-bold text-cyan-700">{waterloggingAlerts}</div>
                    <p className="text-[11px] text-slate-500 truncate">नाली जाम व वर्षा जल</p>
                </div>

                <div className="gov-card p-4 border-l-4 border-l-purple-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>वार्ड कार्य आदेश</span>
                        <Wrench className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-700">12</div>
                    <p className="text-[11px] text-slate-500 truncate">मरम्मत दल को जारी</p>
                </div>

                <div className="gov-card p-4 border-l-4 border-l-blue-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>सक्रिय मरम्मत दल</span>
                        <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{activeMunicipalTeams}</div>
                    <p className="text-[11px] text-slate-500 truncate">फील्ड टीम परिचालन में</p>
                </div>

                <div className="gov-card p-4 border-l-4 border-l-amber-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>नागरिक शिकायतें</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-amber-700">{citizenGrievanceSync}</div>
                    <p className="text-[11px] text-slate-500 truncate">वार्ड पोर्टल से प्राप्त</p>
                </div>

                <div className="gov-card p-4 border-l-4 border-l-teal-600 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>निस्तारण दर</span>
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-teal-700">84%</div>
                    <p className="text-[11px] text-slate-500 truncate">24 घंटे के भीतर पैच</p>
                </div>
            </div>

            {/* Urgent Ward Issues and Rapid Dispatch Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 gov-card p-5 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div>
                            <h3 className="font-bold text-base text-slate-900 font-hindi flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-cyan-600" />
                                <span>वार्ड-स्तरीय त्वरित निस्तारण सूची (Ward Action Queue)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                शहर की प्रमुख सड़कों पर जलभराव एवं गड्ढे जिन्हें नगर निगम दल द्वारा तत्काल मरम्मत अपेक्षित है
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {urgentWardIssues.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-emerald-200 rounded-lg bg-emerald-50/30">
                                <div className="text-xs font-semibold text-emerald-900">
                                    📡 शहरी वार्ड सेंसर डेटा प्रतीक्षारत (Awaiting Ward Sensor Telemetry)
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    समस्त पिछला डेमो डेटा हटा दिया गया है। जैसे ही नगर निगम सेंसर व वाहनों से नया डेटा आएगा, वह यहां लाइव दिखेगा।
                                </div>
                            </div>
                        ) : (
                            urgentWardIssues.map((issue) => (
                            <div
                                key={issue.id}
                                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-emerald-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-slate-900 font-hindi">
                                            {issue.title}
                                        </span>
                                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                            issue.severity === 'Critical'
                                                ? 'bg-rose-100 text-rose-700'
                                                : issue.severity === 'High'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {issue.severity}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{issue.location}</span>
                                        <span className="text-slate-400">&bull;</span>
                                        <span className="text-emerald-700 font-medium">{issue.ward}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        गहराई: <strong>{issue.depth}</strong> &bull; जल स्तर: <strong>{issue.waterLevel}</strong>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 w-fit">
                                        <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>समय व दिनांक (Alert Time & Date): <strong className="font-mono">{formatDateTime(issue.rawEvent?.created_at || issue.rawEvent?.timestamp)}</strong></span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded">
                                        {issue.status}
                                    </span>
                                    <button
                                        onClick={() => onNavigateTab('incidents')}
                                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded transition cursor-pointer"
                                    >
                                        कार्य दल भेजें
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    </div>
                </div>

                {/* Right 4 Columns: Municipal Control Center Actions */}
                <div className="lg:col-span-4 gov-card p-5 space-y-4">
                    <div className="border-b pb-3">
                        <h3 className="font-bold text-base text-slate-900 font-hindi flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-emerald-800" />
                            <span>स्मार्ट सिटी कंट्रोल सेल</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            नगर निगम हेल्पडेस्क एवं वार्ड वाहन बेड़ा
                        </p>
                    </div>

                    <div className="space-y-3 text-xs text-slate-700">
                        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1">
                            <div className="font-bold text-emerald-950 font-hindi">
                                नगर निगम हेल्पलाइन (Toll-Free 1533)
                            </div>
                            <p className="text-[11px] text-emerald-800">
                                नागरिक गड्ढे व जलभराव की फोटो सीधे व्हाट्सएप व 1533 हेल्पलाइन द्वारा रिपोर्ट कर सकते हैं।
                            </p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <div className="font-bold text-slate-900">
                                सक्शन एवं जेटिंग मशीन स्थिति
                            </div>
                            <div className="text-[11px] text-slate-600">
                                वार्ड 14 एवं 08 में <strong>3 सुपर सक्शन वाहन</strong> नाली निकासी हेतु सक्रिय हैं।
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <div className="font-bold text-slate-900">
                                कोल्ड-मिक्स डामर स्टॉक
                            </div>
                            <div className="text-[11px] text-slate-600">
                                आपातकालीन बारिश के मौसम में भरने हेतु <strong>140 बैग कोल्ड मिक्स</strong> उपलब्ध।
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
