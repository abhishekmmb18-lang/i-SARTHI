import React from 'react';
import { Shield, Home, LayoutDashboard, Map, TriangleAlert, Phone, Settings, Building2, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ activeTab, onTabChange }) => {
    const { t } = useLanguage();

    const menuItems = [
        { id: 'profile-home', label: t('home'), icon: Home },
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { id: 'road-monitor', label: t('road_monitor'), icon: Map },
        { id: 'incidents', label: t('incidents'), icon: TriangleAlert },
        { id: 'emergency', label: t('emergency'), icon: Phone },
        { id: 'edit-profile', label: t('settings'), icon: Settings },
        { id: 'gov-dashboard', label: t('database'), icon: Database }, // Renamed to Database
    ];

    return (
        <div className="w-64 h-screen fixed left-0 top-0 bg-[#0a0f1c] border-r border-white/5 pt-24 px-4 flex flex-col z-40 hidden md:flex">
            <div className="flex items-center space-x-3 mb-10 px-2 lg:hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Shield className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {t('app_name')}
                    </h1>
                    <p className="text-[10px] text-gray-500 tracking-wider">{t('tagline')}</p>
                </div>
            </div>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group
                                ${isActive
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <Icon size={20} className={isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_currentColor]"></div>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
