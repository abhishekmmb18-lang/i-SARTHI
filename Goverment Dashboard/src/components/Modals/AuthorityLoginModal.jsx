import React, { useState, useEffect } from 'react';
import { Lock, User, KeyRound, ShieldCheck, X, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Building2, MapPin, Landmark, Map } from 'lucide-react';
import AshokaChakraIcon from '../Landing/AshokaChakraIcon';
import { AUTHORITIES, INDIAN_STATES } from '../../data/authoritiesData';

export default function AuthorityLoginModal({ authorityId = 'nhai', initialStateId = 'UP', isOpen, onClose, onLoginSuccess }) {
    const authority = AUTHORITIES[authorityId] || AUTHORITIES.nhai;

    const [selectedStateId, setSelectedStateId] = useState(initialStateId || 'UP');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaCode, setCaptchaCode] = useState('7K9P2');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginSuccessNotice, setLoginSuccessNotice] = useState(false);

    const activeState = INDIAN_STATES.find((s) => s.id === selectedStateId) || INDIAN_STATES[0];

    // Generate random captcha string
    const generateCaptcha = () => {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaCode(code);
        setCaptchaInput('');
    };

    useEffect(() => {
        if (isOpen) {
            setUserId('');
            setPassword('');
            setCaptchaInput('');
            setErrorMsg('');
            setLoginSuccessNotice(false);
            setLoading(false);
            generateCaptcha();
            if (initialStateId) setSelectedStateId(initialStateId);
        }
    }, [isOpen, authorityId, initialStateId]);

    // When state changes in State Authority mode, auto-update ID if previously filled
    const handleStateChange = (stateId) => {
        setSelectedStateId(stateId);
        const newState = INDIAN_STATES.find((s) => s.id === stateId) || INDIAN_STATES[0];
        if (userId.includes('_PWD_') || userId.includes('_HWY_') || userId.includes('STATE_PWD')) {
            setUserId(newState.userId);
        }
    };

    if (!isOpen) return null;

    // Quick Fill Demo Credentials for instant presentation testing
    const handleQuickFillDemo = () => {
        if (authorityId === 'state') {
            setUserId(activeState.userId);
            setPassword(activeState.password);
        } else {
            setUserId(authority.demoCredentials.userId);
            setPassword(authority.demoCredentials.password);
        }
        setCaptchaInput(captchaCode);
        setErrorMsg('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (authorityId === 'state' && !selectedStateId) {
            setErrorMsg('कृपया अपने राज्य का चयन करें।');
            return;
        }

        if (!userId.trim()) {
            setErrorMsg('कृपया अधिकृत उपयोगकर्ता आईडी (User ID) दर्ज करें।');
            return;
        }

        if (!password.trim()) {
            setErrorMsg('कृपया पासवर्ड / सुरक्षा पिन दर्ज करें।');
            return;
        }

        if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
            setErrorMsg('अमान्य सुरक्षा कैप्चा कोड। कृपया पुनः प्रयास करें।');
            generateCaptcha();
            return;
        }

        // Validate credentials against demo records
        let expectedId = authority.demoCredentials.userId.toLowerCase();
        let expectedPass = authority.demoCredentials.password.toLowerCase();

        if (authorityId === 'state') {
            expectedId = activeState.userId.toLowerCase();
            expectedPass = activeState.password.toLowerCase();
        }

        // Also allow generic statepwd@2026 or state specific
        const isStateMatch =
            authorityId === 'state' &&
            (userId.trim().toLowerCase() === expectedId || userId.trim().toLowerCase().includes('pwd')) &&
            password.trim().toLowerCase() === 'statepwd@2026';

        const isStandardMatch =
            userId.trim().toLowerCase() === expectedId && password.trim().toLowerCase() === expectedPass;

        if (!isStateMatch && !isStandardMatch) {
            setErrorMsg(`अमान्य क्रेडेंशियल्स! मान्य डेमो आईडी: "${expectedId}" एवं पासवर्ड: "${expectedPass}" का उपयोग करें (या नीचे "त्वरित डेमो क्रेडेंशियल्स भरें" पर क्लिक करें)।`);
            return;
        }

        // Simulated secure authentication
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setLoginSuccessNotice(true);
            setTimeout(() => {
                onLoginSuccess({
                    authority,
                    authorityId: authority.id || authorityId,
                    selectedState: authorityId === 'state' ? activeState : null,
                    officerName: authorityId === 'state' ? activeState.demoOfficer : authority.demoCredentials.officerName,
                    role: authority.dashboardRole
                });
            }, 800);
        }, 600);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border-2 border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Top Indian Tricolour Stripe */}
                <div className="w-full h-1.5 flex">
                    <div className="h-full flex-1 bg-[#FF9933]"></div>
                    <div className="h-full flex-1 bg-white"></div>
                    <div className="h-full flex-1 bg-[#138808]"></div>
                </div>

                {/* Modal Header */}
                <div className="bg-[#0f274e] text-white p-5 flex items-start justify-between relative">
                    <div className="flex items-center space-x-3.5">
                        <div className="p-1 rounded-full bg-white/10 border border-white/20 shrink-0">
                            <AshokaChakraIcon className="w-10 h-10" color="#93c5fd" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="inline-block px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                                {authorityId === 'state' ? `राज्य स्तर: ${activeState.id}` : `${authority.tag} सुरक्षित पोर्टल`}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold font-hindi leading-snug">
                                {authorityId === 'state' ? `${activeState.nameHindi}` : authority.nameHindi}
                            </h3>
                            <p className="text-[11px] text-slate-300 font-medium">
                                {authorityId === 'state' ? activeState.departmentName : authority.divisionHindi}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
                        aria-label="बंद करें"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">

                    {/* State Selection Dropdown & Quick Chips (Triggered when State Authority is selected) */}
                    {authorityId === 'state' && (
                        <div className="space-y-2 bg-amber-50/80 border-2 border-amber-300 rounded-xl p-3.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5 font-hindi">
                                    <MapPin className="w-4 h-4 text-amber-700" />
                                    <span>राज्य चुनें (Select State / UT):</span>
                                    <span className="text-red-600">*</span>
                                </label>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                                    {activeState.id} &bull; {activeState.headquarters}
                                </span>
                            </div>

                            <select
                                value={selectedStateId}
                                onChange={(e) => handleStateChange(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                            >
                                {INDIAN_STATES.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.nameHindi} — {st.departmentName}
                                    </option>
                                ))}
                            </select>

                            {/* Quick state chips */}
                            <div className="space-y-1 pt-1">
                                <div className="text-[10px] font-bold text-amber-900">त्वरित राज्य चयन:</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {INDIAN_STATES.slice(0, 8).map((st) => (
                                        <button
                                            type="button"
                                            key={st.id}
                                            onClick={() => handleStateChange(st.id)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                                selectedStateId === st.id
                                                    ? 'bg-amber-700 text-white shadow-2xs'
                                                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-300'
                                            }`}
                                        >
                                            {st.nameHindi.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active State Profile Info */}
                            <div className="text-[11px] text-amber-950 bg-white/90 p-2.5 rounded-lg border border-amber-200 space-y-0.5">
                                <div className="font-bold text-amber-900">{activeState.departmentName}</div>
                                <div className="text-slate-600">
                                    अधिकृत अधिकारी: <strong className="text-slate-900">{activeState.demoOfficer}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Authority Scope Box (shown for NHAI / Nagar Nigam) */}
                    {authorityId !== 'state' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2.5">
                            <Building2 className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold text-slate-800 font-hindi">अधिकार क्षेत्र (Jurisdiction Scope):</div>
                                <div className="text-[11px] text-slate-600">{authority.jurisdictionHindi}</div>
                            </div>
                        </div>
                    )}

                    {/* Quick Demo Helper Button */}
                    <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 text-xs">
                        <div className="text-[11px] text-blue-900">
                            <strong>प्रस्तुति / मूल्यांकन सहायता:</strong> {authorityId === 'state' ? `${activeState.id} राज्य क्रेडेंशियल्स` : 'टेस्ट क्रेडेंशियल्स'}
                        </div>
                        <button
                            type="button"
                            onClick={handleQuickFillDemo}
                            className="bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer"
                        >
                            त्वरित डेमो क्रेडेंशियल्स भरें
                        </button>
                    </div>

                    {/* Error Notice */}
                    {errorMsg && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2 animate-shake">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="leading-snug">{errorMsg}</div>
                        </div>
                    )}

                    {/* Success Notice */}
                    {loginSuccessNotice && (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="font-bold">सत्यापन सफल! {authority.shortName} डैशबोर्ड में प्रवेश किया जा रहा है...</div>
                        </div>
                    )}

                    {/* Input 1: User ID */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 font-hindi">
                            अधिकृत अधिकारी ID (Officer User ID) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                required
                                placeholder={`उदा. ${authority.demoCredentials.userId}`}
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                            />
                        </div>
                    </div>

                    {/* Input 2: Password */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 font-hindi">
                            पासवर्ड / सुरक्षा पिन (Password / PIN) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                            />
                        </div>
                    </div>

                    {/* Input 3: Captcha Verification */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 font-hindi">
                            सुरक्षा कैप्चा (Security Captcha) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-200 border border-slate-400 px-3 py-1.5 rounded font-mono font-black text-sm tracking-widest text-slate-900 select-none line-through">
                                {captchaCode}
                            </div>
                            <button
                                type="button"
                                onClick={generateCaptcha}
                                className="p-2 border border-slate-300 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                                title="कैप्चा बदलें"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <input
                                type="text"
                                required
                                maxLength={5}
                                placeholder="कैप्चा कोड"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase font-mono"
                            />
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                        >
                            रद्द करें
                        </button>

                        <button
                            type="submit"
                            disabled={loading || loginSuccessNotice}
                            className="bg-[#0f274e] hover:bg-blue-900 text-white px-5 py-2 rounded text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>सत्यापन जारी...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>सत्यापित करें एवं प्रवेश करें</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-[10px] text-center text-slate-400">
                        केवल अधिकृत प्रशासनिक कर्मियों हेतु &bull; अनाधिकृत प्रवेश दंडनीय है (शैक्षणिक डेमो मोड सक्रिय)
                    </div>

                </form>

            </div>
        </div>
    );
}
