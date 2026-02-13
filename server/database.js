const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "users.db";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username text, 
            email text UNIQUE, 
            password text, 
            full_name text,
            profile_picture text,
            vehicle_details text,
            contact_details text,
            CONSTRAINT email_unique UNIQUE (email)
            )`,
            (err) => {
                if (err) {
                    // Table already created
                    // Try to add columns if they don't exist
                    const columns = ['full_name', 'profile_picture', 'vehicle_details', 'contact_details'];
                    columns.forEach(col => {
                        db.run(`ALTER TABLE users ADD COLUMN ${col} text`, (err) => {
                            // Ignore error if column exists
                        });
                    });
                } else {
                    // Table just created, creating some rows
                    // var insert = 'INSERT INTO users (username, email, password) VALUES (?,?,?)'
                    // db.run(insert, ["admin","admin@example.com","admin123"])
                    console.log('Users table created.');
                }
            });

        // Road Events Table
        db.run(`CREATE TABLE road_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            confidence REAL,
            vibration REAL,
            latitude REAL,
            longitude REAL,
            distance REAL,
            temperature REAL,
            humidity REAL,
            alcohol REAL,
            network_strength REAL,
            sos_alert BOOLEAN,
            gsm_connected BOOLEAN,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                // Table already created
                // Add columns if missing
                db.run(`ALTER TABLE road_events ADD COLUMN distance REAL`, (err) => { /* ignore */ });
                db.run(`ALTER TABLE road_events ADD COLUMN temperature REAL`, (err) => { /* ignore */ });
                db.run(`ALTER TABLE road_events ADD COLUMN humidity REAL`, (err) => { /* ignore */ });
                db.run(`ALTER TABLE road_events ADD COLUMN alcohol REAL`, (err) => { /* ignore */ });
                db.run(`ALTER TABLE road_events ADD COLUMN network_strength BOOELAN`, (err) => { /* ignore */ });
                db.run(`ALTER TABLE road_events ADD COLUMN sos_alert BOOLEAN`, (err) => { /* ignore */ });
                db.run(`ALTER TABLE road_events ADD COLUMN gsm_connected BOOLEAN`, (err) => { /* ignore */ });
            } else {
                console.log('Road Events table created.');
            }
        });

        // Drowsiness Logs Table
        db.run(`CREATE TABLE drowsiness_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            is_drowsy BOOLEAN,
            events_count INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) console.log('Drowsiness Logs table created.');
        });

        // Sensor Logs Table (for raw data like GPS history, Alcohol history)
        db.run(`CREATE TABLE sensor_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_type TEXT, -- 'GPS', 'Alcohol', 'Radar', 'Vibration'
            value_1 REAL, -- Lat, or Alcohol %, or Left Vib
            value_2 REAL, -- Lon, or Right Vib
            value_3 REAL, -- Speed, etc.
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) console.log('Sensor Logs table created.');
        });
    }
});

module.exports = db;
