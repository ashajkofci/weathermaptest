// Rain Volume Calculator App
class RainVolumeCalculator {
    constructor() {
        this.map = null;
        this.drawnItems = null;
        this.currentPolygon = null;
        this.apiKey = localStorage.getItem('openweathermap_api_key') || '';
        this.precipitationLayer = null;
        this.overlayVisible = false;
        this.forecastChart = null;
        this.samplePointsLayer = null;
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.initDrawControls();
        this.initEventListeners();
        this.loadApiKey();
    }
    
    initMap() {
        // Initialize the map centered on a default location
        this.map = L.map('map').setView([40.7128, -74.0060], 10); // New York as default
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);
        
        // Initialize feature group for drawn items
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
    }
    
    initDrawControls() {
        // Configure draw control options
        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    metric: true
                },
                polyline: false,
                rectangle: true,
                circle: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: this.drawnItems,
                remove: true
            }
        });
        
        this.map.addControl(drawControl);
        
        // Handle polygon creation
        this.map.on(L.Draw.Event.CREATED, (event) => {
            const layer = event.layer;
            
            // Remove previous polygon if exists
            this.drawnItems.clearLayers();
            
            this.drawnItems.addLayer(layer);
            this.currentPolygon = layer;
            
            // Enable calculate button
            document.getElementById('calculate-btn').disabled = false;
        });
        
        // Handle polygon deletion
        this.map.on(L.Draw.Event.DELETED, () => {
            this.currentPolygon = null;
            document.getElementById('calculate-btn').disabled = true;
            this.hideResults();
            this.hideForecastChart();
            
            // Remove sample points layer
            if (this.samplePointsLayer) {
                this.map.removeLayer(this.samplePointsLayer);
                this.samplePointsLayer = null;
            }
        });
    }
    
    initEventListeners() {
        document.getElementById('save-api-key').addEventListener('click', () => {
            this.saveApiKey();
        });
        
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateRainVolume();
        });
        
        document.getElementById('toggle-overlay-btn').addEventListener('click', () => {
            this.togglePrecipitationOverlay();
        });
        
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchLocation();
        });
        
        // Allow Enter key to save API key
        document.getElementById('api-key').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });
        
        // Allow Enter key to search location
        document.getElementById('location-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });
    }
    
    loadApiKey() {
        if (this.apiKey) {
            document.getElementById('api-key').value = this.apiKey;
            // Enable overlay button and search button if API key exists
            document.getElementById('toggle-overlay-btn').disabled = false;
            document.getElementById('search-btn').disabled = false;
        }
    }
    
    saveApiKey() {
        const apiKeyInput = document.getElementById('api-key');
        this.apiKey = apiKeyInput.value.trim();
        
        if (this.apiKey) {
            localStorage.setItem('openweathermap_api_key', this.apiKey);
            this.showNotification('API key saved successfully!', 'success');
            
            // Enable overlay button and search button when API key is saved
            document.getElementById('toggle-overlay-btn').disabled = false;
            document.getElementById('search-btn').disabled = false;
        } else {
            this.showNotification('Please enter a valid API key', 'error');
        }
    }
    
    showNotification(message, type) {
        // Simple notification - could be enhanced with a proper notification library
        alert(message);
    }
    
    async searchLocation() {
        const searchInput = document.getElementById('location-search');
        const query = searchInput.value.trim();
        
        if (!query) {
            this.showNotification('Please enter a location to search', 'error');
            return;
        }
        
        if (!this.apiKey) {
            this.showNotification('Please enter your OpenWeatherMap API key first', 'error');
            return;
        }
        
        try {
            // Using OpenWeatherMap Geocoding API
            const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch location data');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                this.showNotification('Location not found. Please try a different search term.', 'error');
                return;
            }
            
            const location = data[0];
            
            // Center map on the found location
            this.map.setView([location.lat, location.lon], 12);
            
            // Add a temporary marker
            const marker = L.marker([location.lat, location.lon]).addTo(this.map);
            marker.bindPopup(`${location.name}${location.state ? ', ' + location.state : ''}${location.country ? ', ' + location.country : ''}`).openPopup();
            
            // Remove marker after 5 seconds
            setTimeout(() => {
                this.map.removeLayer(marker);
            }, 5000);
            
        } catch (error) {
            console.error('Error searching location:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }
    
    togglePrecipitationOverlay() {
        if (this.overlayVisible) {
            this.hidePrecipitationOverlay();
        } else {
            this.showPrecipitationOverlay();
        }
    }
    
    showPrecipitationOverlay(opacity = 0.5) {
        if (!this.apiKey) {
            this.showNotification('Please enter your OpenWeatherMap API key first', 'error');
            return;
        }
        
        // Remove existing layer if present
        if (this.precipitationLayer) {
            this.map.removeLayer(this.precipitationLayer);
        }
        
        // Using OpenWeatherMap Maps API 1.0 - Precipitation layer
        // This is more cost-effective than multiple point queries
        this.precipitationLayer = L.tileLayer(
            `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${this.apiKey}`,
            {
                attribution: 'OpenWeatherMap',
                opacity: opacity,
                maxZoom: 18
            }
        );
        
        this.precipitationLayer.addTo(this.map);
        this.overlayVisible = true;
        
        // Update button state
        const btn = document.getElementById('toggle-overlay-btn');
        btn.textContent = 'Hide Precipitation Overlay';
        btn.classList.add('active');
    }
    
    hidePrecipitationOverlay() {
        if (this.precipitationLayer) {
            this.map.removeLayer(this.precipitationLayer);
            this.precipitationLayer = null;
        }
        
        this.overlayVisible = false;
        
        // Update button state
        const btn = document.getElementById('toggle-overlay-btn');
        btn.textContent = 'Show Precipitation Overlay';
        btn.classList.remove('active');
    }
    
    updatePrecipitationOverlay(opacity = 0.7) {
        // Update overlay with higher resolution after calculation
        if (this.overlayVisible) {
            this.showPrecipitationOverlay(opacity);
        }
    }
    
    async calculateRainVolume() {
        if (!this.currentPolygon) {
            this.showNotification('Please draw a polygon on the map first', 'error');
            return;
        }
        
        if (!this.apiKey) {
            this.showNotification('Please enter your OpenWeatherMap API key first', 'error');
            return;
        }
        
        this.showLoading(true);
        this.hideResults();
        this.hideForecastChart();
        
        try {
            // Get polygon coordinates
            const latlngs = this.currentPolygon.getLatLngs()[0];
            const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
            coordinates.push(coordinates[0]); // Close the polygon
            
            // Create GeoJSON polygon
            const polygon = turf.polygon([coordinates]);
            
            // Calculate polygon area in square meters
            const area = turf.area(polygon);
            const areaKm2 = area / 1_000_000;
            
            // Auto-adjust grid resolution based on polygon size
            let gridResolution;
            if (areaKm2 < 20) {
                gridResolution = 1.5;
            } else if (areaKm2 <= 200) {
                gridResolution = 2;
            } else if (areaKm2 <= 1000) {
                gridResolution = 5;
            } else if (areaKm2 <= 2000) {
                gridResolution = 8;
            } else if (areaKm2 <= 20000) {
                gridResolution = 20;
            } else {
                throw new Error(`Polygon too large (${areaKm2.toFixed(2)} km²). Maximum supported area is 20,000 km².`);
            }
            
            // Update grid resolution display
            document.getElementById('grid-resolution').value = gridResolution;
            
            // Get bounding box
            const bbox = turf.bbox(polygon);
            const center = turf.center(polygon);
            const centerCoords = center.geometry.coordinates;
            
            // Fetch precipitation data for the area
            const precipitationData = await this.fetchPrecipitationData(bbox, polygon, gridResolution);
            
            // Display sampled points on the map
            this.displaySamplePoints(precipitationData);
            
            // Calculate total rain volume
            const results = this.calculateVolume(precipitationData, area, polygon, gridResolution);
            
            // Display results
            this.displayResults(results);
            
            // Fetch and display hourly forecast
            await this.fetchAndDisplayForecast(centerCoords[1], centerCoords[0], area);
            
            // Update precipitation overlay with actual resolution after calculation
            this.updatePrecipitationOverlay(0.7);
            
        } catch (error) {
            console.error('Error calculating rain volume:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async fetchPrecipitationData(bbox, polygon, gridResolutionKm) {
        // Create a grid of points within the bounding box
        const [minLng, minLat, maxLng, maxLat] = bbox;
        
        let currentResolution = gridResolutionKm;
        let points = [];
        
        // Try progressively smaller resolutions if no points are found
        while (points.length === 0 && currentResolution >= 1) {
            // Convert grid resolution from km to degrees (approximate)
            const gridResolutionDeg = currentResolution / 111; // 1 degree ≈ 111 km
            
            points = [];
            
            for (let lat = minLat; lat <= maxLat; lat += gridResolutionDeg) {
                for (let lng = minLng; lng <= maxLng; lng += gridResolutionDeg) {
                    const point = turf.point([lng, lat]);
                    
                    // Check if point is inside polygon
                    if (turf.booleanPointInPolygon(point, polygon)) {
                        points.push({ lat, lng });
                    }
                }
            }
            
            if (points.length === 0) {
                // Reduce resolution and try again
                currentResolution = Math.floor(currentResolution / 2);
                if (currentResolution < 1) currentResolution = 1;
                
                console.log(`No points found with ${gridResolutionKm} km resolution. Trying ${currentResolution} km...`);
            }
        }
        
        if (points.length === 0) {
            throw new Error('No points found within polygon even with 1 km resolution. Polygon may be too small.');
        }
        
        // Update the grid resolution display if it changed
        if (currentResolution !== gridResolutionKm) {
            document.getElementById('grid-resolution').value = currentResolution;
            console.log(`Adjusted grid resolution from ${gridResolutionKm} km to ${currentResolution} km to ensure sample points.`);
        }
        
        // Fetch weather data for each point
        // Note: OpenWeatherMap has rate limits, so we'll batch requests
        const precipitationData = [];
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            
            try {
                const data = await this.fetchWeatherForPoint(point.lat, point.lng);
                precipitationData.push({
                    lat: point.lat,
                    lng: point.lng,
                    precipitation: data.precipitation || 0
                });
                
                // Rate limiting: small delay between requests
                if (i < points.length - 1) {
                    await this.sleep(100); // 100ms delay
                }
            } catch (error) {
                console.warn(`Failed to fetch weather for point ${point.lat}, ${point.lng}:`, error);
                // Use 0 precipitation if request fails
                precipitationData.push({
                    lat: point.lat,
                    lng: point.lng,
                    precipitation: 0
                });
            }
        }
        
        return precipitationData;
    }
    
    async fetchWeatherForPoint(lat, lng) {
        // Using OpenWeatherMap Current Weather API (free tier)
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        
        // Extract precipitation data
        // rain.1h: Rain volume for last hour in mm
        // rain.3h: Rain volume for last 3 hours in mm
        let precipitation = 0;
        
        if (data.rain) {
            precipitation = data.rain['1h'] || data.rain['3h'] || 0;
        }
        
        // If no recent rain data, check snow
        if (precipitation === 0 && data.snow) {
            precipitation = data.snow['1h'] || data.snow['3h'] || 0;
        }
        
        return {
            precipitation: precipitation, // in mm
            weather: data.weather[0]?.description || 'N/A',
            temp: data.main?.temp || 0
        };
    }
    
    calculateVolume(precipitationData, totalArea, polygon, gridResolutionKm) {
        // Use integration with linear interpolation between grid points
        // We'll use a finer resolution mesh for integration
        
        const gridResolutionDeg = gridResolutionKm / 111; // Convert km to degrees
        
        // Create a 2D grid for interpolation
        const bbox = turf.bbox(polygon);
        const [minLng, minLat, maxLng, maxLat] = bbox;
        
        // Build a map of precipitation values at grid points
        const precipMap = new Map();
        precipitationData.forEach(point => {
            const key = `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
            precipMap.set(key, point.precipitation);
        });
        
        // Function to interpolate precipitation at any point using inverse distance weighting
        const interpolatePrecipitation = (lat, lng) => {
            // Find nearby grid points
            const nearbyPoints = precipitationData.map(point => {
                const distance = Math.sqrt(
                    Math.pow(lat - point.lat, 2) + Math.pow(lng - point.lng, 2)
                );
                return { ...point, distance };
            }).sort((a, b) => a.distance - b.distance);
            
            // Use inverse distance weighting (IDW) interpolation
            // Take the 4 nearest points
            const k = Math.min(4, nearbyPoints.length);
            const nearest = nearbyPoints.slice(0, k);
            
            // If we're very close to a sample point, use its value
            if (nearest[0].distance < 0.0001) {
                return nearest[0].precipitation;
            }
            
            // Calculate weights based on inverse distance squared
            let weightedSum = 0;
            let weightTotal = 0;
            
            nearest.forEach(point => {
                const weight = 1 / (point.distance * point.distance + 0.0001); // Add small epsilon to avoid division by zero
                weightedSum += point.precipitation * weight;
                weightTotal += weight;
            });
            
            return weightedSum / weightTotal;
        };
        
        // Perform numerical integration using a finer grid
        // Use integration resolution of 1/4 of the sampling resolution
        const integrationResolutionDeg = gridResolutionDeg / 4;
        
        let totalVolume = 0;
        let numCells = 0;
        
        // Integrate over the polygon using rectangular cells
        for (let lat = minLat; lat < maxLat; lat += integrationResolutionDeg) {
            for (let lng = minLng; lng < maxLng; lng += integrationResolutionDeg) {
                // Check if the center of this cell is inside the polygon
                const cellCenterLat = lat + integrationResolutionDeg / 2;
                const cellCenterLng = lng + integrationResolutionDeg / 2;
                
                const point = turf.point([cellCenterLng, cellCenterLat]);
                
                if (turf.booleanPointInPolygon(point, polygon)) {
                    // Calculate the area of this cell in square meters
                    const cellPolygon = turf.polygon([[
                        [lng, lat],
                        [lng + integrationResolutionDeg, lat],
                        [lng + integrationResolutionDeg, lat + integrationResolutionDeg],
                        [lng, lat + integrationResolutionDeg],
                        [lng, lat]
                    ]]);
                    const cellArea = turf.area(cellPolygon);
                    
                    // Interpolate precipitation at the cell center
                    const precipitation = interpolatePrecipitation(cellCenterLat, cellCenterLng);
                    
                    // Add to total volume (precipitation in mm, convert to m)
                    totalVolume += cellArea * (precipitation / 1000);
                    numCells++;
                }
            }
        }
        
        // Calculate statistics
        const avgPrecipitation = precipitationData.reduce((sum, p) => sum + p.precipitation, 0) / precipitationData.length;
        const maxPrecipitation = Math.max(...precipitationData.map(p => p.precipitation));
        const minPrecipitation = Math.min(...precipitationData.map(p => p.precipitation));
        
        return {
            volumeM3: totalVolume,
            volumeLiters: totalVolume * 1000,
            volumeHm3: totalVolume / 1_000_000, // 1 hm³ = 1,000,000 m³
            areaM2: totalArea,
            areaKm2: totalArea / 1_000_000,
            avgPrecipitationMm: avgPrecipitation,
            maxPrecipitationMm: maxPrecipitation,
            minPrecipitationMm: minPrecipitation,
            numSamplePoints: precipitationData.length,
            numIntegrationCells: numCells,
            gridResolutionKm: gridResolutionKm,
            integrationResolutionKm: (integrationResolutionDeg * 111).toFixed(2)
        };
    }
    
    async fetchAndDisplayForecast(lat, lng, areaM2) {
        try {
            // Using OpenWeatherMap 5 Day / 3 Hour Forecast API (free tier)
            // Note: Hourly forecast requires a paid subscription, so we use the free 3-hour forecast
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            
            const data = await response.json();
            
            // Extract forecast data for the next 48 hours (16 data points * 3 hours each)
            const forecastData = data.list.slice(0, 16);
            
            const labels = [];
            const precipitationMm = [];
            const volumeHm3 = [];
            
            forecastData.forEach(item => {
                const date = new Date(item.dt * 1000);
                labels.push(date.toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit',
                    hour12: false
                }));
                
                // Get precipitation in mm for the 3-hour period
                let precip = 0;
                if (item.rain && item.rain['3h']) {
                    precip = item.rain['3h'];
                } else if (item.snow && item.snow['3h']) {
                    precip = item.snow['3h'];
                }
                
                precipitationMm.push(precip);
                
                // Calculate volume for this period in hm³
                const volumeM3 = (areaM2 * precip) / 1000; // Convert mm to m
                const volumeHm3Value = volumeM3 / 1_000_000; // Convert m³ to hm³
                volumeHm3.push(volumeHm3Value);
            });
            
            this.displayForecastChart(labels, precipitationMm, volumeHm3);
            
        } catch (error) {
            console.error('Error fetching forecast:', error);
            // Don't show error to user for forecast - it's a bonus feature
        }
    }
    
    displayForecastChart(labels, precipitationMm, volumeHm3) {
        const chartDiv = document.getElementById('forecast-chart');
        const ctx = document.getElementById('rain-chart');
        
        // Destroy existing chart if it exists
        if (this.forecastChart) {
            this.forecastChart.destroy();
        }
        
        // Create new chart
        this.forecastChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Precipitation (mm per 3h)',
                    data: precipitationMm,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                }, {
                    label: 'Volume (hm³ per 3h)',
                    data: volumeHm3,
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date & Time'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Precipitation (mm per 3h)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Volume (hm³ per 3h)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
        
        chartDiv.style.display = 'block';
    }
    
    hideForecastChart() {
        document.getElementById('forecast-chart').style.display = 'none';
    }
    
    displaySamplePoints(precipitationData) {
        // Remove existing sample points layer if present
        if (this.samplePointsLayer) {
            this.map.removeLayer(this.samplePointsLayer);
        }
        
        // Create a feature group for sample points
        this.samplePointsLayer = L.featureGroup();
        
        // Add circle markers for each sample point
        precipitationData.forEach(point => {
            // Color based on precipitation amount
            let color;
            if (point.precipitation === 0) {
                color = '#94a3b8'; // Gray for no precipitation
            } else if (point.precipitation < 1) {
                color = '#60a5fa'; // Light blue
            } else if (point.precipitation < 5) {
                color = '#3b82f6'; // Medium blue
            } else if (point.precipitation < 10) {
                color = '#1d4ed8'; // Dark blue
            } else {
                color = '#1e3a8a'; // Very dark blue
            }
            
            const marker = L.circleMarker([point.lat, point.lng], {
                radius: 5,
                fillColor: color,
                color: '#ffffff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            marker.bindPopup(`
                <strong>Sample Point</strong><br>
                Lat: ${point.lat.toFixed(4)}<br>
                Lng: ${point.lng.toFixed(4)}<br>
                Precipitation: ${point.precipitation.toFixed(2)} mm
            `);
            
            this.samplePointsLayer.addLayer(marker);
        });
        
        this.samplePointsLayer.addTo(this.map);
    }
    
    displayResults(results) {
        const resultsDiv = document.getElementById('results');
        const resultsContent = document.getElementById('results-content');
        
        resultsContent.innerHTML = `
            <div class="result-item">
                <strong>Total Rain Volume (last hour):</strong> ${results.volumeHm3.toFixed(6)} hm³ (${results.volumeM3.toFixed(2)} m³)
            </div>
            <div class="result-item">
                <strong>Polygon Area:</strong> ${results.areaKm2.toFixed(4)} km² (${results.areaM2.toFixed(2)} m²)
            </div>
            <div class="result-item">
                <strong>Average Precipitation (last hour):</strong> ${results.avgPrecipitationMm.toFixed(2)} mm
            </div>
            <div class="result-item">
                <strong>Precipitation Range:</strong> ${results.minPrecipitationMm.toFixed(2)} mm - ${results.maxPrecipitationMm.toFixed(2)} mm
            </div>
            <div class="result-item">
                <strong>Sample Points:</strong> ${results.numSamplePoints} (grid resolution: ${results.gridResolutionKm} km)
            </div>
            <div class="result-item">
                <strong>Integration Cells:</strong> ${results.numIntegrationCells} (resolution: ${results.integrationResolutionKm} km)
            </div>
            <div class="result-item" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #10b981;">
                <em>Note: Volume calculated using numerical integration with inverse distance weighting (IDW) interpolation 
                between sample points. Sample points are shown as colored circles on the map. Data represents precipitation from the last hour.</em>
            </div>
        `;
        
        resultsDiv.style.display = 'block';
    }
    
    hideResults() {
        document.getElementById('results').style.display = 'none';
    }
    
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
        document.getElementById('calculate-btn').disabled = show;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RainVolumeCalculator();
});
