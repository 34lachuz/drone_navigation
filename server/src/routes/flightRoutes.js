import express from 'express';
import { FlightSession } from '../models/FlightSession.js';
import { TelemetryLog } from '../models/TelemetryLog.js';

const router = express.Router();

// GET /api/flights - list past flights
router.get('/', async (req, res) => {
  try {
    const flights = await FlightSession.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, count: flights.length, flights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/flights/:flightId - get flight details & breadcrumbs
router.get('/:flightId', async (req, res) => {
  try {
    const flight = await FlightSession.findOne({ flightId: req.params.flightId });
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    const telemetry = await TelemetryLog.find({ flightId: req.params.flightId }).sort({ timestamp: 1 }).limit(200);
    res.json({ success: true, flight, telemetry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/flights - create new mission
router.post('/', async (req, res) => {
  try {
    const session = await FlightSession.create(req.body);
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/flights/:flightId
router.delete('/:flightId', async (req, res) => {
  try {
    await FlightSession.deleteOne({ flightId: req.params.flightId });
    await TelemetryLog.deleteMany({ flightId: req.params.flightId });
    res.json({ success: true, message: 'Flight deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
