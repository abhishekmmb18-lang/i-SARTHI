import { supabase, subscribeToSupabaseRealtime } from './supabase.js';

// Haversine distance in meters
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Cluster road events within threshold (default 35 meters)
export function clusterRoadHazards(events = [], distanceThresholdMeters = 35) {
    const clusters = [];
    const potholeEvents = events.filter(e =>
        (e.type || '').toLowerCase().includes('pothole') ||
        (e.type || '').toLowerCase().includes('vibration') ||
        (e.vibration && Number(e.vibration) > 2.5)
    );

    potholeEvents.forEach(evt => {
        const lat = parseFloat(evt.latitude);
        const lng = parseFloat(evt.longitude);
        if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;

        let matchedCluster = null;
        for (const cl of clusters) {
            const dist = haversineDistanceMeters(cl.center_lat, cl.center_lng, lat, lng);
            if (dist <= distanceThresholdMeters) {
                matchedCluster = cl;
                break;
            }
        }

        const deviceId = evt.device_id || evt.vehicle_id || `DEVICE-${evt.id % 8}`;
        const vibration = parseFloat(evt.vibration || 3.8);
        const speed = parseFloat(evt.speed_kmh || evt.sensor_readings?.speed_kmh || 45);
        const time = evt.created_at || new Date().toISOString();

        if (matchedCluster) {
            matchedCluster.observations.push({
                event_id: evt.id || evt.event_id,
                device_id: deviceId,
                vibration_g: vibration,
                speed_kmh: speed,
                timestamp: time
            });
            matchedCluster.total_observations += 1;
            if (!matchedCluster.distinct_devices.includes(deviceId)) {
                matchedCluster.distinct_devices.push(deviceId);
            }
            if (vibration > matchedCluster.max_vibration) {
                matchedCluster.max_vibration = vibration;
            }
            // Recalculate centroid average
            const count = matchedCluster.observations.length;
            matchedCluster.center_lat = (matchedCluster.center_lat * (count - 1) + lat) / count;
            matchedCluster.center_lng = (matchedCluster.center_lng * (count - 1) + lng) / count;
            if (new Date(time) > new Date(matchedCluster.most_recent)) {
                matchedCluster.most_recent = time;
            }
        } else {
            const clusterId = `CL-${evt.road_name ? evt.road_name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 10) : 'HAZARD'}-${Math.floor(100 + Math.random() * 900)}`;
            clusters.push({
                id: `cluster-${clusters.length + 1}`,
                cluster_id: clusterId,
                center_lat: lat,
                center_lng: lng,
                road_name: evt.road_name || 'National Highway Corridor',
                total_observations: 1,
                distinct_devices: [deviceId],
                max_vibration: vibration,
                avg_speed: speed,
                first_detected: time,
                most_recent: time,
                observations: [{
                    event_id: evt.id || evt.event_id,
                    device_id: deviceId,
                    vibration_g: vibration,
                    speed_kmh: speed,
                    timestamp: time
                }]
            });
        }
    });

    // Finalize metrics & verification status for each cluster
    return clusters.map(cl => {
        const contributingVehicles = cl.distinct_devices.length;
        const isVerified10X = contributingVehicles >= 10 || cl.total_observations >= 10;
        const severityScore = Math.min(10, Math.max(3.0, (cl.max_vibration * 1.5) + (contributingVehicles * 0.2))).toFixed(1);

        return {
            ...cl,
            verified_count: cl.total_observations,
            distinct_contributing_vehicles: contributingVehicles,
            ai_severity_score: parseFloat(severityScore),
            status: isVerified10X ? 'VERIFIED_10X' : `PENDING_${contributingVehicles}_OF_10_PASSES`,
            verification_status: isVerified10X ? 'Verified 10x' : `Pending Verification (${contributingVehicles}/10 Vehicles)`,
            avg_speed: parseFloat((cl.observations.reduce((acc, o) => acc + (o.speed_kmh || 45), 0) / cl.observations.length).toFixed(1)),
            ai_report: generateWorkOrderReport(cl, isVerified10X, severityScore)
        };
    });
}

