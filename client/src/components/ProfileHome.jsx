import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Play, Pause, SkipForward, SkipBack, Music, Clock as ClockIcon, AlertTriangle, Phone, Wine, Activity, Settings, ExternalLink } from 'lucide-react';

// --- Location Widget Component ---
const LocationWidget = () => {
    const [gps, setGps] = useState({ latitude: 0, longitude: 0, speed: 0 });

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                // Dynamic IP - uses hostname to support LAN access
                const res = await fetch(`http://${window.location.hostname}:5000/api/location`);
                const data = await res.json();
                setGps(data);
            } catch (e) {
                // ignore errors (e.g. server offline)
            }
        };

        const interval = setInterval(fetchLocation, 1000);
        return () => clearInterval(interval);
    }, []);

    const mapsUrl = `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`;

    return (
        <div className="md:col-span-3 bg-blue-900/20 backdrop-blur-md rounded-3xl p-6 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-blue-900/30">
            <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400 animate-pulse hidden md:block">
                    {/* Map Pin Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-blue-100 flex items-center gap-2">
                        <span className="md:hidden">🌍</span> Live GPS Tracking
                    </h3>
                    <div className="flex gap-4 text-blue-200/60 font-mono mt-1 text-sm md:text-base">
                        <span>LAT: {gps.latitude.toFixed(6)}</span>
                        <span>LON: {gps.longitude.toFixed(6)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                {/* Speed Removed */}

                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 text-sm ml-auto"
                >
                    Open Maps <ExternalLink size={16} />
                </a>
            </div>
        </div>
    );
};

