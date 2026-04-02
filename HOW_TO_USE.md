# 🌊 How to Use OceanRaksha AI

## ⚠️ IMPORTANT: Which URL to Open

### ✅ CORRECT - Open the Frontend:
```
http://localhost:5173
```
This is your React app with the full UI, map, and features.

### ❌ WRONG - Don't open the Backend directly:
```
http://localhost:5001  ← This is just the API server!
```
The backend only provides data APIs, not a user interface.

---

## 🚀 Quick Start

### 1. Make sure both servers are running:

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
You should see: `🚀 OceanRaksha API running on http://localhost:5001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
You should see: `➜ Local: http://localhost:5173/`

### 2. Open the app in your browser:
```
http://localhost:5173
```

### 3. Use the app:
1. **Select a language** (English, Kannada, Hindi, Tamil)
2. **Enter your name and phone** (any values work)
3. **Click "Sign In"**
4. **Click on any pollution hotspot marker** on the map
5. **See real-time data and AI advisory**

---

## 🎯 What Each Server Does

### Backend (Port 5001)
- **Purpose**: Provides API endpoints for data
- **URL**: http://localhost:5001
- **What it does**:
  - Serves pollution data from MySQL database
  - Proxies OpenWeatherMap API for sea conditions
  - Proxies CPCB for water quality data
  - Calls Claude AI for fishing advisories
- **What it DOESN'T do**: Show any user interface

### Frontend (Port 5173)
- **Purpose**: The actual web application
- **URL**: http://localhost:5173
- **What it does**:
  - Shows the interactive map
  - Displays pollution hotspots
  - Provides login interface
  - Shows real-time data and advisories
  - Multilingual support

---

## 🧪 Testing the Connection

### Method 1: Check Backend Status
Open in browser:
```
http://localhost:5001/
```
Should show JSON with server status and available endpoints.

### Method 2: Test Frontend Connection
Open in browser:
```
http://localhost:5173/test-connection.html
```
This page automatically tests all API connections.

### Method 3: Check Browser Console
1. Open http://localhost:5173
2. Press F12 (DevTools)
3. Go to Console tab
4. Log in to the app
5. Look for messages like:
   ```
   🌊 Fetching pollution data from backend...
   ✅ Backend response received: 200
   📊 Pollution data: [...]
   ```

---

## 🗺️ Using the Map Features

### View Pollution Hotspots
- Red markers = Severe pollution
- Orange markers = High pollution
- Yellow markers = Medium pollution

### Get Real-Time Advisory
1. Click any marker on the map
2. Wait for data to load (2-3 seconds)
3. See:
   - Current sea temperature
   - Wind speed
   - Water quality (DO, turbidity, pH)
   - AI-generated fishing advisory in your language

### Change Language
- Click language buttons at top right
- Advisory will be generated in selected language

---

## 📊 Available API Endpoints

Test these in your browser or with curl:

### 1. Pollution Data
```
http://localhost:5001/api/pollution
```

### 2. Sea Conditions
```
http://localhost:5001/api/sea-conditions?lat=19.04&lng=72.84
```

### 3. Water Quality
```
http://localhost:5001/api/water-quality/WQMS_KA_001
```

### 4. Fish Data
```
http://localhost:5001/api/fish
```

### 5. Risk Assessment
```
http://localhost:5001/api/risk
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
1. Check both servers are running
2. Make sure you're opening http://localhost:5173 (not 5001)
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### "No data showing on map"
1. Make sure you logged in first
2. Check browser console (F12) for errors
3. Verify database is running:
   ```bash
   mysql -u root -phasish@28 oceanraksha -e "SELECT COUNT(*) FROM river_pollution;"
   ```

### "Markers not clickable"
1. Make sure you're logged in
2. Try clicking directly on the marker icon
3. Check console for JavaScript errors

### "Advisory not loading"
1. Check that Claude API key is set in server/.env
2. Look for errors in backend terminal
3. Check browser Network tab for failed requests

---

## 🎉 Success Checklist

- ✅ Backend running on port 5001
- ✅ Frontend running on port 5173
- ✅ Opening http://localhost:5173 in browser
- ✅ Can log in to the app
- ✅ Can see pollution markers on map
- ✅ Can click markers to see details
- ✅ Real-time data loads when clicking markers

---

## 📞 Need Help?

1. Check browser console (F12) for error messages
2. Check backend terminal for API errors
3. Open http://localhost:5173/test-connection.html to test all endpoints
4. Review CONNECTION_STATUS.md for detailed diagnostics

---

## 🔑 Remember

**Always open the FRONTEND URL:**
```
http://localhost:5173  ← This is your app!
```

**NOT the backend URL:**
```
http://localhost:5001  ← This is just APIs!
```

The backend and frontend are connected through Vite's proxy. You don't need to access the backend directly in your browser.
