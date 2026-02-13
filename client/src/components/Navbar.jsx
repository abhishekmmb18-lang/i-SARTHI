import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages, Clock, CloudSun, Wind } from 'lucide-react';

const Navbar = ({ user, onEditProfile, onLogout }) => {
    const { language, setLanguage, t } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState({ temp: '--', aqi: '--' });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchWeatherData = async (lat, lon) => {
            try {
                // Fetch Temperature
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`);
                const weatherData = await weatherRes.json();
                const temp = weatherData.current?.temperature_2m || '--';

                // Fetch AQI
                const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`);
                const aqiData = await aqiRes.json();
                const aqi = aqiData.current?.us_aqi || '--';

                setWeather({ temp, aqi });
            } catch (error) {
                console.error("Failed to fetch weather data:", error);
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
                        console.warn("Location access denied or error. Using default (New Delhi).", error);
                        // Default to New Delhi
                        fetchWeatherData(28.61, 77.20);
                    }
                );
            } else {
                // Default to New Delhi if geolocation not supported
                fetchWeatherData(28.61, 77.20);
            }
        };

        getUserLocation();
    }, []);

    // Format options: "Wed, 07 Jan | 11:30 PM"
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
            minute: '2-digit'
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
        <div className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg text-white">
            <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {t('app_name')}
                </h1>

                {/* Date & Time Display */}
                <div className="hidden md:flex items-center space-x-3 bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                    <Clock size={16} className="text-blue-400" />
                    <div className="flex flex-col leading-none">
                        <span className="text-xs text-gray-400 font-medium tracking-wide">
                            {formatDate(currentTime)}
                        </span>
                        <span className="text-sm font-bold text-gray-200">
                            {formatTime(currentTime)}
                        </span>
                    </div>
                </div>

                {/* Weather & AQI Display */}
                <div className="hidden lg:flex items-center space-x-3 bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                    <div className="flex items-center space-x-2 border-r border-white/10 pr-3">
                        <CloudSun size={18} className="text-yellow-400" />
                        <div className="flex flex-col leading-none">
                            <span className="text-xs text-gray-400 font-medium">Temp</span>
                            <span className="text-sm font-bold text-gray-200">{weather.temp}°C</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Wind size={18} className="text-green-400" />
                        <div className="flex flex-col leading-none">
                            <span className="text-xs text-gray-400 font-medium">AQI</span>
                            <span className="text-sm font-bold text-gray-200">{weather.aqi}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-6">

                {/* Language Selector */}
                <div className="relative group flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <Languages size={16} className="text-gray-400 mr-2" />
                    <select
                        value={language}
                        onChange={(e) => {
                            const newLang = e.target.value;
                            console.log("Language Changed to:", newLang);
                            setLanguage(newLang);
                        }}
                        className="bg-transparent text-sm text-gray-200 focus:outline-none cursor-pointer option:bg-gray-800"
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
                    onClick={onEditProfile}
                    title={t('view_profile')}
                >
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-sm">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-300">{t('view_profile')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-purple-500 overflow-hidden bg-gray-700 flex items-center justify-center">
                        {user.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-lg font-bold">{user.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium backdrop-blur-sm"
                >
                    {t('logout')}
                </button>
            </div>
        </div>
    );
};

export default Navbar;
