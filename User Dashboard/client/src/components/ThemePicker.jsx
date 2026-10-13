import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, Check, Sparkles, X } from 'lucide-react';
import { useTheme, ACCENT_COLORS } from '../contexts/ThemeContext';

const ThemePicker = ({ inline = false }) => {
    const { theme, toggleTheme, isDark, accentColor, setAccentColor } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    if (inline) {
        return (
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Palette size={18} className="text-cyan-400" />
                        <span className="font-bold text-sm">Theme & Accent Colors</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-mono text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
                    >
                        {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
                        <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
                    </button>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-gray-400 font-mono block">Select Accent Color:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {Object.values(ACCENT_COLORS).map(c => {
                            const isSelected = accentColor === c.id;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setAccentColor(c.id)}
                                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-mono font-bold ${
                                        isSelected 
                                            ? 'bg-white/15 border-white shadow-lg' 
                                            : 'bg-black/20 border-white/5 hover:bg-white/5'
                                    }`}
                                >
                                    <span 
                                        className="w-5 h-5 rounded-full shadow-md flex items-center justify-center"
                                        style={{ backgroundColor: c.primary }}
                                    >
                                        {isSelected && <Check size={12} className="text-white drop-shadow" />}
                                    </span>
                                    <span className="text-[10px] text-gray-300">{c.name.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-5 right-5 z-40 flex items-center gap-2">
            {/* Quick Dark/Light Toggle Pill */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                className={`p-2.5 rounded-2xl backdrop-blur-xl border transition-all shadow-xl flex items-center gap-2 font-mono text-xs font-bold ${
                    isDark 
                        ? 'bg-slate-900/80 border-slate-700/80 text-amber-300 shadow-amber-950/40 hover:bg-slate-800' 
                        : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-300/60 hover:bg-white'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {isDark ? (
                    <>
                        <Sun size={16} className="text-amber-400 animate-spin-slow" />
                        <span className="hidden sm:inline text-[11px]">LIGHT</span>
                    </>
                ) : (
                    <>
                        <Moon size={16} className="text-indigo-600" />
                        <span className="hidden sm:inline text-[11px]">DARK</span>
                    </>
                )}
            </motion.button>

            {/* Quick Palette Button */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-2.5 rounded-2xl backdrop-blur-xl border transition-all shadow-xl flex items-center justify-center ${
                        isDark 
                            ? 'bg-slate-900/80 border-slate-700/80 text-cyan-300 shadow-cyan-950/40 hover:bg-slate-800' 
                            : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-300/60 hover:bg-white'
                    }`}
                    title="Change Theme Accent Color"
                >
                    <Palette size={16} />
                </motion.button>

                {/* Color Palette Popover */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className={`absolute right-0 top-12 w-64 p-4 rounded-3xl backdrop-blur-2xl border shadow-2xl z-50 space-y-3 font-mono ${
                                isDark 
                                    ? 'bg-[#090e1a]/95 border-slate-700/90 text-white' 
                                    : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-400/40'
                            }`}
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-amber-400" />
                                    <span className="font-bold text-xs">Accent Color</span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(ACCENT_COLORS).map(c => {
                                    const isSelected = accentColor === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setAccentColor(c.id);
                                                setIsOpen(false);
                                            }}
                                            className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-mono font-bold ${
                                                isSelected 
                                                    ? 'bg-white/20 border-white shadow-lg' 
                                                    : 'bg-black/10 border-transparent hover:bg-white/10'
                                            }`}
                                        >
                                            <span 
                                                className="w-5 h-5 rounded-full shadow-md flex items-center justify-center ring-2 ring-white/20"
                                                style={{ backgroundColor: c.primary }}
                                            >
                                                {isSelected && <Check size={11} className="text-white drop-shadow" />}
                                            </span>
                                            <span className="text-[10px] opacity-80">{c.name.split(' ')[0]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ThemePicker;
