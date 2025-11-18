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

## Building Desktop Applications

The app can be packaged as a portable desktop application for Windows and macOS using Electron.

### Prerequisites

- Node.js (version 18 or later)
- npm

### Local Build

Install dependencies:
```bash
npm install
```

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
# Windows only (creates portable .exe)
npm run build:win

# macOS only (creates .zip with .app)
npm run build:mac

# Both platforms
npm run build:all
```

The built applications will be in the `dist/` directory.

**Important**: The builds create portable applications that don't require installation:
- **Windows**: A single portable `.exe` file that can be run directly
- **macOS**: A `.zip` file containing the `.app` bundle - extract and run

### Running the Desktop App

To run the app in development mode:
```bash
npm start
```

### GitHub Actions Build

The repository includes a GitHub Actions workflow that automatically builds portable executables for Windows and macOS:

1. **Automatic builds on tags**: When you push a tag starting with `v` (e.g., `v1.0.0`), the workflow builds executables and creates a GitHub release.

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Manual builds**: You can trigger a build manually from the Actions tab in GitHub by selecting "Build and Release" and clicking "Run workflow".

The workflow creates:
- **Windows**: Portable `.exe` (no installation required)
- **macOS**: `.zip` file containing the `.app` bundle (supports both Intel and Apple Silicon)

Built executables are uploaded as artifacts and attached to the GitHub release if triggered by a tag.

## Using the app

**Search locations**: Type a city name to jump there on the map.

**Draw polygons**: Use the tools on the left. Polygon tool lets you click points, rectangle is faster for simple boxes. Only one polygon at a time - drawing a new one removes the old.

**Precipitation overlay**: Toggle this to see a precipitation layer. It's coarse but helps you spot weather patterns. Gets a bit sharper after you run a calculation.

**Calculate**: Button lights up once you draw a polygon. Takes a few seconds depending on size (more sample points = longer wait). Progress shows in the loading spinner.

**Sample points**: After calculation, colored dots appear showing where data was pulled from. Click them to see exact precipitation values.

**Forecast chart**: Shows next 48 hours in 3-hour chunks. Two bars per time slot - precipitation in mm and volume in m³ for your polygon.

## Stack

- Leaflet + Leaflet.Draw for the map stuff
- Turf.js for geometry (area calc, point-in-polygon checks)
- Chart.js for forecast visualization
- OpenWeatherMap API for data
- Vanilla JS, no framework bloat

## API usage

Uses two OpenWeatherMap endpoints:

1. **Current Weather API** (`/data/2.5/weather`) - Gets precipitation for each sample point. Returns `rain.1h` field with mm in the last hour.

2. **Forecast API** (`/data/2.5/forecast`) - Pulls 48-hour forecast for the chart. Free tier gives 3-hour intervals.

3. **Precipitation tiles** (`/map/precipitation_new/{z}/{x}/{y}.png`) - Visual overlay. Maps API 1.0, works on free tier.

4. **Geocoding API** (`/geo/1.0/direct`) - Location search.

Free tier limits: 60 calls/min, 1M/month. Small polygons use ~10-50 calls per calculation. Big ones can hit a few hundred.

Rate limiting built in - 100ms delay between point queries to stay under limits.

## License

MIT