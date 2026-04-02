const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Database Pool ───────────────────────────────────────────────
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const runQuery = (sql, res) => {
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(results);
  });
};

// ─── Root endpoint to show server is running ────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: '🌊 OceanRaksha API Server',
    version: '1.0.0',
    endpoints: {
      pollution: 'GET /api/pollution',
      fish: 'GET /api/fish',
      risk: 'GET /api/risk',
      seaConditions: 'GET /api/sea-conditions?lat={lat}&lng={lng}',
      waterQuality: 'GET /api/water-quality/{stationId}',
      advisory: 'POST /api/advisory'
    },
    frontend: 'http://localhost:5173',
    timestamp: new Date().toISOString()
  });
});

// ─── Existing DB Endpoints (unchanged) ──────────────────────────
app.get('/api/pollution', (req, res) => {
  runQuery("SELECT * FROM river_pollution", res);
});

app.get('/api/fish', (req, res) => {
  runQuery("SELECT * FROM fishery_impact", res);
});

app.get('/api/risk', (req, res) => {
  runQuery("SELECT * FROM risk_assessment", res);
});

// ─── NEW: Additional Data Endpoints ──────────────────────────────
app.get('/api/plastic-waste', (req, res) => {
  runQuery("SELECT * FROM plastic_waste ORDER BY year", res);
});

app.get('/api/ocean-conditions', (req, res) => {
  runQuery("SELECT * FROM ocean_conditions", res);
});

app.get('/api/shipping-activity', (req, res) => {
  runQuery("SELECT * FROM shipping_activity ORDER BY traffic_score DESC", res);
});

app.get('/api/fish-data', (req, res) => {
  runQuery("SELECT * FROM fish_data ORDER BY fish_tonnes DESC", res);
});

app.get('/api/risk-summary', (req, res) => {
  runQuery("SELECT * FROM risk_summary", res);
});

app.get('/api/final-risk', (req, res) => {
  runQuery("CALL calculate_final_risk()", res);
});

// ─── NEW: Real-time Sea Conditions (OpenWeatherMap proxy) ────────
app.get('/api/sea-conditions', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  // Check if API key is configured
  if (!process.env.OWM_KEY) {
    console.error('⚠️  OWM_KEY not found in server/.env');
    return res.json({
      temp: null,
      windSpeed: null,
      description: null,
      timestamp: new Date().toLocaleTimeString('en-IN'),
      source: 'API key not configured',
      isReal: false,
      error: 'OpenWeatherMap API key missing'
    });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OWM_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API returned ${response.status}`);
    }
    
    const data = await response.json();

    console.log('✅ OpenWeatherMap data fetched:', { temp: data.main?.temp, wind: data.wind?.speed });

    // Return only what the frontend needs
    res.json({
      temp: data.main?.temp ?? null,
      windSpeed: data.wind?.speed ?? null,
      humidity: data.main?.humidity ?? null,
      description: data.weather?.[0]?.description ?? null,
      timestamp: new Date().toLocaleTimeString('en-IN'),
      source: 'OpenWeatherMap Live',
      isReal: true
    });
  } catch (err) {
    console.error('❌ OpenWeatherMap error:', err.message);
    // Honest fallback — never fake real data, always label clearly
    res.json({
      temp: null,
      windSpeed: null,
      description: null,
      timestamp: new Date().toLocaleTimeString('en-IN'),
      source: 'Weather API unavailable',
      isReal: false,
      error: err.message
    });
  }
});

// ─── NEW: CPCB Water Quality Proxy ──────────────────────────────
app.get('/api/water-quality/:stationId', async (req, res) => {
  const { stationId } = req.params;

  try {
    const response = await fetch(
      `https://cpcb.nic.in/wqmonitor/getStationData.php?station_id=${stationId}`
    );
    const data = await response.json();

    res.json({
      do: data.dissolved_oxygen ?? null,
      turbidity: data.turbidity ?? null,
      ph: data.ph ?? null,
      bod: data.bod ?? null,
      timestamp: data.timestamp ?? new Date().toISOString(),
      source: 'CPCB Real-time WQM Network',
      isReal: true
    });
  } catch (err) {
    console.error('CPCB API error:', err.message);
    // Reference values for Karnataka coast — clearly labelled as fallback
    res.json({
      do: 5.2,
      turbidity: 3.1,
      ph: 7.4,
      bod: 2.1,
      timestamp: new Date().toISOString(),
      source: 'CPCB reference values',
      isReal: false,
      note: 'Live sensor temporarily unavailable — showing Karnataka coast reference values'
    });
  }
});

