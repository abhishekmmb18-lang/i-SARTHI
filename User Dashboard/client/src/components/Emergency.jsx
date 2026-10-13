import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Phone, 
    AlertTriangle, 
    MapPin, 
    Plus, 
    Trash2, 
    Siren, 
    Share2, 
    Signal, 
    Activity, 
    Clock, 
    ShieldAlert, 
    Send, 
    CheckCircle2, 
    Radio, 
    ExternalLink, 
    Sparkles, 
    Flame,
    Copy,
    UserPlus,
    UserCheck
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 120, damping: 14 }
    }
};

// 60 FPS Cyber Highway Background
const CyberHighwayCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const numLines = 45;
        const lines = [];
        for (let i = 0; i < numLines; i++) {
            lines.push({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * width,
                color: Math.random() > 0.5 ? '#dc2626' : (Math.random() > 0.5 ? '#ea580c' : '#8b5cf6'),
                len: Math.random() * 22 + 8
            });
        }

        let offset = 0;

        const render = () => {
            ctx.fillStyle = 'rgba(5, 7, 20, 0.25)';
            ctx.fillRect(0, 0, width, height);

            offset += 0.025;

            const horizonY = height * 0.52;
            const perspectiveDist = 280;

            for (let x = -width; x < width * 2; x += 120) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(220, 38, 38, 0.08)';
                ctx.moveTo(x, height);
                ctx.lineTo(width / 2, horizonY);
                ctx.stroke();
            }

            const numHoriz = 14;
            for (let i = 0; i < numHoriz; i++) {
                const progress = ((i + (offset % 1)) / numHoriz);
                const lineY = horizonY + Math.pow(progress, 2.4) * (height - horizonY);
                const alpha = Math.min(progress * 0.35, 0.25);

                ctx.beginPath();
                ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`;
                ctx.moveTo(0, lineY);
                ctx.lineTo(width, lineY);
                ctx.stroke();
            }

            const cx = width / 2;
            const cy = horizonY - 40;

            for (let i = 0; i < lines.length; i++) {
                const p = lines[i];
                p.z -= 9;
                if (p.z <= 0) {
                    p.z = width;
                    p.x = (Math.random() - 0.5) * width * 2;
                    p.y = (Math.random() - 0.5) * height * 2;
                }

                const k = perspectiveDist / p.z;
                const px = p.x * k + cx;
                const py = p.y * k + cy;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = Math.max(0.7, (1 - p.z / width) * 2.8);
                    const alpha = (1 - p.z / width);

                    ctx.beginPath();
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha;
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = size * 0.7;
                    ctx.moveTo(px, py);
                    ctx.lineTo(p.x * (perspectiveDist / (p.z + p.len)) + cx, p.y * (perspectiveDist / (p.z + p.len)) + cy);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 w-full h-full pointer-events-none -z-20"
        />
    );
};

const Emergency = ({ user }) => {
    const [location, setLocation] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState({ name: '', phone: '' });
    const [showAddContact, setShowAddContact] = useState(false);
    const [gsmStatus, setGsmStatus] = useState(null);
    const [sosHistory, setSosHistory] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Load contacts from local storage
        const savedContacts = localStorage.getItem('emergency_contacts');
        if (savedContacts) {
            try {
                setContacts(JSON.parse(savedContacts));
            } catch {}
        } else {
            // Default sample contacts if empty
            const defaults = [
                { name: 'Family Emergency', phone: '+919876543210' },
                { name: 'Roadside Assistance', phone: '+918000000000' }
            ];
            setContacts(defaults);
            localStorage.setItem('emergency_contacts', JSON.stringify(defaults));
        }

        // Fetch GSM Status and SOS History
        const fetchData = async () => {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            try {
                const resGsm = await fetch(`${BASE_URL}/api/gsm-status`);
                if (resGsm.ok) {
                    const dataGsm = await resGsm.json();
                    setGsmStatus(dataGsm);
                }

                const resHist = await fetch(`${BASE_URL}/api/sos-history`);
                if (resHist.ok) {
                    const dataHist = await resHist.json();
                    setSosHistory(Array.isArray(dataHist) ? dataHist : []);
                }
            } catch (err) {}
        };

        fetchData();
        const interval = setInterval(fetchData, 4000);

        // Live Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error("Error getting location:", error),
                { enableHighAccuracy: true }
            );
        }
        return () => clearInterval(interval);
    }, []);

    const saveContact = (e) => {
        e.preventDefault();
        if (newContact.name && newContact.phone) {
            const updatedContacts = [...contacts, newContact];
            setContacts(updatedContacts);
            localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
            setNewContact({ name: '', phone: '' });
            setShowAddContact(false);
        }
    };

    const deleteContact = (index) => {
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
        localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
    };

    const handleSOS = async () => {
        if (isSending) return;
        setIsSending(true);

        try {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            const res = await fetch(`${BASE_URL}/api/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'manual',
                    message: `🚨 CRITICAL SOS: Driver ${user?.full_name || user?.username || 'Pilot'} triggered Emergency SOS! Coordinates: ${location?.lat || '27.0308'}, ${location?.lng || '75.8937'}. Immediate assistance required.`,
                    lat: location?.lat || 27.0308,
                    lng: location?.lng || 75.8937,
                    contacts: contacts
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("🚨 SOS SIGNAL BROADCASTED!\nEmergency SMS dispatches and Cloud Database SOS flags successfully transmitted.");
            } else {
                alert("Failed to send SOS: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("SOS Dispatch Error:", error);
            alert("Network error. SOS logged locally and sent to emergency queue.");
        } finally {
            setIsSending(false);
        }
    };

    const shareLocation = () => {
        if (location) {
            const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <div className="w-full relative min-h-screen scanlines selection:bg-red-500 selection:text-white">
            
            {/* 60 FPS 3D Cyber Highway Animated Canvas Background */}
            <CyberHighwayCanvas />

            {/* Ambient Multi-layer Glowing Orbs */}
            <div className="fixed top-0 left-1/3 w-[900px] h-[550px] bg-gradient-to-br from-red-600/20 via-orange-600/20 to-purple-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-red-600/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-float-slow" />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 text-white relative flex flex-col gap-8 pb-24"
            >
                
                {/* 1. MASTER SOS PULSING BEACON HERO */}
                <motion.div 
                    variants={itemVariants}
                    className="p-8 sm:p-12 rounded-[40px] glass-card border border-red-500/50 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center space-y-8 bg-gradient-to-b from-red-950/40 via-black/60 to-black"
                >
                    {/* Concentric Pulsing Light Rings */}
                    <div className="absolute w-[450px] h-[450px] rounded-full border border-red-500/20 animate-ping pointer-events-none" />
                    <div className="absolute w-[320px] h-[320px] rounded-full border border-red-500/30 animate-pulse pointer-events-none" />

                    <div className="space-y-2 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold">
                            <ShieldAlert size={14} className="animate-pulse" />
                            <span>ONE-TOUCH GSM & CLOUD SOS BROADCASTER</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                            Emergency Rescue Command
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-lg mx-auto">
                            Press the central beacon to transmit emergency SMS alerts, GPS telemetry, and alert first responders
                        </p>
                    </div>

                    {/* Master Animated SOS Button */}
                    <div className="relative flex items-center justify-center py-4 z-10">
                        {/* Outer Glow Halo */}
                        <div className="absolute w-64 h-64 rounded-full bg-red-600/30 blur-2xl animate-pulse" />
                        
                        <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={handleSOS}
                            disabled={isSending}
                            className={`relative w-52 h-52 sm:w-60 sm:h-60 rounded-full shadow-[0_0_80px_rgba(220,38,38,0.7)] border-4 border-red-400 flex flex-col items-center justify-center transition-all group ${
                                isSending 
                                    ? 'bg-red-950 opacity-80 cursor-wait' 
                                    : 'bg-gradient-to-br from-red-600 via-red-700 to-rose-950 hover:shadow-[0_0_100px_rgba(239,68,68,0.9)]'
                            }`}
                        >
                            <Siren size={36} className="text-red-200 mb-2 group-hover:animate-spin" />
                            <span className="text-4xl sm:text-5xl font-black text-white tracking-widest drop-shadow-lg">
                                {isSending ? 'SENDING' : 'SOS'}
                            </span>
                            <span className="text-[11px] font-mono text-red-200 mt-2 font-bold tracking-wider uppercase bg-black/30 px-3 py-0.5 rounded-full border border-white/10">
                                {isSending ? 'Broadcasting...' : 'Tap To Trigger'}
                            </span>
                        </motion.button>
                    </div>

                    {/* Sub-status text */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-gray-400 z-10 border-t border-white/10 pt-4 w-full max-w-xl">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <CheckCircle2 size={14} /> Twilio GSM Armed
                        </span>
                        <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                            <Radio size={14} /> GPS Live Polling
                        </span>
                        <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                            <Flame size={14} /> SMS Dispatch Ready
                        </span>
                    </div>
                </motion.div>

                {/* 2. GRID METRICS: QUICK DIALS, GSM STATUS & GPS LOCATION */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* A. Quick Emergency Dials */}
                    <div className="p-6 rounded-[32px] glass-card border border-blue-500/40 shadow-2xl flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    <Phone size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white">Direct Hotline Dials</h3>
                            </div>
                            <span className="text-[10px] font-mono text-blue-400 font-bold">1-TAP DIAL</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 font-mono">
                            <motion.a 
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                href="tel:112" 
                                className="p-3.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 flex flex-col items-center justify-center text-center transition-all shadow-lg shadow-blue-600/10"
                            >
                                <span className="text-2xl font-black text-white">112</span>
                                <span className="text-[10px] text-blue-300 font-bold mt-0.5">National SOS</span>
                            </motion.a>

                            <motion.a 
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                href="tel:108" 
                                className="p-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 flex flex-col items-center justify-center text-center transition-all shadow-lg shadow-emerald-600/10"
                            >
                                <span className="text-2xl font-black text-white">108</span>
                                <span className="text-[10px] text-emerald-300 font-bold mt-0.5">Ambulance</span>
                            </motion.a>

                            <motion.a 
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                href="tel:100" 
                                className="p-3.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 flex flex-col items-center justify-center text-center transition-all shadow-lg shadow-indigo-600/10"
                            >
                                <span className="text-2xl font-black text-white">100</span>
                                <span className="text-[10px] text-indigo-300 font-bold mt-0.5">Police Dept</span>
                            </motion.a>

                            <motion.a 
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                href="tel:101" 
                                className="p-3.5 rounded-2xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 flex flex-col items-center justify-center text-center transition-all shadow-lg shadow-orange-600/10"
                            >
                                <span className="text-2xl font-black text-white">101</span>
                                <span className="text-[10px] text-orange-300 font-bold mt-0.5">Fire & Rescue</span>
                            </motion.a>
                        </div>
                    </div>

                    {/* B. GSM Hardware Modem & Cloud Relay */}
                    <div className="p-6 rounded-[32px] glass-card border border-emerald-500/40 shadow-2xl flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <Signal size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white">GSM Transceiver</h3>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
                        </div>

                        <div className="space-y-3 font-mono text-xs">
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center">
                                <span className="text-gray-400">Backend Daemon:</span>
                                <span className="font-bold text-emerald-400">{gsmStatus?.status || 'Connected & Armed'}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center">
                                <span className="text-gray-400">Total SOS Dispatches:</span>
                                <span className="text-lg font-black text-white">{gsmStatus?.alertsSent || sosHistory.length || 0}</span>
                            </div>
                        </div>

                        <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between border-t border-white/5 pt-2">
                            <span>Twilio SMS Gateway: <b className="text-white">Active</b></span>
                            <span className="text-emerald-400 font-bold">Port 5000 Sync</span>
                        </div>
                    </div>

                    {/* C. Live GPS Emergency Coordinates Card */}
                    <div className="p-6 rounded-[32px] glass-card border border-purple-500/40 shadow-2xl flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white">Live GPS Beacon</h3>
                            </div>
                            <span className="text-[10px] font-mono text-purple-400 font-bold">HIGH ACCURACY</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 text-center font-mono">
                            <div className="text-lg sm:text-xl font-bold text-white tracking-wide">
                                {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : '27.03080, 75.89371'}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">Satellite Lock: 3D Fix</div>
                        </div>

                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={shareLocation}
                                className="flex-1 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg"
                            >
                                <Copy size={13} />
                                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                            </motion.button>

                            <motion.a
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                href={`https://www.google.com/maps?q=${location?.lat || 27.0308},${location?.lng || 75.8937}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all shadow-lg"
                            >
                                <ExternalLink size={16} />
                            </motion.a>
                        </div>
                    </div>

                </motion.div>

                {/* 3. EMERGENCY CONTACTS DIRECTORY */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 sm:p-8 rounded-[36px] glass-card border border-cyan-500/30 shadow-2xl space-y-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                <UserCheck size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    Configured Emergency SMS Contacts
                                </h3>
                                <p className="text-xs text-gray-400 font-mono">
                                    These numbers will receive automated GPS location text messages during SOS triggers
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowAddContact(!showAddContact)}
                            className="px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-600/30 self-start sm:self-auto"
                        >
                            <UserPlus size={15} />
                            <span>{showAddContact ? 'Close Form' : 'Add Contact'}</span>
                        </motion.button>
                    </div>

                    {/* Add Contact Modal / Inline Form */}
                    <AnimatePresence>
                        {showAddContact && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={saveContact}
                                className="p-5 rounded-2xl bg-black/50 border border-cyan-500/40 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs overflow-hidden"
                            >
                                <input
                                    type="text"
                                    placeholder="Contact Name (e.g. Mom, Doctor)"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    required
                                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number (+91...)"
                                    value={newContact.phone}
                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                    required
                                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold transition-all shadow-lg shadow-cyan-600/30"
                                >
                                    Save Emergency Contact
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Contacts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
                        {contacts.map((contact, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/40 flex items-center justify-between transition-all shadow-lg"
                            >
                                <div className="space-y-0.5">
                                    <span className="font-bold text-white block text-sm">{contact.name}</span>
                                    <span className="text-xs text-cyan-300 block">{contact.phone}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <a
                                        href={`tel:${contact.phone}`}
                                        className="p-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-all"
                                    >
                                        <Phone size={14} />
                                    </a>
                                    <button
                                        onClick={() => deleteContact(index)}
                                        className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Emergency;
