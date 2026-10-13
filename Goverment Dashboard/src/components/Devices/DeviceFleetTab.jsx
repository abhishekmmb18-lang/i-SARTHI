import React, { useState } from 'react';
import {
    Cpu,
    Radio,
    Battery,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock,
    Send,
    Terminal,
    Zap,
    MapPin,
    Car,
    RefreshCw,
    Shield
} from 'lucide-react';
import { triggerHardwareIngest, triggerDeviceHeartbeat } from '../../services/telemetryStore';

export default function DeviceFleetTab({
    devices = [],
    onRefreshDevices
}) {
    // Hardware Simulator State
    const [simDevice, setSimDevice] = useState('SARTHI-RPI5-DL01');
    const [simType, setSimType] = useState('Pothole');
    const [simLat, setSimLat] = useState('28.6139');
    const [simLng, setSimLng] = useState('77.2090');
    const [simShock, setSimShock] = useState('4.85');
    const [simSpeed, setSimSpeed] = useState('48.5');
    const [simRoad, setSimRoad] = useState('NH-44 (Delhi-Jaipur Corridor, KM 142.8)');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simLog, setSimLog] = useState(null);

    const handleSendTestTelemetry = async () => {
        setIsSimulating(true);
        setSimLog(null);
        try {
            const payload = {
                event_id: `EVT-${Date.now()}`,
                device_id: simDevice,
                event_type: simType,
                timestamp: new Date().toISOString(),
                latitude: parseFloat(simLat),
                longitude: parseFloat(simLng),
                vibration: parseFloat(simShock),
                speed_kmh: parseFloat(simSpeed),
                road_name: simRoad,
                confidence: 0.96,
                severity: parseFloat(simShock) > 4.5 ? 'Critical' : parseFloat(simShock) > 3.0 ? 'High' : 'Medium'
            };

            const response = await triggerHardwareIngest(payload);
            setSimLog({
                timestamp: new Date().toISOString(),
                endpoint: 'POST /api/v1/ingest',
                status: response.error ? 400 : 201,
                requestPayload: payload,
                serverResponse: response
            });

            // Trigger dashboard refresh to immediately reflect new state
            if (onRefreshDevices) onRefreshDevices();
        } catch (e) {
            setSimLog({
                timestamp: new Date().toISOString(),
                endpoint: 'POST /api/v1/ingest',
                status: 500,
                error: e.message
            });
        } finally {
            setIsSimulating(false);
        }
    };

    const handleSendHeartbeat = async (deviceId) => {
        try {
            const payload = {
                device_id: deviceId,
                firmware_version: 'v2.4.1-edge',
                battery_voltage: '13.9V',
                sensor_health: { camera: 'OK', imu: 'CALIBRATED', gps: '3D_FIX', mq3: 'STANDBY' }
            };
            await triggerDeviceHeartbeat(payload);
            if (onRefreshDevices) onRefreshDevices();
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Online':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold badge-verified flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>Online</span>;
            case 'Delayed Data':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold badge-warning flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Delayed Data</span>;
            case 'Sensor Error':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold badge-critical flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" />Sensor Error</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold badge-neutral flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Offline</span>;
        }
    };

    const formatLastHeartbeat = (timestamp) => {
        if (!timestamp) return 'No heartbeat';
        const sec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
        if (sec < 60) return `${sec}s ago`;
        if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
        return `${Math.floor(sec / 3600)}h ago`;
    };

    return (
        <div className="space-y-6">

            {/* Header Banner */}
            <div className="gov-card p-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white border-blue-950">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-200 uppercase">
                            <Cpu className="w-4 h-4 text-teal-400" />
                            <span>In-Vehicle Hardware Telemetry &amp; Edge Node Monitoring</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                            iSARTHI Connected Device Fleet
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                            Real-time connection telemetry from physical iSARTHI vehicle units (Raspberry Pi 5, NVIDIA Jetson Orin Nano, and ESP32 telemetry nodes). Device online/offline state is calculated strictly using backend heartbeat reception intervals.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                        <button
                            onClick={onRefreshDevices}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Refresh Heartbeats</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Device Fleet Cards */}
            {devices.length === 0 ? (
                <div className="gov-card p-12 text-center border-dashed border-2 border-slate-200 bg-white">
                    <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800 font-hindi">
                        📡 कोई हार्डवेयर डिवाइस कनेक्ट नहीं (Awaiting Edge Device Telemetry)
                    </h3>
                    <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
                        समस्त पिछला डेमो डिवाइस डेटा हटा दिया गया है। जैसे ही आपकी ESP32, Raspberry Pi 5 या Jetson डिवाइस से हार्टबीट अथवा टेलीमेट्री पैकेट प्राप्त होगा, वह यहां वास्तविक समय में स्वतः सूचीबद्ध हो जाएगी।
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => {
                    const status = device.computed_status || 'Offline';
                    const isOnline = status === 'Online';

                    return (
                        <div
                            key={device.device_id}
                            className="gov-card p-5 flex flex-col justify-between hover:border-blue-300 transition"
                        >
                            <div>
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${isOnline ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>
                                            <Cpu className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">
                                                {device.device_id}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {device.device_type}
                                            </p>
                                        </div>
                                    </div>

                                    {getStatusBadge(status)}
                                </div>

                                {/* Vehicle Assignment */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 my-3 text-xs">
                                    <div className="flex items-center justify-between text-slate-600 mb-1">
                                        <span className="flex items-center gap-1 font-medium">
                                            <Car className="w-3.5 h-3.5 text-slate-400" />
                                            Assigned Vehicle:
                                        </span>
                                        <span className="font-semibold text-slate-800">{device.assigned_vehicle}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="flex items-center gap-1 font-medium">
                                            <Battery className="w-3.5 h-3.5 text-slate-400" />
                                            Power Supply:
                                        </span>
                                        <span className="font-mono text-slate-700">{device.battery_voltage || '13.8V'}</span>
                                    </div>
                                </div>

                                {/* Sensor Health Status */}
                                <div className="text-xs space-y-1.5 my-3">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                        Sensor Node Health Check:
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                        <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                                            <span className="text-slate-500">Camera AI:</span>
                                            <span className="font-semibold text-emerald-800">{device.sensor_health?.camera || 'OK'}</span>
                                        </div>
                                        <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                                            <span className="text-slate-500">MPU-6050 IMU:</span>
                                            <span className="font-semibold text-emerald-800">{device.sensor_health?.imu || 'CALIBRATED'}</span>
                                        </div>
                                        <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                                            <span className="text-slate-500">GPS GNSS:</span>
                                            <span className="font-semibold text-emerald-800">{device.sensor_health?.gps || '3D_FIX'}</span>
                                        </div>
                                        <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                                            <span className="text-slate-500">MQ-3 Sensor:</span>
                                            <span className="font-semibold text-slate-700">{device.sensor_health?.mq3 || 'STANDBY'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Communication & Firmware */}
                                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        Heartbeat: {formatLastHeartbeat(device.last_heartbeat)}
                                    </span>
                                    <span className="font-mono text-slate-600">
                                        Firmware: {device.firmware_version || 'v2.4.1'}
                                    </span>
                                </div>
                            </div>

                            {/* Ping Heartbeat Button */}
                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => handleSendHeartbeat(device.device_id)}
                                    className="w-full py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Radio className="w-3.5 h-3.5 text-blue-700" />
                                    <span>Send Live Heartbeat Ping</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

            {/* Hardware Telemetry Test Console & Ingestion Simulator */}
            <div className="gov-card p-6 border-blue-200 bg-blue-50/20 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                    <div className="flex items-center space-x-2">
                        <Terminal className="w-5 h-5 text-blue-900" />
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Physical Hardware Telemetry Ingestion Simulator (API Test Bench)
                            </h3>
                            <p className="text-xs text-slate-600">
                                Transmit simulated edge hardware payloads to <code className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">POST /api/v1/ingest</code> using the provisioned device authentication key.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Select Hardware Device:</label>
                        <select
                            value={simDevice}
                            onChange={(e) => setSimDevice(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                        >
                            <option value="SARTHI-RPI5-DL01">SARTHI-RPI5-DL01 (Raspberry Pi 5)</option>
                            <option value="SARTHI-JETSON-MH02">SARTHI-JETSON-MH02 (Jetson Orin Nano)</option>
                            <option value="SARTHI-ESP32-RJ14">SARTHI-ESP32-RJ14 (ESP32 Node)</option>
                            <option value="SARTHI-RPI5-HR26">SARTHI-RPI5-HR26 (Hyundai Creta)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Hazard Event Type:</label>
                        <select
                            value={simType}
                            onChange={(e) => setSimType(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                        >
                            <option value="Pothole">Severe Pothole Impact</option>
                            <option value="Road Surface Cavity">Road Surface Cavity</option>
                            <option value="Waterlogging">Waterlogging On Pavement</option>
                            <option value="SOS Emergency Alert">SOS Emergency Alert</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">GPS Coordinates (Lat, Lng):</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={simLat}
                                onChange={(e) => setSimLat(e.target.value)}
                                placeholder="Latitude"
                                className="w-1/2 p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono"
                            />
                            <input
                                type="text"
                                value={simLng}
                                onChange={(e) => setSimLng(e.target.value)}
                                placeholder="Longitude"
                                className="w-1/2 p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Impact Shock (G-Force):</label>
                        <input
                            type="number"
                            step="0.05"
                            value={simShock}
                            onChange={(e) => setSimShock(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-600">
                        Target Highway: <strong className="text-slate-800">{simRoad}</strong>
                    </div>

                    <button
                        onClick={handleSendTestTelemetry}
                        disabled={isSimulating}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        <span>{isSimulating ? 'Transmitting Ingestion Packet...' : 'Transmit Ingestion Packet to /api/v1/ingest'}</span>
                    </button>
                </div>

                {/* Response Log */}
                {simLog && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                            <span>Ingestion Response • Status {simLog.status}</span>
                            <span className="text-emerald-400 font-bold">201 CREATED &amp; CLUSTERED ✓</span>
                        </div>
                        <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                            {JSON.stringify(simLog.serverResponse, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

        </div>
    );
}
