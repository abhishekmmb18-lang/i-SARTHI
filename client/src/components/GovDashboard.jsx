import React, { useEffect, useState } from 'react';
import { Database, Activity, Map, AlertTriangle, FileText, Download } from 'lucide-react';

const GovDashboard = () => {
    const [activeTab, setActiveTab] = useState('users'); // Default to users
    const [drowsinessLogs, setDrowsinessLogs] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [sensorLogs, setSensorLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [sensorFilter, setSensorFilter] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Users Data
                const usersRes = await fetch(`http://${window.location.hostname}:5000/api/users`);
                if (usersRes.ok) setUsers(await usersRes.json());
                else console.error("Failed to fetch users");

                // 2. Drowsiness Data
                const drowsyRes = await fetch(`http://${window.location.hostname}:5000/api/drowsiness`);
                const drowsyData = await drowsyRes.json();
                if (drowsyData.history) setDrowsinessLogs(drowsyData.history);

                // 3. Incident Data
                const roadRes = await fetch(`http://${window.location.hostname}:5000/api/road-data`);
                const roadData = await roadRes.json();
                setIncidents(roadData);

                // 4. Sensor Logs
                const sensorRes = await fetch(`http://${window.location.hostname}:5000/api/sensor-logs`);
                if (sensorRes.ok) setSensorLogs(await sensorRes.json());

            } catch (e) {
                console.error("Global Data fetch error", e);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const exportUserFile = (user) => {
        const userReport = {
            user_profile: user,
            generated_at: new Date().toISOString(),
            notes: "This file contains the registered data for the user.",
            // In a real app, we would also filter logs specifically for this user_id
            system_status: "Active"
        };
        exportData(userReport, `user_file_${user.username}_${user.id}`);
    };

    const exportData = (data, filename) => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${filename}.json`;
        link.click();
    };

    return (
        <div className="p-4 md:p-8 w-full min-h-screen text-white animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Database className="text-blue-400" /> System Database
                    </h1>
                    <p className="text-gray-400 mt-1">Centralized storage for users, logs, and sensor history.</p>
                </div>
                <button
                    onClick={() => exportData({ users, drowsinessLogs, incidents }, 'full_system_backup')}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                >
                    <Download size={16} /> Full System Backup
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                {[
                    { id: 'users', label: 'Registered Users', icon: FileText },
                    { id: 'drowsiness', label: 'Drowsiness Logs', icon: Activity },
                    { id: 'incidents', label: 'Road/SOS Events', icon: AlertTriangle },
                    { id: 'sensors', label: 'Sensor History', icon: Map },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border
                            ${activeTab === tab.id
                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40'
                                : 'bg-gray-800/40 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden p-6 max-h-[600px] overflow-y-auto custom-scrollbar">

                {/* Users Table */}
                {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/10">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Username</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Full Name</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-mono text-sm opacity-60">#{u.id}</td>
                                        <td className="p-3 font-bold text-blue-300">{u.username}</td>
                                        <td className="p-3">{u.email}</td>
                                        <td className="p-3">{u.full_name || '-'}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => exportUserFile(u)}
                                                className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all border border-blue-500/30 flex items-center gap-2"
                                            >
                                                <FileText size={12} /> Generate File
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No registered users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Drowsiness Table */}
                {activeTab === 'drowsiness' && (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 border-b border-white/10">
                                <th className="p-3">ID</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Event Count</th>
                                <th className="p-3">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drowsinessLogs.map((log) => (
                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-3 text-mono text-sm opacity-60">#{log.id}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.is_drowsy ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {log.is_drowsy ? 'DROWSY' : 'AWAKE'}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono">{log.events_count}</td>
                                    <td className="p-3 text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                            {drowsinessLogs.length === 0 && (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No logs found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Incidents / SOS Table */}
                {activeTab === 'incidents' && (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 border-b border-white/10">
                                <th className="p-3">ID</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Location (Lat, Lon)</th>
                                <th className="p-3">GSM Status</th>
                                <th className="p-3">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.map((log) => (
                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-3 text-mono text-sm opacity-60">#{log.id}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                            ${log.type === 'SOS' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}
                                        `}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-sm">
                                        {log.latitude ? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}` : 'N/A'}
                                    </td>
                                    <td className="p-3 text-sm">
                                        {log.sos_alert ? '✅ Sent' : '-'}
                                    </td>
                                    <td className="p-3 text-sm text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            {incidents.length === 0 && (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No incidents found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Sensor Logs Table */}
                {activeTab === 'sensors' && (
                    <div>
                        <div className="flex gap-2 mb-4">
                            {['All', 'GPS', 'Alcohol', 'Radar', 'Vibration'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSensorFilter(type)} // You need to add this state
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors border
                                        ${sensorFilter === type ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/10">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Sensor</th>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sensorLogs
                                    .filter(log => sensorFilter === 'All' || log.sensor_type === sensorFilter)
                                    .map((log) => (
                                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-mono text-sm opacity-60">#{log.id}</td>
                                            <td className="p-3 font-bold text-blue-300">{log.sensor_type}</td>
                                            <td className="p-3 font-mono text-sm">
                                                {log.sensor_type === 'GPS' && `Lat: ${log.value_1?.toFixed(4)}, Lon: ${log.value_2?.toFixed(4)}, Spd: ${log.value_3?.toFixed(1)}`}
                                                {log.sensor_type === 'Alcohol' && `Level: ${log.value_1?.toFixed(1)}%`}
                                                {log.sensor_type === 'Radar' && `Angle: ${log.value_1}°, Dist: ${log.value_2}cm`}
                                                {log.sensor_type === 'Vibration' && `L: ${log.value_1?.toFixed(2)}, R: ${log.value_2?.toFixed(2)}`}
                                            </td>
                                            <td className="p-3 text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                {sensorLogs.length === 0 && (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No sensor logs yet (Requires new Server API).</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default GovDashboard;
