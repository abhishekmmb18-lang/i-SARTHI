"""
I-SARTHI Live Road Damage Detection Web Server
Streams real-time webcam feed with YOLO11n obstacle detections directly to your browser.
Includes real-time sensitivity / confidence threshold controls AND automatic Supabase Cloud Sync.
"""

import time
import json
import urllib.request
import threading
from pathlib import Path
import cv2
from flask import Flask, Response, render_template_string, request, jsonify
from ultralytics import YOLO

app = Flask(__name__)
MODEL_PATH = Path(__file__).parent / "isarthi_road_damage.pt"
BACKEND_API = "http://localhost:5000/api/pothole"

CLASS_COLORS = {
    "pothole": (0, 0, 255),          # Red
    "crack": (0, 165, 255),          # Orange
    "debris": (0, 255, 255),         # Yellow
    "manhole": (255, 0, 255),        # Magenta
    "speed_breaker": (0, 255, 0),    # Green
    "road_barricade": (255, 100, 0), # Cyan
}

def sync_to_supabase(cls_name, score, bbox):
    """Asynchronously pushes verified road hazard event to Supabase via backend API."""
    try:
        payload = {
            "vehicle_id": "ISARTHI_VISION_CAM",
            "class_name": cls_name,
            "confidence": round(score, 3),
            "severity": 3 if score > 0.6 else 2,
            "bbox": bbox
        }
        req = urllib.request.Request(
            BACKEND_API,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status in [200, 201]:
                print(f"[+] [SUPABASE SYNC] Successfully logged {cls_name} ({score:.0%}) to Supabase cloud!")
    except Exception as e:
        # Backend offline or unreachable
        pass

class VideoStreamer:
    def __init__(self):
        print(f"[+] Loading YOLO model: {MODEL_PATH.name}...")
        self.model = YOLO(str(MODEL_PATH))
        self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if not self.cap.isOpened():
            self.cap = cv2.VideoCapture(0)
        
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        self.latest_frame = None
        self.latest_annotated = None
        self.boxes_data = []
        self.fps = 0.0
        self.conf = 0.15  # Sensitive default for road damage
        self.running = True
        self.last_sync_time = {}  # Cooldown per class
        self.lock = threading.Lock()

        # Capture thread
        self.cap_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.cap_thread.start()

        # Inference thread
        self.infer_thread = threading.Thread(target=self._inference_loop, daemon=True)
        self.infer_thread.start()

    def set_conf(self, conf):
        with self.lock:
            self.conf = max(0.01, min(0.95, conf))

    def _capture_loop(self):
        prev_time = time.time()
        while self.running:
            ret, frame = self.cap.read()
            if not ret or frame is None:
                time.sleep(0.01)
                continue
            
            curr_time = time.time()
            dt = curr_time - prev_time
            if dt > 0:
                self.fps = 0.9 * self.fps + 0.1 * (1.0 / dt)
            prev_time = curr_time

            with self.lock:
                self.latest_frame = frame

                # Render latest detections on display frame
                disp_frame = frame.copy()
                for cls_name, score, (x1, y1, x2, y2) in self.boxes_data:
                    color = CLASS_COLORS.get(cls_name, (0, 255, 0))
                    cv2.rectangle(disp_frame, (x1, y1), (x2, y2), color, 2)
                    label = f"{cls_name} {score:.0%}"
                    (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                    cv2.rectangle(disp_frame, (x1, max(0, y1 - 22)), (x1 + w + 8, y1), color, -1)
                    cv2.putText(
                        disp_frame,
                        label,
                        (x1 + 4, max(16, y1 - 5)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (255, 255, 255),
                        2,
                        cv2.LINE_AA,
                    )

                # Draw top HUD
                num_det = len(self.boxes_data)
                cv2.rectangle(disp_frame, (0, 0), (disp_frame.shape[1], 36), (15, 15, 20), -1)
                hud_color = (0, 220, 0) if num_det == 0 else (0, 0, 255)
                hud_text = f"I-SARTHI LIVE | FPS: {self.fps:.1f} | Conf: {self.conf:.2f} | Supabase: SYNC ON | Obstacles: {num_det}"
                cv2.putText(disp_frame, hud_text, (12, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.55, hud_color, 2, cv2.LINE_AA)
                self.latest_annotated = disp_frame

            time.sleep(0.01)

    def _inference_loop(self):
        while self.running:
            frame_to_process = None
            current_conf = self.conf
            with self.lock:
                if self.latest_frame is not None:
                    frame_to_process = self.latest_frame.copy()

            if frame_to_process is not None:
                results = self.model.predict(frame_to_process, imgsz=480, conf=current_conf, verbose=False)
                new_boxes = []
                now = time.time()
                if results and len(results) > 0:
                    r = results[0]
                    for b in r.boxes:
                        cls_id = int(b.cls[0].item())
                        cls_name = self.model.names[cls_id]
                        score = float(b.conf[0].item())
                        xyxy = [int(v) for v in b.xyxy[0].tolist()]
                        new_boxes.append((cls_name, score, xyxy))

                        # Auto-sync to Supabase with 2.5s debounce per class
                        if now - self.last_sync_time.get(cls_name, 0) > 2.5:
                            self.last_sync_time[cls_name] = now
                            threading.Thread(
                                target=sync_to_supabase,
                                args=(cls_name, score, xyxy),
                                daemon=True
                            ).start()

                with self.lock:
                    self.boxes_data = new_boxes

            time.sleep(0.02)

    def generate_frames(self):
        while self.running:
            with self.lock:
                frame = self.latest_annotated
            if frame is None:
                time.sleep(0.03)
                continue
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if not ret:
                continue
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.03)

streamer = None

HTML_PAGE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>I-SARTHI | Road Damage Live Camera & Supabase Cloud Sync</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            background: #0d1117;
            color: #c9d1d9;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px;
        }
        .header {
            width: 100%;
            max-width: 900px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #30363d;
        }
        .title {
            font-size: 22px;
            font-weight: 700;
            color: #58a6ff;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .badge-live {
            background: #238636;
            color: white;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .badge-cloud {
            background: rgba(35, 134, 54, 0.2);
            color: #56d364;
            border: 1px solid #238636;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 12px;
            font-weight: 600;
        }
        .container {
            width: 100%;
            max-width: 900px;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .video-box {
            position: relative;
            background: #000;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 480px;
        }
        .video-stream {
            width: 100%;
            height: auto;
            max-height: 520px;
            display: block;
            object-fit: contain;
        }
        .controls-bar {
            padding: 16px 20px;
            background: #1f242c;
            border-top: 1px solid #30363d;
            border-bottom: 1px solid #30363d;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }
        .slider-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        .slider-wrap label {
            font-size: 13px;
            font-weight: 600;
            color: #79c0ff;
            white-space: nowrap;
        }
        .slider-wrap input[type=range] {
            flex: 1;
            accent-color: #58a6ff;
            cursor: pointer;
        }
        .slider-val {
            font-size: 14px;
            font-weight: 700;
            color: #56d364;
            min-width: 45px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            padding: 20px;
            background: #161b22;
        }
        .metric-card {
            background: #21262d;
            border: 1px solid #30363d;
            border-radius: 8px;
            padding: 14px;
            text-align: center;
        }
        .metric-label {
            font-size: 12px;
            color: #8b949e;
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        .metric-val {
            font-size: 20px;
            font-weight: 700;
            color: #f0f6fc;
        }
        .classes-bar {
            padding: 14px 20px;
            background: #0d1117;
            border-top: 1px solid #30363d;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            font-size: 13px;
        }
        .tag {
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
        }
        .tag-pothole { background: rgba(255, 0, 0, 0.2); color: #ff7b72; border: 1px solid #f85149; }
        .tag-crack { background: rgba(255, 165, 0, 0.2); color: #ffa657; border: 1px solid #d29922; }
        .tag-debris { background: rgba(255, 255, 0, 0.2); color: #e3b341; border: 1px solid #bb8009; }
        .tag-manhole { background: rgba(255, 0, 255, 0.2); color: #f778ba; border: 1px solid #db61a2; }
        .tag-speed_breaker { background: rgba(0, 255, 0, 0.2); color: #56d364; border: 1px solid #238636; }
        .tag-road_barricade { background: rgba(0, 200, 255, 0.2); color: #79c0ff; border: 1px solid #388bfd; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">
            <span>🚗 I-SARTHI Road Safety AI</span>
            <span class="badge-live">LIVE STREAM</span>
            <span class="badge-cloud">SUPABASE AUTO-SYNC ON</span>
        </div>
        <div style="font-size: 13px; color: #8b949e;">Model: YOLO11n (Road Damage)</div>
    </div>

    <div class="container">
        <div class="video-box">
            <img class="video-stream" src="/video_feed" alt="Live Road Detection Stream">
        </div>
        
        <!-- Interactive Sensitivity / Confidence Slider -->
        <div class="controls-bar">
            <div class="slider-wrap">
                <label for="confSlider">🎯 Sensitivity (Confidence Threshold):</label>
                <input type="range" id="confSlider" min="0.05" max="0.60" step="0.05" value="0.15" oninput="updateConfidence(this.value)">
                <span class="slider-val" id="confVal">15%</span>
            </div>
            <span style="font-size: 11px; color: #56d364;">⚡ Detections auto-push to Supabase cloud table (road_events)</span>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Model Accuracy (mAP@50)</div>
                <div class="metric-val" style="color: #56d364;">61.22%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Supabase Cloud Sync</div>
                <div class="metric-val" style="color: #79c0ff;">ACTIVE</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Model Recall</div>
                <div class="metric-val" style="color: #ffa657;">55.60%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Classes Monitored</div>
                <div class="metric-val">6 Classes</div>
            </div>
        </div>
        <div class="classes-bar">
            <strong style="color: #8b949e; margin-right: 6px;">Detectable Classes:</strong>
            <span class="tag tag-pothole">Pothole</span>
            <span class="tag tag-crack">Crack</span>
            <span class="tag tag-debris">Debris</span>
            <span class="tag tag-manhole">Manhole</span>
            <span class="tag tag-speed_breaker">Speed Breaker</span>
            <span class="tag tag-road_barricade">Road Barricade</span>
        </div>
    </div>

    <script>
        function updateConfidence(val) {
            document.getElementById('confVal').innerText = Math.round(val * 100) + '%';
            fetch('/set_confidence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conf: parseFloat(val) })
            });
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_PAGE)

@app.route('/set_confidence', methods=['POST'])
def set_confidence():
    global streamer
    data = request.get_json() or {}
    conf = data.get('conf', 0.15)
    if streamer:
        streamer.set_conf(conf)
    return jsonify({"status": "ok", "conf": conf})

@app.route('/video_feed')
def video_feed():
    global streamer
    if streamer is None:
        streamer = VideoStreamer()
    return Response(streamer.generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    print("[+] Starting I-SARTHI Live Camera Web Stream on http://localhost:5050 ...")
    app.run(host='0.0.0.0', port=5050, threaded=True)