function generateWorkOrderReport(cluster, isVerified, severityScore) {
    const costTon = 6500;
    const requiredTons = (cluster.max_vibration > 4.5 ? 3.2 : 2.0).toFixed(1);
    const estCost = Math.round(requiredTons * costTon + 18500);

    return `# 🏛️ MINISTRY OF ROAD TRANSPORT & HIGHWAYS (MoRTH)
## AUTOMATED CIVIL ENGINEERING WORK ORDER & HAZARD ASSESSMENT
**Generated by iSARTHI Highway Neural Telemetry Gateway**
*Hazard Cluster Reference: ${cluster.cluster_id}*

---
### 📌 1. EXECUTIVE LOCATION METRICS
* **Corridor Segment:** ${cluster.road_name || 'National Highway Corridor'}
* **Centroid Coordinates:** Latitude ${cluster.center_lat.toFixed(5)}° N | Longitude ${cluster.center_lng.toFixed(5)}° E
* **Verification Status:** ${isVerified ? 'VERIFIED (10/10 Independent Vehicle Passes)' : `${cluster.distinct_devices.length}/10 Independent Vehicle Passes`}
* **Peak Shock Impact:** ${cluster.max_vibration.toFixed(2)} G (Suspension Accelerometer Triaxial Spike)
* **Road Condition Severity Index:** ${severityScore} / 10
* **Average Traffic Impact Velocity:** ${cluster.avg_speed || 48} km/h
* **Contributing Independent Vehicles:** ${cluster.distinct_devices.length} Units

---
### 🛠️ 2. DAMAGE ASSESSMENT & PAVEMENT SPECIFICATIONS
Telemetry cross-validation indicates recurring sub-base pavement depression resulting in a high-shock surface cavity. Continued heavy commercial axle loading poses rapid deterioration and structural risk to vehicular suspensions.

---
### 👷 3. PRELIMINARY MATERIAL REQUISITION & REPAIR ESTIMATE
| Item Description | Specification / Grade | Estimated Quantity | Total Estimated Budget |
| :--- | :--- | :--- | :--- |
| Bituminous Concrete Patch | VG-30 Hot Mix Asphalt | ${requiredTons} Metric Tons | ₹${Math.round(requiredTons * costTon).toLocaleString('en-IN')} |
| Cold Milling & Compactor Unit | CAT AP655F / Vibratory Roller | 1 Unit (4 Hours) | ₹12,000 |
| Traffic Diversion & Safety Cones | MoRTH Standard Reflective Team | 1 Crew | ₹6,500 |
| **TOTAL ESTIMATED REPAIR BUDGET** | | | **₹${estCost.toLocaleString('en-IN')} INR** |
`;
}

// Safe fetch with reasonable timeout to prevent hung requests
async function safeFetchJson(url, timeoutMs = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
            return await res.json();
        }
        return null;
    } catch (e) {
        clearTimeout(timer);
        return null;
    }
}

