import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const res = await fetch(`http://${window.location.hostname}:5000/api/road-data`);
                const data = await res.json();
                // Filter only GSM / SOS Alerts (Strictly no dummy data)
                const filtered = data.filter(item => item.type === 'SOS');
                setIncidents(filtered);
            } catch (e) {
                console.error("Failed to fetch incidents", e);
            }
        };

        fetchIncidents();
        const interval = setInterval(fetchIncidents, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 md:p-8 w-full min-h-screen text-white animate-fade-in pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-600 rounded-xl shadow-lg shadow-red-900/40">
                    <AlertTriangle size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Incident Log</h1>
                    <p className="text-gray-400">Live feed of SOS alerts and Road Hazards</p>
                </div>
            </div>

            {incidents.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-gray-500 text-lg">No active incidents reported.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {incidents.map((incident, index) => (
                        <div key={index} className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-white/5
                            ${incident.type === 'SOS' ? 'bg-red-900/20 border-red-500/50 shadow-lg shadow-red-900/10' : 'bg-gray-800/40 border-white/10'}
                        `}>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                                    ${incident.type === 'SOS' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}
                                `}>
                                    {incident.type}
                                </span>
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {incident.type === 'SOS' ? 'Emergency Alert Triggered' : `${incident.type} Detected`}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(incident.created_at).toLocaleString()}</span>
                                        {incident.latitude && (
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {incident.latitude && (
                                <a
                                    href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold border border-white/10 transition-colors"
                                >
                                    View Location
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Incidents;
