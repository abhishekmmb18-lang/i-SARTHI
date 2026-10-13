import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, 
    Send, 
    Settings, 
    X, 
    Volume2, 
    VolumeX, 
    MicOff, 
    Play, 
    Sparkles, 
    Bot, 
    User, 
    Radio, 
    Smile, 
    Coffee, 
    Music, 
    ShieldAlert, 
    Wind,
    ChevronDown,
    Zap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const QUICK_PROMPTS = [
    { icon: <Wind size={13} className="text-cyan-400" />, label: "I'm feeling stressed", prompt: "I'm feeling a bit stressed right now while driving. Can you help me relax?" },
    { icon: <Smile size={13} className="text-amber-400" />, label: "Tell a road joke", prompt: "Tell me a funny driving joke to keep my mood light!" },
    { icon: <Coffee size={13} className="text-orange-400" />, label: "Feeling tired", prompt: "I'm starting to feel a bit sleepy. What should I do to stay alert?" },
    { icon: <Music size={13} className="text-pink-400" />, label: "Music vibes", prompt: "Suggest some good mood-boosting driving music genres!" },
    { icon: <ShieldAlert size={13} className="text-emerald-400" />, label: "Safety check", prompt: "How should I maintain focus in heavy traffic?" }
];

const AIChat = () => {
    const { language, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            text: "Hey! I'm your I-SARTHI road companion. Whether you're feeling stressed, tired, or just want a casual friendly chat while driving, I'm right here with you. How's everything going today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // API Keys
    const [openAIKey, setOpenAIKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
    const [elevenLabsKey, setElevenLabsKey] = useState(import.meta.env.VITE_ELEVENLABS_API_KEY || '');

    // Voice Cloning State
    const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM'); // Default Rachel
    const [cloningStatus, setCloningStatus] = useState('');
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const messagesEndRef = useRef(null);
    const recognition = useRef(null);

    const openAIKeyRef = useRef(openAIKey);
    const elevenLabsKeyRef = useRef(elevenLabsKey);
    const voiceIdRef = useRef(voiceId);
    const isMutedRef = useRef(isMuted);

    useEffect(() => { openAIKeyRef.current = openAIKey; }, [openAIKey]);
    useEffect(() => { elevenLabsKeyRef.current = elevenLabsKey; }, [elevenLabsKey]);
    useEffect(() => { voiceIdRef.current = voiceId; }, [voiceId]);
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

    // --- Emergency Alert Polling ---
    useEffect(() => {
        const checkDrowsiness = async () => {
            try {
                const res = await fetch(`http://${window.location.hostname}:5000/api/drowsiness`);
                const data = await res.json();

                if (data.current && data.current.isDrowsy) {
                    if (!isOpen) setIsOpen(true);
                    const count = data.current.events || 0;

                    if (!isSpeaking) {
                        let message = "Wake up! Critical Alert! Driver Drowsiness Detected.";
                        if (count >= 4) {
                            message = "Neend aa rahi hai kya? Ya koi problem hai? Bas uth jao aur gaadi side mein lagao.";
                        }

                        setMessages(prev => {
                            if (prev.length > 0 && prev[prev.length - 1].text.includes("CRITICAL ALERT")) return prev;
                            return [...prev, { 
                                role: 'assistant', 
                                text: `⚠️ CRITICAL ALERT: ${message}`,
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }];
                        });

                        if (!isMutedRef.current) speakText(message);
                    }
                }
            } catch (err) {}
        };

        const interval = setInterval(checkDrowsiness, 2000);
        return () => clearInterval(interval);
    }, [isOpen, isSpeaking]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Setup Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = getLangCode(language);

            recognition.current.onstart = () => setIsListening(true);
            recognition.current.onend = () => setIsListening(false);
            recognition.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                handleUserMessage(text);
            };
            recognition.current.onerror = (event) => {
                setIsListening(false);
            };
        }
    }, [language]);

    const getLangCode = (lang) => {
        const codes = {
            en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN',
            ta: 'ta-IN', gu: 'gu-IN', kn: 'kn-IN', ur: 'ur-PK', or: 'or-IN', pa: 'pa-IN'
        };
        return codes[lang] || 'en-US';
    };

    const getLanguageName = (code) => {
        const names = {
            en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi',
            ta: 'Tamil', gu: 'Gujarati', kn: 'Kannada', ur: 'Urdu', or: 'Odia', pa: 'Punjabi'
        };
        return names[code] || 'English';
    };

    const toggleListening = () => {
        if (isListening) {
            recognition.current?.stop();
        } else {
            recognition.current?.start();
        }
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        handleUserMessage(inputText);
        setInputText('');
    };

    const handleUserMessage = async (text) => {
        if (!text.trim()) return;

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { role: 'user', text, time: timeString }]);
        setIsTyping(true);

        try {
            const reply = await callOpenAI(text);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                text: reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            if (!isMutedRef.current) speakText(reply);
        } catch (error) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                text: "I'm right here listening to you! Tell me more about what's on your mind.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const callOpenAI = async (input) => {
        const langName = getLanguageName(language);

        // 1. Try Backend Proxy First
        try {
            const backendRes = await fetch(`http://${window.location.hostname}:5000/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, language: langName })
            });
            if (backendRes.ok) {
                const bData = await backendRes.json();
                if (bData.reply) return bData.reply;
            }
        } catch (backendErr) {}

        // 2. Direct OpenAI API Fallback (gpt-4o-mini)
        const key = openAIKeyRef.current;
        if (!key) return "I'm here with you on the road! Feel free to chat with me anytime.";

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are I-SARTHI, a warm, calm, empathetic in-vehicle companion and trusted friend sitting in the passenger seat.
- If the driver is stressed, tired, anxious, or overwhelmed: Be comforting, soothing, validating, and supportive. Help them relax and breathe.
- If the driver wants a casual chat: Have a natural, fun, engaging conversation about life, thoughts, music, stories, or jokes.
- Language: ${langName}. If spoken in Hindi/Hinglish, reply in warm everyday Hindi/Hinglish.
- Length: Keep responses natural, conversational, and easy to listen to while driving (2 to 4 sentences).`
                    },
                    { role: "user", content: input }
                ]
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "I'm right here with you on the road! What's on your mind?";
    };

    const speakText = async (text) => {
        if (isMutedRef.current) return;
        setIsSpeaking(true);
        const key = elevenLabsKeyRef.current;
        const vId = voiceIdRef.current;

        try {
            if (key) {
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': key,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: "eleven_multilingual_v2",
                        voice_settings: { stability: 0.35, similarity_boost: 1.0, style: 1.0, use_speaker_boost: true }
                    })
                });

                if (!response.ok) throw new Error('TTS Failed');

                const blob = await response.blob();
                const audio = new Audio(URL.createObjectURL(blob));
                audio.onended = () => setIsSpeaking(false);
                audio.play();
            } else {
                throw new Error("No ElevenLabs Key");
            }
        } catch (error) {
            // Fallback to Browser Native Speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = getLangCode(language);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    // Voice Cloning
    const recordingStartTimeRef = useRef(0);

    const startRecordingClone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            mediaRecorderRef.current.onstop = uploadVoiceSample;
            mediaRecorderRef.current.start();
            recordingStartTimeRef.current = Date.now();
            setRecording(true);
            setCloningStatus('Recording... Speak clearly!');
        } catch (err) {
            alert("Microphone access denied! Check browser permissions.");
        }
    };

    const stopRecordingClone = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const uploadVoiceSample = async () => {
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        if (duration < 5) {
            setCloningStatus(`Too short (${duration.toFixed(1)}s). Record at least 5s.`);
            return;
        }

        setCloningStatus('Cloning voice sample...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const formData = new FormData();
        formData.append('name', `User Clone ${new Date().getTime()}`);
        formData.append('files', audioBlob, 'sample.mp3');
        formData.append('description', 'User cloned voice');
        const key = elevenLabsKeyRef.current;

        try {
            const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
                method: 'POST',
                headers: { 'xi-api-key': key },
                body: formData
            });
            const data = await response.json();
            if (data.voice_id) {
                setVoiceId(data.voice_id);
                setCloningStatus('Success! Voice Cloned.');
            } else {
                setCloningStatus('Failed: ' + (data.detail?.message || 'Unknown error'));
            }
        } catch (err) {
            setCloningStatus('Error uploading voice.');
        }
    };

    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setCloningStatus('Error: File too large (>5MB).');
            return;
        }

        setCloningStatus('Uploading & Cloning...');
        const formData = new FormData();
        formData.append('name', `User Upload ${new Date().getTime()}`);
        formData.append('files', file);
        formData.append('description', 'User uploaded voice sample');
        const key = elevenLabsKeyRef.current;

        try {
            const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
                method: 'POST',
                headers: { 'xi-api-key': key },
                body: formData
            });
            const data = await response.json();
            if (data.voice_id) {
                setVoiceId(data.voice_id);
                setCloningStatus('Success! Voice Cloned. 🎉');
            } else {
                setCloningStatus('Failed: ' + (data.detail?.message || 'Error'));
            }
        } catch (err) {
            setCloningStatus('Network Error.');
        }
    };

    // ==========================================
    // FLOATING ORB TRIGGER (When Closed)
    // ==========================================
    if (!isOpen) {
        return (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 cursor-pointer group"
                onClick={() => setIsOpen(true)}
            >
                {/* Holographic Tooltip Label */}
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-xl border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-2xl group-hover:border-cyan-400 transition-all">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>AI Copilot</span>
                </div>

                {/* Cyber Avatar Button with Multi-Ring Glow */}
                <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                    {/* Spinning Neon Aura */}
                    <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-hud-spin" />
                    <div className="absolute -inset-1 rounded-full border border-purple-500/30 animate-hud-spin-reverse" />
                    
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden backdrop-blur-md">
                        {/* Audio Wave Glow Bars */}
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none" />
                        <Bot size={26} className="text-cyan-400 group-hover:text-pink-400 transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        
                        {/* Live Online Badge */}
                        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-md" />
                    </div>
                </div>
            </motion.div>
        );
    }

    // ==========================================
    // FULL CYBER CHAT MODAL (When Open)
    // ==========================================
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="fixed bottom-6 right-6 w-[92vw] sm:w-[420px] max-h-[640px] h-[85vh] rounded-[32px] glass-card border border-cyan-500/40 shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex flex-col z-50 overflow-hidden font-sans bg-[#080d1e]/95 backdrop-blur-2xl"
            >
                {/* TOP HEADER: HOLOGRAPHIC COMPANION BAR */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0d152e] via-[#131b3d] to-[#1e133d] border-b border-cyan-500/20 flex items-center justify-between shrink-0 relative overflow-hidden">
                    {/* Animated Ambient Light */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center space-x-3 z-10">
                        {/* Animated Companion Avatar */}
                        <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20">
                                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                                    <Bot size={22} className={`transition-colors ${isSpeaking ? 'text-pink-400 animate-pulse' : 'text-cyan-400'}`} />
                                </div>
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${isSpeaking ? 'bg-pink-400 animate-ping' : 'bg-emerald-400'}`} />
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-black text-white text-sm tracking-wide">I-SARTHI</h3>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                    {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : 'ONLINE'}
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                                <Sparkles size={11} className="text-amber-400" />
                                <span>In-Vehicle Companion</span>
                            </p>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center space-x-1.5 z-10">
                        {/* Mute/Unmute Toggle */}
                        <button 
                            onClick={() => setIsMuted(!isMuted)} 
                            className={`p-2 rounded-xl border transition-all ${
                                isMuted 
                                    ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                            title={isMuted ? "Unmute Voice" : "Mute Voice"}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>

                        {/* Settings Button */}
                        <button 
                            onClick={() => setShowSettings(!showSettings)} 
                            className={`p-2 rounded-xl border transition-all ${
                                showSettings 
                                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                            title="Voice Cloning Settings"
                        >
                            <Settings size={16} />
                        </button>

                        {/* Close / Minimize */}
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-red-300 transition-all"
                            title="Close Chat"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ========================================== */}
                {/* SETTINGS VIEW: VOICE CLONING & CUSTOM AUDIO */}
                {/* ========================================== */}
                {showSettings ? (
                    <div className="flex-1 p-5 overflow-y-auto text-white space-y-6 bg-slate-950/60 font-mono">
                        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                            <div className="flex items-center gap-2">
                                <Radio size={16} className="text-purple-400" />
                                <h4 className="font-bold text-sm text-purple-300">Neural Voice Cloning</h4>
                            </div>
                            <p className="text-xs text-gray-400 font-sans leading-relaxed">
                                Record a 10s voice clip or upload audio. I-SARTHI will clone the voice so your co-pilot sounds like you or a family member!
                            </p>

                            <div className="flex justify-center gap-4 py-2">
                                {/* Record Button */}
                                <div className="flex flex-col items-center gap-1.5">
                                    <motion.button
                                        whileTap={{ scale: 0.92 }}
                                        onMouseDown={startRecordingClone}
                                        onMouseUp={stopRecordingClone}
                                        onTouchStart={startRecordingClone}
                                        onTouchEnd={stopRecordingClone}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl ${
                                            recording 
                                                ? 'bg-red-500 border-red-300 scale-110 shadow-red-500/50 animate-pulse' 
                                                : 'bg-slate-800 border-purple-500/40 hover:bg-purple-900/40'
                                        }`}
                                    >
                                        <Mic size={22} className="text-white" />
                                    </motion.button>
                                    <span className="text-[10px] text-gray-400 font-bold">Hold to Record</span>
                                </div>

                                {/* Upload Button */}
                                <div className="flex flex-col items-center gap-1.5">
                                    <motion.button
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => fileInputRef.current.click()}
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 bg-slate-800 border-cyan-500/40 hover:bg-cyan-900/40 transition-all shadow-xl"
                                    >
                                        <Play size={22} className="text-cyan-400 transform -rotate-90" />
                                    </motion.button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="audio/*,.mp3,.wav,.m4a,.ogg"
                                        className="hidden"
                                    />
                                    <span className="text-[10px] text-gray-400 font-bold">Upload Audio</span>
                                </div>
                            </div>

                            {cloningStatus && (
                                <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-center text-xs text-cyan-300 animate-pulse">
                                    {cloningStatus}
                                </div>
                            )}
                            <div className="text-[10px] text-gray-500 text-center">
                                Active Voice ID: <span className="text-cyan-400">{voiceId.slice(0, 8)}...</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono transition-all border border-white/10"
                        >
                            Return to Conversation
                        </button>
                    </div>
                ) : (
                    /* ========================================== */
                    /* MAIN CHAT & CONVERSATION VIEW */
                    /* ========================================== */
                    <>
                        {/* MESSAGES SCROLL CONTAINER */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-transparent via-[#060a17]/50 to-[#060a17]/90 scroll-smooth">
                            {messages.map((msg, i) => {
                                const isUser = msg.role === 'user';
                                const isAlert = msg.text.includes("CRITICAL ALERT");

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.25 }}
                                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-lg relative group ${
                                            isAlert 
                                                ? 'bg-gradient-to-r from-red-950/80 to-rose-950/80 border border-red-500/50 text-red-100 rounded-bl-sm shadow-red-900/30'
                                                : isUser
                                                    ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-cyan-600/30 font-medium'
                                                    : 'bg-slate-900/90 border border-cyan-500/20 text-gray-100 rounded-bl-sm shadow-black/40 backdrop-blur-md'
                                        }`}>
                                            <div className="flex items-start gap-2">
                                                {!isUser && (
                                                    <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5 shrink-0">
                                                        <Bot size={13} />
                                                    </span>
                                                )}
                                                <div className="flex-1">
                                                    <p>{msg.text}</p>
                                                    {msg.time && (
                                                        <span className={`text-[9px] font-mono block mt-1.5 ${isUser ? 'text-cyan-100/70 text-right' : 'text-gray-400'}`}>
                                                            {msg.time}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Typing / Processing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex items-center space-x-1.5">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* LIVE EQUALIZER WAVEFORM (When Speaking or Listening) */}
                        {(isSpeaking || isListening) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 36 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-[#050b1a] border-t border-cyan-500/20 px-4 flex items-center justify-center gap-1 overflow-hidden"
                            >
                                <span className="text-[10px] font-mono text-cyan-300 font-bold mr-2">
                                    {isListening ? 'LISTENING...' : 'VOICE STREAM'}
                                </span>
                                {[...Array(14)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: [
                                                `${8 + (i % 3) * 6}px`, 
                                                `${20 + (i % 4) * 5}px`, 
                                                `${6 + (i % 2) * 8}px`
                                            ]
                                        }}
                                        transition={{
                                            duration: 0.4 + (i % 3) * 0.15,
                                            repeat: Infinity,
                                            repeatType: "reverse"
                                        }}
                                        className="w-1 bg-gradient-to-t from-cyan-500 to-pink-500 rounded-full"
                                    />
                                ))}
                            </motion.div>
                        )}

                        {/* QUICK MOOD & PROMPT CHIPS */}
                        <div className="px-3 py-2 bg-[#060b1c] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                            {QUICK_PROMPTS.map((qp, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleUserMessage(qp.prompt)}
                                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-cyan-500/40 text-[11px] text-gray-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-all font-mono"
                                >
                                    {qp.icon}
                                    <span>{qp.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* INPUT COMPOSER AREA */}
                        <div className="p-3 sm:p-4 bg-[#070d1e] border-t border-cyan-500/20 flex items-center gap-2 shrink-0">
                            {/* Voice Input Mic Button */}
                            <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={toggleListening}
                                className={`p-3 rounded-2xl transition-all shadow-lg flex items-center justify-center shrink-0 ${
                                    isListening
                                        ? 'bg-red-500 text-white shadow-red-500/50 animate-pulse ring-2 ring-red-300'
                                        : 'bg-white/10 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/40'
                                }`}
                                title={isListening ? "Stop listening" : "Talk via Microphone"}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </motion.button>

                            {/* Text Input */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-xs sm:text-sm placeholder-gray-500 transition-all font-sans shadow-inner"
                                    placeholder={isListening ? "Listening to your voice..." : "Talk with your AI co-pilot..."}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                            </div>

                            {/* Send Button */}
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className={`p-3 rounded-2xl transition-all shadow-lg flex items-center justify-center shrink-0 ${
                                    inputText.trim()
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30'
                                        : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                }`}
                            >
                                <Send size={18} />
                            </motion.button>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default AIChat;
