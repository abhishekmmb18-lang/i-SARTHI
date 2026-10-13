import smbus
import math
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

# --- Configuration ---
SERVER_URL = "http://10.197.196.214:5000/api/vibration"

session = requests.Session()
adapter = HTTPAdapter(pool_connections=10, pool_maxsize=10, max_retries=Retry(total=2, backoff_factor=0.1))
session.mount('http://', adapter)
session.mount('https://', adapter)

PWR_MGMT_1 = 0x6B
SMPLRT_DIV = 0x19
CONFIG = 0x1A
GYRO_CONFIG = 0x1B
INT_ENABLE = 0x38
ACCEL_XOUT_H = 0x3B
ACCEL_YOUT_H = 0x3D
ACCEL_ZOUT_H = 0x3F

# I2C Addresses
# MPU1 (Left): 0x68 (AD0 -> GND)
# MPU2 (Right): 0x69 (AD0 -> 3.3V)
Address_Left = 0x68
Address_Right = 0x69

bus = smbus.SMBus(1)

def MPU_Init(addr):
    try:
        bus.write_byte_data(addr, SMPLRT_DIV, 7)
        bus.write_byte_data(addr, PWR_MGMT_1, 1)
        bus.write_byte_data(addr, CONFIG, 0)
        bus.write_byte_data(addr, GYRO_CONFIG, 24)
        bus.write_byte_data(addr, INT_ENABLE, 1)
        return True
    except:
        return False

def read_raw_data(addr, reg):
    try:
        high = bus.read_byte_data(addr, reg)
        low = bus.read_byte_data(addr, reg+1)
        value = ((high << 8) | low)
        if value > 32768: value = value - 65536
        return value
    except:
        return 0

print("🚀 =================================================")
print("✅ Dual MPU6050 Vibration Monitor Starting")
print(f"📡 Destination: {SERVER_URL}")
print("🚀 =================================================")

left_connected = MPU_Init(Address_Left)
right_connected = MPU_Init(Address_Right)

if left_connected: print(f"   ✅ Left Sensor Connected (0x{Address_Left:X})")
else: print(f"   ❌ Left Sensor Not Found (0x{Address_Left:X})")

if right_connected: print(f"   ✅ Right Sensor Connected (0x{Address_Right:X})")
else: print(f"   ❌ Right Sensor Not Found (0x{Address_Right:X})")

last_x_L, last_y_L, last_z_L = 0, 0, 0
last_x_R, last_y_R, last_z_R = 0, 0, 0
last_print = time.time()

while True:
    try:
        # Left Sensor
        acc_x_L = read_raw_data(Address_Left, ACCEL_XOUT_H) if left_connected else 0
        acc_y_L = read_raw_data(Address_Left, ACCEL_YOUT_H) if left_connected else 0
        acc_z_L = read_raw_data(Address_Left, ACCEL_ZOUT_H) if left_connected else 0
        
        delta_L = (abs(acc_x_L - last_x_L) + abs(acc_y_L - last_y_L) + abs(acc_z_L - last_z_L)) / 3.0
        last_x_L, last_y_L, last_z_L = acc_x_L, acc_y_L, acc_z_L
        
        # Right Sensor
        acc_x_R = read_raw_data(Address_Right, ACCEL_XOUT_H) if right_connected else 0
        acc_y_R = read_raw_data(Address_Right, ACCEL_YOUT_H) if right_connected else 0
        acc_z_R = read_raw_data(Address_Right, ACCEL_ZOUT_H) if right_connected else 0
        
        delta_R = (abs(acc_x_R - last_x_R) + abs(acc_y_R - last_y_R) + abs(acc_z_R - last_z_R)) / 3.0
        last_x_R, last_y_R, last_z_R = acc_x_R, acc_y_R, acc_z_R

        # High-Sensitivity Normalization (1800.0 divisor for instant reactivity)
        left_norm = min(delta_L / 1800.0, 1.0)
        right_norm = min(delta_R / 1800.0, 1.0)
        
        data = {
            'left': left_norm,
            'right': right_norm,
            'raw_left': delta_L,
            'raw_right': delta_R
        }
        
        try:
            session.post(SERVER_URL, json=data, timeout=1.0)
        except Exception as e:
            pass

        if time.time() - last_print > 2.0:
            print(f"〰️ Vib Live: L={delta_L} (norm {left_norm:.2f}) | R={delta_R} (norm {right_norm:.2f})")
            last_print = time.time()
            
        time.sleep(0.1)

    except Exception as e:
        print(f"❌ Error in loop: {e}")
        time.sleep(0.5)
