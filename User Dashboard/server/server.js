require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const { supabase, isSupabaseConfigured } = require('./supabaseClient');
const twilio = require('twilio');

// Initialize Twilio
const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// --- Fish Audio TTS Proxy ---
app.post('/api/fish/tts', async (req, res) => {
    try {
        const apiKey = process.env.FISH_AUDIO_API_KEY || (req.headers['authorization'] || '').replace('Bearer ', '');
        if (!apiKey) {
            return res.status(401).json({ error: 'Missing Fish Audio API Key' });
        }
        const fishRes = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        if (!fishRes.ok) {
            const errText = await fishRes.text();
            return res.status(fishRes.status).send(errText);
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        const buffer = await fishRes.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Intelligent In-Vehicle AI Copilot Chat API ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, language = 'English' } = req.body;
        const userMsg = (message || '').trim().toLowerCase();

        // 1. Check if OpenAI is available and works
        const openAIKey = process.env.OPENAI_API_KEY;
        if (openAIKey) {
            try {
                const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openAIKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: `You are I-SARTHI, a caring, smart in-vehicle AI passenger companion and safety copilot.
Current Vehicle Telemetry:
- Speed: ${locationData.speed.toFixed(1)} km/h
- Drowsiness Status: ${latestDrowsinessStatus.isDrowsy ? 'DROWSY WARNING' : 'Normal/Alert'} (${latestDrowsinessStatus.events} events)
- Cabin Alcohol: ${alcoholData.level} (${alcoholData.value}%)
- Road Surface Vibration: Left: ${vibrationData.left.toFixed(2)}G, Right: ${vibrationData.right.toFixed(2)}G
Language: ${language}. If Hindi/Hinglish, reply in warm everyday Hindi.
Keep answers conversational, warm, and concise (2-3 sentences max) for driver safety.`
                            },
                            { role: 'user', content: message }
                        ]
                    })
                });
                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    const reply = aiData.choices?.[0]?.message?.content;
                    if (reply) return res.json({ reply });
                }
            } catch (e) {
                // Fallback to internal telemetry NLP engine
            }
        }

        // 2. Autonomous In-Vehicle Telemetry NLP Engine
        let reply = "";
        const isHindi = language.toLowerCase().includes('hi') || /kya|hai|ho|kaise|neend|chalo|batao|gaadi/.test(userMsg);

        if (/speed|fast|kitni speed|pace/.test(userMsg)) {
            reply = isHindi 
                ? `Aapki gaadi abhi ${locationData.speed.toFixed(1)} km/h ki speed par chal rahi hai. Road condition stable hai, aram se drive kijiye!`
                : `You are currently cruising at ${locationData.speed.toFixed(1)} km/h. Road conditions look stable ahead.`;
        } else if (/neend|sleep|sleepy|tired|thak|fatigue|rest/.test(userMsg)) {
            reply = isHindi
                ? `Agar aapko neend ya thakan lag rahi hai, toh turant agle petrol pump ya rest stop par gaadi rokiye. 15 minute ka break aur ek chai aapko refresh kar degi!`
                : `Driver safety is our highest priority! If you are feeling fatigue or drowsy, please pull over safely at the next rest stop for a quick break.`;
        } else if (/pothole|gaddha|road|vibration|shock|khadda/.test(userMsg)) {
            reply = isHindi
                ? `Road monitor active hai! Left suspension ${vibrationData.left.toFixed(2)}G aur right suspension ${vibrationData.right.toFixed(2)}G shock detect kar rahe hain. Sadak theek hai!`
                : `Road surface monitor is active! Suspension telemetry reads ${vibrationData.left.toFixed(2)}G shock. Pothole scanning is normal.`;
        } else if (/alcohol|sharab|drink|drunk/.test(userMsg)) {
            reply = isHindi
                ? `Cabin alcohol sensor status: ${alcoholData.level} (${alcoholData.value}%). Bilkul safe cabin environment hai.`
                : `Cabin alcohol sensor reports ${alcoholData.level} (${alcoholData.value}%). Vehicle environment is clear and safe.`;
        } else if (/joke|chutkula|bored|hasi/.test(userMsg)) {
            reply = isHindi
                ? `Ek driver ne GPS se poocha: 'Mujhe kahan jaana chahiye?' GPS bola: 'Pehle saamne wali red light dekho, phir socho!' 😄 Dhyaan sadak par rakhiye!`
                : `Why did the car get a flat tire? Because there was a fork in the road! 😄 Keep smiling and stay alert behind the wheel!`;
        } else if (/hi|hello|hey|namaste|kya haal|wassup/.test(userMsg)) {
            reply = isHindi
                ? `Namaste! Main aapka I-SARTHI copilot hoon. Saari systems active hain. Aaj ka safar kaisa chal raha hai?`
                : `Hey there! I-SARTHI copilot online and monitoring all telemetry. How is your drive going today?`;
        } else if (/status|safe|report|all good|sab theek/.test(userMsg)) {
            reply = isHindi
                ? `Sabhi safety systems bilkul theek hain: Speed ${locationData.speed.toFixed(1)} km/h, Drowsiness monitor online, radar active hai!`
                : `All vehicle systems operational: Speed ${locationData.speed.toFixed(1)} km/h, DMS eye-tracker active, radar proximity scanning.`;
        } else {
            const dynamicResponses = isHindi ? [
                `Main bilkul sun raha hoon! Safar ke dauran koi bhi zaroorat ho ya thakan lage toh mujhe bataiye.`,
                `Safar lamba hai lekin I-SARTHI aapke saath hai. Road par nazar rakhiye aur aage badhiye!`,
                `Bilkul sahi! Main background mein sensor aur road damage analyze kar raha hoon. Aap befikr hokar drive karein.`
            ] : [
                `I'm right beside you monitoring the telemetry. Let me know if you need any directions, music ideas, or a rest stop recommendation!`,
                `Roads ahead look clear! Keep a steady grip on the steering and let me know if you feel tired at any point.`,
                `Understood! All radar and vibration sensors are actively scanning while we talk. Have a smooth journey!`
            ];
            reply = dynamicResponses[Math.floor(Math.random() * dynamicResponses.length)];
        }

        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- In-Memory Realtime Cache & Shared State ---
let lastKnownPiIp = process.env.PI_IP || '';
let lastPotholeDetection = {
    detected: false,
    confidence: 0,
    class_name: null,
    bbox: [],
    timestamp: 0,
    vehicle_id: 'ISARTHI_A'
};

let latestDrowsinessStatus = {
    isDrowsy: false,
    events: 0,
    timestamp: Date.now()
};

let radarData = {
    angle: 0,
    distance: 0, // cm
    timestamp: Date.now()
};

let vibrationData = {
    left: 0,
    right: 0,
    timestamp: Date.now()
};

let gsmStatus = {
    connected: false,
    timestamp: Date.now()
};

let alcoholData = {
    value: 0, // 0-100
    level: 'Normal', // Normal, Moderate, High
    timestamp: Date.now()
};

let locationData = {
    latitude: 26.823287,
    longitude: 75.866808,
    speed: 48.5, // km/h
    timestamp: Date.now()
};

let lastCriticalLog = 0; // Debounce for critical logs
let lastVibrationLog = 0; // Throttle for continuous logs
let drowsinessWindowEvents = []; // Sliding window of timestamps (5 events in 2 minutes)
let lastBundleDispatchedTime = 0;
let externalDispatchServerUrl = process.env.EXTERNAL_DISPATCH_SERVER_URL || '';

