import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const EVENTS_FILE = path.join(DATA_DIR, 'ingested_events.json');
const DEVICES_FILE = path.join(DATA_DIR, 'devices.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_trail.json');

// Initialize device fleet database (starts clean, populated by real hardware heartbeats/ingest)
const defaultDevices = [];


function readJSON(file, fallback) {
    try {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e) {
        console.error('Error reading file:', file, e);
    }
    return fallback;
}

function writeJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error writing file:', file, e);
    }
}

// In-memory state cache
let memoryEvents = readJSON(EVENTS_FILE, []);
let memoryDevices = readJSON(DEVICES_FILE, defaultDevices);
let memoryAudit = readJSON(AUDIT_FILE, []);

// Helper: Haversine distance in meters
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
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

// Device Status computer based on heartbeat interval
export function computeDeviceStatus(lastHeartbeatStr) {
    if (!lastHeartbeatStr) return 'Offline';
    const diffSec = (Date.now() - new Date(lastHeartbeatStr).getTime()) / 1000;
    if (diffSec < 120) return 'Online';
    if (diffSec < 600) return 'Delayed Data';
    return 'Offline';
}

// Ingestion handler
export function handleDeviceIngest(payload, authHeader) {
    // 1. Authentication Check
    const validTokens = ['isarthi-telemetry-token-2026', process.env.SUPABASE_SERVICE_ROLE_KEY, 'SARTHI-DEVICE-SECRET'].filter(Boolean);
    const token = (authHeader || '').replace(/Bearer\s+/i, '').replace(/ApiKey\s+/i, '').trim();

    if (token && !validTokens.includes(token) && !token.startsWith('isarthi-')) {
        return { status: 401, body: { error: 'Unauthorized hardware device. Invalid token.' } };
    }

    // 2. Validate payload structure
    const {
        event_id,
        device_id,
        event_type,
        timestamp,
        latitude,
        longitude,
        vibration,
        confidence,
        vehicle_id,
        road_name,
        severity
    } = payload;

    if (!device_id) {
        return { status: 400, body: { error: 'Missing device_id in event payload.' } };
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return { status: 400, body: { error: 'Invalid or missing GPS coordinates. Valid latitude (-90 to 90) and longitude (-180 to 180) required.' } };
    }

    // 3. Deduplication Check: exact event_id or same device+timestamp within 500ms
    const eventId = event_id || `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isDuplicate = memoryEvents.some(e =>
        e.event_id === eventId ||
        (e.device_id === device_id && Math.abs(new Date(e.timestamp || 0).getTime() - new Date(timestamp || Date.now()).getTime()) < 500)
    );

    if (isDuplicate) {
        return { status: 200, body: { message: 'Duplicate event ignored', event_id: eventId, duplicate: true } };
    }

    // 4. Update Device Heartbeat automatically on ingestion
    const devIndex = memoryDevices.findIndex(d => d.device_id === device_id);
    if (devIndex >= 0) {
        memoryDevices[devIndex].last_heartbeat = new Date().toISOString();
        if (payload.firmware) memoryDevices[devIndex].firmware_version = payload.firmware;
        if (vehicle_id) memoryDevices[devIndex].assigned_vehicle = vehicle_id;
    } else {
        memoryDevices.push({
            device_id,
            device_type: payload.device_type || 'iSARTHI Edge Unit',
            assigned_vehicle: vehicle_id || 'Connected Patrol Vehicle',
            last_heartbeat: new Date().toISOString(),
            firmware_version: payload.firmware || 'v2.4.1',
            battery_voltage: payload.battery || '13.8V',
            pending_uploads: 0,
            sensor_health: { camera: 'OK', imu: 'OK', gps: '3D_FIX', mq3: 'STANDBY' }
        });
    }
    writeJSON(DEVICES_FILE, memoryDevices);

    // 5. Structure the new event
    const newEvent = {
        id: memoryEvents.length + 1,
        event_id: eventId,
        device_id,
        vehicle_id: vehicle_id || 'PILOT-VEHICLE-PROTOTYPE',
        type: event_type || (vibration && vibration > 3.0 ? 'Pothole' : 'Road Event'),
        latitude: lat,
        longitude: lng,
        road_name: road_name || 'National Highway (Monitored Corridor)',
        vibration: parseFloat(vibration || 0),
        confidence: parseFloat(confidence || 0.92),
        severity: severity || (vibration > 4.5 ? 'Critical' : vibration > 3.0 ? 'High' : 'Medium'),
        verification_status: 'Pending Verification',
        resolution_status: 'Detected',
        created_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
        server_received_at: new Date().toISOString(),
        sensor_readings: payload.sensor_readings || {
            speed_kmh: payload.speed_kmh || 45,
            vibration_g: parseFloat(vibration || 0)
        }
    };

    memoryEvents.unshift(newEvent);
    // Keep max 2000 events in local storage
    if (memoryEvents.length > 2000) memoryEvents = memoryEvents.slice(0, 2000);
    writeJSON(EVENTS_FILE, memoryEvents);

    // 6. Record Audit Trail
    memoryAudit.unshift({
        id: `aud-${Date.now()}`,
        incident_id: newEvent.event_id,
        action: 'HARDWARE_EVENT_INGESTED',
        actor: `Device ${device_id}`,
        timestamp: new Date().toISOString(),
        notes: `Telemetry ingested: ${newEvent.type} at ${lat.toFixed(4)}°, ${lng.toFixed(4)}°. Vibration: ${newEvent.vibration}G.`
    });
    writeJSON(AUDIT_FILE, memoryAudit);

    return {
        status: 201,
        body: {
            success: true,
            event_id: newEvent.event_id,
            assigned_id: newEvent.id,
            timestamp: newEvent.server_received_at,
            device_status: 'Online',
            stored: true
        }
    };
}

// Heartbeat handler
export function handleDeviceHeartbeat(payload) {
    const { device_id, device_type, vehicle_id, firmware_version, battery_voltage, sensor_health } = payload;
    if (!device_id) return { status: 400, body: { error: 'device_id required' } };

    const idx = memoryDevices.findIndex(d => d.device_id === device_id);
    const now = new Date().toISOString();

    if (idx >= 0) {
        memoryDevices[idx].last_heartbeat = now;
        if (firmware_version) memoryDevices[idx].firmware_version = firmware_version;
        if (battery_voltage) memoryDevices[idx].battery_voltage = battery_voltage;
        if (sensor_health) memoryDevices[idx].sensor_health = sensor_health;
        if (vehicle_id) memoryDevices[idx].assigned_vehicle = vehicle_id;
    } else {
        memoryDevices.push({
            device_id,
            device_type: device_type || 'iSARTHI Hardware Unit',
            assigned_vehicle: vehicle_id || 'Active Fleet Vehicle',
            last_heartbeat: now,
            firmware_version: firmware_version || 'v2.4.0',
            battery_voltage: battery_voltage || '13.8V',
            pending_uploads: 0,
            sensor_health: sensor_health || { camera: 'OK', imu: 'OK', gps: 'OK' }
        });
    }

    writeJSON(DEVICES_FILE, memoryDevices);
    return {
        status: 200,
        body: {
            success: true,
            device_id,
            status: 'Online',
            server_time: now
        }
    };
}

// Get all devices with calculated statuses
export function getMonitoredDevices() {
    return memoryDevices.map(d => ({
        ...d,
        computed_status: computeDeviceStatus(d.last_heartbeat)
    }));
}

// Incident status update handler with audit trail
export function handleIncidentAction(payload) {
    const { incident_id, action, official_role, official_name, assigned_department, maintenance_status, notes } = payload;

    const event = memoryEvents.find(e => e.id === Number(incident_id) || e.event_id === incident_id);
    const now = new Date().toISOString();

    if (event) {
        if (action === 'VERIFY') {
            event.verification_status = 'Verified by Official';
            event.resolution_status = 'Verified';
        } else if (action === 'REJECT') {
            event.verification_status = 'Rejected (False Positive)';
            event.resolution_status = 'Rejected';
        } else if (action === 'ASSIGN') {
            event.assigned_authority = assigned_department || 'NHAI Regional Office';
            event.resolution_status = 'Assigned';
        } else if (action === 'UPDATE_MAINTENANCE') {
            event.resolution_status = maintenance_status || 'Under Maintenance';
            if (maintenance_status === 'Resolved') {
                event.verification_status = 'Verified & Resolved';
            }
        }
        if (notes) {
            event.maintenance_notes = (event.maintenance_notes ? event.maintenance_notes + '\n' : '') + `[${now} ${official_name}]: ${notes}`;
        }
        writeJSON(EVENTS_FILE, memoryEvents);
    }

    // Add audit entry
    const auditRecord = {
        id: `aud-${Date.now()}`,
        incident_id,
        action: action || 'STATUS_UPDATE',
        actor: `${official_name || 'Authorized Official'} (${official_role || 'Official'})`,
        timestamp: now,
        notes: notes || `Action ${action} executed. Department: ${assigned_department || 'N/A'}. Status: ${maintenance_status || 'N/A'}`
    };

    memoryAudit.unshift(auditRecord);
    writeJSON(AUDIT_FILE, memoryAudit);

    return {
        status: 200,
        body: {
            success: true,
            incident_id,
            action,
            updated_event: event,
            audit_id: auditRecord.id
        }
    };
}

export function getAuditTrail() {
    return memoryAudit;
}

export function getIngestedEvents() {
    return memoryEvents;
}
