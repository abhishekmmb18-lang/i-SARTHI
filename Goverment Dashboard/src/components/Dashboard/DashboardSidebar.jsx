import React from 'react';
import {
    Activity,
    MapPin,
    AlertCircle,
    Layers,
    EyeOff,
    Cpu,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Radio,
    Shield,
    CheckCircle2,
    Building2,
    Landmark,
    Globe,
    Wrench,
    Droplets
} from 'lucide-react';

export default function DashboardSidebar({
    activeTab,
    setActiveTab,
    currentSection = 'nhai', // 'nhai' | 'state' | 'municipal' | 'safety'
    onChangeSection,
    telemetryData,
    activeAuthority,
    currentRole,
    isCollapsed = false,
    onToggleCollapse
}) {
    const rawEvents = telemetryData.roadEvents || [];

    // Filter road-only events (no alcohol, no SOS)
    const roadOnlyEvents = rawEvents.filter(e => {
        const isDriverEvent = (e.type || '').includes('Alcohol') || (e.type || '').includes('SOS') || e.sos_alert;
        return !isDriverEvent;
    });

    const totalHazards = rawEvents.length;
    const roadHazardsCount = roadOnlyEvents.length;
    const clustersCount = telemetryData.clusters?.length || 0;
    const safetyAlerts = (telemetryData.drowsinessBundles?.length || 0) +
        (rawEvents.filter(e => (e.type || '').includes('SOS') || e.alcohol > 0)?.length || 0);
    const onlineDevices = telemetryData.devices?.filter(d => d.computed_status === 'Online')?.length || 0;
    const totalDevices = telemetryData.devices?.length || 0;

    // Define navigation items dynamically based on the active administrative section
    let navItems = [];

    if (currentSection === 'state') {
        // STATE PWD SECTION: Strictly road defects, NO drowsiness, NO driver telemetry
        navItems = [
            {
                id: 'overview',
                label: 'State Road Overview',
                labelHindi: 'राज्य सड़क विहंगावलोकन',
                icon: Building2,
                description: 'PWD Road Roughness & KPIs',
                badge: 'PWD Live',
                badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
            },
            {
                id: 'map',
                label: 'State Highway Map',
                labelHindi: 'राज्य सड़क जीआईएस मानचित्र',
                icon: MapPin,
                description: 'SH & MDR Corridors',
                badge: 'SH / MDR',
                badgeColor: 'bg-blue-100 text-blue-800 border border-blue-200'
            },
            {
                id: 'incidents',
                label: 'Road Defects & Potholes',
                labelHindi: 'सड़क गड्ढे व सतह क्षति',
                icon: AlertCircle,
                description: 'Potholes, Cracks (Road Only)',
                badge: String(roadHazardsCount),
                badgeColor: 'bg-orange-100 text-orange-900 border border-orange-300 font-bold'
            },
            {
                id: 'clusters',
                label: 'PWD Repair Clusters',
                labelHindi: 'PWD कार्य आदेश व क्लस्टर',
                icon: Layers,
                description: '10x Crowd-Verified Repairs',
                badge: String(clustersCount),
                badgeColor: 'bg-purple-100 text-purple-900 border border-purple-200 font-bold'
            },
            {
                id: 'reports',
                label: 'State PWD Reports',
                labelHindi: 'सामग्री व सिविल रिपोर्ट',
                icon: FileSpreadsheet,
                description: 'Hot-Mix Estimates & Compliance',
                badge: 'Estimates',
                badgeColor: 'bg-slate-100 text-slate-700 border border-slate-300'
            }
        ];
    } else if (currentSection === 'municipal') {
        // MUNICIPAL NAGAR NIGAM SECTION: Urban streets, waterlogging, ward teams
        navItems = [
            {
                id: 'overview',
                label: 'Municipal Ward Overview',
                labelHindi: 'वार्ड सड़क विहंगावलोकन',
                icon: Landmark,
                description: 'City Potholes & Waterlogging',
                badge: 'Ward Live',
                badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
            },
            {
                id: 'map',
                label: 'City Ward GIS Map',
                labelHindi: 'वार्ड जीआईएस मानचित्र',
                icon: MapPin,
                description: 'Urban Streets & Drainage',
                badge: 'City GIS',
                badgeColor: 'bg-cyan-100 text-cyan-900 border border-cyan-300'
            },
            {
                id: 'incidents',
                label: 'Ward Surface Defects',
                labelHindi: 'शहरी गड्ढे व धंसी सड़कें',
                icon: AlertCircle,
                description: 'Street Trenches & Complaints',
                badge: String(roadHazardsCount),
                badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
            },
            {
                id: 'clusters',
                label: 'Ward Repair Orders',
                labelHindi: 'वार्ड मरम्मत व सफाई आदेश',
                icon: Wrench,
                description: 'Patch Crews & Suction Teams',
                badge: 'Crews Active',
                badgeColor: 'bg-purple-100 text-purple-200'
            },
            {
                id: 'reports',
                label: 'Municipal Reports',
                labelHindi: 'वार्ड रिपोर्ट व आंकड़े',
                icon: FileSpreadsheet,
                description: 'Desilt & Pavement Audit',
                badge: 'Reports',
                badgeColor: 'bg-slate-100 text-slate-700 border border-slate-300'
            }
        ];
    } else if (currentSection === 'safety') {
        // DRIVER & FLEET DMS SECTION: Driver vigilance, fatigue, alcohol, and SOS
        navItems = [
            {
                id: 'safety',
                label: 'Driver Safety & DMS',
                labelHindi: 'चालक उनींदापन व थकान',
                icon: EyeOff,
                description: '5x Fatigue Clusters in 2 Min',
                badge: String(safetyAlerts),
                badgeColor: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
            },
            {
                id: 'incidents',
                label: 'SOS & Alcohol Alerts',
                labelHindi: 'आपातकालीन पायलट व शराब अलर्ट',
                icon: AlertCircle,
                description: 'MQ-3 Sensor & Pilot Distress',
                badge: 'Emergency',
                badgeColor: 'bg-red-100 text-red-900 border border-red-300 font-bold'
            },
            {
                id: 'devices',
                label: 'Hardware Telemetry',
                labelHindi: 'इन-केबिन टेलीमेट्री नोड्स',
                icon: Cpu,
                description: 'Raspberry Pi & Jetson Nodes',
                badge: `${onlineDevices}/${totalDevices}`,
                badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            },
            {
                id: 'reports',
                label: 'Fleet Safety Reports',
                labelHindi: 'फ्लीट चालक सुरक्षा रिपोर्ट',
                icon: FileSpreadsheet,
                description: 'Driver Score & Rest Break Logs',
                badge: 'Audit',
                badgeColor: 'bg-slate-100 text-slate-700 border border-slate-300'
            }
        ];
    } else {
        // NHAI SECTION: National Highways Authority of India (Expressways, Blackspots, Central Command)
        navItems = [
            {
                id: 'overview',
                label: 'NHAI Central Command',
                labelHindi: 'एनएचएआई केंद्रीय कमान',
                icon: Activity,
                description: 'National Expressways & Corridors',
                badge: 'NHAI Live',
                badgeColor: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold'
            },
            {
                id: 'map',
                label: 'National Highway Map',
                labelHindi: 'राष्ट्रीय राजमार्ग जीआईएस मैप',
                icon: MapPin,
                description: 'NH-44, NH-48 & Live Expressways',
                badge: 'NH GIS',
                badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            },
            {
                id: 'incidents',
                label: 'National Road Hazards',
                labelHindi: 'राष्ट्रीय राजमार्ग गड्ढे व अवरोध',
                icon: AlertCircle,
                description: 'Expressways & Highway Defects',
                badge: String(totalHazards),
                badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
            },
            {
                id: 'clusters',
                label: 'Highway Blackspot Clusters',
                labelHindi: '10x प्रमाणित ब्लैकस्पॉट',
                icon: Layers,
                description: 'High-G Structural Depressions',
                badge: String(clustersCount),
                badgeColor: 'bg-purple-100 text-purple-900 border border-purple-200 font-bold'
            },
            {
                id: 'devices',
                label: 'Highway Connected Fleet',
                labelHindi: 'सड़क सर्वेक्षण टेलीमेट्री इकाइयाँ',
                icon: Cpu,
                description: 'Edge AI Sensors & Fastag Nodes',
                badge: `${onlineDevices}/${totalDevices}`,
                badgeColor: onlineDevices > 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                    : 'bg-slate-200 text-slate-700 font-medium'
            },
            {
                id: 'reports',
                label: 'NHAI Executive Reports',
                labelHindi: 'MoRTH राष्ट्रीय रिपोर्ट',
                icon: FileSpreadsheet,
                description: 'Corridor Performance & Audits',
                badge: 'Reports',
                badgeColor: 'bg-slate-100 text-slate-700 border border-slate-300'
            }
        ];
    }

    const sections = [
        { id: 'nhai', label: 'NHAI', icon: Shield, tag: 'National Highways' },
        { id: 'state', label: 'State PWD', icon: Building2, tag: 'Roads Only' },
        { id: 'municipal', label: 'Nagar Nigam', icon: Landmark, tag: 'City Roads' },
        { id: 'safety', label: 'Driver DMS', icon: EyeOff, tag: 'Fleet Safety' }
    ];

    return (
        <aside
            aria-label="डैशबोर्ड साइडबार (Dashboard Sidebar)"
            className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shrink-0 select-none ${
                isCollapsed ? 'w-16' : 'w-64 sm:w-72'
            }`}
        >
            {/* 1. Administrative Section Switcher Tabs */}
            {!isCollapsed ? (
                <div className="p-3 border-b border-slate-200 bg-slate-50/90 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            प्रशासनिक प्राधिकरण (Authority)
                        </span>
                        {onToggleCollapse && (
                            <button
                                onClick={onToggleCollapse}
                                title="साइडबार छोटा करें"
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                        {sections.map((sec) => {
                            const SecIcon = sec.icon;
                            const isSecActive = currentSection === sec.id;
                            return (
                                <button
                                    key={sec.id}
                                    onClick={() => onChangeSection && onChangeSection(sec.id)}
                                    title={`${sec.label} (${sec.tag})`}
                                    className={`px-2 py-1.5 rounded-lg text-left transition flex items-center space-x-1.5 cursor-pointer border ${
                                        isSecActive
                                            ? 'bg-blue-900 text-white font-bold border-blue-950 shadow-2xs'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <SecIcon className="w-3.5 h-3.5 shrink-0" />
                                    <div className="truncate min-w-0">
                                        <div className="text-[11px] leading-tight font-semibold truncate">
                                            {sec.label}
                                        </div>
                                        <div className={`text-[9px] truncate ${isSecActive ? 'text-blue-200' : 'text-slate-400'}`}>
                                            {sec.tag}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="p-2 border-b border-slate-200 flex flex-col items-center gap-2">
                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            title="साइडबार विस्तृत करें"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                    <span className="w-2 h-2 rounded-full bg-blue-900 animate-pulse"></span>
                </div>
            )}

            {/* 2. Navigation Module List For Current Section */}
            <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
                {!isCollapsed && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {currentSection === 'state'
                            ? 'राज्य सड़क मॉड्यूल (Road Only)'
                            : currentSection === 'municipal'
                            ? 'नगर निगम मॉड्यूल (City Roads)'
                            : currentSection === 'safety'
                            ? 'चालक सुरक्षा मॉड्यूल (DMS)'
                            : 'NHAI राष्ट्रीय मॉड्यूल (National)'}
                    </span>
                )}
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            title={`${item.label} (${item.labelHindi})`}
                            className={`w-full flex items-center rounded-xl transition text-left cursor-pointer group ${
                                isCollapsed
                                    ? 'justify-center p-3'
                                    : 'px-3 py-2 space-x-2.5'
                            } ${
                                isActive
                                    ? 'bg-blue-900 text-white font-semibold shadow-xs ring-1 ring-blue-950'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            {/* Icon */}
                            <div
                                className={`shrink-0 p-1.5 rounded-lg transition ${
                                    isActive
                                        ? 'bg-blue-800 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                                }`}
                            >
                                <IconComponent className="w-4 h-4" />
                            </div>

                            {/* Label & Description (when expanded) */}
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs font-semibold truncate tracking-tight">
                                            {item.label}
                                        </span>
                                        {/* Data Badge */}
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                                                isActive
                                                    ? 'bg-white/20 text-white border border-white/30 font-bold'
                                                    : item.badgeColor
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    </div>
                                    <div
                                        className={`text-[10px] truncate transition ${
                                            isActive
                                                ? 'text-blue-200'
                                                : 'text-slate-400 group-hover:text-slate-600'
                                        }`}
                                    >
                                        {item.description}
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* 3. Section Scope Explanation / Disclaimer Box */}
            {!isCollapsed && (
                <div className="p-3 border-t border-slate-200 bg-slate-50/80 m-2 rounded-xl border">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-1">
                        <span className="truncate">
                            {currentSection === 'state'
                                ? 'राज्य PWD सड़क दायरा'
                                : currentSection === 'municipal'
                                ? 'नगर निगम शहरी दायरा'
                                : currentSection === 'safety'
                                ? 'वाहन फ्लीट DMS दायरा'
                                : 'NHAI राष्ट्रीय राजमार्ग कमान'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            सक्रिय
                        </span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                        {currentSection === 'state'
                            ? 'केवल सड़क क्षति, गड्ढे व मरम्मत कार्य। चालक उनींदापन डेटा बहिष्कृत।'
                            : currentSection === 'municipal'
                            ? 'शहरी वार्ड सड़कें व जलभराव। राजमार्ग टोल टेलीमेट्री बहिष्कृत।'
                            : currentSection === 'safety'
                            ? 'चालक सतर्कता, थकान व आपातकालीन पायलट सहायता।'
                            : 'समस्त राष्ट्रीय एक्सप्रेसवे, ब्लैकस्पॉट व 1033 पेट्रोल समन्वय।'}
                    </div>
                </div>
            )}
        </aside>
    );
}