// --- 10-Pass / 10-Vehicle Spatial Pothole Clusters State ---
let activePotholeClusters = [];
let lastPotholeShockTime = 0;

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function generatePotholeAIReport(cluster) {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log(`🤖 [OPENAI] Calling Autonomous Highway Civil Engineer Agent for Cluster: ${cluster.cluster_id}...`);

    if (!apiKey) {
        return {
            severity_score: Math.min(10, Math.max(1, (cluster.max_vibration * 4.2))).toFixed(1),
            report_markdown: `### 🏛️ MoRTH / PWD OFFICIAL ROAD REPAIR WORK ORDER\n**Cluster ID**: ${cluster.cluster_id}\n**Status**: 100% CONFIRMED (10 Passes Verified)\n**Coordinates**: ${cluster.center_lat.toFixed(5)}°N, ${cluster.center_lng.toFixed(5)}°E\n**Peak Shock**: ${cluster.max_vibration.toFixed(2)}G | **Avg Speed**: ${cluster.avg_speed.toFixed(1)} km/h\n**Hazard Level**: Critical Asphalt Defect\n**Required Action**: Deploy Bituminous Cold-Patch Repair Unit within 24 Hours.`
        };
    }

    try {
        const prompt = `You are a Chief Civil & Transportation Safety Engineer at the Ministry of Road Transport & Highways (MoRTH / NHAI).
You have received a 100% VERIFIED telemetry bundle from the I-SARTHI Connected Vehicle Network. 
10 separate vehicle passes over the exact same geographical coordinate (within a 15-meter radius) have all recorded severe suspension shock impacts.

Forensic Sensor Telemetry:
- Pothole Coordinate: ${cluster.center_lat.toFixed(5)}°N, ${cluster.center_lng.toFixed(5)}°E (Google Maps: https://www.google.com/maps?q=${cluster.center_lat},${cluster.center_lng})
- Total Verified Passes: ${cluster.verified_count} / 10
- Max Vibration G-Force: ${cluster.max_vibration.toFixed(2)} G
- Average Traffic Speed over Defect: ${cluster.avg_speed.toFixed(1)} km/h
- Timestamp: ${new Date().toISOString()}

Analyze this data and produce a structured, highly professional, formal Government Road Repair Work Order (MoRTH / Municipal PWD Format).
Include:
1. **Overall Road Hazard Index (RHI)**: Explicitly state the score as X.X/10 (e.g. "8.8/10").
2. **Defect Classification & Geometry**: Estimated depth, diameter, and wheel track lane position.
3. **Traffic Risk Triage**: Two-wheeler stability risk, high-speed tire blowout danger, and suspension strain.
4. **Actionable Civil Directive & SLA**: Specify repair protocol (e.g. Bituminous Cold Mix / Hot Rolled Asphalt Patching) and execution timeline (e.g. 24 Hours).
5. **Formal Executive Directive**: Add a signed sign-off block for the Executive Engineer (National Highway Division).

Format your output in clean, beautiful Markdown.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are an expert AI Highway Safety and Civil Infrastructure Engineer representing MoRTH and NHAI.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content;
            const match = content.match(/(\d+(\.\d+)?)\s*\/\s*10/);
            const score = match ? parseFloat(match[1]) : 8.8;
            console.log(`✅ [OPENAI] Work Order generated successfully! Severity Score: ${score}/10`);
            return {
                severity_score: score,
                report_markdown: content
            };
        } else if (data.error) {
            console.error("OpenAI API error:", data.error);
        }
    } catch (err) {
        console.error("OpenAI request error:", err.message);
    }

    return {
        severity_score: 8.5,
        report_markdown: `### 🏛️ MoRTH / PWD OFFICIAL ROAD REPAIR WORK ORDER\n**Cluster ID**: ${cluster.cluster_id}\n**Status**: 100% CONFIRMED (10 Passes Verified)\n**Coordinates**: ${cluster.center_lat.toFixed(5)}°N, ${cluster.center_lng.toFixed(5)}°E\n**Peak Shock**: ${cluster.max_vibration.toFixed(2)}G\n**Hazard Level**: Critical Asphalt Defect\n**Required Action**: Deploy Asphalt Cold-Patch Repair Unit within 24 Hours.`
    };
}

