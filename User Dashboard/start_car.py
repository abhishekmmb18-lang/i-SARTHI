import subprocess
import time
import sys
import signal

# --- Configuration ---
MODULES = [
    # 1. Sensors (I2C / GPIO / UART)
    {"name": "Vibration Monitor (Dual MPU6050)", "cmd": ["python3", "vibration_monitor.py"]},
    {"name": "Radar System (LiDAR + Servo)", "cmd": ["python3", "radar_system.py"]},
    {"name": "GPS Tracker (NEO-7M)", "cmd": ["python3", "gps_tracker.py"]},
    {"name": "Alcohol Monitor (MQ-3)", "cmd": ["python3", "alcohol_monitor.py"]},
    {"name": "GSM Service (A7670C)", "cmd": ["python3", "gsm_service.py"]},
    
    # 2. Vision Analytics
    {"name": "Pothole Detector (Road Vision)", "cmd": ["python3", "pothole_detector.py"]}
]

processes = []

def signal_handler(sig, frame):
    print("\n🛑 Stopping All Road Monitor Modules...")
    for p in processes: 
        p.terminate()
        try:
            p.wait(timeout=2)
        except subprocess.TimeoutExpired:
            p.kill()
    print("✅ System Shutdown Complete.")
    sys.exit(0)

def main():
    print("🚀 Starting I-SARTHI Road Monitor System...")
    print("---------------------------------------------")

    # Launch Each Module
    for module in MODULES:
        try:
            print(f"🔹 Launching {module['name']}...")
            # Use Popen to launch in background
            proc = subprocess.Popen(module['cmd'])
            processes.append(proc)
            time.sleep(1) # Stagger start to prevent startup spike
        except Exception as e:
            print(f"❌ Failed to launch {module['name']}: {e}")

    print("---------------------------------------------")
    print("✅ All Modules Running!")
    print("   - Press Ctrl+C to Stop All.")
    print("   - View Logs in separate terminal or implement logging.")
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Keep master process alive
    while True:
        time.sleep(1)
        # Check if any process died
        for i, p in enumerate(processes):
            if p.poll() is not None:
                name = MODULES[i]['name']
                print(f"⚠️ Warning: {name} has stopped (Exit Code: {p.returncode})")
                # Optional: Restart Logic
                # proc = subprocess.Popen(MODULES[i]['cmd'])
                # processes[i] = proc
                # print(f"♻️ Restarted {name}")

if __name__ == "__main__":
    main()
