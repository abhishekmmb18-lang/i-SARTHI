"""
I-SARTHI Road Damage Detection - Model Testing & Evaluation Script
Model: YOLO11n (isarthi_road_damage.pt)
Classes: pothole, crack, debris, manhole, speed_breaker, road_barricade
"""

import os
import sys
import time
import threading
import argparse
from pathlib import Path
import json
import urllib.request
import cv2
from ultralytics import YOLO

MODEL_PATH = Path(__file__).parent / "isarthi_road_damage.pt"
BACKEND_API = "http://localhost:5000/api/pothole"

def sync_to_supabase(cls_name, score, bbox):
    try:
        payload = {
            "vehicle_id": "ISARTHI_TEST_RUNNER",
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
                print(f"[+] [SUPABASE SYNC] Logged {cls_name} ({score:.0%}) to Supabase cloud!")
    except Exception:
        pass


TRAINED_METRICS = {
    "Architecture": "YOLO11n (2.6M params, 6.5 GFLOPs)",
    "Epochs Trained": 5,
    "Precision (P)": "67.24%",
    "Recall (R)": "55.60%",
    "mAP@50": "61.22%",
    "mAP@50-95": "38.67%",
    "Val Box Loss": 1.725,
    "Val Cls Loss": 1.667,
    "Val DFL Loss": 1.738,
}

def print_accuracy_summary():
    print("=" * 60)
    print("       I-SARTHI MODEL EVALUATION & ACCURACY SUMMARY       ")
    print("=" * 60)
    for k, v in TRAINED_METRICS.items():
        print(f"  {k:<22}: {v}")
    print("=" * 60)

class ThreadedDetector:
    """Runs YOLO inference in a background thread to maintain high-FPS smooth camera feed."""
    def __init__(self, model_path, conf=0.25, imgsz=320):
        self.model = YOLO(str(model_path))
        self.conf = conf
        self.imgsz = imgsz
        self.latest_frame = None
        self.annotated_boxes = []
        self.running = True
        self.lock = threading.Lock()
        self.thread = threading.Thread(target=self._worker, daemon=True)
        self.thread.start()

    def update_frame(self, frame):
        with self.lock:
            self.latest_frame = frame.copy()

    def get_detections(self):
        with self.lock:
            return list(self.annotated_boxes)

    def _worker(self):
        while self.running:
            frame_to_process = None
            with self.lock:
                if self.latest_frame is not None:
                    frame_to_process = self.latest_frame.copy()
            
            if frame_to_process is not None:
                results = self.model.predict(
                    frame_to_process,
                    conf=self.conf,
                    imgsz=self.imgsz,
                    verbose=False,
                )
                boxes_data = []
                now = time.time()
                if results and len(results) > 0:
                    r = results[0]
                    for b in r.boxes:
                        cls_id = int(b.cls[0].item())
                        cls_name = self.model.names[cls_id]
                        score = float(b.conf[0].item())
                        xyxy = [int(v) for v in b.xyxy[0].tolist()]
                        boxes_data.append((cls_name, score, xyxy))

                        if not hasattr(self, '_last_sync'):
                            self._last_sync = {}
                        if now - self._last_sync.get(cls_name, 0) > 2.5:
                            self._last_sync[cls_name] = now
                            threading.Thread(target=sync_to_supabase, args=(cls_name, score, xyxy), daemon=True).start()

                with self.lock:
                    self.annotated_boxes = boxes_data

            time.sleep(0.01)

    def stop(self):
        self.running = False
        if self.thread.is_alive():
            self.thread.join(timeout=1.0)

def run_webcam(cam_index=0, conf=0.25):
    print(f"\n[+] Loading YOLO model: {MODEL_PATH.name} ...")
    detector = ThreadedDetector(MODEL_PATH, conf=conf, imgsz=320)

    print(f"[+] Initializing Camera {cam_index} using DirectShow backend (Windows)...")
    cap = cv2.VideoCapture(cam_index, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("[-] DSHOW backend not responding, trying default backend...")
        cap = cv2.VideoCapture(cam_index)

    if not cap.isOpened():
        print(f"[!] Error: Could not open camera at index {cam_index}.")
        print("[!] Please check that your camera is connected and not locked by another app.")
        detector.stop()
        return

    # Use 640x480 resolution for smooth real-time response
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    window_name = "I-SARTHI - Road Damage Live Detection (Press 'q' or ESC to Exit)"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 800, 600)

    print("\n" + "=" * 60)
    print("               LIVE WEBCAM DETECTION ACTIVE               ")
    print("  Controls:")
    print("    - Press 'q' or ESC in video window to exit")
    print("    - Press 's' to save current snapshot")
    print("=" * 60 + "\n")

    snapshot_dir = Path(__file__).parent / "test_runs" / "webcam_snapshots"
    snapshot_dir.mkdir(parents=True, exist_ok=True)

    prev_time = time.time()
    frame_count = 0

    CLASS_COLORS = {
        "pothole": (0, 0, 255),          # Red
        "crack": (0, 165, 255),          # Orange
        "debris": (0, 255, 255),         # Yellow
        "manhole": (255, 0, 255),        # Magenta
        "speed_breaker": (0, 255, 0),    # Green
        "road_barricade": (255, 100, 0), # Cyan
    }

    try:
        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                time.sleep(0.01)
                continue

            frame_count += 1
            detector.update_frame(frame)

            curr_time = time.time()
            fps = 1.0 / (curr_time - prev_time) if curr_time > prev_time else 30.0
            prev_time = curr_time

            # Get latest detections
            detections = detector.get_detections()

            # Draw detections
            for cls_name, score, (x1, y1, x2, y2) in detections:
                color = CLASS_COLORS.get(cls_name, (0, 255, 0))
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                label = f"{cls_name} {score:.0%}"
                (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(frame, (x1, max(0, y1 - 22)), (x1 + w + 8, y1), color, -1)
                cv2.putText(
                    frame,
                    label,
                    (x1 + 4, max(16, y1 - 5)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA,
                )

            # Draw HUD bar
            num_det = len(detections)
            hud_color = (0, 200, 0) if num_det == 0 else (0, 0, 230)
            cv2.rectangle(frame, (0, 0), (frame.shape[1], 40), (20, 20, 20), -1)
            hud_text = f"I-SARTHI | FPS: {fps:.1f} | Obstacles Detected: {num_det}"
            cv2.putText(frame, hud_text, (15, 27), cv2.FONT_HERSHEY_SIMPLEX, 0.7, hud_color, 2, cv2.LINE_AA)

            cv2.imshow(window_name, frame)

            key = cv2.waitKey(1) & 0xFF
            if key in [ord('q'), 27]:
                print("[+] Exiting camera stream...")
                break
            elif key == ord('s'):
                snap_file = snapshot_dir / f"live_{int(time.time())}.jpg"
                cv2.imwrite(str(snap_file), frame)
                print(f"[+] Saved snapshot to: {snap_file}")

    finally:
        detector.stop()
        cap.release()
        cv2.destroyAllWindows()
        print("[+] Camera released and window closed cleanly.")

def test_inference(source, conf=0.25, save=True, show=False):
    if not MODEL_PATH.exists():
        print(f"Error: Model not found at {MODEL_PATH}")
        return

    print(f"\n[+] Loading model: {MODEL_PATH.name} ...")
    model = YOLO(str(MODEL_PATH))

    print(f"[+] Classes configured ({len(model.names)}): {list(model.names.values())}")
    print(f"[+] Running inference on source: '{source}' (confidence threshold: {conf})...\n")

    results = model.predict(
        source=source,
        conf=conf,
        save=save,
        show=show,
        project=str(Path(__file__).parent / "test_runs"),
        name="predict",
        exist_ok=True,
    )

    print("\n" + "=" * 60)
    print("                    DETECTION RESULTS                     ")
    print("=" * 60)
    total_detections = 0
    for idx, r in enumerate(results):
        boxes = r.boxes
        num_boxes = len(boxes)
        total_detections += num_boxes
        filename = Path(r.path).name if hasattr(r, "path") and r.path else f"Frame {idx+1}"
        print(f"\n[Image {idx+1}] {filename}: {num_boxes} obstacle(s) detected")
        
        if num_boxes > 0:
            for b in boxes:
                cls_id = int(b.cls[0].item())
                cls_name = model.names[cls_id]
                score = float(b.conf[0].item())
                xyxy = [round(x, 1) for x in b.xyxy[0].tolist()]
                print(f"   -> {cls_name} (Confidence: {score:.2%}, Box [x1, y1, x2, y2]: {xyxy})")

    print("\n" + "-" * 60)
    print(f"Total processed: {len(results)} image(s) | Total detections: {total_detections}")
    if save and len(results) > 0 and hasattr(results[0], "save_dir"):
        print(f"Saved annotated images with bounding boxes at:\n  {results[0].save_dir}")
    print("=" * 60)

def main():
    parser = argparse.ArgumentParser(description="Test I-SARTHI Road Damage Detection Model")
    parser.add_argument(
        "--source",
        type=str,
        default="sample",
        help="Path to image, folder, video file, or 'webcam' (or 0) for live webcam feed. Default runs sample test.",
    )
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (default: 0.25)")
    parser.add_argument("--cam-id", type=int, default=0, help="Camera device index (default: 0)")
    parser.add_argument("--show", action="store_true", help="Display visual window with bounding boxes")
    parser.add_argument("--no-save", action="store_true", help="Do not save output images to disk")

    args = parser.parse_args()

    print_accuracy_summary()

    if args.source.lower() in ["webcam", "camera", "0"]:
        run_webcam(cam_index=args.cam_id, conf=args.conf)
        return

    source = args.source
    if source == "sample":
        archive_path = Path("C:/Users/abhis/Downloads/archive/annotated-images")
        if archive_path.exists():
            sample_imgs = list(archive_path.glob("*.jpg"))[:5]
            if sample_imgs:
                source = [str(p) for p in sample_imgs]
                print(f"[+] Found {len(sample_imgs)} sample dataset images from Downloads/archive for quick verification.")
            else:
                print("No sample images found in archive.")
                return
        else:
            print("Please specify --source <path_to_image_or_folder>")
            return

    test_inference(source=source, conf=args.conf, save=not args.no_save, show=args.show)

if __name__ == "__main__":
    main()
