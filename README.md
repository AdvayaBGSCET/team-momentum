# 🌊 OceanRaksha AI

**AI-Powered Marine Ecosystem Protection Platform for Indian Fishermen**

OceanRaksha AI is an intelligent decision-support system that combines real-time environmental data, AI-powered advisories, and predictive analytics to help Indian fishermen make safer, more informed decisions while protecting marine ecosystems.

---

## 🎯 Key Features

### 1. Real-Time Environmental Monitoring
- **Live Sea Conditions**: Temperature, wind speed, humidity from OpenWeatherMap
- **Water Quality Data**: Dissolved oxygen, turbidity, pH, BOD from CPCB sensors
- **Visual Indicators**: Color-coded safety metrics (green = safe, red = unsafe)

### 2. AI-Powered Fishing Advisories
- **Claude AI Integration**: Generates context-aware safety recommendations
- **Decision Types**: GO_FISHING (safe), CAUTION (risky), AVOID (dangerous)
- **Multilingual Support**: English, Hindi, Kannada, Tamil
- **Regional Voice Alerts**: Automatic alerts in local languages

### 3. Predictive Risk Analysis
- **90-Day Future Risk Prediction**: Forecasts environmental trends
- **Shipping Route Tracking**: Animated global shipping lanes with AIS-like simulation
- **Invasive Species Risk**: Tracks potential biological threats from vessel traffic

### 4. Interactive Pollution Simulator
- **Karnataka Coast Visualization**: 30-day pollution spread forecast
- **Multiple Scenarios**: Today's conditions, monsoon impact, cleanup effects
- **Zone-Specific Advisories**: Localized recommendations in Kannada

### 5. Comprehensive Database
- 10 coastal pollution hotspots across India
- Real-time data from 8 interconnected tables
- Historical tracking and trend analysis

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- OpenWeatherMap API key
- Anthropic Claude API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AdvayaBGSCET/team-momentum.git
cd team-momentum
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Set up MySQL database**
```bash
mysql -u root -p < server/schema.sql
```

5. **Configure environment variables**

Create `.env` in root directory:
```env
VITE_OWM_KEY=your_openweathermap_api_key
VITE_ANTHROPIC_KEY=your_anthropic_api_key
```

Create `server/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=oceanraksha
OWM_KEY=your_openweathermap_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

6. **Start the application**

Terminal 1 - Backend:
```bash
cd server
npm start
```

Terminal 2 - Frontend:
```bash
npm run dev
```

7. **Open in browser**
```
http://localhost:5173
```

---

## 📊 Technology Stack

### Frontend
- **React 18** - UI framework
- **Leaflet** - Interactive maps
- **Leaflet Ant Path** - Animated shipping routes
- **Vite** - Build tool

### Backend
- **Node.js + Express** - API server
- **MySQL** - Database
- **Axios** - HTTP client

### APIs & Services
- **OpenWeatherMap** - Real-time sea conditions
- **Claude AI (Anthropic)** - Advisory generation
- **CPCB** - Water quality data
- **Wikipedia** - Location photos

---

## 🗺️ Application Structure

```
oceanraksha-ai/
├── src/
│   ├── components/
│   │   ├── FutureRiskPanel.jsx      # 90-day risk prediction
│   │   ├── LiveDataBadge.jsx        # Real-time data indicator
│   │   ├── PollutionSimulator.jsx   # Karnataka coast simulator
│   │   ├── ShipRoutes.jsx           # Animated shipping lanes
│   │   └── WhyPanel.jsx             # AI advisory explanation
│   ├── services/
│   │   ├── claude.js                # Claude AI integration
│   │   ├── prediction.js            # Risk prediction logic
│   │   └── realData.js              # API data fetching
│   ├── pages/
│   │   └── SimPage.jsx              # Simulator page wrapper
│   ├── App.jsx                      # Main application
│   └── translations.js              # Multilingual support
├── server/
│   ├── index.js                     # Express API server
│   └── schema.sql                   # MySQL database schema
└── public/
    └── login-bg.png                 # Login background
