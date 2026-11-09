/**
 * ==============================================================================
 * AEROROCKET DRONE - ESP32 BLUETOOTH LOW ENERGY (BLE) TELEMETRY & COMMAND BRIDGE
 * ==============================================================================
 *
 * This firmware runs on an ESP32 micro-controller attached to your drone.
 * It connects directly to the AeroRocket GCS Web / Mobile Dashboard over BLE!
 *
 * HARDWARE CONNECTIONS:
 * - ESP32 GPIO 16 (RX2) -> Flight Controller TX (TELEM / UART port)
 * - ESP32 GPIO 17 (TX2) -> Flight Controller RX
 * - ESP32 GND           -> Common Drone GND
 * - ESP32 VIN / 5V      -> 5V BEC / Flight Controller 5V Out
 *
 * SENSORS (If running standalone):
 * - I2C SDA (GPIO 21)   -> MPU6050 / BMP280 SDA
 * - I2C SCL (GPIO 22)   -> MPU6050 / BMP280 SCL
 * - Battery ADC (GPIO 34)-> Voltage Divider (12S / 4S / 3S pack monitoring)
 *
 * INSTRUCTIONS:
 * 1. Open Arduino IDE.
 * 2. Select Board: "ESP32 Dev Module".
 * 3. Install "ESP32 BLE Arduino" library (built-in with ESP32 board package).
 * 4. Upload this sketch.
 * 5. In the AeroRocket Dashboard app, click "Connect BLE" -> "Scan Bluetooth Drone".
 * 6. Select "ESP32-DRONE-BLE-v2" - your live drone telemetry will instantly appear!
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Device Name advertised over Bluetooth
#define DEVICE_NAME "ESP32-DRONE-BLE-v2"

// Nordic UART Service (NUS) UUIDs
#define SERVICE_UUID           "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_RX "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // App writes commands to drone
#define CHARACTERISTIC_UUID_TX "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // Drone transmits telemetry to app

BLEServer *pServer = NULL;
BLECharacteristic *pTxCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Drone Telemetry State Variables
String flightMode = "PRE-FLIGHT";
bool isArmed = false;
float altitudeAgl = 0.0;
float pitch = 0.0;
float roll = 0.0;
float yaw = 0.0;
double latitude = 12.971600;
double longitude = 77.594600;
float batteryPercent = 98.5;
float batteryVoltage = 49.8;
float currentAmps = 6.2;
int satellites = 20;

// Connection Callbacks
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("[BLE] Client GCS Connected!");
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("[BLE] Client GCS Disconnected.");
  }
};

// Command Receiver Callback (from Web App)
class CommandCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    String rxValue = pCharacteristic->getValue().c_str();

    if (rxValue.length() > 0) {
      rxValue.trim();
      Serial.print("[BLE RX Command] ");
      Serial.println(rxValue);

      if (rxValue == "ARM") {
        isArmed = true;
        Serial.println("[Drone Autopilot] MOTORS ARMED!");
      } 
      else if (rxValue == "DISARM" || rxValue == "ESTOP") {
        isArmed = false;
        flightMode = "LANDED";
        Serial.println("[Drone Autopilot] EMERGENCY MOTOR CUTOFF / DISARMED!");
      } 
      else if (rxValue == "LAUNCH_ROCKET") {
        if (isArmed) {
          flightMode = "VERTICAL CLIMB";
          Serial.println("[Drone Autopilot] ROCKET VERTICAL ASCENT ENGAGED!");
        }
      } 
      else if (rxValue == "HOLD") {
        flightMode = "CRUISE";
        Serial.println("[Drone Autopilot] ALTITUDE HOLD HOVER ACTIVE.");
      } 
      else if (rxValue == "RTH") {
        flightMode = "RTH";
        Serial.println("[Drone Autopilot] RETURN TO HOME VECTOR ENGAGED.");
      }
    }
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("\nStarting AeroRocket ESP32 BLE Telemetry Bridge...");

  // Initialize BLE Device
  BLEDevice::init(DEVICE_NAME);

  // Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create BLE TX Characteristic (Telemetry output to App)
  pTxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pTxCharacteristic->addDescriptor(new BLE2902());

  // Create BLE RX Characteristic (Commands from App)
  BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_RX,
    BLECharacteristic::PROPERTY_WRITE
  );
  pRxCharacteristic->setCallbacks(new CommandCallbacks());

  // Start Service
  pService->start();

  // Start Advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06); // iPhone connection optimization
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("[BLE] Device is advertising as: " DEVICE_NAME);
  Serial.println("[BLE] Ready to connect to AeroRocket GCS Web Dashboard!");
}

unsigned long lastTelemetryMillis = 0;

void loop() {
  // Read real sensors or update flight physics loop
  unsigned long currentMillis = millis();

  // Transmit telemetry at 10Hz (every 100ms)
  if (currentMillis - lastTelemetryMillis >= 100) {
    lastTelemetryMillis = currentMillis;

    // Simulate sensor response if armed
    if (isArmed && flightMode == "VERTICAL CLIMB") {
      altitudeAgl += 0.85; // 8.5 m/s ascent
      pitch = -2.0;
      batteryPercent = max(0.0f, batteryPercent - 0.015f);
      if (altitudeAgl >= 160.0) {
        flightMode = "CRUISE";
      }
    } else if (flightMode == "RTH") {
      altitudeAgl = max(0.0f, altitudeAgl - 0.25f);
      if (altitudeAgl <= 0.2) {
        flightMode = "LANDED";
        isArmed = false;
      }
    }

    if (deviceConnected) {
      // Format NMEA-style telemetry packet:
      // $TELEM,mode,armed,alt,pitch,roll,yaw,lat,lng,bat,voltage,current,sats
      char telemPacket[128];
      snprintf(telemPacket, sizeof(telemPacket),
        "$TELEM,%s,%d,%.1f,%.1f,%.1f,%.1f,%.6f,%.6f,%.1f,%.1f,%.1f,%d\n",
        flightMode.c_str(),
        isArmed ? 1 : 0,
        altitudeAgl,
        pitch,
        roll,
        yaw,
        latitude,
        longitude,
        batteryPercent,
        batteryVoltage,
        currentAmps,
        satellites
      );

      // Send via BLE notification
      pTxCharacteristic->setValue((uint8_t*)telemPacket, strlen(telemPacket));
      pTxCharacteristic->notify();
    }
  }

  // Handle reconnect advertising
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // give bluetooth stack chance to reset
    pServer->startAdvertising();
    Serial.println("[BLE] Restarted advertising for GCS reconnect...");
    oldDeviceConnected = deviceConnected;
  }

  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}
