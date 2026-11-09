import mongoose from 'mongoose';

const WaypointSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  altitude: { type: Number, default: 120 },
  speed: { type: Number, default: 15 },
  reached: { type: Boolean, default: false }
}, { _id: false });

const FlightSessionSchema = new mongoose.Schema({
  flightId: { type: String, required: true, unique: true },
  callsign: { type: String, default: 'SKY-ROCKET-ALPHA' },
  droneModel: { type: String, default: 'AeroGlide Endurance VTOL X-1' },
  status: {
    type: String,
    enum: ['PRE-FLIGHT', 'VERTICAL CLIMB', 'TRANSITION', 'CRUISE', 'RTH', 'LANDED', 'ABORTED'],
    default: 'PRE-FLIGHT'
  },
  batteryCapacityMah: { type: Number, default: 32000 }, // High endurance 32Ah semi-solid battery
  nominalEnduranceMinutes: { type: Number, default: 85 }, // 1 hour 25 mins capability
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  durationSeconds: { type: Number, default: 0 },
  maxAltitudeMeters: { type: Number, default: 0 },
  maxVerticalSpeedMs: { type: Number, default: 0 },
  maxHorizontalSpeedKmh: { type: Number, default: 0 },
  totalDistanceTraveledKm: { type: Number, default: 0 },
  homeLocation: {
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 },
    altitude: { type: Number, default: 0 }
  },
  waypoints: [WaypointSchema],
  batteryLog: [{
    timestamp: Date,
    percentage: Number,
    voltage: Number,
    powerWatts: Number
  }],
  notes: { type: String, default: 'Autonomous rocket-climb and waypoint inspection mission' }
}, {
  timestamps: true
});

export const FlightSession = mongoose.model('FlightSession', FlightSessionSchema);
