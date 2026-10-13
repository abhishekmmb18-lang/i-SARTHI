import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Home, LayoutDashboard, Map, TriangleAlert, Phone, Settings, Sparkles, Menu, X, ChevronRight, Zap, Radar, Eye, Landmark } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ activeTab, onTabChange }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);

    const menuItems = [
        { id: 'landing', label: 'Overview / Welcome', desc: 'Welcome & System Presentation', icon: Sparkles, color: 'from-amber-400 to-yellow-500', glow: 'shadow-yellow-500/30' },
        { id: 'profile-home', label: t('home') || 'Home', desc: 'Real-time Cockpit & Controls', icon: Home, color: 'from-cyan-400 to-blue-500', glow: 'shadow-blue-500/30' },
        { id: 'dashboard', label: '360° Radar', desc: '3D Vehicle LiDAR Scanner', icon: Radar, color: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-500/30' },
        { id: 'driver-monitor', label: 'Driver Monitor', desc: 'DMS Neural Eye Tracking', icon: Eye, color: 'from-indigo-400 to-purple-500', glow: 'shadow-indigo-500/30' },
        { id: 'road-monitor', label: t('road_monitor') || 'Road Monitor', desc: 'Live GPS Satellite Mapping', icon: Map, color: 'from-blue-400 to-cyan-500', glow: 'shadow-cyan-500/30' },
        { id: 'incidents', label: t('incidents') || 'Incidents', desc: 'Crash, Pothole & SOS Log', icon: TriangleAlert, color: 'from-orange-400 to-amber-500', glow: 'shadow-orange-500/30' },
        { id: 'emergency', label: t('emergency') || 'Emergency', desc: 'Fast Emergency SOS Dispatch', icon: Phone, color: 'from-rose-500 to-red-600', glow: 'shadow-red-500/30' },
        { id: 'edit-profile', label: t('settings') || 'Settings', desc: 'Driver & Vehicle Configuration', icon: Settings, color: 'from-purple-400 to-pink-500', glow: 'shadow-purple-500/30' },
    ];

    const handleSelect = (id) => {
        onTabChange(id);
        setIsOpen(false);
    };

    return (
        <>
            {/* 1. SLIM FULL-HEIGHT ICON RAIL (Always Visible on Screen Left) */}
            <aside className="fixed left-0 top-0 h-screen w-16 sm:w-20 bg-[#050914]/90 border-r border-cyan-500/20 backdrop-blur-2xl py-5 flex flex-col items-center justify-between z-40 shadow-2xl shadow-black/80">
                
                {/* Top 3-Line Hamburger Trigger */}
                <div className="flex flex-col items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/20 transition-all group"
                        title={isOpen ? "Collapse Menu" : "Expand Full Menu"}
                    >
                        {isOpen ? (
                            <X size={20} className="text-cyan-300 animate-spin" style={{ animationDuration: '0.3s' }} />
                        ) : (
                            <div className="space-y-1 py-0.5">
                                <span className="block w-5 h-0.5 bg-cyan-400 rounded-full group-hover:w-6 transition-all"></span>
                                <span className="block w-3.5 h-0.5 bg-blue-400 rounded-full group-hover:w-6 transition-all"></span>
                                <span className="block w-5 h-0.5 bg-indigo-400 rounded-full group-hover:w-6 transition-all"></span>
                            </div>
                        )}
                    </motion.button>

                    <div className="w-8 h-[1px] bg-white/10 my-1" />
                </div>

                {/* Middle Vertical Icon List (Full Height Icons) */}
                <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full px-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <div key={item.id} className="relative group">
                                <motion.button
                                    whileHover={{ scale: 1.15, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleSelect(item.id)}
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`relative p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                                        isActive
                                            ? `bg-gradient-to-br ${item.color} text-white shadow-xl ${item.glow} border border-white/30`
                                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <Icon size={20} />
                                    {isActive && (
                                        <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#06b6d4]" />
                                    )}
                                </motion.button>

                                {/* Floating Tooltip */}
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#090e1c] text-white text-xs font-bold font-mono tracking-wide border border-cyan-500/30 shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <span>{item.label}</span>
                                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Hardware Link Pill */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-[1px] bg-white/10 my-1" />
                    <div 
                        onClick={() => setIsOpen(true)}
                        className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center cursor-pointer hover:bg-cyan-500/20 transition-all"
                        title="I-SARTHI Pi Link"
                    >
                        <Shield size={18} className="text-cyan-400 animate-pulse" />
                    </div>
                </div>
            </aside>

            {/* 2. FULL SLIDE-OUT EXPANDED SIDEBAR DRAWER */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop Blur Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 pl-20"
                        />

                        {/* Slide Drawer (Expands out from the Icon Rail) */}
                        <motion.aside
                            initial={{ x: '-100%', opacity: 0.7 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                            className="fixed left-16 sm:left-20 top-0 h-screen w-72 sm:w-80 bg-[#060b18]/95 border-r border-cyan-500/30 backdrop-blur-3xl p-6 flex flex-col justify-between z-50 shadow-[0_0_60px_rgba(6,182,212,0.2)]"
                        >
                            <div>
                                {/* Header / Brand */}
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 pt-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                            <Shield className="text-white animate-pulse" size={22} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                                                <span>I-SARTHI</span>
                                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">PRO</span>
                                            </h2>
                                            <p className="text-[10px] text-gray-400 font-mono tracking-wider">NAVIGATION MATRIX</p>
                                        </div>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Detailed Menu Items */}
                                <nav className="space-y-2.5">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        return (
                                            <motion.button
                                                key={item.id}
                                                whileHover={{ scale: 1.02, x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelect(item.id)}
                                                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group text-left ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-white border border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                                                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3.5">
                                                    <div className={`p-2.5 rounded-xl transition-all ${
                                                        isActive 
                                                            ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
                                                            : 'bg-black/40 text-gray-400 group-hover:text-white border border-white/5'
                                                    }`}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm tracking-wide block text-white">{item.label}</span>
                                                        <span className="text-[11px] text-gray-500 font-normal">{item.desc}</span>
                                                    </div>
                                                </div>

                                                {isActive ? (
                                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse"></span>
                                                ) : (
                                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Footer Info */}
                            <div className="border-t border-white/10 pt-4 text-[11px] font-mono text-gray-400 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span>Raspberry Pi Live</span>
                                </span>
                                <span className="text-cyan-300">v2.4 Pro</span>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
