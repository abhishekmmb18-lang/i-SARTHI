import time
import requests
import sys

# Optional GPIO import for Raspberry Pi
try:
    import RPi.GPIO as GPIO
    IS_RPI = True
except ImportError:
    IS_RPI = False

# --- Config ---
# Change this to your laptop's Wi-Fi IP or localhost if running locally
DEFAULT_SERVER_URL = "http://10.168.213.214:5000/api/alcohol"
SENSOR_PIN = 26  # GPIO 26 (Pin 37)

# Allow passing custom server URL as CLI argument: python alcohol_monitor.py http://10.168.213.214:5000/api/alcohol
SERVER_URL = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SERVER_URL

if IS_RPI:
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(SENSOR_PIN, GPIO.IN)
    print(f"[MQ-3] Raspberry Pi GPIO Mode Active on Pin {SENSOR_PIN}")
else:
    print("[MQ-3] Running in Simulation/Desktop Mode (RPi.GPIO not detected)")

print(f"[MQ-3] Streaming live alcohol telemetry to: {SERVER_URL}")

def get_alcohol_reading():
    if IS_RPI:
        # Digital Pin Read:
        # LOW (0) = Alcohol Detected (Concentration above threshold)
        # HIGH (1) = Clean Air
        pin_val = GPIO.input(SENSOR_PIN)
        if pin_val == 0:
            return 85.0, "High"
        else:
            return 8.0, "Normal"
    else:
        # Desktop baseline
        return 5.0, "Normal"

try:
    while True:
        val, level = get_alcohol_reading()
        payload = {
            'value': val,
            'level': level
        }
        
        try:
            r = requests.post(SERVER_URL, json=payload, timeout=0.5)
            if r.status_code == 200:
                status_str = "[ALERT] Alcohol Detected!" if val > 50 else "[OK] Clean Cabin Air"
                print(f"[MQ-3 Telemetry] Status: {status_str} ({val}%) -> Synced to Server")
        except Exception as e:
            print(f"[MQ-3 Network] Retrying connection to {SERVER_URL}...")
            
        time.sleep(1)

except KeyboardInterrupt:
    print("\n[MQ-3] Shutting down monitor...")
    if IS_RPI:
        GPIO.cleanup()
