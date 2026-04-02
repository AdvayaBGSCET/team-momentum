import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function WhyPanel({ advisory, weatherData, waterData, language }) {
  if (!advisory) return null;

  const isRealData = weatherData?.isReal || waterData?.isReal;

  const labels = {
    English: { 
      why: 'Why this advisory?', 
      decision: 'Decision', 
      reason: 'Analysis',
      keyRisk: 'Key Risk',
      dataQuality: 'Data Quality',
      safeZones: 'Safer Zones'
    },
    Kannada: { 
      why: 'ಈ ಸಲಹೆ ಏಕೆ?', 
      decision: 'ನಿರ್ಧಾರ', 
      reason: 'ವಿಶ್ಲೇಷಣೆ',
      keyRisk: 'ಮುಖ್ಯ ಅಪಾಯ',
      dataQuality: 'ಡೇಟಾ ಗುಣಮಟ್ಟ',
      safeZones: 'ಸುರಕ್ಷಿತ ಪ್ರದೇಶಗಳು'
    },
    Hindi: { 
      why: 'यह सलाह क्यों?', 
      decision: 'निर्णय', 
      reason: 'विश्लेषण',
      keyRisk: 'मुख्य जोखिम',
      dataQuality: 'डेटा गुणवत्ता',
      safeZones: 'सुरक्षित क्षेत्र'
    },
    Tamil: { 
      why: 'இந்த ஆலோசனை ஏன்?', 
      decision: 'முடிவு', 
      reason: 'பகுப்பாய்வு',
      keyRisk: 'முக்கிய ஆபத்து',
      dataQuality: 'தரவு தரம்',
      safeZones: 'பாதுகாப்பான பகுதிகள்'
    }
  };

  const t = labels[language] || labels.English;

  const decisionConfig = {
    GO_FISHING: { color: '#10b981', icon: CheckCircle, label: 'Safe to Fish' },
    CAUTION: { color: '#f59e0b', icon: AlertTriangle, label: 'Fish with Caution' },
    AVOID: { color: '#f43f5e', icon: AlertCircle, label: 'Avoid Fishing' }
  };

  const config = decisionConfig[advisory.decision] || decisionConfig.CAUTION;
  const DecisionIcon = config.icon;

  const metrics = [
    { 
      label: t.keyRisk || 'Key Risk', 
      value: advisory.key_risk || advisory.keyRisk || 
             (waterData && waterData.do && waterData.do < 5.0 ? 'Low dissolved oxygen' : 'Water quality monitoring') 
    },
    { 
      label: t.dataQuality || 'Data Quality', 
      value: advisory.data_quality || advisory.dataQuality || 
             (isRealData ? 'Live sensors' : 'Reference data') 
    }
  ];

  return (
    <div className="glass-card" style={{ 
      background: 'rgba(255,255,255,0.02)', 
      padding: '20px', 
      borderRadius: '12px', 
      border: `1px solid ${config.color}40`,
      marginBottom: '20px' 
    }}>
      {/* Header */}
      <div style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)', 
        textTransform: 'uppercase', 
        letterSpacing: '0.06em', 
        marginBottom: 16,
        fontWeight: 600
      }}>
        {t.why}
      </div>

      {/* Decision Badge */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        padding: '12px 16px',
        background: `${config.color}20`,
        border: `1px solid ${config.color}`,
        borderRadius: 10,
        marginBottom: 16
      }}>
        <DecisionIcon size={24} color={config.color} />
        <div>
          <div style={{ fontSize: '0.7rem', color: config.color, fontWeight: 700, textTransform: 'uppercase' }}>
            {t.decision}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: config.color }}>
            {config.label}
          </div>
        </div>
      </div>

      {/* Advisory Text */}
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: 10, 
        padding: '14px 16px',
        marginBottom: 16,
        lineHeight: 1.6,
        fontSize: '0.85rem',
        color: 'var(--text-main)'
      }}>
        {advisory.advisory_text}
      </div>

      {/* Decision Reason */}
      <div style={{ 
        background: 'rgba(14, 165, 233, 0.1)', 
        borderRadius: 8, 
        padding: '12px',
        marginBottom: 12,
        fontSize: '0.75rem',
        color: 'var(--accent-primary)',
        lineHeight: 1.5
      }}>
        <strong>{t.reason}:</strong> {advisory.decision_reason || advisory.decisionReason || 
          `DO at ${waterData?.do ?? 5.2} mg/L, turbidity ${waterData?.turbidity ?? 3.1} NTU — monitoring advised`}
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 8, 
            padding: '10px 12px' 
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              {m.label}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {m.value || '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Safe Zones */}
      {advisory.safe_zones && advisory.decision !== 'GO_FISHING' && (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid #10b98140',
          borderRadius: 8, 
          padding: '10px 12px',
          fontSize: '0.75rem',
          color: '#10b981'
        }}>
          <strong>{t.safeZones}:</strong> {advisory.safe_zones}
        </div>
      )}

      {/* Data Sources Footer */}
      <div style={{ 
        marginTop: 12, 
        paddingTop: 12,
        borderTop: '1px solid var(--glass-border)',
        fontSize: '0.65rem', 
        color: 'var(--text-muted)', 
        textAlign: 'center' 
      }}>
        {weatherData?.source} • {waterData?.source}
        {!isRealData && <div style={{ color: '#f59e0b', marginTop: 4 }}>⚠ Using reference values</div>}
      </div>
    </div>
  );
}