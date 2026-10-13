import React, { useState } from 'react';
import { BarChart3, PieChart, Download, FileSpreadsheet, Calendar, CheckCircle2, Info, TrendingUp } from 'lucide-react';
import { ANALYTICS_DATA } from '../../data/landingData';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell
} from 'recharts';

export default function ReportsAnalyticsSection() {
    const [timeframe, setTimeframe] = useState('weekly');

    const handleDownloadDemoReport = () => {
        const csvContent =
            'डेटा स्रोत,ई-सारथी (i-SARTHI) राष्ट्रीय सड़क सुरक्षा अनुकरण प्रणाली\n' +
            'रिपोर्ट प्रकार,साप्ताहिक सड़क सुरक्षा एवं जोखिम सारांश (डेमो)\n' +
            'तारीख,12 अक्टूबर 2026\n\n' +
            'दिन,कुल चेतावनियाँ,गड्ढे,चालक अलर्ट,टक्कर जोखिम\n' +
            ANALYTICS_DATA.dailyAlerts
                .map((r) => `${r.day},${r.चेतावनियाँ},${r.गड्ढे},${r.चालक_अलर्ट},${r.टक्कर_जोखिम}`)
                .join('\n') +
            '\n\nश्रेणी,प्रतिशत अंश\n' +
            ANALYTICS_DATA.categoryBreakdown.map((c) => `${c.name},${c.value}%`).join('\n') +
            '\n\nअस्वीकरण: यह शैक्षणिक प्रदर्शन हेतु अनुकरणीय डेटा है। वास्तविक सरकारी रिकॉर्ड नहीं।\n';

        const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
            type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'iSARTHI_Sarak_Suraksha_Demo_Report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section
            id="analytics-section"
            aria-labelledby="analytics-title"
            className="w-full bg-slate-50 py-10 sm:py-16 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-900" />
                            <span>सांख्यिकी एवं विश्लेषणात्मक डैशबोर्ड (Statistical Analytics)</span>
                        </div>
                        <h2
                            id="analytics-title"
                            className="text-2xl sm:text-3xl font-bold text-slate-900 font-hindi"
                        >
                            सड़क सुरक्षा विश्लेषण एवं रिपोर्ट
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            घटना प्रवृत्तियों, सतह जोखिमों एवं वाहन अनुपालन का समग्र सांख्यिकीय मूल्यांकन
                        </p>
                    </div>

                    {/* Timeframe selector & Download Report Button */}
                    <div className="flex items-center flex-wrap gap-2.5">
                        <div className="flex items-center bg-white border border-slate-300 rounded p-0.5 text-xs">
                            <button
                                onClick={() => setTimeframe('weekly')}
                                className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                                    timeframe === 'weekly' ? 'bg-[#0f274e] text-white' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                साप्ताहिक
                            </button>
                            <button
                                onClick={() => setTimeframe('monthly')}
                                className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                                    timeframe === 'monthly' ? 'bg-[#0f274e] text-white' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                मासिक
                            </button>
                        </div>

                        {/* Download Demo Report Button */}
                        <button
                            onClick={handleDownloadDemoReport}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>डेमो रिपोर्ट डाउनलोड करें</span>
                        </button>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                    {/* Chart 1: दैनिक चेतावनी सारांश (7 cols) */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 font-hindi">
                                    दैनिक चेतावनी सारांश (Daily Alert Trends)
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    सप्ताह के दिनों के अनुसार दर्ज गड्ढों व जोखिमों की संख्या
                                </p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-bold border border-blue-200">
                                बार चार्ट
                            </span>
                        </div>

                        {/* Responsive Recharts Bar Container */}
                        <div className="w-full h-64 text-xs font-hindi">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ANALYTICS_DATA.dailyAlerts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                    <Bar dataKey="गड्ढे" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="चालक_अलर्ट" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="टक्कर_जोखिम" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span>सर्वाधिक सक्रिय दिन: <strong className="text-slate-800">शनिवार (31 चेतावनियाँ)</strong></span>
                            <span className="text-amber-700 font-medium">अनुकरणीय विश्लेषण डेटा</span>
                        </div>
                    </div>

                    {/* Chart 2: जोखिम श्रेणी के अनुसार घटनाएँ (5 cols) */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 font-hindi">
                                    जोखिम श्रेणी के अनुसार घटनाएँ
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    सड़क खतरों का प्रतिशत वितरण
                                </p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-200">
                                पाई चार्ट
                            </span>
                        </div>

                        {/* Recharts Pie Chart */}
                        <div className="w-full h-64 text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPie>
                                    <Pie
                                        data={ANALYTICS_DATA.categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {ANALYTICS_DATA.categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [`${value}%`, name]}
                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </div>

                        {/* Vehicle Status Distribution Mini summary */}
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-800">वाहन स्थिति वितरण (Vehicle Safety Compliance):</div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span>सुरक्षित परिचालन (&gt;90%): <strong>864 वाहन (69%)</strong></span>
                                <span className="text-emerald-700 font-bold">सामान्य</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
