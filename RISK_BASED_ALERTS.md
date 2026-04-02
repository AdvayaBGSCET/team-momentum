# 🎯 Risk-Based Alert System

## Overview
Alert messages now change based on the location's risk percentage:
- **Risk < 50%**: Green alert - "OK to fish here"
- **Risk ≥ 50%**: Red alert - "Don't fish here"

---

## 🚦 Alert Behavior

### Low Risk (< 50%) - GREEN
- **Color**: Green background and border
- **Icon**: Green pulsing bell
- **Message**: "Safe to fish" / "OK to fish here"
- **Voice**: Positive safety message

### High Risk (≥ 50%) - RED
- **Color**: Red background and border
- **Icon**: Red pulsing bell
- **Message**: "Don't fish here" / "Avoid fishing"
- **Voice**: Warning message

---

## 📊 Current Locations & Risk Levels

| Location | Risk % | Status | Alert Color | Message |
|----------|--------|--------|-------------|---------|
| Mumbai Mahim Creek | 92% | Severe | 🔴 Red | Don't fish |
| Ganga Sagar Mouth | 84% | High | 🔴 Red | Don't fish |
| Chennai Cooum | 78% | High | 🔴 Red | Don't fish |
| Ennore Port | 88% | Severe | 🔴 Red | Don't fish |
| Kochi Backwaters | 65% | Medium | 🔴 Red | Don't fish |
| Godavari | 75% | High | 🔴 Red | Don't fish |
| Krishna | 72% | High | 🔴 Red | Don't fish |
| Indus | 65% | Medium | 🔴 Red | Don't fish |

**Note**: To see green alerts, you need locations with risk < 50%. You can add safer locations to the database or reduce risk values.

---

## 🗣️ Voice Messages by Language & Risk

### English
- **High Risk (≥50)**: "High waste flow in [Location]. Don't fish here."
- **Low Risk (<50)**: "[Location] is safe. OK to fish here."

### Hindi (Mumbai, Ganga, Godavari)
- **High Risk**: "[Location] खाड़ी में कचरा बढ़ गया है। मछली न पकड़ें।"
- **Low Risk**: "[Location] सुरक्षित है। मछली पकड़ सकते हैं।"

### Tamil (Chennai, Ennore)
- **High Risk**: "[Location] கடலில் கழிவு அதிகமாக உள்ளது. மீன்பிடிக்க வேண்டாம்."
- **Low Risk**: "[Location] பாதுகாப்பானது. மீன்பிடிக்கலாம்."

### Kannada (Kochi, Kerala)
- **High Risk**: "[Location] ಕಡಲಲ್ಲಿ ಕೊಳೆ ಜಾಸ್ತಿಯಾಗಿದೆ. ಮೀನು ಹಿಡಿಯಬೇಡಿ."
- **Low Risk**: "[Location] ಸುರಕ್ಷಿತವಾಗಿದೆ. ಮೀನು ಹಿಡಿಯಬಹುದು."

---

## 🎨 UI Changes

### Alert Bar (Bottom of Map)
```
┌─────────────────────────────────────────────────┐
│ 🔴 Live Threat Level (Hindi) - Risk: 92%       │
│ Mumbai Mahim Creek खाड़ी में कचरा बढ़ गया है।   │
│ मछली न पकड़ें।                          🔊      │
└─────────────────────────────────────────────────┘
```

**High Risk (≥50)**:
- Red background: `rgba(244, 63, 94, 0.1)`
- Red border: `1px solid var(--accent-danger)`
- Red pulsing bell icon
- Red speaker button

**Low Risk (<50)**:
- Green background: `rgba(16, 185, 129, 0.1)`
- Green border: `1px solid var(--accent-secondary)`
- Green pulsing bell icon
- Green speaker button

---

## 🧪 Testing

### Test High Risk Alert (Red):
1. Click any current location (all have risk ≥ 65%)
2. See red alert bar
3. Hear "Don't fish" message
4. Console: `🔊 Alert spoken in [Language] for [Location] (Risk: XX%)`

### Test Low Risk Alert (Green):
To test green alerts, add a safe location to database:

```sql
INSERT INTO river_pollution 
(river_name, latitude, longitude, plastic_tonnes, status, risk, 
 plastic_pct, industrial_pct, sewage_pct, other_pct, 
 state, regional_lang, lang_code) 
VALUES
('Goa Beach', 15.48, 73.82, 2000, 'low', 35, 
 15, 10, 8, 2, 
 'Goa', 'Kannada', 'kn-IN');
```

Then:
1. Restart backend
2. Click "Goa Beach" marker
3. See green alert bar
4. Hear "OK to fish here" message

---

## 📱 User Experience

### Scenario 1: High Risk Location (Mumbai - 92%)
```
Fisherman clicks Mumbai marker
↓
Alert Bar: 🔴 RED
Message: "Mumbai Mahim Creek खाड़ी में कचरा बढ़ गया है। मछली न पकड़ें।"
Voice: "Mumbai Mahim Creek खाड़ी में कचरा बढ़ गया है। मछली न पकड़ें।"
Decision: DON'T FISH
```

### Scenario 2: Low Risk Location (Hypothetical - 40%)
```
Fisherman clicks safe location marker
↓
Alert Bar: 🟢 GREEN
Message: "[Location] सुरक्षित है। मछली पकड़ सकते हैं।"
Voice: "[Location] सुरक्षित है। मछली पकड़ सकते हैं।"
Decision: OK TO FISH
```

---

## 🔧 Implementation Details

### Risk Threshold Logic
```javascript
const isSafe = selectedHotspot.risk < 50;

// Alert styling
background: isSafe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'
border: isSafe ? '1px solid var(--accent-secondary)' : '1px solid var(--accent-danger)'

// Message selection
const message = isSafe 
  ? "OK to fish here" 
  : "Don't fish here";
```

### Voice Message Selection
```javascript
if (regionalLang === 'Hindi') {
  text = risk >= 50
    ? `${location} खाड़ी में कचरा बढ़ गया है। मछली न पकड़ें।`
    : `${location} सुरक्षित है। मछली पकड़ सकते हैं।`;
}
```

---

## ✅ Features

- [x] Risk-based color coding (red/green)
- [x] Risk percentage displayed in alert bar
- [x] Different messages for safe vs unsafe locations
- [x] Voice alerts match risk level
- [x] Regional language support maintained
- [x] Pulsing bell icon color changes with risk
- [x] Speaker button color matches alert color

---

The alert system now provides clear, actionable guidance to fishermen based on actual risk levels!
