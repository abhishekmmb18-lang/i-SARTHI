import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages, Clock, CloudSun, Wind, Shield, Sparkles, LogOut, ChevronDown, UserCheck } from 'lucide-react';

const Navbar = ({ user, onEditProfile, onLogout }) => {
    const { language, setLanguage, t } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState({ temp: '28', aqi: '42' });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchWeatherData = async (lat, lon) => {
            try {
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`);
                const weatherData = await weatherRes.json();
                const temp = Math.round(weatherData.current?.temperature_2m) || '28';

                const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`);
                const aqiData = await aqiRes.json();
                const aqi = aqiData.current?.us_aqi || '42';

                setWeather({ temp: `${temp}`, aqi: `${aqi}` });
            } catch (error) {
                // Fallback default
                setWeather({ temp: '28', aqi: '42' });
            }
        };

        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetchWeatherData(latitude, longitude);
                    },
                    (error) => {
                        fetchWeatherData(28.61, 77.20); // Default New Delhi
                    }
                );
            } else {
                fetchWeatherData(28.61, 77.20);
            }
        };

        getUserLocation();
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी (Hindi)' },
        { code: 'bn', name: 'বাংলা (Bengali)' },
        { code: 'te', name: 'తెలుగు (Telugu)' },
        { code: 'mr', name: 'मराठी (Marathi)' },
        { code: 'ta', name: 'தமிழ் (Tamil)' },
        { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
        { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
        { code: 'ur', name: 'اردو (Urdu)' },
        { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    ];

    return (
        <motion.header 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="fixed top-0 left-0 w-full z-30 pl-20 sm:pl-24 pr-4 sm:pr-6 py-2.5 flex justify-between items-center bg-[#050914]/85 backdrop-blur-2xl border-b border-cyan-500/25 shadow-2xl text-white overflow-hidden"
        >
            {/* Animated Beam Sweep Across Top Border */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-beam"></div>

            {/* LEFT: Brand Title & Live Telemetry Time/Weather Pills */}
            <div className="flex items-center space-x-4 sm:space-x-6">
                
                {/* Brand Shimmer Title */}
                <div className="flex items-center space-x-2.5 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative w-8 h-8 rounded-xl bg-[#090e1c] border border-cyan-500/30 flex items-center justify-center">
                            <Shield className="text-cyan-300 animate-pulse" size={16} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                            {t('app_name') || 'I-SARTHI'}
                        </span>
                    </div>
                </div>

                {/* Animated Clock Capsule */}
                <motion.div 
                    whileHover={{ scale: 1.04 }}
                    className="hidden md:flex items-center space-x-3 bg-black/40 px-4 py-1.5 rounded-2xl border border-cyan-500/20 shadow-inner shadow-cyan-950/40"
                >
                    <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">
                        <Clock size={14} className="animate-spin" style={{ animationDuration: '30s' }} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-cyan-300/80 font-mono font-bold tracking-wide">
                            {formatDate(currentTime)}
                        </span>
                        <span className="text-xs font-mono font-black text-white mt-0.5 tracking-tight">
                            {formatTime(currentTime)}
                        </span>
                    </div>
                </motion.div>

                {/* Animated Weather & AQI Capsule */}
                <motion.div 
                    whileHover={{ scale: 1.04 }}
                    className="hidden lg:flex items-center space-x-3 bg-black/40 px-4 py-1.5 rounded-2xl border border-blue-500/20 shadow-inner shadow-blue-950/40"
                >
                    <div className="flex items-center space-x-2 border-r border-white/10 pr-3">
                        <CloudSun size={16} className="text-yellow-400 animate-pulse" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[9px] font-mono text-gray-400 uppercase">Temp</span>
                            <span className="text-xs font-mono font-bold text-gray-100">{weather.temp}°C</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Wind size={16} className="text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
                        <div className="flex flex-col leading-none">
                            <span className="text-[9px] font-mono text-gray-400 uppercase">AQI Index</span>
                            <span className="text-xs font-mono font-bold text-emerald-300">{weather.aqi}</span>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* RIGHT: Language Selector, Driver Avatar & Logout Button */}
            <div className="flex items-center space-x-3 sm:space-x-4">

                {/* Language Selector Dropdown */}
                <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="relative flex items-center bg-black/50 border border-white/10 hover:border-cyan-500/40 rounded-2xl px-3 py-1.5 transition-all shadow-inner"
                >
                    <Languages size={15} className="text-cyan-400 mr-2" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent text-xs font-bold text-gray-200 focus:outline-none cursor-pointer appearance-none pr-4"
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code} className="bg-[#090e1c] text-white">
                                {lang.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="text-gray-400 absolute right-2 pointer-events-none" />
                </motion.div>

                {/* Driver Profile Pill */}
                <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onEditProfile}
                    className="flex items-center space-x-2.5 cursor-pointer bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 px-3 py-1 rounded-2xl transition-all shadow-lg"
                    title={t('view_profile')}
                >
                    <div className="text-right hidden md:block leading-tight">
                        <p className="font-bold text-xs text-white">{user.full_name || user.username || 'Driver'}</p>
                        <p className="text-[10px] text-cyan-300/80 font-mono">Cockpit Active</p>
                    </div>

                    <div className="relative">
                        <div className="w-8 h-8 rounded-full border-2 border-cyan-400/80 overflow-hidden bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-black text-white">{(user.username || 'D').charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-ping" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
                    </div>
                </motion.div>

                {/* Animated Logout Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-3 sm:px-4 py-1.5 rounded-2xl text-xs font-black transition-all shadow-lg shadow-red-950/40 border border-red-400/30"
                >
                    <LogOut size={14} />
                    <span className="hidden sm:inline">{t('logout')}</span>
                </motion.button>
            </div>
        </motion.header>
    );
};

export default Navbar;
