import smbus
import math
import time
import requests

# --- Configuration ---
SERVER_URL = "http://localhost:5000/api/vibration"
PWR_MGMT_1 = 0x6B
SMPLRT_DIV = 0x19
CONFIG = 0x1A
GYRO_CONFIG = 0x1B
INT_ENABLE = 0x38
ACCEL_XOUT_H = 0x3B
ACCEL_YOUT_H = 0x3D
ACCEL_ZOUT_H = 0x3F
GYRO_XOUT_H = 0x43
GYRO_YOUT_H = 0x45
GYRO_ZOUT_H = 0x47

# I2C Addresses
# MPU1 (Left): 0x68 (AD0 -> GND or Open)
# MPU2 (Right): 0x69 (AD0 -> 3.3V)
Address_Left = 0x68
Address_Right = 0x69

# Initialize I2C (Bus 1)
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
        if(value > 32768): value = value - 65536
        return value
    except:
        return 0

print("✅ Dual MPU6050 Monitor Started")
left_connected = MPU_Init(Address_Left)
right_connected = MPU_Init(Address_Right)

if left_connected: print(f"   Left Sensor Connected (0x{Address_Left:X})")
else: print(f"   ❌ Left Sensor Not Found (0x{Address_Left:X})")

if right_connected: print(f"   Right Sensor Connected (0x{Address_Right:X})")
else: print(f"   ❌ Right Sensor Not Found (0x{Address_Right:X})")

# State tracking
last_x_L, last_y_L, last_z_L = 0, 0, 0
last_x_R, last_y_R, last_z_R = 0, 0, 0

while True:
    try:
        # --- Read Left Sensor ---
        acc_x_L = read_raw_data(Address_Left, ACCEL_XOUT_H)
        acc_y_L = read_raw_data(Address_Left, ACCEL_YOUT_H)
        acc_z_L = read_raw_data(Address_Left, ACCEL_ZOUT_H)
        
        delta_L = (abs(acc_x_L - last_x_L) + abs(acc_y_L - last_y_L) + abs(acc_z_L - last_z_L)) / 3.0
        last_x_L, last_y_L, last_z_L = acc_x_L, acc_y_L, acc_z_L
        
        # --- Read Right Sensor ---
        acc_x_R = read_raw_data(Address_Right, ACCEL_XOUT_H)
        acc_y_R = read_raw_data(Address_Right, ACCEL_YOUT_H)
        acc_z_R = read_raw_data(Address_Right, ACCEL_ZOUT_H)
        
        delta_R = (abs(acc_x_R - last_x_R) + abs(acc_y_R - last_y_R) + abs(acc_z_R - last_z_R)) / 3.0
        last_x_R, last_y_R, last_z_R = acc_x_R, acc_y_R, acc_z_R

        # --- Normalization ---
        # Map 0-15000 to 0.0-1.0
        left_norm = min(delta_L / 15000.0, 1.0)
        right_norm = min(delta_R / 15000.0, 1.0)
        
        # --- Reporting ---
        if delta_L > 2000 or delta_R > 2000:
            data = {
                'left': left_norm if left_connected else 0,
                'right': right_norm if right_connected else 0,
                'raw_left': delta_L,
                'raw_right': delta_R
            }
            try:
                requests.post(SERVER_URL, json=data, timeout=0.1)
                # print(f"💥 Vib -> L: {left_norm:.2f} | R: {right_norm:.2f}")
            except:
                pass
        
        time.sleep(0.1)
        
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(1)
