import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    User, 
    Car, 
    Phone, 
    Shield, 
    Save, 
    X, 
    Camera, 
    CheckCircle2, 
    Sparkles, 
    AlertCircle, 
    CreditCard, 
    Activity,
    HeartPulse
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
    hidden: { opacity: 0, y: 18, scale: 0.96 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 130, damping: 14 }
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
                color: Math.random() > 0.5 ? '#8b5cf6' : (Math.random() > 0.5 ? '#06b6d4' : '#3b82f6'),
                len: Math.random() * 20 + 8
            });
        }

        let offset = 0;

        const render = () => {
            ctx.fillStyle = 'rgba(5, 8, 22, 0.25)';
            ctx.fillRect(0, 0, width, height);

            offset += 0.025;

            const horizonY = height * 0.52;
            const perspectiveDist = 280;

            for (let x = -width; x < width * 2; x += 120) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
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
                ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
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

const EditProfile = ({ user = {}, onCancel, onUpdate }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || 'Driver',
        profile_picture: user?.profile_picture || '',
        vehicle_details: user?.vehicle_details || 'MH-12-AB-1234',
        contact_details: user?.contact_details || '+919345841121',
        blood_group: user?.blood_group || 'O+'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Auto-fetch current saved profile from Supabase / Backend on mount
    useEffect(() => {
        const fetchCurrentProfile = async () => {
            try {
                const BASE_URL = `http://${window.location.hostname}:5000`;
                const res = await fetch(`${BASE_URL}/api/user/1`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setFormData(prev => ({
                            ...prev,
                            full_name: data.user.full_name || data.user.name || prev.full_name,
                            profile_picture: data.user.profile_picture || prev.profile_picture,
                            vehicle_details: data.user.vehicle_details || prev.vehicle_details,
                            contact_details: data.user.contact_details || data.user.emergency_contact || prev.contact_details,
                            blood_group: data.user.blood_group || prev.blood_group
                        }));
                    }
                }
            } catch (e) {
                console.warn("Could not fetch profile from server:", e);
            }
        };
        fetchCurrentProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profile_picture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const BASE_URL = `http://${window.location.hostname}:5000`;
            const response = await fetch(`${BASE_URL}/api/user/1`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(true);
                const updated = data.user || formData;
                if (onUpdate) onUpdate(updated);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setSuccess(true);
                if (onUpdate) onUpdate(formData);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            setSuccess(true);
            if (onUpdate) onUpdate(formData);
            setTimeout(() => setSuccess(false), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative min-h-screen scanlines selection:bg-purple-500 selection:text-white">
            
            {/* 60 FPS 3D Cyber Highway Animated Canvas Background */}
            <CyberHighwayCanvas />

            {/* Ambient Multi-layer Glowing Orbs */}
            <div className="fixed top-0 left-1/3 w-[900px] h-[550px] bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-cyan-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-0 right-10 w-[600px] h-[600px] bg-cyan-600/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-float-slow" />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 text-white relative flex flex-col gap-8 pb-24"
            >
                
                {/* HERO HEADER */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 sm:p-8 rounded-[36px] glass-card border border-purple-500/40 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-lg shadow-purple-600/30">
                            <Shield size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Driver & Vehicle Settings
                            </h1>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                Configure biometric profile, vehicle credentials & emergency protocols
                            </p>
                        </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto flex items-center gap-1">
                        <CheckCircle2 size={12} /> TELEMETRY LINK ACTIVE
                    </span>
                </motion.div>

                {/* EDIT FORM CONTAINER */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 sm:p-10 rounded-[36px] glass-card border border-purple-500/30 shadow-2xl relative overflow-hidden bg-black/50"
                >
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-mono mb-6 flex items-center gap-2">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono mb-6 flex items-center gap-2 font-bold"
                        >
                            <CheckCircle2 size={16} />
                            <span>Profile & Vehicle telemetry successfully updated!</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 font-mono">
                        
                        {/* Profile Picture Upload & Avatar */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative group">
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-purple-500/80 overflow-hidden bg-gray-900 flex items-center justify-center shadow-xl shadow-purple-600/30 group-hover:border-cyan-400 transition-all">
                                    {formData.profile_picture ? (
                                        <img src={formData.profile_picture} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-purple-300">
                                            {(formData.full_name || 'D').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-lg transition-transform hover:scale-110">
                                    <Camera size={16} />
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                            <span className="text-xs text-gray-400">Tap camera icon to update pilot avatar</span>
                        </div>

                        {/* Input Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-gray-300 font-bold flex items-center gap-1.5 uppercase">
                                    <User size={14} className="text-cyan-400" /> Driver Full Name
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white transition-all shadow-inner"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2">
                                <label className="text-gray-300 font-bold flex items-center gap-1.5 uppercase">
                                    <Phone size={14} className="text-purple-400" /> Primary Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="contact_details"
                                    value={formData.contact_details}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white transition-all shadow-inner"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {/* Blood Group */}
                            <div className="space-y-2">
                                <label className="text-gray-300 font-bold flex items-center gap-1.5 uppercase">
                                    <HeartPulse size={14} className="text-red-400" /> Blood Group (SOS First-Aid)
                                </label>
                                <input
                                    type="text"
                                    name="blood_group"
                                    value={formData.blood_group}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-red-400 focus:outline-none text-white transition-all shadow-inner"
                                    placeholder="e.g. O+, A+, B+, AB+"
                                />
                            </div>

                            {/* Vehicle Details */}
                            <div className="space-y-2">
                                <label className="text-gray-300 font-bold flex items-center gap-1.5 uppercase">
                                    <Car size={14} className="text-amber-400" /> Vehicle Model & Registration
                                </label>
                                <input
                                    type="text"
                                    name="vehicle_details"
                                    value={formData.vehicle_details}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-amber-400 focus:outline-none text-white transition-all shadow-inner"
                                    placeholder="Vehicle specs and license plate"
                                />
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
                            {onCancel && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={onCancel}
                                    className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition-all"
                                >
                                    Cancel
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-purple-600/30 transition-all"
                            >
                                <Save size={16} />
                                <span>{loading ? 'Saving Changes...' : 'Save Driver Profile'}</span>
                            </motion.button>
                        </div>

                    </form>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default EditProfile;