```

---

## 🌐 API Endpoints

### Frontend → Backend
- `GET /api/sea-conditions?lat={lat}&lng={lng}` - Sea temperature, wind
- `GET /api/water-quality/{stationId}` - DO, turbidity, pH, BOD
- `POST /api/advisory` - AI-generated fishing advisory
- `GET /api/river-pollution` - Pollution hotspot data
- `GET /api/plastic-waste` - Plastic waste statistics
- `GET /api/shipping-activity` - Vessel traffic data
- `GET /api/risk-summary` - Aggregated risk analytics

---

## 🎨 Features in Detail

### Real-Time Data Flow
1. User clicks location marker on map
2. Parallel API calls fetch weather + water quality
3. Claude AI analyzes data and generates advisory
4. UI displays results with live data badges
5. Voice alert triggers if risk > 80%

### Risk-Based Alert System
- **Risk < 50%**: Green alert - "OK to fish here"
- **Risk ≥ 50%**: Red alert - "Don't fish here"
- Pulsing bell icon matches alert color
- Voice speaks in location's regional language

### Shipping Route Simulation
- 4 global routes: Singapore→Mumbai, Jebel Ali→Chennai, Rotterdam→Kochi, Busan→Vizag
- Ships move in real-time (updates every 2 seconds)
- Clickable popups show route details and invasive species risk

### Pollution Simulator
- Interactive Karnataka coast map
- 3 scenarios: Today, Monsoon, Cleanup
- Layer controls for different pollution types
- Zone-specific advisories in Kannada

---

## 🔒 Security

- API keys stored in `.env` files (not committed to git)
- Backend acts as proxy to keep keys server-side
- CORS enabled for local development
- Frontend never exposes sensitive credentials

---

## 📱 Supported Locations

1. **Mumbai Coast** - Mahim Bay (Hindi)
2. **Chennai Coast** - Marina Beach (Tamil)
3. **Kochi Backwaters** - Kerala (Malayalam)
4. **Mangalore Coast** - Karnataka (Kannada)
5. **Vizag Port** - Andhra Pradesh (Telugu)
6. **Goa Beaches** - Goa (Konkani)
7. **Kolkata Port** - West Bengal (Bengali)
8. **Surat Coast** - Gujarat (Gujarati)
9. **Puducherry Coast** - Tamil Nadu (Tamil)
10. **Karwar Coast** - Karnataka (Kannada)

---

## 🎤 Voice Alert System

- Automatically triggers when future risk > 80%
- Uses browser's Speech Synthesis API
- Speaks in location's regional language (not UI language)
- Example: "Mumbai Mahim Creek में उच्च जोखिम - मछली न पकड़ें"

---

## 🧪 Testing

### Test Backend Endpoints
```bash
# Sea conditions
curl "http://localhost:5001/api/sea-conditions?lat=19.04&lng=72.84"

# Water quality
curl "http://localhost:5001/api/water-quality/WQMS_KA_001"

# AI advisory
curl -X POST http://localhost:5001/api/advisory \
  -H "Content-Type: application/json" \
  -d '{"location":{"name":"Mumbai","lat":19.04,"lng":72.84},"weatherData":{"temp":28},"waterData":{"do":5.2},"lang":"en"}'
```

---

## 📈 Database Schema

### Core Tables
- `river_pollution` - Pollution hotspots with risk scores
- `plastic_waste` - Plastic pollution data
- `ocean_conditions` - Sea temperature, salinity, pH
- `shipping_activity` - Vessel traffic and routes
- `fish_data` - Fish population and health
- `fishery_impact` - Economic impact on fishermen
- `risk_assessment` - Comprehensive risk analysis

### Views & Procedures
- `risk_summary` - Aggregated analytics view
- `calculate_final_risk()` - Risk calculation stored procedure

---

## 🤝 Contributing

This project was built for a hackathon by Team Momentum. Contributions are welcome!

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

**Team Momentum** - BGSCET College

---

## 🙏 Acknowledgments

- OpenWeatherMap for sea condition data
- Anthropic for Claude AI API
- CPCB for water quality monitoring
- Indian fishermen communities for inspiration

---

## 📞 Support

For issues or questions:
1. Check that both servers are running
2. Verify API keys in `.env` files
3. Check browser console for errors
4. Review server logs for API errors

---

## 🎉 Demo

Visit the live demo: [Coming Soon]

---

**Built with ❤️ for Indian fishermen and marine ecosystem protection**
