import cv2
import json
import os
import socket
import sys
import subprocess
import threading
import time
import urllib.request
import urllib.error
from pathlib import Path

from flask import Flask, Response, jsonify
from ultralytics import YOLO


# ============================================================
# iSARTHI CONFIGURATION
# ============================================================

MODEL_FILE = "best.pt"
VEHICLE_ID = "ISARTHI_A"

# Raspberry Pi CSI camera via Picamera2/libcamera (preferred).
# Set ISARTHI_CAMERA=usb if using Logitech C270 or USB webcam.
CAMERA_MODE = os.getenv("ISARTHI_CAMERA", "csi").lower()
CAMERA_INDEX = int(os.getenv("ISARTHI_CAMERA_INDEX", "0"))
CAMERA_WIDTH = 1280
CAMERA_HEIGHT = 720
CAMERA_FPS = 30

CONFIDENCE_THRESHOLD = 0.50
POTHOLE_CLASSES = {
    name.strip().lower()
    for name in os.getenv("ISARTHI_POTHOLE_CLASSES", "pothole,d00").split(",")
    if name.strip()
}

# ESP32 receiver
ESP32_IP = os.getenv("ISARTHI_ESP32_IP", "10.128.23.154")
UDP_PORT = int(os.getenv("ISARTHI_ESP32_PORT", "4210"))

# Laptop dashboard IP (Defaults to your laptop's current network IP: 10.193.29.214)
DEFAULT_LAPTOP_IP = os.getenv("ISARTHI_SERVER_IP", "10.193.29.214")

# Allow passing laptop IP directly via CLI: python3 pothole.py 10.58.198.112
if len(sys.argv) > 1 and not sys.argv[1].startswith("-"):
    arg_ip = sys.argv[1].replace("http://", "").replace("https://", "").split("/")[0].split(":")[0]
    if arg_ip:
        DEFAULT_LAPTOP_IP = arg_ip

DASHBOARD_BASE = os.getenv("ISARTHI_DASHBOARD_BASE", f"http://{DEFAULT_LAPTOP_IP}:5000")
DASHBOARD_URL = f"{DASHBOARD_BASE}/api/pothole"

# Supabase Direct Cloud Sync
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://caqsenljmkkqlgaudtlk.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# GPS bridge writes: {"latitude": 22.123, "longitude": 88.456}
GPS_FILE = Path("/tmp/isarthi_gps.json")

SEVERITY = 2
EVENT_COOLDOWN_SECONDS = 3.0

# Open on laptop: http://<PI_IP>:5002/video_feed
STREAM_HOST = "0.0.0.0"
STREAM_PORT = int(os.getenv("ISARTHI_STREAM_PORT", "5002"))
JPEG_QUALITY = 80

# Optional local preview on Pi display: ISARTHI_SHOW_WINDOW=1
SHOW_WINDOW = os.getenv("ISARTHI_SHOW_WINDOW", "1") == "1"

app = Flask(__name__)
_frame_lock = threading.Lock()
_latest_jpeg = None
_detection_status = {
    "detected": False,
    "confidence": 0.0,
    "class_name": None,
    "vehicle_id": VEHICLE_ID,
    "camera": "Initializing",
    "status": "starting",
    "timestamp": None,
    "latitude": None,
    "longitude": None,
}


@app.route("/")
def index():
    return """
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>iSARTHI Live Road Monitoring</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #111827; color: #f9fafb; }
          .wrap { max-width: 1100px; margin: auto; }
          img { width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: contain; background: #000; border-radius: 12px; }
          pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #1f2937; padding: 12px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>iSARTHI — Live Pothole Detection</h1>
          <p>Live annotated Raspberry Pi camera / YOLO feed</p>
          <img src="/video_feed" alt="Live camera feed">
          <h2>Detection / GPS status</h2>
          <pre id="status">Loading status...</pre>
        </div>
        <script>
          async function updateStatus() {
            try {
              const r = await fetch('/status', {cache: 'no-store'});
              document.getElementById('status').textContent =
                JSON.stringify(await r.json(), null, 2);
            } catch (e) {
              document.getElementById('status').textContent = 'Status unavailable: ' + e;
            }
          }
          updateStatus();
          setInterval(updateStatus, 1000);
        </script>
      </body>
    </html>
    """


