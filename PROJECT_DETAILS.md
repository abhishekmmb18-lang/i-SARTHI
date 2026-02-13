# Project Technical Documentation

## Database System: SQLite

### **What is it?**
For this project, we are using **SQLite**, a high-performance, serverless, relational database management system (RDBMS).

### **Why SQLite? (Points for Judges)**
1.  **Optimized for IoT & Edge Computing**:
    *   Unlike traditional databases (MySQL/PostgreSQL) that require a separate heavy server process, SQLite runs **embedded directly within the application**.
    *   This is crucial for a **Raspberry Pi-based system** where memory and processing power must be conserved for real-time AI (Drowsiness Detection) and sensor processing.

2.  **Reliability & ACID Compliance**:
    *   It is **ACID compliant** (Atomicity, Consistency, Isolation, Durability).
    *   This ensures that even if the car loses power or the system crashes immediately after an accident, the critical **Incidents and Sensor Logs are safely saved** without corruption.

3.  **Zero Configuration**:
    *   "It just works." There is no complex network configuration required, reducing potential points of failure in a vehicle environment.

4.  **Local Data Ownership**:
    *   Data is stored locally on the device (`users.db` file), ensuring privacy and functionality even without an internet connection.

### **Database Schema (Structure)**
We have structured the data into four optimized tables:

1.  **`users`**: Stores driver profiles, secure authentication credentials, and emergency contact details.
2.  **`road_events`**: Logs critical incidents like **SOS Alerts**, **Pothole Detections**, and **Accidents**.
3.  **`drowsiness_logs`**: A time-series log of every fatigue event detected by the AI camera, used for driver behavior analysis.
4.  **`sensor_logs`**: A high-frequency log of raw sensor data:
    *   **GPS**: Latitude, Longitude, Speed.
    *   **Alcohol (MQ-3)**: Alcohol concentration levels.
    *   **Radar/LiDAR**: Obstacle distance and angles.
    *   **Vibration (MPU6050)**: Road quality and impact data.

---

## Technical Stack Overview

*   **Frontend**: React.js (Vite) + Tailwind CSS (High-performance, responsive UI).
*   **Backend**: Node.js + Express (Fast, non-blocking I/O for handling multiple sensor streams).
*   **AI/Computer Vision**: Python (OpenCV + Dlib) for real-time face tracking and drowsiness detection.
*   **Hardware Interface**: Python (`pyserial` and `RPi.GPIO`) for communicating with GSM, GPS, and Sensors.
*   **Database**: SQLite (Embedded, reliable storage).
