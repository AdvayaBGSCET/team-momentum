# 🎤 Regional Voice Alert System

## Overview
Voice alerts now automatically speak in the **regional language of each location**, not the UI language. This makes alerts more accessible to local fishermen.

---

## 🗺️ Location-to-Language Mapping

| Location | State | Regional Language | Voice Code |
|----------|-------|-------------------|------------|
| Mumbai Mahim Creek | Maharashtra | Hindi | hi-IN |
| Ganga Sagar Mouth | West Bengal | Hindi | hi-IN |
| Chennai Cooum | Tamil Nadu | Tamil | ta-IN |
| Kochi Backwaters | Kerala | Kannada | kn-IN |
| Ennore Port | Tamil Nadu | Tamil | ta-IN |
| Godavari | Andhra Pradesh | Hindi | hi-IN |
| Krishna | Andhra Pradesh | Hindi | hi-IN |

---

## 🔊 How It Works

### 1. Location Data Structure
Each location now includes:
```javascript
{
  name: 'Chennai Cooum',
  state: 'Tamil Nadu',
  regionalLang: 'Tamil',  // ← Regional language
  langCode: 'ta-IN',      // ← Voice synthesis code
  lat: 13.06,
  lng: 80.27,
  risk: 78
}
```

### 2. Voice Alert Triggers

#### A. Future Risk Alert (Automatic)
When future risk > 80, voice alert triggers in **location's regional language**:

```javascript
// Mumbai → Hindi
"Mumbai Mahim Creek में अगले 90 दिनों में उच्च जोखिम"

// Chennai → Tamil  
"Chennai Cooum இல் அடுத்த 90 நாட்களில் அதிக ஆபத்து"

// Kochi → Kannada
"Kochi Backwaters ನಲ್ಲಿ ಮುಂದಿನ 90 ದಿನಗಳಲ್ಲಿ ಹೆಚ್ಚಿನ ಅಪಾಯ"
```

#### B. Alert Bar Voice Button (Manual)
Bottom alert bar shows regional language and speaks in it:

```
Live Threat Level (Tamil)  🔊
"Chennai Cooum கடலில் கழிவு அதிகமாக உள்ளது. எச்சரிக்கையாக இருக்கவும்."
```

---

## 🎯 User Experience

### Scenario 1: Fisherman in Chennai
1. Opens app (UI can be in any language - English/Kannada/Hindi/Tamil)
2. Clicks "Chennai Cooum" marker
3. Hears alert in **Tamil** (regional language)
4. Alert bar shows: "Live Threat Level (Tamil)"
5. Voice speaks: "Chennai Cooum கடலில் கழிவு அதிகமாக உள்ளது"

### Scenario 2: Fisherman in Mumbai
1. Opens app (UI in English)
2. Clicks "Mumbai Mahim Creek" marker
3. Hears alert in **Hindi** (regional language)
4. Alert bar shows: "Live Threat Level (Hindi)"
5. Voice speaks: "Mumbai Mahim Creek खाड़ी में कचरा बढ़ गया है"

### Scenario 3: Fisherman in Kochi
1. Opens app (UI in Tamil)
2. Clicks "Kochi Backwaters" marker
3. Hears alert in **Kannada** (regional language, not Tamil UI)
4. Alert bar shows: "Live Threat Level (Kannada)"
5. Voice speaks: "Kochi Backwaters ಕಡಲಲ್ಲಿ ಕೊಳೆ ಜಾಸ್ತಿಯಾಗಿದೆ"

---

## 🔄 Database Integration

### Updated Schema
```sql
ALTER TABLE river_pollution 
ADD COLUMN state VARCHAR(100) DEFAULT NULL,
ADD COLUMN regional_lang VARCHAR(50) DEFAULT 'English',
ADD COLUMN lang_code VARCHAR(10) DEFAULT 'en-IN';
```

### Sample Data
```sql
INSERT INTO river_pollution (..., state, regional_lang, lang_code) VALUES
('Chennai Cooum', 13.06, 80.27, 12000, 'high', 78, 45, 32, 18, 5, 
 'Tamil Nadu', 'Tamil', 'ta-IN');
```

### Frontend Mapping
When fetching from database, the app automatically maps:
```javascript
{
  name: item.river_name,
  state: item.state,
  regionalLang: item.regional_lang,
  langCode: item.lang_code
}
```

If database doesn't have language data, it auto-detects from location name:
- Contains "mumbai/mahim/ganga" → Hindi
- Contains "chennai/cooum/ennore" → Tamil
- Contains "kochi/kerala/mangalore/karnataka" → Kannada

---

## ✅ Benefits

1. **Accessibility**: Local fishermen hear alerts in their native language
2. **Automatic**: No manual language selection needed per location
3. **Realistic**: Matches real-world regional language distribution
4. **Consistent**: Same location always speaks same language
5. **Independent**: UI language ≠ Voice language (UI can be English, voice in Tamil)

---

## 🧪 Testing

### Test Regional Voices:
1. Start the app: `npm run dev`
2. Login and click different markers:
   - Mumbai → Hear Hindi
   - Chennai → Hear Tamil
   - Kochi → Hear Kannada
3. Check console: `🔊 Voice alert in Tamil for Chennai Cooum`
4. Click speaker button in alert bar → Hears regional language

### Update Database:
```bash
cd server
mysql -u root -p oceanraksha < schema.sql
```

---

## 🎯 Voice Alert Messages by Language

### English
"High invasion risk expected in next 90 days at [Location]"

### Hindi (Mumbai, Ganga, Godavari)
"[Location] में अगले 90 दिनों में उच्च जोखिम"

### Tamil (Chennai, Ennore)
"[Location] இல் அடுத்த 90 நாட்களில் அதிக ஆபத்து"

### Kannada (Kochi, Kerala coast)
"[Location] ನಲ್ಲಿ ಮುಂದಿನ 90 ದಿನಗಳಲ್ಲಿ ಹೆಚ್ಚಿನ ಅಪಾಯ"

---

The system is now fully regional - each coastal location speaks in its local language automatically!
