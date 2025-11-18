# Quick Start Guide

Get started with the Rain Volume Calculator in 5 minutes!

## 1. Get Your API Key (2 minutes)

1. Go to https://openweathermap.org/api
2. Click "Sign Up" (top right)
3. Complete the registration form
4. Check your email and verify your account
5. Log in and go to "API keys" section
6. Copy your default API key

**Important:** It may take a few minutes for your API key to activate after registration.

## 2. Open the Application (30 seconds)

### Option A: Direct File Access
Simply double-click `index.html` to open it in your default browser.

### Option B: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000
```
Then open http://localhost:8000 in your browser.

## 3. Configure the App (30 seconds)

1. Paste your API key in the "OpenWeatherMap API Key" field
2. Click the "Save" button
3. Your key is now saved in your browser's local storage

## 4. Draw Your First Polygon (1 minute)

1. **Locate your area** - Use mouse to pan and zoom on the map
2. **Click the polygon tool** - It's on the left sidebar (pentagon icon)
3. **Draw your region**:
   - Click on the map to add each corner point
   - Continue clicking to outline your area
   - Click the first point again to close the polygon
4. **Alternative**: Use the rectangle tool for quick selection

## 5. Calculate Rain Volume (30 seconds)

1. Check the grid resolution (default: 5 km is good for most areas)
2. Click the green "Calculate Rain Volume" button
3. Wait for the calculation to complete
4. View your results!

## Understanding Your Results

You'll see:
- **Total Rain Volume**: Amount of rain in cubic meters and liters
- **Polygon Area**: Size of your selected region
- **Average Precipitation**: Mean rainfall across all sample points
- **Precipitation Range**: Min and max values detected
- **Sample Points**: Number of locations checked

## Example Result

For a 10 km² area with 5mm of recent rain:
```
Total Rain Volume: 50,000 m³ (50,000,000 liters)
Polygon Area: 10 km² (10,000,000 m²)
Average Precipitation: 5.00 mm
Sample Points: 25
```

## Tips for Best Results

✅ **DO:**
- Start with a small area for your first try
- Use default grid resolution (5 km) initially
- Wait a minute between large calculations
- Check after actual rain events for real data

❌ **DON'T:**
- Don't use resolution < 1 km (too many API calls)
- Don't calculate huge areas (>1000 km²) without increasing resolution
- Don't expect data if there hasn't been recent rain

## Troubleshooting

### "Failed to fetch weather data"
- Check your internet connection
- Verify your API key is correct
- Confirm your API key is activated (wait 10 minutes after registration)

### "No points found within polygon"
- Your grid resolution is too coarse for the polygon size
- Try reducing the grid resolution value (e.g., from 10 km to 3 km)
- Make sure your polygon is large enough (at least 1 km²)

### Results show 0 mm precipitation
- This is normal if there hasn't been rain recently
- The free API only shows current/recent data (last 1-3 hours)
- Try again after a rain event in your selected area

### Calculation is slow
- Reduce the number of sample points by increasing grid resolution
- Draw a smaller polygon
- Check your internet connection speed

## What's Next?

- Read [EXAMPLES.md](EXAMPLES.md) for detailed use cases
- Check [CONFIG.md](CONFIG.md) for optimization tips
- See [README.md](README.md) for complete documentation

## Need Help?

- The free API tier allows 60 calls/minute
- Each sample point = 1 API call
- For a 100 km² area with 5 km resolution ≈ 50-80 calls
- Smaller resolution = more calls but better accuracy

Happy calculating! 🌧️📊
