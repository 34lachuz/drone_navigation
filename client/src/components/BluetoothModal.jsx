import React, { useState, useEffect, useRef } from 'react';
import { Bluetooth, BluetoothConnected, BluetoothOff, X, Radio, Terminal, Send, CheckCircle2, AlertTriangle, Cpu, RefreshCw, Zap } from 'lucide-react';
import { bleDrone } from '../services/bleDroneService';

export default function BluetoothModal({ isOpen, onClose, onConnectedChange }) {
  const [supported, setSupported] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState({
    isConnected: bleDrone.isConnected,
    isVirtual: bleDrone.isVirtual,
    deviceName: bleDrone.deviceName,
    rssi: bleDrone.deviceRssi,
  });
  const [packets, setPackets] = useState([]);
  const [customCmd, setCustomCmd] = useState('');
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'wiring'
  const terminalEndRef = useRef(null);

  useEffect(() => {
    setSupported(bleDrone.isSupported());

    bleDrone.onStatusChangeCallback = (st) => {
      setStatus({ ...st });
      if (onConnectedChange) onConnectedChange(st);
    };

    bleDrone.onRawPacketCallback = (packet) => {
      setPackets((prev) => [...prev, packet.trim()].slice(-40));
    };

    return () => {
      bleDrone.onStatusChangeCallback = null;
      bleDrone.onRawPacketCallback = null;
    };
  }, [onConnectedChange]);

  useEffect(() => {
    if (activeTab === 'terminal' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [packets, activeTab]);

  if (!isOpen) return null;

  const handleScan = async () => {
    setConnecting(true);
    try {
      await bleDrone.scanAndConnect();
    } catch (err) {
      console.warn('Bluetooth connection cancelled or failed:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectVirtual = () => {
    bleDrone.connectVirtualDrone('ESP32-DRONE-BLE-v2');
  };

  const handleDisconnect = () => {
    bleDrone.disconnect();
  };

  const handleSendCommand = (cmd) => {
    if (!cmd) return;
    try {
      bleDrone.sendCommand(cmd);
      setCustomCmd('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1222] border border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl border ${status.isConnected ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
              <Bluetooth className={`w-5 h-5 ${status.isConnected ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h2 className="font-mono font-bold text-base sm:text-lg text-white flex items-center gap-2">
                DRONE BLUETOOTH TELEMETRY LINK
                {status.isConnected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/50">
                    {status.isVirtual ? 'VIRTUAL BLE' : 'HARDWARE LINKED'}
                  </span>
                )}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Direct BLE GATT Serial Connection (Nordic UART & ESP32 Bridge)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Connection Status Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            status.isConnected
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-slate-900/70 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3.5 h-3.5 rounded-full ${status.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></div>
                <div>
                  <div className="font-mono text-xs text-slate-400">STATUS:</div>
                  <div className="font-mono font-bold text-sm text-white">
                    {status.isConnected ? `CONNECTED: ${status.deviceName}` : 'NO BLUETOOTH DRONE CONNECTED'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {status.isConnected ? (
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/50 font-mono text-xs flex items-center gap-1.5 transition-all"
                  >
                    <BluetoothOff className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleScan}
                      disabled={connecting}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Bluetooth className="w-4 h-4" />
                      <span>{connecting ? 'Scanning...' : 'Scan Bluetooth Drone'}</span>
                    </button>
                    <button
                      onClick={handleConnectVirtual}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-mono text-xs flex items-center gap-1 transition-all"
                      title="Bench test using simulated ESP32 Bluetooth device"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Virtual Drone</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Signal & Spec Bar if connected */}
            {status.isConnected && (
              <div className="mt-3 pt-3 border-t border-emerald-900/50 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block">SIGNAL RSSI:</span>
                  <span className="text-emerald-400 font-bold">{status.rssi} dBm (Good)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PROTOCOL:</span>
                  <span className="text-cyan-300 font-bold">Nordic UART (NUS)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">REFRESH RATE:</span>
                  <span className="text-white font-bold">10 Hz (Sub-second)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">FAILSAFE:</span>
                  <span className="text-emerald-400 font-bold">Auto Disconnect Cutoff</span>
                </div>
              </div>
            )}
          </div>

          {/* Tab Selector */}
          <div className="flex space-x-2 border-b border-slate-800 pb-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'terminal'
                  ? 'bg-slate-900 text-cyan-400 border-t border-x border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Live BLE Packet Terminal</span>
            </button>
            <button
              onClick={() => setActiveTab('wiring')}
              className={`px-3 py-1.5 rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'wiring'
                  ? 'bg-slate-900 text-cyan-400 border-t border-x border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>ESP32 Hardware Guide & Pinout</span>
            </button>
          </div>

          {/* TAB 1: Live BLE Packet Terminal */}
          {activeTab === 'terminal' && (
            <div className="space-y-3">
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 h-52 overflow-y-auto font-mono text-[11px] text-emerald-400">
                {packets.length === 0 ? (
                  <div className="text-slate-600 text-center py-16">
                    [Awaiting Bluetooth telemetry packets from drone...]
                  </div>
                ) : (
                  packets.map((pkt, idx) => (
                    <div key={idx} className="leading-tight py-0.5 border-b border-slate-900/60 font-mono">
                      <span className="text-slate-500">RX &gt;</span> {pkt}
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* Direct Command Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type raw command (e.g. ARM, LAUNCH, RTH, SPEED:50)..."
                  value={customCmd}
                  onChange={(e) => setCustomCmd(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCommand(customCmd)}
                  disabled={!status.isConnected}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendCommand(customCmd)}
                  disabled={!status.isConnected || !customCmd}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              {/* Quick Preset Command Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['ARM', 'LAUNCH_ROCKET', 'HOLD', 'RTH', 'DISARM', 'STATUS'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => handleSendCommand(cmd)}
                    disabled={!status.isConnected}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] border border-slate-700 disabled:opacity-40 transition-all"
                  >
                    TX: {cmd}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ESP32 / Arduino Hardware Guide */}
          {activeTab === 'wiring' && (
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
              <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" /> Connecting an ESP32 / Arduino Bluetooth to your Drone:
              </h4>

              <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
                <p>
                  1. <strong>Hardware Bridge</strong>: Connect any ESP32 board (or HM-10 / nRF52 BLE module) to your Flight Controller UART (e.g. UART2 / TELEM port on Betaflight / Pixhawk / Arduino).
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-200 font-mono">
                  <div>• ESP32 TX (GPIO 17) &rarr; Flight Controller RX</div>
                  <div>• ESP32 RX (GPIO 16) &rarr; Flight Controller TX</div>
                  <div>• ESP32 GND &rarr; Common GND</div>
                  <div>• ESP32 VIN &rarr; 5V BEC Power</div>
                </div>
                <p>
                  2. <strong>Firmware</strong>: Flash the provided sketch located at:
                  <br />
                  <code className="text-cyan-400">server/drone-ble-firmware/esp32_drone_ble_bridge.ino</code>
                </p>
                <p>
                  3. <strong>Instant Pairing</strong>: Power on your drone, click <strong>"Scan Bluetooth Drone"</strong> above, select your drone, and all sensors (gyro attitude, altitude climb, battery, GPS) immediately stream right here!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
