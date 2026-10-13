import React, { useState } from 'react';
import { Search, LayoutDashboard, Menu, X, ChevronDown, MapPin, AlertCircle, FileText, ExternalLink, Lock, Building2 } from 'lucide-react';

export default function NavigationBar({ onOpenDashboard, activeSection, onNavigateSection, onSelectAuthorityLogin }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

    const navItems = [
        { id: 'hero', label: 'मुख्य पृष्ठ' },
        { id: 'departmental-gateways', label: 'विभागीय पोर्टल' },
        { id: 'dashboard-preview', label: 'सड़क निगरानी' },
        { id: 'map-section', label: 'यातायात स्थिति' },
        { id: 'alerts-section', label: 'दुर्घटना प्रबंधन' },
        { id: 'vehicles-section', label: 'वाहन सुरक्षा' },
        { id: 'analytics-section', label: 'विश्लेषण एवं रिपोर्ट' },
        { id: 'safety-info-section', label: 'सहायता एवं संपर्क' },
    ];

    const handleNavClick = (sectionId) => {
        setMobileMenuOpen(false);
        setDeptDropdownOpen(false);
        if (onNavigateSection) {
            onNavigateSection(sectionId);
        } else {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleTriggerAuthority = (authId) => {
        setDeptDropdownOpen(false);
        setMobileMenuOpen(false);
        if (onSelectAuthorityLogin) {
            onSelectAuthorityLogin(authId);
        }
    };

    return (
        <nav
            aria-label="मुख्य नेविगेशन"
            className="w-full bg-[#0f274e] text-white shadow-md sticky top-0 z-40 border-b-2 border-amber-500/80"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-13">

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`px-2.5 py-1.5 text-xs xl:text-[13px] font-semibold rounded transition cursor-pointer flex items-center gap-1 ${
                                    activeSection === item.id
                                        ? 'bg-blue-900/90 text-amber-300 border-b-2 border-amber-400'
                                        : 'text-slate-100 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded text-slate-200 hover:text-white hover:bg-blue-900 focus:outline-none"
                            aria-label="मोबाइल मेनू खोलें"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <span className="ml-2 font-bold text-sm text-amber-300">ई-सारथी मेनू</span>
                    </div>

                    {/* Right Action Controls: Department Login Dropdown, Search & Dashboard Entrance */}
                    <div className="flex items-center space-x-2">

                        {/* Department Login Dropdown Button */}
                        <div className="relative">
                            <button
                                onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                                className="bg-blue-950/80 hover:bg-blue-900 border border-blue-400/40 text-amber-300 px-2.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="विभागीय पोर्टल लॉगिन"
                            >
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                                <span className="hidden sm:inline">विभागीय लॉगिन</span>
                                <ChevronDown className="w-3 h-3 text-slate-300" />
                            </button>

                            {/* Dropdown Menu */}
                            {deptDropdownOpen && (
                                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg shadow-2xl border border-slate-300 py-2 z-50 text-slate-900 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                                        प्रशासनिक निकाय चुनें:
                                    </div>

                                    <button
                                        onClick={() => handleTriggerAuthority('nhai')}
                                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 flex items-center justify-between text-blue-950 font-semibold cursor-pointer"
                                    >
                                        <div>
                                            <div className="font-bold">1. NHAI पोर्टल</div>
                                            <div className="text-[10px] text-slate-500">राष्ट्रीय राजमार्ग एवं एक्सप्रेसवे</div>
                                        </div>
                                        <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">लॉगिन</span>
                                    </button>

                                    <button
                                        onClick={() => handleTriggerAuthority('state')}
                                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-amber-50 flex items-center justify-between text-amber-950 font-semibold cursor-pointer"
                                    >
                                        <div>
                                            <div className="font-bold">2. राज्य प्राधिकरण</div>
                                            <div className="text-[10px] text-slate-500">स्टेट हाईवे (SH) एवं PWD</div>
                                        </div>
                                        <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">लॉगिन</span>
                                    </button>

                                    <button
                                        onClick={() => handleTriggerAuthority('nagarnigam')}
                                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between text-emerald-950 font-semibold cursor-pointer"
                                    >
                                        <div>
                                            <div className="font-bold">3. नगर निगम</div>
                                            <div className="text-[10px] text-slate-500">शहरी वार्ड एवं स्थानीय सड़कें</div>
                                        </div>
                                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">लॉगिन</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search Icon / Button */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                            title="पोर्टल में खोजें"
                            aria-label="खोज बॉक्स खोलें"
                        >
                            <Search className="w-4 h-4" />
                        </button>

                        {/* Direct Dashboard Access Button */}
                        <button
                            onClick={onOpenDashboard}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer shrink-0"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">डैशबोर्ड</span>
                            <ExternalLink className="w-3 h-3 text-slate-900" />
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Dropdown Menu Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[#0a1a33] border-t border-slate-700/60 px-4 pt-2 pb-4 space-y-1 shadow-xl">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-blue-900 hover:text-amber-300 rounded block transition"
                        >
                            {item.label}
                        </button>
                    ))}
                    <div className="pt-2 border-t border-slate-700">
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                onOpenDashboard();
                            }}
                            className="w-full bg-amber-500 text-slate-950 font-bold px-3 py-2 text-xs rounded text-center flex items-center justify-center gap-2"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            निगरानी डैशबोर्ड में प्रवेश करें
                        </button>
                    </div>
                </div>
            )}

            {/* Accessible Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4">
                    <div className="bg-white text-slate-900 rounded-lg max-w-xl w-full p-5 shadow-2xl border border-slate-300 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-blue-900" />
                                <h3 className="font-bold text-sm text-slate-900">
                                    ई-सारथी पोर्टल खोज प्रणाली
                                </h3>
                            </div>
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="राजमार्ग (उदा. NH-48), वाहन संख्या, अलर्ट, या स्थान खोजें..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                        </div>

                        <div className="text-xs text-slate-500 space-y-2">
                            <div className="font-bold text-slate-700">सुझावित खोज विषय:</div>
                            <div className="flex flex-wrap gap-2">
                                {['NH-48 मानेसर', 'NH-44 करनाल', 'चालक उनींदापन', 'गड्ढा चेतावनी', 'DL-01-AB-1024', '112 आपातकालीन'].map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setSearchQuery(tag)}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border rounded text-[11px] cursor-pointer"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 border-t flex justify-end">
                            <button
                                onClick={() => {
                                    setSearchOpen(false);
                                    handleNavClick('alerts-section');
                                }}
                                className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-1.5 rounded text-xs font-bold"
                            >
                                परिणाम देखें
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