@app.route("/video_feed")
def video_feed():
    """Serve the latest annotated frame as a clean, standard MJPEG stream."""
    def generate():
        while True:
            with _frame_lock:
                frame_bytes = _latest_jpeg
            if frame_bytes is not None:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + frame_bytes
                    + b"\r\n"
                )
            time.sleep(0.035)  # ~28 FPS (prevents socket flooding and CPU lockup)

    return Response(
        generate(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
    )


@app.route("/status")
def stream_status():
    with _frame_lock:
        status = dict(_detection_status)
    resp = jsonify(status)
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


def get_local_ip():
    """Auto-detect Pi LAN IP address."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def register_with_dashboard():
    """Automatically announces this Pi's stream IP and port to laptop dashboard."""
    def _announce():
        time.sleep(1.5)
        my_ip = get_local_ip()
        payload = {"pi_ip": my_ip, "stream_port": STREAM_PORT}
        try:
            req = urllib.request.Request(
                f"{DASHBOARD_BASE}/api/pothole/config",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=3.0) as r:
                print(f"🚀 [AUTO-CONNECT] Connected Pi Camera ({my_ip}:{STREAM_PORT}) to Dashboard at {DASHBOARD_BASE}!", flush=True)
        except Exception as e:
            print(f"ℹ️ [AUTO-CONNECT] Note: Could not auto-notify {DASHBOARD_BASE}: {e}", flush=True)

    threading.Thread(target=_announce, daemon=True).start()


def start_stream_server():
    thread = threading.Thread(
        target=lambda: app.run(
            host=STREAM_HOST,
            port=STREAM_PORT,
            threaded=True,
            debug=False,
            use_reloader=False,
        ),
        daemon=True,
        name="isarthi-video-server",
    )
    thread.start()
    register_with_dashboard()


# ============================================================
# GPS
# ============================================================

def get_gps():
    try:
        with GPS_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)

        lat = data.get("latitude")
        lon = data.get("longitude")
        if lat is None or lon is None:
            return 26.823287, 75.866808

        lat, lon = float(lat), float(lon)
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            return 26.823287, 75.866808

        return lat, lon
    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        return 26.823287, 75.866808


# ============================================================
# EVENT DELIVERY
# ============================================================

def send_to_esp32(event):
    payload = {
        "vehicle_id": event["vehicle_id"],
        "event": event["event"],
        "severity": event["severity"],
        "latitude": event["latitude"],
        "longitude": event["longitude"],
        "confidence": event["confidence"],
        "timestamp": event["timestamp"],
    }
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.sendto(json.dumps(payload).encode("utf-8"), (ESP32_IP, UDP_PORT))
        print(f"[V2V] UDP packet sent to {ESP32_IP}:{UDP_PORT}", flush=True)
    except OSError as exc:
        print(f"[V2V ERROR] {exc}", flush=True)


def send_to_dashboard(event):
    # 1. Forward to Laptop Node Server (for real-time dashboard banner, audio, and HUD)
    try:
        request = urllib.request.Request(
            DASHBOARD_URL,
            data=json.dumps(event).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=3) as response:
            print(f"📡 [DASHBOARD] HTTP {response.status} -> Hazard Logged on Dashboard!", flush=True)
    except urllib.error.HTTPError as exc:
        print(f"[DASHBOARD ERROR] HTTP {exc.code}: {exc.reason}", flush=True)
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"[DASHBOARD ERROR] Cannot publish to {DASHBOARD_URL}: {exc}", flush=True)

    # 2. Direct Supabase Cloud Sync
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            sb_event = {
                "type": "Pothole",
                "confidence": round(float(event.get("confidence", 0.85)) * 100),
                "vibration": float(event.get("severity", 2)) * 1.6,
                "latitude": float(event.get("latitude") or 26.823287),
                "longitude": float(event.get("longitude") or 75.866808),
                "distance": -1,
                "temperature": 0,
                "humidity": 0,
                "alcohol": 0,
                "network_strength": True,
                "sos_alert": False,
                "gsm_connected": True
            }
            sb_req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/road_events",
                data=json.dumps(sb_event).encode('utf-8'),
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                method='POST'
            )
            with urllib.request.urlopen(sb_req, timeout=2.0) as resp:
                print("☁️ [SUPABASE SYNC] Pothole recorded directly in Cloud database!", flush=True)
        except Exception:
            pass


