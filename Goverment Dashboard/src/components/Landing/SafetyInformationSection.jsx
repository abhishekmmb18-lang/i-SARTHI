import React from 'react';
import { ShieldCheck, AlertOctagon, HeartPulse, PhoneCall, Info, ExternalLink, HelpCircle, CheckCircle } from 'lucide-react';

export default function SafetyInformationSection() {
    return (
        <section
            id="safety-info-section"
            aria-labelledby="safety-info-title"
            className="w-full bg-white py-10 sm:py-16 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>नागरिक एवं चालक सूचना केंद्र</span>
                    </div>
                    <h2
                        id="safety-info-title"
                        className="text-2xl sm:text-3xl font-black text-slate-900 font-hindi"
                    >
                        सड़क सुरक्षा: हमारी प्राथमिकता
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        सड़क दुर्घटनाओं में कमी लाने, जीवन रक्षा और गोल्डन ऑवर में प्रभावी प्राथमिक चिकित्सा सहायता हेतु राष्ट्रीय दिशानिर्देश
                    </p>
                </div>

                {/* 3 Informational Panels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Panel 1: सड़क सुरक्षा जागरूकता */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4 hover:border-slate-300 transition">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                            <ShieldCheck className="w-5 h-5 text-blue-900" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 font-hindi">
                                सड़क सुरक्षा जागरूकता
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                सुरक्षित ड्राइविंग व्यवहार एवं नियम अनुपालन
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold mt-0.5">&bull;</span>
                                <span>गति सीमा का सदैव पालन करें; एक्सप्रेसवे पर लेन अनुशासन बनाए रखें।</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold mt-0.5">&bull;</span>
                                <span>सीटबेल्ट एवं हेलमेट का अनिवार्य उपयोग सुनिश्चित करें।</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold mt-0.5">&bull;</span>
                                <span>ड्राइविंग के दौरान मोबाइल फोन का उपयोग अथवा ध्यान भटकाव पूर्णतः वर्जित है।</span>
                            </li>
                        </ul>
                    </div>

                    {/* Panel 2: दुर्घटना रोकथाम एवं जोखिम प्रबंधन */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4 hover:border-slate-300 transition">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                            <AlertOctagon className="w-5 h-5 text-amber-900" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 font-hindi">
                                दुर्घटना रोकथाम एवं जोखिम प्रबंधन
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                ब्लैकस्पॉट सुधार एवं वाहन सुरक्षा उपाय
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold mt-0.5">&bull;</span>
                                <span>पहचाने गए दुर्घटना-प्रवण क्षेत्रों (ब्लैकस्पॉट्स) पर पूर्व-चेतावनी संकेत।</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold mt-0.5">&bull;</span>
                                <span>कमर्शियल वाहनों में अनिवार्य स्पीड गवर्नर एवं एंटी-लॉक ब्रेकिंग सिस्टम।</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold mt-0.5">&bull;</span>
                                <span>रात्रि कालीन ड्राइविंग में उचित हेडलाइट बीम व रिफ्लेक्टिव स्ट्रिप्स का उपयोग।</span>
                            </li>
                        </ul>
                    </div>

                    {/* Panel 3: आपातकालीन प्रतिक्रिया समन्वय */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4 hover:border-slate-300 transition">
                        <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                            <HeartPulse className="w-5 h-5 text-rose-900" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 font-hindi">
                                आपातकालीन प्रतिक्रिया समन्वय
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                गोल्डन ऑवर एवं त्वरित चिकित्सा निष्क्रमण
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-600 font-bold mt-0.5">&bull;</span>
                                <span>दुर्घटना के पहले 60 मिनट (गोल्डन ऑवर) में त्वरित प्राथमिक उपचार जीवनरक्षक होता है।</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-600 font-bold mt-0.5">&bull;</span>
                                <span>नेक Samaritan कानून के तहत घायलों की मदद करने वाले नागरिकों को पूर्ण संरक्षण।</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-600 font-bold mt-0.5">&bull;</span>
                                <span>हाईवे ट्रॉमा केयर केंद्रों के साथ रियल-टाइम सूचना समन्वय।</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Prominent Official Integrated Emergency Information Panel */}
                <div className="bg-gradient-to-r from-[#0f274e] via-[#163668] to-[#0f274e] text-white rounded-xl p-6 sm:p-8 shadow-md border-2 border-amber-400/80 space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/20 pb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                                <PhoneCall className="w-4 h-4 text-amber-300 animate-bounce" />
                                <span>अखिल भारतीय आपातकालीन नंबर निर्देशिका</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white font-hindi">
                                आपातकालीन सहायता के लिए भारत का एकीकृत आपातकालीन नंबर 112
                            </h3>
                        </div>

                        <div className="px-3 py-1.5 rounded bg-black/40 border border-white/20 text-slate-300 text-[11px]">
                            टोल-फ्री &bull; 24x7 सेवा उपलब्ध
                        </div>
                    </div>

                    {/* Helplines Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <div className="bg-white/10 rounded-lg p-3.5 border border-white/15 space-y-1">
                            <div className="text-xs text-slate-300 font-medium">राष्ट्रीय आपातकालीन नंबर</div>
                            <div className="text-2xl font-mono font-black text-amber-400">112</div>
                            <div className="text-[11px] text-slate-300">पुलिस, अग्निशमन एवं आपातकालीन सेवा</div>
                        </div>

                        <div className="bg-white/10 rounded-lg p-3.5 border border-white/15 space-y-1">
                            <div className="text-xs text-slate-300 font-medium">राष्ट्रीय राजमार्ग हेल्पलाइन (NHAI)</div>
                            <div className="text-2xl font-mono font-black text-cyan-300">1033</div>
                            <div className="text-[11px] text-slate-300">हाईवे एम्बुलेंस, क्रेन व पेट्रोलिंग सहायता</div>
                        </div>

                        <div className="bg-white/10 rounded-lg p-3.5 border border-white/15 space-y-1">
                            <div className="text-xs text-slate-300 font-medium">एम्बुलेंस चिकित्सा सेवा</div>
                            <div className="text-2xl font-mono font-black text-emerald-300">108 / 102</div>
                            <div className="text-[11px] text-slate-300">त्वरित चिकित्सा एवं ट्रॉमा वाहन</div>
                        </div>
                    </div>

                    {/* Explicit Disclaimer */}
                    <div className="bg-black/30 rounded p-3 text-[11px] text-slate-300 flex items-start gap-2 border border-white/10">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                            <strong>महत्वपूर्ण सूचना:</strong> यह एक सूचनात्मक पोर्टल निर्देशिका है। यह वेब इंटरफ़ेस सीधे कॉल या डिस्पैच उत्पन्न नहीं करता। किसी भी वास्तविक आपातकालीन स्थिति में अपने मोबाइल या टेलीफोन से सीधे 112 अथवा 1033 डायल करें।
                        </span>
                    </div>
                </div>

            </div>
        </section>
    );
}
