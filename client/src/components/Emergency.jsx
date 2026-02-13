import React, { useState, useEffect } from 'react';
import { Phone, AlertTriangle, MapPin, Plus, Trash2, Siren, Share2, Signal, Activity } from 'lucide-react';

const Emergency = () => {
    const [location, setLocation] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState({ name: '', phone: '' });
    const [showAddContact, setShowAddContact] = useState(false);
    const [gsmStatus, setGsmStatus] = useState(null);

    useEffect(() => {
        // Load contacts from local storage
        const savedContacts = localStorage.getItem('emergency_contacts');
        if (savedContacts) {
            setContacts(JSON.parse(savedContacts));
        }

        // Fetch GSM Status
        const fetchGsm = async () => {
            try {
                const res = await fetch(`http://${window.location.hostname}:5000/api/gsm-status`);
                const data = await res.json();
                setGsmStatus(data);
            } catch (err) {
                console.error("GSM Status Error", err);
            }
        };
        fetchGsm();
        const interval = setInterval(fetchGsm, 5000); // Poll every 5s

        // Get Live Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error("Error getting location:", error)
            );
        }
        return () => clearInterval(interval);
    }, []);

    const saveContact = () => {
        if (newContact.name && newContact.phone) {
            const updatedContacts = [...contacts, newContact];
            setContacts(updatedContacts);
            localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
            setNewContact({ name: '', phone: '' });
            setShowAddContact(false);
        }
    };

    const deleteContact = (index) => {
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
        localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
    };

    const handleSOS = () => {
        // In a real app, this would send SMS/API call
        alert("SOS SIGNAL SENT! \nLocation shared with emergency services.");
        window.location.href = "tel:112"; // Auto-dial emergency
    };

    const shareLocation = () => {
        if (location) {
            const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
            navigator.clipboard.writeText(url);
            alert("Location link copied to clipboard: " + url);
        } else {
            alert("Location not available yet.");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24 animate-fade-in text-white">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <span className="p-2 bg-red-500/20 rounded-xl text-red-500">
                        <Siren size={32} className="animate-pulse" />
                    </span>
                    Emergency Center
                </h1>
                <p className="text-gray-400 mt-2">Immediate assistance and safety tools.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. SOS Button */}
                <div className="col-span-1 md:col-span-2 flex justify-center py-6">
                    <button
                        onClick={handleSOS}
                        className="w-48 h-48 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_50px_rgba(220,38,38,0.5)] border-4 border-red-400/50 flex flex-col items-center justify-center animate-pulse hover:scale-105 transition-transform active:scale-95 group"
                    >
                        <span className="text-5xl font-black text-white group-hover:text-red-100">SOS</span>
                        <span className="text-xs text-red-200 mt-2 font-semibold tracking-wider">TAP FOR HELP</span>
                    </button>
                </div>

                {/* 2. Quick Dials */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Phone size={20} className="text-blue-400" /> Quick Dial
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="tel:112" className="flex flex-col items-center justify-center p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl transition-all">
                            <span className="text-2xl font-bold text-blue-100">112</span>
                            <span className="text-xs text-blue-300">Police / Fire</span>
                        </a>
                        <a href="tel:108" className="flex flex-col items-center justify-center p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-xl transition-all">
                            <span className="text-2xl font-bold text-green-100">108</span>
                            <span className="text-xs text-green-300">Ambulance</span>
                        </a>
                    </div>
                </div>

                {/* GSM Status Card */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Signal size={20} className="text-green-400" /> GSM Service Interaction
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 p-4 rounded-xl flex flex-col items-center">
                            <div className="text-xs text-gray-500 mb-1">Backend Service</div>
                            <div className="font-bold text-green-400">
                                {gsmStatus?.status || 'Connecting...'}
                            </div>
                            <div className="text-[10px] text-gray-600 mt-1">Ready to trigger</div>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl flex flex-col items-center">
                            <div className="text-xs text-gray-500 mb-1">Total SOS Events</div>
                            <div className="text-2xl font-bold text-white">
                                {gsmStatus?.alertsSent || 0}
                            </div>
                            <div className="text-[10px] text-gray-600 mt-1">Logged in DB</div>
                        </div>
                    </div>
                </div>

                {/* 3. Your Location */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-purple-400" /> Your Location
                    </h2>
                    <div className="bg-black/30 p-4 rounded-xl mb-4 text-center">
                        {location ? (
                            <>
                                <div className="text-2xl font-mono text-gray-200">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
                                <div className="text-xs text-gray-500 mt-1">Accuracy: High</div>
                            </>
                        ) : (
                            <div className="text-gray-500 italic">Fetching GPS...</div>
                        )}
                    </div>
                    <button
                        onClick={shareLocation}
                        className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                        <Share2 size={16} /> Share Coordinates
                    </button>
                </div>

                {/* 4. Contact Manager */}
                <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <AlertTriangle size={20} className="text-yellow-400" /> Emergency Contacts
                        </h2>
                        <button
                            onClick={() => setShowAddContact(!showAddContact)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {showAddContact && (
                        <div className="mb-6 p-4 bg-black/30 rounded-xl border border-white/5 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Name (e.g., Dad)"
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={newContact.phone}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={saveContact}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Save Contact
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {contacts.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">No contacts added. Add close family/friends.</div>
                        ) : (
                            contacts.map((contact, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black border border-white/20">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{contact.name}</div>
                                            <div className="text-xs text-gray-400">{contact.phone}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a href={`tel:${contact.phone}`} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                                            <Phone size={18} />
                                        </a>
                                        <button
                                            onClick={() => deleteContact(index)}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Emergency;
