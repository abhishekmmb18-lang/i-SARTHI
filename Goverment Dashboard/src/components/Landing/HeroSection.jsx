import React from 'react';
import { ArrowRight, Activity, ShieldCheck, PhoneCall, Radio, Eye, Layers, Lock } from 'lucide-react';

export default function HeroSection({ onOpenDashboard, onNavigateSection }) {
    return (
        <section
            id="hero"
            aria-labelledby="hero-heading"
            className="relative bg-gradient-to-b from-[#0f274e] via-[#122e5a] to-[#0a1b37] text-white pt-10 pb-12 sm:pt-14 sm:pb-16 overflow-hidden border-b border-slate-700"
        >
            {/* Subtle Ashoka Chakra watermark background */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-[600px] h-[600px]" fill="none" stroke="#ffffff">
                    <circle cx="50" cy="50" r="48" strokeWidth="2" />
                    {Array.from({ length: 24 }).map((_, i) => (
                        <line
                            key={i}
                            x1="50"
                            y1="50"
                            x2="50"
                            y2="4"
                            strokeWidth="1.5"
                            transform={`rotate(${i * 15} 50 50)`}
                        />
                    ))}
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* Left Column: Formal Headings, Subheadings & Action Buttons */}
                    <div className="lg:col-span-7 space-y-5 text-left">
                        {/* Institutional Category Tag */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 backdrop-blur-xs">
                            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>राष्ट्रीय सड़क सुरक्षा प्रौद्योगिकी मिशन &bull; i-SARTHI नेटवर्क</span>
                        </div>

                        {/* Main Hindi Heading */}
                        <h1
                            id="hero-heading"
                            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-hindi text-white"
                        >
                            सुरक्षित सड़कें, <span className="text-amber-400">सुरक्षित भारत</span>
                        </h1>

                        {/* Supporting Heading */}
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-200 leading-snug font-hindi">
                            बुद्धिमान तकनीक से सड़क दुर्घटनाओं की रोकथाम एवं त्वरित आपातकालीन सहायता
                        </h2>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
                            ई-सारथी एक स्मार्ट सड़क सुरक्षा एवं यातायात निगरानी प्रणाली है, जो वाहन सेंसर, कृत्रिम बुद्धिमत्ता और वास्तविक समय के डेटा के माध्यम से सड़क पर संभावित खतरों की पहचान करने तथा समय पर चेतावनी देने में सहायता करती है।
                        </p>

                        {/* Key Pillars Badges */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1 max-w-xl text-[11px] sm:text-xs">
                            <div className="bg-white/5 border border-white/15 rounded-lg p-2.5 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span className="font-medium text-slate-200">AI सतह गड्ढा पहचान</span>
                            </div>
                            <div className="bg-white/5 border border-white/15 rounded-lg p-2.5 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="font-medium text-slate-200">चालक सतर्कता संवेदन</span>
                            </div>
                            <div className="bg-white/5 border border-white/15 rounded-lg p-2.5 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="font-medium text-slate-200">V2V मेश संचार</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {/* Button 1: निगरानी डैशबोर्ड देखें */}
                            {/* Button 1: विभागीय पोर्टल प्रवेश (NHAI / State / Nagar Nigam) */}
                            <button
                                onClick={() => onNavigateSection('departmental-gateways')}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-md text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                            >
                                <Lock className="w-4 h-4 text-slate-950" />
                                <span>विभागीय पोर्टल प्रवेश</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Button 2: निगरानी डैशबोर्ड देखें */}
                            <button
                                onClick={onOpenDashboard}
                                className="bg-blue-900/90 hover:bg-blue-800 text-white font-semibold border border-blue-400/40 px-4 py-2.5 rounded-md text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                            >
                                <span>निगरानी डैशबोर्ड</span>
                            </button>

                            {/* Button 3: सड़क सुरक्षा स्थिति */}
                            <button
                                onClick={() => onNavigateSection('dashboard-preview')}
                                className="bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-3.5 py-2.5 rounded-md text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                                <span>सड़क सुरक्षा स्थिति</span>
                            </button>

                            {/* Button 4: आपातकालीन सहायता */}
                            <button
                                onClick={() => onNavigateSection('safety-info-section')}
                                className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-semibold border border-rose-600/60 px-3.5 py-2.5 rounded-md text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <PhoneCall className="w-4 h-4 text-rose-300" />
                                <span>आपातकालीन सहायता</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Visual of Indian Highway with Telemetry Overlay */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl bg-slate-900 group">
                            {/* The realistic Indian Highway photograph */}
                            <img
                                src="/images/hero-highway.jpg"
                                alt="राष्ट्रीय राजमार्ग पर ई-सारथी सड़क सुरक्षा निगरानी एवं सेंसर ओवरले"
                                className="w-full h-72 sm:h-84 lg:h-96 object-cover brightness-95 contrast-105 group-hover:scale-102 transition duration-500"
                            />

                            {/* Subtle dark gradient overlay to seat HUD badges */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                            {/* Top Telemetry Header Badge */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono bg-black/60 backdrop-blur-xs px-2.5 py-1.5 rounded border border-white/15 text-slate-200">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>NH-48 राष्ट्रीय राजमार्ग कॉरिडोर</span>
                                </div>
                                <span className="text-emerald-300 font-bold">सक्रिय लाइव टेलीमेट्री</span>
                            </div>

                            {/* Bottom Floating Telemetry Overlay Badges */}
                            <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                    <div className="bg-slate-900/85 backdrop-blur-xs p-2 rounded border border-cyan-500/30 text-cyan-200">
                                        <div className="text-[9px] text-slate-400 uppercase">LiDAR परास</div>
                                        <div className="font-bold text-xs">45.0m &bull; बाधा मुक्त</div>
                                    </div>
                                    <div className="bg-slate-900/85 backdrop-blur-xs p-2 rounded border border-amber-500/30 text-amber-200">
                                        <div className="text-[9px] text-slate-400 uppercase">AI सतह स्कैन</div>
                                        <div className="font-bold text-xs">99.2% गड्ढा शुद्धता</div>
                                    </div>
                                </div>
                                <div className="bg-slate-950/90 text-center py-1 rounded text-[10px] text-slate-400 border border-slate-700">
                                    एकीकृत टेलीमेट्री नियंत्रक: Edge AI + 6-DOF IMU + V2X मेश गेटवे
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Indian Tricolour Horizontal Accent Ribbon at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
                <div className="h-full flex-1 bg-[#FF9933]" title="केसरिया"></div>
                <div className="h-full flex-1 bg-white" title="श्वेत"></div>
                <div className="h-full flex-1 bg-[#138808]" title="हरा"></div>
            </div>
        </section>
    );
}