def publish_hazard(class_name, confidence, bbox):
    latitude, longitude = get_gps()
    event = {
        "vehicle_id": VEHICLE_ID,
        "event": "POTHOLE_DETECTED",
        "class_name": class_name,
        "confidence": round(float(confidence), 4),
        "severity": SEVERITY,
        "bbox": [round(float(v), 2) for v in bbox],
        "latitude": latitude,
        "longitude": longitude,
        "geotagged": latitude is not None and longitude is not None,
        "timestamp": int(time.time()),
    }

    print("\n========== iSARTHI HAZARD ==========")
    print(json.dumps(event, indent=2))
    print("====================================", flush=True)

    threading.Thread(target=send_to_esp32, args=(event,), daemon=True).start()
    threading.Thread(target=send_to_dashboard, args=(event,), daemon=True).start()


# ============================================================
# RASPBERRY PI CAMERA (Picamera2 CSI OR USB V4L2)
# ============================================================

def open_camera():
    """Return (camera_object, camera_kind). Auto-probes CSI (Picamera2) and USB (OpenCV V4L2)."""
    # 1. Try CSI Camera via Picamera2 if requested or not disabled
    if CAMERA_MODE != "usb":
        try:
            from picamera2 import Picamera2
            picam = Picamera2()
            config = picam.create_video_configuration(
                main={"size": (CAMERA_WIDTH, CAMERA_HEIGHT), "format": "BGR888"},
                controls={"FrameRate": CAMERA_FPS},
                buffer_count=4,
            )
            picam.configure(config)
            picam.start()
            time.sleep(1.0)
            test_frame = picam.capture_array()
            if test_frame is not None and test_frame.size > 0:
                print(f"📷 [CAMERA] Raspberry Pi CSI camera connected via Picamera2 ({test_frame.shape[1]}x{test_frame.shape[0]})", flush=True)
                return picam, "picamera2"
            else:
                picam.stop()
                print("⚠️ [CAMERA] Picamera2 returned empty frame, falling back to USB...", flush=True)
        except Exception as exc:
            print(f"ℹ️ [CAMERA] CSI / Picamera2 check: {exc}. Probing USB cameras...", flush=True)

    # 2. Probe USB / V4L2 Camera devices
    v4l2_backend = getattr(cv2, "CAP_V4L2", cv2.CAP_ANY)
    candidate_indices = [CAMERA_INDEX]
    for idx in [0, 1, 2, 3, 4]:
        if idx not in candidate_indices:
            candidate_indices.append(idx)

    for idx in candidate_indices:
        print(f"🔍 [CAMERA] Testing camera index {idx}...", flush=True)
        # Try with V4L2 first (Linux/Pi), fallback to default backend
        cap = cv2.VideoCapture(idx, v4l2_backend)
        if not cap.isOpened():
            cap = cv2.VideoCapture(idx)

        if cap.isOpened():
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
            cap.set(cv2.CAP_PROP_FPS, CAMERA_FPS)
            # Try reading a real frame to verify hardware stream
            ok, test_frame = cap.read()
            if ok and test_frame is not None and test_frame.size > 0:
                h, w = test_frame.shape[:2]
                print(f"📷 [CAMERA] Live USB / OpenCV camera detected at /dev/video{idx} ({w}x{h})!", flush=True)
                return cap, "opencv"
            cap.release()

    raise RuntimeError(
        "❌ [CAMERA ERROR] No physical camera could be opened!\n"
        "   - If using USB Webcam (Logitech C270): check USB plug and run 'ls -l /dev/video*'\n"
        "   - If using CSI Camera: ensure camera ribbon is seated and run 'rpicam-hello --list-cameras'\n"
    )