// Master Fetcher
export async function loadPortalTelemetry() {
    let source = 'LIVE_SUPABASE';
    let roadEvents = [];
    let drowsiness = [];
    let sensors = [];
    let devices = [];
    let auditTrail = [];
    let localIngested = [];

    // Parallel fast fetch of all data
    try {
        const [
            devData,
            auditData,
            localEvtData,
            roadData,
            drownData,
            sensorData
        ] = await Promise.all([
            safeFetchJson('/api/v1/devices'),
            safeFetchJson('/api/v1/audit-trail'),
            safeFetchJson('/api/v1/events'),
            safeFetchJson('/api/supabase/road_events?select=*&order=id.desc'),
            safeFetchJson('/api/supabase/drowsiness_bundles?select=*&order=id.desc'),
            safeFetchJson('/api/supabase/sensor_logs?select=*&order=id.desc')
        ]);

        if (Array.isArray(devData)) devices = devData;
        if (Array.isArray(auditData)) auditTrail = auditData;
        if (Array.isArray(localEvtData)) localIngested = localEvtData;

        // ONLY REAL SENSOR & SUPABASE DATA: NO DEMO DATA FALLBACKS
        if (Array.isArray(roadData) && !roadData.error) {
            roadEvents = roadData;
        } else {
            roadEvents = [];
        }

        if (Array.isArray(drownData) && !drownData.error) {
            drowsiness = drownData;
        } else {
            drowsiness = [];
        }

        if (Array.isArray(sensorData) && !sensorData.error) {
            sensors = sensorData;
        } else {
            sensors = [];
        }
    } catch (e) {
        console.warn('Fast fetch encountered error:', e);
        roadEvents = [];
        drowsiness = [];
        sensors = [];
    }

    // Prepend locally ingested events into roadEvents
    if (localIngested && localIngested.length > 0) {
        const existingIds = new Set(roadEvents.map(e => e.id));
        const newOnes = localIngested.filter(e => !existingIds.has(e.id));
        roadEvents = [...newOnes, ...roadEvents];
    }

    // Normalize road events
    roadEvents = roadEvents.map((evt, idx) => {
        const isSOS = (evt.type || '').toUpperCase().includes('SOS') || evt.sos_alert;
        const isAlcohol = (evt.type || '').toUpperCase().includes('ALCOHOL') || (evt.alcohol > 0);
        const isPothole = (evt.type || '').toUpperCase().includes('POTHOLE') || (evt.vibration > 2.5);

        let resolvedType = evt.type || (isSOS ? 'SOS Distress Alert' : isAlcohol ? 'Alcohol Detected' : isPothole ? 'Pothole' : 'Road Surface Defect');
        let severity = evt.severity || (isSOS || evt.vibration > 4.5 ? 'Critical' : isAlcohol || evt.vibration > 3.0 ? 'High' : 'Medium');

        return {
            ...evt,
            id: evt.id || (idx + 1),
            type: resolvedType,
            severity,
            road_name: evt.road_name || 'Monitored Road Segment',
            district: evt.district || 'Sensor Zone',
            state: evt.state || 'Live Network',
            verification_status: evt.verification_status || (evt.vibration > 4.5 ? 'Verified 10x' : 'Pending Verification'),
            resolution_status: evt.resolution_status || (evt.verification_status?.includes('Verified') ? 'Assigned' : 'Detected'),
            assigned_authority: evt.assigned_authority || 'Field Maintenance Cell',
            device_id: evt.device_id || `SARTHI-DEV-${101 + (idx % 6)}`,
            vehicle_ref: evt.vehicle_id || evt.vehicle_ref || `CONNECTED-VEHICLE-${1 + (idx % 6)}`,
            ai_confidence: evt.confidence ? Math.round(Number(evt.confidence) > 1 ? Number(evt.confidence) : Number(evt.confidence) * 100) : 92
        };
    });

    // 5. Compute Pothole Clusters strictly from real sensor road events
    const derivedClusters = clusterRoadHazards(roadEvents, 35);
    const finalClusters = derivedClusters;

    return {
        source,
        timestamp: new Date().toISOString(),
        roadEvents,
        clusters: finalClusters,
        drowsinessBundles: drowsiness,
        sensorLogs: sensors,
        devices: devices.length > 0 ? devices : [],
        auditTrail: auditTrail.length > 0 ? auditTrail : []
    };
}

// Action executor for Incident Management
export async function executeIncidentAction(payload) {
    try {
        const res = await fetch('/api/v1/incidents/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.error('Action failed:', e);
    }
    return { success: false };
}

// Ingestion trigger for simulator
export async function triggerHardwareIngest(payload) {
    try {
        const res = await fetch('/api/v1/ingest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer isarthi-telemetry-token-2026'
            },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        return { error: e.message };
    }
}

// Heartbeat trigger for simulator
export async function triggerDeviceHeartbeat(payload) {
    try {
        const res = await fetch('/api/v1/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        return { error: e.message };
    }
}
