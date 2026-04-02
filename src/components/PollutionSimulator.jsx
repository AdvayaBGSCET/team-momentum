import { useEffect, useRef, useState, useCallback } from 'react';

const RIVERS = [
  { x: 0.38, y: 0.52, name: 'Netravathi', basePollution: 0.65 },
  { x: 0.42, y: 0.58, name: 'Gurpur',     basePollution: 0.55 },
  { x: 0.28, y: 0.38, name: 'Sharavathi', basePollution: 0.35 },
  { x: 0.55, y: 0.72, name: 'Payaswini',  basePollution: 0.45 },
];

const PORTS = [
  { x: 0.39, y: 0.50, name: 'Mangalore' },
  { x: 0.29, y: 0.37, name: 'Karwar'    },
  { x: 0.57, y: 0.73, name: 'Kasaragod' },
];

const SAFE_ZONES = [
  { x: 0.20, y: 0.25, r: 0.10, name: 'Zone A' },
  { x: 0.15, y: 0.50, r: 0.08, name: 'Zone B' },
  { x: 0.22, y: 0.70, r: 0.09, name: 'Zone C' },
];

const SCENARIOS = {
  today:   { label: 'Today (real data)', mult: 1.0 },
  monsoon: { label: 'Heavy monsoon',     mult: 1.8 },
  clean:   { label: 'Post-cleanup',      mult: 0.3 },
};

