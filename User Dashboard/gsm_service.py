import time
import serial
import requests

# --- Configuration ---
GSM_PORT = "/dev/serial0"
BAUD_RATE = 115200
SERVER_URL = "http://localhost:5000/api/gsm-status"

def setup_gsm():
    try:
        ser = serial.Serial(GSM_PORT, BAUD_RATE, timeout=1)
        print(f"📡 GSM Service: Connecting to {GSM_PORT}...")
        
        # Simple Handshake
        ser.write(b'AT\r')
        time.sleep(0.5)
        resp = ser.read_all().decode('utf-8', errors='ignore')
        
        if "OK" in resp:
            print("✅ GSM Module Connected & Ready!")
            return ser
        else:
            print("⚠️ GSM Module not responding. Retrying...")
            return None
    except Exception as e:
        print(f"❌ GSM Setup Error: {e}")
        return None

def main():
    print("🚀 Starting GSM Background Service...")
    ser = setup_gsm()
    
    while True:
        if ser:
            try:
                # 1. Keep Alive / Check Network
                # ser.write(b'AT+CREG?\r')
                # time.sleep(0.1)
                # resp = ser.read_all().decode('utf-8', errors='ignore')
                
                # 2. Check for Incoming SMS (CNMI should offer live updates, but polling is safer for simple logic)
                # ser.write(b'AT+CMGL="REC UNREAD"\r')
                
                # Placeholder for future logic
                pass
            except:
                pass
        
        # Wait before next check
        time.sleep(5)

if __name__ == "__main__":
    main()
