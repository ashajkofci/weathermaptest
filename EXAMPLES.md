# Usage Examples

This document provides step-by-step examples of how to use the Rain Volume Calculator.

## Example 1: Calculate Rain Volume for Central Park, New York

### Step 1: Setup
1. Open the application in your web browser
2. Enter your OpenWeatherMap API key and click "Save"

### Step 2: Navigate to Central Park
1. The map starts at New York City by default
2. Zoom in to Central Park (use mouse wheel or zoom controls)
3. Center the map on the park

### Step 3: Draw the Polygon
1. Click the polygon tool (pentagon icon) on the left side of the map
2. Click points around the perimeter of Central Park
3. Close the polygon by clicking the first point again
4. Alternatively, use the rectangle tool for a quick approximation

### Step 4: Configure Settings
1. For an area like Central Park (~3.4 km²), set Grid Resolution to 2-3 km
2. This will create approximately 10-20 sample points

### Step 5: Calculate
1. Click "Calculate Rain Volume"
2. Wait for the calculation to complete (typically 10-30 seconds)
3. View results showing:
   - Total rain volume in m³ and liters
   - Polygon area in km² and m²
   - Average precipitation in mm
   - Number of sample points used

### Example Results
If there's been 5mm of rain recently:
- Area: 3.41 km² (3,410,000 m²)
- Average Precipitation: 5 mm (0.005 m)
- **Total Volume: 17,050 m³ (17,050,000 liters)**

---

## Example 2: Compare Rain Between Two Neighborhoods

### Use Case
Compare recent rainfall between Manhattan and Brooklyn.

### Steps
1. Draw a polygon around Manhattan
2. Click "Calculate Rain Volume" and note the results
3. Delete the polygon (trash icon in edit tools)
4. Draw a new polygon around Brooklyn
5. Click "Calculate Rain Volume"
6. Compare the average precipitation values

### Tips
- Use consistent grid resolution for fair comparison
- Larger areas may need higher grid resolution values (5-10 km)
- Take screenshots of results for later comparison

---

## Example 3: Analyze Rainfall for Agricultural Planning

### Use Case
A farmer wants to know how much rain fell on their 50 km² farmland.

### Recommended Settings
- Grid Resolution: 3-5 km
- This provides good coverage without too many API calls

### Calculation
If the farm received 10mm of rain:
- Area: 50 km² (50,000,000 m²)
- Precipitation: 10 mm (0.01 m)
- **Volume: 500,000 m³ (500,000,000 liters)**

This is equivalent to:
- 500,000 cubic meters of water
- 200 Olympic swimming pools (each ~2,500 m³)
- Enough to fill a 1-hectare reservoir to 50 meters depth

---

## Example 4: Storm Analysis for Urban Planning

### Use Case
City planners need to estimate drainage requirements for a new development area.

### Steps
1. Draw polygon around the planned development area
2. Set Grid Resolution to 1-2 km for high precision
3. Calculate rain volume for current conditions
4. Use the results to estimate drainage system capacity needs

### Considerations
- Run calculations after different weather events (light rain, heavy storms)
- Document maximum observed precipitation values
- Plan drainage for 2x-3x the typical rain volume for safety

---

## Tips for Best Results

### Choosing Grid Resolution
- **Small polygons (<5 km²)**: Use 1-2 km resolution
- **Medium polygons (5-50 km²)**: Use 3-5 km resolution
- **Large polygons (>50 km²)**: Use 5-10 km resolution

### Understanding the Data
- The app uses **current/recent** precipitation data (last 1-3 hours)
- For historical analysis, you need OpenWeatherMap's premium APIs
- Data accuracy depends on weather station coverage in your area

### API Rate Limits
- Free tier: 60 calls/minute
- Each sample point = 1 API call
- A 100 km² area with 5 km resolution ≈ 50-80 API calls
- Wait a minute between large calculations to avoid rate limits

### Precision vs Performance
- More sample points = higher accuracy but slower calculation
- For most use cases, 5 km resolution is sufficient
- Use 1-2 km only when high precision is critical

---

## Common Issues and Solutions

### Issue: "No points found within polygon"
**Solution:** Increase the grid resolution value (e.g., from 1 km to 5 km)

### Issue: Calculation takes too long
**Solution:** Increase grid resolution to reduce sample points, or draw a smaller polygon

### Issue: Results show 0 mm precipitation
**Solution:** This means no rain was detected recently. The free API only shows current/recent data.

### Issue: API error or timeout
**Solution:** Check your API key, verify internet connection, and ensure you haven't exceeded rate limits

---

## Advanced Use Cases

### Time Series Analysis
To track rain over time:
1. Save your polygon coordinates
2. Run calculations at regular intervals (hourly/daily)
3. Record results in a spreadsheet
4. Analyze trends over time

### Multiple Region Comparison
1. Create a table with region names
2. Draw each region's polygon
3. Record results for each region
4. Compare precipitation patterns across regions

### Integration with Other Tools
Export polygon coordinates and results for use in:
- GIS software (QGIS, ArcGIS)
- Spreadsheet analysis (Excel, Google Sheets)
- Custom reporting tools
