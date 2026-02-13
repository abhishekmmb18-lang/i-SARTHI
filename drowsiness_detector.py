import cv2
import time
import requests
import json
from flask import Flask, Response

app = Flask(__name__)

# -------- Configuration --------
SERVER_URL = "http://localhost:5000/api/drowsiness"

# Tuned Parameters (Stricter Eyes)
FACE_SCALE_FACTOR = 1.1  # Keep face detection sensitive
FACE_MIN_NEIGHBORS = 3   # Keep face detection sensitive
FACE_MIN_SIZE = (60, 60)

EYE_SCALE_FACTOR = 1.1
EYE_MIN_NEIGHBORS = 5     # INCREASED: Harder to find eyes -> Easier to trigger "Closed"
EYE_MIN_SIZE = (22, 22)   # INCREASED: Ensure only distinct eyes are counted

DROWSINESS_THRESHOLD_SECONDS = 1.5 # Faster trigger
MIN_EYES_OPEN = 1 # At least one eye must be detected to be "awake"

# Global State
camera = None
eyes_closed_start_time = None
current_drowsy = False
drowsiness_events_count = 0
last_api_update = 0

def send_alert(is_drowsy, event_count):
    try:
        payload = {"isDrowsy": is_drowsy, "events": event_count}
        headers = {'Content-Type': 'application/json'}
        requests.post(SERVER_URL, data=json.dumps(payload), headers=headers, timeout=0.1)
    except Exception:
        pass

def generate_frames():
    global camera, eyes_closed_start_time, current_drowsy, drowsiness_events_count, last_api_update
    
    # Load Classifiers
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye_tree_eyeglasses.xml")

    if camera is None or not camera.isOpened():
        camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    while True:
        success, frame = camera.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        # Better Face Detection
        faces = face_cascade.detectMultiScale(
            gray, 
            scaleFactor=FACE_SCALE_FACTOR, 
            minNeighbors=FACE_MIN_NEIGHBORS, 
            minSize=FACE_MIN_SIZE
        )

        eyes_detected = 0
        
        # Process Faces
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y + h, x:x + w]
            roi_color = frame[y:y + h, x:x + w]
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            
            # Detect Eyes in ROI
            eyes = eye_cascade.detectMultiScale(
                roi_gray,
                scaleFactor=EYE_SCALE_FACTOR,
                minNeighbors=EYE_MIN_NEIGHBORS,
                minSize=EYE_MIN_SIZE
            )
            
            eyes_detected += len(eyes)
            
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(roi_color, (ex, ey), (ex + ew, ey + eh), (0, 255, 0), 2)

        # Drowsiness Logic: Face present but NO EYES detected (or closed)
        face_present = len(faces) > 0
        eyes_closed = face_present and eyes_detected < MIN_EYES_OPEN
        
        # Debug Print (CRITICAL for User to see)
        print(f"DEBUG: Faces={len(faces)}, Eyes={eyes_detected}, TimeClosed={0 if eyes_closed_start_time is None else round(time.time() - eyes_closed_start_time, 2)}s")

        now = time.time()

        if eyes_closed:
            if eyes_closed_start_time is None:
                eyes_closed_start_time = now
            
            duration = now - eyes_closed_start_time
            if duration >= DROWSINESS_THRESHOLD_SECONDS:
                if not current_drowsy:
                    current_drowsy = True
                    drowsiness_events_count += 1
                    send_alert(True, drowsiness_events_count)
            
            # If closed for > 1s, show warning in console
            if duration > 1.0:
                 print(f"⚠️ Eyes Closed for {duration:.2f}s...")
                 
        else:
            eyes_closed_start_time = None
            if current_drowsy:
                print("✅ Eyes Opened. Status: Active")
                current_drowsy = False
                send_alert(False, drowsiness_events_count)

        # Periodic API Sync
        if now - last_api_update > 2.0:
            # heartbeat
            send_alert(current_drowsy, drowsiness_events_count)
            last_api_update = now
            
        # --- CRITICAL DROWSINESS ALERT (GSM) ---
        if drowsiness_events_count > 10 and drowsiness_events_count % 5 == 1: 
            # Trigger every 10th+ event (throttle slightly)
            try:
                print("🚨 CRITICAL: Drowsiness events > 10. Sending SMS...")
                payload = {"type": "drowsiness"}
                requests.post("http://localhost:5000/api/sos", json=payload, timeout=1)
            except:
                pass

        # Overlay Info
        status = "DROWSY!" if current_drowsy else "Active"
        color = (0, 0, 255) if current_drowsy else (0, 255, 0)
        
        cv2.putText(frame, f"Status: {status}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        cv2.putText(frame, f"Faces: {len(faces)} Eyes: {eyes_detected}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"Events: {drowsiness_events_count}", (20, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    print("Starting Optimized Drowsiness Detector (Haar)...")
    app.run(host='0.0.0.0', port=5001, threaded=True)
