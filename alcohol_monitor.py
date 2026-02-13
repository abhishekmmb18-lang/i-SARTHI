import time
import requests
import RPi.GPIO as GPIO

# --- Config ---
SERVER_URL = "http://10.137.73.214:5000/api/alcohol"
SENSOR_PIN = 26  # GPIO 26 (Pin 37)

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN)

print(f"✅ Alcohol Monitor Started (Digital Mode on GPIO {SENSOR_PIN})")

def get_alcohol_status():
    # Read the Digital Pin
    # Most MQ-3 modules:
    # LOW (0) = Alcohol Detected (Threshold exceeded)
    # HIGH (1) = Clean Air
    
    # Check your specific sensor! If it's reversed, swap the 90.0 and 5.0 below.
    if GPIO.input(SENSOR_PIN) == 0:
        return 90.0  # High / Drunk
    else:
        return 5.0   # Safe / Clean

try:
    while True:
        val = get_alcohol_status()
        
        try:
            requests.post(SERVER_URL, json={'value': val}, timeout=0.1)
            state = "DETECTED 🍺" if val > 50 else "Safe 🟢"
            print(f"Status: {state} ({val}%)")
        except:
            pass
            
        time.sleep(1)

except KeyboardInterrupt:
    GPIO.cleanup()
