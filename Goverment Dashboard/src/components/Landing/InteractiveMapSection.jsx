import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Filter, Layers, AlertTriangle, Shield, Truck, Info, Navigation, ZoomIn, ZoomOut, Compass, CheckCircle2 } from 'lucide-react';
import { MAP_INCIDENTS } from '../../data/landingData';

export default function InteractiveMapSection({ onOpenDashboard }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedIncident, setSelectedIncident] = useState(MAP_INCIDENTS[0]);
    const [mapReady, setMapReady] = useState(false);

    const filterOptions = [
        { id: 'all', label: 'सभी दृश्य (All)' },
        { id: 'राजमार्ग', label: 'राजमार्ग (NH)' },
        { id: 'शहरी सड़कें', label: 'शहरी सड़कें' },
        { id: 'दुर्घटना जोखिम', label: 'दुर्घटना जोखिम' },
        { id: 'सड़क अवरोध', label: 'सड़क अवरोध' },
        { id: 'आपातकालीन सहायता', label: 'आपातकालीन सहायता' }
    ];

    const filteredIncidents = MAP_INCIDENTS.filter((item) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'राजमार्ग') return item.highway === 'राजमार्ग';
        if (activeFilter === 'शहरी सड़कें') return item.highway === 'शहरी सड़कें';
        if (activeFilter === 'दुर्घटना जोखिम') return item.category === 'दुर्घटना जोखिम';
        if (activeFilter === 'सड़क अवरोध') return item.category === 'सड़क अवरोध';
        if (activeFilter === 'आपातकालीन सहायता') return item.category === 'आपातकालीन सहायता';
        return true;
    });

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        try {
            // Center on North-Central India Highway Corridor (Delhi-NCR / Haryana / Rajasthan / UP)
            const map = L.map(mapContainerRef.current, {
                center: [28.4595, 77.0266],
                zoom: 8,
                zoomControl: false,
                attributionControl: false
            });

            // Standard OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Add custom zoom control in bottom right
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            mapInstanceRef.current = map;
            setMapReady(true);
        } catch (err) {
            console.error('Error initializing Leaflet map:', err);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update Markers when filter changes or map is ready
    useEffect(() => {
        if (!mapInstanceRef.current || !mapReady) return;

        // Clear existing markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        filteredIncidents.forEach((incident) => {
            let iconChar = '⚠';

            if (incident.type === 'pothole') {
                iconChar = '🕳';
            } else if (incident.type === 'driver') {
                iconChar = '👁';
            } else if (incident.type === 'collision') {
                iconChar = '⚡';
            } else if (incident.type === 'patrol') {
                iconChar = '🚔';
            } else if (incident.type === 'ambulance') {
                iconChar = '🚑';
            }

            const customHtml = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${incident.type === 'pothole' || incident.type === 'collision' ? '#dc2626' : incident.type === 'patrol' ? '#1e3a8a' : incident.type === 'ambulance' ? '#16a34a' : '#d97706'};
                    color: white;
                    font-size: 14px;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                ">
                    ${iconChar}
                </div>
            `;

            const customIcon = L.divIcon({
                html: customHtml,
                className: 'custom-leaflet-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = L.marker([incident.lat, incident.lng], { icon: customIcon })
                .addTo(mapInstanceRef.current);

            marker.on('click', () => {
                setSelectedIncident(incident);
                mapInstanceRef.current.setView([incident.lat, incident.lng], 11, { animate: true });
            });

            markersRef.current.push(marker);
        });
    }, [filteredIncidents, mapReady]);

    const handleSelectIncidentFromList = (incident) => {
        setSelectedIncident(incident);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([incident.lat, incident.lng], 11, { animate: true });
        }
    };

    return (
        <section
            id="map-section"
            aria-labelledby="map-section-title"
            className="w-full bg-white py-10 sm:py-14 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Section Title & Subtitle */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                            <Navigation className="w-3.5 h-3.5 text-blue-900" />
                            <span>स्थानिक टेलीमेट्री दृश्य (Spatial GIS View)</span>
                        </div>
                        <h2
                            id="map-section-title"
                            className="text-2xl sm:text-3xl font-bold text-slate-900 font-hindi"
                        >
                            सड़क एवं यातायात स्थिति मानचित्र
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            राष्ट्रीय राजमार्गों पर गड्ढों, टक्कर जोखिम, गश्ती दल एवं आपातकालीन वाहनों का लाइव स्थानिक मानचित्र
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
                            OpenStreetMap GIS
                        </span>
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                            WGS84 जीआईएस निर्देशांक (GIS Coordinates)
                        </span>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1 mr-1 shrink-0">
                        <Filter className="w-3.5 h-3.5 text-slate-500" /> फ़िल्टर:
                    </span>
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setActiveFilter(opt.id)}
                            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                activeFilter === opt.id
                                    ? 'bg-[#0f274e] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Map Grid Container: 65% Map, 35% Control & Incident Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

                    {/* Left: Leaflet Map Container (65%) */}
                    <div className="lg:col-span-8 flex flex-col rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100 min-h-[460px] relative">
                        <div
                            ref={mapContainerRef}
                            className="w-full h-[460px] sm:h-[500px] z-10"
                            aria-label="सड़क सुरक्षा अंतःक्रियात्मक मानचित्र"
                        />

                        {/* Floating Map Legend */}
                        <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-md border border-slate-300 shadow-md text-[11px] max-w-xs pointer-events-auto space-y-1.5">
                            <div className="font-bold text-slate-900 border-b pb-1 flex items-center justify-between">
                                <span>मानचित्र संकेतक (Legend)</span>
                                <span className="text-[10px] text-emerald-700 font-semibold">सक्रिय लेयर (Active Layer)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-700">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                                    <span>गड्ढा / सतह दोष</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                                    <span>अवरोध / मलबा</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                                    <span>चालक सतर्कता</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-800"></span>
                                    <span>हाईवे पेट्रोल 1033</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Status Strip on Map */}
                        <div className="bg-slate-900 text-slate-300 px-3 py-1.5 text-[11px] flex items-center justify-between z-20">
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                राष्ट्रीय राजमार्ग प्राधिकरण एवं प्रादेशिक नोड्स द्वारा संकलित लाइव स्थानिक डेटा।
                            </span>
                            <span className="font-mono text-slate-400 text-[10px]">
                                WGS84 &bull; GPS Real-time Stream Active
                            </span>
                        </div>
                    </div>

                    {/* Right: Side Control & Incident Inspector Panel (35%) */}
                    <div className="lg:col-span-4 flex flex-col space-y-4">

                        {/* Selected Incident Inspector Box */}
                        {selectedIncident && (
                            <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-200">
                                            {selectedIncident.id}
                                        </span>
                                        <h3 className="font-bold text-sm text-slate-900 font-hindi mt-1">
                                            {selectedIncident.title}
                                        </h3>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        selectedIncident.severity === 'गंभीर'
                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                            : selectedIncident.severity === 'उच्च'
                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    }`}>
                                        {selectedIncident.severity}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-700">
                                    <div className="flex items-center justify-between py-1 border-b border-blue-100">
                                        <span className="text-slate-500">स्थान खंड:</span>
                                        <span className="font-semibold">{selectedIncident.location}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-blue-100">
                                        <span className="text-slate-500">श्रेणी:</span>
                                        <span className="font-semibold">{selectedIncident.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-blue-100">
                                        <span className="text-slate-500">संबंधित इकाई:</span>
                                        <span className="font-mono font-bold text-blue-900">{selectedIncident.sampleVehicle}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-slate-500">गति प्रभाव / स्थिति:</span>
                                        <span className="font-bold text-amber-700">{selectedIncident.speedDrop}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-blue-200 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500 font-mono">
                                        {selectedIncident.lat.toFixed(4)}° N, {selectedIncident.lng.toFixed(4)}° E
                                    </span>
                                    <button
                                        onClick={onOpenDashboard}
                                        className="text-xs font-bold text-blue-900 hover:text-blue-700 underline cursor-pointer"
                                    >
                                        डैशबोर्ड में निरीक्षण &rarr;
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List of Incidents under current filter */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 flex-1 flex flex-col">
                            <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b pb-2">
                                <span>सूचीबद्ध घटनाएं ({filteredIncidents.length})</span>
                                <span className="text-[10px] text-slate-500">क्लिक कर मैप पर देखें</span>
                            </div>

                            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                                {filteredIncidents.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelectIncidentFromList(item)}
                                        className={`w-full text-left p-2 rounded border text-xs transition cursor-pointer flex items-center justify-between ${
                                            selectedIncident?.id === item.id
                                                ? 'bg-blue-50 border-blue-400 font-bold text-blue-950'
                                                : 'hover:bg-slate-50 border-slate-200 text-slate-700'
                                        }`}
                                    >
                                        <div className="truncate mr-2">
                                            <div className="font-semibold truncate">{item.title}</div>
                                            <div className="text-[10px] text-slate-500 truncate">{item.location}</div>
                                        </div>
                                        <span className="text-[10px] shrink-0 font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                            {item.severity}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
