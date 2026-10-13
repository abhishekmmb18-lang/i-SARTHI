import React from 'react';
import AshokaChakraIcon from './AshokaChakraIcon';
import { ShieldCheck, Info } from 'lucide-react';

export default function Masthead() {
    return (
        <header className="w-full bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left Side: Original Ashoka Chakra Decorative Emblem & Main Title */}
                <div className="flex items-center space-x-4 sm:space-x-5 text-center sm:text-left">
                    <div className="relative p-1 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                        <AshokaChakraIcon className="w-14 h-14 sm:w-16 sm:h-16" color="#000080" />
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-hindi">
                                ई-सारथी
                            </h1>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                                i-SARTHI
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-blue-950 font-hindi">
                            राष्ट्रीय सड़क सुरक्षा एवं यातायात प्रबंधन प्रणाली
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide">
                            सुरक्षित सड़कें, सुरक्षित जीवन &bull; National Road Safety &amp; Traffic Intelligence Platform
                        </p>
                    </div>
                </div>

                {/* Right Side: Indian Tricolour Decorative Element & Project Demo Status Badges */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end md:items-end gap-2.5">
                    {/* Indian Tricolour Ribbon Graphic */}
                    <div className="flex flex-col items-center sm:items-end space-y-1">
                        <div className="flex items-center h-2 w-36 sm:w-44 rounded-full overflow-hidden shadow-sm border border-slate-200">
                            <div className="h-full flex-1 bg-[#FF9933]" title="केसरिया (Saffron)"></div>
                            <div className="h-full flex-1 bg-white flex items-center justify-center">
                                <span className="w-1 h-1 rounded-full bg-[#000080]"></span>
                            </div>
                            <div className="h-full flex-1 bg-[#138808]" title="हरा (Green)"></div>
                        </div>
                    </div>

                    {/* Official National Status Badges */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-300 text-blue-900 shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                            <span className="text-[11px] font-bold">
                                राष्ट्रीय सड़क सुरक्षा नेटवर्क
                            </span>
                        </div>

                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span className="text-[11px] font-bold">
                                लाइव टेलीमेट्री सक्रिय
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}
