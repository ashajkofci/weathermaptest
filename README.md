# Rain Volume Calculator

Calculate rainfall volume over any area on a map. Draw a polygon, hit calculate, and get precise volume estimates in cubic hectometres.

## What it does

Draw shapes on a map and get rainfall measurements for that exact area. Uses OpenWeatherMap data with a smart grid sampling system that automatically adjusts based on polygon size.

The app samples multiple points across your polygon, fetches precipitation data for each, then uses inverse distance weighting to interpolate between points. This gives you way better accuracy than just averaging a few random spots.

Sample points show up as colored circles so you can see where the data's coming from. Blue intensity indicates precipitation levels.

## Calculation method

Volume calculation uses numerical integration over a fine mesh grid (4x denser than sample points). Each integration cell checks if it's inside your polygon, interpolates the precipitation value at that point using IDW, then adds up all the tiny volumes.

Grid resolution auto-adjusts:
- Small areas (<1000 km²): 8 km spacing
- Larger areas: 20 km spacing
- Max supported: 20,000 km²

If the initial grid doesn't catch any points (can happen with weird polygon shapes), it automatically halves the resolution until it finds some.

## Quick start

You need an OpenWeatherMap API key. Free tier works fine.

1. Get your key at [openweathermap.org/api](https://openweathermap.org/api)
2. Open `index.html` in a browser (or run a local server)
3. Paste your API key and save it
4. Draw a polygon on the map
5. Click "Calculate Rain Volume"

That's it. Results show up below the map with a forecast chart.

### Running it properly

Just opening the HTML file works, but a local server is better:

```bash
# Python
python -m http.server 8000

# Node
npx http-server -p 8000
```

Or push to GitHub and enable Pages in repo settings.

## Using the app

**Search locations**: Type a city name to jump there on the map.

**Draw polygons**: Use the tools on the left. Polygon tool lets you click points, rectangle is faster for simple boxes. Only one polygon at a time - drawing a new one removes the old.

**Precipitation overlay**: Toggle this to see a precipitation layer. It's coarse but helps you spot weather patterns. Gets a bit sharper after you run a calculation.

**Calculate**: Button lights up once you draw a polygon. Takes a few seconds depending on size (more sample points = longer wait). Progress shows in the loading spinner.

**Sample points**: After calculation, colored dots appear showing where data was pulled from. Click them to see exact precipitation values.

**Forecast chart**: Shows next 48 hours in 3-hour chunks. Two bars per time slot - precipitation in mm and volume in m³ for your polygon.

## Technical Details

### Technologies Used

- **Leaflet.js**: Interactive map library for OpenStreetMap
- **Leaflet Draw**: Plugin for drawing shapes on the map
- **Turf.js**: Geospatial analysis library for area calculations and point-in-polygon tests
- **OpenWeatherMap API**: Real-time weather and precipitation data

### API Endpoints Used

- **Weather Maps API 1.0**: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png` (Precipitation overlay layer)
- **Current Weather Data API**: `https://api.openweathermap.org/data/2.5/weather` (Point-specific precipitation data)

### Data Accuracy Notes

- The application uses OpenWeatherMap's free Current Weather API
- Weather Maps API 1.0 provides visual precipitation overlays for context
- Current/recent precipitation data (last 1-3 hours) is displayed
- Grid resolution affects both accuracy and API call count (more points = more calls)
- API rate limits apply (60 calls/minute for free tier)

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.