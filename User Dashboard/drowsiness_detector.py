import os
import sys
import time
import requests
import json
import threading
import numpy as np
import subprocess

# Suppress noisy backend logs
os.environ["OPENCV_LOG_LEVEL"] = "FATAL"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

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
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://caqsenljmkkqlgaudtlk.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

DROWSINESS_THRESHOLD_SECONDS = 1.5  # Trigger alert after 1.5s eyes closed
BLINK_CLOSED_THRESHOLD = 0.45       # MediaPipe blendshape blink threshold (0.0=open, 1.0=closed)
EAR_CLOSED_THRESHOLD = 0.20         # Eye Aspect Ratio threshold

# Global State
camera = None
camera_lock = threading.Lock()
camera_index = 0
camera_status = "Initializing webcam..."
eyes_closed_start_time = None
current_drowsy = False
drowsiness_events_count = 0
last_api_update = 0
faces_count = 0
eyes_count = 0
current_ear = 0.0
current_blink = 0.0
simulated_drowsy = False
worker_running = True

# Frame Buffer for Multi-Client Streaming
latest_jpeg_frame = None
frame_lock = threading.Lock()
new_frame_event = threading.Event()

# Detectors
mediapipe_detector = None
face_cascade = None
eye_cascade_default = None

# Landmark indices for EAR calculation (MediaPipe 468/478 mesh)
LEFT_EYE_LANDMARKS = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_LANDMARKS = [362, 385, 387, 263, 373, 380]

def init_vision_models():
    """Initializes MediaPipe FaceLandmarker for neural blink/EAR detection, with Haar Cascade fallback."""
    global mediapipe_detector, face_cascade, eye_cascade_default

    # 1. MediaPipe FaceLandmarker
    try:
        import mediapipe as mp
        from mediapipe.tasks import python
        from mediapipe.tasks.python import vision

        possible_paths = [
            os.path.join(os.path.dirname(__file__), "face_landmarker.task"),
            "face_landmarker.task",
            os.path.join(os.getcwd(), "face_landmarker.task"),
            os.path.join(os.getcwd(), "User Dashboard", "face_landmarker.task")
        ]
        chosen_task = None
        for p in possible_paths:
            if os.path.exists(p):
                chosen_task = p
                break

        if chosen_task:
            base_opts = python.BaseOptions(model_asset_path=chosen_task)
            opts = vision.FaceLandmarkerOptions(
                base_options=base_opts,
                output_face_blendshapes=True,
                num_faces=1,
                min_face_detection_confidence=0.35,
                min_face_presence_confidence=0.35
            )
            mediapipe_detector = vision.FaceLandmarker.create_from_options(opts)
            print(f"[DMS] MediaPipe Neural Eye Mesh loaded successfully from: {chosen_task}")
        else:
            print("[DMS] Note: face_landmarker.task not found locally, will use Haar + Iris analysis.")
    except Exception as e:
        print(f"[DMS] MediaPipe init error: {e}")

    # 2. OpenCV Haar Cascades (Fallback)
    try:
        cascade_dir = getattr(cv2, 'data', None)
        base_path = cascade_dir.haarcascades if cascade_dir and hasattr(cascade_dir, 'haarcascades') else ""
        face_path = os.path.join(base_path, "haarcascade_frontalface_default.xml")
        eye_path = os.path.join(base_path, "haarcascade_eye.xml")

        if os.path.exists(face_path):
            face_cascade = cv2.CascadeClassifier(face_path)
        if os.path.exists(eye_path):
            eye_cascade_default = cv2.CascadeClassifier(eye_path)
        print(f"[DMS] Fallback Haar Cascades loaded: Face={face_cascade is not None}, Eye={eye_cascade_default is not None}")
    except Exception as e:
        print(f"[DMS] Haar cascade load error: {e}")

