import serial
import time
import sys

# --- Configuration ---
# A77670C / SIM800 via GPIO Pins (UART)
# Uses GPIO 14 (TX) and GPIO 15 (RX) on Raspberry Pi
# Ensure Serial is enabled in raspi-config
GSM_PORT = "/dev/serial0" 
BAUD_RATE = 115200

# Emergency Contact Number (Replace with actual number)
EMERGENCY_PHONE = "+919876543210" # TODO: Load from config or env if needed 

def send_sms(phone_no, message):
    try:
        print(f"📡 Connecting to GSM Module on {GSM_PORT}...")
        ser = serial.Serial(GSM_PORT, BAUD_RATE, timeout=2)
        
        # 1. Check AT Command
        ser.write(b'AT\r')
        time.sleep(0.5)
        response = ser.read_all().decode('utf-8', errors='ignore')
        if "OK" not in response:
            print("❌ GSM Module not responding to AT command.")
            return False

        # 2. Set Text Mode
        ser.write(b'AT+CMGF=1\r')
        time.sleep(0.5)
        
        # 3. Send SMS Command
        cmd = f'AT+CMGS="{phone_no}"\r'
        ser.write(cmd.encode())
        time.sleep(0.5)
        
        # 4. Send Message Body
        ser.write(message.encode() + b'\x1A') # \x1A is ASCII code for Ctrl+Z
        time.sleep(3)
        
        response = ser.read_all().decode('utf-8', errors='ignore')
        print(f"📩 SMS Response: {response}")
        
        if "OK" in response or "+CMGS" in response:
            print(f"✅ SMS sent to {phone_no}")
            return True
        else:
            print("❌ Failed to send SMS")
            return False
            
        ser.close()
        
    except Exception as e:
        print(f"❌ GSM Error: {e}")
        return False

if __name__ == "__main__":
    # Can be run as: python3 gsm_utils.py "Hello World" "+919999999999"
    msg = "Test Alert from Road Monitor"
    phone = EMERGENCY_PHONE
    
    if len(sys.argv) > 1:
        msg = sys.argv[1]
    if len(sys.argv) > 2:
        phone = sys.argv[2]
        
    send_sms(phone, msg)
