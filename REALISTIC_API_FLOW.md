# 🌊 OceanRaksha - Realistic API Flow Documentation

## Overview
The app now operates with **real API integrations** using your configured API keys. Here's how the data flows through the system.

---

## 🔑 API Keys Configuration

### Frontend (.env)
```
VITE_OWM_KEY=YOUR_OPENWEATHERMAP_API_KEY_HERE
```

### Backend (server/.env)
```
OWM_KEY=YOUR_OPENWEATHERMAP_API_KEY_HERE
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ANTHROPIC_KEY_HERE
```

---

## 📊 Real-Time Data Flow

### When User Clicks a Location Marker:

```
1. User clicks marker on map
   ↓
2. handleLocationSelect(location) triggered
   ↓
3. Shows loading indicator: "Analyzing real-time data..."
   ↓
4. Parallel API calls:
   ├─ getSeaConditions(lat, lng) → OpenWeatherMap API
   ├─ getCPCBWaterQuality(stationId) → CPCB Water Quality API
   └─ getLocationPhoto(name) → Wikipedia API
   ↓
5. Data received and displayed in LiveDataBadge:
   - Sea Temperature (°C)
   - Wind Speed (m/s)
   - Dissolved Oxygen (mg/L)
   - Turbidity (NTU)
   ↓
6. generateFishermanAdvisory() → Claude AI API
   - Analyzes real measurements
   - Generates safety decision (GO_FISHING/CAUTION/AVOID)
   - Creates advisory text in selected language
   ↓
7. WhyPanel displays:
   - Decision badge (color-coded)
   - Advisory text with real numbers
   - Analysis reasoning
   - Key risk factors
   - Data quality indicator
   ↓
8. getFutureRiskAnalysis() → Local calculation
   - Predicts 90-day risk trend
   - Triggers voice alert if risk > 80
```

---

## 🎯 API Endpoints

### 1. OpenWeatherMap (Sea Conditions)
**Endpoint:** `GET /api/sea-conditions?lat={lat}&lng={lng}`

**Real API Call:**
```javascript
https://api.openweathermap.org/data/2.5/weather?lat=19.04&lon=72.84&appid=YOUR_KEY&units=metric
```

**Returns:**
```json
{
  "temp": 28.5,
  "windSpeed": 4.2,
  "humidity": 75,
  "description": "clear sky",
  "timestamp": "3:45:30 PM",
  "source": "OpenWeatherMap Live",
  "isReal": true
}
```

**Fallback (if API fails):**
```json
{
  "temp": null,
  "windSpeed": null,
  "source": "Weather API unavailable",
  "isReal": false,
  "error": "API error message"
}
```

---

### 2. CPCB Water Quality
**Endpoint:** `GET /api/water-quality/{stationId}`

**Real API Call:**
```javascript
https://cpcb.nic.in/wqmonitor/getStationData.php?station_id=WQMS_KA_001
```

**Returns:**
```json
{
  "do": 5.2,
  "turbidity": 3.1,
  "ph": 7.4,
  "bod": 2.1,
  "timestamp": "2026-04-02T15:45:30.000Z",
  "source": "CPCB Real-time WQM Network",
  "isReal": true
}
```

**Fallback (if API fails):**
```json
{
  "do": 5.2,
  "turbidity": 3.1,
  "ph": 7.4,
  "bod": 2.1,
  "source": "CPCB reference values",
  "isReal": false,
  "note": "Live sensor temporarily unavailable"
}
```

---

### 3. Claude AI Advisory
**Endpoint:** `POST /api/advisory`

**Request Body:**
```json
{
  "location": { "name": "Mumbai Mahim Creek", "lat": 19.04, "lng": 72.84 },
  "weatherData": { "temp": 28.5, "windSpeed": 4.2, "isReal": true },
  "waterData": { "do": 5.2, "turbidity": 3.1, "isReal": true },
  "lang": "en"
}
```

**Real API Call:**
```javascript
POST https://api.anthropic.com/v1/messages
Headers: {
  "x-api-key": "YOUR_ANTHROPIC_KEY",
  "anthropic-version": "2023-06-01"
}
Body: {
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 700,
  "messages": [{ "role": "user", "content": "..." }]
}
```

**Returns:**
```json
{
  "decision": "GO_FISHING",
  "decision_reason": "Dissolved oxygen at 5.2 mg/L is above safe threshold, turbidity is low at 3.1 NTU",
  "advisory_text": "Safe to fish today. Water quality is good with DO at 5.2 mg/L and low turbidity. Sea temperature is 28.5°C with moderate winds at 4.2 m/s.",
  "safe_zones": null,
  "key_risk": "None - conditions favorable",
  "urgency": "monitor",
  "data_quality": "real"
}
```

**Fallback (if API fails):**
```json
{
  "decision": "CAUTION",
  "advisory_text": "Advisory unavailable. Contact local fisheries department.",
  "decision_reason": "AI service temporarily unavailable",
  "data_quality": "unavailable",
  "key_risk": "API error"
}
```

---

## 🎨 UI Components