export default function PollutionSimulator({ liveData = null, lang = 'en' }) {
  const canvasRef  = useRef();
  const areaRef    = useRef();
  const timerRef   = useRef();

  const [day,      setDayState] = useState(1);
  const [playing,  setPlaying]  = useState(false);
  const [scenario, setScenario] = useState('today');
  const [layers,   setLayers]   = useState({ pollution: true, safe: true, fish: false });

  // Use live CPCB + OWM data when available, else use simulated values
  const baseDO   = liveData?.do        ?? 5.2;
  const baseTurb = liveData?.turbidity ?? 3.1;
  const baseTemp = liveData?.temp      ?? 28.8;
  const baseWind = liveData?.windSpeed ?? 5.0;

  const getMult = useCallback(() => SCENARIOS[scenario].mult, [scenario]);

  const computeZoneMetrics = useCallback((d) => {
    const mult      = getMult();
    const dayFactor = 1 + (d - 1) * 0.015;
    const pollution = Math.min(1, 0.65 * mult * dayFactor);
    const doVal     = Math.max(3.0, baseDO   - pollution * 2.5);
    const turbVal   = Math.min(14,  baseTurb + pollution * 6);
    return { pollution, doVal, turbVal };
  }, [getMult, baseDO, baseTurb]);

  // Canvas draw
  const draw = useCallback((d) => {
    const canvas = canvasRef.current;
    const area   = areaRef.current;
    if (!canvas || !area) return;
    const W = area.clientWidth  || 600;
    const H = area.clientHeight || 420;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Ocean
    ctx.fillStyle = '#07111e';
    ctx.fillRect(0, 0, W, H);

    // Coastline
    ctx.beginPath();
    ctx.moveTo(W*0.45, 0);
    ctx.lineTo(W*0.40, H*0.30);
    ctx.lineTo(W*0.38, H*0.52);
    ctx.lineTo(W*0.42, H*0.60);
    ctx.lineTo(W*0.50, H*0.72);
    ctx.lineTo(W*0.65, H);
    ctx.lineTo(W, H); ctx.lineTo(W, 0);
    ctx.closePath();
    ctx.fillStyle = '#1a2744'; ctx.fill();

    ctx.fillStyle = '#3a4a6a';
    ctx.font = `${Math.round(W * 0.024)}px sans-serif`;
    ctx.fillText('Karnataka', W*0.60, H*0.30);
    ctx.fillText('Kerala',    W*0.70, H*0.72);

    const mult      = getMult();
    const dayFactor = 1 + (d - 1) * 0.015 * (scenario === 'clean' ? -0.5 : 1);

    // Pollution plumes
    if (layers.pollution) {
      RIVERS.forEach(r => {
        const px = r.x * W, py = r.y * H;
        const p  = Math.min(1, r.basePollution * mult * dayFactor);
        const maxR = W * 0.18 * p;
        for (let i = 4; i >= 0; i--) {
          const radius = maxR * (1 - i * 0.18);
          const alpha  = (0.07 + i * 0.025) * p;
          const cx = px - W * 0.04, cy = py + H * 0.02;
          const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          const color = p > 0.6 ? `248,81,73` : p > 0.35 ? `210,153,34` : `86,211,100`;
          g.addColorStop(0, `rgba(${color},${alpha * 1.5})`);
          g.addColorStop(1, `rgba(${color},0)`);
          ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        }
      });
    }

    // Safe zones
    if (layers.safe && mult < 1.6) {
      SAFE_ZONES.forEach(z => {
        const sx = z.x * W, sy = z.y * H;
        const sr = z.r * W * (1.2 - mult * 0.15);
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(86,211,100,0.55)';
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(86,211,100,0.05)'; ctx.fill();
        ctx.fillStyle = 'rgba(86,211,100,0.85)';
        ctx.font = `${Math.round(W * 0.018)}px sans-serif`;
        ctx.fillText('SAFE', sx - 14, sy + 4);
      });
    }

    // Fish density dots
    if (layers.fish) {
      [[0.18,0.22],[0.14,0.48],[0.20,0.68],[0.12,0.35]].forEach(([fx,fy]) => {
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(fx*W+(Math.random()-.5)*W*.05, fy*H+(Math.random()-.5)*H*.06, 2, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(92,200,255,0.6)'; ctx.fill();
        }
      });
    }

    // River mouths
    RIVERS.forEach(r => {
      const px = r.x * W, py = r.y * H;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2);
      ctx.fillStyle = '#5cc8ff'; ctx.fill();
      ctx.fillStyle = 'rgba(92,200,255,0.85)';
      ctx.font = `${Math.round(W * 0.018)}px sans-serif`;
      ctx.fillText(r.name, px + 8, py + 4);
    });

    // Port markers
    PORTS.forEach(p => {
      const px = p.x * W, py = p.y * H;
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2);
      ctx.fillStyle = '#e6edf3'; ctx.fill();
      ctx.fillStyle = '#e6edf3';
      ctx.font = `bold ${Math.round(W * 0.02)}px sans-serif`;
      ctx.fillText(p.name, px + 9, py + 5);
    });
  }, [layers, scenario, getMult]);

  useEffect(() => { draw(day); }, [day, draw]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setDayState(d => { const next = d >= 30 ? 1 : d + 1; return next; });
      }, 380);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  useEffect(() => {
    const ro = new ResizeObserver(() => draw(day));
    if (areaRef.current) ro.observe(areaRef.current);
    return () => ro.disconnect();
  }, [draw, day]);

  const { doVal, turbVal, pollution } = computeZoneMetrics(day);
  const doColor   = doVal > 5 ? '#56d364' : doVal > 4 ? '#d29922' : '#f85149';
  const turbColor = turbVal < 5 ? '#56d364' : turbVal < 8 ? '#d29922' : '#f85149';

  const advice = pollution > 0.7
    ? (lang === 'kn' ? 'ಇಂದು ಮನೆಯಲ್ಲಿ ಉಳಿಯಿರಿ. ಅಪಾಯಕಾರಿ ಮಾಲಿನ್ಯ ಮಟ್ಟ.' : 'Stay home today. Dangerous pollution levels near all estuaries.')
    : pollution > 0.45
    ? (lang === 'kn' ? 'ಮಂಗಳೂರು ಉತ್ತರ ಝೋನ್ A ಮಾತ್ರ ಸುರಕ್ಷಿತ.' : 'Zone A north of Mangalore only. Avoid estuaries.')
    : (lang === 'kn' ? 'ಇಂದು ಮೀನುಗಾರಿಕೆಗೆ ಸೂಕ್ತ. ಝೋನ್ A ಮತ್ತು C ಸ್ಪಷ್ಟ.' : 'Good conditions. Zones A and C clear. Mackerel, Tuna active 10–15km offshore.');

  const S = {
    wrap:     { background:'#060d1a', borderRadius:12, overflow:'hidden', fontFamily:'sans-serif', color:'#e6edf3' },
    topbar:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#0a1628', borderBottom:'1px solid #1e3a5f' },
    ctrlRow:  { display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', padding:'8px 14px', background:'#0a1628', borderBottom:'1px solid #1e3a5f' },
    grid:     { display:'grid', gridTemplateColumns:'1fr 260px', minHeight:420 },
    mapArea:  { position:'relative', background:'#07111e', overflow:'hidden' },
    sidebar:  { background:'#0a1628', borderLeft:'1px solid #1e3a5f', padding:12, display:'flex', flexDirection:'column', gap:8, overflowY:'auto' },
    badge:    { position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', background:'rgba(10,22,40,0.92)', border:'1px solid #1e3a5f', borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:500, color:'#5cc8ff', whiteSpace:'nowrap' },
    legend:   { position:'absolute', bottom:8, left:8, background:'rgba(10,22,40,0.92)', border:'1px solid #1e3a5f', borderRadius:8, padding:'6px 10px', display:'flex', flexDirection:'column', gap:4 },
    legRow:   { display:'flex', alignItems:'center', gap:6, fontSize:10, color:'#7a8aa0' },
    legDot:   { width:10, height:10, borderRadius:'50%', flexShrink:0 },
    pillBtn:  { fontSize:11, fontWeight:500, padding:'4px 11px', borderRadius:20, border:'1px solid #1e3a5f', background:'transparent', color:'#7a8aa0', cursor:'pointer', whiteSpace:'nowrap' },
    pillOn:   { background:'#0f4c75', color:'#5cc8ff', borderColor:'#0f4c75' },
    playBtn:  { fontSize:12, fontWeight:600, padding:'5px 16px', borderRadius:20, border:'none', cursor:'pointer' },
    sliderWrap:{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', background:'#0a1628', borderTop:'1px solid #1e3a5f' },
    sTitle:   { fontSize:10, fontWeight:500, color:'#7a8aa0', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 },
    metGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 },
    met:      { background:'#060d1a', borderRadius:6, padding:'6px 8px' },
    metL:     { fontSize:10, color:'#7a8aa0', marginBottom:2 },
    advBox:   { background:'#0f1f0f', border:'1px solid #1a4a1a', borderRadius:8, padding:'9px 11px' },
  };

  const zoneBorder = (p) => p > 0.6 ? {background:'#1f0505',borderColor:'#4a1010'} : p > 0.35 ? {background:'#1f1500',borderColor:'#4a3000'} : {background:'#0a1f0a',borderColor:'#1a4a1a'};
  const zoneColor  = (p) => p > 0.6 ? '#f85149' : p > 0.35 ? '#d29922' : '#56d364';

  const zoneA = Math.min(1, 0.20 * getMult() * (1+(day-1)*0.015));
  const zoneB = Math.min(1, pollution);
  const zoneC = Math.min(1, 0.45 * getMult() * (1+(day-1)*0.015));

  return (
    <div style={S.wrap}>
      {/* Top bar */}
      <div style={S.topbar}>
        <div>
          <div style={{ fontSize:15, fontWeight:600 }}>Pollution spread simulator</div>
          <div style={{ fontSize:11, color:'#7a8aa0', marginTop:2 }}>Karnataka coast · {liveData?.isReal ? 'Live CPCB data' : 'Reference model'}</div>
        </div>
        <button
          style={{ ...S.playBtn, background: playing ? '#e24b4a' : '#1d9e75', color:'#fff' }}
          onClick={() => setPlaying(p => !p)}
        >{playing ? '⏸ Pause' : '▶ Play 30-day'}</button>
      </div>

      {/* Controls */}
      <div style={S.ctrlRow}>
        <span style={{ fontSize:11, color:'#7a8aa0' }}>Scenario:</span>
        {Object.entries(SCENARIOS).map(([key, sc]) => (
          <button key={key}
            style={{ ...S.pillBtn, ...(scenario===key ? S.pillOn : {}) }}
            onClick={() => setScenario(key)}
          >{sc.label}</button>
        ))}
        <span style={{ fontSize:11, color:'#7a8aa0', marginLeft:8 }}>Layers:</span>
        {[['pollution','Pollution'],['safe','Safe zones'],['fish','Fish density']].map(([k,l]) => (
          <button key={k}
            style={{ ...S.pillBtn, ...(layers[k] ? S.pillOn : {}) }}
            onClick={() => setLayers(prev => ({ ...prev, [k]: !prev[k] }))}
          >{l}</button>
        ))}
      </div>

      {/* Main */}
      <div style={S.grid}>
        <div style={S.mapArea} ref={areaRef}>
          <canvas ref={canvasRef} style={{ display:'block', width:'100%', height:'100%' }} />
          <div style={S.badge}>Day {day} of 30</div>
          <div style={S.legend}>
            {[['#f85149','High pollution'],['#d29922','Caution zone'],['#56d364','Safe fishing'],['#5cc8ff','River mouth']].map(([c,l]) => (
              <div key={l} style={S.legRow}><div style={{ ...S.legDot, background:c }} />{l}</div>
            ))}
          </div>
        </div>

        <div style={S.sidebar}>
          <div style={S.sTitle}>Live zone status</div>
          {[['Zone A — Mangalore North', zoneA],['Zone B — Netravathi Estuary', zoneB],['Zone C — Gurpur Mouth', zoneC]].map(([name, p]) => (
            <div key={name} style={{ borderRadius:8, padding:'9px 11px', border:'1px solid', ...zoneBorder(p) }}>
              <div style={{ fontSize:13, fontWeight:500, color:zoneColor(p), marginBottom:2 }}>{name}</div>
              <div style={{ fontSize:11, color:'#7a8aa0', lineHeight:1.5 }}>
                {p > 0.6 ? 'Avoid — high contamination' : p > 0.35 ? 'Caution — elevated discharge' : 'Safe — good conditions'}
              </div>
            </div>
          ))}

          <div style={S.sTitle}>Simulated readings · Day {day}</div>
          <div style={S.metGrid}>
            <div style={S.met}><div style={S.metL}>Sea temp</div><div style={{ fontSize:15, fontWeight:500, color:'#5cc8ff' }}>{baseTemp.toFixed(1)}°C</div></div>
            <div style={S.met}><div style={S.metL}>Wind</div><div style={{ fontSize:15, fontWeight:500, color:'#d29922' }}>{baseWind.toFixed(1)} m/s</div></div>
            <div style={S.met}><div style={S.metL}>Dissolved O₂</div><div style={{ fontSize:15, fontWeight:500, color:doColor }}>{doVal.toFixed(1)} mg/L</div></div>
            <div style={S.met}><div style={S.metL}>Turbidity</div><div style={{ fontSize:15, fontWeight:500, color:turbColor }}>{turbVal.toFixed(1)} NTU</div></div>
          </div>

          <div style={S.advBox}>
            <div style={S.sTitle}>
              {lang === 'kn' ? 'ರಮೇಶ್, ಇಂದು ಇಲ್ಲಿ ಹೋಗಿ' : 'Ramesh, go here today'}
            </div>
            <p style={{ fontSize:12, color:'#a8d8a8', lineHeight:1.6, marginTop:4 }}>{advice}</p>
          </div>
        </div>
      </div>

      {/* Day slider */}
      <div style={S.sliderWrap}>
        <span style={{ fontSize:11, color:'#7a8aa0' }}>Day</span>
        <input type="range" min="1" max="30" step="1" value={day}
          onChange={e => setDayState(Number(e.target.value))}
          style={{ flex:1, accentColor:'#5cc8ff' }} />
        <span style={{ fontSize:12, fontWeight:500, color:'#5cc8ff', minWidth:52 }}>Day {day}</span>
        <span style={{ fontSize:11, color:'#7a8aa0' }}>30-day forecast</span>
      </div>
    </div>
  );
}