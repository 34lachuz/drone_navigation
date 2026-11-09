import mongoose from 'mongoose';

const TelemetryLogSchema = new mongoose.Schema({
  flightId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  mode: { type: String, default: 'PRE-FLIGHT' },
  armed: { type: Boolean, default: false },
  
  // Positional telemetry
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  altitudeMsl: { type: Number, default: 0 }, // Above Sea Level
  altitudeAgl: { type: Number, default: 0 }, // Above Ground Level
  verticalSpeedMs: { type: Number, default: 0 }, // VSI
  groundSpeedKmh: { type: Number, default: 0 },
  headingDeg: { type: Number, default: 0 },
  
  // Rocket & Drone Attitude (Guidance)
  pitchDeg: { type: Number, default: 0 },
  rollDeg: { type: Number, default: 0 },
  yawDeg: { type: Number, default: 0 },
  thrustPercent: { type: Number, default: 0 },
  gForce: { type: Number, default: 1.0 },

  // Long-Endurance Power system
  batteryPercent: { type: Number, default: 100 },
  batteryVoltage: { type: Number, default: 50.4 }, // 12S Li-ion / Solid-State (4.2V * 12)
  currentDrawAmps: { type: Number, default: 0 },
  powerWatts: { type: Number, default: 0 },
  estimatedRemainingMinutes: { type: Number, default: 85 },
  
  // Link & Navigation status
  distanceToHomeMeters: { type: Number, default: 0 },
  satellites: { type: Number, default: 18 },
  signalStrengthPercent: { type: Number, default: 98 },
  windSpeedKmh: { type: Number, default: 8.5 },
  windDirectionDeg: { type: Number, default: 45 }
}, {
  timestamps: false
});

export const TelemetryLog = mongoose.model('TelemetryLog', TelemetryLogSchema);
