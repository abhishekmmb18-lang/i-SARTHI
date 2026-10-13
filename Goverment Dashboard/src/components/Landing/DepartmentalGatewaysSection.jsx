import React from 'react';
import { Building2, ShieldCheck, ArrowRight, Lock, KeyRound, MapPin, Truck, CheckCircle2, ChevronRight, Landmark, Navigation } from 'lucide-react';
import { AUTHORITIES } from '../../data/authoritiesData';
import AshokaChakraIcon from './AshokaChakraIcon';

export default function DepartmentalGatewaysSection({ onSelectAuthorityLogin }) {
    const authorityList = [AUTHORITIES.nhai, AUTHORITIES.state, AUTHORITIES.nagarnigam, AUTHORITIES.safety];

    return (
        <section
            id="departmental-gateways"
            aria-labelledby="gateways-title"
            className="w-full bg-white py-12 sm:py-16 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
                        <Lock className="w-3.5 h-3.5 text-blue-800" />
                        <span>प्रशासनिक अधिकार क्षेत्र चयन (Multi-Tier Administrative Access)</span>
                    </div>

                    <h2
                        id="gateways-title"
                        className="text-2xl sm:text-3xl font-black text-slate-900 font-hindi"
                    >
                        विभागीय पोर्टल प्रवेश — अधिकार क्षेत्र चयन
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        ई-सारथी राष्ट्रीय सड़क सुरक्षा प्रणाली 4-स्तरीय प्रशासनिक संरचना का समर्थन करती है। अपने अधिकृत विभाग का चयन करें और क्रेडेंशियल्स द्वारा लॉगिन करें।
                    </p>
                </div>

                {/* 4 Authority Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                    {authorityList.map((auth) => (
                        <div
                            key={auth.id}
                            className={`rounded-xl border-2 ${auth.borderAccent} bg-gradient-to-b ${auth.cardBg} p-6 shadow-sm hover:shadow-lg transition duration-200 flex flex-col justify-between space-y-5 group`}
                        >
                            {/* Card Top: Tag & Chakra / Icon */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${auth.badgeColor}`}>
                                        {auth.tag}
                                    </span>
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {auth.code}
                                    </span>
                                </div>

                                {/* Title & Subtitle */}
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 font-hindi leading-snug">
                                        {auth.nameHindi}
                                    </h3>
                                    <div className="text-xs font-bold text-slate-700">
                                        {auth.englishTitle}
                                    </div>
                                    <div className="text-[11px] text-blue-900 font-semibold pt-0.5">
                                        {auth.divisionHindi}
                                    </div>
                                </div>

                                {/* Jurisdiction Scope */}
                                <div className="bg-white/80 border border-slate-200 rounded-lg p-3 text-xs space-y-1 shadow-2xs">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">अधिकार क्षेत्र (Jurisdiction):</div>
                                    <div className="text-slate-800 font-medium leading-relaxed text-[11px]">
                                        {auth.jurisdictionHindi}
                                    </div>
                                </div>

                                {/* Key Features Bullet list */}
                                <div className="space-y-2 pt-1">
                                    <div className="text-[11px] font-bold text-slate-700">प्रणाली क्षमताएँ:</div>
                                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                                        {auth.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                <span className="leading-tight">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* State Selection Chips for State Authority Card */}
                                {auth.id === 'state' && (
                                    <div className="bg-amber-100/60 border border-amber-200 rounded-lg p-2.5 space-y-1.5">
                                        <div className="text-[10px] font-bold text-amber-950 flex items-center justify-between">
                                            <span>प्रमुख राज्य (Select State):</span>
                                            <span className="text-[9px] text-amber-800">12+ राज्य उपलब्ध</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {[
                                                { id: 'UP', name: 'उत्तर प्रदेश' },
                                                { id: 'MH', name: 'महाराष्ट्र' },
                                                { id: 'HR', name: 'हरियाणा' },
                                                { id: 'DL', name: 'दिल्ली' },
                                                { id: 'RJ', name: 'राजस्थान' },
                                                { id: 'KA', name: 'कर्नाटक' }
                                            ].map((st) => (
                                                <button
                                                    key={st.id}
                                                    type="button"
                                                    onClick={() => onSelectAuthorityLogin('state', st.id)}
                                                    className="px-2 py-0.5 rounded bg-white hover:bg-amber-600 hover:text-white border border-amber-300 text-[10px] font-bold text-amber-950 transition cursor-pointer"
                                                >
                                                    {st.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card Bottom: Login CTA & Officer Rank */}
                            <div className="pt-4 border-t border-slate-200/80 space-y-3">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                    <span>अनुशंसित पद:</span>
                                    <span className="font-bold text-slate-700">{auth.officerRank}</span>
                                </div>

                                <button
                                    onClick={() => onSelectAuthorityLogin(auth.id)}
                                    className={`w-full py-2.5 px-4 rounded-lg text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer group-hover:scale-101 ${
                                        auth.id === 'nhai'
                                            ? 'bg-blue-950 hover:bg-blue-900'
                                            : auth.id === 'state'
                                            ? 'bg-amber-800 hover:bg-amber-700'
                                            : auth.id === 'safety'
                                            ? 'bg-rose-950 hover:bg-rose-900'
                                            : 'bg-emerald-900 hover:bg-emerald-800'
                                    }`}
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>{auth.id === 'state' ? 'राज्य चुनें एवं लॉगिन करें' : `${auth.shortName} पोर्टल लॉगिन`}</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Information Callout */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                            <strong>क्रेडेंशियल सूचना:</strong> प्रत्येक विभाग के लिए अधिकृत यूजर आईडी और पासवर्ड अनिवार्य हैं। राष्ट्रीय व राज्य स्तरीय अधिकारियों हेतु सुरक्षित पहुंच सक्षम है।
                        </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shrink-0">
                        रोल-बेस्ड एक्सेस कंट्रोल (RBAC) सक्रिय
                    </span>
                </div>

            </div>
        </section>
    );
}
