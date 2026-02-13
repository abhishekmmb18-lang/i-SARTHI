import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Settings, X, Volume2, MicOff, Play, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AIChat = () => {
    const { language, t } = useLanguage();
    console.log("AIChat Rendered with Language:", language);
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I am your personal assistant. I can speak 10+ languages. Try creating a voice clone in settings!" }
    ]);
    const [inputText, setInputText] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    // API Keys (From Environment Variables)
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

    // Use refs to avoid stale closures in SpeechRecognition callbacks
    const openAIKeyRef = useRef(openAIKey);
    const elevenLabsKeyRef = useRef(elevenLabsKey);
    const voiceIdRef = useRef(voiceId);

    // Update refs when state changes
    useEffect(() => {
        openAIKeyRef.current = openAIKey;
    }, [openAIKey]);

    useEffect(() => {
        elevenLabsKeyRef.current = elevenLabsKey;
    }, [elevenLabsKey]);

    useEffect(() => {
        voiceIdRef.current = voiceId;
    }, [voiceId]);

    // --- Emergency Alert Polling ---
    useEffect(() => {
        const checkDrowsiness = async () => {
            try {
                const res = await fetch(`http://${window.location.hostname}:5000/api/drowsiness`);
                const data = await res.json();

                if (data.current && data.current.isDrowsy) {
                    if (!isOpen) setIsOpen(true);

                    // Check Event Count for Specific Hindi Alert
                    const count = data.current.events || 0;

                    if (!isSpeaking) {
                        console.log(`⚠️ TRIGGERING AI ALERT! Events: ${count}`);

                        let message = "Wake up! Critical Alert! Driver Drowsiness Detected.";

                        // User Request: If 4 events, speak in Hindi
                        if (count >= 4) {
                            message = "Neend aa rahi hai kya? Ya koi problem hai? Bas uth jao aur gaadi side mein lagao.";
                        }

                        setMessages(prev => {
                            // Don't add duplicate alert messages
                            if (prev.length > 0 && prev[prev.length - 1].text.includes("CRITICAL ALERT")) return prev;
                            return [...prev, { role: 'assistant', text: `⚠️ CRITICAL ALERT: ${message}` }];
                        });

                        speakText(message);
                    }
                }
            } catch (err) {
                // Silent catch to avoid console spam if backend is offline
            }
        };

        const interval = setInterval(checkDrowsiness, 2000); // Check every 2 seconds
        return () => clearInterval(interval);
    }, [isOpen, isSpeaking]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Setup Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = getLangCode(language);

            recognition.current.onstart = () => {
                console.log("Speech Recognition Started");
                setIsListening(true);
            };
            recognition.current.onend = () => {
                console.log("Speech Recognition Ended");
                setIsListening(false);
            };

            recognition.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                console.log("Voice Input Received:", text);
                handleUserMessage(text);
            };

            recognition.current.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    alert("Microphone access blocked. Please check your browser settings.");
                } else if (event.error === 'no-speech') {
                    console.warn("No speech detected.");
                } else {
                    alert(`Voice command error: ${event.error}`);
                }
            };
        } else {
            console.error("Speech Recognition NOT supported in this browser.");
            alert("Voice commands are not supported in this browser. Please use Chrome or Edge.");
        }
    }, [language]);

    const getLangCode = (lang) => {
        const codes = {
            en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN',
            ta: 'ta-IN', gu: 'gu-IN', kn: 'kn-IN', ur: 'ur-PK', or: 'or-IN', pa: 'pa-IN'
        };
        return codes[lang] || 'en-US';
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

        // Add User Message
        setMessages(prev => [...prev, { role: 'user', text }]);

        // Call OpenAI
        try {
            const reply = await callOpenAI(text);
            setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
            speakText(reply);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I had trouble thinking. check API Key." }]);
        }
    };


    const getLanguageName = (code) => {
        const names = {
            en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi',
            ta: 'Tamil', gu: 'Gujarati', kn: 'Kannada', ur: 'Urdu', or: 'Odia', pa: 'Punjabi'
        };
        return names[code] || 'English';
    };

    const callOpenAI = async (input) => {
        const key = openAIKeyRef.current;
        if (!key) return "Please set your OpenAI API Key in settings.";

        const langName = getLanguageName(language);
        console.log(`Calling OpenAI with language: ${langName} (${language})`);

        const url = 'https://api.openai.com/v1/chat/completions';
        const body = {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a highly talkative, emotional, and engaging best friend. 
                           NEVER be formal. NEVER just answer the question. 
                           Always share a small personal story, opinion, or ask a follow-up question.
                           Talk like a real human in a casual conversation. Use slang, humor, and empathy.
                           Your goal is to keep the conversation going, not just close it.
                           Current Language is: ${langName}. 
                           Reply directly in ${langName}. 
                           Keep responses natural but engaging (2-3 sentences).`
                },
                { role: "user", content: input }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();

        if (data.error) {
            console.error("OpenAI API Error:", data.error);
            return `API Error: ${data.error.message}`;
        }

        const reply = data.choices?.[0]?.message?.content || "Error processing response.";
        console.log("OpenAI Reply:", reply);
        return reply;
    };

    const speakText = async (text) => {
        console.log(`Speaking Text (${language}):`, text);
        setIsSpeaking(true);
        const key = elevenLabsKeyRef.current;
        const vId = voiceIdRef.current;

        try {
            if (key) {
                console.log("Using ElevenLabs TTS...");
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': key,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: "eleven_multilingual_v2", // Crucial for Hindi/Indian langs
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
            console.warn("ElevenLabs TTS Error, falling back to browser:", error);

            // Fallback to Browser Native TTS
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = getLangCode(language);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    // --- Voice Cloning Logic ---

    const recordingStartTimeRef = useRef(0);

    const startRecordingClone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = uploadVoiceSample;
            mediaRecorderRef.current.start();
            recordingStartTimeRef.current = Date.now();
            setRecording(true);
            setCloningStatus('Recording... Speak clearly!');
        } catch (err) {
            console.error("Mic Error:", err);
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
        console.log("Recording Duration:", duration, "seconds");

        if (duration < 5) {
            setCloningStatus(`Too short (${duration.toFixed(1)}s). Record at least 5s.`);
            return;
        }

        setCloningStatus('Cloning... (High Accuracy Mode)');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const formData = new FormData();
        formData.append('name', `User Clone ${new Date().getTime()}`);
        formData.append('files', audioBlob, 'sample.mp3');
        formData.append('description', 'User cloned voice - High Fidelity');
        const key = elevenLabsKeyRef.current;

        try {
            const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
                method: 'POST',
                headers: {
                    'xi-api-key': key,
                },
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
            setCloningStatus('Error uploading.');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center text-white hover:scale-110 transition-transform z-50 animate-pulse"
            >
                <div className="absolute w-full h-full rounded-full border-4 border-white/20 animate-ping"></div>
                <Activity size={32} />
            </button>
        );
    }



    return (
        <div className="fixed bottom-8 right-8 w-96 max-h-[600px] h-[80vh] bg-[#0f172a] rounded-2xl border border-white/10 shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2">
                    <Activity size={20} className="text-blue-300" />
                    <h3 className="font-bold text-white">AI Assistant</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                        <Settings size={18} />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Settings Mode */}
            {showSettings ? (
                <div className="flex-1 p-4 overflow-y-auto text-white space-y-6">
                    <div>
                        <h4 className="font-bold mb-2 text-blue-400">API Configuration</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400">OpenAI Key</label>
                                <input
                                    type="password"
                                    value={openAIKey}
                                    onChange={(e) => setOpenAIKey(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">ElevenLabs Key</label>
                                <input
                                    type="password"
                                    value={elevenLabsKey}
                                    onChange={(e) => setElevenLabsKey(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <h4 className="font-bold mb-2 text-purple-400">Voice Cloning</h4>
                        <p className="text-xs text-gray-400 mb-4">
                            Record a 10s sample of your voice. The AI will learn to speak like you!
                        </p>

                        <div className="flex justify-center mb-4">
                            <button
                                onMouseDown={startRecordingClone}
                                onMouseUp={stopRecordingClone}
                                className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all
                                    ${recording ? 'bg-red-500 border-red-300 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-gray-700 border-gray-500 hover:bg-gray-600'}
                                `}
                            >
                                <Mic size={32} className="text-white" />
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-300">
                            {recording ? "Recording... Release to Upload" : "Hold to Record (10s)"}
                        </p>
                        {cloningStatus && (
                            <p className="text-center text-xs mt-2 text-green-400 animate-pulse">{cloningStatus}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2 text-center">Current Voice ID: {voiceId.slice(0, 8)}...</p>
                    </div>
                </div>
            ) : (
                /* Chat Mode */
                <>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/20">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Visualizer when speaking */}
                    {isSpeaking && (
                        <div className="h-12 flex items-center justify-center space-x-1 bg-black/40">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-1 bg-blue-400 rounded-full animate-bounce"
                                    style={{ height: '100%', animationDuration: `${0.5 + Math.random() * 0.5}s` }}></div>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-gray-900 border-t border-white/10 flex items-center space-x-2">
                        <button
                            onClick={toggleListening}
                            className={`p-3 rounded-full transition-all ${isListening
                                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm outline-none px-2"
                            placeholder={isListening ? "Listening..." : "Type a message..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />

                        <button
                            onClick={handleSend}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIChat;
