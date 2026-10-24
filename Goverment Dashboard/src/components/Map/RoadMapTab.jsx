import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
    Search,
    Filter,
    Layers,
    Table,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    ArrowUpDown,
    ExternalLink,
    Compass,
    X,
    Flame,
    Clock
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export default function RoadMapTab({
    events = [],
    clusters = [],
    onSelectIncident,
    onSelectCluster
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);

    const [viewMode, setViewMode] = useState('map'); // 'map' or 'table'
    const [displayType, setDisplayType] = useState('clusters'); // 'clusters' or 'individual'

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');
    const [selectedSeverity, setSelectedSeverity] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    // Filter valid incidents with coordinates
    const validEvents = events.filter(e => {
        const lat = parseFloat(e.latitude);
        const lng = parseFloat(e.longitude);
        return !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0);
    });

    // Apply filtering
    const filteredEvents = validEvents.filter(evt => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchRoad = (evt.road_name || '').toLowerCase().includes(q);
            const matchDistrict = (evt.district || '').toLowerCase().includes(q);
            const matchId = String(evt.id || '').includes(q);
            if (!matchRoad && !matchDistrict && !matchId) return false;
        }

        if (selectedState !== 'ALL' && evt.state !== selectedState) return false;

        if (selectedType !== 'ALL') {
            const t = (evt.type || '').toLowerCase();
            if (selectedType === 'Pothole' && !t.includes('pothole') && !(evt.vibration > 2.5)) return false;
            if (selectedType === 'Cracks' && !t.includes('crack') && !t.includes('surface')) return false;
            if (selectedType === 'Waterlogging' && !t.includes('water')) return false;
            if (selectedType === 'SOS' && !t.includes('sos') && !evt.sos_alert) return false;
        }

        if (selectedSeverity !== 'ALL' && evt.severity !== selectedSeverity) return false;

        if (selectedStatus !== 'ALL') {
            if (selectedStatus === 'Verified' && !evt.verification_status?.includes('Verified')) return false;
            if (selectedStatus === 'Pending' && !evt.verification_status?.includes('Pending')) return false;
        }

        return true;
    });

    const filteredClusters = clusters.filter(cl => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchRoad = (cl.road_name || '').toLowerCase().includes(q);
            const matchId = (cl.cluster_id || '').toLowerCase().includes(q);
            if (!matchRoad && !matchId) return false;
        }
        if (selectedSeverity !== 'ALL') {
            if (selectedSeverity === 'Critical' && cl.ai_severity_score < 8.0) return false;
            if (selectedSeverity === 'High' && (cl.ai_severity_score < 6.0 || cl.ai_severity_score >= 8.0)) return false;
        }
        if (selectedStatus !== 'ALL') {
            if (selectedStatus === 'Verified' && !cl.verification_status?.includes('Verified')) return false;
            if (selectedStatus === 'Pending' && !cl.verification_status?.includes('Pending')) return false;
        }
        return true;
    });

    // Initialize Leaflet Map with safe double-mount prevention
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        try {
            if (mapContainerRef.current._leaflet_id) {
                delete mapContainerRef.current._leaflet_id;
            }

            const map = L.map(mapContainerRef.current, {
                center: [26.823287, 75.866808],
                zoom: 6,
                zoomControl: true,
                scrollWheelZoom: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors | MoRTH / NHAI iSARTHI Telemetry',
                maxZoom: 19
            }).addTo(map);

            const markersLayer = L.layerGroup().addTo(map);
            markersLayerRef.current = markersLayer;
            mapInstanceRef.current = map;
        } catch (err) {
            console.warn('Leaflet initialization warning:', err);
        }

        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (e) {
                    console.warn('Leaflet cleanup warning:', e);
                }
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Invalidate size when view toggled to map
    useEffect(() => {
        if (viewMode === 'map' && mapInstanceRef.current) {
            setTimeout(() => {
                try {
                    mapInstanceRef.current?.invalidateSize();
                } catch (e) {
                    // ignore
                }
            }, 100);
        }
    }, [viewMode]);

    // Render Markers on Map based on filter and displayType
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersLayer = markersLayerRef.current;
        if (!map || !markersLayer) return;

        try {
            markersLayer.clearLayers();
            const bounds = L.latLngBounds([]);

            if (displayType === 'clusters') {
                filteredClusters.forEach(cl => {
                    const isCritical = cl.ai_severity_score >= 8.0;
                    const isVerified = cl.verification_status?.includes('Verified');

                    const pinColor = isCritical ? '#dc2626' : '#d97706';
                    const ringColor = isVerified ? '#16a34a' : '#64748b';

                    const icon = L.divIcon({
                        className: 'custom-leaflet-pin',
                        html: `
                            <div style="
                                position: relative;
                                width: 38px;
                                height: 38px;
                                background-color: ${pinColor};
                                border: 3px solid #ffffff;
                                outline: 2px solid ${ringColor};
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-size: 11px;
                                font-weight: bold;
                                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                                cursor: pointer;
                            ">
                                <span>${cl.distinct_devices?.length || 10}x</span>
                                ${isVerified ? '<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #16a34a; border-radius: 50%; border: 1.5px solid white;"></span>' : ''}
                            </div>
                        `,
                        iconSize: [38, 38],
                        iconAnchor: [19, 19]
                    });

                    const marker = L.marker([cl.center_lat, cl.center_lng], { icon });

                    const popupContent = `
                        <div style="font-family: Inter, sans-serif; min-width: 240px; padding: 4px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
                                <span style="font-size: 11px; font-weight: 700; color: #1e3a8a;">HAZARD CLUSTER</span>
                                <span style="font-size: 10px; font-weight: 700; background: ${isVerified ? '#dcfce7' : '#fef3c7'}; color: ${isVerified ? '#15803d' : '#92400e'}; padding: 2px 6px; border-radius: 4px;">
                                    ${cl.verification_status}
                                </span>
                            </div>
                            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                                ${cl.cluster_id}
                            </div>
                            <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
                                ${cl.road_name || 'Highway Corridor'}
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">
                                <div>Peak Shock: <b style="color: #dc2626;">${cl.max_vibration} G</b></div>
                                <div>Vehicles: <b>${cl.distinct_devices?.length || 10} passes</b></div>
                                <div>Severity: <b>${cl.ai_severity_score}/10</b></div>
                                <div>Avg Speed: <b>${cl.avg_speed || 48} km/h</b></div>
                            </div>
                            <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-bottom: 4px;">
                                Lat: ${cl.center_lat.toFixed(4)}° | Lng: ${cl.center_lng.toFixed(4)}°
                            </div>
                            <div style="font-size: 10px; color: #1e3a8a; background: #eff6ff; padding: 3px 6px; border-radius: 4px; font-weight: 600; border: 1px solid #bfdbfe;">
                                📅 समय व दिनांक: ${formatDateTime(cl.most_recent || cl.created_at || cl.timestamp)}
                            </div>
                        </div>
                    `;

                    marker.bindPopup(popupContent);
                    marker.on('click', () => {
                        if (onSelectCluster) onSelectCluster(cl);
                    });

                    markersLayer.addLayer(marker);
                    bounds.extend([cl.center_lat, cl.center_lng]);
                });
            } else {
                // Individual incident pins (Show ALL real sensor events)
                filteredEvents.forEach(evt => {
                    const isCritical = evt.severity === 'Critical' || (evt.vibration > 4.5);
                    const isWarning = evt.severity === 'High' || (evt.vibration > 3.0);
                    const pinColor = isCritical ? '#dc2626' : isWarning ? '#d97706' : '#0d9488';

                    const icon = L.divIcon({
                        className: 'custom-leaflet-single-pin',
                        html: `
                            <div style="
                                width: 24px;
                                height: 24px;
                                background-color: ${pinColor};
                                border: 2px solid #ffffff;
                                border-radius: 50%;
                                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                                cursor: pointer;
                            "></div>
                        `,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    const marker = L.marker([evt.latitude, evt.longitude], { icon });

                    marker.bindPopup(`
                        <div style="font-family: Inter, sans-serif; min-width: 220px;">
                            <b style="font-size: 12px; color: #0f172a;">#${evt.id} • ${evt.type}</b>
                            <div style="font-size: 11px; color: #475569; margin: 4px 0;">${evt.road_name}</div>
                            <div style="font-size: 11px; color: #dc2626; font-weight: 600; margin-bottom: 4px;">Shock: ${evt.vibration || 0} G</div>
                            <div style="font-size: 10px; color: #1e3a8a; background: #eff6ff; padding: 3px 6px; border-radius: 4px; font-weight: 600; border: 1px solid #bfdbfe;">
                                📅 समय व दिनांक: ${formatDateTime(evt.created_at || evt.timestamp)}
                            </div>
                        </div>
                    `);

                    marker.on('click', () => {
                        if (onSelectIncident) onSelectIncident(evt);
                    });

                    markersLayer.addLayer(marker);
                    bounds.extend([evt.latitude, evt.longitude]);
                });
            }

            if (bounds.isValid() && (filteredClusters.length > 0 || filteredEvents.length > 0)) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        } catch (e) {
            console.warn('Marker rendering warning:', e);
        }
    }, [filteredClusters, filteredEvents, displayType]);

    return (
        <div className="space-y-4">

            {/* Filter and Controls Header */}
            <div className="gov-card p-4 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search Highway (e.g. NH-44), District, or Incident ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Mode Toggles */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Clusters vs Individual */}
                        <div className="flex items-center rounded-lg border border-slate-300 bg-slate-100 p-0.5 text-xs font-semibold">
                            <button
                                onClick={() => setDisplayType('clusters')}
                                className={`px-3 py-1 rounded-md transition cursor-pointer ${displayType === 'clusters'
                                        ? 'bg-white text-blue-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Hazard Clusters ({filteredClusters.length})
                            </button>
                            <button
                                onClick={() => setDisplayType('individual')}
                                className={`px-3 py-1 rounded-md transition cursor-pointer ${displayType === 'individual'
                                        ? 'bg-white text-blue-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                All Raw Events ({filteredEvents.length})
                            </button>
                        </div>

                        {/* Map vs Table View */}
                        <div className="flex items-center rounded-lg border border-slate-300 bg-slate-100 p-0.5 text-xs font-semibold">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${viewMode === 'map'
                                        ? 'bg-white text-blue-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <Compass className="w-3.5 h-3.5" />
                                <span>Map View</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${viewMode === 'table'
                                        ? 'bg-white text-blue-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <Table className="w-3.5 h-3.5" />
                                <span>Table View</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5" />
                        Filters:
                    </span>

                    {/* State Filter */}
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-hidden"
                    >
                        <option value="ALL">All States</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Delhi">Delhi NCR</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                    </select>

                    {/* Incident Type Filter */}
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-hidden"
                    >
                        <option value="ALL">All Hazard Types</option>
                        <option value="Pothole">Potholes &amp; Cavities</option>
                        <option value="Cracks">Road Cracks &amp; Depressions</option>
                        <option value="Waterlogging">Waterlogging</option>
                        <option value="SOS">Emergency SOS Signals</option>
                    </select>

                    {/* Severity Filter */}
                    <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-hidden"
                    >
                        <option value="ALL">All Severities</option>
                        <option value="Critical">Critical (&gt; 4.5G)</option>
                        <option value="High">High (3.0G - 4.5G)</option>
                        <option value="Medium">Medium</option>
                    </select>

                    {/* Verification Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-hidden"
                    >
                        <option value="ALL">All Verification Statuses</option>
                        <option value="Verified">10x Verified</option>
                        <option value="Pending">Pending Verification</option>
                    </select>

                    {(searchQuery || selectedState !== 'ALL' || selectedType !== 'ALL' || selectedSeverity !== 'ALL' || selectedStatus !== 'ALL') && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedState('ALL');
                                setSelectedType('ALL');
                                setSelectedSeverity('ALL');
                                setSelectedStatus('ALL');
                            }}
                            className="text-xs text-rose-700 hover:underline font-semibold ml-auto cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Map Container - preserved in DOM to prevent reinitialization crashes */}
            <div className={`gov-card overflow-hidden relative ${viewMode === 'map' ? 'block' : 'hidden'}`}>
                {/* Map Canvas */}
                <div
                    ref={mapContainerRef}
                    className="w-full h-[620px] bg-slate-100"
                    style={{ minHeight: '620px' }}
                />

                {/* Map Legend Floating Widget */}
                <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5 pointer-events-auto">
                    <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
                        Map Severity &amp; Verification Legend
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white"></span>
                        <span className="text-slate-600">Critical Hazard (Peak Shock &gt; 4.5G)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white"></span>
                        <span className="text-slate-600">Warning / Pavement Depression</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-teal-600 border border-white"></span>
                        <span className="text-slate-600">Moderate Road Surface Defect</span>
                    </div>
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 outline-2 outline-emerald-700"></span>
                        <span className="text-slate-800 font-semibold">10x Verified by Independent Vehicles</span>
                    </div>
                </div>
            </div>

            {/* Tabular Scrutiny View */}
            <div className={`gov-card overflow-hidden ${viewMode === 'table' ? 'block' : 'hidden'}`}>
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">
                        Tabular Road Hazard Ledger ({filteredEvents.length} Matched Incidents)
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Incident ID</th>
                                <th className="px-4 py-3">Date &amp; Time (समय व दिनांक)</th>
                                <th className="px-4 py-3">Hazard Type</th>
                                <th className="px-4 py-3">Corridor &amp; Location</th>
                                <th className="px-4 py-3">GPS Coordinates</th>
                                <th className="px-4 py-3">Shock (G-Force)</th>
                                <th className="px-4 py-3">Severity</th>
                                <th className="px-4 py-3">Verification</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredEvents.map((evt) => (
                                <tr
                                    key={evt.id}
                                    onClick={() => onSelectIncident(evt)}
                                    className="hover:bg-blue-50/50 transition cursor-pointer"
                                >
                                    <td className="px-4 py-3 font-bold text-blue-900">#{evt.id}</td>
                                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                            <span>{formatDateTime(evt.created_at || evt.timestamp)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">{evt.type}</td>
                                    <td className="px-4 py-3 text-slate-700">{evt.road_name}</td>
                                    <td className="px-4 py-3 font-mono text-slate-600">
                                        {Number(evt.latitude || 0).toFixed(4)}°, {Number(evt.longitude || 0).toFixed(4)}°
                                    </td>
                                    <td className="px-4 py-3 font-bold text-rose-700">{evt.vibration} G</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.severity === 'Critical' ? 'badge-critical' : 'badge-warning'
                                            }`}>
                                            {evt.severity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${evt.verification_status?.includes('Verified') ? 'badge-verified' : 'badge-warning'
                                            }`}>
                                            {evt.verification_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectIncident(evt);
                                            }}
                                            className="px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
                                        >
                                            Inspect
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
