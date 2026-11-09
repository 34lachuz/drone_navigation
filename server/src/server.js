import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { DroneSimulator } from './services/telemetrySimulator.js';
import newsRoutes from './routes/newsRoutes.js';
import flightRoutes from './routes/flightRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration for React frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: '*', // Allow all local dev origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// REST Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    droneStatus: simulator ? simulator.status : 'UNKNOWN'
  });
});

app.use('/api/news', newsRoutes);
app.use('/api/flights', flightRoutes);

// Initialize Simulator
const simulator = new DroneSimulator(io);

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Send current simulator telemetry snapshot immediately
  socket.emit('flight_state', {
    status: simulator.status,
    armed: simulator.armed,
    batteryPercent: simulator.batteryPercent,
    altitudeAgl: simulator.altitudeAgl,
    homeLat: simulator.homeLat,
    homeLng: simulator.homeLng,
    waypoints: simulator.waypoints,
    speedMultiplier: simulator.speedMultiplier
  });

  // Listen for real Bluetooth drone telemetry forwarded by client
  socket.on('external_telemetry', (telemetry) => {
    if (telemetry && simulator) {
      simulator.persistTelemetry(telemetry);
    }
  });

  // Client command dispatcher
  socket.on('drone_command', (data, callback) => {
    const { action, payload } = data || {};
    console.log(`[Socket.io] Received command: ${action}`, payload || '');

    let result = { success: false, message: 'Unknown command' };

    switch (action) {
      case 'arm':
        result = simulator.armDrone();
        break;
      case 'launch_rocket_climb':
        result = simulator.launchRocketClimb();
        break;
      case 'hold':
        result = simulator.holdHover();
        break;
      case 'resume_mission':
        result = simulator.resumeMission();
        break;
      case 'rth':
        result = simulator.returnToHome();
        break;
      case 'emergency':
        result = simulator.emergencyStop();
        break;
      case 'reset':
        result = simulator.resetMission();
        break;
      case 'set_speed_multiplier':
        if (payload && payload.multiplier) {
          simulator.setSpeedMultiplier(payload.multiplier);
          result = { success: true, message: `Speed multiplier set to ${payload.multiplier}x` };
        }
        break;
      case 'set_target_altitude':
        if (payload && payload.altitude) {
          simulator.targetAltitude = Number(payload.altitude);
          result = { success: true, message: `Target altitude set to ${payload.altitude}m` };
        }
        break;
      case 'set_landing_target':
        if (payload && payload.lat && payload.lng) {
          result = simulator.setLandingTarget(payload.lat, payload.lng, payload.name || 'Target Location', payload.autoLand ?? true);
        }
        break;
      case 'set_user_live_location':
        if (payload && payload.lat && payload.lng) {
          result = simulator.setUserLiveLocation(payload.lat, payload.lng);
        }
        break;
      default:
        result = { success: false, message: `Action "${action}" not recognized` };
    }

    // Broadcast system log to all clients
    io.emit('system_log', {
      timestamp: new Date().toISOString(),
      action,
      ...result
    });

    if (typeof callback === 'function') {
      callback(result);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  await simulator.init();
  simulator.start();

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Drone Navigation & Rocket Telemetry GCS Server`);
    console.log(`📡 Listening on http://localhost:${PORT}`);
    console.log(`⚡ WebSocket Stream active at ws://localhost:${PORT}`);
    console.log(`🔋 Nominal Mission Endurance: 85+ minutes`);
    console.log(`====================================================`);
  });
}

bootstrap();
