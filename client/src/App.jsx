import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EditProfile from './components/EditProfile';
import ProfileHome from './components/ProfileHome';

import Emergency from './components/Emergency';
import Dashboard from './components/Dashboard';
import RoadMonitor from './components/RoadMonitor';
import Incidents from './components/Incidents';
import GovDashboard from './components/GovDashboard'; // Import new component
import AIChat from './components/AIChat';
import { LanguageProvider } from './contexts/LanguageContext';

function MainApp() {
    const [view, setView] = useState('login');
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
        setView('profile-home');
    };

    const handleLogout = () => {
        setUser(null);
        setView('login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/40 blur-[100px] animate-pulse"></div>
                <div className="absolute top-[40%] right-[0%] w-[40%] h-[40%] rounded-full bg-blue-900/40 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-pink-900/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Show Navbar when logged in */}
            {user && (
                <>
                    <Navbar
                        user={user}
                        onLogout={handleLogout}
                        onEditProfile={() => setView('profile-home')}
                    />
                    <Sidebar activeTab={view} onTabChange={setView} />
                    <AIChat />
                </>
            )}

            <div className={`transition-all duration-500 z-10 
                ${user ? 'px-4 md:pl-72 pt-24 w-full' : 'w-full max-w-md'} 
                ${(view === 'dashboard' || view === 'profile-home' || view === 'edit-profile') && !user ? 'max-w-5xl' : ''}
            `}>
                {view === 'login' && (
                    <Login
                        onSwitch={() => setView('signup')}
                        onLogin={handleLogin}
                    />
                )}

                {view === 'signup' && (
                    <Signup onSwitch={() => setView('login')} />
                )}

                {/* Authenticated Views */}
                {view === 'profile-home' && (
                    <ProfileHome
                        user={user}
                        onEditProfile={() => setView('edit-profile')}
                        onSettings={() => setView('edit-profile')}
                        onActivity={() => alert('Activity module coming soon!')}
                        onLogout={handleLogout}
                    />
                )}

                {view === 'edit-profile' && (
                    <EditProfile
                        user={user}
                        onCancel={() => setView('profile-home')}
                        onUpdate={(updatedUser) => {
                            setUser(updatedUser);
                            setView('profile-home');
                        }}
                    />
                )}

                {/* Dashboard Analytics */}
                {view === 'dashboard' && (
                    <Dashboard />
                )}

                {/* Road Monitor */}
                {view === 'road-monitor' && (
                    <RoadMonitor />
                )}

                {/* Emergency Module */}
                {view === 'emergency' && (
                    <Emergency />
                )}

                {/* Other Placeholders */}
                {view === 'incidents' && (
                    <Incidents />
                )}

                {/* Data Management / Gov Dashboard */}
                {view === 'gov-dashboard' && (
                    <GovDashboard />
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <LanguageProvider>
            <MainApp />
        </LanguageProvider>
    );
}
