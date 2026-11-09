# AeroRocket GCS - Long-Endurance Drone Rocket Guidance & Navigation App

A modern full-stack Ground Control Station (GCS) and mobile-responsive navigation dashboard for long-endurance drone flight (60–90+ minutes), featuring rocket-style launch guidance, real-time GPS tracking, MongoDB persistence, and live drone tech news.

## Features

- 🚀 **Rocket-Style Launch & Climb Guidance HUD**:
  - Vertical ascent altimeter tape with target ceiling indicator and vertical speed indicator (VSI m/s).
  - 3D/2D Artificial Horizon (Attitude Indicator with Pitch & Roll ladder, roll angle arc, and aircraft reticle).
  - Mission Flight Phase Stepper: `PRE-FLIGHT` ➔ `VERTICAL CLIMB` ➔ `TRANSITION` ➔ `CRUISE` ➔ `RTH` ➔ `TOUCHDOWN`.
  - Thrust and G-Force meters.
- 🔋 **1-Hour+ Endurance Tracker**:
  - Engineered for 85+ minute nominal mission endurance (modeling high-density 32Ah semi-solid cells).
  - Mission Elapsed Flight Time clock, Estimated Remaining Minutes, Pack Voltage (50.4V), Power draw in Watts, and safe Return-to-Home boundary threshold.
- 🗺️ **Real-Time GPS Map Navigation**:
  - Interactive Leaflet map with dark aerospace styling.
  - Custom rotated UAV heading marker, launch pad home base, waypoint corridor, and real-time flight trail.
  - Free Cam and Auto-Lock Drone tracking modes.
- 📱 **Mobile-Responsive GCS Dashboard**:
  - Bottom mobile navigation bar (`DASHBOARD`, `ROCKET HUD`, `GPS MAP`, `1H+ POWER`, `COMMAND`).
  - Optimized for mobile phones, tablets, and desktop workstations.
- 📰 **Google Drone Intelligence & Airspace News**:
  - Live aviation and drone technology reports gathered from Google (semi-solid battery breakthroughs, BVLOS regulations, rocket climb VTOL dynamics).
  - Real-time airspace advisory (Kp geomagnetic index, visibility, surface winds).
- 🗄️ **MongoDB Flight Session Logging**:
  - Real-time telemetry snapshots and flight logs automatically persisted to MongoDB database.

## Architecture

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Leaflet / React-Leaflet + Socket.io-client
- **Backend**: Node.js + Express + Socket.io (5Hz sub-second telemetry broadcast)
- **Database**: MongoDB (Mongoose)

## Quick Start

### 1. Backend Server
```bash
cd server
npm install
npm start
```
*Backend runs on `http://localhost:5000` with WebSockets on port 5000.*

### 2. Frontend React Dashboard
```bash
cd client
npm install
npm run dev -- --host
```
*Frontend opens at `http://localhost:5173`. You can also open the Network URL (e.g. `http://<your-ip>:5173`) on your mobile device connected to the same Wi-Fi.*

## Flight Controls & Fast Simulation

- Click **ARM MOTORS** to unlock systems.
- Click **ROCKET LAUNCH** to initiate high-thrust vertical rocket climb up to ceiling.
- Use **SIM: 1x, 2x, 5x, 15x, 30x** buttons to accelerate time and simulate the full 1-hour 15-minute flight in minutes.
- Click **RETURN HOME (RTH)** to autonomously vector back to base and land.
- Click **E-STOP** for immediate emergency motor cutoff.
