import { FlightSession } from '../models/FlightSession.js';
import { TelemetryLog } from '../models/TelemetryLog.js';

// Haversine distance calculator in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Bearing calculator in degrees
function getBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export class DroneSimulator {
  constructor(io) {
    this.io = io;
    this.intervalId = null;
    this.saveCounter = 0;
    this.speedMultiplier = 1; // can be toggled by user (1x, 5x, 15x, 30x)

    // Base coordinates
    this.homeLat = 8.1833; // Default near Nagercoil / South Base
    this.homeLng = 77.4119;

    this.defaultWaypoints = [
      { id: 1, lat: 8.1880, lng: 77.4160, altitude: 150, speed: 60, reached: false },
      { id: 2, lat: 8.1950, lng: 77.4220, altitude: 180, speed: 65, reached: false },
      { id: 3, lat: 8.1990, lng: 77.4130, altitude: 200, speed: 60, reached: false },
      { id: 4, lat: 8.1920, lng: 77.4070, altitude: 160, speed: 55, reached: false },
      { id: 5, lat: 8.1833, lng: 77.4119, altitude: 50, speed: 40, reached: false }
    ];

    this.resetState();
  }

  resetState() {
    this.flightId = `FLIGHT-${Date.now()}`;
    this.status = 'PRE-FLIGHT';
    this.armed = false;
    this.lat = this.homeLat;
    this.lng = this.homeLng;
    this.altitudeAgl = 0;
    this.verticalSpeedMs = 0;
    this.groundSpeedKmh = 0;
    this.headingDeg = 0;
    this.pitchDeg = 0;
    this.rollDeg = 0;
    this.yawDeg = 0;
    this.thrustPercent = 0;
    this.gForce = 1.0;
    this.targetAltitude = 160;

    // Target custom landing destination
    this.targetDestination = null; // { name, lat, lng, autoLand }
    this.distanceToTargetMeters = 0;
    this.etaSeconds = 0;

    // Battery system: 85 minutes endurance capacity (approx 5100 seconds)
    this.nominalEnduranceSeconds = 85 * 60; // 5100s
    this.elapsedFlightSeconds = 0;
    this.batteryPercent = 100;
    this.batteryVoltage = 50.4; // 12S Li-ion / semi-solid fully charged
    this.powerWatts = 12; // idle power

    this.waypoints = JSON.parse(JSON.stringify(this.defaultWaypoints));
    this.currentWaypointIndex = 0;
    this.maxAltitudeMeters = 0;
    this.maxVerticalSpeedMs = 0;
    this.maxHorizontalSpeedKmh = 0;
    this.totalDistanceTraveledKm = 0;
    this.flightLogSession = null;
  }

  async init() {
    try {
      this.flightLogSession = await FlightSession.create({
        flightId: this.flightId,
        status: this.status,
        homeLocation: { lat: this.homeLat, lng: this.homeLng, altitude: 0 },
        waypoints: this.waypoints
      });
      console.log(`[Simulator] Initialized session: ${this.flightId}`);
    } catch (err) {
      console.warn('[Simulator] Notice: FlightSession in-memory fallback:', err.message);
    }
  }

  start() {
    if (this.intervalId) clearInterval(this.intervalId);
    // Tick at 5Hz (every 200ms)
    this.intervalId = setInterval(() => this.tick(0.2), 200);
    console.log('[Simulator] Real-time telemetry loop started @ 5Hz');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setSpeedMultiplier(mult) {
    this.speedMultiplier = Math.max(1, Math.min(mult, 60));
    console.log(`[Simulator] Simulation speed multiplier set to: ${this.speedMultiplier}x`);
  }

  setUserLiveLocation(lat, lng) {
    this.lat = Number(lat);
    this.lng = Number(lng);
    this.homeLat = Number(lat);
    this.homeLng = Number(lng);
    return {
      success: true,
      message: `Drone live coordinates synchronized to: Lat ${this.lat.toFixed(6)}, Lng ${this.lng.toFixed(6)}`
    };
  }

  setLandingTarget(lat, lng, name = 'Nagercoil Landing Zone', autoLand = true) {
    this.targetDestination = {
      name,
      lat: Number(lat),
      lng: Number(lng),
      autoLand: Boolean(autoLand)
    };

    if (!this.armed) {
      this.armed = true;
    }

    if (this.altitudeAgl < 25) {
      this.status = 'VERTICAL CLIMB';
    } else {
      this.status = 'NAVIGATING_TO_TARGET';
    }

    return {
      success: true,
      message: `Navigation course locked to ${name} (${this.targetDestination.lat.toFixed(6)}, ${this.targetDestination.lng.toFixed(6)}). Autonomous flight & landing initiated.`
    };
  }

  armDrone() {
    this.armed = true;
    this.powerWatts = 45;
    return { success: true, message: 'Drone armed. Systems nominal for rocket launch.' };
  }

  launchRocketClimb() {
    if (!this.armed) {
      this.armed = true;
    }
    this.status = 'VERTICAL CLIMB';
    return { success: true, message: 'ROCKET VERTICAL CLIMB ENGAGED. Climbing to ceiling.' };
  }

  holdHover() {
    if (this.altitudeAgl > 5) {
      this.status = 'CRUISE';
      this.verticalSpeedMs = 0;
      this.groundSpeedKmh = 0;
      this.pitchDeg = 0;
      this.rollDeg = 0;
      return { success: true, message: 'Drone hovering in altitude-hold mode.' };
    }
    return { success: false, message: 'Drone not airborne.' };
  }

  resumeMission() {
    if (this.targetDestination) {
      this.status = 'NAVIGATING_TO_TARGET';
    } else if (this.altitudeAgl < 20) {
      this.status = 'VERTICAL CLIMB';
    } else {
      this.status = 'CRUISE';
    }
    return { success: true, message: 'Autonomous flight active.' };
  }

  returnToHome() {
    this.status = 'RTH';
    return { success: true, message: 'Return-To-Home sequence initiated.' };
  }

  emergencyStop() {
    this.status = 'ABORTED';
    this.armed = false;
    this.verticalSpeedMs = -8.0;
    this.thrustPercent = 0;
    return { success: true, message: 'EMERGENCY SHUTDOWN ENGAGED.' };
  }

  resetMission() {
    this.resetState();
    this.init();
    return { success: true, message: 'Mission reset to pre-flight configuration.' };
  }

  tick(dtReal) {
    const dt = dtReal * this.speedMultiplier;

    // If airborne or armed, accumulate flight time
    if (this.armed && this.status !== 'PRE-FLIGHT' && this.status !== 'LANDED' && this.status !== 'LANDED_AT_TARGET') {
      this.elapsedFlightSeconds += dt;
      // Calculate battery consumption based on mode power draw
      let currentPower = 320; // Cruise watts
      if (this.status === 'VERTICAL CLIMB') {
        currentPower = 780; // High thrust rocket climb
      } else if (this.status === 'RTH' || this.status === 'PRECISION_LANDING') {
        currentPower = 290;
      } else if (this.status === 'ABORTED') {
        currentPower = 10;
      }
      this.powerWatts = currentPower + (Math.random() * 20 - 10);

      // Battery percentage decay (85 min nominal endurance = 5100s)
      const drainFactor = (currentPower / 350);
      const usedFraction = (dt * drainFactor) / this.nominalEnduranceSeconds;
      this.batteryPercent = Math.max(0, this.batteryPercent - (usedFraction * 100));
      // Voltage drops from 50.4V to ~38.0V
      this.batteryVoltage = 38.0 + (this.batteryPercent / 100) * 12.4;

      // Auto RTH if battery <= 20%
      if (this.batteryPercent <= 20 && (this.status === 'CRUISE' || this.status === 'NAVIGATING_TO_TARGET')) {
        this.status = 'RTH';
        this.io.emit('flight_alert', {
          level: 'WARNING',
          message: 'Battery critical (<= 20%). Automatic Return-To-Home engaged.'
        });
      }
    }

    // State machine physics
    if (this.status === 'VERTICAL CLIMB') {
      // Rocket ascent: target 8.5 m/s climb rate
      this.verticalSpeedMs = Math.min(10.5, this.verticalSpeedMs + 1.2 * dt);
      this.altitudeAgl += this.verticalSpeedMs * dt;
      this.thrustPercent = 92;
      this.gForce = 1.35;
      this.pitchDeg = -2 + Math.sin(Date.now() / 300) * 1.5;
      this.rollDeg = Math.cos(Date.now() / 400) * 1.2;
      this.groundSpeedKmh = 12;

      if (this.altitudeAgl >= this.targetAltitude) {
        this.altitudeAgl = this.targetAltitude;
        this.verticalSpeedMs = 0;
        if (this.targetDestination) {
          this.status = 'NAVIGATING_TO_TARGET';
        } else {
          this.status = 'TRANSITION';
        }
      }
    } else if (this.status === 'TRANSITION') {
      this.thrustPercent = 65;
      this.gForce = 1.05;
      this.pitchDeg = 5;
      this.groundSpeedKmh = Math.min(60, this.groundSpeedKmh + 15 * dt);
      if (this.groundSpeedKmh >= 55) {
        this.status = this.targetDestination ? 'NAVIGATING_TO_TARGET' : 'CRUISE';
      }
    } else if (this.status === 'NAVIGATING_TO_TARGET' && this.targetDestination) {
      // Autonomous navigation towards user-selected landing location (e.g. Nagercoil)
      this.thrustPercent = 68;
      this.gForce = 1.02;
      this.groundSpeedKmh = 72; // Fast cruise towards destination
      this.verticalSpeedMs = Math.sin(Date.now() / 1000) * 0.3;

      const targetLat = this.targetDestination.lat;
      const targetLng = this.targetDestination.lng;
      const distToTarget = getDistanceMeters(this.lat, this.lng, targetLat, targetLng);
      const targetBearing = getBearing(this.lat, this.lng, targetLat, targetLng);

      this.distanceToTargetMeters = Math.round(distToTarget);

      // Smooth heading turn towards target
      let diff = (targetBearing - this.headingDeg + 540) % 360 - 180;
      this.headingDeg = (this.headingDeg + Math.sign(diff) * Math.min(Math.abs(diff), 30 * dt) + 360) % 360;
      this.rollDeg = Math.max(-25, Math.min(25, -diff * 0.8));

      const speedMs = (this.groundSpeedKmh * 1000) / 3600;
      this.etaSeconds = speedMs > 0 ? Math.round(distToTarget / speedMs) : 0;

      const dMeters = speedMs * dt;
      const rad = this.headingDeg * (Math.PI / 180);
      const dLat = (dMeters * Math.cos(rad)) / 111139;
      const dLng = (dMeters * Math.sin(rad)) / (111139 * Math.cos(this.lat * Math.PI / 180));

      this.lat += dLat;
      this.lng += dLng;
      this.totalDistanceTraveledKm += (dMeters / 1000);

      // Check if arrived within landing cone (<= 35 meters)
      if (distToTarget <= 35) {
        this.status = 'PRECISION_LANDING';
        this.io.emit('flight_alert', {
          level: 'SUCCESS',
          message: `🎯 Overhead ${this.targetDestination.name}! Commencing precision vertical touchdown.`
        });
      }
    } else if (this.status === 'PRECISION_LANDING') {
      this.groundSpeedKmh = 0;
      this.verticalSpeedMs = -1.8;
      this.altitudeAgl = Math.max(0, this.altitudeAgl + this.verticalSpeedMs * dt);
      this.thrustPercent = 38;
      this.pitchDeg = 0;
      this.rollDeg = 0;

      if (this.altitudeAgl <= 0.2) {
        this.altitudeAgl = 0;
        this.verticalSpeedMs = 0;
        this.thrustPercent = 0;
        this.status = 'LANDED_AT_TARGET';
        this.armed = false;
        if (this.targetDestination) {
          this.lat = this.targetDestination.lat;
          this.lng = this.targetDestination.lng;
        }
        this.io.emit('flight_alert', {
          level: 'SUCCESS',
          message: `🏁 TOUCHDOWN VERIFIED! Drone has landed exactly at ${this.targetDestination ? this.targetDestination.name : 'Target'}. Motors locked.`
        });
      }
    } else if (this.status === 'CRUISE') {
      this.thrustPercent = 60;
      this.gForce = 1.0 + (Math.random() * 0.08 - 0.04);
      this.verticalSpeedMs = Math.sin(Date.now() / 1000) * 0.4;
      this.altitudeAgl = Math.max(20, this.altitudeAgl + this.verticalSpeedMs * dt);
      this.groundSpeedKmh = 62 + Math.sin(Date.now() / 800) * 3;

      // Navigate towards current waypoint
      if (this.waypoints.length > 0 && this.currentWaypointIndex < this.waypoints.length) {
        const wp = this.waypoints[this.currentWaypointIndex];
        const distToWp = getDistanceMeters(this.lat, this.lng, wp.lat, wp.lng);
        const targetBearing = getBearing(this.lat, this.lng, wp.lat, wp.lng);

        let diff = (targetBearing - this.headingDeg + 540) % 360 - 180;
        this.headingDeg = (this.headingDeg + Math.sign(diff) * Math.min(Math.abs(diff), 25 * dt) + 360) % 360;
        this.rollDeg = Math.max(-25, Math.min(25, -diff * 0.8));

        const speedMs = (this.groundSpeedKmh * 1000) / 3600;
        const dMeters = speedMs * dt;
        const rad = this.headingDeg * (Math.PI / 180);
        const dLat = (dMeters * Math.cos(rad)) / 111139;
        const dLng = (dMeters * Math.sin(rad)) / (111139 * Math.cos(this.lat * Math.PI / 180));

        this.lat += dLat;
        this.lng += dLng;
        this.totalDistanceTraveledKm += (dMeters / 1000);

        if (distToWp < 30) {
          wp.reached = true;
          this.currentWaypointIndex++;
          if (this.currentWaypointIndex >= this.waypoints.length) {
            this.status = 'RTH';
          }
        }
      }
    } else if (this.status === 'RTH') {
      const distHome = getDistanceMeters(this.lat, this.lng, this.homeLat, this.homeLng);
      const homeBearing = getBearing(this.lat, this.lng, this.homeLat, this.homeLng);
      let diff = (homeBearing - this.headingDeg + 540) % 360 - 180;
      this.headingDeg = (this.headingDeg + Math.sign(diff) * Math.min(Math.abs(diff), 30 * dt) + 360) % 360;
      this.rollDeg = Math.max(-20, Math.min(20, -diff * 0.7));

      if (distHome > 20) {
        this.groundSpeedKmh = 50;
        const speedMs = (this.groundSpeedKmh * 1000) / 3600;
        const dMeters = speedMs * dt;
        const rad = this.headingDeg * (Math.PI / 180);
        this.lat += (dMeters * Math.cos(rad)) / 111139;
        this.lng += (dMeters * Math.sin(rad)) / (111139 * Math.cos(this.lat * Math.PI / 180));
        this.totalDistanceTraveledKm += (dMeters / 1000);
      } else {
        this.groundSpeedKmh = 0;
        this.verticalSpeedMs = -2.0;
        this.altitudeAgl = Math.max(0, this.altitudeAgl + this.verticalSpeedMs * dt);
        this.thrustPercent = 40;
        this.pitchDeg = 0;
        this.rollDeg = 0;

        if (this.altitudeAgl <= 0.2) {
          this.altitudeAgl = 0;
          this.verticalSpeedMs = 0;
          this.thrustPercent = 0;
          this.status = 'LANDED';
          this.armed = false;
        }
      }
    } else if (this.status === 'ABORTED') {
      this.altitudeAgl = Math.max(0, this.altitudeAgl + this.verticalSpeedMs * dt);
      if (this.altitudeAgl === 0) {
        this.verticalSpeedMs = 0;
        this.status = 'LANDED';
      }
    }

    // Update track stats
    if (this.altitudeAgl > this.maxAltitudeMeters) this.maxAltitudeMeters = Math.round(this.altitudeAgl);
    if (Math.abs(this.verticalSpeedMs) > this.maxVerticalSpeedMs) this.maxVerticalSpeedMs = Math.round(Math.abs(this.verticalSpeedMs) * 10) / 10;
    if (this.groundSpeedKmh > this.maxHorizontalSpeedKmh) this.maxHorizontalSpeedKmh = Math.round(this.groundSpeedKmh);

    const distanceToHomeMeters = Math.round(getDistanceMeters(this.lat, this.lng, this.homeLat, this.homeLng));
    const estimatedRemainingMinutes = Math.max(0, Math.round((this.batteryPercent / 100) * 85));

    // Construct telemetry payload
    const telemetry = {
      flightId: this.flightId,
      timestamp: new Date().toISOString(),
      mode: this.status,
      armed: this.armed,
      latitude: parseFloat(this.lat.toFixed(6)),
      longitude: parseFloat(this.lng.toFixed(6)),
      altitudeMsl: Math.round(28 + this.altitudeAgl), // Near coast / sea level
      altitudeAgl: Math.round(this.altitudeAgl * 10) / 10,
      verticalSpeedMs: Math.round(this.verticalSpeedMs * 10) / 10,
      groundSpeedKmh: Math.round(this.groundSpeedKmh * 10) / 10,
      headingDeg: Math.round(this.headingDeg),
      pitchDeg: Math.round(this.pitchDeg * 10) / 10,
      rollDeg: Math.round(this.rollDeg * 10) / 10,
      yawDeg: Math.round(this.headingDeg),
      thrustPercent: Math.round(this.thrustPercent),
      gForce: Math.round(this.gForce * 100) / 100,
      batteryPercent: Math.round(this.batteryPercent * 10) / 10,
      batteryVoltage: Math.round(this.batteryVoltage * 10) / 10,
      currentDrawAmps: Math.round((this.powerWatts / this.batteryVoltage) * 10) / 10,
      powerWatts: Math.round(this.powerWatts),
      elapsedFlightSeconds: Math.round(this.elapsedFlightSeconds),
      estimatedRemainingMinutes,
      distanceToHomeMeters,
      targetDestination: this.targetDestination,
      distanceToTargetMeters: this.distanceToTargetMeters,
      etaSeconds: this.etaSeconds,
      satellites: 22,
      signalStrengthPercent: 97,
      windSpeedKmh: 8.8,
      windDirectionDeg: 55,
      speedMultiplier: this.speedMultiplier,
      waypoints: this.waypoints,
      currentWaypointIndex: this.currentWaypointIndex,
      maxAltitudeMeters: this.maxAltitudeMeters,
      totalDistanceTraveledKm: Math.round(this.totalDistanceTraveledKm * 100) / 100
    };

    // Emit live to all connected WebSocket clients
    this.io.emit('telemetry', telemetry);

    // Persist snapshot to MongoDB every 25 ticks (~5 seconds of real time)
    this.saveCounter++;
    if (this.saveCounter % 25 === 0 && this.status !== 'PRE-FLIGHT') {
      this.persistTelemetry(telemetry);
    }
  }

  async persistTelemetry(telemetry) {
    try {
      await TelemetryLog.create({
        flightId: telemetry.flightId,
        mode: telemetry.mode,
        armed: telemetry.armed,
        latitude: telemetry.latitude,
        longitude: telemetry.longitude,
        altitudeMsl: telemetry.altitudeMsl,
        altitudeAgl: telemetry.altitudeAgl,
        verticalSpeedMs: telemetry.verticalSpeedMs,
        groundSpeedKmh: telemetry.groundSpeedKmh,
        headingDeg: telemetry.headingDeg,
        pitchDeg: telemetry.pitchDeg,
        rollDeg: telemetry.rollDeg,
        batteryPercent: telemetry.batteryPercent,
        batteryVoltage: telemetry.batteryVoltage,
        powerWatts: telemetry.powerWatts,
        estimatedRemainingMinutes: telemetry.estimatedRemainingMinutes,
        distanceToHomeMeters: telemetry.distanceToHomeMeters
      });

      await FlightSession.findOneAndUpdate(
        { flightId: telemetry.flightId },
        {
          status: telemetry.mode,
          durationSeconds: telemetry.elapsedFlightSeconds,
          maxAltitudeMeters: telemetry.maxAltitudeMeters,
          maxHorizontalSpeedKmh: telemetry.groundSpeedKmh,
          totalDistanceTraveledKm: telemetry.totalDistanceTraveledKm,
          waypoints: telemetry.waypoints
        },
        { upsert: true }
      );
    } catch (err) {
      // In-memory operation is non-blocking if Mongo is busy
    }
  }
}
