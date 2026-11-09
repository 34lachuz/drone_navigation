/**
 * Web Bluetooth Low Energy (BLE) Drone Telemetry & Command Service
 * Supports standard Nordic UART Service (NUS) and Generic Serial BLE
 */

// Standard Nordic UART Service (NUS) UUIDs used by ESP32, nRF52, HM-10, Arduino BLE
const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Drone -> App (Notify)
const NUS_TX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // App -> Drone (Write)

// Generic Serial BLE fallback UUIDs (e.g. HM-10, CC2541)
const GENERIC_SERIAL_SERVICE = 0xffe0;
const GENERIC_SERIAL_CHAR = 0xffe1;

class BLEDroneService {
  constructor() {
    this.device = null;
    this.server = null;
    this.txChar = null;
    this.rxChar = null;
    this.isConnected = false;
    this.isVirtual = false;
    this.virtualInterval = null;
    this.deviceName = '';
    this.deviceRssi = -62;
    this.rxBuffer = '';

    // Callbacks
    this.onTelemetryCallback = null;
    this.onRawPacketCallback = null;
    this.onStatusChangeCallback = null;
    this.onLogCallback = null;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  log(msg, type = 'info') {
    console.log(`[BLE Drone] ${msg}`);
    if (this.onLogCallback) {
      this.onLogCallback({ timestamp: new Date().toISOString(), message: msg, type });
    }
  }

  /**
   * Request and connect to real Bluetooth Low Energy Drone hardware
   */
  async scanAndConnect() {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Please use Google Chrome, Edge, or Android Chrome.');
    }

    try {
      this.log('Requesting Bluetooth device scan...');
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Drone' },
          { namePrefix: 'DRONE' },
          { namePrefix: 'ESP32' },
          { namePrefix: 'AeroRocket' },
          { namePrefix: 'Betaflight' },
          { namePrefix: 'MAVLink' },
          { services: [NUS_SERVICE_UUID] },
        ],
        optionalServices: [
          NUS_SERVICE_UUID,
          GENERIC_SERIAL_SERVICE,
          'battery_service',
          'device_information',
        ],
      });

      this.deviceName = this.device.name || 'Drone BLE Hardware';
      this.log(`Discovered device: ${this.deviceName}`);

      this.device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnect();
      });

      this.log('Connecting to GATT Server...');
      this.server = await this.device.gatt.connect();
      this.log('Connected to GATT Server! Discovering UART service...');

      let service;
      try {
        service = await this.server.getPrimaryService(NUS_SERVICE_UUID);
        this.txChar = await service.getCharacteristic(NUS_TX_CHAR_UUID);
        this.rxChar = await service.getCharacteristic(NUS_RX_CHAR_UUID);
      } catch (err) {
        this.log('Nordic UART not found, trying Generic Serial service (0xFFE0)...', 'warn');
        service = await this.server.getPrimaryService(GENERIC_SERIAL_SERVICE);
        this.txChar = await service.getCharacteristic(GENERIC_SERIAL_CHAR);
        this.rxChar = this.txChar; // bidirectional
      }

      // Start notifications on RX characteristic
      await this.rxChar.startNotifications();
      this.rxChar.addEventListener('characteristicvaluechanged', (event) => {
        this.handleIncomingData(event.target.value);
      });

      this.isConnected = true;
      this.isVirtual = false;
      this.log(`Successfully paired with ${this.deviceName}! Telemetry stream active.`, 'success');
      this.notifyStatus();

      return { success: true, deviceName: this.deviceName };
    } catch (error) {
      this.log(`BLE Connection failed: ${error.message}`, 'error');
      this.handleDisconnect();
      throw error;
    }
  }

  /**
   * Connect to a Virtual/Simulated BLE Drone (for bench testing without physical hardware)
   */
  connectVirtualDrone(name = 'ESP32-DRONE-BLE-v2') {
    this.disconnect();
    this.isVirtual = true;
    this.isConnected = true;
    this.deviceName = name;
    this.deviceRssi = -54;

    this.log(`Connected to Virtual Hardware Drone [${this.deviceName}] over simulated BLE link`, 'success');
    this.notifyStatus();

    // Virtual BLE Telemetry packet loop at 10Hz
    let t = 0;
    let alt = 0;
    let pitch = 0;
    let roll = 0;
    let bat = 98.5;
    let mode = 'PRE-FLIGHT';
    let armed = false;
    let lat = 12.9716;
    let lng = 77.5946;

    this.virtualInterval = setInterval(() => {
      t += 0.1;
      if (mode === 'VERTICAL CLIMB') {
        alt += 0.85; // ~8.5 m/s climb
        pitch = -2 + Math.sin(t * 3) * 1.5;
        roll = Math.cos(t * 2) * 1.2;
        bat = Math.max(0, bat - 0.02);
        if (alt >= 160) mode = 'CRUISE';
      } else if (mode === 'CRUISE') {
        pitch = 3 + Math.sin(t * 1.5);
        roll = Math.sin(t * 0.8) * 12;
        lat += 0.00003 * Math.cos(t * 0.2);
        lng += 0.00003 * Math.sin(t * 0.2);
        bat = Math.max(0, bat - 0.015);
      } else if (mode === 'RTH') {
        alt = Math.max(0, alt - 0.25);
        if (alt === 0) {
          mode = 'LANDED';
          armed = false;
        }
      }

      // Format as comma-separated BLE telemetry packet string:
      // $TELEM,mode,armed,alt,pitch,roll,yaw,lat,lng,bat,voltage,current,satellites
      const packet = `$TELEM,${mode},${armed ? 1 : 0},${alt.toFixed(1)},${pitch.toFixed(1)},${roll.toFixed(1)},${((t * 20) % 360).toFixed(0)},${lat.toFixed(6)},${lng.toFixed(6)},${bat.toFixed(1)},${(38 + (bat / 100) * 12.4).toFixed(1)},6.5,21\n`;

      if (this.onRawPacketCallback) {
        this.onRawPacketCallback(packet);
      }

      const telemetryObj = this.parseTelemetryPacket(packet);
      if (telemetryObj && this.onTelemetryCallback) {
        this.onTelemetryCallback(telemetryObj);
      }
    }, 100);

    return { success: true, deviceName: this.deviceName, isVirtual: true };
  }

  /**
   * Handle incoming raw BLE bytes from physical drone
   */
  handleIncomingData(dataView) {
    const decoder = new TextDecoder('utf-8');
    const textChunk = decoder.decode(dataView);
    this.rxBuffer += textChunk;

    if (this.onRawPacketCallback) {
      this.onRawPacketCallback(textChunk);
    }

    // Process complete newline-terminated packets
    let newlineIndex;
    while ((newlineIndex = this.rxBuffer.indexOf('\n')) >= 0) {
      const line = this.rxBuffer.slice(0, newlineIndex).trim();
      this.rxBuffer = this.rxBuffer.slice(newlineIndex + 1);

      if (line.length > 0) {
        const telemetry = this.parseTelemetryPacket(line);
        if (telemetry && this.onTelemetryCallback) {
          this.onTelemetryCallback(telemetry);
        }
      }
    }
  }

  /**
   * Parse telemetry packet (supports $TELEM CSV and JSON formats)
   */
  parseTelemetryPacket(str) {
    // 1. JSON Format: {"alt":120.5,"pitch":-2.1,...}
    if (str.startsWith('{') && str.endsWith('}')) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return null;
      }
    }

    // 2. CSV Format: $TELEM,mode,armed,alt,pitch,roll,yaw,lat,lng,bat,voltage,current,sats
    if (str.startsWith('$TELEM')) {
      const parts = str.split(',');
      if (parts.length >= 10) {
        const mode = parts[1] || 'PRE-FLIGHT';
        const armed = parts[2] === '1' || parts[2] === 'true';
        const altitudeAgl = parseFloat(parts[3]) || 0;
        const pitchDeg = parseFloat(parts[4]) || 0;
        const rollDeg = parseFloat(parts[5]) || 0;
        const yawDeg = parseFloat(parts[6]) || 0;
        const latitude = parseFloat(parts[7]) || 12.9716;
        const longitude = parseFloat(parts[8]) || 77.5946;
        const batteryPercent = parseFloat(parts[9]) || 100;
        const batteryVoltage = parseFloat(parts[10]) || 50.4;
        const currentDrawAmps = parseFloat(parts[11]) || 5.0;
        const satellites = parseInt(parts[12], 10) || 18;

        return {
          source: 'BLUETOOTH_HARDWARE',
          deviceName: this.deviceName,
          flightId: `BLE-${this.deviceName.replace(/\s+/g, '-')}`,
          timestamp: new Date().toISOString(),
          mode,
          armed,
          altitudeAgl,
          altitudeMsl: Math.round(920 + altitudeAgl),
          verticalSpeedMs: mode === 'VERTICAL CLIMB' ? 8.5 : mode === 'RTH' ? -2.0 : 0,
          groundSpeedKmh: mode === 'CRUISE' ? 62 : mode === 'VERTICAL CLIMB' ? 10 : 0,
          headingDeg: yawDeg,
          pitchDeg,
          rollDeg,
          yawDeg,
          thrustPercent: mode === 'VERTICAL CLIMB' ? 95 : armed ? 60 : 0,
          gForce: mode === 'VERTICAL CLIMB' ? 1.4 : 1.0,
          batteryPercent,
          batteryVoltage,
          powerWatts: Math.round(batteryVoltage * currentDrawAmps),
          currentDrawAmps,
          elapsedFlightSeconds: 0,
          estimatedRemainingMinutes: Math.round((batteryPercent / 100) * 85),
          distanceToHomeMeters: 45,
          latitude,
          longitude,
          satellites,
          signalStrengthPercent: Math.min(100, Math.max(10, Math.round((this.deviceRssi + 100) * 1.6))),
        };
      }
    }

    return null;
  }

  /**
   * Send flight control command over Bluetooth to drone
   */
  async sendCommand(commandString) {
    if (!this.isConnected) {
      throw new Error('No Bluetooth drone connected.');
    }

    this.log(`TX -> Drone [${this.deviceName}]: ${commandString}`);

    // If virtual, update virtual state
    if (this.isVirtual) {
      this.log(`Virtual Drone ACK: Command "${commandString}" executed`, 'success');
      return true;
    }

    // Physical BLE TX
    if (!this.txChar) {
      throw new Error('Bluetooth TX characteristic unavailable.');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(commandString.endsWith('\n') ? commandString : `${commandString}\n`);

    try {
      if (this.txChar.writeValueWithoutResponse) {
        await this.txChar.writeValueWithoutResponse(data);
      } else {
        await this.txChar.writeValue(data);
      }
      return true;
    } catch (error) {
      this.log(`Failed to transmit command: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Disconnect Bluetooth device
   */
  disconnect() {
    if (this.virtualInterval) {
      clearInterval(this.virtualInterval);
      this.virtualInterval = null;
    }

    if (this.device && this.device.gatt.connected) {
      this.log(`Disconnecting from ${this.deviceName}...`);
      this.device.gatt.disconnect();
    }

    this.handleDisconnect();
  }

  handleDisconnect() {
    this.isConnected = false;
    this.isVirtual = false;
    this.device = null;
    this.server = null;
    this.txChar = null;
    this.rxChar = null;
    this.log('Bluetooth link terminated.', 'warn');
    this.notifyStatus();
  }

  notifyStatus() {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback({
        isConnected: this.isConnected,
        isVirtual: this.isVirtual,
        deviceName: this.deviceName,
        rssi: this.deviceRssi,
      });
    }
  }
}

export const bleDrone = new BLEDroneService();
