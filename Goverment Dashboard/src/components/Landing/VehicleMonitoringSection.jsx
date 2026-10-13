import React, { useState } from 'react';
import { Truck, Gauge, Activity, Radio, Cpu, Wind, ShieldCheck, Clock, AlertTriangle, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { DEMO_VEHICLES } from '../../data/landingData';

export default function VehicleMonitoringSection({ onOpenDashboard }) {
    const [selectedVehicleId, setSelectedVehicleId] = useState(DEMO_VEHICLES[0].id);

    const vehicle = DEMO_VEHICLES.find((v) => v.id === selectedVehicleId) || DEMO_VEHICLES[0];

    return (
        <section
            id="vehicles-section"
            aria-labelledby="vehicles-title"
            className="w-full bg-slate-50 py-10 sm:py-16 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                            <Cpu className="w-3.5 h-3.5 text-blue-900" />
                            <span>एज आईओटी टेलीमेट्री स्टेशन (Edge IoT Telemetry Station)</span>
                        </div>
                        <h2
                            id="vehicles-title"
                            className="text-2xl sm:text-3xl font-bold text-slate-900 font-hindi"
                        >
                            वाहन स्थिति एवं सेंसर निगरानी
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            व्यावसायिक फ्लीट में स्थापित IMU, LiDAR, MQ-3 सेंसर और AI दृष्टि मॉड्यूल की वास्तविक समय स्थिति
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                            एज आईओटी सक्रिय फीड (Live Edge IoT Feed)
                        </span>
                    </div>
                </div>

                {/* Vehicle Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap mr-1">
                        वाहन चुनें:
                    </span>
                    {DEMO_VEHICLES.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setSelectedVehicleId(v.id)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 border cursor-pointer whitespace-nowrap ${
                                selectedVehicleId === v.id
                                    ? 'bg-[#0f274e] text-white border-blue-900 shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                            }`}
                        >
                            <Truck className="w-3.5 h-3.5 text-amber-400" />
                            <span>{v.id}</span>
                            <span className="text-[10px] font-sans font-normal opacity-80">({v.type.split(' ')[0]})</span>
                        </button>
                    ))}
                </div>

                {/* Main Vehicle Inspection Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left: Vehicle Overview & Speed HUD Card (4 cols) */}
                    <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
                        <div className="border-b pb-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 uppercase">
                                {vehicle.type}
                            </span>
                            <h3 className="text-xl font-mono font-extrabold text-slate-900 mt-1">
                                {vehicle.id}
                            </h3>
                            <div className="text-xs text-slate-500 font-hindi mt-0.5">
                                {vehicle.model}
                            </div>
                        </div>

                        {/* Speed Gauge / Circular indicator */}
                        <div className="bg-slate-900 rounded-lg p-5 text-white text-center space-y-2 border border-slate-800">
                            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                                <span>तात्कालिक गति (Speedometer)</span>
                            </div>

                            <div className="flex items-baseline justify-center gap-1.5 py-1">
                                <span className="text-5xl font-mono font-black text-cyan-300 tracking-tight">
                                    {vehicle.speed}
                                </span>
                                <span className="text-sm font-hindi text-slate-300 font-bold">
                                    किमी/घंटा
                                </span>
                            </div>

                            {/* Speed Limit Bar */}
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        vehicle.speed > vehicle.speedLimit ? 'bg-rose-500' : 'bg-emerald-400'
                                    }`}
                                    style={{ width: `${Math.min(100, (vehicle.speed / 100) * 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-[10px] text-slate-400 flex justify-between">
                                <span>0</span>
                                <span>सीमा: {vehicle.speedLimit} किमी/घंटा</span>
                                <span>120</span>
                            </div>
                        </div>

                        {/* Location & Last Sync */}
                        <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-hindi">वर्तमान स्थिति:</span>
                                <span className="font-semibold text-slate-800 text-right">{vehicle.locationName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-hindi">अंतिम डेटा प्राप्ति:</span>
                                <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {vehicle.lastPing}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-hindi">संचार स्थिति:</span>
                                <span className="font-medium text-blue-900">{vehicle.commsStatus}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Detailed Sensor Readings Grid (8 cols) */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Sensor 1: चालक सतर्कता स्थिति */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-2 hover:border-blue-400 transition">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 font-hindi">1. चालक सतर्कता स्थिति</span>
                                <Activity className="w-4 h-4 text-blue-800" />
                            </div>
                            <div className="text-lg font-bold text-slate-900 font-hindi">
                                {vehicle.driverStatus}
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                                <span className="text-slate-500">अलर्टनेस स्कोर:</span>
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {vehicle.driverScore} / 100
                                </span>
                            </div>
                        </div>

                        {/* Sensor 2: 6-DOF IMU स्थिति */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-2 hover:border-blue-400 transition">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 font-hindi">2. IMU जाइरो व शॉक स्थिति</span>
                                <Layers className="w-4 h-4 text-indigo-700" />
                            </div>
                            <div className="text-sm font-semibold text-slate-900 font-hindi">
                                {vehicle.imuStatus}
                            </div>
                            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                                {vehicle.imuDetail}
                            </div>
                        </div>

                        {/* Sensor 3: LiDAR परास एवं बाधा */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-2 hover:border-blue-400 transition">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 font-hindi">3. LiDAR लेज़र रेंजफाइंडर</span>
                                <Radio className="w-4 h-4 text-cyan-700" />
                            </div>
                            <div className="text-sm font-semibold text-slate-900 font-hindi">
                                {vehicle.lidarStatus}
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                                <span className="text-slate-500">निकटतम दूरी:</span>
                                <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                    {vehicle.lidarObstacleDistance} मीटर
                                </span>
                            </div>
                        </div>

                        {/* Sensor 4: MQ-3 अल्कोहल वेपर सेंसर */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-2 hover:border-blue-400 transition">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 font-hindi">4. MQ-3 सेंसर (शराब वाष्प)</span>
                                <Wind className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="text-sm font-semibold text-slate-900 font-hindi">
                                {vehicle.mq3Status}
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                                <span className="text-slate-500">प्रमाणीकरण:</span>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    शून्य अल्कोहल सुरक्षित
                                </span>
                            </div>
                        </div>

                        {/* Bottom Banner inside Right Column */}
                        <div className="sm:col-span-2 bg-blue-900 text-white rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                            <div className="text-xs space-y-0.5 text-center sm:text-left">
                                <div className="font-bold font-hindi">
                                    टेलीमेट्री एकीकरण आर्किटेक्चर (Telemetry Gateway Integration)
                                </div>
                                <div className="text-blue-200 text-[11px]">
                                    Raspberry Pi 4 / Jetson Nano / ESP32 टेलीमेट्री नियंत्रक हेतु मॉड्यूलर REST एवं WebSocket API समर्थित
                                </div>
                            </div>
                            <button
                                onClick={onOpenDashboard}
                                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-1.5 rounded text-xs font-bold transition shrink-0 cursor-pointer"
                            >
                                लाइव टेलीमेट्री डैशबोर्ड &rarr;
                            </button>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
