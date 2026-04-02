import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Ship, Thermometer } from 'lucide-react';

export default function FutureRiskPanel({ prediction, language }) {
  if (!prediction) return null;

  const isIncreasing = prediction.riskIncrease > 0;
  const riskColor = prediction.futureRisk >= 80 ? '#f43f5e' : 
                    prediction.futureRisk >= 60 ? '#f59e0b' : '#0ea5e9';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ 
        padding: '20px', 
        marginBottom: '24px',
        background: 'rgba(244, 63, 94, 0.05)',
        border: '1px solid rgba(244, 63, 94, 0.3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <TrendingUp size={20} color={riskColor} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {language === 'Kannada' ? 'ಭವಿಷ್ಯದ ಅಪಾಯ ಮುನ್ಸೂಚನೆ' : 
           language === 'Hindi' ? 'भविष्य जोखिम पूर्वानुमान' :
           language === 'Tamil' ? 'எதிர்கால அபாய கணிப்பு' :
           'FUTURE RISK PREDICTION'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            {language === 'Kannada' ? 'ಪ್ರಸ್ತುತ' : 
             language === 'Hindi' ? 'वर्तमान' :
             language === 'Tamil' ? 'தற்போதைய' : 'CURRENT'}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{prediction.currentRisk}</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            {language === 'Kannada' ? '90 ದಿನಗಳಲ್ಲಿ' : 
             language === 'Hindi' ? '90 दिनों में' :
             language === 'Tamil' ? '90 நாட்களில்' : '90 DAYS'}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: riskColor }}>
            {prediction.futureRisk}
            {isIncreasing && (
              <span style={{ fontSize: '1rem', marginLeft: '4px' }}>
                ↑{prediction.riskIncrease}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ 
        padding: '12px', 
        background: 'rgba(0,0,0,0.3)', 
        borderRadius: '8px',
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
          {prediction.prediction}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Ship size={14} color="var(--accent-warning)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {language === 'Kannada' ? 'ಹಡಗು ಚಲನೆ' : 
               language === 'Hindi' ? 'जहाज़ गतिविधि' :
               language === 'Tamil' ? 'கப்பல் செயல்பாடு' : 'Shipping'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>+{prediction.factors.shipping}</div>
        </div>
        
        <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Thermometer size={14} color="var(--accent-danger)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {language === 'Kannada' ? 'ತಾಪಮಾನ' : 
               language === 'Hindi' ? 'तापमान' :
               language === 'Tamil' ? 'வெப்பநிலை' : 'Temperature'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>+{prediction.factors.temperature}</div>
        </div>
      </div>

      {isIncreasing && prediction.futureRisk >= 80 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            marginTop: '12px',
            padding: '10px',
            background: 'rgba(244, 63, 94, 0.2)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={16} color="#f43f5e" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f43f5e' }}>
            {language === 'Kannada' ? 'ತುರ್ತು ಕ್ರಮ ಅಗತ್ಯ' : 
             language === 'Hindi' ? 'तत्काल कार्रवाई आवश्यक' :
             language === 'Tamil' ? 'உடனடி நடவடிக்கை தேவை' : 
             'URGENT ACTION REQUIRED'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