// --- Main ProfileHome Component ---
const ProfileHome = ({ user, onLogout }) => {
    const { t } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sensorData, setSensorData] = useState({ alcohol: 0, vibration: 0, type: 'Normal' });

    // Music App Logic
    const [musicApp, setMusicApp] = useState('spotify'); // spotify, ytmusic, apple, gaana
    const [showMusicSettings, setShowMusicSettings] = useState(false);

    const musicApps = {
        spotify: { name: 'Spotify', url: 'https://open.spotify.com', color: 'text-green-400', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
        ytmusic: { name: 'YouTube Music', url: 'https://music.youtube.com', color: 'text-red-400', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/YouTube_Music_icon.svg' },
        apple: { name: 'Apple Music', url: 'https://music.apple.com', color: 'text-pink-400', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Apple_Music_logo.svg' },
        gaana: { name: 'Gaana', url: 'https://gaana.com', color: 'text-red-500', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Gaana_Logo.svg' }
    };

    // Clock Logic
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Sensor Polling logic
    useEffect(() => {
        const fetchSensorData = async () => {
            try {
                const res = await fetch(`http://${window.location.hostname}:5000/api/road-data`);
                const data = await res.json();
                if (data.length > 0) {
                    const latest = data[0];
                    if (Date.now() - new Date(latest.created_at + "Z").getTime() < 5000) {
                        setSensorData({
                            alcohol: latest.alcohol || 0,
                            vibration: latest.vibration || 0,
                            type: latest.type || 'Normal'
                        });
                    }
                }
            } catch (err) { }
        };
        const interval = setInterval(fetchSensorData, 1000);
        return () => clearInterval(interval);
    }, []);

    const isHazard = sensorData.vibration > 0.8 || sensorData.type === 'Pothole' || sensorData.type === 'Accident';
    const isAlcoholHigh = sensorData.alcohol > 80;

    const handleLaunchMusic = () => {
        window.open(musicApps[musicApp].url, '_blank');
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 text-white relative flex flex-col gap-6">

            {/* Header / Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.full_name?.split(' ')[0] || user.username}
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">System Active & Monitoring</p>
                </div>

                {/* Clock Widget */}
                <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
                    <ClockIcon size={32} className="text-blue-400 animate-pulse" />
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                            {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* CRITICAL ALERTS OVERLAY (Dynamic) */}
            {(isHazard || isAlcoholHigh) && (
                <div className={`p-6 rounded-3xl border-2 flex items-center justify-between animate-pulse shadow-[0_0_50px_rgba(0,0,0,0.5)] 
                    ${isAlcoholHigh ? 'bg-purple-900/80 border-purple-500' : 'bg-red-900/80 border-red-500'}`}>

                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${isAlcoholHigh ? 'bg-purple-500' : 'bg-red-500'} text-white`}>
                            {isAlcoholHigh ? <Wine size={40} /> : <AlertTriangle size={40} />}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-wider">
                                {isAlcoholHigh ? 'HIGH ALCOHOL DETECTED' : 'ROAD HAZARD ALERT'}
                            </h2>
                            <p className="text-lg opacity-90 font-mono">
                                {isAlcoholHigh
                                    ? `Level: ${sensorData.alcohol} (CRITICAL) - Pull Over Immediately`
                                    : `Type: ${sensorData.type} | Vibration: ${sensorData.vibration.toFixed(2)}G`
                                }
                            </p>
                        </div>
                    </div>

                    <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                        DISMISS
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. COMPACT MUSIC LAUNCHER */}
                <div className="col-span-1 bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 flex flex-col justify-between group hover:bg-gray-800/60 transition-colors relative">

                    <button
                        onClick={() => setShowMusicSettings(!showMusicSettings)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <Settings size={16} />
                    </button>

                    {showMusicSettings ? (
                        <div className="absolute inset-0 bg-gray-900/95 z-20 rounded-3xl p-6 flex flex-col gap-2 animate-fade-in">
                            <h4 className="text-sm font-bold text-gray-400 mb-2">Select Music App</h4>
                            {Object.entries(musicApps).map(([key, app]) => (
                                <button
                                    key={key}
                                    onClick={() => { setMusicApp(key); setShowMusicSettings(false); }}
                                    className={`p-3 rounded-xl text-left text-sm font-medium transition-colors flex items-center gap-3
                                        ${musicApp === key ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                                >
                                    <span className={app.color}><Music size={16} /></span>
                                    {app.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-black shadow-lg overflow-hidden border border-white/10 shrink-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                                    <Music size={32} className={musicApps[musicApp].color} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold truncate text-sm">Music Player</h3>
                                    <p className={`text-xs truncate ${musicApps[musicApp].color}`}>
                                        Connected to {musicApps[musicApp].name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <div className="flex gap-1 h-4 items-end px-2">
                                    <div className="w-1 h-2 bg-gray-500 animate-pulse"></div>
                                    <div className="w-1 h-4 bg-gray-500 animate-pulse delay-75"></div>
                                    <div className="w-1 h-3 bg-gray-500 animate-pulse delay-150"></div>
                                </div>
                                <button
                                    onClick={handleLaunchMusic}
                                    className="px-6 py-2 rounded-full bg-white text-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg font-bold text-sm"
                                >
                                    Launch App <ExternalLink size={14} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. EMERGENCY CALL BOX */}
                <div className="col-span-1 lg:col-span-2 bg-red-900/20 backdrop-blur-md rounded-3xl p-6 border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-red-900/30 transition-colors">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-4 bg-red-500/20 rounded-2xl text-red-500">
                                <Phone size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-red-100">Emergency Center</h3>
                                <p className="text-red-200/60">Instant access to critical services.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <a href="tel:112" className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-xl font-bold text-center transition-colors shadow-lg shadow-red-900/20 flex flex-col items-center justify-center min-w-[100px]">
                            <span className="text-2xl">112</span>
                            <span className="text-[10px] opacity-80 uppercase">Police</span>
                        </a>
                        <button
                            onClick={async () => {
                                try {
                                    alert("Triggering SOS Alert...");
                                    await fetch(`http://${window.location.hostname}:5000/api/sos`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ type: 'manual' })
                                    });
                                    alert("SOS Signal Sent!");
                                } catch (e) {
                                    alert("Failed to send SOS.");
                                }
                            }}
                            className="flex-1 md:flex-none bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-bold text-center transition-colors border border-white/10 flex flex-col items-center justify-center min-w-[100px] active:scale-95"
                        >
                            <span className="text-xl">SOS</span>
                            <span className="text-[10px] opacity-50 uppercase">Trigger</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* 3. GPS & NAVIGATION (New Row added below other cards) */}
            <div className="mt-6">
                <LocationWidget />
            </div>

        </div>
    );
};

export default ProfileHome;
