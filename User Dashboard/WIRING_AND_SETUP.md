# 🔌 Complete Breadboard Wiring Guide (Raspberry Pi 5)

This guide assumes you are using a **Breadboard** to distribute power and connect all sensors.

> **✅ CRITICAL CONFIGURATION STEP:**
> To use this system, you **MUST** enable **UART5** (for GPS) and **I2C** (for LCD/MPU/LiDAR).
>
> **⚠️ ORANGE WARNING:** These commands must be run on the **RASPBERRY PI TERMINAL**:
>
> 1.  Open Terminal: `sudo nano /boot/firmware/config.txt`
> 2.  ensure these lines exist (or add them):
>     `dtparam=i2c_arm=on`
>     `dtoverlay=uart3`
>     `dtoverlay=uart5`
> 3.  **Save** (Ctrl+O, Enter) and **Reboot** (`sudo reboot`).

---

## 🛠️ Step 1: Breadboard Power Rails
Connect the Raspberry Pi power pins to the breadboard **Power Rails** (the long lines on the side).

1.  **GND Rail (Blue/-)**: Connect **Physical Pin 6 (GND)** from Pi to the **Blue (-) Rail**.
2.  **5V Rail (Red/+)**: Connect **Physical Pin 2 (5V)** from Pi to the **Red (+) Rail**.
3.  **3.3V Rail**: (Optional) If you need a dedicated 3.3V rail.

> **⚡ SAFETY NOTE:**
> *   **Sensors needing 5V** (GSM, Alcohol, Servo, GPS) -> Connect VCC to **Red Rail (5V)**.
> *   **Sensors needing 3.3V** (Vibration, LiDAR) -> Connect VCC to **Pi Pin 1** or 3.3V Rail.
> *   **ALL GNDs** -> Connect to **Blue Rail (GND)**.

---

## 📡 Step 2: Sensor Connections (New Master Layout)

### 1. 3.5" LCD Display (SPI + Touch) 🖥️
*   **Plug directly onto GPIO header** (Pins 1-26).
*   **OR** wire manually (see table below).
*   *Note: If plugging directly, you must use the unpopulated pins or solder wires for other sensors.*

### 2. Dual Vibration Sensors (MPU6050) 📉
**Both sensors share the I2C Bus:**
*   **VCC** -> 3.3V, **GND** -> GND
*   **SDA** -> **GPIO 2** (Pin 3)
*   **SCL** -> **GPIO 3** (Pin 5)

**Addressed:**
*   **Sensor 1 (Left - 0x68)**: `AD0` -> **GND** (Or disconnected)
*   **Sensor 2 (Right - 0x69)**: `AD0` -> **3.3V**

### 3. VL53L0X LiDAR (Radar) 🦇
*   **VCC** -> 3.3V or 5V (Check module spec)
*   **GND** -> GND
*   **SDA** -> **GPIO 2** (Pin 3) (Shared I2C)
*   **SCL** -> **GPIO 3** (Pin 5) (Shared I2C)
*   **Address**: **0x29**

> **🤔 How does this work? (I2C Bus Explanation)**
> You have 4 devices connected to the SAME two pins (GPIO 2 & 3). This is normal!
> **I2C is like a party line:** Each device has a unique "Name" (Address).
> *   **0x68**: Left Vibration Sensor
> *   **0x69**: Right Vibration Sensor
> *   **0x29**: LiDAR Sensor
> *   **0x14 or 0x5D**: LCD Touch Controller
>
> The Pi calls out a name, and only that device answers. Just wire all their SDAs together and all their SCLs together.

### 4. GPS Module (NEO-7M) - **UART5** 🌍
*   **VCC** -> 5V, **GND** -> GND
*   **RX** -> **GPIO 12 (TX5)** (Pin 32)
*   **TX** -> **GPIO 13 (RX5)** (Pin 33)

### 5. Servo Motor (Radar Scanner) �
*   **Signal** -> **GPIO 6** (Pin 31)
*   **VCC** -> 5V, **GND** -> GND

### 6. GSM Module (A7670C) 📶
*   **RX** -> **GPIO 14** (Pin 8)
*   **TX** -> **GPIO 15** (Pin 10)
*   **VCC** -> 5V (If using external power, connect common ground)

### 7. Alcohol Sensor (MQ-3) 🍺
*   **DO** -> **GPIO 26** (Pin 37)
*   **VCC** -> 5V, **GND** -> GND

---

## 🗺️ Visual Pinout Summary (MASTER)

| Pi Physical Pin | Function | Connected To | Notes |
| :--- | :--- | :--- | :--- |
| **2** | 5V | **RED RAIL** | Power Source |
| **4** | 5V | **LCD VCC** | Display Power |
| **6** | GND | **BLUE RAIL** | Ground |
| **1** | 3.3V | **Vibration/LiDAR VCC** | Sensor Power |
| **3** | GPIO 2 (SDA) | **LCD + MPU + LiDAR** | Shared I2C Bus |
| **5** | GPIO 3 (SCL) | **LCD + MPU + LiDAR** | Shared I2C Bus |
| **7** | GPIO 4 | **LCD TP_INT** | Touch Interrupt |
| **11** | GPIO 17 | **LCD TP_RST** | Touch Reset |
| **12** | GPIO 18 | **LCD BL** | Backlight Control |
| **13** | GPIO 27 | **LCD RST** | Display Reset |
| **15** | GPIO 22 | **LCD DC** | Data/Command |
| **19** | GPIO 10 | **LCD MOSI** | SPI Data |
| **21** | GPIO 9 | **LCD MISO** | SPI Data |
| **23** | GPIO 11 | **LCD SCLK** | SPI Clock |
| **24** | GPIO 8 | **LCD CS** | Chip Select |
| **8** | GPIO 14 (TX) | **GSM RX** | UART0 |
| **10** | GPIO 15 (RX) | **GSM TX** | UART0 |
| **32** | GPIO 12 (TX5) | **GPS RX** | **NEW: UART5** |
| **33** | GPIO 13 (RX5) | **GPS TX** | **NEW: UART5** |
| **31** | GPIO 6 | **Servo Signal** | **NEW: Servo** |
| **37** | GPIO 26 | **Alcohol DO** | MQ-3 |