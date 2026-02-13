import time
import requests
import serial
import pynmea2

# --- Config ---
SERVER_URL = "http://10.137.73.214:5000/api/location"
# UART Port on Raspberry Pi
# UART Port on Raspberry Pi
# GSM is using UART0 (GPIO 14/15)
# LCD is using UART3/GPIO 4/5 (TP_INT)
# SO WE MOVE GPS TO UART5 (GPIO 12/13)
# YOU MUST ENABLE UART5: Add 'dtoverlay=uart5' to /boot/firmware/config.txt
SERIAL_PORT = "/dev/ttyAMA5" 
BAUD_RATE = 9600

def read_gps():
    try:
        # Open Serial Port
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
            print(f"📡 GPS Tracker Started on {SERIAL_PORT}")
            
            while True:
                # Read line from GPS
                try:
                    line = ser.readline().decode('utf-8', errors='ignore')
                    
                    # Look for GPGGA or GPRMC sentences
                    # GPRMC is better for Speed + Coords
                    if "$GPRMC" in line:
                        msg = pynmea2.parse(line)
                        
                        if msg.status == 'A': # A = Data Valid
                            lat = msg.latitude
                            lon = msg.longitude
                            # Convert knots to km/h (1 knot = 1.852 km/h)
                            speed = float(msg.spd_over_grnd) * 1.852
                            
                            payload = {
                                'latitude': lat,
                                'longitude': lon,
                                'speed': speed
                            }
                            
                            # Send to Server
                            requests.post(SERVER_URL, json=payload, timeout=0.5)
                            print(f"📍 Lat: {lat:.6f}, Lon: {lon:.6f}, Speed: {speed:.1f} km/h")
                        else:
                            print("Waiting for Satellite Fix... (Go outside!)")
                            
                except pynmea2.ParseError:
                    continue
                except Exception as e:
                    # Ignore occasional read errors
                    pass
                    
    except Exception as e:
        print(f"❌ GPS Error: {e}")
        print("Check if Serial is enabled in raspi-config and wiring is correct.")
        time.sleep(2)

if __name__ == "__main__":
    # Install dependencies first:
    # pip3 install pyserial pynmea2 requests
    while True:
        read_gps()
        time.sleep(1)
