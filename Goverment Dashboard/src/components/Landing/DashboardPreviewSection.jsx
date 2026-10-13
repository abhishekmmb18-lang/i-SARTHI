import React from 'react';
import { Truck, AlertTriangle, AlertOctagon, ShieldAlert, LifeBuoy, Activity, Clock, Info, CheckCircle2 } from 'lucide-react';
import { DEMO_STATS } from '../../data/landingData';

export default function DashboardPreviewSection({ onOpenDashboard }) {
    const cards = [
        {
            id: 'vehicles',
            title: 'निगरानी में वाहन',
            value: DEMO_STATS.vehiclesMonitored,
            unit: 'वाहन (इकाइयाँ)',
            subtitle: 'सक्रिय GPS एवं टेलीमेट्री',
            icon: Truck,
            badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
            iconColor: 'text-blue-700'
        },
        {
            id: 'alerts',
            title: 'सक्रिय सड़क चेतावनियाँ',
            value: DEMO_STATS.activeAlerts,
            unit: 'तत्काल चेतावनियाँ',
            subtitle: 'समीक्षा व कार्रवाई जारी',
            icon: AlertTriangle,
            badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
            iconColor: 'text-amber-700'
        },
        {
            id: 'risk-zones',
            title: 'संभावित जोखिम क्षेत्र',
            value: DEMO_STATS.riskZones,
            unit: 'पहचाने गए खंड',
            subtitle: 'ब्लैकस्पॉट व सतह दोष',
            icon: AlertOctagon,
            badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
            iconColor: 'text-rose-700'
        },
        {
            id: 'incidents-today',
            title: 'आज दर्ज घटनाएँ',
            value: DEMO_STATS.incidentsToday,
            unit: 'घटना रिकॉर्ड',
            subtitle: 'गड्ढे व अचानक ब्रेक',
            icon: ShieldAlert,
            badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
            iconColor: 'text-indigo-700'
        },
        {
            id: 'sos-alerts',
            title: 'सहायता हेतु अलर्ट',
            value: DEMO_STATS.sosAlerts,
            unit: 'गोल्डन ऑवर अलर्ट',
            subtitle: 'गश्ती दल एवं समन्वय',
            icon: LifeBuoy,
            badgeColor: 'bg-red-50 text-red-800 border-red-200',
            iconColor: 'text-red-700'
        },
        {
            id: 'system-status',
            title: 'प्रणाली की स्थिति',
            value: DEMO_STATS.systemStatus,
            unit: 'सभी नोड सामान्य',
            subtitle: 'AI इंजन व V2X सक्रिय',
            icon: Activity,
            badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            iconColor: 'text-emerald-700'
        }
    ];

    return (
        <section
            id="dashboard-preview"
            aria-labelledby="dashboard-preview-title"
            className="w-full bg-slate-50 py-10 sm:py-14 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-900 inline-block"></span>
                            <span>कार्यकारी मेट्रिक्स अवलोकन</span>
                        </div>
                        <h2
                            id="dashboard-preview-title"
                            className="text-2xl sm:text-3xl font-bold text-slate-900 font-hindi"
                        >
                            राष्ट्रीय सड़क सुरक्षा निगरानी
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            संबद्ध राष्ट्रीय राजमार्ग गलियारों और स्मार्ट वाणिज्यिक वाहनों से संकलित प्राथमिक टेलीमेट्री सूचकांक
                        </p>
                    </div>

                    {/* Timestamp & Operational Status Badge */}
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-white border border-slate-300 text-slate-600 shadow-2xs font-mono text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>सिंक समय: <strong className="text-slate-800">17:32 IST</strong></span>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            राष्ट्रीय नियंत्रण केंद्र (National Command Center)
                        </span>
                    </div>
                </div>

                {/* Prominent Operational Monitoring Status Strip */}
                <div className="w-full bg-slate-900 border-l-4 border-emerald-500 p-3 sm:p-3.5 rounded-r text-xs text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white">
                            राष्ट्रीय सड़क सुरक्षा एवं यातायात प्रबंधन प्रणाली — समस्त राष्ट्रीय राजमार्ग एवं प्रादेशिक गलियारे वास्तविक समय निगरानी में सक्रिय हैं।
                        </span>
                    </div>
                    <button
                        onClick={onOpenDashboard}
                        className="text-xs font-bold text-amber-300 hover:text-amber-200 underline text-left sm:text-right shrink-0 cursor-pointer"
                    >
                        विस्तृत प्रशासनिक डैशबोर्ड खोलें &rarr;
                    </button>
                </div>

                {/* 6 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.id}
                                className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="text-xs font-semibold text-slate-500 font-hindi">
                                            {card.title}
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-hindi">
                                            {card.value}
                                        </div>
                                        <div className="text-[11px] font-medium text-slate-500">
                                            {card.unit}
                                        </div>
                                    </div>

                                    <div className={`p-2.5 rounded-md border ${card.badgeColor} group-hover:scale-105 transition`}>
                                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                    <span>{card.subtitle}</span>
                                    <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        सत्यापित
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