// ─── NEW: Claude AI Advisory Proxy ──────────────────────────────
// Keeps your Anthropic API key server-side (never exposed to browser)
app.post('/api/advisory', async (req, res) => {
  const { location, weatherData, waterData, lang } = req.body;

  if (!location) {
    return res.status(400).json({ error: 'location is required' });
  }

  // Check if API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('⚠️  ANTHROPIC_API_KEY not found in server/.env');
    return res.json({
      decision: 'CAUTION',
      advisory_text: lang === 'kn'
        ? 'AI ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳೀಯ ಮೀನುಗಾರಿಕೆ ಇಲಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'
        : 'AI service not configured. Contact local fisheries department.',
      decision_reason: 'Anthropic API key not configured',
      data_quality: 'unavailable',
      key_risk: 'API configuration missing'
    });
  }

  const langNames = { en: 'English', kn: 'Kannada', hi: 'Hindi', ta: 'Tamil' };
  const langName = langNames[lang] || 'English';

  const prompt = `You are OceanRaksha AI, a marine safety advisor for Indian fishermen.

LIVE DATA:
Location: ${location.name}, ${location.state || 'India'}
Coordinates: ${location.lat}°N, ${location.lng}°E
Date: ${new Date().toLocaleDateString('en-IN')}

SEA CONDITIONS (${weatherData?.source || 'unavailable'}):
- Sea surface temperature: ${weatherData?.temp ?? 'unavailable'}°C
- Wind speed: ${weatherData?.windSpeed ?? 'unavailable'} m/s
- Conditions: ${weatherData?.description ?? 'unavailable'}

WATER QUALITY (${waterData?.source || 'unavailable'}):
- Dissolved oxygen: ${waterData?.do ?? 'unavailable'} mg/L  (safe > 5.0)
- Turbidity: ${waterData?.turbidity ?? 'unavailable'} NTU    (safe < 5)
- pH: ${waterData?.ph ?? 'unavailable'}                      (safe 6.5–8.5)
- BOD: ${waterData?.bod ?? 'unavailable'} mg/L               (safe < 3)
${waterData?.isReal === false ? `NOTE: ${waterData.note}` : '(Live government sensor data)'}

Generate a fishing safety advisory in ${langName}.

Respond ONLY in this exact JSON format:
{
  "decision": "GO_FISHING" or "AVOID" or "CAUTION",
  "decision_reason": "1 sentence citing the specific measured values that drove this decision",
  "advisory_text": "2–3 sentences in ${langName} — include the actual numbers from the data",
  "safe_zones": "nearby safer area suggestion if AVOID or CAUTION, else null",
  "key_risk": "single most important risk factor today",
  "urgency": "immediate|today|monitor",
  "data_quality": "${waterData?.isReal ? 'real' : 'estimated'}"
}

Rules: always cite real numbers in advisory_text. If DO < 5.0, result must be CAUTION or AVOID.`;

  console.log('🤖 Calling Claude API for advisory generation...');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '{}';

    console.log('✅ Claude advisory generated successfully');

    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      res.json(parsed);
    } catch {
      res.json({
        decision: 'CAUTION',
        advisory_text: text,
        decision_reason: 'Advisory generated — please verify locally.',
        data_quality: 'estimated',
        key_risk: 'Unable to parse advisory'
      });
    }
  } catch (err) {
    console.error('❌ Claude API error:', err.message);
    res.status(500).json({
      decision: 'CAUTION',
      advisory_text: lang === 'kn'
        ? 'ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳೀಯ ಮೀನುಗಾರಿಕೆ ಇಲಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'
        : 'Advisory unavailable. Contact local fisheries department.',
      decision_reason: 'AI service temporarily unavailable.',
      data_quality: 'unavailable',
      key_risk: 'API error',
      error: err.message
    });
  }
});

// ─── Server Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 OceanRaksha API running on http://localhost:${PORT}`);
  console.log(`  DB endpoints:  /api/pollution  /api/fish  /api/risk`);
  console.log(`  New data:      /api/plastic-waste  /api/ocean-conditions  /api/shipping-activity`);
  console.log(`  Fish data:     /api/fish-data`);
  console.log(`  Risk analysis: /api/risk-summary  /api/final-risk`);
  console.log(`  Live data:     /api/sea-conditions  /api/water-quality/:id`);
  console.log(`  AI advisory:   POST /api/advisory`);
});
