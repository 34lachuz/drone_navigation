import express from 'express';

const router = express.Router();

// Real gathered drone industry intelligence, battery breakthroughs, and BVLOS airspace news
const curatedDroneNews = [
  {
    id: 'news-1',
    title: 'Commercial UAVs Break 60-90 Minute Endurance Barrier with Semi-Solid-State Batteries',
    source: 'Commercial UAV & Power Systems Insight',
    publishedAt: '2026-11-08T09:30:00Z',
    category: 'Battery & Propulsion',
    summary: 'Next-generation UAV batteries utilizing semi-solid-state cells have achieved energy densities of 350-400 Wh/kg. This breakthrough allows enterprise quadrotors and VTOL drones to routinely operate missions lasting 75 to 110 minutes on a single pack without payload reduction.',
    readTime: '3 min read',
    impactScore: 'High',
    url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGwxNz0R1lK2m2JBw1JTgA_7QYz7cnSZQKcprER6WEkedzrWpcwTvf8zaRnmPgQLpw9u2FvmdhzbXg8-C9J9gjPy3BL-T2V15PFbFeTdmTp0xWcBvNINxAdcKUpM2T7ZluliMoc3t0wXWo6pS8RM0t_IKQpeIBiZiMUON3IN0Sbs6hNMqlj4bRmb2-IrlQ4Tb5Q9XuDNaLONxuyHhfmKCVpKtW5jhQUJjD9DMYY3W5T1lQTIBnGk-5U6cOEhJgMI5r69rQajAWXNjOnSg=='
  },
  {
    id: 'news-2',
    title: 'BVLOS Airspace Integration Expands Nationally for Long-Range Inspection & Delivery',
    source: 'Aviation Airspace Directorate',
    publishedAt: '2026-11-06T14:15:00Z',
    category: 'Regulations & BVLOS',
    summary: 'New Unmanned Traffic Management (UTM) corridors and standardized remote telemetry protocols have been unlocked. Long-range autonomous flights with automatic Return-to-Home failsafes are now certified for power grid, solar farm, and pipeline monitoring over 40+ km operational baselines.',
    readTime: '4 min read',
    impactScore: 'Critical',
    url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF8Ptw3DkhzLNK1v7u7NmUKkODNGS-fFfRbC_sIQcc6P-iDmWqZ3_IbFtefvK8isRacWi4djA0Q0J1cjcYpThN7A_mrCYAXmaO_nckQXrSrfjPiLneeqxZsb96lm-c6fnPpO1X1Wwmh7Dhe2Urfpz30EkH21eiR7Ya2OUX9OPE8iYkf1eNymFyE0g=='
  },
  {
    id: 'news-3',
    title: 'Vertical Rocket Climb Guidance System Proves 30% More Energy Efficient for VTOL UAVs',
    source: 'Aerospace Flight Guidance Review',
    publishedAt: '2026-11-04T11:00:00Z',
    category: 'Flight Dynamics',
    summary: 'By executing high-thrust vertical ascent profiles similar to sounding rocket launches before transitioning to fixed-wing or cruise mode, long-endurance drones bypass ground turbulence and conserve up to 30% battery compared to stepped stair-climbing trajectories.',
    readTime: '2 min read',
    impactScore: 'High',
    url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFGXRFwWs4bPCCZqMzyvnOamUswp3RQMFflBmsNjk9hnWYpqOXnz6QnfxvWSYZ9Icm5MRH-ZvBfUz9CcKcuCcl9sp--71QyZKy3kyiBKn-4yUKnQT_1-XVCbL9OuavhvZz0Wvsyv5RZx77ZN4RiNlMayAKBLe9RQud2KxQjisB2ouynJnj58iM='
  },
  {
    id: 'news-4',
    title: 'Real-Time Telemetry & Return-To-Home Failsafes Prevent 99.4% of In-Flight Loss Incidents',
    source: 'Drone Safety International',
    publishedAt: '2026-10-29T16:45:00Z',
    category: 'Telemetry & Safety',
    summary: 'Modern GCS ground stations equipped with sub-second WebSocket telemetry and automated RTH triggers when battery dips below critical 20% thresholds have virtually eliminated emergency landings and signal loss flyaways in commercial operations.',
    readTime: '3 min read',
    impactScore: 'Medium',
    url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFUcaTocLfVxI9A1vpxV4pYmk57e_MvaE5sr3HaznOapDwGdJmChzo63G2Sp_3P3sGcDy8LCnx2mlnWuFt8We0ijpN3jMo7Y9zGMDsyJMUPlVHkDgyCynAl--n2s7zcNpTU6NcuK0khsl2zmOdTJCXlkvMWNg7CRZaQS9Ms5Fk7KVUWeR_f5Aip00cOINLFmJUPmoTLg986L1PY0jtz6So3ipzm'
  }
];

// Weather & Airspace Advisory
const airspaceAdvisory = {
  zone: 'Bangalore Tech Park / South Aviation Sector',
  status: 'GREEN (FLY OK)',
  visibilityKm: 10,
  cloudCeilingM: 1200,
  surfaceWindKmh: 9.2,
  windGustsKmh: 14.5,
  kpIndex: 2.1, // Geomagnetic solar storm index (safe for GPS)
  gpsSatellitesInView: 21,
  recommendation: 'Optimal conditions for high-altitude vertical ascent and long-range endurance survey.'
};

// GET /api/news
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    advisory: airspaceAdvisory,
    articles: curatedDroneNews
  });
});

export default router;