### LiveDataBadge
- **Shows:** Real-time metrics with color-coded safety indicators
- **Status Indicator:** 
  - 🟢 Green pulsing dot = Live real data
  - 🟡 Orange dot = Reference/fallback data
- **Displays:**
  - Sea Temperature (blue)
  - Wind Speed (orange)
  - Dissolved Oxygen (green/red based on safety)
  - Turbidity (purple/red based on safety)
- **Background:** Location photo from Wikipedia (if available)

### WhyPanel
- **Shows:** AI-generated advisory with decision badge
- **Decision Types:**
  - ✅ GO_FISHING (green) - Safe conditions
  - ⚠️ CAUTION (orange) - Fish with care
  - 🚫 AVOID (red) - Dangerous conditions
- **Displays:**
  - Advisory text in selected language
  - Analysis reasoning with real numbers
  - Key risk factor
  - Data quality indicator
  - Safer zones (if applicable)

---

## 🔄 Error Handling

### API Key Missing
- Backend checks for `process.env.OWM_KEY` and `process.env.ANTHROPIC_API_KEY`
- Returns clear error messages: "API key not configured"
- UI shows: "Reference Data" badge instead of "Live Data"

### API Call Fails
- Network errors caught and logged
- Fallback to reference values (clearly labeled)
- User sees: "Weather API unavailable" or "AI service temporarily unavailable"

### Invalid Response
- JSON parsing errors handled gracefully
- Returns structured fallback data
- Never crashes the UI

---

## 🧪 Testing the Flow

### 1. Start Backend
```bash
cd server
node index.js
```
Expected output:
```
🚀 OceanRaksha API running on http://localhost:5001
  Live data:     /api/sea-conditions  /api/water-quality/:id
  AI advisory:   POST /api/advisory
```

### 2. Start Frontend
```bash
npm run dev
```
Open: http://localhost:5173

### 3. Test Real API Flow
1. Login to the app
2. Click any coastal marker on the map
3. Watch the console logs:
   ```
   ✅ OpenWeatherMap data fetched: { temp: 28.5, wind: 4.2 }
   🤖 Calling Claude API for advisory generation...
   ✅ Claude advisory generated successfully
   ```
4. See the UI update with:
   - 🟢 "Live Data" badge (pulsing green dot)
   - Real temperature, wind, DO, turbidity values
   - AI advisory with decision badge
   - Analysis with actual measured numbers

### 4. Test Fallback Flow
1. Stop the backend server
2. Click a marker
3. See:
   - 🟡 "Reference Data" badge
   - "Weather API unavailable" message
   - Fallback advisory: "Contact local fisheries department"

---

## 📱 Realistic User Experience

### Scenario 1: Good Conditions
```
Location: Kochi Backwaters
Sea Temp: 27.8°C ✅
Wind: 3.5 m/s ✅
DO: 6.1 mg/L ✅ (above 5.0 threshold)
Turbidity: 2.8 NTU ✅ (below 5.0 threshold)

Decision: ✅ GO_FISHING
Advisory: "Safe to fish today. Dissolved oxygen is excellent at 6.1 mg/L, 
water clarity is good with turbidity at 2.8 NTU. Sea temperature is 
comfortable at 27.8°C with gentle winds."
```

### Scenario 2: Risky Conditions
```
Location: Mumbai Mahim Creek
Sea Temp: 29.2°C ⚠️
Wind: 8.1 m/s ⚠️
DO: 4.3 mg/L ❌ (below 5.0 threshold)
Turbidity: 7.2 NTU ❌ (above 5.0 threshold)

Decision: 🚫 AVOID
Advisory: "Do not fish today. Dissolved oxygen is critically low at 4.3 mg/L 
(safe level is above 5.0). High turbidity at 7.2 NTU indicates poor water 
quality. Strong winds at 8.1 m/s add to the risk."

Safe Zones: "Try Versova Beach (5km north) or Juhu area where water quality 
is typically better"
```

---

## 🎤 Voice Alerts

When future risk prediction > 80:
- Automatically triggers voice alert
- Uses browser's Speech Synthesis API
- Speaks in selected language (English/Kannada/Hindi/Tamil)
- Example: "High invasion risk expected in next 90 days at Mumbai Mahim Creek"

---

## ✅ Validation Checklist

- [x] OpenWeatherMap API key configured
- [x] Anthropic Claude API key configured
- [x] Backend validates API keys before making calls
- [x] Frontend shows loading state during API calls
- [x] Real data clearly labeled with green pulsing indicator
- [x] Fallback data clearly labeled with orange indicator
- [x] Error messages are user-friendly
- [x] Console logs show API call status
- [x] Advisory includes actual measured numbers
- [x] Multi-language support working
- [x] Voice alerts trigger automatically
- [x] Location photos displayed as backgrounds

---

## 🚀 Next Steps

The app is now fully realistic and production-ready:
1. All API calls use real keys
2. Data is fetched from live sources
3. Fallbacks are clearly labeled
4. Error handling is robust
5. User experience is smooth and informative

**To test:** Click any marker and watch the real-time data flow through the system!
