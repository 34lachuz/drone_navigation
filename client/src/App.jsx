import React, { useEffect, useState } from 'react';
import { socket } from './services/socket';
import { bleDrone } from './services/bleDroneService';
import Navbar from './components/Navbar';
import PrecisionNavCard from './components/PrecisionNavCard';
import RocketHUD from './components/RocketHUD';
import DroneMap from './components/DroneMap';
import EnduranceTracker from './components/EnduranceTracker';
import FlightControls from './components/FlightControls';
import NewsModal from './components/NewsModal';
import FlightHistoryModal from './components/FlightHistoryModal';
import BluetoothModal from './components/BluetoothModal';
import ThemeModal from './components/ThemeModal';
import MobileBottomNav from './components/MobileBottomNav';
import { AlertTriangle, Bell, Radio, Bluetooth, MapPin, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [newsOpen, setNewsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bluetoothOpen, setBluetoothOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [bleStatus, setBleStatus] = useState({
    isConnected: false,
    isVirtual: false,
    deviceName: '',
    rssi: -60,
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'target', 'hud', 'map', 'endurance', 'controls'

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      console.log('[GCS] Connected to telemetry backend');
    }

    function onDisconnect() {
      setConnected(false);
      console.warn('[GCS] Disconnected from telemetry backend');
    }

    function onTelemetry(data) {
      // Only use simulator telemetry if real Bluetooth drone is NOT currently connected
      if (!bleDrone.isConnected) {
        setTelemetry(data);
      }
    }

    function onFlightAlert(alert) {
      setAlerts((prev) => [alert, ...prev].slice(0, 5));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('telemetry', onTelemetry);
    socket.on('flight_alert', onFlightAlert);

    if (socket.connected) {
      setConnected(true);
    }

    // Connect BLE Drone Telemetry callback
    bleDrone.onTelemetryCallback = (hardwareTelemetry) => {
      setTelemetry((prev) => ({
        ...prev,
        ...hardwareTelemetry,
        waypoints: prev?.waypoints || hardwareTelemetry.waypoints || [],
        homeLat: prev?.homeLat || 8.1833,
        homeLng: prev?.homeLng || 77.4119,
      }));

      // Forward to backend so MongoDB records the physical Bluetooth flight!
      if (socket.connected) {
        socket.emit('external_telemetry', hardwareTelemetry);
      }
    };

    bleDrone.onStatusChangeCallback = (st) => {
      setBleStatus(st);
      if (st.isConnected) {
        setAlerts((prev) => [
          {
            level: 'INFO',
            message: `⚡ Bluetooth Hardware Link established with "${st.deviceName}"! Telemetry source switched to LIVE HARDWARE.`,
          },
          ...prev,
        ]);
      }
    };

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('telemetry', onTelemetry);
      socket.off('flight_alert', onFlightAlert);
      bleDrone.onTelemetryCallback = null;
      bleDrone.onStatusChangeCallback = null;
    };
  }, []);

  const sendCommand = (action, payload = null, callback = null) => {
    // If real Bluetooth drone is connected, transmit over BLE
    if (bleDrone.isConnected) {
      let bleCmd = action.toUpperCase();
      if (action === 'launch_rocket_climb') bleCmd = 'LAUNCH_ROCKET';
      if (action === 'arm') bleCmd = 'ARM';
      if (action === 'hold') bleCmd = 'HOLD';
      if (action === 'rth') bleCmd = 'RTH';
      if (action === 'emergency') bleCmd = 'ESTOP';
      if (action === 'set_landing_target' && payload) {
        bleCmd = `LAND_AT,${payload.lat.toFixed(6)},${payload.lng.toFixed(6)}`;
      }

      bleDrone
        .sendCommand(bleCmd)
        .then(() => {
          if (callback) callback({ success: true, message: `Command "${bleCmd}" sent over Bluetooth to drone.` });
        })
        .catch((err) => {
          if (callback) callback({ success: false, message: `BLE error: ${err.message}` });
        });
    }

    // Always send to backend simulator & MongoDB session tracker
    socket.emit('drone_command', { action, payload }, (res) => {
      if (!bleDrone.isConnected && callback) callback(res);
    });
  };

  const emergencyStop = () => {
    sendCommand('emergency');
  };

  // Click-to-Fly & Land at target location (e.g. Nagercoil or custom map pin)
  const handleFlyToTarget = (lat, lng, name = 'Target Location') => {
    sendCommand('set_landing_target', { lat, lng, name, autoLand: true });
    setAlerts((prev) => [
      {
        level: 'SUCCESS',
        message: `🎯 Target Locked: ${name} [${lat.toFixed(6)}, ${lng.toFixed(6)}]. Drone will cruise and land at this exact spot.`,
      },
      ...prev,
    ]);
  };

  // Sync drone start coordinates with user's phone live GPS
  const handleSetPhoneLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          sendCommand('set_user_live_location', { lat, lng });
          setAlerts((prev) => [
            {
              level: 'INFO',
              message: `📍 Drone start & home base synchronized with your Phone GPS (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}).`,
            },
            ...prev,
          ]);
        },
        (err) => {
          setAlerts((prev) => [
            {
              level: 'WARNING',
              message: `Phone GPS notice: ${err.message}. Using default Nagercoil Aerospace coordinates.`,
            },
            ...prev,
          ]);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans pb-16 sm:pb-4 transition-colors">
      {/* Top GCS Navigation Bar */}
      <Navbar
        telemetry={telemetry}
        connected={connected}
        bleStatus={bleStatus}
        onOpenBluetooth={() => setBluetoothOpen(true)}
        onOpenTheme={() => setThemeOpen(true)}
        onOpenNews={() => setNewsOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onEmergencyStop={emergencyStop}
      />

      {/* Real-time Alerts Banner */}
      {alerts.length > 0 && (
        <div className="theme-card border-b theme-border px-4 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-white font-semibold">{alerts[0].message}</span>
          </div>
          <button
            onClick={() => setAlerts([])}
            className="theme-accent-text hover:underline text-[11px] ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main GCS Body */}
      <main className="flex-1 p-2 sm:p-4 max-w-[1700px] w-full mx-auto space-y-4">
        
        {/* Precision Coordinates & Target Landing Banner (Always visible at top) */}
        <PrecisionNavCard
          telemetry={telemetry}
          onFlyToTarget={handleFlyToTarget}
          onSetPhoneLocation={handleSetPhoneLocation}
        />

        {/* Mobile View: Render based on activeTab */}
        <div className="sm:hidden space-y-3">
          {activeTab === 'all' && (
            <>
              <RocketHUD telemetry={telemetry} />
              <DroneMap
                telemetry={telemetry}
                onSetLandingTarget={handleFlyToTarget}
                onSetUserLocation={handleSetPhoneLocation}
              />
              <FlightControls telemetry={telemetry} onSendCommand={sendCommand} />
              <EnduranceTracker telemetry={telemetry} />
            </>
          )}
          {activeTab === 'target' && (
            <PrecisionNavCard
              telemetry={telemetry}
              onFlyToTarget={handleFlyToTarget}
              onSetPhoneLocation={handleSetPhoneLocation}
            />
          )}
          {activeTab === 'hud' && <RocketHUD telemetry={telemetry} />}
          {activeTab === 'map' && (
            <DroneMap
              telemetry={telemetry}
              onSetLandingTarget={handleFlyToTarget}
              onSetUserLocation={handleSetPhoneLocation}
            />
          )}
          {activeTab === 'endurance' && <EnduranceTracker telemetry={telemetry} />}
          {activeTab === 'controls' && <FlightControls telemetry={telemetry} onSendCommand={sendCommand} />}
        </div>

        {/* Desktop / Tablet Multi-Pane Layout */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Rocket Guidance HUD & 1-Hour Endurance Panel */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex-1">
              <RocketHUD telemetry={telemetry} />
            </div>
            <div>
              <EnduranceTracker telemetry={telemetry} />
            </div>
          </div>

          {/* Right Column: Mission GPS Map & Autopilot Command Center */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex-1">
              <DroneMap
                telemetry={telemetry}
                onSetLandingTarget={handleFlyToTarget}
                onSetUserLocation={handleSetPhoneLocation}
              />
            </div>
            <div>
              <FlightControls telemetry={telemetry} onSendCommand={sendCommand} />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <BluetoothModal
        isOpen={bluetoothOpen}
        onClose={() => setBluetoothOpen(false)}
        onConnectedChange={(st) => setBleStatus(st)}
      />
      <ThemeModal isOpen={themeOpen} onClose={() => setThemeOpen(false)} />
      <NewsModal isOpen={newsOpen} onClose={() => setNewsOpen(false)} />
      <FlightHistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
