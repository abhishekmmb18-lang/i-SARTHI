import React, { useState, useEffect, useCallback, useMemo, Component } from 'react';
import Header from './components/Header';
import DashboardSidebar from './components/Dashboard/DashboardSidebar';
import OverviewTab from './components/Dashboard/OverviewTab';
import StateRoadsTab from './components/Dashboard/StateRoadsTab';
import MunicipalRoadsTab from './components/Dashboard/MunicipalRoadsTab';
import RoadMapTab from './components/Map/RoadMapTab';
import RoadIncidentsTab from './components/Incidents/RoadIncidentsTab';
import HazardClustersTab from './components/Clusters/HazardClustersTab';
import DriverSafetyTab from './components/Safety/DriverSafetyTab';
import DeviceFleetTab from './components/Devices/DeviceFleetTab';
import ReportsTab from './components/Reports/ReportsTab';
import IncidentDrawer from './components/Modals/IncidentDrawer';
import WorkOrderModal from './components/Modals/WorkOrderModal';
import LandingPage from './components/Landing/LandingPage';
import { AUTHORITIES } from './data/authoritiesData';
import {
    loadPortalTelemetry,
    executeIncidentAction
} from './services/telemetryStore';
import { subscribeToSupabaseRealtime } from './services/supabase';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Official Error Boundary to prevent blank white screens
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Portal Error Boundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                    <div className="gov-card p-8 max-w-lg w-full text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            iSARTHI Portal Interface Notice
                        </h2>
                        <p className="text-xs text-slate-600">
                            The telemetry interface encountered an unexpected render state:
                        </p>
                        <div className="p-3 bg-slate-100 rounded text-left font-mono text-[11px] text-slate-700 overflow-x-auto">
                            {this.state.error?.message || 'Unknown render exception'}
                        </div>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition cursor-pointer"
                        >
                            Reset &amp; Reload Portal
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'dashboard'
    const [activeAuthority, setActiveAuthority] = useState(AUTHORITIES.nhai);
    const [currentSection, setCurrentSection] = useState('nhai'); // 'nhai' | 'state' | 'municipal' | 'safety'
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentRole, setCurrentRole] = useState('Administrator');
    const [telemetryData, setTelemetryData] = useState({
        source: 'INITIALIZING',
        timestamp: new Date().toISOString(),
        roadEvents: [],
        clusters: [],
        drowsinessBundles: [],
        sensorLogs: [],
        devices: [],
        auditTrail: []
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(new Date());
    const [isStale, setIsStale] = useState(false);

    // Modal / Drawer state
    const [inspectingIncident, setInspectingIncident] = useState(null);
    const [inspectingCluster, setInspectingCluster] = useState(null);

    // Load data from store (Supabase + local hardware buffer)
    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        try {
            const data = await loadPortalTelemetry();
            setTelemetryData(data);
            setLastSyncTime(new Date());
            setIsStale(false);
        } catch (err) {
            console.error('Error fetching portal telemetry:', err);
        } finally {
            setLoading(false);
            if (isManualRefresh) setRefreshing(false);
        }
    }, []);

    // Initial load and polling loop
    useEffect(() => {
        fetchData();

        // 5-second polling interval
        const pollTimer = setInterval(() => {
            fetchData();
        }, 5000);

        // Stale checker interval (flags stale if last sync > 30s)
        const staleTimer = setInterval(() => {
            if (Date.now() - new Date(lastSyncTime).getTime() > 30000) {
                setIsStale(true);
            }
        }, 5000);

        // Supabase Realtime WebSocket subscription
        const unsubscribeRealtime = subscribeToSupabaseRealtime((payload) => {
            console.log('⚡ Live Supabase Change Event:', payload);
            fetchData();
        });

        return () => {
            clearInterval(pollTimer);
            clearInterval(staleTimer);
            unsubscribeRealtime();
        };
    }, [fetchData, lastSyncTime]);

    // Handle Official Action execution
    const handleExecuteIncidentAction = async (payload) => {
        const result = await executeIncidentAction(payload);
        await fetchData();
        return result;
    };

    // Handle Login from Departmental Gateways (NHAI, State Authorities, Nagar Nigam, Driver DMS)
    const handleLoginToAuthority = (authDetails = {}) => {
        const authId = authDetails.authorityId || authDetails.authority?.id || 'nhai';
        const baseAuth = AUTHORITIES[authId] || AUTHORITIES.nhai;
        const mergedAuth = {
            ...baseAuth,
            selectedState: authDetails.selectedState || null,
            officerName: authDetails.officerName || baseAuth.demoCredentials?.officerName,
            departmentName: authDetails.selectedState ? authDetails.selectedState.departmentName : baseAuth.divisionHindi
        };
        setActiveAuthority(mergedAuth);
        if (baseAuth.dashboardRole) {
            setCurrentRole(baseAuth.dashboardRole);
        }
        if (authId === 'state') {
            setCurrentSection('state');
            setActiveTab('overview');
        } else if (authId === 'nagarnigam') {
            setCurrentSection('municipal');
            setActiveTab('overview');
        } else if (authId === 'safety') {
            setCurrentSection('safety');
            setActiveTab('safety');
        } else {
            setCurrentSection('nhai');
            setActiveTab('overview');
        }
        setViewMode('dashboard');
    };

    // When switching section: synchronize active authority, role, and view mode strictly
    const handleChangeSection = (sectionId) => {
        setCurrentSection(sectionId);
        if (sectionId === 'nhai') {
            setActiveAuthority(AUTHORITIES.nhai);
            setCurrentRole(AUTHORITIES.nhai.dashboardRole || 'Administrator');
            setActiveTab('overview');
        } else if (sectionId === 'state') {
            setActiveAuthority(AUTHORITIES.state);
            setCurrentRole(AUTHORITIES.state.dashboardRole || 'State / District Official');
            setActiveTab('overview');
        } else if (sectionId === 'municipal') {
            setActiveAuthority(AUTHORITIES.nagarnigam);
            setCurrentRole(AUTHORITIES.nagarnigam.dashboardRole || 'Field Inspector');
            setActiveTab('overview');
        } else if (sectionId === 'safety') {
            setActiveAuthority(AUTHORITIES.safety);
            setCurrentRole(AUTHORITIES.safety.dashboardRole || 'Fleet Safety Inspector');
            setActiveTab('safety');
        }
    };

    const handleSwitchAuthority = () => {
        setViewMode('landing');
        setTimeout(() => {
            const el = document.getElementById('departmental-gateways');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
    };

    // Scoped road events dynamically shaped per active authority section
    const scopedEvents = useMemo(() => {
        const raw = telemetryData.roadEvents || [];
        const stateName = activeAuthority?.selectedState?.nameHindi?.split(' ')[0] || 'राज्य';
        const stateDept = activeAuthority?.selectedState ? activeAuthority.selectedState.departmentName.split(' ')[0] : 'State PWD';

        if (currentSection === 'state') {
            // STRICTLY State PWD road defects: NO Alcohol, NO SOS, NO National Highway PIU
            const roadOnly = raw.filter(e => !e.type?.includes('Alcohol') && !e.type?.includes('SOS') && !e.sos_alert);
            return roadOnly.map((evt, idx) => ({
                ...evt,
                type: evt.type || (evt.vibration > 3.5 ? 'गंभीर सड़क झटका (Critical Vibration)' : 'गड्ढा (Pothole)'),
                road_name: evt.road_name || (idx % 3 === 0
                    ? `${stateName} स्टेट हाईवे SH-25 (KM ${12 + (idx % 40)})`
                    : idx % 3 === 1
                    ? `${stateName} जिला मुख्य मार्ग MDR-42 (सेक्टर ${1 + (idx % 18)})`
                    : `${stateName} प्रमुख संपर्क सड़क (तालुका लिंक)`),
                district: evt.district || activeAuthority?.selectedState?.headquarters || `${stateName} सर्कल`,
                assigned_authority: evt.assigned_authority || `${stateDept} डिवीजन ${1 + (idx % 4)}`,
                resolution_status: evt.resolution_status || (evt.verification_status?.includes('Verified') ? 'PWD कार्य आदेश जारी' : 'सत्यापन प्रक्रियाधीन')
            }));
        }

        if (currentSection === 'municipal') {
            // STRICTLY Municipal Ward road defects: Urban streets, waterlogging
            const wardOnly = raw.filter(e => !e.type?.includes('Alcohol') && !e.type?.includes('SOS') && !e.sos_alert);
            return wardOnly.map((evt, idx) => ({
                ...evt,
                type: evt.type || (idx % 4 === 0 ? 'मानसून जलभराव (Waterlogging)' : 'शहरी वार्ड गड्ढा (Ward Pothole)'),
                road_name: evt.road_name || `वार्ड ${1 + (idx % 35)} (${idx % 2 === 0 ? 'मुख्य बाजार रोड' : 'आंतरिक वार्ड गली'})`,
                district: evt.district || 'शहरी नगरपालिका क्षेत्र',
                assigned_authority: evt.assigned_authority || 'नगर निगम वार्ड रखरखाव सेल',
                resolution_status: evt.resolution_status || (idx % 3 === 0 ? 'मरम्मत दल भेजा गया' : 'शिकायत दर्ज')
            }));
        }

        if (currentSection === 'safety') {
            // STRICTLY Driver & Fleet DMS emergency incidents (Alcohol, SOS, Driver Telemetry)
            const safetyOnly = raw.filter(e => e.type?.includes('Alcohol') || e.type?.includes('SOS') || e.sos_alert || e.alcohol > 0);
            return safetyOnly.map((evt) => ({
                ...evt,
                road_name: evt.road_name || 'वाणिज्यिक फ्लीट गलियारा',
                assigned_authority: evt.assigned_authority || 'SRTC चालक सुरक्षा सेल'
            }));
        }

        // NHAI: Strictly National Highway road hazards & Expressways (NO Alcohol, NO SOS in highway road hazards)
        const nhRoadHazards = raw.filter(e => !e.type?.includes('Alcohol') && !e.type?.includes('SOS') && !e.sos_alert);
        return nhRoadHazards.map((evt, idx) => ({
            ...evt,
            type: evt.type || (evt.vibration > 4.0 ? 'गंभीर ब्लैकस्पॉट डिप्रेशन (Structural Depression)' : 'राजमार्ग गड्ढा (Highway Pothole)'),
            road_name: evt.road_name || (idx % 2 === 0 ? 'NH-44 (दिल्ली-जयपुर एक्सप्रेसवे, KM 142)' : 'NH-48 (मुंबई-पुणे एक्सप्रेसवे)'),
            district: evt.district || (idx % 2 === 0 ? 'जयपुर / दिल्ली-एनसीआर' : 'पुणे-मुंबई एक्सप्रेसवे'),
            assigned_authority: evt.assigned_authority?.includes('NHAI') ? evt.assigned_authority : `NHAI PIU Corridor ${1 + (idx % 5)}`,
            resolution_status: evt.resolution_status || (evt.verification_status?.includes('Verified') ? 'NHAI मरम्मत कार्य प्रगति पर' : '1033 सत्यापन प्रक्रियाधीन')
        }));
    }, [telemetryData.roadEvents, currentSection, activeAuthority]);

    // Scoped clusters tailored strictly to active administrative section
    const scopedClusters = useMemo(() => {
        const rawClusters = telemetryData.clusters || [];
        const stateName = activeAuthority?.selectedState?.nameHindi?.split(' ')[0] || 'राज्य';
        const stateDept = activeAuthority?.selectedState ? activeAuthority.selectedState.departmentName.split(' ')[0] : 'State PWD';

        if (currentSection === 'state') {
            return rawClusters.map((cl, idx) => ({
                ...cl,
                road_name: idx % 2 === 0 ? `${stateName} स्टेट हाईवे SH-25 (KM ${14 + idx * 8})` : `${stateName} जिला मुख्य मार्ग MDR-42`,
                division: `${stateDept} डिवीजन ${1 + (idx % 4)}`,
                assigned_authority: `${stateDept} अधिशासी अभियंता`,
                cluster_label: `PWD क्लस्टर #${cl.cluster_id}`
            }));
        }

        if (currentSection === 'municipal') {
            return rawClusters.map((cl, idx) => ({
                ...cl,
                road_name: `वार्ड ${1 + (idx % 35)} आंतरिक मुख्य मार्ग`,
                division: 'नगर निगम रखरखाव सेल',
                assigned_authority: 'नगर निगम वार्ड अभियंता',
                cluster_label: `वार्ड मरम्मत क्लस्टर #${cl.cluster_id}`
            }));
        }

        return rawClusters.map((cl, idx) => ({
            ...cl,
            road_name: cl.road_name || (idx % 2 === 0 ? 'NH-44 (दिल्ली-जयपुर एक्सप्रेसवे, KM 142)' : 'NH-48 (मुंबई-पुणे एक्सप्रेसवे)'),
            assigned_authority: 'NHAI PIU / MoRTH परियोजना इकाई',
            cluster_label: `NHAI ब्लैकस्पॉट #${cl.cluster_id}`
        }));
    }, [telemetryData.clusters, currentSection, activeAuthority]);

    // Scoped telemetry dataset ensuring each section receives ONLY their scoped data
    const scopedTelemetryData = useMemo(() => {
        return {
            ...telemetryData,
            roadEvents: scopedEvents,
            clusters: scopedClusters,
            drowsinessBundles: currentSection === 'safety' ? telemetryData.drowsinessBundles : []
        };
    }, [telemetryData, scopedEvents, scopedClusters, currentSection]);

    return (
        <ErrorBoundary>
            {viewMode === 'landing' ? (
                <LandingPage onOpenDashboard={handleLoginToAuthority} />
            ) : (
                <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">

                    {/* Light-themed Official Government Header */}
                    <Header
                        telemetryData={telemetryData}
                        lastSyncTime={lastSyncTime}
                        isStale={isStale}
                        refreshing={refreshing}
                        onRefresh={() => fetchData(true)}
                        currentRole={currentRole}
                        setCurrentRole={setCurrentRole}
                        onBackToLanding={() => setViewMode('landing')}
                        activeAuthority={activeAuthority}
                        onSwitchAuthority={handleSwitchAuthority}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
                    />

                    {/* Dashboard Layout: Left Sidebar + Right Main Content */}
                    <div className="flex-1 flex w-full">
                        {/* Left Dashboard Sidebar */}
                        <DashboardSidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            currentSection={currentSection}
                            onChangeSection={handleChangeSection}
                            telemetryData={scopedTelemetryData}
                            activeAuthority={activeAuthority}
                            currentRole={currentRole}
                            isCollapsed={isSidebarCollapsed}
                            onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
                        />

                        {/* Right Main Application Shell */}
                        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-28 space-y-3">
                                    <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
                                    <div className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                                        Connecting to iSARTHI National Telemetry Gateway...
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-7xl mx-auto space-y-6">
                                    {/* OVERVIEW TAB: Renders dedicated page per administrative section */}
                                    {activeTab === 'overview' && (
                                        currentSection === 'state' ? (
                                            <StateRoadsTab
                                                telemetryData={scopedTelemetryData}
                                                activeAuthority={activeAuthority}
                                                onNavigateTab={setActiveTab}
                                                onSelectIncident={setInspectingIncident}
                                                onSelectCluster={setInspectingCluster}
                                            />
                                        ) : currentSection === 'municipal' ? (
                                            <MunicipalRoadsTab
                                                telemetryData={scopedTelemetryData}
                                                activeAuthority={activeAuthority}
                                                onNavigateTab={setActiveTab}
                                                onSelectIncident={setInspectingIncident}
                                                onSelectCluster={setInspectingCluster}
                                            />
                                        ) : currentSection === 'safety' ? (
                                            <DriverSafetyTab
                                                bundles={telemetryData.drowsinessBundles}
                                                currentRole={currentRole}
                                            />
                                        ) : (
                                            <OverviewTab
                                                telemetryData={scopedTelemetryData}
                                                loading={loading}
                                                isStale={isStale}
                                                lastSyncTime={lastSyncTime}
                                                onNavigateTab={setActiveTab}
                                                onSelectIncident={setInspectingIncident}
                                                onSelectCluster={setInspectingCluster}
                                            />
                                        )
                                    )}

                                    {activeTab === 'map' && (
                                        <RoadMapTab
                                            events={scopedEvents}
                                            clusters={scopedClusters}
                                            onSelectIncident={setInspectingIncident}
                                            onSelectCluster={setInspectingCluster}
                                        />
                                    )}

                                    {activeTab === 'incidents' && (
                                        <RoadIncidentsTab
                                            events={scopedEvents}
                                            onSelectIncident={setInspectingIncident}
                                            auditTrail={telemetryData.auditTrail}
                                            currentRole={currentRole}
                                            currentSection={currentSection}
                                            activeAuthority={activeAuthority}
                                        />
                                    )}

                                    {activeTab === 'clusters' && (
                                        <HazardClustersTab
                                            clusters={scopedClusters}
                                            onSelectCluster={setInspectingCluster}
                                            currentSection={currentSection}
                                            activeAuthority={activeAuthority}
                                        />
                                    )}

                                    {activeTab === 'safety' && (
                                        <DriverSafetyTab
                                            bundles={telemetryData.drowsinessBundles}
                                            currentRole={currentRole}
                                        />
                                    )}

                                    {activeTab === 'devices' && (
                                        <DeviceFleetTab
                                            devices={telemetryData.devices}
                                            onRefreshDevices={() => fetchData(true)}
                                        />
                                    )}

                                    {activeTab === 'reports' && (
                                        <ReportsTab
                                            telemetryData={scopedTelemetryData}
                                        />
                                    )}
                                </div>
                            )}
                        </main>
                    </div>

                {/* Incident Drawer for Inspection and Official Actions */}
                {inspectingIncident && (
                    <IncidentDrawer
                        incident={inspectingIncident}
                        onClose={() => setInspectingIncident(null)}
                        onExecuteAction={handleExecuteIncidentAction}
                        currentRole={currentRole}
                    />
                )}

                {/* Work Order Modal */}
                {inspectingCluster && (
                    <WorkOrderModal
                        cluster={inspectingCluster}
                        onClose={() => setInspectingCluster(null)}
                        currentSection={currentSection}
                        activeAuthority={activeAuthority}
                    />
                )}

                {/* Official Government Portal Footer */}
                <footer className="w-full bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                                🇮🇳
                            </div>
                            <div>
                                <div className="font-semibold text-slate-800">
                                    Ministry of Road Transport & Highways (MoRTH) &bull; National Highways Authority of India (NHAI)
                                </div>
                                <div className="text-slate-400 text-[11px] mt-0.5">
                                    iSARTHI Operational Highway Condition Intelligence &amp; Edge Hardware Gateway
                                </div>
                            </div>
                        </div>

                        <div className="text-center md:text-right text-[11px] text-slate-400 space-y-0.5">
                            <div>Real-Time Telemetry Pipeline &bull; Edge AI Defect Classification</div>
                            <div>Role-Based Access Control Active &bull; National Highway Corridor Monitoring</div>
                        </div>
                    </div>
                </footer>

            </div>
            )}
        </ErrorBoundary>
    );
}