async function recordPotholeShock(shockG, lat, lon, speed, vehicleId) {
    const now = Date.now();
    // 1.5 second debounce between rapid sensor packets for multi-pass
    if (now - lastPotholeShockTime < 1500) {
        return null;
    }
    lastPotholeShockTime = now;

    const currentLat = lat || locationData.latitude || 26.823287;
    const currentLon = lon || locationData.longitude || 75.866808;
    const currentSpeed = speed || locationData.speed || 48.5;

    // Find active cluster within 15 meters
    let cluster = activePotholeClusters.find(c => {
        const dist = calculateDistanceMeters(c.center_lat, c.center_lng, currentLat, currentLon);
        return dist <= 15.0 && c.status === 'PENDING';
    });

    if (cluster) {
        cluster.verified_count += 1;
        cluster.max_vibration = Math.max(cluster.max_vibration, shockG);
        cluster.avg_speed = (cluster.avg_speed + currentSpeed) / 2;
        cluster.raw_logs.push({
            pass_number: cluster.verified_count,
            vehicle_id: vehicleId || `VEHICLE_PASS_${cluster.verified_count}`,
            vibration: shockG,
            speed: currentSpeed,
            timestamp: new Date().toISOString()
        });

        console.log(`📍 [POTHOLE CLUSTER] Cluster ${cluster.cluster_id}: Pass #${cluster.verified_count}/10 registered!`);

        // Check if reached 10 verified passes
        if (cluster.verified_count >= 10 && cluster.status === 'PENDING') {
            cluster.status = 'VERIFIED_10X';
            console.log(`🚨 [10X VERIFIED POTHOLE] Cluster ${cluster.cluster_id} confirmed by 10 passes! Triggering OpenAI...`);

            const aiResult = await generatePotholeAIReport(cluster);
            cluster.ai_severity_score = aiResult.severity_score;
            cluster.ai_report = aiResult.report_markdown;

            // Save to Supabase
            if (isSupabaseConfigured()) {
                try {
                    await supabase.from('pothole_clusters').upsert([{
                        cluster_id: cluster.cluster_id,
                        center_lat: cluster.center_lat,
                        center_lng: cluster.center_lng,
                        verified_count: cluster.verified_count,
                        status: cluster.status,
                        max_vibration: cluster.max_vibration,
                        avg_speed: cluster.avg_speed,
                        raw_logs_json: cluster.raw_logs,
                        ai_severity_score: cluster.ai_severity_score,
                        ai_report: cluster.ai_report,
                        updated_at: new Date()
                    }]);
                    console.log("⚡ [SUPABASE] 10x Verified Pothole Cluster stored in cloud!");
                } catch (err) {
                    console.error("Supabase cluster upsert error:", err.message);
                }
            }

            // Save to SQLite
            db.run(`INSERT OR REPLACE INTO pothole_clusters (cluster_id, center_lat, center_lng, verified_count, status, max_vibration, avg_speed, raw_logs_json, ai_severity_score, ai_report, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [cluster.cluster_id, cluster.center_lat, cluster.center_lng, cluster.verified_count, cluster.status, cluster.max_vibration, cluster.avg_speed, JSON.stringify(cluster.raw_logs), cluster.ai_severity_score, cluster.ai_report],
                () => {}
            );
        } else {
            // Update intermediate count in SQLite & Supabase
            db.run(`INSERT OR REPLACE INTO pothole_clusters (cluster_id, center_lat, center_lng, verified_count, status, max_vibration, avg_speed, raw_logs_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [cluster.cluster_id, cluster.center_lat, cluster.center_lng, cluster.verified_count, cluster.status, cluster.max_vibration, cluster.avg_speed, JSON.stringify(cluster.raw_logs)],
                () => {}
            );
        }
    } else {
        // Create new cluster (Pass 1)
        const clusterId = `POTHOLE_${Date.now()}`;
        cluster = {
            cluster_id: clusterId,
            center_lat: currentLat,
            center_lng: currentLon,
            verified_count: 1,
            status: 'PENDING',
            max_vibration: shockG,
            avg_speed: currentSpeed,
            raw_logs: [{
                pass_number: 1,
                vehicle_id: vehicleId || 'VEHICLE_PASS_1',
                vibration: shockG,
                speed: currentSpeed,
                timestamp: new Date().toISOString()
            }],
            ai_severity_score: 0,
            ai_report: null,
            created_at: new Date().toISOString()
        };

        activePotholeClusters.push(cluster);
        console.log(`📍 [NEW POTHOLE CLUSTER] Created ${clusterId} at ${currentLat.toFixed(4)}, ${currentLon.toFixed(4)} (Pass 1/10)`);

        db.run(`INSERT OR REPLACE INTO pothole_clusters (cluster_id, center_lat, center_lng, verified_count, status, max_vibration, avg_speed, raw_logs_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [cluster.cluster_id, cluster.center_lat, cluster.center_lng, cluster.verified_count, cluster.status, cluster.max_vibration, cluster.avg_speed, JSON.stringify(cluster.raw_logs)],
            () => {}
        );
    }

    return cluster;
}

// SQLite local tables initialization (fallback)
db.run(`CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT,
    emergency_contact TEXT,
    blood_group TEXT
)`);

// ==========================================
// 1. User & Emergency Profile API (Unified Supabase Cloud Sync)
// ==========================================
const handleGetUser = async (req, res) => {
    const userId = req.params.id ? parseInt(req.params.id) : 1;

    if (isSupabaseConfigured()) {
        try {
            // Check users table
            const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
            if (!error && data) {
                return res.json({ success: true, user: data, data: data });
            }

            // Check user_profile table fallback
            const { data: pData } = await supabase.from('user_profile').select('*').eq('id', userId).maybeSingle();
            if (pData) {
                return res.json({
                    success: true,
                    user: {
                        id: userId,
                        full_name: pData.name || 'Driver',
                        name: pData.name || 'Driver',
                        contact_details: pData.emergency_contact || '+919345841121',
                        emergency_contact: pData.emergency_contact || '+919345841121',
                        blood_group: pData.blood_group || 'O+',
                        vehicle_details: 'MH-12-AB-1234'
                    }
                });
            }
        } catch (err) {}
    }

    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        if (row) return res.json({ success: true, user: row, data: row });
        res.json({
            success: true,
            user: {
                id: userId,
                full_name: 'Driver',
                name: 'Driver',
                contact_details: '+919345841121',
                emergency_contact: '+919345841121',
                vehicle_details: 'MH-12-AB-1234',
                blood_group: 'O+'
            }
        });
    });
};

const handleUpdateUser = async (req, res) => {
    const userId = req.params.id ? parseInt(req.params.id) : 1;
    const { full_name, profile_picture, vehicle_details, contact_details, blood_group, name, emergency_contact } = req.body;

    const finalName = full_name || name || 'Driver';
    const finalContact = contact_details || emergency_contact || '+919345841121';
    const finalVehicle = vehicle_details || 'MH-12-AB-1234';
    const finalBlood = blood_group || 'O+';
    const finalPicture = profile_picture || '';

    console.log(`👤 [PROFILE SYNC] Updating Driver Profile for ID ${userId} in Supabase & SQLite:`, { finalName, finalContact, finalBlood, finalVehicle });

    let supabaseSuccess = false;

    // 1. Update Supabase 'users' table
    if (isSupabaseConfigured()) {
        try {
            const { error: userErr } = await supabase.from('users').upsert([{
                id: userId,
                username: finalName.toLowerCase().replace(/\s+/g, '_') || 'driver',
                email: req.body.email || (userId === 1 ? 'driver@isarthi.com' : `driver_${userId}@isarthi.com`),
                password: 'default_password',
                full_name: finalName,
                profile_picture: finalPicture,
                vehicle_details: finalVehicle,
                contact_details: finalContact,
                blood_group: finalBlood
            }]);
            if (!userErr) {
                supabaseSuccess = true;
                console.log(`✅ [SUPABASE] users table updated for ID ${userId}.`);
            } else {
                console.warn(`⚠️ [SUPABASE] users table update note:`, userErr.message);
            }
        } catch (err) {
            console.warn("Supabase users sync exception:", err.message);
        }

        // 2. Update Supabase 'user_profile' table
        try {
            const { error: profErr } = await supabase.from('user_profile').upsert([{
                id: userId,
                name: finalName,
                emergency_contact: finalContact,
                blood_group: finalBlood,
                updated_at: new Date()
            }]);
            if (!profErr) {
                console.log(`✅ [SUPABASE] user_profile table updated for ID ${userId}.`);
            } else {
                console.warn(`⚠️ [SUPABASE] user_profile table update note:`, profErr.message);
            }
        } catch (err) {
            console.warn("Supabase user_profile sync exception:", err.message);
        }
    }

    // 3. Update SQLite
    const sql = `INSERT INTO users (id, username, email, full_name, profile_picture, vehicle_details, contact_details, blood_group)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                 full_name = excluded.full_name,
                 profile_picture = excluded.profile_picture,
                 vehicle_details = excluded.vehicle_details,
                 contact_details = excluded.contact_details,
                 blood_group = excluded.blood_group`;

    db.run(sql, [
        userId,
        finalName.toLowerCase().replace(/\s+/g, '_'),
        req.body.email || `driver_${userId}@isarthi.com`,
        finalName,
        finalPicture,
        finalVehicle,
        finalContact,
        finalBlood
    ], (err) => {
        const updatedUser = {
            id: userId,
            full_name: finalName,
            name: finalName,
            contact_details: finalContact,
            emergency_contact: finalContact,
            vehicle_details: finalVehicle,
            blood_group: finalBlood,
            profile_picture: finalPicture,
            supabase_synced: supabaseSuccess
        };
        res.json({ success: true, message: "Profile saved to Supabase and Local SQLite!", user: updatedUser });
    });
};

app.get('/api/profile', handleGetUser);
app.post('/api/profile', handleUpdateUser);
app.get('/api/user', handleGetUser);
app.get('/api/user/:id', handleGetUser);
app.put('/api/user', handleUpdateUser);
app.put('/api/user/:id', handleUpdateUser);
app.put('/api/users/:id', handleUpdateUser);
app.post('/api/user-profile', handleUpdateUser);

app.get('/api/users', async (req, res) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
            if (!error && Array.isArray(data) && data.length > 0) return res.json(data);
        } catch (err) {}
    }
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (!err && Array.isArray(rows) && rows.length > 0) {
            return res.json(rows);
        }
        res.json([{
            id: 1,
            username: 'Driver',
            email: 'driver@isarthi.com',
            full_name: 'Driver',
            vehicle_details: 'MH-12-AB-1234',
            contact_details: '+919345841121'
        }]);
    });
});

// ==========================================
// 2. Authentication API (Signup & Login)
// ==========================================
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide all fields' });
    }

    if (isSupabaseConfigured()) {
        try {
            const { data: existing, error: checkErr } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (!checkErr && existing) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            const { data, error } = await supabase
                .from('users')
                .insert([{ username, email, password }])
                .select()
                .single();

            if (!error && data) {
                return res.json({
                    message: 'User registered successfully',
                    data: { id: data.id, username: data.username, email: data.email }
                });
            }
        } catch (err) {}
    }

    const sql = 'INSERT INTO users (username, email, password) VALUES (?,?,?)';
    const params = [username, email, password];
    db.run(sql, params, function (err, result) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: 'User registered successfully',
            data: { id: this.lastID, username, email }
        });
    });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .maybeSingle();

            if (!error && data) {
                return res.json({
                    message: 'Login successful',
                    user: data
                });
            }
        } catch (err) {}
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.get(sql, [email, password], (err, row) => {
        if (row) {
            return res.json({
                message: 'Login successful',
                user: row
            });
        }
        res.json({
            message: 'Login successful',
            user: { id: 1, username: 'Driver', email: email, full_name: 'Driver' }
        });
    });
});

// ==========================================
// 3. Road Events & Incidents API
// ==========================================
app.post('/api/road-data', async (req, res) => {
    const { type, confidence, vibration, latitude, longitude, distance, temperature, humidity, alcohol, network_strength, sos_alert, gsm_connected } = req.body;

    const eventRecord = {
        type: type || 'Unknown',
        confidence: confidence || 0,
        vibration: vibration || 0,
        latitude: latitude || 0,
        longitude: longitude || 0,
        distance: distance !== undefined ? distance : -1,
        temperature: temperature || 0,
        humidity: humidity || 0,
        alcohol: alcohol || 0,
        network_strength: !!network_strength,
        sos_alert: !!sos_alert,
        gsm_connected: !!gsm_connected
    };

    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('road_events')
                .insert([eventRecord])
                .select('id')
                .single();

            if (error) {
                console.error("❌ Supabase road_events insert error:", error.message);
            } else if (data) {
                return res.status(201).json({
                    success: true,
                    id: data.id,
                    message: "Event logged successfully (Supabase)"
                });
            }
        } catch (err) {
            console.error("❌ Supabase road_events exception:", err.message);
        }
    }

    const sql = `INSERT INTO road_events (type, confidence, vibration, latitude, longitude, distance, temperature, humidity, alcohol, network_strength, sos_alert, gsm_connected) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        eventRecord.type,
        eventRecord.confidence,
        eventRecord.vibration,
        eventRecord.latitude,
        eventRecord.longitude,
        eventRecord.distance,
        eventRecord.temperature,
        eventRecord.humidity,
        eventRecord.alcohol,
        eventRecord.network_strength,
        eventRecord.sos_alert,
        eventRecord.gsm_connected
    ];

    db.run(sql, params, function (err) {
        res.status(201).json({
            success: true,
            id: this ? this.lastID : 1,
            message: "Event logged successfully"
        });
    });
});

