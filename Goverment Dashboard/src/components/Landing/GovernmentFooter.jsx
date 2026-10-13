import React from 'react';
import AshokaChakraIcon from './AshokaChakraIcon';
import { ShieldCheck, Info, Heart, ArrowUp } from 'lucide-react';

export default function GovernmentFooter({ onNavigateSection }) {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer
            aria-label="सरकारी शैली पादलेख (Footer)"
            className="w-full bg-[#0a1a33] text-slate-300 relative border-t-4 border-slate-700"
        >
            {/* Top Indian Tricolour Decorative Accent Ribbon */}
            <div className="w-full h-1.5 flex">
                <div className="h-full flex-1 bg-[#FF9933]" title="केसरिया"></div>
                <div className="h-full flex-1 bg-white" title="श्वेत"></div>
                <div className="h-full flex-1 bg-[#138808]" title="हरा"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">

                {/* Main Footer Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                    {/* Column 1: Identity & Description (5 cols) */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center space-x-3.5">
                            <div className="p-1 rounded-full bg-slate-900 border border-slate-700">
                                <AshokaChakraIcon className="w-10 h-10" color="#60a5fa" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white font-hindi">
                                    ई-सारथी — राष्ट्रीय सड़क सुरक्षा एवं यातायात प्रबंधन प्रणाली
                                </h3>
                                <p className="text-xs text-amber-300 font-medium">
                                    परियोजना प्रदर्शन एवं इंजीनियरिंग प्रोटोटाइप
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                            ई-सारथी परियोजना सड़क सुरक्षा में सुधार, वाहन दुर्घटनाओं की रोकथाम, और एज-कंप्यूटिंग टेलीमेट्री द्वारा त्वरित राहत पहुंचाने के उद्देश्य से विकसित एक स्मार्ट यातायात प्रबंधन प्रणाली प्रोटोटाइप है।
                        </p>

                        <div className="text-[11px] font-mono text-slate-500 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                            प्रोटोटाइप संस्करण: v2.4 &bull; अंतिम अद्यतन: डेमो संस्करण (2026)
                        </div>
                    </div>

                    {/* Column 2: Navigation Links (4 cols) */}
                    <div className="md:col-span-4 space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-hindi border-b border-slate-700 pb-2">
                            महत्वपूर्ण लिंक एवं अनुभाग
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                onClick={() => onNavigateSection('hero')}
                                className="text-left text-slate-300 hover:text-amber-300 transition py-1"
                            >
                                &bull; मुख्य पृष्ठ
                            </button>
                            <button
                                onClick={() => onNavigateSection('dashboard-preview')}
                                className="text-left text-slate-300 hover:text-amber-300 transition py-1"
                            >
                                &bull; सड़क निगरानी
                            </button>
                            <button
                                onClick={() => onNavigateSection('capabilities-section')}
                                className="text-left text-slate-300 hover:text-amber-300 transition py-1"
                            >
                                &bull; प्रणाली की विशेषताएँ
                            </button>
                            <button
                                onClick={() => onNavigateSection('map-section')}
                                className="text-left text-slate-300 hover:text-amber-300 transition py-1"
                            >
                                &bull; यातायात मानचित्र
                            </button>
                            <button
                                onClick={() => onNavigateSection('alerts-section')}
                                className="text-left text-slate-300 hover:text-amber-300 transition py-1"
                            >
                                &bull; दुर्घटना प्रबंधन
                            </button>
                            <button
                                onClick={() => onNavigateSection('vehicles-section')}
                                className="text-left text-slate-300 hover:text-amber-300 transition py-1"
                            >
                                &bull; वाहन सुरक्षा
                            </button>
                            <button
                                onClick={() => onNavigateSection('analytics-section')}
                                className="text-left text-slate-300 hover:text-amber-300 transition py-1"
                            >
                                &bull; विश्लेषण एवं रिपोर्ट
                            </button>
                            <button
                                onClick={() => onNavigateSection('safety-info-section')}
                                className="text-left text-slate-300 hover:text-amber-300 transition py-1"
                            >
                                &bull; सहायता एवं संपर्क
                            </button>
                        </div>
                    </div>

                    {/* Column 3: Policy & Accessibility Links (3 cols) */}
                    <div className="md:col-span-3 space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-hindi border-b border-slate-700 pb-2">
                            नीति एवं अभिगम्यता
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                            <li>
                                <span className="hover:text-slate-200 cursor-pointer">&bull; गोपनीयता नीति</span>
                            </li>
                            <li>
                                <span className="hover:text-slate-200 cursor-pointer">&bull; उपयोग की शर्तें</span>
                            </li>
                            <li>
                                <span className="hover:text-slate-200 cursor-pointer">&bull; अभिगम्यता विवरण</span>
                            </li>
                            <li>
                                <span className="hover:text-slate-200 cursor-pointer">&bull; वेबसाइट संबंधी प्रतिक्रिया</span>
                            </li>
                            <li>
                                <span className="hover:text-slate-200 cursor-pointer">&bull; हाइपरलिंकिंग नीति</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Formal Disclaimer Box */}
                <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg p-4 text-xs text-slate-300 space-y-1.5 shadow-inner">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                        <Info className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>परियोजना प्रकटीकरण एवं अस्वीकरण (Project Disclaimer)</span>
                    </div>
                    <p className="leading-relaxed text-[11px] text-slate-400">
                        यह एक शैक्षणिक एवं प्रौद्योगिकी प्रदर्शन परियोजना (Educational &amp; Technology Demonstration Prototype) है। यह किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है। प्रदर्शित सभी वाहन संख्याएं, टेलीमेट्री मान और घटनाएं केवल प्रदर्शन प्रयोजनों हेतु अनुकरणीय (Simulated) हैं।
                    </p>
                </div>

                {/* Bottom Bar with Back to Top Button */}
                <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div>
                        &copy; 2026 ई-सारथी (i-SARTHI) अनुसंधान एवं विकास टीम &bull; सभी अधिकार सुरक्षित
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
                    >
                        <span>शीर्ष पर जाएँ</span>
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                </div>

            </div>
        </footer>
    );
}
