# 🚗 iSARTHI (Intelligent Safety & Road Transport Helper Interface)

> **Next-Generation Autonomous AI Road Safety, Driver Fatigue Monitoring (DMS), and Real-Time Cloud Telemetry Platform.**

[![GitHub Repo](https://img.shields.io/badge/GitHub-hypnexis--26-blue?logo=github)](https://github.com/abhishekmmb18-lang/hypnexis-26)
[![Python](https://img.shields.io/badge/Python-3.10%2B-brightgreen?logo=python)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-cyan?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?logo=supabase)](https://supabase.com)
[![YOLO11](https://img.shields.io/badge/YOLO11n-Ultralytics-orange)](https://ultralytics.com)

---

## 👥 Team Hypnexis
*  **Ritik Gorai** ([@ritikrages](https://github.com/ritikrages))— *Team Lead & AI/Software Architect/Hardware*
*  **Abhishek Verma** ([@abhishekmmb18-lang](https://github.com/abhishekmmb18-lang))— *Full-Stack Developer*
* **Anvesha Tiwari** — *Hardware & IoT Embedded Systems Specialist*

---

# iSARTHI 🚗
### AI-Powered Intelligent Road & Vehicle Safety System

**Transforming vehicles into intelligent, connected road-monitoring units.**

iSARTHI is an AI-powered road intelligence and vehicle safety platform designed to detect road hazards, monitor driving conditions, and enable real-time hazard communication. By combining Computer Vision, Edge AI, IoT sensors, GPS/GIS, and Vehicle-to-Vehicle (V2V) communication, iSARTHI aims to build a smarter, safer, and more connected road ecosystem.

---

## 🌐 Vision

To create a distributed road intelligence network where vehicles continuously collect road-condition data, share critical hazard information, and help authorities make data-driven infrastructure decisions.

## 🚀 Core Capabilities

- **AI-Powered Road Detection:** YOLOv8-based detection of potholes and road hazards.
- **Multi-Sensor Integration:** Integrates LiDAR, MPU6050 IMUs, GPS, and other sensors for environmental and motion data.
- **Real-Time Hazard Alerts:** Transmits structured hazard events to connected devices.
- **V2V Communication:** Enables vehicle-to-vehicle hazard messaging through Wi-Fi and UDP in the current prototype.
- **Live Monitoring Dashboard:** Designed to visualize sensor telemetry, hazard events, and location-based information.
- **Edge AI Architecture:** Supports local inference and processing to reduce dependence on continuous cloud connectivity.
- **Driver Safety Monitoring:** Designed for future integration of driver monitoring and alcohol-sensor data.

## 🏗️ System Architecture

```text
Vehicle A — Raspberry Pi
        │
        ├── Camera + YOLOv8
        ├── LiDAR + MPU6050
        ├── GPS / Sensor Integration
        │
        ▼
   Hazard Event Pipeline
        │
        ├── Dashboard Backend
        │
        └── Wi-Fi / UDP
                 │
                 ▼
          Vehicle B — Arduino Q
                 │
                 └── LED / Buzzer Alert
```

## 📂 Repository Structure

```text
iSARTHI/
├── Government Dashboard/
│   └── Dashboard application
├── Sensor Integration/
│   ├── unified_sensors.py
│   └── README.md
├── Model Integration/
│   ├── test.py
│   └── README.md
└── README.md
```

*The repository structure may evolve as development progresses.*

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| AI & Computer Vision | Python, Ultralytics YOLOv8, OpenCV |
| Edge Computing | Raspberry Pi |
| Embedded Systems | Arduino Q |
| Sensors | LiDAR, MPU6050, NEO-7 GPS |
| Communication | Wi-Fi, UDP, HTTP/REST |
| Data & Mapping | GPS/GIS, structured JSON events |
| Dashboard | Existing web dashboard and backend |

### 🧠 Neo4j — Knowledge Graph Intelligence

i-SARTHI explores **Neo4j Graph Database** to represent and analyze relationships between vehicles, road hazards, locations, sensor observations, and infrastructure.

Unlike traditional relational storage, a graph-based approach can help identify connected hazards, repeated reports, nearby risk zones, and relationships between vehicles and road segments.

**Planned Knowledge Graph Structure:**

- **Vehicle** → Reports → **Hazard**
- **Hazard** → Located_On → **Road Segment**
- **Vehicle** → Observes → **Sensor Event**
- **Hazard** → Near → **Other Hazard**
- **Authority** → Assigned_To → **Maintenance Task**

**Potential Applications:**
- Detect recurring pothole hotspots.
- Correlate multiple vehicle reports of the same hazard.
- Identify high-risk road segments.
- Support government maintenance prioritization.
- Build a connected road-safety intelligence network.

**Technology:** Neo4j · Cypher · Graph-Based Relationship Analysis

*Implementation status: Exploratory / planned integration. Graph-based intelligence capabilities will be progressively integrated into the i-SARTHI platform.*

## 📡 Current Prototype

The current development focuses on:

- Running road-hazard detection on a Raspberry Pi.
- Integrating sensor readings through a unified Python module.
- Transmitting hazard events from Vehicle A to an Arduino Q-based Vehicle B.
- Developing dashboard integration for telemetry and road-hazard visualization.

Some integrations are still under development; capabilities listed as future or planned features should not be considered production-ready.

## 🔮 Future Roadmap

- Multi-hazard detection and road-condition classification.
- Sensor fusion for more reliable hazard verification.
- GPS-tagged road-risk heatmaps.
- Offline-first data storage and synchronization.
- Fleet analytics and predictive road-maintenance insights.
- V2I and broader V2X communication.
- Custom embedded hardware for scalable vehicle retrofitting.

## 🎯 Potential Applications

- Smart cities and municipal road monitoring.
- Highway and road-maintenance authorities.
- Commercial vehicle and logistics fleets.
- Public transport and institutional fleets.
- Connected-vehicle safety systems.

## 🤝 Contributing

Contributions, ideas, testing, and collaboration are welcome. Please open an issue to discuss proposed features or report bugs before submitting major changes.

## ⚠️ Development Status

iSARTHI is an actively developing prototype. Detection accuracy, hardware reliability, communication performance, and deployment readiness require further validation under real-world conditions.

## Repository Modules
- **Goverment Dashboard**: Real-time government and departmental monitoring command center for MoRTH, NHAI, State PWD, and Municipal Corporations. Features live sensor telemetry ingestion, alert date & time tracking, GIS hotspot mapping, and civil repair work orders.
- **User Dashboard**: Intelligent driver companion and vehicle monitoring portal. Features neural eye-tracking & drowsiness detection (DMS), alcohol sensor monitoring, real-time road hazard & pothole reporting, radar proximity system, and emergency SOS dispatch.
- **Sensor Integration**: Hardware edge sensing unit and unified telemetry collectors for IMU vibrations, MQ-3 alcohol sensing, GPS tracking, and edge alert triggers.

### 🌟 Core Modules
1. **AI Road Damage Detection (YOLO11n)**: Real-time road hazard detection for potholes, cracks, debris, open manholes, speed breakers, and barricades with automatic Supabase sync.
2. **Neural Driver Monitoring System (DMS)**: MediaPipe-powered facial mesh tracking eye aspect ratio (EAR) and blink frequency to prevent microsleep and fatigue crashes.
3. **Cockpit User Dashboard**: High-tech 60 FPS HUD interface displaying vehicle health, live radar blind-spot scanning, alcohol detection (MQ-3), and SOS emergency broadcasting.
4. **Government Command Center (Gov Dashboard)**: Centralized municipal analytics mapping verified 10-pass pothole clusters, structural road degradation, and civil repair dispatch orders.
5. **Hardware IoT Telemetry Suite**: Raspberry Pi / Jetson edge node integrating MPU-6050 dual-axle vibration, Time-of-Flight LiDAR, SIM800L/A7670C 4G GSM, and NEO-7M GPS.

---

## 🏗️ System Architecture

```
[ Vehicle Camera ] ──> YOLO11n AI (Road Damage) ──┐
[ Driver Camera  ] ──> MediaPipe DMS (Drowsiness)  ├──> Local Server (Port 5000) ──> Supabase PostgreSQL
[ Hardware MPU   ] ──> Vibration / Shock Analysis ─┤         │
[ MQ-3 / Radar   ] ──> Proximity & Alcohol Sensor ─┘         ▼
                                                    Web Cockpit (Port 5173) & Gov Dashboard
```

---

## ⚡ Quick Start: Running Commands

### 1. Prerequisites
Ensure you have the following installed:
* **Node.js** (v18+) & **npm**
* **Python** (v3.10+) with `pip`
* Git

---

### 2. Clone the Repository
```bash
git clone https://github.com/abhishekmmb18-lang/hypnexis-26.git
cd hypnexis-26
```

---

### 3. Start the Backend Server (Port 5000)
Handles live sensor packet ingestion, Supabase cloud sync, Twilio SOS dispatch, and SQLite local ledger.
```bash
cd "User Dashboard/server"
npm install
npm run dev
```
> Server runs at: `http://localhost:5000`

---

### 4. Start the User Cockpit Dashboard (Port 5173)
Launch the interactive driver safety portal with the 3D Holographic HUD.
```bash
cd "User Dashboard/client"
npm install
npm run dev
```
> Open your browser at: **`http://localhost:5173`**

---

### 5. Launch Neural DMS Drowsiness Detector (Port 5001)
Streams driver webcam feed, computes Eye Aspect Ratio (EAR), and automatically alerts upon 1.5s eye closure.
```bash
# In the project root:
pip install opencv-python mediapipe flask flask-cors requests numpy
python drowsiness_detector.py
```
> Microservice runs at: `http://localhost:5001`

---

### 6. Run AI Road Damage Detection (YOLO11n)
Monitors road conditions and auto-pushes detected potholes and hazards directly to Supabase cloud.

#### Option A: Live Browser Web Stream
```bash
cd models/isarthi_road_damage
pip install ultralytics opencv-python flask torch
python web_cam_server.py
```
> Open stream at: **`http://localhost:5050`** (includes sensitivity slider & live Supabase sync)

#### Option B: Standalone Native Video Window
```bash
cd models/isarthi_road_damage
python test_model.py --source webcam
```
*(Or double-click `run_camera_window.bat` on Windows)*

---

### 7. Run Government Analytics Dashboard
```bash
cd "Goverment Dashboard"
npm install
npm run dev
```

---

## 📊 Model Accuracy & Benchmarks

| Metric | Score | Specification |
| :--- | :--- | :--- |
| **Model** | **YOLO11n** | 182 layers, 2.6M params, 6.5 GFLOPs |
| **Precision ($P$)** | **67.24%** | Positive obstacle classification rate |
| **Recall ($R$)** | **55.60%** | Road damage detection rate |
| **mAP@50** | **61.22%** | Mean Average Precision at IoU = 0.50 |
| **Classes** | 6 Classes | `pothole`, `crack`, `debris`, `manhole`, `speed_breaker`, `road_barricade` |

---

## 🗄️ Database & Cloud Integration
* **Supabase Cloud Database**: Stores timestamped `road_events`, `sensor_logs`, `drowsiness_logs`, and verified `pothole_clusters`.
* **Local Offline Fallback**: Embedded SQLite (`users.db`) caching telemetry when driving through low-connectivity areas.
* **Automated SOS Broadcast**: Twilio API dispatches driver coordinates & Google Maps link upon collision or unresponsive driver fatigue.

---
## 📜 License

A license has not yet been specified. Usage, modification, and redistribution permissions should be established before the project is shared for broader collaboration.

---

**iSARTHI — Building Smarter Roads. Enabling Safer Journeys.**