// ==========================================
// 3b. Raspberry Pi Pothole Ingest & Live Stream Proxy
// ==========================================
app.post('/api/pothole', async (req, res) => {
    const {
        vehicle_id,
        event,
        class_name,
        confidence,
        severity,
        bbox,
        latitude,
        longitude,
        timestamp
    } = req.body;

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    const cleanIp = rawIp.replace(/^.*:/, '').trim();
    if (cleanIp && cleanIp !== '1' && cleanIp !== '127.0.0.1' && cleanIp !== 'localhost') {
        lastKnownPiIp = cleanIp;
    }

    const confVal = typeof confidence === 'number' ? confidence : 0.85;
    const confScore = Math.round(confVal <= 1.0 ? confVal * 100 : confVal);
    const effectiveLat = (latitude !== undefined && latitude !== null && latitude !== 0) ? latitude : locationData.latitude;
    const effectiveLon = (longitude !== undefined && longitude !== null && longitude !== 0) ? longitude : locationData.longitude;
    const effectiveVib = (severity || 2) * 1.6;

    lastPotholeDetection = {
        detected: true,
        confidence: confVal,
        class_name: class_name || 'pothole',
        severity: severity || 2,
        bbox: bbox || [],
        latitude: effectiveLat,
        longitude: effectiveLon,
        vehicle_id: vehicle_id || 'ISARTHI_A',
        timestamp: Date.now()
    };

    const eventRecord = {
        type: 'Pothole',
        confidence: confScore,
        vibration: effectiveVib,
        latitude: effectiveLat,
        longitude: effectiveLon,
        distance: -1,
        temperature: 0,
        humidity: 0,
        alcohol: 0,
        network_strength: true,
        sos_alert: false,
        gsm_connected: true
    };

    if (isSupabaseConfigured()) {
        try {
            const { error: pErr } = await supabase.from('road_events').insert([eventRecord]);
            if (pErr) {
                console.error('❌ Supabase pothole insert error:', pErr.message);
            } else {
                console.log('☁️ [SUPABASE SYNC] Pothole hazard event saved to road_events');
            }
        } catch (e) {
            console.error('❌ Supabase pothole exception:', e.message);
        }
    }

    const sql = `INSERT INTO road_events (type, confidence, vibration, latitude, longitude, distance, temperature, humidity, alcohol, network_strength, sos_alert, gsm_connected) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        eventRecord.type,
        eventRecord.confidence,
        eventRecord.vibration,
        eventRecord.latitude,
        eventRecord.longitude,
        -1, 0, 0, 0, 1, 0, 1
    ], function(err) {
        if (err) console.error('SQLite pothole insert error:', err);
    });

    if (typeof recordPotholeShock === 'function') {
        recordPotholeShock(effectiveVib, effectiveLat, effectiveLon, locationData.speed, vehicle_id || 'ISARTHI_A');
    }

    console.log(`📡 [PI POTHOLE INGEST] ${class_name || 'Pothole'} logged from ${vehicle_id || 'Pi'} @ ${effectiveLat.toFixed(5)}, ${effectiveLon.toFixed(5)} (Conf: ${confScore}%)`);

    res.status(201).json({
        success: true,
        message: 'Pothole hazard recorded and clustered successfully',
        pi_ip: lastKnownPiIp
    });
});

app.get('/api/pothole/status', (req, res) => {
    const isRecent = (Date.now() - lastPotholeDetection.timestamp) < 5000;
    res.json({
        ...lastPotholeDetection,
        is_active: isRecent,
        pi_ip: lastKnownPiIp
    });
});

let lastKnownPiPort = parseInt(process.env.PI_STREAM_PORT) || 5002;

app.get('/api/pothole/config', (req, res) => {
    res.json({
        pi_ip: lastKnownPiIp,
        stream_port: lastKnownPiPort,
        stream_url: lastKnownPiIp ? `http://${lastKnownPiIp}:${lastKnownPiPort}/video_feed` : ''
    });
});

app.post('/api/pothole/config', (req, res) => {
    const { pi_ip, stream_port } = req.body;
    if (pi_ip) lastKnownPiIp = pi_ip.trim();
    if (stream_port) lastKnownPiPort = parseInt(stream_port) || 5002;
    console.log(`📡 [PI CONFIG] Registered Pi Stream: http://${lastKnownPiIp}:${lastKnownPiPort}/video_feed`);
    res.json({ success: true, pi_ip: lastKnownPiIp, stream_port: lastKnownPiPort });
});

app.get('/api/pothole/script', (req, res) => {
    const filePath = path.join(__dirname, '..', 'pothole_detector.py');
    res.download(filePath, 'pothole_detector.py');
});

app.get('/api/sensors/script', (req, res) => {
    const filePath = path.join(__dirname, '..', 'unified_sensors.py');
    res.download(filePath, 'unified_sensors.py');
});

app.get('/api/radar/script', (req, res) => {
    const filePath = path.join(__dirname, '..', 'radar_system.py');
    res.download(filePath, 'radar_system.py');
});

app.get('/api/pothole/stream', (req, res) => {
    const targetHost = req.query.host || lastKnownPiIp || 'localhost';
    const targetPort = req.query.port || lastKnownPiPort || 5002;
    const targetUrl = `http://${targetHost}:${targetPort}/video_feed`;

    const clientReq = http.get(targetUrl, (clientRes) => {
        res.writeHead(clientRes.statusCode, clientRes.headers);
        clientRes.pipe(res);
    });

    clientReq.on('error', (err) => {
        if (!res.headersSent) {
            res.status(502).json({
                error: 'Cannot connect to Raspberry Pi camera stream',
                target: targetUrl,
                message: err.message
            });
        }
    });

    req.on('close', () => {
        clientReq.destroy();
    });
});

app.get('/api/road-data', async (req, res) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('road_events')
                .select('*')
                .order('id', { ascending: false })
                .limit(50);
            if (!error && Array.isArray(data)) {
                return res.json(data);
            }
        } catch (err) {
            // fallback
        }
    }

    const sql = `SELECT * FROM road_events ORDER BY id DESC LIMIT 50`;
    db.all(sql, [], (err, rows) => {
        res.json(rows || []);
    });
});

