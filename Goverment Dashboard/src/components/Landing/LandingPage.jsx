import React, { useState, useEffect } from 'react';
import TopUtilityBar from './TopUtilityBar';
import Masthead from './Masthead';
import NavigationBar from './NavigationBar';
import HeroSection from './HeroSection';
import DepartmentalGatewaysSection from './DepartmentalGatewaysSection';
import DashboardPreviewSection from './DashboardPreviewSection';
import InteractiveMapSection from './InteractiveMapSection';
import CoreCapabilitiesSection from './CoreCapabilitiesSection';
import AlertManagementSection from './AlertManagementSection';
import VehicleMonitoringSection from './VehicleMonitoringSection';
import SafetyInformationSection from './SafetyInformationSection';
import ReportsAnalyticsSection from './ReportsAnalyticsSection';
import GovernmentFooter from './GovernmentFooter';
import AuthorityLoginModal from '../Modals/AuthorityLoginModal';

export default function LandingPage({ onOpenDashboard }) {
    const [fontScale, setFontScale] = useState('100%');
    const [highContrast, setHighContrast] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [loginModal, setLoginModal] = useState({ isOpen: false, authorityId: 'nhai', stateId: 'UP' });

    // Handle Text Scaling Effect
    useEffect(() => {
        document.documentElement.style.setProperty('--text-scale', fontScale);
    }, [fontScale]);

    // Handle High Contrast Mode Effect
    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [highContrast]);

    // Smooth section scroll handler
    const handleNavigateSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            const yOffset = -70; // Header offset
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-800 selection:text-white">

            {/* Skip to Content Target Anchor */}
            <div id="main-content" className="sr-only">मुख्य सामग्री प्रारंभ</div>

            {/* 1. Thin Top Utility Bar */}
            <TopUtilityBar
                fontScale={fontScale}
                setFontScale={setFontScale}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
            />

            {/* 2. Formal Masthead with Ashoka Chakra & Title */}
            <Masthead />

            {/* 3. Navy Blue Navigation Bar */}
            <NavigationBar
                onOpenDashboard={() => onOpenDashboard({ authorityId: 'nhai' })}
                activeSection={activeSection}
                onNavigateSection={handleNavigateSection}
                onSelectAuthorityLogin={(authId, stateId) => setLoginModal({ isOpen: true, authorityId: authId, stateId: stateId || 'UP' })}
            />

            {/* Main Landing Sections */}
            <main className="flex-1">
                {/* 4. Hero Section */}
                <HeroSection
                    onOpenDashboard={() => setLoginModal({ isOpen: true, authorityId: 'nhai', stateId: 'UP' })}
                    onNavigateSection={handleNavigateSection}
                />

                {/* 4.5. Departmental Gateways Section (NHAI, State Authorities, Nagar Nigam) */}
                <DepartmentalGatewaysSection
                    onSelectAuthorityLogin={(authId, stateId) => setLoginModal({ isOpen: true, authorityId: authId, stateId: stateId || 'UP' })}
                />

                {/* 5. Live Road Safety Dashboard Preview */}
                <DashboardPreviewSection
                    onOpenDashboard={() => onOpenDashboard({ authorityId: 'nhai' })}
                />

                {/* 6. Interactive Road Monitoring Map */}
                <InteractiveMapSection
                    onOpenDashboard={() => onOpenDashboard({ authorityId: 'nhai' })}
                />

                {/* 7. Core Capabilities Section */}
                <CoreCapabilitiesSection />

                {/* 8. Alert Management Table */}
                <AlertManagementSection
                    onOpenDashboard={() => onOpenDashboard({ authorityId: 'nhai' })}
                />

                {/* 9. Vehicle Monitoring Panel */}
                <VehicleMonitoringSection
                    onOpenDashboard={() => onOpenDashboard({ authorityId: 'nhai' })}
                />

                {/* 10. National Road Safety Information */}
                <SafetyInformationSection />

                {/* 11. Reports and Analytics */}
                <ReportsAnalyticsSection />
            </main>

            {/* 13. Government Style Detailed Footer */}
            <GovernmentFooter onNavigateSection={handleNavigateSection} />

            {/* 14. Departmental Login Gateway Modal with State Selection */}
            <AuthorityLoginModal
                authorityId={loginModal.authorityId}
                initialStateId={loginModal.stateId}
                isOpen={loginModal.isOpen}
                onClose={() => setLoginModal({ ...loginModal, isOpen: false })}
                onLoginSuccess={(authDetails) => {
                    setLoginModal({ isOpen: false, authorityId: 'nhai', stateId: 'UP' });
                    onOpenDashboard(authDetails);
                }}
            />

        </div>
    );
}
