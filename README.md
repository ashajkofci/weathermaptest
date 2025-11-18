# Rain Volume Calculator

A web application that calculates the volume of precipitation (rain) within a user-defined polygon using OpenWeatherMap and OpenStreetMap.

## Features

- **Interactive Map**: Draw polygons on an OpenStreetMap-powered map using Leaflet.js
- **Precise Calculations**: Uses a configurable grid-based sampling system to calculate rain volume accurately
- **Real-time Weather Data**: Integrates with OpenWeatherMap API for current precipitation data
- **Detailed Results**: Displays total volume in m³ and liters, along with area statistics and precipitation metrics

## How It Works

1. **Polygon Selection**: Users draw a polygon on the map to define the area of interest
2. **Grid Sampling**: The application creates a grid of sample points within the polygon based on the specified resolution
3. **Weather Data Retrieval**: For each grid point, the app fetches current precipitation data from OpenWeatherMap
4. **Volume Calculation**: The average precipitation across all points is multiplied by the total area to calculate volume

### Calculation Formula

```
Volume (m³) = Area (m²) × Average Precipitation (m)
```

The precision of the calculation depends on:
- Grid resolution (smaller = more sample points = more accurate)
- Quality and recency of OpenWeatherMap data
- Polygon size (smaller polygons may need finer resolution)

## Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An OpenWeatherMap API key (free tier available)

### Getting an API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

### Running the Application

This is a static web application that runs entirely in the browser. You have several options:

#### Option 1: Open Locally
Simply open `index.html` in your web browser.

#### Option 2: Use a Local Server (Recommended)

Using Python:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx http-server -p 8000
```

Then navigate to `http://localhost:8000` in your browser.

#### Option 3: Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Select the main branch as source
4. Your app will be available at `https://yourusername.github.io/repositoryname`

## Usage

1. **Enter API Key**: 
   - Paste your OpenWeatherMap API key in the input field
   - Click "Save" to store it locally (uses localStorage)

2. **Draw a Polygon**:
   - Click the polygon drawing tool on the map (left sidebar)
   - Click on the map to add points
   - Complete the polygon by clicking the first point again
   - Alternatively, use the rectangle tool for quick selection

3. **Adjust Settings** (Optional):
   - Set the grid resolution (1-50 km)
   - Smaller values provide more accuracy but take longer to calculate
   - Recommended: 5-10 km for large areas, 1-3 km for small areas

4. **Calculate**:
   - Click "Calculate Rain Volume"
   - Wait for the calculation to complete
   - View results including total volume, area, and precipitation statistics

## Technical Details

### Technologies Used

- **Leaflet.js**: Interactive map library for OpenStreetMap
- **Leaflet Draw**: Plugin for drawing shapes on the map
- **Turf.js**: Geospatial analysis library for area calculations and point-in-polygon tests
- **OpenWeatherMap API**: Real-time weather and precipitation data

### API Endpoints Used

- Current Weather Data API: `https://api.openweathermap.org/data/2.5/weather`

### Data Accuracy Notes

- The free OpenWeatherMap API provides current/recent precipitation data (last 1-3 hours)
- For historical data or forecasts, consider upgrading to premium OpenWeatherMap APIs:
  - One Call API 3.0 (historical + forecast)
  - Historical Weather Data API
- Grid resolution affects both accuracy and API call count (more points = more calls)
- API rate limits apply (60 calls/minute for free tier)

## Limitations

1. **Current Data Only**: Free API tier only provides recent precipitation data, not historical accumulation
2. **Rate Limits**: OpenWeatherMap free tier limits API calls to 60/minute and 1,000,000/month
3. **Grid Approximation**: Results are approximations based on grid sampling, not continuous coverage
4. **Network Dependency**: Requires internet connection to fetch weather data

## Improvements for Production

For a production environment, consider:

1. **Backend Service**: 
   - Implement a server to handle API calls securely
   - Hide API keys from client-side code
   - Cache weather data to reduce API calls

2. **Enhanced Accuracy**:
   - Use OpenWeatherMap's higher-tier APIs for better data
   - Implement interpolation between grid points
   - Support historical data queries

3. **Performance**:
   - Batch API requests more efficiently
   - Implement progressive rendering for large polygons
   - Add polygon size limits or warnings

4. **User Experience**:
   - Add location search functionality
   - Save polygon history
   - Export results to CSV/JSON
   - Add data visualization (heatmaps, charts)

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.