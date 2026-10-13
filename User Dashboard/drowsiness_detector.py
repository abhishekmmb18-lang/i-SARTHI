import os
import sys
import time
import requests
import json
import threading
import numpy as np
import subprocess

# Suppress noisy OpenCV C++ backend warnings
os.environ["OPENCV_LOG_LEVEL"] = "FATAL"

import cv2
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

# Ensure UTF-8 output encoding on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

app = Flask(__name__)
CORS(app)

# -------- Configuration --------
SERVER_URL = "http://localhost:5000/api/drowsiness"

# Tuned Cascade Parameters
FACE_SCALE_FACTOR = 1.15
FACE_MIN_NEIGHBORS = 4
FACE_MIN_SIZE = (70, 70)

EYE_SCALE_FACTOR = 1.1
EYE_MIN_NEIGHBORS = 4
EYE_MIN_SIZE = (20, 20)

DROWSINESS_THRESHOLD_SECONDS = 1.5  # Trigger alert after 1.5s eyes closed
MIN_EYES_OPEN = 1

# Global State
camera = None
camera_lock = threading.Lock()
camera_index = -1
camera_status = "Scanning for webcam..."
eyes_closed_start_time = None
current_drowsy = False
drowsiness_events_count = 0
last_api_update = 0
faces_count = 0
eyes_count = 0
simulated_drowsy = False
probe_thread_running = True

# Classifiers Cache
face_cascade = None
eye_cascade_default = None
eye_cascade_glasses = None

def load_classifiers():
    global face_cascade, eye_cascade_default, eye_cascade_glasses
    
    cascade_dir = getattr(cv2, 'data', None)
    base_path = cascade_dir.haarcascades if cascade_dir and hasattr(cascade_dir, 'haarcascades') else ""
    
    # Primary Face Cascade
    face_path = os.path.join(base_path, "haarcascade_frontalface_default.xml")
    if os.path.exists(face_path):
        face_cascade = cv2.CascadeClassifier(face_path)
    else:
        alt_face = os.path.join(base_path, "haarcascade_frontalface_alt2.xml")
        if os.path.exists(alt_face):
            face_cascade = cv2.CascadeClassifier(alt_face)

    # Primary & Secondary Eye Cascades
    eye_path1 = os.path.join(base_path, "haarcascade_eye.xml")
    eye_path2 = os.path.join(base_path, "haarcascade_eye_tree_eyeglasses.xml")
    
    if os.path.exists(eye_path1):
        eye_cascade_default = cv2.CascadeClassifier(eye_path1)
    if os.path.exists(eye_path2):
        eye_cascade_glasses = cv2.CascadeClassifier(eye_path2)

    print(f"[DMS] Classifiers loaded: Face={face_cascade is not None and not face_cascade.empty()}, "
          f"Eye={eye_cascade_default is not None and not eye_cascade_default.empty()}")

def camera_probe_worker():
    """Background thread that periodically probes for cameras without blocking video streaming."""
    global camera, camera_index, camera_status, probe_thread_running

    while probe_thread_running:
        with camera_lock:
            has_cam = (camera is not None and camera.isOpened())

        if not has_cam:
            found_cap = None
            found_idx = -1
            found_backend = ""

            # Prioritize index 0 first, then 1, 2
            probes = []
            if sys.platform.startswith('win'):
                for idx in (0, 1, 2):
                    probes.append((idx, cv2.CAP_DSHOW, "DirectShow"))
                    probes.append((idx, cv2.CAP_MSMF, "MediaFoundation"))
            for idx in (0, 1, 2):
                probes.append((idx, None, "Default"))

            for idx, backend, name in probes:
                try:
                    cap = cv2.VideoCapture(idx, backend) if backend is not None else cv2.VideoCapture(idx)
                    if cap is not None and cap.isOpened():
                        ret, test_frame = cap.read()
                        if ret and test_frame is not None and test_frame.size > 0:
                            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                            cap.set(cv2.CAP_PROP_FPS, 30)
                            found_cap = cap
                            found_idx = idx
                            found_backend = name
                            break
                        else:
                            cap.release()
                except Exception:
                    pass

            with camera_lock:
                if found_cap is not None:
                    camera = found_cap
                    camera_index = found_idx
                    camera_status = f"active (device {found_idx}, {found_backend})"
                    print(f"[DMS] Camera connected: Index {found_idx} via {found_backend}")
                else:
                    camera_status = "No active camera found. Check USB connection or Windows Device Manager."

        time.sleep(4.0)

