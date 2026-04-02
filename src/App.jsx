import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Map as MapIcon, 
  AlertTriangle, 
  Droplets, 
  Ship, 
  Bell, 
  BarChart3,
  User,
  ChevronRight,
  Globe,
  Wind,
  Phone,
  Key,
  LogOut
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { translations } from './translations';
import { getSeaConditions, getCPCBWaterQuality, getLocationPhoto } from './services/realData';
import { generateFishermanAdvisory } from './services/claude';
import { getFutureRiskAnalysis } from './services/prediction';
import LiveDataBadge from './components/LiveDataBadge';
import WhyPanel from './components/WhyPanel';
import ShipRoutes from './components/ShipRoutes';
import FutureRiskPanel from './components/FutureRiskPanel';
import SimPage from './pages/SimPage';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock Data for India's Coastline with regional languages
const MOCK_HOTSPOTS = [
  { id: 1, name: 'Mumbai Coast - Mahim Bay', lat: 19.04, lng: 72.84, risk: 92, status: 'severe', plastic_pct: 52, industrial_pct: 28, sewage_pct: 15, other_pct: 5, state: 'Maharashtra', regionalLang: 'Hindi', langCode: 'hi-IN' },
  { id: 2, name: 'Bay of Bengal - Ganga Delta', lat: 21.65, lng: 88.05, risk: 84, status: 'high', plastic_pct: 40, industrial_pct: 35, sewage_pct: 20, other_pct: 5, state: 'West Bengal', regionalLang: 'Hindi', langCode: 'hi-IN' },
  { id: 3, name: 'Chennai Coast - Cooum Estuary', lat: 13.06, lng: 80.27, risk: 78, status: 'high', plastic_pct: 45, industrial_pct: 32, sewage_pct: 18, other_pct: 5, state: 'Tamil Nadu', regionalLang: 'Tamil', langCode: 'ta-IN' },
  { id: 4, name: 'Arabian Sea - Kochi Zone', lat: 9.93, lng: 76.26, risk: 65, status: 'medium', plastic_pct: 30, industrial_pct: 20, sewage_pct: 45, other_pct: 5, state: 'Kerala', regionalLang: 'Kannada', langCode: 'kn-IN' },
  { id: 5, name: 'Coromandel Coast - Ennore', lat: 13.23, lng: 80.33, risk: 88, status: 'severe', plastic_pct: 48, industrial_pct: 35, sewage_pct: 12, other_pct: 5, state: 'Tamil Nadu', regionalLang: 'Tamil', langCode: 'ta-IN' }
];