def compute_ear(landmarks, left_idx, right_idx, top1_idx, bot1_idx, top2_idx, bot2_idx, w, h):
    """Computes Eye Aspect Ratio (EAR) given normalized 3D landmarks."""
    def pt(idx):
        return np.array([landmarks[idx].x * w, landmarks[idx].y * h])
    
    p_l = pt(left_idx)
    p_r = pt(right_idx)
    p_t1 = pt(top1_idx)
    p_b1 = pt(bot1_idx)
    p_t2 = pt(top2_idx)
    p_b2 = pt(bot2_idx)

    horiz = np.linalg.norm(p_l - p_r)
    vert1 = np.linalg.norm(p_t1 - p_b1)
    vert2 = np.linalg.norm(p_t2 - p_b2)

    if horiz <= 1e-5:
        return 0.0
    return float((vert1 + vert2) / (2.0 * horiz))

def is_eye_region_open_iris_check(eye_roi_gray):
    """Fallback verification using pixel distribution for open iris vs closed eyelid."""
    if eye_roi_gray is None or eye_roi_gray.size < 50:
        return False
    h, w = eye_roi_gray.shape
    center = eye_roi_gray[int(h * 0.25):int(h * 0.75), int(w * 0.25):int(w * 0.75)]
    if center.size == 0:
        return False
    min_val, max_val, _, _ = cv2.minMaxLoc(center)
    contrast = max_val - min_val
    std_dev = np.std(center)
    return (contrast > 45 and std_dev > 15)