def async_send_alert(is_drowsy, event_count):
    def _send():
        try:
            payload = {"isDrowsy": is_drowsy, "events": event_count}
            headers = {'Content-Type': 'application/json'}
            requests.post(SERVER_URL, data=json.dumps(payload), headers=headers, timeout=0.8)
        except Exception:
            pass
    t = threading.Thread(target=_send, daemon=True)
    t.start()

def render_camera_offline_frame():
    """Renders a sleek diagnostic HUD and animated driver avatar when physical webcam is disabled."""
    global simulated_drowsy, drowsiness_events_count, last_api_update, current_drowsy
    
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame[:] = (18, 15, 12)  # Dark slate blue background

    # Top Header
    cv2.rectangle(frame, (0, 0), (640, 48), (28, 22, 18), -1)
    cv2.line(frame, (0, 48), (640, 48), (0, 180, 255), 1)
    cv2.putText(frame, "I-SARTHI NEURAL DMS VISION FEED", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 220, 255), 2)
    cv2.putText(frame, "STANDBY / SIMULATION", (450, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 165, 255), 1)

    # Left: Animated Driver Avatar
    cv2.rectangle(frame, (25, 65), (250, 380), (28, 24, 20), -1)
    cv2.rectangle(frame, (25, 65), (250, 380), (55, 48, 40), 1)
    
    # Head
    head_color = (0, 0, 255) if simulated_drowsy else (0, 200, 255)
    cv2.circle(frame, (138, 180), 65, head_color, 2)

    # Eyes
    if simulated_drowsy:
        # Closed eyes (horizontal lines)
        cv2.line(frame, (110, 165), (128, 165), (0, 0, 255), 3)
        cv2.line(frame, (148, 165), (166, 165), (0, 0, 255), 3)
        cv2.putText(frame, "EYES CLOSED (DROWSY)", (45, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)
        # Sleeping "Z z z" animation
        z_offset = int((time.time() * 2) % 3) * 6
        cv2.putText(frame, "Z z z...", (180 - z_offset, 130 - z_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 180, 255), 2)
    else:
        # Open eyes (circles with pupils)
        cv2.circle(frame, (118, 165), 10, (0, 255, 100), 2)
        cv2.circle(frame, (118, 165), 4, (0, 255, 100), -1)
        cv2.circle(frame, (158, 165), 10, (0, 255, 100), 2)
        cv2.circle(frame, (158, 165), 4, (0, 255, 100), -1)
        cv2.putText(frame, "EYES OPEN (ATTENTIVE)", (45, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 100), 1)

    # Mouth
    mouth_color = (0, 0, 255) if simulated_drowsy else (0, 200, 255)
    cv2.ellipse(frame, (138, 215), (20, 10), 0, 0, 180, mouth_color, 2)
    
    cv2.putText(frame, f"Triggers: {drowsiness_events_count}", (45, 310), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 220, 220), 1)
    cv2.putText(frame, "Simulation Active", (45, 335), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 165, 255), 1)

    # Right: Diagnostic & Fix Instructions
    cv2.rectangle(frame, (265, 65), (615, 380), (30, 26, 22), -1)
    cv2.rectangle(frame, (265, 65), (615, 380), (55, 48, 40), 1)

    cv2.putText(frame, "WEBCAM DISABLED IN WINDOWS", (285, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 180, 255), 2)
    cv2.putText(frame, "[Status: Error Code 22 - Device Disabled]", (285, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (160, 160, 220), 1)

    cv2.putText(frame, "HOW TO ENABLE WEBCAM:", (285, 155), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (255, 255, 255), 1)
    cv2.putText(frame, "1. Press Win + X -> Click 'Device Manager'", (295, 185), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1)
    cv2.putText(frame, "2. Expand 'Cameras' group", (295, 210), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1)
    cv2.putText(frame, "3. Right-click 'Integrated Camera'", (295, 235), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1)
    cv2.putText(frame, "   -> Click 'Enable device'", (295, 255), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 255, 180), 1)
    cv2.putText(frame, "4. Check laptop physical camera shutter switch", (295, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1)

    # Live Probing Indicator
    pulse = int((time.time() * 2) % 2)
    dot_color = (0, 255, 100) if pulse else (0, 160, 60)
    cv2.circle(frame, (295, 320), 5, dot_color, -1)
    cv2.putText(frame, "Auto-probing for webcam every 4s...", (310, 324), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 255, 100), 1)

    cv2.putText(frame, "Test Alerts Now: Click 'Simulate Drowsy' in UI", (285, 355), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 200, 255), 1)

    # Bottom status bar
    cv2.rectangle(frame, (0, 400), (640, 480), (20, 16, 12), -1)
    cv2.line(frame, (0, 400), (640, 400), (60, 50, 40), 1)
    status_label = "DROWSINESS DETECTED!" if current_drowsy else "DRIVER ATTENTIVE"
    status_col = (0, 0, 255) if current_drowsy else (0, 255, 100)
    cv2.putText(frame, f"STATUS: {status_label}", (20, 430), cv2.FONT_HERSHEY_SIMPLEX, 0.55, status_col, 2)
    cv2.putText(frame, f"Port 5001 Active | Events: {drowsiness_events_count} | Syncing with Backend Port 5000", (20, 458), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 180, 180), 1)

    return frame

