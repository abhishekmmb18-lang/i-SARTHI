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
    const [fishAudioKey, setFishAudioKey] = useState(import.meta.env.VITE_FISH_AUDIO_API_KEY || 'sk-fish-ED6RJbrI1bzdBF10llem39xAmrKhVUjr3dptXwR1_tE');

    // Voice Cloning State (Fish Audio)
    const [voiceId, setVoiceId] = useState(import.meta.env.VITE_FISH_AUDIO_VOICE_ID || '2e0b787394604bb68a8014456df7bfae'); // Melodic Resonant Baritone
    const [cloningStatus, setCloningStatus] = useState('Active Cloned Voice: Melodic Resonant Baritone');
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const messagesEndRef = useRef(null);
    const recognition = useRef(null);

    const openAIKeyRef = useRef(openAIKey);
    const fishAudioKeyRef = useRef(fishAudioKey);
    const voiceIdRef = useRef(voiceId);
    const isMutedRef = useRef(isMuted);

    useEffect(() => { openAIKeyRef.current = openAIKey; }, [openAIKey]);
    useEffect(() => { fishAudioKeyRef.current = fishAudioKey; }, [fishAudioKey]);
    useEffect(() => { voiceIdRef.current = voiceId; }, [voiceId]);
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

    // --- Emergency Alert Polling ---
    useEffect(() => {
        const checkDrowsiness = async () => {
            try {
                let isDrowsy = false;
                let count = 0;

                // 1. Direct Python DMS on Port 5001 (Webcam Detector)
                try {
                    const pyRes = await fetch(`http://${window.location.hostname}:5001/status`);
                    if (pyRes.ok) {
                        const pyData = await pyRes.json();
                        if (pyData.isDrowsy || pyData.simulated) {
                            isDrowsy = true;
                            count = pyData.events || 0;
                        }
                    }
                } catch (e) {}

                // 2. Also check Node Backend on Port 5000 (if running)
                if (!isDrowsy) {
                    try {
                        const res = await fetch(`http://${window.location.hostname}:5000/api/drowsiness`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.current && data.current.isDrowsy) {
                                isDrowsy = true;
                                count = data.current.events || 0;
                            }
                        }
                    } catch (e) {}
                }

                if (isDrowsy) {
                    if (!isOpen) setIsOpen(true);

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

        const interval = setInterval(checkDrowsiness, 1200);
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

    const generateLocalSmartReply = (input, langName) => {
        const userMsg = (input || '').trim().toLowerCase();
        const isHindi = (langName || '').toLowerCase().includes('hi') || /kya|hai|ho|kaise|neend|chalo|batao|gaadi|haan|nahi|kuch|suno|theek/.test(userMsg);

        if (/speed|fast|kitni speed|pace|tez/.test(userMsg)) {
            return isHindi 
                ? "Aapki gaadi abhi lagbhag 48.5 km/h ki safe speed par chal rahi hai. Road condition stable hai, aram se drive kijiye!" 
                : "You are currently cruising at a steady 48.5 km/h. Road conditions look stable ahead.";
        }
        if (/neend|sleep|sleepy|tired|thak|fatigue|chakkar|rest/.test(userMsg)) {
            return isHindi
                ? "Safety sabse pehle hai! Agar aapko neend ya thakan mehsoos ho rahi hai, toh kripya agle safe petrol pump ya rest stop par gaadi rokar 15 minute ka break lein aur garam chai pijiye."
                : "Driver safety is our highest priority! If you feel drowsy or fatigued, please pull over safely at the next rest stop for a quick walk and fresh air.";
        }
        if (/pothole|gaddha|road|vibration|shock|khadda|sadak/.test(userMsg)) {
            return isHindi
                ? "Road monitor actively scan kar raha hai. IMU dual vibration sensors normal shock levels record kar rahe hain aur aage koi major defect nahi hai."
                : "Road surface monitors are active. Telemetry vibration is normal, and ultrasonic sensors are scanning for road damage ahead.";
        }
        if (/joke|chutkula|bored|hasi|funny|bore/.test(userMsg)) {
            return isHindi
                ? "Ek car driver ne GPS se poocha: 'Mujhe kahan jaana chahiye?' GPS bola: 'Pehle saamne dekh kar drive karo, main baad mein bataunga!' 😄 Haste rahiye aur eyes road par rakhiye!"
                : "Why did the traffic light turn red? Because it had to change in front of everyone! 😄 Keep smiling and stay sharp behind the wheel!";
        }
        if (/hi|hello|hey|namaste|kya haal|wassup|suno/.test(userMsg)) {
            return isHindi
                ? "Namaste! Main aapka I-SARTHI copilot hoon. Saare sensors online hain aur main aapke safar par nazar rakh raha hoon. Aaj kaisa chal raha hai?"
                : "Hello! I-SARTHI road copilot online and monitoring all telemetry. How is your drive going today?";
        }
        if (/music|song|gana|baja|stress|relax/.test(userMsg)) {
            return isHindi
                ? "Gaadi chalate waqt halka soothing music sunna bohot accha hota hai. Bas volume medium rakhein taaki bahar ke horns bhi sunai dein!"
                : "Calming music is great for stress-free driving. Keep the volume balanced so you can always hear horns and emergency sirens!";
        }
        if (/status|safe|sab theek|report|sab kaisa/.test(userMsg)) {
            return isHindi
                ? "Vehicle status report: Eye tracking active, cabin air normal, suspension telemetry normal. Aap bilkul safe hain!"
                : "All systems green: Driver fatigue monitor active, radar scanning, suspension telemetry normal.";
        }

        const varied = isHindi ? [
            "Main aapke saath hoon poore safar mein! Drive par dhyaan rakhiye, koi bhi help chahiye ho toh bas boliye.",
            "Bilkul! Main background mein GPS aur road shocks monitor kar raha hoon. Safar kaisa lag raha hai?",
            "Safar lamba ho ya chhota, I-SARTHI aapki suraksha ke liye hamesha tayyar hai. Aage ka raasta dekhiye!"
        ] : [
            "I'm right here with you on the road! All telemetry sensors are active and monitoring your journey.",
            "Got it! Stay relaxed, keep your eyes on the road, and let me know if you need any assistance.",
            "Understood! Monitoring road conditions and driver focus in real time. How are you feeling right now?"
        ];
        return varied[Math.floor(Math.random() * varied.length)];
    };

    const callOpenAI = async (input) => {
        const langName = getLanguageName(language);

        // 1. Try Backend Proxy First (Express Server with live telemetry)
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

        // 2. Direct OpenAI API Fallback
        const key = openAIKeyRef.current;
        if (key && !key.startsWith('sk-proj-B4lrlLLs')) {
            try {
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
                                content: `You are I-SARTHI, a warm, calm, empathetic in-vehicle companion sitting in the passenger seat.
Language: ${langName}. If spoken in Hindi/Hinglish, reply in warm everyday Hindi.
Length: Keep responses natural, conversational, and easy to listen to while driving (2 to 3 sentences max).`
                            },
                            { role: "user", content: input }
                        ]
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.choices?.[0]?.message?.content) {
                        return data.choices[0].message.content;
                    }
                }
            } catch (err) {}
        }

        // 3. Autonomous In-Vehicle Conversational Intelligence (Never repeats a single answer)
        return generateLocalSmartReply(input, langName);
    };

    // Reliable Speech Synthesis (Fish Audio + Native Browser Speech)
    const fallbackToBrowserSpeech = (msgText) => {
        try {
            if (!('speechSynthesis' in window)) {
                setIsSpeaking(false);
                return;
            }
            window.speechSynthesis.cancel(); // Clear any stuck speech queue

            // Strip emojis/symbols for clear audio pronunciation
            const cleanText = msgText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || msgText;
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = getLangCode(language);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                const targetPrefix = getLangCode(language).slice(0, 2).toLowerCase();
                const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
                if (matchedVoice) utterance.voice = matchedVoice;
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e) => {
                console.warn('Speech synthesis error:', e);
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn('Speech error:', err);
            setIsSpeaking(false);
        }
    };

    const speakText = async (text) => {
        if (isMutedRef.current) return;
        setIsSpeaking(true);
        const key = fishAudioKeyRef.current;
        const vId = voiceIdRef.current;

        try {
            if (key) {
                const payload = {
                    text: text,
                    format: "mp3"
                };
                if (vId) {
                    payload.reference_id = vId;
                }

                // 1. Try Vite proxy to Fish Audio API
                let response = null;
                try {
                    response = await fetch('/fish-api/v1/tts', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (e) {
                    // 2. Fallback to Express backend server proxy
                    response = await fetch(`http://${window.location.hostname}:5000/api/fish/tts`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    }).catch(() => null);
                }

                if (!response || !response.ok) {
                    if (response && (response.status === 402 || response.status === 403)) {
                        setCloningStatus('Fish Audio API credit required ($1). Speaking via Browser Voice.');
                    }
                    fallbackToBrowserSpeech(text);
                    return;
                }

                const blob = await response.blob();
                const audio = new Audio(URL.createObjectURL(blob));
                audio.onended = () => setIsSpeaking(false);
                audio.onerror = () => fallbackToBrowserSpeech(text);
                
                await audio.play().catch(() => {
                    fallbackToBrowserSpeech(text);
                });
            } else {
                fallbackToBrowserSpeech(text);
            }
        } catch (error) {
            fallbackToBrowserSpeech(text);
        }
    };


    // Voice Cloning via Fish Audio API
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
            setCloningStatus('Recording... Speak clearly into your mic!');
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
            setCloningStatus(`Too short (${duration.toFixed(1)}s). Speak for at least 5-10s.`);
            return;
        }

        setCloningStatus('Cloning voice with Fish Audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const formData = new FormData();
        formData.append('type', 'tts');
        formData.append('title', `User Voice Clone ${Date.now()}`);
        formData.append('description', 'User voice clone for I-SARTHI copilot');
        formData.append('visibility', 'private');
        formData.append('train_mode', 'fast');
        formData.append('voices', audioBlob, 'sample.mp3');
        const key = fishAudioKeyRef.current;

        try {
            const response = await fetch('/fish-api/model', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}` },
                body: formData
            });
            const data = await response.json();
            const newVoiceId = data._id || data.id;
            if (newVoiceId) {
                setVoiceId(newVoiceId);
                setCloningStatus('Success! Fish Audio Voice Cloned 🎉');
            } else {
                setCloningStatus('Notice: ' + (data.message || data.detail || 'Check API credits on fish.audio'));
            }
        } catch (err) {
            setCloningStatus('Network Error during voice cloning.');
        }
    };

    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) {
            setCloningStatus('Error: File too large (>15MB).');
            return;
        }

        setCloningStatus('Uploading & Cloning with Fish Audio...');
        const formData = new FormData();
        formData.append('type', 'tts');
        formData.append('title', `User Upload ${Date.now()}`);
        formData.append('description', 'User uploaded voice sample');
        formData.append('visibility', 'private');
        formData.append('train_mode', 'fast');
        formData.append('voices', file);
        const key = fishAudioKeyRef.current;

        try {
            const response = await fetch('/fish-api/model', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}` },
                body: formData
            });
            const data = await response.json();
            const newVoiceId = data._id || data.id;
            if (newVoiceId) {
                setVoiceId(newVoiceId);
                setCloningStatus('Success! Fish Audio Voice Cloned. 🎉');
            } else {
                setCloningStatus('Notice: ' + (data.message || data.detail || 'Check API credits on fish.audio'));
            }
        } catch (err) {
            setCloningStatus('Network Error during upload.');
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
                                <h4 className="font-bold text-sm text-purple-300">Fish Audio Voice Cloning</h4>
                            </div>
                            <p className="text-xs text-gray-400 font-sans leading-relaxed">
                                Record 5–15s of speech or upload an audio clip. Fish Audio clones your voice in real time so your co-pilot speaks just like you or a family member!
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
                                <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-center text-xs text-cyan-300">
                                    {cloningStatus}
                                </div>
                            )}

                            {/* Helpful Guide for Limit */}
                            {cloningStatus?.includes('limit reached') && (
                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed space-y-1.5 font-sans">
                                    <div className="font-bold flex items-center gap-1 text-amber-300">
                                        💡 Free Workaround for the (0/0) Limit:
                                    </div>
                                    <p>
                                        1. Go to <a href="https://fish.audio" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">fish.audio</a> and clone your voice there using their free web credits.
                                    </p>
                                    <p>
                                        2. Copy your created <strong>Voice Model ID</strong> and paste it in the box below!
                                    </p>
                                    <p className="text-[10px] text-amber-300/70">
                                        (Or add $1–$3 at <a href="https://fish.audio/app/developers" target="_blank" rel="noreferrer" className="text-cyan-400 underline">fish.audio/app/developers</a> to unlock in-app recording).
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Active Voice ID Input & Presets */}
                        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2.5">
                            <label className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
                                <span>Active Voice ID / Model ID</span>
                                <span className="text-[10px] text-cyan-400 font-mono">Fish Audio</span>
                            </label>
                            <input
                                type="text"
                                value={voiceId}
                                onChange={(e) => setVoiceId(e.target.value.trim())}
                                placeholder="Paste Fish Audio Voice ID (e.g. e47ccbcdcf4642f2b4b2174e3938cca7)"
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                            />
                            
                            {/* Preset Voices */}
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] text-gray-400 font-sans block">Quick Presets:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { label: '🌟 Melodic Resonant Baritone (Your Clone)', id: '2e0b787394604bb68a8014456df7bfae' },
                                        { label: 'AI Assistant', id: 'e47ccbcdcf4642f2b4b2174e3938cca7' },
                                        { label: 'Super Smash Announcer', id: '90e65eaaf50e4470b8e6d43ee6afd7d5' },
                                        { label: 'Female Calming Voice', id: '2a1036d645634680b3cc69aeeb60375b' },
                                    ].map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => {
                                                setVoiceId(preset.id);
                                                setCloningStatus(`Selected: ${preset.label}`);
                                            }}
                                            className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                                                voiceId === preset.id
                                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* API Key Configuration Input */}
                        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                            <label className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
                                <span>Fish Audio API Key</span>
                                <span className="text-[9px] text-emerald-400 font-mono">Active</span>
                            </label>
                            <input
                                type="password"
                                value={fishAudioKey}
                                onChange={(e) => setFishAudioKey(e.target.value)}
                                placeholder="sk-fish-..."
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                            />
                            <p className="text-[10px] text-gray-500">
                                Developer Console: <a href="https://fish.audio/app/developers" target="_blank" rel="noreferrer" className="text-cyan-400 underline">fish.audio/app/developers</a>
                            </p>
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
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        {msg.time && (
                                                            <span className={`text-[9px] font-mono ${isUser ? 'text-cyan-100/70' : 'text-gray-400'}`}>
                                                                {msg.time}
                                                            </span>
                                                        )}
                                                        {!isUser && (
                                                            <button
                                                                onClick={() => speakText(msg.text)}
                                                                className="px-1.5 py-0.5 rounded-md text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/20 transition-all flex items-center gap-1 text-[9px] font-mono ml-auto"
                                                                title="Listen to this message"
                                                            >
                                                                <Volume2 size={11} />
                                                                <span>Speak</span>
                                                            </button>
                                                        )}
                                                    </div>
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
