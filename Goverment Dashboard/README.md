# iSARTHI - Government Road Intelligence & Safety Dashboard

Government and departmental command center for the **iSARTHI** intelligent road infrastructure monitoring and vehicle safety platform.

## Features
- **Departmental Multi-Gateway System**: Dedicated secure gateways for NHAI (MoRTH), State PWD (28 States & UTs), and Municipal Urban Bodies (Nagar Nigam).
- **Real-Time Telemetry & Edge AI Ingestion**: Ingests high-G road shock vibrations, pothole depth measurements, and DMS driver fatigue bundles directly from connected vehicles and Raspberry Pi / ESP32 edge units.
- **Alert Timestamps (Date & Time)**: Every road hazard, critical shock, and driver microsleep incident displays its exact detection date and time (`DD Mon YYYY • HH:MM:SS`).
- **GIS Map & Clustered Hotspots**: Interactive Leaflet map displaying 10x verified road defect clusters with GPS coordinates and severity scores.
- **Engineering Work Orders**: One-click generation and dispatch of official civil maintenance orders.
- **Supabase Cloud Sync & Local Fallback**: Real-time Supabase database listener with automatic local telemetry fallback.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The dashboard will start on `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```