def generate_frames():
    global camera, eyes_closed_start_time, current_drowsy, drowsiness_events_count
    global last_api_update, faces_count, eyes_count, simulated_drowsy

    consecutive_read_failures = 0
    while True:
        try:
            with camera_lock:
                cam = camera

            now = time.time()

            # When physical camera is unavailable, render informative live HUD with simulated avatar
            if cam is None or not cam.isOpened():
                frame = render_camera_offline_frame()

                # Handle simulated state triggers
                if simulated_drowsy:
                    if not current_drowsy:
                        current_drowsy = True
                        drowsiness_events_count += 1
                        print(f"[DMS SIMULATION] Triggered Drowsiness Alert #{drowsiness_events_count}")
                        async_send_alert(True, drowsiness_events_count)
                else:
                    if current_drowsy:
                        current_drowsy = False
                        async_send_alert(False, drowsiness_events_count)

                # Periodic heartbeat sync every 2.0s
                if now - last_api_update > 2.0:
                    async_send_alert(current_drowsy, drowsiness_events_count)
                    last_api_update = now

                ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                if ret:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                time.sleep(0.04)  # ~25 FPS
                continue

            # Physical Camera Stream Processing
            success, frame = cam.read()
            if not success or frame is None:
                consecutive_read_failures += 1
                if consecutive_read_failures > 30:
                    with camera_lock:
                        if camera is not None:
                            try:
                                camera.release()
                            except Exception:
                                pass
                            camera = None
                    consecutive_read_failures = 0
                time.sleep(0.03)
                continue

            consecutive_read_failures = 0

            # If camera frame is completely dark (e.g. lens covered, shutter closed, or low room light)
            is_dark_frame = (np.mean(frame) <= 0.05)
            if is_dark_frame:
                cv2.rectangle(frame, (20, 190), (620, 280), (20, 16, 12), -1)
                cv2.rectangle(frame, (20, 190), (620, 280), (0, 180, 255), 1)
                cv2.putText(frame, "WEBCAM LIVE: LENS COVERED / LOW LIGHT", (40, 226), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 220, 255), 2)
                cv2.putText(frame, "Please uncover camera lens or turn on room lighting", (40, 254), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 180, 180), 1)

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.equalizeHist(gray)

            # Detect Faces
            faces = []
            if face_cascade is not None and not face_cascade.empty():
                faces = face_cascade.detectMultiScale(
                    gray, 
                    scaleFactor=FACE_SCALE_FACTOR, 
                    minNeighbors=FACE_MIN_NEIGHBORS, 
                    minSize=FACE_MIN_SIZE
                )

            faces_count = len(faces)
            eyes_detected = 0

            # Process Detected Faces
            for (x, y, w, h) in faces:
                roi_gray = gray[y:y + h, x:x + w]
                roi_color = frame[y:y + h, x:x + w]

                # Draw Face Bounding Box (Gold/Cyan)
                cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 180, 0), 2)

                # Detect Eyes in upper 65% of face ROI
                half_h = int(h * 0.65)
                eye_roi_gray = roi_gray[0:half_h, :]
                eye_roi_color = roi_color[0:half_h, :]

                eyes = []
                if eye_cascade_default is not None and not eye_cascade_default.empty():
                    eyes = eye_cascade_default.detectMultiScale(
                        eye_roi_gray,
                        scaleFactor=EYE_SCALE_FACTOR,
                        minNeighbors=EYE_MIN_NEIGHBORS,
                        minSize=EYE_MIN_SIZE
                    )

                # Fallback to eyeglasses cascade if primary found no eyes
                if len(eyes) == 0 and eye_cascade_glasses is not None and not eye_cascade_glasses.empty():
                    eyes = eye_cascade_glasses.detectMultiScale(
                        eye_roi_gray,
                        scaleFactor=EYE_SCALE_FACTOR,
                        minNeighbors=EYE_MIN_NEIGHBORS,
                        minSize=EYE_MIN_SIZE
                    )

                eyes_detected += len(eyes)

                for (ex, ey, ew, eh) in eyes:
                    cv2.rectangle(eye_roi_color, (ex, ey), (ex + ew, ey + eh), (0, 255, 0), 2)

            eyes_count = eyes_detected
            face_present = len(faces) > 0
            eyes_closed = face_present and (eyes_detected < MIN_EYES_OPEN)

            if eyes_closed:
                if eyes_closed_start_time is None:
                    eyes_closed_start_time = now

                duration = now - eyes_closed_start_time
                if duration >= DROWSINESS_THRESHOLD_SECONDS:
                    if not current_drowsy:
                        current_drowsy = True
                        drowsiness_events_count += 1
                        print(f"[DMS ALERT] Drowsiness event #{drowsiness_events_count} (Closed for {duration:.1f}s)")
                        async_send_alert(True, drowsiness_events_count)
            else:
                eyes_closed_start_time = None
                if current_drowsy:
                    print("[DMS] Driver awake & attentive.")
                    current_drowsy = False
                    async_send_alert(False, drowsiness_events_count)

            # Heartbeat sync every 1.5s
            if now - last_api_update > 1.5:
                async_send_alert(current_drowsy, drowsiness_events_count)
                last_api_update = now

            # Overlay HUD Telemetry on Frame
            status_text = "DROWSINESS DETECTED!" if current_drowsy else "DRIVER ATTENTIVE"
            status_color = (0, 0, 255) if current_drowsy else (0, 255, 100)

            # Status Banner
            cv2.rectangle(frame, (10, 10), (340, 98), (10, 15, 25), -1)
            cv2.rectangle(frame, (10, 10), (340, 98), status_color, 1)
            cv2.putText(frame, status_text, (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.55, status_color, 2)
            cv2.putText(frame, f"Faces: {faces_count} | Eyes: {eyes_count}", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 220, 220), 1)
            cv2.putText(frame, f"Fatigue Triggers: {drowsiness_events_count}", (20, 84), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 220, 255), 1)

            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if not ret:
                continue

            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

            time.sleep(0.03)  # ~30 FPS
        except Exception:
            time.sleep(0.1)

