const LANG_NAMES = { en: 'English', kn: 'Kannada', hi: 'Hindi', ta: 'Tamil' };

export async function generateFishermanAdvisory(location, weatherData, waterData, lang = 'en') {
  const langName = LANG_NAMES[lang] || 'English';

  const dataBlock = `
Location: ${location.name}, ${location.state || 'India'}
Coordinates: ${location.lat}°N, ${location.lng}°E
Date: ${new Date().toLocaleDateString('en-IN')}

LIVE SEA CONDITIONS (${weatherData.source}):
- Sea surface temperature: ${weatherData.temp ?? 'unavailable'}°C
- Wind speed: ${weatherData.windSpeed ?? 'unavailable'} m/s
- Conditions: ${weatherData.description ?? 'unavailable'}

WATER QUALITY - NEAREST RIVER MOUTH (${waterData.source}):
- Dissolved oxygen: ${waterData.do ?? 'unavailable'} mg/L (safe fishing threshold: >5.0 mg/L)
- Turbidity: ${waterData.turbidity ?? 'unavailable'} NTU (safe threshold: <5 NTU)
- pH: ${waterData.ph ?? 'unavailable'} (safe range: 6.5-8.5)
- BOD: ${waterData.bod ?? 'unavailable'} mg/L (safe threshold: <3 mg/L)
${waterData.isReal ? '(All values from live government sensors)' : `(Note: ${waterData.note || 'Reference values'})`}
`;

  const prompt = `You are OceanRaksha AI, a marine safety advisor for Indian fishermen.

LIVE DATA:
${dataBlock}

Generate a fishing safety advisory in ${langName} for today.

Respond ONLY with this exact JSON structure:
{
  "decision": "GO_FISHING" or "AVOID" or "CAUTION",
  "decision_reason": "1 sentence explaining the specific data values that drove this decision",
  "advisory_text": "The actual advisory in ${langName} language — 2-3 sentences — use the real numbers from the data above",
  "safe_zones": "brief description of safer nearby zones if AVOID or CAUTION",
  "return_time": "estimated time conditions may improve if AVOID, or null if GO_FISHING",
  "data_quality": "real" or "estimated",
  "key_risk": "the single most important risk factor for this location today"
}

Critical rules:
- Include the actual measured numbers (DO, turbidity etc) in the advisory_text
- If DO < 5.0, always flag as CAUTION or AVOID
- If advisory_text is in Kannada, use Kannada script
- Never give generic advice — every advisory must reference the specific data values`;

  // Use backend proxy to avoid CORS and keep API key secure
  try {
    const r = await fetch('/api/advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        location, 
        weatherData, 
        waterData, 
        lang,
        prompt 
      })
    });
    
    if (r.ok) {
      return await r.json();
    }
    
    throw new Error('Advisory API failed');
  } catch (error) {
    console.error('Claude API error:', error);
    
    // Fallback advisory
    return {
      decision: 'CAUTION',
      advisory_text: lang === 'kn'
        ? 'ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳೀಯ ಮೀನುಗಾರಿಕೆ ಇಲಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'
        : 'Advisory temporarily unavailable. Contact local fisheries department.',
      data_quality: 'unavailable',
      decision_reason: 'Unable to generate advisory due to API unavailability',
      key_risk: 'Unknown - data unavailable'
    };
  }
}
