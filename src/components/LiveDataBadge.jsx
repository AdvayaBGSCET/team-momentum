import { Activity, Waves, Droplet } from 'lucide-react';

export default function LiveDataBadge({ weatherData, waterData, locationPhoto, language }) {
  const isRealData = weatherData?.isReal || waterData?.isReal;
  const statusColor = isRealData ? '#56d364' : '#f59e0b';
  const statusText = isRealData ? 'Live Data' : 'Reference Data';

  const labels = {
    English: { temp: 'Sea Temp', wind: 'Wind', do: 'Dissolved O₂', turbidity: 'Turbidity' },
    Kannada: { temp: 'ಸಮುದ್ರ ತಾಪಮಾನ', wind: 'ಗಾಳಿ', do: 'ಆಮ್ಲಜನಕ', turbidity: 'ಶುದ್ಧತೆ' },
    Hindi: { temp: 'समुद्र तापमान', wind: 'हवा', do: 'ऑक्सीजन', turbidity: 'टर्बिडिटी' },
    Tamil: { temp: 'கடல் வெப்பநிலை', wind: 'காற்று', do: 'ஆக்ஸிஜன்', turbidity: 'டர்பிடிட்டி' }
  };

  const t = labels[language] || labels.English;

  return (
    <div className="glass-card" style={{ 
      background: locationPhoto?.url 
        ? `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url(${locationPhoto.url})`
        : 'rgba(255,255,255,0.02)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '16px', 
      borderRadius: '12px', 
      border: `1px solid ${statusColor}40`,
      marginBottom: '20px' 
    }}>
      {/* Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          background: statusColor,
          boxShadow: `0 0 0 3px ${statusColor}30`,
          animation: isRealData ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{ fontSize: '0.75rem', color: statusColor, fontWeight: 600 }}>
          {statusText}
        </span>
        <Activity size={14} color={statusColor} />
      </div>

      {/* Data Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Sea Temperature */}
        <div style={{ background: 'rgba(14, 165, 233, 0.1)', borderRadius: 8, padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Waves size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.temp}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {weatherData?.temp != null ? `${weatherData.temp.toFixed(1)}°C` : '—'}
          </div>
        </div>

        {/* Wind Speed */}
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Activity size={14} color="var(--accent-warning)" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.wind}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
            {weatherData?.windSpeed != null ? `${weatherData.windSpeed.toFixed(1)} m/s` : '—'}
          </div>
        </div>

        {/* Dissolved Oxygen */}
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Droplet size={14} color="var(--accent-secondary)" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.do}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: waterData?.do >= 5.0 ? 'var(--accent-secondary)' : 'var(--accent-danger)' }}>
            {waterData?.do != null ? `${waterData.do.toFixed(1)} mg/L` : '—'}
          </div>
        </div>

        {/* Turbidity */}
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', borderRadius: 8, padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Droplet size={14} color="#8b5cf6" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.turbidity}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: waterData?.turbidity <= 5.0 ? '#8b5cf6' : 'var(--accent-danger)' }}>
            {waterData?.turbidity != null ? `${waterData.turbidity.toFixed(1)} NTU` : '—'}
          </div>
        </div>
      </div>

      {/* Data Source Footer */}
      <div style={{ marginTop: 12, fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {weatherData?.source} • {waterData?.source}
      </div>
    </div>
  );
}