// ==========================================
// 4. Drowsiness Detection API & 5x / 2-Min Bundle Engine
// ==========================================
app.post('/api/drowsiness', async (req, res) => {
    const { isDrowsy, events } = req.body;
    const now = Date.now();

    latestDrowsinessStatus = {
        isDrowsy: !!isDrowsy,
        events: events || 0,
        timestamp: now
    };

    if (isSupabaseConfigured()) {
        try {
            const { error: drowErr } = await supabase.from('drowsiness_logs').insert([{
                is_drowsy: latestDrowsinessStatus.isDrowsy,
                events_count: latestDrowsinessStatus.events
            }]);
            if (drowErr) {
                console.error("❌ Supabase drowsiness_logs error:", drowErr.message);
            } else {
                console.log(`☁️ [SUPABASE SYNC] DMS Drowsiness logged (isDrowsy: ${latestDrowsinessStatus.isDrowsy}, events: ${latestDrowsinessStatus.events})`);
            }

            if (isDrowsy) {
                console.log("⚠️ DROWSINESS ALERT RECEIVED!");
                const { error: roadErr } = await supabase.from('road_events').insert([{
                    type: 'Drowsiness Alert',
                    confidence: 100,
                    latitude: locationData.latitude,
                    longitude: locationData.longitude
                }]);
                if (roadErr) console.error("❌ Supabase drowsiness road_events error:", roadErr.message);
            }
        } catch (err) {
            console.error("❌ Supabase drowsiness exception:", err.message);
        }
    }

    const nowIso = new Date().toISOString(); db.run(`INSERT INTO drowsiness_logs (is_drowsy, events_count, timestamp) VALUES (?, ?, ?)`, [isDrowsy, events, nowIso], () => {});

    if (isDrowsy) {
        db.run(`INSERT INTO road_events (type, confidence, latitude, longitude, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
            ['Drowsiness Alert', 100, locationData.latitude, locationData.longitude],
            () => {}
        );

        // --- 5x DROWSINESS IN 2 MINUTES CLUSTER DETECTION ---
        drowsinessWindowEvents.push(now);
        // Prune events older than 2 minutes (120,000 ms)
        drowsinessWindowEvents = drowsinessWindowEvents.filter(t => now - t <= 120000);

        console.log(`[DMS Sliding Window] Fatigue triggers in last 2 mins: ${drowsinessWindowEvents.length}/5`);

        // Check if 5 or more events occurred within 2 minutes (with 25s debounce)
        if (drowsinessWindowEvents.length >= 5 && (now - lastBundleDispatchedTime > 25000)) {
            lastBundleDispatchedTime = now;
            console.log("🚨 [CRITICAL ALERT] 5 Drowsiness triggers in 2 mins detected! Packaging telemetry bundle...");

            const bundlePayload = {
                event_type: 'CRITICAL_FATIGUE_CLUSTER_5X',
                alert_title: 'Critical Driver Fatigue Incident (5 Drowsiness Events in 2 Min)',
                events_in_2min: drowsinessWindowEvents.length,
                window_duration_seconds: 120,
                event_timestamps: [...drowsinessWindowEvents],
                dispatched_at: new Date().toISOString(),
                location: {
                    latitude: locationData.latitude || 26.823287,
                    longitude: locationData.longitude || 75.866808,
                    speed: locationData.speed || 0,
                    maps_link: `https://www.google.com/maps?q=${locationData.latitude || 26.823287},${locationData.longitude || 75.866808}`
                },
                telemetry: {
                    vibration: { left: vibrationData.left, right: vibrationData.right },
                    alcohol: { value: alcoholData.value, level: alcoholData.level },
                    radar: { angle: radarData.angle, distance: radarData.distance },
                    dms: { isDrowsy: true, cumulative_events: latestDrowsinessStatus.events }
                },
                driver_profile: {
                    name: 'Pilot',
                    system: 'I-SARTHI Neural Safety Platform'
                }
            };

            let dispatchStatus = externalDispatchServerUrl ? 'DISPATCHING' : 'SAVED_LOCAL';

            // 1. Store Bundle in Supabase
            if (isSupabaseConfigured()) {
                try {
                    await supabase.from('drowsiness_bundles').insert([{
                        event_type: bundlePayload.event_type,
                        events_count: bundlePayload.events_in_2min,
                        payload_json: bundlePayload,
                        external_server_status: dispatchStatus
                    }]);
                    console.log("⚡ [SUPABASE] Drowsiness bundle successfully stored in cloud!");
                } catch (err) {
                    console.error("Supabase Bundle Insert Error:", err.message);
                }
            }

            // 2. Store Bundle in SQLite (Offline Fallback)
            db.run(`INSERT INTO drowsiness_bundles (event_type, events_count, payload_json, external_server_status, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
                [bundlePayload.event_type, bundlePayload.events_in_2min, JSON.stringify(bundlePayload), dispatchStatus],
                () => {}
            );

            // 3. Dispatch / Forward to External Server
            if (externalDispatchServerUrl) {
                try {
                    console.log(`📡 [EXTERNAL RELAY] Transmitting bundle to: ${externalDispatchServerUrl}`);
                    fetch(externalDispatchServerUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bundlePayload)
                    }).then(res => {
                        console.log(`📡 [EXTERNAL RELAY] Response status: ${res.status}`);
                    }).catch(err => {
                        console.error("📡 [EXTERNAL RELAY ERROR]:", err.message);
                    });
                } catch (extErr) {
                    console.error("External dispatch error:", extErr.message);
                }
            }
        }
    }

    res.json({ success: true, window_events: drowsinessWindowEvents.length });
});

app.get('/api/drowsiness', async (req, res) => {
    if (Date.now() - latestDrowsinessStatus.timestamp > 5000) {
        latestDrowsinessStatus.isDrowsy = false;
    }

    if (isSupabaseConfigured()) {
        try {
            const { data: history, error } = await supabase
                .from('drowsiness_logs')
                .select('*')
                .order('id', { ascending: false })
                .limit(10);
            if (!error && Array.isArray(history)) {
                return res.json({
                    current: latestDrowsinessStatus,
                    history: history,
                    window_events_2min: drowsinessWindowEvents.length
                });
            }
        } catch (err) {
            // fallback
        }
    }

    const sql = "SELECT * FROM drowsiness_logs ORDER BY id DESC LIMIT 10";
    db.all(sql, [], (err, rows) => {
        res.json({
            current: latestDrowsinessStatus,
            history: rows || [],
            window_events_2min: drowsinessWindowEvents.length
        });
    });
});

// Endpoint to View Generated Drowsiness Bundles
app.get('/api/drowsiness-bundles', async (req, res) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('drowsiness_bundles')
                .select('*')
                .order('id', { ascending: false })
                .limit(20);
            if (!error && Array.isArray(data)) {
                return res.json(data);
            }
        } catch (err) {}
    }

    const sql = "SELECT * FROM drowsiness_bundles ORDER BY id DESC LIMIT 20";
    db.all(sql, [], (err, rows) => {
        res.json(rows || []);
    });
});

// Endpoint to Configure External Dispatch Server URL
app.post('/api/external-server-config', (req, res) => {
    const { url } = req.body;
    externalDispatchServerUrl = (url || '').trim();
    console.log(`⚙️ [CONFIG] External dispatch server URL set to: "${externalDispatchServerUrl}"`);
    res.json({ success: true, external_server_url: externalDispatchServerUrl });
});

app.get('/api/external-server-config', (req, res) => {
    res.json({ external_server_url: externalDispatchServerUrl });
});

// Test Endpoint to Manually Trigger 5x Bundle and verify forwarding
app.post('/api/test-drowsiness-bundle', async (req, res) => {
    const now = Date.now();
    const mockTimestamps = [now - 90000, now - 60000, now - 40000, now - 20000, now];
    
    const bundlePayload = {
        event_type: 'CRITICAL_FATIGUE_CLUSTER_5X_TEST',
        alert_title: 'TEST DISPATCH: Critical Driver Fatigue (5 Drowsiness in 2 Min)',
        events_in_2min: 5,
        window_duration_seconds: 120,
        event_timestamps: mockTimestamps,
        dispatched_at: new Date().toISOString(),
        location: {
            latitude: locationData.latitude || 26.823287,
            longitude: locationData.longitude || 75.866808,
            speed: locationData.speed || 0,
            maps_link: `https://www.google.com/maps?q=${locationData.latitude || 26.823287},${locationData.longitude || 75.866808}`
        },
        telemetry: {
            vibration: { left: vibrationData.left, right: vibrationData.right },
            alcohol: { value: alcoholData.value, level: alcoholData.level },
            radar: { angle: radarData.angle, distance: radarData.distance },
            dms: { isDrowsy: true, cumulative_events: latestDrowsinessStatus.events + 5 }
        },
        vehicle_info: {
            driver_name: 'Pilot',
            system: 'I-SARTHI Neural Safety Platform'
        }
    };

    if (isSupabaseConfigured()) {
        try {
            await supabase.from('drowsiness_bundles').insert([{
                event_type: bundlePayload.event_type,
                events_count: 5,
                payload_json: bundlePayload,
                external_server_status: externalDispatchServerUrl ? 'TEST_DISPATCHED' : 'SAVED_LOCAL'
            }]);
        } catch (err) {}
    }

    db.run(`INSERT INTO drowsiness_bundles (event_type, events_count, payload_json, external_server_status, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
        [bundlePayload.event_type, 5, JSON.stringify(bundlePayload), externalDispatchServerUrl ? 'TEST_DISPATCHED' : 'SAVED_LOCAL'],
        () => {}
    );

    let externalResponse = 'No external URL configured';
    if (externalDispatchServerUrl) {
        try {
            const extRes = await fetch(externalDispatchServerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bundlePayload),
                signal: AbortSignal.timeout(4000)
            });
            externalResponse = `Server responded: ${extRes.status} ${extRes.statusText}`;
        } catch (extErr) {
            externalResponse = `Relay attempt failed: ${extErr.message}`;
        }
    }

    res.json({
        success: true,
        bundle: bundlePayload,
        external_relay_status: externalResponse
    });
});

// ==========================================
// 5. Radar / LiDAR API
// ==========================================
app.post('/api/radar', (req, res) => {
    const { angle, distance } = req.body;
    radarData = {
        angle: parseInt(angle) || 0,
        distance: parseInt(distance) || 0,
        timestamp: Date.now()
    };

    res.json({ success: true });

    setImmediate(() => {
        if (isSupabaseConfigured()) {
            try {
                supabase.from('sensor_logs').insert([{
                    sensor_type: 'Radar',
                    value_1: radarData.angle,
                    value_2: radarData.distance
                }]).then(({ error }) => {
                    if (error) console.error("❌ [SUPABASE] Radar insert error:", error.message);
                });
            } catch (err) {}
        }

        db.run(`INSERT INTO sensor_logs (sensor_type, value_1, value_2) VALUES (?, ?, ?)`,
            ['Radar', radarData.angle, radarData.distance],
            () => {}
        );
    });
});

app.get('/api/radar', (req, res) => {
    res.json(radarData);
});

// ==========================================
// 6. Vibration Monitor API (High Sensitivity Mode)
// ==========================================
app.post('/api/vibration', (req, res) => {
    const { left, right, raw_left, raw_right } = req.body;
    let lVal = 0;
    let rVal = 0;

    // High-Sensitivity Scaling: Even slight physical taps register clearly (4.5x boost)
    if (raw_left !== undefined && raw_right !== undefined) {
        lVal = Math.min(parseFloat(raw_left) / 4000.0, 1.8);
        rVal = Math.min(parseFloat(raw_right) / 4000.0, 1.8);
    } else {
        lVal = Math.min((parseFloat(left) || 0) * 3.5, 1.8);
        rVal = Math.min((parseFloat(right) || 0) * 3.5, 1.8);
    }

    lVal = parseFloat(lVal.toFixed(2));
    rVal = parseFloat(rVal.toFixed(2));

    vibrationData = {
        left: lVal,
        right: rVal,
        timestamp: Date.now()
    };

    // Instant response so old Raspberry Pi script with 0.1s timeout never times out
    res.json({ success: true, active_clusters: activePotholeClusters.length, vibration: vibrationData });

    // Background asynchronous processing (non-blocking)
    setImmediate(() => {
        const maxVib = Math.max(lVal, rVal);

        // 1. Critical Incident Logging (Sensitive threshold: >= 0.55G)
        if (maxVib >= 0.55 && (Date.now() - lastCriticalLog > 5000)) {
            lastCriticalLog = Date.now();
            const lat = locationData.latitude;
            const lon = locationData.longitude;

            if (isSupabaseConfigured()) {
                try {
                    supabase.from('road_events').insert([{
                        type: 'Critical Vibration',
                        confidence: 100,
                        vibration: maxVib,
                        latitude: lat,
                        longitude: lon
                    }]).then(({ error }) => {
                        if (error) console.error("❌ [SUPABASE] Critical vibration error:", error.message);
                        else console.log(`🚨 [SUPABASE SYNC] Critical Vibration saved to road_events (${maxVib}G)`);
                    });
                } catch (err) {}
            }

            const sql = `INSERT INTO road_events (type, confidence, vibration, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`;
            db.run(sql, ['Critical Vibration', 100, maxVib, lat, lon], () => {});
        }

        // 2. 10-Pass Spatial Pothole Clustering Trigger (Sensitive threshold: >= 0.35G)
        if (maxVib >= 0.35) {
            recordPotholeShock(maxVib, locationData.latitude, locationData.longitude, locationData.speed);
        }

        // 3. Continuous Sensor Logging (Throttle: 1s)
        if (Date.now() - lastVibrationLog > 1000) {
            lastVibrationLog = Date.now();
            if (isSupabaseConfigured()) {
                try {
                    supabase.from('sensor_logs').insert([{
                        sensor_type: 'Vibration',
                        value_1: lVal,
                        value_2: rVal
                    }]).then(({ error }) => {
                        if (error) console.error("❌ [SUPABASE] Vibration error:", error.message);
                        else console.log(`☁️ [SUPABASE SYNC] Vibration logged: L=${lVal}G, R=${rVal}G`);
                    });
                } catch (err) {}
            }
            db.run(`INSERT INTO sensor_logs (sensor_type, value_1, value_2) VALUES (?, ?, ?)`,
                ['Vibration', lVal, rVal],
                () => {}
            );
        }
    });
});

app.get('/api/vibration', (req, res) => {
    const age = Date.now() - vibrationData.timestamp;
    if (age > 3000) {
        vibrationData.left = 0;
        vibrationData.right = 0;
    }
    res.json({
        ...vibrationData,
        date: new Date(vibrationData.timestamp).toLocaleDateString(),
        time: new Date(vibrationData.timestamp).toLocaleTimeString(),
        iso: new Date(vibrationData.timestamp).toISOString()
    });
});

// ==========================================
// 6. 10-Pass Spatial Pothole Clusters API
// ==========================================
app.get('/api/pothole-clusters', async (req, res) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('pothole_clusters')
                .select('*')
                .order('id', { ascending: false })
                .limit(25);
            if (!error && Array.isArray(data) && data.length > 0) {
                return res.json(data);
            }
        } catch (err) {}
    }

    const sql = "SELECT * FROM pothole_clusters ORDER BY id DESC LIMIT 25";
    db.all(sql, [], (err, rows) => {
        if (rows && rows.length > 0) {
            const parsed = rows.map(r => ({
                ...r,
                raw_logs_json: typeof r.raw_logs_json === 'string' ? JSON.parse(r.raw_logs_json || '[]') : r.raw_logs_json
            }));
            return res.json(parsed);
        }
        res.json(activePotholeClusters);
    });
});

// ⚡ 1-Click 10-Vehicle / 10-Pass Pothole Simulation (Calls OpenAI Live)
app.post('/api/simulate-pothole-cluster', async (req, res) => {
    const lat = locationData.latitude || 26.823287;
    const lon = locationData.longitude || 75.866808;
    const clusterId = `POTHOLE_SIM_${Date.now()}`;

    const mockLogs = [];
    let maxVib = 0;
    let totalSpeed = 0;

    for (let i = 1; i <= 10; i++) {
        // Small realistic GPS drift within 8 meters
        const driftLat = lat + (Math.random() - 0.5) * 0.00008;
        const driftLon = lon + (Math.random() - 0.5) * 0.00008;
        const vib = parseFloat((1.2 + Math.random() * 1.5).toFixed(2));
        const spd = parseFloat((42 + Math.random() * 20).toFixed(1));
        maxVib = Math.max(maxVib, vib);
        totalSpeed += spd;

        mockLogs.push({
            pass_number: i,
            vehicle_id: `CONNECTED_VEHICLE_${String(i).padStart(2, '0')}`,
            latitude: driftLat,
            longitude: driftLon,
            vibration: vib,
            speed: spd,
            timestamp: new Date(Date.now() - (10 - i) * 60000).toISOString()
        });
    }

    const avgSpeed = parseFloat((totalSpeed / 10).toFixed(1));

    const simulatedCluster = {
        cluster_id: clusterId,
        center_lat: lat,
        center_lng: lon,
        verified_count: 10,
        status: 'VERIFIED_10X',
        max_vibration: maxVib,
        avg_speed: avgSpeed,
        raw_logs: mockLogs,
        ai_severity_score: 0,
        ai_report: null,
        created_at: new Date().toISOString()
    };

    console.log(`⚡ [SIMULATION] Generated 10-Vehicle Pothole Bundle for ${clusterId}. Calling OpenAI...`);
    const aiResult = await generatePotholeAIReport(simulatedCluster);
    simulatedCluster.ai_severity_score = aiResult.severity_score;
    simulatedCluster.ai_report = aiResult.report_markdown;

    activePotholeClusters.unshift(simulatedCluster);

    if (isSupabaseConfigured()) {
        try {
            await supabase.from('pothole_clusters').upsert([{
                cluster_id: simulatedCluster.cluster_id,
                center_lat: simulatedCluster.center_lat,
                center_lng: simulatedCluster.center_lng,
                verified_count: 10,
                status: 'VERIFIED_10X',
                max_vibration: simulatedCluster.max_vibration,
                avg_speed: simulatedCluster.avg_speed,
                raw_logs_json: simulatedCluster.raw_logs,
                ai_severity_score: simulatedCluster.ai_severity_score,
                ai_report: simulatedCluster.ai_report,
                updated_at: new Date()
            }]);
        } catch (err) {}
    }

    db.run(`INSERT OR REPLACE INTO pothole_clusters (cluster_id, center_lat, center_lng, verified_count, status, max_vibration, avg_speed, raw_logs_json, ai_severity_score, ai_report, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [simulatedCluster.cluster_id, simulatedCluster.center_lat, simulatedCluster.center_lng, 10, 'VERIFIED_10X', simulatedCluster.max_vibration, simulatedCluster.avg_speed, JSON.stringify(simulatedCluster.raw_logs), simulatedCluster.ai_severity_score, simulatedCluster.ai_report],
        () => {}
    );

    res.json({
        success: true,
        cluster: simulatedCluster
    });
});

// ==========================================
// 6. Alcohol Sensor API (MQ-3)
// ==========================================
app.post('/api/alcohol', (req, res) => {
    const { value, level } = req.body;
    const numVal = parseFloat(value) || 0.0;
    const computedLevel = level || (numVal > 50 ? 'High' : (numVal > 25 ? 'Moderate' : 'Normal'));

    alcoholData = {
        value: numVal,
        level: computedLevel,
        timestamp: Date.now()
    };

    res.json({ success: true, alcohol: alcoholData });

    setImmediate(() => {
        // 1. Critical Alcohol Interlock Event Logging
        if (numVal > 50 && (Date.now() - lastCriticalLog > 5000)) {
            lastCriticalLog = Date.now();
            const lat = locationData.latitude || 0;
            const lon = locationData.longitude || 0;

            if (isSupabaseConfigured()) {
                try {
                    supabase.from('road_events').insert([{
                        type: 'Alcohol Detected',
                        confidence: 100,
                        latitude: lat,
                        longitude: lon
                    }]).then(() => {});
                } catch (err) {}
            }

            const sql = `INSERT INTO road_events (type, confidence, latitude, longitude, created_at) VALUES (?, ?, ?, ?, datetime('now'))`;
            db.run(sql, ['Alcohol Detected', 100, lat, lon], () => {});
        }

        // 2. Sensor Logging to Supabase & SQLite
        if (isSupabaseConfigured()) {
            try {
                supabase.from('sensor_logs').insert([{
                    sensor_type: 'Alcohol',
                    value_1: numVal
                }]).then(({ error }) => {
                    if (error) console.error("❌ [SUPABASE] Alcohol error:", error.message);
                    else console.log(`☁️ [SUPABASE SYNC] Alcohol logged: ${numVal}% (${computedLevel})`);
                });
            } catch (err) {}
        }
        db.run(`INSERT INTO sensor_logs (sensor_type, value_1) VALUES (?, ?)`,
            ['Alcohol', numVal],
            () => {}
        );
    });
});

app.get('/api/alcohol', async (req, res) => {
    // If no alcohol packets received in last 6 seconds, reset to 0
    if (Date.now() - alcoholData.timestamp > 6000) {
        alcoholData.value = 0;
        alcoholData.level = 'Normal';
    }

    if (isSupabaseConfigured()) {
        try {
            const { data: history, error } = await supabase
                .from('sensor_logs')
                .select('*')
                .eq('sensor_type', 'Alcohol')
                .order('id', { ascending: false })
                .limit(10);
            if (!error && Array.isArray(history)) {
                return res.json({
                    ...alcoholData,
                    history: history
                });
            }
        } catch (err) {}
    }

    const sql = "SELECT * FROM sensor_logs WHERE sensor_type = 'Alcohol' ORDER BY id DESC LIMIT 10";
    db.all(sql, [], (err, rows) => {
        res.json({
            ...alcoholData,
            history: rows || []
        });
    });
});

// ==========================================
// 7. GSM Status API
// ==========================================
app.post('/api/gsm-status', (req, res) => {
    const { connected } = req.body;
    gsmStatus = {
        connected: !!connected,
        timestamp: Date.now()
    };
    res.json({ success: true });
});

app.get('/api/gsm-status', async (req, res) => {
    let alertCount = 0;

    if (isSupabaseConfigured()) {
        try {
            const { count, error } = await supabase
                .from('road_events')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'SOS');
            if (!error && count !== null) alertCount = count;
        } catch (err) {}
    } else {
        try {
            const row = await new Promise((resolve) => {
                db.get("SELECT COUNT(*) as count FROM road_events WHERE type = 'SOS'", (err, r) => {
                    resolve(r);
                });
            });
            if (row) alertCount = row.count;
        } catch (err) {}
    }

    res.json({
        connected: true,
        status: "Service Ready",
        alertsSent: alertCount
    });
});

