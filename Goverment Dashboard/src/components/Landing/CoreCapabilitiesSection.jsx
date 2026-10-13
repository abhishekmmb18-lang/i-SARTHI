import React from 'react';
import { Eye, Radio, AlertTriangle, ShieldAlert, Cpu, Route, CheckCircle } from 'lucide-react';
import { CORE_CAPABILITIES } from '../../data/landingData';

export default function CoreCapabilitiesSection() {
    const iconMap = {
        'A': Eye,
        'B': Radio,
        'C': AlertTriangle,
        'D': ShieldAlert,
        'E': Cpu,
        'F': Route
    };

    return (
        <section
            id="capabilities-section"
            aria-labelledby="capabilities-title"
            className="w-full bg-slate-50 py-10 sm:py-16 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
                        <span className="w-2 h-2 rounded-full bg-blue-800"></span>
                        <span>प्रौद्योगिकी एवं वास्तुकला</span>
                    </div>
                    <h2
                        id="capabilities-title"
                        className="text-2xl sm:text-3xl font-black text-slate-900 font-hindi"
                    >
                        ई-सारथी की प्रमुख विशेषताएँ
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        सड़क सुरक्षा संवर्धन एवं शून्य-दुर्घटना लक्ष्य प्राप्ति हेतु अत्याधुनिक एज कम्प्यूटिंग, बहु-सेंसर टेलीमेट्री एवं AI विज़न आर्किटेक्चर
                    </p>
                </div>

                {/* 6 Formal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {CORE_CAPABILITIES.map((cap) => {
                        const Icon = iconMap[cap.code] || ShieldAlert;
                        return (
                            <div
                                key={cap.id}
                                className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition duration-200 flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    {/* Top Row: Capability Letter Badge & Category Tag */}
                                    <div className="flex items-center justify-between">
                                        <div className="w-9 h-9 rounded-md bg-[#0f274e] text-amber-400 font-bold flex items-center justify-center text-sm shadow-xs">
                                            {cap.code}
                                        </div>
                                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                            {cap.badge}
                                        </span>
                                    </div>

                                    {/* Icon & Title */}
                                    <div className="flex items-center gap-2.5 pt-1">
                                        <div className="p-2 rounded bg-blue-50 text-blue-900 border border-blue-100 shrink-0">
                                            <Icon className="w-5 h-5 text-blue-900" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-slate-900 font-hindi">
                                                {cap.title}
                                            </h3>
                                            <div className="text-[11px] text-blue-900 font-medium">
                                                {cap.subtitle}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                        {cap.description}
                                    </p>
                                </div>

                                {/* Bottom Metric Footnote */}
                                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                    <span className="text-slate-400">दक्षता मानक (Benchmark):</span>
                                    <span className="font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                        {cap.metrics}
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