# ============================================================
# MAIN YOLO LOOP
# ============================================================

def main():
    global _latest_jpeg
    if not os.path.isfile(MODEL_FILE):
        raise FileNotFoundError(
            f"{MODEL_FILE} not found. Run this script from the folder containing best.pt."
        )

    print("[MODEL] Loading YOLO model...", flush=True)
    model = YOLO(MODEL_FILE)
    print("[MODEL] Loaded classes:", model.names, flush=True)
    print("[MODEL] Configured pothole labels:", POTHOLE_CLASSES, flush=True)

    camera, camera_kind = open_camera()
    camera_label = "Raspberry Pi CSI (Picamera2)" if camera_kind == "picamera2" else f"Camera index {CAMERA_INDEX}"
    last_alert = 0.0
    start_stream_server()

    with _frame_lock:
        _detection_status.update({
            "camera": camera_label,
            "status": "online",
        })

    my_ip = get_local_ip()
    print(f"\n🚀 [STREAM ACTIVE] http://{my_ip}:{STREAM_PORT}/video_feed", flush=True)
    print(f"📡 [DASHBOARD TARGET] {DASHBOARD_URL}", flush=True)
    print("[iSARTHI] Detection running. Press Ctrl+C to stop.\n", flush=True)

    try:
        while True:
            if camera_kind == "picamera2":
                try:
                    frame = camera.capture_array()
                    ret = frame is not None and frame.size > 0
                except Exception as exc:
                    print(f"[CAMERA WARNING] Picamera2 capture failed: {exc}", flush=True)
                    ret, frame = False, None
            else:
                ret, frame = camera.read()
            if not ret or frame is None:
                print("[CAMERA WARNING] Frame read failed; retrying.", flush=True)
                time.sleep(0.05)
                continue

            results = model.predict(
                frame,
                conf=CONFIDENCE_THRESHOLD,
                verbose=False,
            )
            result = results[0]
            best_detection = None

            if result.boxes is not None:
                for box in result.boxes:
                    class_id = int(box.cls[0].item())
                    confidence = float(box.conf[0].item())
                    class_name = str(model.names[class_id])

                    normalized_name = class_name.strip().lower()
                    is_pothole = (normalized_name in POTHOLE_CLASSES) or (
                        "ISARTHI_POTHOLE_CLASSES" not in os.environ and "pothole" in normalized_name
                    )
                    if not is_pothole:
                        continue

                    if best_detection is None or confidence > best_detection[1]:
                        best_detection = (
                            class_name,
                            confidence,
                            box.xyxy[0].tolist(),
                        )

            now = time.monotonic()
            if best_detection is not None and now - last_alert >= EVENT_COOLDOWN_SECONDS:
                name, confidence, bbox = best_detection
                publish_hazard(name, confidence, bbox)
                last_alert = now

            annotated = result.plot()
            encoded_ok, encoded = cv2.imencode(
                ".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY]
            )

            latitude, longitude = get_gps()
            with _frame_lock:
                _detection_status.update({
                    "detected": best_detection is not None,
                    "confidence": round(float(best_detection[1]), 4) if best_detection else 0.0,
                    "class_name": best_detection[0] if best_detection else None,
                    "vehicle_id": VEHICLE_ID,
                    "camera": camera_label,
                    "status": "online",
                    "timestamp": int(time.time()),
                    "latitude": latitude,
                    "longitude": longitude,
                })
                if encoded_ok:
                    _latest_jpeg = encoded.tobytes()

            if SHOW_WINDOW:
                try:
                    cv2.imshow("iSARTHI Pothole Detection", annotated)
                    if cv2.waitKey(1) & 0xFF in (ord("q"), 27):
                        break
                except Exception:
                    pass

    except KeyboardInterrupt:
        print("\n[iSARTHI] Stopping...", flush=True)
    finally:
        if camera_kind == "picamera2":
            camera.stop()
            camera.close()
        else:
            camera.release()
        cv2.destroyAllWindows()
        with _frame_lock:
            _detection_status["status"] = "stopped"
        print("[iSARTHI] Stopped.", flush=True)


if __name__ == "__main__":
    main()
