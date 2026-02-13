import time
import requests
import board
import busio
import adafruit_vl53l0x
from gpiozero import AngularServo
from RPi import GPIO

# --- Configuration ---
SERVER_URL = "http://localhost:5000/api/radar"
SERVO_PIN = 6       # GPIO 6 (Pin 31)

# Setup I2C for VL53L0X
i2c = busio.I2C(board.SCL, board.SDA)
sensor = adafruit_vl53l0x.VL53L0X(i2c)

# Setup Servo
# Note: gpiozero uses BCM numbering by default
try:
    servo = AngularServo(SERVO_PIN, min_angle=0, max_angle=180, min_pulse_width=0.0005, max_pulse_width=0.0025)
    print("✅ Servo Connected on GPIO 6")
except Exception as e:
    print(f"❌ Servo Error: {e}")
    servo = None

print(f"✅ VL53L0X LiDAR Radar Started")

def get_distance():
    try:
        # VL53L0X returns distance in mm
        distance_mm = sensor.range
        return distance_mm / 10.0 # Convert to cm
    except Exception as e:
        print(f"LiDAR Read Error: {e}")
        return 0

def scan():
    print("Starting Radar Scan...")
    try:
        while True:
            # Sweep 0 to 180 (LiDAR is fast, can step 1 or 2 degrees)
            for angle in range(0, 181, 2): 
                process_step(angle)
            
            # Sweep 180 to 0
            for angle in range(180, -1, -2):
                process_step(angle)
    except KeyboardInterrupt:
        print("Stopping...")

def process_step(angle):
    # 1. Move Servo
    if servo:
        servo.angle = angle
    
    # Wait for servo to settle (LiDAR is fast so we can reduce wait)
    time.sleep(0.02) 
    
    # 2. Read Distance
    dist = get_distance()

    # 3. Send to Server
    try:
        data = {'angle': angle, 'distance': int(dist)}
        requests.post(SERVER_URL, json=data, timeout=0.05)
    except:
        pass

if __name__ == "__main__":
    scan()