def async_send_alert(is_drowsy, event_count):
    def _send():
        sent_local = False
        # 1. Try local Node backend (Port 5000)
        try:
            payload = {"isDrowsy": is_drowsy, "events": event_count}
            headers = {'Content-Type': 'application/json'}
            resp = requests.post(SERVER_URL, data=json.dumps(payload), headers=headers, timeout=0.8)
            if resp.status_code == 200:
                sent_local = True
        except Exception:
            sent_local = False

        # 2. Direct Supabase Cloud sync safeguard (always active on drowsiness alerts, or if local server offline)
        if (is_drowsy or not sent_local) and SUPABASE_URL and SUPABASE_KEY:
            try:
                sb_headers = {
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
                # Sync to drowsiness_logs
                sb_payload = {'is_drowsy': bool(is_drowsy), 'events_count': int(event_count)}
                requests.post(f"{SUPABASE_URL}/rest/v1/drowsiness_logs", json=sb_payload, headers=sb_headers, timeout=1.5)

                # On actual drowsiness alert, log to road_events
                if is_drowsy:
                    road_payload = {
                        'type': 'Drowsiness Alert',
                        'confidence': 100,
                        'latitude': 26.823287,
                        'longitude': 75.866808
                    }
                    requests.post(f"{SUPABASE_URL}/rest/v1/road_events", json=road_payload, headers=sb_headers, timeout=1.5)
            except Exception:
                pass

    t = threading.Thread(target=_send, daemon=True)
    t.start()

def render_camera_offline_frame():
    """Renders standby frame when physical webcam is disconnected or probing."""
    global simulated_drowsy, drowsiness_events_count
    
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame[:] = (18, 15, 12)

    cv2.rectangle(frame, (0, 0), (640, 48), (28, 22, 18), -1)
    cv2.line(frame, (0, 48), (640, 48), (0, 180, 255), 1)
    cv2.putText(frame, "I-SARTHI NEURAL DMS VISION FEED", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 220, 255), 2)
    cv2.putText(frame, "STANDBY / SIMULATION", (450, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 165, 255), 1)

    head_color = (0, 0, 255) if simulated_drowsy else (0, 200, 255)
    cv2.circle(frame, (138, 180), 65, head_color, 2)

    if simulated_drowsy:
        cv2.line(frame, (110, 165), (128, 165), (0, 0, 255), 3)
        cv2.line(frame, (148, 165), (166, 165), (0, 0, 255), 3)
        cv2.putText(frame, "EYES CLOSED (DROWSY)", (45, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)
    else:
        cv2.circle(frame, (118, 165), 10, (0, 255, 100), 2)
        cv2.circle(frame, (118, 165), 4, (0, 255, 100), -1)
        cv2.circle(frame, (158, 165), 10, (0, 255, 100), 2)
        cv2.circle(frame, (158, 165), 4, (0, 255, 100), -1)
        cv2.putText(frame, "EYES OPEN (ATTENTIVE)", (45, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 100), 1)

    cv2.putText(frame, f"Triggers: {drowsiness_events_count}", (45, 310), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 220, 220), 1)
    cv2.putText(frame, "Searching for camera...", (285, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 180, 255), 2)
    cv2.putText(frame, "Ensure camera privacy shutter is open", (285, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1)

    return frame

def camera_processing_worker():
    """Continuous background worker that captures video, detects driver eyes, and streams output."""
    global camera, camera_index, camera_status, worker_running
    global eyes_closed_start_time, current_drowsy, drowsiness_events_count
    global last_api_update, faces_count, eyes_count, simulated_drowsy
    global current_ear, current_blink, latest_jpeg_frame

    import mediapipe as mp

    consecutive_failures = 0

    while worker_running:
        try:
            with camera_lock:
                cam = camera

            now = time.time()

            # If camera not opened, attempt to connect to Laptop Webcam (Index 0)
            if cam is None or not cam.isOpened():
                new_cam = None
                # Priority 1: Default Windows Media Foundation (MSMF)
                try:
                    new_cam = cv2.VideoCapture(0)
                    if new_cam is not None and new_cam.isOpened():
                        ret, test_f = new_cam.read()
                        if not ret or test_f is None or test_f.size == 0:
                            new_cam.release()
                            new_cam = None
                except Exception as e:
                    print(f"[DMS] cv2.VideoCapture(0) error: {e}")
                    new_cam = None

                # Priority 2: DirectShow fallback (CAP_DSHOW) with MJPG set BEFORE reading
                if new_cam is None or not new_cam.isOpened():
                    if sys.platform.startswith('win'):
                        try:
                            new_cam = cv2.VideoCapture(0, cv2.CAP_DSHOW)
                            if new_cam is not None and new_cam.isOpened():
                                new_cam.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
                                new_cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                                new_cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                                ret, test_f = new_cam.read()
                                if not ret or test_f is None or test_f.size == 0:
                                    new_cam.release()
                                    new_cam = None
                        except Exception as e:
                            print(f"[DMS] CAP_DSHOW error: {e}")
                            new_cam = None

                if new_cam is not None and new_cam.isOpened():
                    with camera_lock:
                        camera = new_cam
                        camera_index = 0
                        camera_status = "active (Laptop Built-in Camera)"
                        print("[DMS] Laptop Webcam connected successfully.")
                else:
                    if camera is None or not camera.isOpened():
                        offline_f = render_camera_offline_frame()
                        ret, buf = cv2.imencode('.jpg', offline_f, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                        if ret:
                            with frame_lock:
                                latest_jpeg_frame = buf.tobytes()
                            new_frame_event.set()
                        time.sleep(2.0)
                        continue

            # Read frame
            success, frame = cam.read()
            if not success or frame is None:
                consecutive_failures += 1
                if consecutive_failures > 20:
                    with camera_lock:
                        if camera is not None:
                            try:
                                camera.release()
                            except Exception:
                                pass
                            camera = None
                    consecutive_failures = 0
                time.sleep(0.04)
                continue

            consecutive_failures = 0

            # Resize cleanly to 640 width if needed, preserving aspect ratio and preventing driver stride artifacts
            if frame.shape[1] > 640:
                scale = 640.0 / frame.shape[1]
                new_h = int(frame.shape[0] * scale)
                frame = cv2.resize(frame, (640, new_h), interpolation=cv2.INTER_AREA)

            h_frame, w_frame = frame.shape[:2]

            face_detected = False
            eyes_are_closed = False
            closure_duration = 0.0

            # -------------------------------------------------------------
            # 1. PRIMARY: MediaPipe Neural Face Mesh & Blink Detection
            # -------------------------------------------------------------
            if mediapipe_detector is not None:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
                res = mediapipe_detector.detect(mp_img)

                if res.face_landmarks and len(res.face_landmarks) > 0:
                    face_detected = True
                    faces_count = 1
                    landmarks = res.face_landmarks[0]

                    # Blendshapes (blink probability)
                    blink_left = 0.0
                    blink_right = 0.0
                    if res.face_blendshapes and len(res.face_blendshapes) > 0:
                        for b in res.face_blendshapes[0]:
                            if b.category_name == 'eyeBlinkLeft':
                                blink_left = b.score
                            elif b.category_name == 'eyeBlinkRight':
                                blink_right = b.score

                    avg_blink = (blink_left + blink_right) / 2.0
                    current_blink = avg_blink

                    # EAR calculation
                    left_ear = compute_ear(landmarks, 33, 133, 160, 144, 158, 153, w_frame, h_frame)
                    right_ear = compute_ear(landmarks, 362, 263, 385, 380, 387, 373, w_frame, h_frame)
                    avg_ear = (left_ear + right_ear) / 2.0
                    current_ear = avg_ear

                    # DECISION:
                    # Eyes closed = High blink probability (> 0.45) OR low EAR (< 0.20 with blink > 0.28)
                    eyes_are_closed = (avg_blink >= BLINK_CLOSED_THRESHOLD) or (avg_ear < EAR_CLOSED_THRESHOLD and avg_blink >= 0.28)
                    eyes_count = 0 if eyes_are_closed else 2

                    # Draw eye contour mesh
                    l_pts = np.array([[int(landmarks[idx].x * w_frame), int(landmarks[idx].y * h_frame)] for idx in LEFT_EYE_LANDMARKS], np.int32)
                    r_pts = np.array([[int(landmarks[idx].x * w_frame), int(landmarks[idx].y * h_frame)] for idx in RIGHT_EYE_LANDMARKS], np.int32)

                    if eyes_are_closed:
                        cv2.polylines(frame, [l_pts], isClosed=True, color=(0, 0, 255), thickness=2)
                        cv2.polylines(frame, [r_pts], isClosed=True, color=(0, 0, 255), thickness=2)
                    else:
                        cv2.polylines(frame, [l_pts], isClosed=True, color=(0, 255, 100), thickness=2)
                        cv2.polylines(frame, [r_pts], isClosed=True, color=(0, 255, 100), thickness=2)

            # -------------------------------------------------------------
            # 2. FALLBACK: Haar Cascade + Iris Contrast Check
            # -------------------------------------------------------------
            if not face_detected and face_cascade is not None:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                gray = cv2.equalizeHist(gray)
                faces = face_cascade.detectMultiScale(gray, scaleFactor=1.15, minNeighbors=4, minSize=(70, 70))
                faces_count = len(faces)

                if len(faces) > 0:
                    face_detected = True
                    (x, y, w, h) = faces[0]
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 180, 0), 2)

                    eye_roi_gray = gray[y:y + int(h * 0.65), x:x + w]
                    eye_roi_color = frame[y:y + int(h * 0.65), x:x + w]

                    detected_eyes_open = 0
                    if eye_cascade_default is not None:
                        eyes = eye_cascade_default.detectMultiScale(eye_roi_gray, scaleFactor=1.1, minNeighbors=4, minSize=(20, 20))
                        for (ex, ey, ew, eh) in eyes:
                            single_eye_gray = eye_roi_gray[ey:ey + eh, ex:ex + ew]
                            if is_eye_region_open_iris_check(single_eye_gray):
                                detected_eyes_open += 1
                                cv2.rectangle(eye_roi_color, (ex, ey), (ex + ew, ey + eh), (0, 255, 0), 2)
                            else:
                                cv2.rectangle(eye_roi_color, (ex, ey), (ex + ew, ey + eh), (0, 0, 255), 2)

                    eyes_count = detected_eyes_open
                    eyes_are_closed = (detected_eyes_open == 0)

            # -------------------------------------------------------------
            # 3. Drowsiness State & Duration Tracking
            # -------------------------------------------------------------
            is_currently_closed = (face_detected and eyes_are_closed) or simulated_drowsy

            if is_currently_closed:
                if eyes_closed_start_time is None:
                    eyes_closed_start_time = now

                closure_duration = now - eyes_closed_start_time
                thresh = 0.2 if simulated_drowsy else DROWSINESS_THRESHOLD_SECONDS
                if closure_duration >= thresh:
                    if not current_drowsy:
                        current_drowsy = True
                        drowsiness_events_count += 1
                        print(f"[DMS ALERT] Drowsiness event #{drowsiness_events_count} (Closed for {closure_duration:.1f}s)")
                        async_send_alert(True, drowsiness_events_count)
            else:
                eyes_closed_start_time = None
                if current_drowsy:
                    print("[DMS] Driver eyes reopened & attentive.")
                    current_drowsy = False
                    async_send_alert(False, drowsiness_events_count)

            # Periodic sync every 1.5s
            if now - last_api_update > 1.5:
                async_send_alert(current_drowsy, drowsiness_events_count)
                last_api_update = now

            # -------------------------------------------------------------
            # 4. HUD Telemetry Overlay
            # -------------------------------------------------------------
            if current_drowsy:
                status_text = "DROWSINESS DETECTED!"
                status_color = (0, 0, 255)
            elif face_detected and eyes_are_closed:
                status_text = f"EYES CLOSED ({closure_duration:.1f}s / {DROWSINESS_THRESHOLD_SECONDS}s)"
                status_color = (0, 165, 255)
            elif face_detected:
                status_text = "DRIVER ATTENTIVE (EYES OPEN)"
                status_color = (0, 255, 100)
            else:
                status_text = "SCANNING FOR DRIVER..."
                status_color = (180, 180, 180)

            cv2.rectangle(frame, (10, 10), (370, 95), (10, 15, 25), -1)
            cv2.rectangle(frame, (10, 10), (370, 95), status_color, 2)
            cv2.putText(frame, status_text, (20, 36), cv2.FONT_HERSHEY_SIMPLEX, 0.52, status_color, 2)
            cv2.putText(frame, f"EAR: {current_ear:.2f} | Blink Score: {current_blink:.2f}", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (220, 220, 220), 1)
            cv2.putText(frame, f"Triggers: {drowsiness_events_count} | Eyes: {eyes_count} | Faces: {faces_count}", (20, 82), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 220, 255), 1)

            ret, buf = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if ret:
                with frame_lock:
                    latest_jpeg_frame = buf.tobytes()
                new_frame_event.set()

            time.sleep(0.015)  # ~35-40 FPS
        except Exception as e:
            time.sleep(0.05)

