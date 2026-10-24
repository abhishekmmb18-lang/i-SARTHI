import time
import sys
import requests

# Try hardware imports gracefully
try:
    import board
    import busio
    import adafruit_vl53l0x
    HAS_HARDWARE_LIBS = True
except ImportError as e:
    HAS_HARDWARE_LIBS = False
    print(f"⚠️ [Warning] Hardware libraries missing: {e}")

try:
    from gpiozero import AngularServo
    HAS_SERVO = True
except ImportError:
    HAS_SERVO = False

# --- Configuration & Dynamic Server IP ---
DEFAULT_HOST = "10.193.29.214"
SERVER_HOST = DEFAULT_HOST

# Command Line Argument: python3 radar_system.py [SERVER_IP]
if len(sys.argv) > 1:
    arg = sys.argv[1].strip()
    if arg.startswith("http://"):
        SERVER_HOST = arg.replace("http://", "").split(":")[0]
    elif arg.startswith("https://"):
        SERVER_HOST = arg.replace("https://", "").split(":")[0]
    else:
        SERVER_HOST = arg.split(":")[0]

SERVER_URL = f"http://{SERVER_HOST}:5000/api/radar"
SERVO_PIN = 6  # GPIO 6 (Pin 31)

print("=" * 60)
print("🚀 I-SARTHI Autonomous LiDAR & Radar Station")
print(f"🌐 Target Server: {SERVER_URL}")
print(f"⚙️ Servo GPIO: {SERVO_PIN} | Sensor: VL53L0X Time-of-Flight")
print("=" * 60)

# Setup I2C for VL53L0X
sensor = None
if HAS_HARDWARE_LIBS:
    try:
        i2c = busio.I2C(board.SCL, board.SDA)
        sensor = adafruit_vl53l0x.VL53L0X(i2c)
        # Optional: Increase timing budget for higher accuracy if desired
        sensor.measurement_timing_budget = 33000
        print("✅ [I2C] VL53L0X LiDAR successfully connected on address 0x29!")
    except Exception as e:
        print(f"❌ [I2C] Failed to initialize VL53L0X: {e}")
        print("💡 [Wiring Check]:")
        print("   - VIN / VCC -> Pin 1 (3.3V)")
        print("   - GND       -> Pin 6 (GND)")
        print("   - SDA       -> Pin 3 (GPIO 2 - SDA1)")
        print("   - SCL       -> Pin 5 (GPIO 3 - SCL1)")
        print("   - Verify with command: 'i2cdetect -y 1'")

# Setup Servo
servo = None
if HAS_SERVO:
    try:
        servo = AngularServo(SERVO_PIN, min_angle=0, max_angle=180, min_pulse_width=0.0005, max_pulse_width=0.0025)
        print(f"✅ [Servo] SG90/MG995 Servo connected on GPIO {SERVO_PIN}")
    except Exception as e:
        print(f"⚠️ [Servo] Note: {e} (Sweeping will continue in virtual angle mode)")
else:
    print("⚠️ [Servo] gpiozero not available, running sensor in fixed/virtual sweep mode.")

session = requests.Session()

def get_distance():
    if not sensor:
        return 0
    try:
        dist_mm = sensor.range
        # VL53L0X returns ~8190 or 8191 when beam hits no object (clear) or out of range
        if dist_mm and 20 <= dist_mm <= 2200:
            return int(dist_mm / 10.0)  # Convert mm to cm
        else:
            return 0  # 0 indicates open unobstructed path
    except Exception as e:
        return 0

last_print_time = 0
consecutive_fails = 0

def process_step(angle):
    global last_print_time, consecutive_fails

    # 1. Move Servo
    if servo:
        try:
            servo.angle = angle
        except Exception:
            pass

    time.sleep(0.035)  # Servo settle time

    # 2. Read Distance
    dist_cm = get_distance()

    # 3. Post to Server
    now = time.time()
    try:
        payload = {'angle': angle, 'distance': dist_cm}
        res = session.post(SERVER_URL, json=payload, timeout=0.8)
        consecutive_fails = 0

        # Print heartbeat to console every ~1.5s
        if now - last_print_time >= 1.5:
            dist_label = f"{dist_cm} cm" if dist_cm > 0 else "Path Clear (>2m)"
            print(f"📡 [LiDAR] Angle: {angle:3d}° | Distance: {dist_label:<18} | Server: {res.status_code} OK")
            last_print_time = now

    except requests.exceptions.RequestException as req_err:
        consecutive_fails += 1
        if consecutive_fails == 1 or consecutive_fails % 30 == 0:
            print(f"❌ [Network Error] Cannot connect to {SERVER_URL}: {req_err}")
            print(f"   Make sure laptop IP is {SERVER_HOST} and Node.js server.js is running!")

def scan():
    print("\n🟢 Radar loop active. Sweeping 0° <-> 180°...")
    try:
        while True:
            # Sweep 0 to 180 degrees (step 4 degrees for rapid 3D point cloud generation)
            for angle in range(0, 181, 4):
                process_step(angle)
            # Sweep back 180 to 0 degrees
            for angle in range(180, -1, -4):
                process_step(angle)
    except KeyboardInterrupt:
        print("\n🛑 Stopping Radar Scan gracefully...")
        if servo:
            try:
                servo.detach()
            except Exception:
                pass

if __name__ == "__main__":
    scan()