@app.route('/video_feed')
def video_feed():
    response = Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.route('/status')
def status():
    return jsonify({
        "status": "online",
        "cameraStatus": camera_status,
        "isDrowsy": current_drowsy,
        "events": drowsiness_events_count,
        "faces": faces_count,
        "eyes": eyes_count,
        "simulated": simulated_drowsy
    })

@app.route('/simulate')
def simulate():
    global simulated_drowsy
    state_param = request.args.get('drowsy', '1')
    simulated_drowsy = (state_param in ('1', 'true', 'True'))
    return jsonify({
        "simulated_drowsy": simulated_drowsy,
        "events": drowsiness_events_count,
        "message": f"Simulation set to {'DROWSY' if simulated_drowsy else 'ATTENTIVE'}"
    })

@app.route('/trigger')
def trigger_pulse():
    """Triggers a 3-second temporary drowsiness pulse for quick dashboard testing."""
    def _pulse():
        global simulated_drowsy
        simulated_drowsy = True
        time.sleep(3.0)
        simulated_drowsy = False
    threading.Thread(target=_pulse, daemon=True).start()
    return jsonify({"triggered": True, "duration": 3.0})

@app.route('/cameras')
def get_cameras():
    sys_cams = []
    if sys.platform.startswith('win'):
        try:
            p = subprocess.run(
                ['powershell', '-NoProfile', '-Command', "Get-PnpDevice -Class Camera | Where-Object Status -eq 'OK' | Select-Object -ExpandProperty FriendlyName"],
                capture_output=True, text=True, timeout=2
            )
            sys_cams = [line.strip() for line in p.stdout.strip().splitlines() if line.strip()]
        except Exception:
            sys_cams = []

    available = []
    for idx in (0, 1):
        is_active = (camera_index == idx and camera is not None and camera.isOpened())
        if idx < len(sys_cams):
            label = sys_cams[idx]
        elif idx == 0:
            label = "Logi C270 HD WebCam (USB / Default)"
        else:
            label = "Camera Device 1 (Secondary)"
        
        available.append({
            "index": idx,
            "name": f"{label}{' (Active)' if is_active else ''}",
            "active": is_active
        })

    return jsonify({
        "current_index": camera_index,
        "status": camera_status,
        "available": available
    })