const RIVER_FLOWS = [
  [[16.93, 82.21], [16.98, 82.24]], // Godavari to Kakinada
  [[19.07, 72.87], [19.04, 72.84]], // Mithi to Mahim
];

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState('English');
  const [activeTab, setActiveTab] = useState('map');
  const [selectedHotspot, setSelectedHotspot] = useState(MOCK_HOTSPOTS[0]);
  const [hotspots, setHotspots] = useState(MOCK_HOTSPOTS);
  const [userData, setUserData] = useState({ name: '', phone: '' });
  
  // New state for real-time data
  const [weatherData, setWeatherData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [locationPhoto, setLocationPhoto] = useState(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [futureRiskPrediction, setFutureRiskPrediction] = useState(null);
  const [showShipRoutes, setShowShipRoutes] = useState(true);

  // Handler for location selection with real-time data
  const handleLocationSelect = async (location) => {
    setSelectedHotspot(location);
    setAdvisoryLoading(true);
    setAdvisory(null);

    try {
      // Fetch real data in parallel
      const [weather, water, photo] = await Promise.all([
        getSeaConditions(location.lat, location.lng),
        getCPCBWaterQuality(location.cpcbStationId || 'WQMS_KA_001'),
        getLocationPhoto(location.name),
      ]);

      setWeatherData(weather);
      setWaterData(water);
      setLocationPhoto(photo);

      // Generate Claude advisory with real numbers
      const result = await generateFishermanAdvisory(
        location, weather, water, language.toLowerCase().substring(0, 2)
      );
      console.log('🤖 Advisory response:', result);
      setAdvisory(result);

      // Generate future risk prediction
      const prediction = getFutureRiskAnalysis(location, null, weather);
      setFutureRiskPrediction(prediction);
      
      // Voice alert for high future risk - uses location's regional language
      if (prediction.futureRisk >= 80) {
        // Use location's regional language, not UI language
        const regionalLang = location.regionalLang || 'English';
        const langCode = location.langCode || 'en-IN';
        
        const alertText = regionalLang === 'English' 
          ? `High invasion risk expected in next 90 days at ${location.name}`
          : regionalLang === 'Kannada'
          ? `${location.name} ನಲ್ಲಿ ಮುಂದಿನ 90 ದಿನಗಳಲ್ಲಿ ಹೆಚ್ಚಿನ ಅಪಾಯ`
          : regionalLang === 'Hindi'
          ? `${location.name} में अगले 90 दिनों में उच्च जोखिम`
          : `${location.name} இல் அடுத்த 90 நாட்களில் அதிக ஆபத்து`;
        
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(alertText);
          utterance.lang = langCode;
          window.speechSynthesis.speak(utterance);
          console.log(`🔊 Voice alert in ${regionalLang} for ${location.name}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setAdvisoryLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      console.log('🌊 Fetching pollution data from backend...');
      fetch('/api/pollution')
        .then(res => {
          console.log('✅ Backend response received:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('📊 Pollution data:', data);
          if (data && Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item, idx) => {
              // Determine regional language based on location name or state
              let regionalLang = 'English';
              let langCode = 'en-IN';
              let state = item.state || '';
              
              const name = (item.river_name || item.name || '').toLowerCase();
              
              if (name.includes('mumbai') || name.includes('mahim') || name.includes('ganga') || state.includes('Maharashtra') || state.includes('West Bengal')) {
                regionalLang = 'Hindi';
                langCode = 'hi-IN';
              } else if (name.includes('chennai') || name.includes('cooum') || name.includes('ennore') || state.includes('Tamil Nadu')) {
                regionalLang = 'Tamil';
                langCode = 'ta-IN';
              } else if (name.includes('kochi') || name.includes('kerala') || name.includes('mangalore') || name.includes('karnataka') || state.includes('Kerala') || state.includes('Karnataka')) {
                regionalLang = 'Kannada';
                langCode = 'kn-IN';
              }
              
              return {
                id: item.id || (idx + 100),
                name: item.river_name || item.name || `Region ${idx}`,
                lat: parseFloat(item.latitude || item.lat),
                lng: parseFloat(item.longitude || item.lng),
                risk: item.plastic_tonnes ? Math.min(100, Math.floor(item.plastic_tonnes / 2000)) : (item.risk || 70),
                status: item.status || (item.risk > 80 ? 'severe' : 'high'),
                plastic_pct: item.plastic_pct || 45,
                industrial_pct: item.industrial_pct || 28,
                sewage_pct: item.sewage_pct || 22,
                other_pct: item.other_pct || 5,
                state: state,
                regionalLang: regionalLang,
                langCode: langCode
              };
            });
            console.log('✨ Mapped hotspots:', mapped);
            setHotspots(mapped);
            setSelectedHotspot(mapped[0]);
          } else {
            console.warn("API returned empty or invalid data. Using mock data.");
          }
        })
        .catch(err => {
          console.error("❌ Live DB Fetch failed:", err);
          console.error("Ensure server is running and DB is connected.");
          // Fallback is already handled by initial MOCK_HOTSPOTS state
        });
    }
  }, [isLoggedIn]);

  const t = translations[language];

  const riskLevels = {
    Low: '#10b981',
    Moderate: '#f59e0b',
    High: '#f43f5e',
    Severe: '#8b0000'
  };

  const getRiskCategory = (score) => {
    if (score < 40) return 'Low';
    if (score < 60) return 'Moderate';
    if (score < 80) return 'High';
    return 'Severe';
  };

  if (!isLoggedIn) {
    return (
      <div className="login-root flex-center" style={{ height: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
        {/* Language Selector Top Right */}
        <div style={{ position: 'absolute', top: '30px', right: '30px', display: 'flex', gap: '10px', zIndex: 100 }}>
          {['English', 'Kannada', 'Hindi', 'Tamil'].map(lang => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{ 
                padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)', 
                background: language === lang ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: language === lang ? 'var(--bg-deep)' : 'var(--text-main)',
                fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, transition: '0.3s'
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="glass-card" style={{ padding: '60px', width: '100%', maxWidth: '500px', textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
             <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Shield size={48} />
             </div>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px' }}>{t.login_title}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>{t.login_subtitle}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
             <div className="flex-col" style={{ gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.name_label}</label>
                <div style={{ position: 'relative' }}>
                   <User size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--accent-primary)' }} />
                   <input 
                      type="text" 
                      placeholder="Hasish Infant"
                      value={userData.name}
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      style={{ width: '100%', padding: '15px 15px 15px 45px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
                   />
                </div>
             </div>

             <div className="flex-col" style={{ gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.phone_label}</label>
                <div style={{ position: 'relative' }}>
                   <Phone size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--accent-primary)' }} />
                   <input 
                      type="tel" 
                      placeholder="+91 9876543210"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      style={{ width: '100%', padding: '15px 15px 15px 45px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
                   />
                </div>
             </div>

             <div className="flex-col" style={{ gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.otp_label}</label>
                <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
                   <div style={{ position: 'relative', flex: 1 }}>
                      <Key size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--accent-primary)' }} />
                      <input 
                         type="password" 
                         placeholder="••••••"
                         style={{ width: '100%', padding: '15px 15px 15px 45px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
                      />
                   </div>
                   <button className="glow-btn" style={{ padding: '0 20px', fontSize: '0.7rem' }}>{t.get_otp}</button>
                </div>
             </div>

             <button 
                className="glow-btn" 
                style={{ width: '100%', padding: '18px', fontSize: '1.1rem', justifyContent: 'center', marginTop: '10px' }}
                onClick={() => setIsLoggedIn(true)}
             >
                {t.sign_in}
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="layout-root" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 400px', height: '100vh', background: 'var(--bg-deep)' }}>
      {/* Sidebar */}
      <aside className="glass-card" style={{ margin: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '24px', zIndex: 1000 }}>
        <div style={{ color: 'var(--accent-primary)', marginBottom: '20px' }}>
          <Shield size={32} />
        </div>
        {[
          { id: 'map', icon: MapIcon, label: t.map_tab },
          { id: 'species', icon: Globe, label: t.species_tab },
          { id: 'simulator', icon: Ship, label: t.sim_tab },
          { id: 'stats', icon: BarChart3, label: t.data_tab }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex-col flex-center"
            style={{ 
              background: 'transparent', border: 'none', color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-muted)', 
              cursor: 'pointer', transition: 'all 0.3s', gap: '4px'
            }}
          >
            <item.icon size={24} />
            <span style={{ fontSize: '0.6rem' }}>{item.label}</span>
          </button>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <button 
             onClick={() => { setIsLoggedIn(false); setUserData({ name: '', phone: '' }); }}
             style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}
          >
             <LogOut size={24} />
          </button>
          <div style={{ paddingBottom: '10px' }}><User size={24} color="var(--text-muted)" /></div>
        </div>
      </aside>

      {/* Center Content Viewport */}
      <main style={{ position: 'relative', margin: '10px 0', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div 
              key="map-view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ height: '100%', width: '100%' }}
            >
              <div className="glass-card" style={{ height: 'calc(100% - 20px)', position: 'absolute', width: '100%', overflow: 'hidden' }}>
                <MapContainer center={[12.87, 74.84]} zoom={7} scrollWheelZoom={true} zoomControl={false}>
                  <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    maxZoom={19}
                  />
                  {hotspots.map(spot => (
                    <Marker 
                      key={spot.id} 
                      position={[spot.lat, spot.lng]}
                      eventHandlers={{ click: () => handleLocationSelect(spot) }}
                    >
                      <Popup>
                        <div style={{ background: '#1e293b', color: 'white', padding: '10px', borderRadius: '8px' }}>
                          <h3 style={{ margin: 0 }}>{spot.name}</h3>
                          <p style={{ margin: '5px 0 0' }}>{t.overall_risk}: {spot.risk}/100</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {RIVER_FLOWS.map((path, i) => (
                    <Polyline 
                      key={i} 
                      positions={path} 
                      color="var(--accent-primary)" 
                      weight={2} 
                      className="animated-flow"
                      opacity={0.6}
                    />
                  ))}
                  
                  {/* Animated shipping routes with moving ships */}
                  <ShipRoutes showShips={showShipRoutes} />
                  
                  <ChangeView center={[selectedHotspot.lat, selectedHotspot.lng]} zoom={12} />
                </MapContainer>
              </div>

              <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="glass-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={18} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.ocean_sentinel}</span>
                </div>
                
                {/* Toggle ship routes */}
                <button 
                  className="glass-card"
                  onClick={() => setShowShipRoutes(!showShipRoutes)}
                  style={{ 
                    padding: '10px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    background: showShipRoutes ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: showShipRoutes ? '1px solid #f43f5e' : '1px solid var(--glass-border)',
                    cursor: 'pointer'
                  }}
                >
                  <Ship size={18} color={showShipRoutes ? '#f43f5e' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: showShipRoutes ? '#f43f5e' : 'var(--text-muted)' }}>
                    {showShipRoutes ? 'Hide' : 'Show'} Ship Routes
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'species' && (
             <motion.div 
               key="species-view"
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
               className="glass-card" style={{ height: 'calc(100% - 20px)', margin: '0 10px', padding: '40px', overflowY: 'auto' }}
             >
                <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{t.species_portal_title}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>{t.species_portal_desc}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '20px' }}>
                   <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={20} color="var(--accent-primary)" /> {t.global_ports}
                      </h3>
                      <div className="flex-col" style={{ gap: '15px' }}>
                        {['Singapore Port', 'Jebel Ali', 'Rotterdam', 'Busan'].map((port, i) => (
                           <div key={i} className="flex-between" style={{ padding: '10px', borderBottom: '1px solid var(--glass-border)' }}>
                              <span>{port}</span>
                              <span style={{ color: i === 0 ? 'var(--accent-danger)' : 'var(--accent-warning)', fontWeight: 600 }}>{95 - i*8}% {t.similarity}</span>
                           </div>
                        ))}
                      </div>
                   </div>
                   <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle size={20} color="var(--accent-danger)" /> {t.high_threat_species}
                      </h3>
                      <div style={{ display: 'flex', gap: '15px' }}>
                         {[
                           { name: 'Lionfish', risk: 'severe' },
                           { name: 'Green Crab', risk: 'high' }
                         ].map((sp, i) => (
                           <div key={i} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px' }}>{sp.name}</div>
                              <div style={{ fontSize: '0.7rem', color: sp.risk === 'severe' ? 'var(--accent-danger)' : 'var(--accent-warning)', fontWeight: 700 }}>{t[sp.risk].toUpperCase()} {t.threat_level}</div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'simulator' && (
             <motion.div 
                key="sim-view"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.05, opacity: 0 }}
                style={{ height: 'calc(100% - 20px)', margin: '0 10px' }}
             >
                <SimPage 
                  liveData={waterData} 
                  lang={language.toLowerCase().substring(0, 2)} 
                />
             </motion.div>
          )}

          {activeTab === 'stats' && (
             <motion.div 
                key="stats-view"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card" style={{ height: 'calc(100% - 20px)', margin: '0 10px', padding: '40px', overflowY: 'auto' }}
             >
                <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>{t.env_data_core}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div className="glass-card" style={{ padding: '20px' }}>
                      <h3>{t.annual_plastic}</h3>
                      <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '20px 0' }}>
                         {[40, 65, 30, 85, 45, 90].map((h, i) => (
                            <motion.div 
                               key={i} 
                               initial={{ height: 0 }} animate={{ height: `${h}%` }}
                               style={{ flex: 1, background: 'var(--accent-primary)', borderRadius: '4px 4px 0 0' }} 
                            />
                         ))}
                      </div>
                   </div>
                   <div className="glass-card" style={{ padding: '20px' }}>
                      <h3>{t.regional_resp}</h3>
                      <div style={{ marginTop: '20px' }}>
                         {[
                           { label: t.govt_policy, prc: 85 },
                           { label: t.ind_compliance, prc: 42 },
                           { label: t.comm_participation, prc: 68 }
                         ].map((item, i) => (
                           <div key={i} style={{ marginBottom: '15px' }}>
                              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
                                 <span>{item.label}</span>
                                 <span>{item.prc}%</span>
                              </div>
                              <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '3px' }}>
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${item.prc}%` }} style={{ height: '100%', background: 'var(--accent-secondary)', borderRadius: '3px' }} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Multilingual Alert Bar */}
        <div style={{ position: 'absolute', bottom: '30px', left: '20px', right: '20px', zIndex: 1000 }}>
          <div className="glass-card" style={{ 
            padding: '15px 25px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '20px',
            background: selectedHotspot.risk >= 50 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: selectedHotspot.risk >= 50 ? '1px solid var(--accent-danger)' : '1px solid var(--accent-secondary)'
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: selectedHotspot.risk >= 50 ? 'var(--accent-danger)' : 'var(--accent-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: selectedHotspot.risk >= 50 ? '0 0 15px var(--accent-danger)' : '0 0 15px var(--accent-secondary)'
                }}
              >
                <Bell size={20} color="white" />
              </motion.div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Live {t.threat_level} ({selectedHotspot.regionalLang || language}) - Risk: {selectedHotspot.risk}%
                </p>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  {/* English Messages */}
                  {(selectedHotspot.regionalLang === 'English' || !selectedHotspot.regionalLang) && selectedHotspot.risk >= 50 && 
                    `High waste flow in ${selectedHotspot.name}. Don't fish here.`}
                  {(selectedHotspot.regionalLang === 'English' || !selectedHotspot.regionalLang) && selectedHotspot.risk < 50 && 
                    `${selectedHotspot.name} is safe. OK to fish here.`}
                  
                  {/* Kannada Messages */}
                  {selectedHotspot.regionalLang === 'Kannada' && selectedHotspot.risk >= 50 && 
                    `${selectedHotspot.name} ಕಡಲಲ್ಲಿ ಕೊಳೆ ಜಾಸ್ತಿಯಾಗಿದೆ. ಮೀನು ಹಿಡಿಯಬೇಡಿ.`}
                  {selectedHotspot.regionalLang === 'Kannada' && selectedHotspot.risk < 50 && 
                    `${selectedHotspot.name} ಸುರಕ್ಷಿತವಾಗಿದೆ. ಮೀನು ಹಿಡಿಯಬಹುದು.`}
                  
                  {/* Hindi Messages */}
                  {selectedHotspot.regionalLang === 'Hindi' && selectedHotspot.risk >= 50 && 
                    `${selectedHotspot.name} खाड़ी में कचरा बढ़ गया है। मछली न पकड़ें।`}
                  {selectedHotspot.regionalLang === 'Hindi' && selectedHotspot.risk < 50 && 
                    `${selectedHotspot.name} सुरक्षित है। मछली पकड़ सकते हैं।`}
                  
                  {/* Tamil Messages */}
                  {selectedHotspot.regionalLang === 'Tamil' && selectedHotspot.risk >= 50 && 
                    `${selectedHotspot.name} கடலில் கழிவு அதிகமாக உள்ளது. மீன்பிடிக்க வேண்டாம்.`}
                  {selectedHotspot.regionalLang === 'Tamil' && selectedHotspot.risk < 50 && 
                    `${selectedHotspot.name} பாதுகாப்பானது. மீன்பிடிக்கலாம்.`}
                </h4>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="glow-btn" 
                style={{ 
                  padding: '6px 14px',
                  borderColor: selectedHotspot.risk >= 50 ? 'var(--accent-danger)' : 'var(--accent-secondary)',
                  color: selectedHotspot.risk >= 50 ? 'var(--accent-danger)' : 'var(--accent-secondary)'
                }} 
                onClick={() => {
                   // Use location's regional language for voice
                   const regionalLang = selectedHotspot.regionalLang || 'English';
                   const langCode = selectedHotspot.langCode || 'en-IN';
                   const risk = selectedHotspot.risk;
                   
                   // Risk-based messages
                   let text = '';
                   if (regionalLang === 'English') {
                     text = risk >= 50 
                       ? `High waste flow in ${selectedHotspot.name}. Don't fish here.`
                       : `${selectedHotspot.name} is safe. OK to fish here.`;
                   } else if (regionalLang === 'Kannada') {
                     text = risk >= 50
                       ? `${selectedHotspot.name} ಕಡಲಲ್ಲಿ ಕೊಳೆ ಜಾಸ್ತಿಯಾಗಿದೆ. ಮೀನು ಹಿಡಿಯಬೇಡಿ.`
                       : `${selectedHotspot.name} ಸುರಕ್ಷಿತವಾಗಿದೆ. ಮೀನು ಹಿಡಿಯಬಹುದು.`;
                   } else if (regionalLang === 'Hindi') {
                     text = risk >= 50
                       ? `${selectedHotspot.name} खाड़ी में कचरा बढ़ गया है। मछली न पकड़ें।`
                       : `${selectedHotspot.name} सुरक्षित है। मछली पकड़ सकते हैं।`;
                   } else {
                     text = risk >= 50
                       ? `${selectedHotspot.name} கடலில் கழிவு அதிகமாக உள்ளது. மீன்பிடிக்க வேண்டாம்.`
                       : `${selectedHotspot.name} பாதுகாப்பானது. மீன்பிடிக்கலாம்.`;
                   }
                   
                   const utterance = new SpeechSynthesisUtterance(text);
                   utterance.lang = langCode;
                   window.speechSynthesis.speak(utterance);
                   console.log(`🔊 Alert spoken in ${regionalLang} for ${selectedHotspot.name} (Risk: ${risk}%)`);
                }}
              >
                <Wind size={14} /> 🔊
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Intelligence Panel */}
      <aside className="glass-card" style={{ margin: '10px', height: 'calc(100% - 20px)', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header className="flex-between" style={{ marginBottom: '24px' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{t.intel_report}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedHotspot.name}</h2>
          </div>
          <div className="flex-center" style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-primary)' }}>
            <BarChart3 size={20} />
          </div>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '140px', height: '140px' }}>
              <circle cx="70" cy="70" r="60" fill="transparent" stroke="var(--glass-border)" strokeWidth="8" />
              <motion.circle 
                cx="70" cy="70" r="60" fill="transparent" 
                stroke={riskLevels[getRiskCategory(selectedHotspot.risk)]} 
                strokeWidth="8" 
                strokeDasharray="377"
                initial={{ strokeDashoffset: 377 }}
                animate={{ strokeDashoffset: 377 - (377 * selectedHotspot.risk) / 100 }}
                transition={{ duration: 1.5 }}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{selectedHotspot.risk}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SC-INTEL</span>
            </div>
          </div>
        </div>

        <div style={{ 
          background: `${riskLevels[getRiskCategory(selectedHotspot.risk)]}20`, 
          border: `1px solid ${riskLevels[getRiskCategory(selectedHotspot.risk)]}`,
          padding: '8px', borderRadius: '8px', textAlign: 'center', marginBottom: '24px'
        }}>
          <span style={{ color: riskLevels[getRiskCategory(selectedHotspot.risk)], fontWeight: 700, fontSize: '0.9rem' }}>
            {t[getRiskCategory(selectedHotspot.risk).toLowerCase()] || getRiskCategory(selectedHotspot.risk).toUpperCase()} {t.threat_level}
          </span>
        </div>

        {/* Future Risk Prediction Panel */}
        {futureRiskPrediction && (
          <FutureRiskPanel prediction={futureRiskPrediction} language={language} />
        )}

        {/* Live Data Badge */}
        {weatherData && (
          <LiveDataBadge 
            weatherData={weatherData} 
            waterData={waterData}
            locationPhoto={locationPhoto}
            language={language}
          />
        )}

        {/* Loading State */}
        {advisoryLoading && (
          <div className="glass-card" style={{ 
            background: 'rgba(14, 165, 233, 0.1)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--accent-primary)',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'inline-block',
              width: 24,
              height: 24,
              border: '3px solid var(--accent-primary)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: 12
            }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              {language === 'English' && 'Analyzing real-time data...'}
              {language === 'Kannada' && 'ನೈಜ-ಸಮಯ ಡೇಟಾ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'}
              {language === 'Hindi' && 'वास्तविक समय डेटा का विश्लेषण...'}
              {language === 'Tamil' && 'நேரடி தரவு பகுப்பாய்வு...'}
            </div>
          </div>
        )}

        {/* AI Advisory Panel */}
        {advisory && !advisoryLoading && (
          <WhyPanel 
            advisory={advisory} 
            weatherData={weatherData}
            waterData={waterData}
            language={language}
          />
        )}

        <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--glass-border)', marginBottom: '24px' }}>
           <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.pollution_receipt}</span>
           <div style={{ marginTop: '15px' }}>
              {[
                { label: t.plastic, prc: selectedHotspot.plastic_pct || 45, col: 'var(--accent-primary)' },
                { label: t.industrial, prc: selectedHotspot.industrial_pct || 28, col: 'var(--accent-warning)' },
                { label: t.sewage, prc: selectedHotspot.sewage_pct || 22, col: 'var(--accent-secondary)' }
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span>{item.label}</span>
                    <span>{item.prc}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                    <div style={{ width: `${item.prc}%`, height: '100%', background: item.col, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
           <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)' }}>{t.marine_health}</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="glass-card flex-col flex-center" style={{ padding: '15px' }}>
                 <Droplets size={20} color="var(--accent-danger)" />
                 <span style={{ fontSize: '1rem', fontWeight: 700 }}>4.1</span>
                 <span style={{ fontSize: '0.6rem' }}>{t.do_levels}</span>
              </div>
              <div className="glass-card flex-col flex-center" style={{ padding: '15px' }}>
                 <Wind size={20} color="var(--accent-warning)" />
                 <span style={{ fontSize: '1rem', fontWeight: 700 }}>82%</span>
                 <span style={{ fontSize: '0.6rem' }}>{t.habitat_loss}</span>
              </div>
           </div>
        </div>

        <div className="flex-between" style={{ marginTop: 'auto', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid #10b981' }}>
           <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>{t.sdg_label}</div>
           <ChevronRight size={16} color="#10b981" />
        </div>
      </aside>
    </div>
  );
}