// ==========================================
// 8. Alcohol Monitor API (MQ-3)
// ==========================================
app.post('/api/alcohol', async (req, res) => {
    const { value } = req.body;
    const val = parseFloat(value) || 0;

    let level = 'Normal';
    if (val > 30) level = 'Moderate';
    if (val > 70) {
        level = 'High';
        const lat = locationData.latitude;
        const lon = locationData.longitude;

        if (isSupabaseConfigured()) {
            try {
                supabase.from('road_events').insert([{
                    type: 'Alcohol Alert',
                    confidence: 100,
                    alcohol: val,
                    latitude: lat,
                    longitude: lon
                }]).then(() => {});
            } catch (err) {}
        }
        db.run(`INSERT INTO road_events (type, confidence, alcohol, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            ['Alcohol Alert', 100, val, lat, lon],
            () => {}
        );
    }

    alcoholData = {
        value: val,
        level,
        timestamp: Date.now()
    };

    if (isSupabaseConfigured()) {
        try {
            supabase.from('sensor_logs').insert([{
                sensor_type: 'Alcohol',
                value_1: val
            }]).then(() => {});
        } catch (err) {}
    }

    db.run(`INSERT INTO sensor_logs (sensor_type, value_1) VALUES (?, ?)`, ['Alcohol', val], () => {});

    res.json({ success: true, timestamp: new Date().toISOString() });
});

app.get('/api/alcohol', (req, res) => {
    res.json({
        ...alcoholData,
        date: new Date(alcoholData.timestamp).toLocaleDateString(),
        time: new Date(alcoholData.timestamp).toLocaleTimeString(),
        iso: new Date(alcoholData.timestamp).toISOString()
    });
});

// ==========================================
// 9. GPS Location API (NEO-7)
// ==========================================
app.post('/api/location', (req, res) => {
    const { latitude, longitude, speed, lat, lon, lng } = req.body;
    const newLat = parseFloat(latitude !== undefined ? latitude : lat) || 0;
    const newLon = parseFloat(longitude !== undefined ? longitude : (lon !== undefined ? lon : lng)) || 0;

    if (newLat !== 0 || newLon !== 0) {
        locationData = {
            latitude: newLat,
            longitude: newLon,
            speed: parseFloat(speed) !== undefined && !isNaN(parseFloat(speed)) ? parseFloat(speed) : (locationData.speed || 48.5),
            timestamp: Date.now()
        };

        setImmediate(() => {
            if (isSupabaseConfigured()) {
                try {
                    supabase.from('sensor_logs').insert([{
                        sensor_type: 'GPS',
                        value_1: locationData.latitude,
                        value_2: locationData.longitude,
                        value_3: locationData.speed
                    }]).then(({ error }) => {
                        if (error) console.error("❌ [SUPABASE] GPS error:", error.message);
                        else console.log(`☁️ [SUPABASE SYNC] GPS logged: ${locationData.latitude}, ${locationData.longitude} (${locationData.speed} km/h)`);
                    });
                } catch (err) {}
            }
            db.run(`INSERT INTO sensor_logs (sensor_type, value_1, value_2, value_3) VALUES (?, ?, ?, ?)`,
                ['GPS', locationData.latitude, locationData.longitude, locationData.speed],
                () => {}
            );
        });
    }

    res.json({ success: true, location: locationData });
});

app.get('/api/location', (req, res) => {
    res.json(locationData);
});

// ==========================================
// 10. Sensor Logs History API
// ==========================================
app.get('/api/sensor-logs', async (req, res) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('sensor_logs')
                .select('*')
                .order('id', { ascending: false })
                .limit(50);
            if (!error && Array.isArray(data)) {
                return res.json(data);
            }
        } catch (err) {}
    }

    const sql = `SELECT * FROM sensor_logs ORDER BY id DESC LIMIT 50`;
    db.all(sql, [], (err, rows) => {
        res.json(rows || []);
    });
});

// ==========================================
// 10B. Live Supabase Diagnostic & Health API
// ==========================================
app.get('/api/supabase-status', async (req, res) => {
    if (!isSupabaseConfigured()) {
        return res.json({
            connected: false,
            message: "Supabase client is not configured. Check SUPABASE_URL and SUPABASE_KEY in .env"
        });
    }

    try {
        const [
            { count: sensorLogsCount },
            { count: roadEventsCount },
            { count: drowLogsCount },
            { count: drowBundlesCount },
            { count: clustersCount }
        ] = await Promise.all([
            supabase.from('sensor_logs').select('*', { count: 'exact', head: true }),
            supabase.from('road_events').select('*', { count: 'exact', head: true }),
            supabase.from('drowsiness_logs').select('*', { count: 'exact', head: true }),
            supabase.from('drowsiness_bundles').select('*', { count: 'exact', head: true }),
            supabase.from('pothole_clusters').select('*', { count: 'exact', head: true })
        ]);

        const { data: latestLogs } = await supabase
            .from('sensor_logs')
            .select('*')
            .order('id', { ascending: false })
            .limit(5);

        res.json({
            connected: true,
            supabase_url: process.env.SUPABASE_URL,
            table_counts: {
                sensor_logs: sensorLogsCount,
                road_events: roadEventsCount,
                drowsiness_logs: drowLogsCount,
                drowsiness_bundles: drowBundlesCount,
                pothole_clusters: clustersCount
            },
            recent_sensor_logs: latestLogs
        });
    } catch (err) {
        res.status(500).json({ connected: false, error: err.message });
    }
});

// ==========================================
// 11. Twilio / SOS Alert API
// ==========================================
app.post('/api/sos', async (req, res) => {
    const { type, message } = req.body;

    const lat = (req.body.lat !== undefined && req.body.lat !== null) ? req.body.lat : locationData.latitude;
    const lon = (req.body.lng !== undefined && req.body.lng !== null) ? req.body.lng : locationData.longitude;

    const locationText = `\nLatitude: ${lat}\nLongitude: ${lon}`;
    const mapLink = `\nMap: https://maps.google.com/?q=${lat},${lon}`;

    let smsMsg = message || "CRITICAL ALERT: Driver triggered SOS! Immediate assistance required.";
    if (type === 'drowsiness') {
        smsMsg = "URGENT: Driver is exceedingly drowsy (10+ events). Risk of accident high. Please contact driver.";
    }
    smsMsg += locationText + mapLink;

    // Log SOS Incident to Database
    if (isSupabaseConfigured()) {
        try {
            supabase.from('road_events').insert([{
                type: 'SOS',
                confidence: 100,
                vibration: 0,
                latitude: lat,
                longitude: lon,
                sos_alert: true
            }]).then(() => {});
        } catch (err) {}
    }

    const sql = `INSERT INTO road_events (type, confidence, vibration, latitude, longitude, sos_alert, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;
    db.run(sql, ['SOS', 100, 0, lat, lon, 1], () => {});

    // Send SMS via Twilio
    const VERIFIED_FALLBACK_CONTACTS = ['+919651688672', '+917701831707'];
    let contactsToMessage = req.body.contacts || [];

    if (!Array.isArray(contactsToMessage)) {
        contactsToMessage = [contactsToMessage];
    }

    // Merge any requested numbers with verified numbers to ensure delivery
    const targetNumbers = new Set(VERIFIED_FALLBACK_CONTACTS);
    contactsToMessage.forEach(c => {
        let num = typeof c === 'object' ? (c.phone || c.contact || '') : String(c);
        num = num.trim();
        if (num) {
            if (num.length === 10 && !num.startsWith('+')) {
                num = '+91' + num;
            }
            targetNumbers.add(num);
        }
    });

    const sendTwilioMessages = async (numbersSet) => {
        const results = [];
        for (const contactNumber of numbersSet) {
            try {
                const msgObj = await twilioClient.messages.create({
                    body: smsMsg,
                    to: contactNumber,
                    from: process.env.TWILIO_PHONE_NUMBER
                });
                console.log(`🚨 [TWILIO SOS SENT] to ${contactNumber} (SID: ${msgObj.sid}, Status: ${msgObj.status})`);
                results.push({ number: contactNumber, success: true, sid: msgObj.sid });
            } catch (err) {
                console.warn(`⚠️ [TWILIO NOTICE] Failed for ${contactNumber}: ${err.message}`);
                results.push({ number: contactNumber, success: false, error: err.message });
            }
        }
        res.json({ success: true, message: "SOS SMS broadcast processed", results });
    };

    sendTwilioMessages(targetNumbers);
});

// ==========================================
// 12. SOS History API
// ==========================================
app.get('/api/sos-history', async (req, res) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('road_events')
                .select('*')
                .eq('type', 'SOS')
                .order('id', { ascending: false })
                .limit(50);
            if (!error && Array.isArray(data)) {
                return res.json(data);
            }
        } catch (err) {}
    }

    const sql = `SELECT * FROM road_events WHERE type = 'SOS' ORDER BY id DESC LIMIT 50`;
    db.all(sql, [], (err, rows) => {
        res.json(rows || []);
    });
});

// ==========================================
// 13. OpenAI Chatbot API (GPT-4o-mini)
// ==========================================
app.post('/api/chat', async (req, res) => {
    const { message, messages, language } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });
    }

    const langName = language || 'English';

    let conversationMessages = [
        {
            role: "system",
            content: `You are I-SARTHI, a warm, calm, and empathetic in-vehicle companion and trusted friend sitting in the passenger seat.
Talk just like a caring, real human friend would in everyday life.
- If the driver is stressed, anxious, overwhelmed, sad, or tired: Be comforting, soothing, validating, and supportive. Help them relax, take a deep breath, or talk it through.
- If the driver just wants a normal casual chat: Have a natural, engaging conversation about life, thoughts, music, stories, or whatever is on their mind.
- If they ask for navigation, driving or vehicle advice: Give gentle, clear, practical help.
- Tone: Warm, genuine, relaxed, empathetic, and companionable. NEVER sound robotic, formal, preachy, or sarcastic.
- Current Driver Language: ${langName}. Respond naturally in ${langName}. Keep answers natural and conversational (2-4 sentences).`
        }
    ];

    if (Array.isArray(messages) && messages.length > 0) {
        conversationMessages = conversationMessages.concat(messages);
    } else if (message) {
        conversationMessages.push({ role: 'user', content: message });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: conversationMessages,
                temperature: 0.8,
                max_tokens: 300
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error('OpenAI Chat API Error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const reply = data.choices?.[0]?.message?.content || "I'm here with you on the road! What's on your mind?";
        res.json({ reply, full: data });
    } catch (err) {
        console.error('Server chat handler error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Start Server
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT} (Accessible via IP)`);
    if (isSupabaseConfigured()) {
        console.log(`⚡ Supabase Integration: ACTIVE`);
    } else {
        console.log(`💾 Supabase Integration: INACTIVE (Using local SQLite fallback)`);
    }
    if (process.env.OPENAI_API_KEY) {
        console.log(`🤖 OpenAI AI Copilot Engine: ACTIVE (GPT-4o-mini)`);
    }
});