@app.route('/switch_camera')
def switch_camera():
    global camera, camera_index, camera_status
    try:
        target_idx = int(request.args.get('index', 0))
    except (ValueError, TypeError):
        target_idx = 0

    with camera_lock:
        if camera is not None and camera.isOpened() and camera_index == target_idx:
            return jsonify({"success": True, "device": target_idx, "status": camera_status})

    backend = cv2.CAP_DSHOW if sys.platform.startswith('win') else None
    cap = cv2.VideoCapture(target_idx, backend) if backend is not None else cv2.VideoCapture(target_idx)
    if cap is not None and cap.isOpened():
        ret, test_frame = cap.read()
        if ret and test_frame is not None and test_frame.size > 0:
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)
            with camera_lock:
                old_camera = camera
                camera = cap
                camera_index = target_idx
                camera_status = f"active (device {target_idx})"
                if old_camera is not None:
                    try:
                        old_camera.release()
                    except Exception:
                        pass
            return jsonify({"success": True, "device": target_idx, "status": camera_status})
        else:
            try:
                cap.release()
            except Exception:
                pass

    return jsonify({
        "success": False,
        "device": target_idx,
        "error": f"Could not open device {target_idx}. Current camera {camera_index} kept active."
    })

@app.route('/reset')
def reset():
    global drowsiness_events_count, current_drowsy, simulated_drowsy
    drowsiness_events_count = 0
    current_drowsy = False
    simulated_drowsy = False
    async_send_alert(False, 0)
    return jsonify({"reset": True, "events": 0})

if __name__ == '__main__':
    print("[DMS] Starting Resilient I-SARTHI Drowsiness Detector on Port 5001...")
    load_classifiers()
    
    # Start background camera probing worker
    t = threading.Thread(target=camera_probe_worker, daemon=True)
    t.start()
    
    app.run(host='0.0.0.0', port=5001, threaded=True)
