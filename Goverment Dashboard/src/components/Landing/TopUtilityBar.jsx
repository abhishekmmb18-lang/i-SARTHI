import React, { useState, useEffect } from 'react';
import { Eye, Volume2, Globe, Clock, Check } from 'lucide-react';

export default function TopUtilityBar({ fontScale, setFontScale, highContrast, setHighContrast }) {
    const [currentTime, setCurrentTime] = useState('');
    const [screenReaderAnnounced, setScreenReaderAnnounced] = useState(false);

    useEffect(() => {
        const updateFormattedTime = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('hi-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            const timeStr = now.toLocaleTimeString('hi-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            setCurrentTime(`${dateStr}, ${timeStr} भा.मा.स.`);
        };
        updateFormattedTime();
        const timer = setInterval(updateFormattedTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleScreenReaderClick = () => {
        setScreenReaderAnnounced(true);
        setTimeout(() => setScreenReaderAnnounced(false), 4000);
    };

    return (
        <aside
            aria-label="सरकारी पोर्टल अभिगम्यता व उपयोगिता नियंत्रण"
            className="w-full bg-slate-900 text-slate-200 border-b border-slate-800 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6"
        >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
                {/* Left: Official style portal banner note & Skip link */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        भारत सरकार की शैली में आधिकारिक पोर्टल
                    </span>

                    <span className="text-slate-600 hidden md:inline">|</span>

                    {/* Accessible Skip Link */}
                    <a
                        href="#main-content"
                        className="text-amber-300 hover:text-amber-200 underline focus:ring-2 focus:ring-amber-400 rounded px-1 outline-none transition"
                    >
                        मुख्य सामग्री पर जाएँ
                    </a>
                </div>

                {/* Right: Accessibility Controls, Contrast, Font Sizing, Last Update */}
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-slate-300">
                    {/* Screen Reader Aid */}
                    <button
                        onClick={handleScreenReaderClick}
                        className="hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/80 transition cursor-pointer"
                        title="स्क्रीन रीडर सहायता सक्रिय करें"
                        aria-live="polite"
                    >
                        <Volume2 className="w-3 h-3 text-cyan-400" />
                        <span className="hidden sm:inline">स्क्रीन रीडर सहायता</span>
                        {screenReaderAnnounced && (
                            <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]">
                                <Check className="w-2.5 h-2.5" /> सक्रिय
                            </span>
                        )}
                    </button>

                    {/* Font Size Adjusters: A- | A | A+ */}
                    <div className="flex items-center border border-slate-700 rounded bg-slate-800/80 overflow-hidden" role="group" aria-label="अक्षर आकार नियंत्रण">
                        <button
                            onClick={() => setFontScale('90%')}
                            className={`px-2 py-0.5 font-bold transition hover:bg-slate-700 cursor-pointer ${fontScale === '90%' ? 'bg-blue-800 text-white font-extrabold' : 'text-slate-300'}`}
                            title="अक्षर आकार घटाएँ (A-)"
                            aria-label="अक्षर आकार घटाएँ"
                        >
                            A−
                        </button>
                        <span className="w-px h-3 bg-slate-700"></span>
                        <button
                            onClick={() => setFontScale('100%')}
                            className={`px-2 py-0.5 font-bold transition hover:bg-slate-700 cursor-pointer ${fontScale === '100%' ? 'bg-blue-800 text-white font-extrabold' : 'text-slate-300'}`}
                            title="सामान्य अक्षर आकार (A)"
                            aria-label="सामान्य अक्षर आकार"
                        >
                            A
                        </button>
                        <span className="w-px h-3 bg-slate-700"></span>
                        <button
                            onClick={() => setFontScale('115%')}
                            className={`px-2 py-0.5 font-bold transition hover:bg-slate-700 cursor-pointer ${fontScale === '115%' ? 'bg-blue-800 text-white font-extrabold' : 'text-slate-300'}`}
                            title="अक्षर आकार बढ़ाएँ (A+)"
                            aria-label="अक्षर आकार बढ़ाएँ"
                        >
                            A+
                        </button>
                    </div>

                    {/* High Contrast Toggle */}
                    <button
                        onClick={() => setHighContrast(!highContrast)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded border transition cursor-pointer ${
                            highContrast
                                ? 'bg-amber-400 text-black border-amber-300 font-bold'
                                : 'border-slate-700 bg-slate-800/80 hover:text-white'
                        }`}
                        title="उच्च कंट्रास्ट मोड बदलें"
                        aria-pressed={highContrast}
                    >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>उच्च कंट्रास्ट</span>
                    </button>

                    {/* Last Updated Timestamp */}
                    <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-700 text-slate-400 text-[10px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>अंतिम अद्यतन:</span>
                        <span className="text-slate-200 font-mono">{currentTime || '12 अक्टूबर 2026'}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