def generate_frames():
    """Generator yielding latest JPEG frame to web clients."""
    while True:
        new_frame_event.wait(timeout=0.1)
        with frame_lock:
            frame_data = latest_jpeg_frame

        if frame_data is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n')
        new_frame_event.clear()
        time.sleep(0.02)

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
        "ear": round(current_ear, 3),
        "blink": round(current_blink, 3),
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
    def _pulse():
        global simulated_drowsy
        simulated_drowsy = True
        time.sleep(3.0)
        simulated_drowsy = False
    threading.Thread(target=_pulse, daemon=True).start()
    return jsonify({"triggered": True, "duration": 3.0})

@app.route('/cameras')
def get_cameras():
    return jsonify({
        "current_index": 0,
        "status": camera_status,
        "available": [
            {
                "index": 0,
                "name": "💻 Laptop Built-in Webcam",
                "active": (camera is not None and camera.isOpened())
            }
        ]
    })

@app.route('/switch_camera')
def switch_camera():
    global camera, camera_index, camera_status
    camera_index = 0
    return jsonify({
        "success": True,
        "device": 0,
        "status": "active (Laptop Built-in Webcam)"
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
    print("[DMS] Starting High-Precision Neural DMS Drowsiness Detector on Port 5001...")
    init_vision_models()
    
    # Start background processing thread
    t = threading.Thread(target=camera_processing_worker, daemon=True)
    t.start()
    
    app.run(host='0.0.0.0', port=5001, threaded=True)
