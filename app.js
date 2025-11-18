// Rain Volume Calculator App
class RainVolumeCalculator {
    constructor() {
        this.map = null;
        this.drawnItems = null;
        this.currentPolygon = null;
        this.apiKey = localStorage.getItem('openweathermap_api_key') || '';
        this.precipitationLayer = null;
        this.overlayVisible = false;
        
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
        
        // Allow Enter key to save API key
        document.getElementById('api-key').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });
    }
    
    loadApiKey() {
        if (this.apiKey) {
            document.getElementById('api-key').value = this.apiKey;
            // Enable overlay button if API key exists
            document.getElementById('toggle-overlay-btn').disabled = false;
        }
    }
    
    saveApiKey() {
        const apiKeyInput = document.getElementById('api-key');
        this.apiKey = apiKeyInput.value.trim();
        
        if (this.apiKey) {
            localStorage.setItem('openweathermap_api_key', this.apiKey);
            this.showNotification('API key saved successfully!', 'success');
            
            // Enable overlay button when API key is saved
            document.getElementById('toggle-overlay-btn').disabled = false;
        } else {
            this.showNotification('Please enter a valid API key', 'error');
        }
    }
    
    showNotification(message, type) {
        // Simple notification - could be enhanced with a proper notification library
        alert(message);
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
        
        try {
            // Get polygon coordinates
            const latlngs = this.currentPolygon.getLatLngs()[0];
            const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
            coordinates.push(coordinates[0]); // Close the polygon
            
            // Create GeoJSON polygon
            const polygon = turf.polygon([coordinates]);
            
            // Calculate polygon area in square meters
            const area = turf.area(polygon);
            
            // Get bounding box
            const bbox = turf.bbox(polygon);
            
            // Get grid resolution from input
            const gridResolution = parseFloat(document.getElementById('grid-resolution').value);
            
            // Fetch precipitation data for the area
            const precipitationData = await this.fetchPrecipitationData(bbox, polygon, gridResolution);
            
            // Calculate total rain volume
            const results = this.calculateVolume(precipitationData, area, polygon, gridResolution);
            
            // Display results
            this.displayResults(results);
            
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
        
        // Convert grid resolution from km to degrees (approximate)
        const gridResolutionDeg = gridResolutionKm / 111; // 1 degree ≈ 111 km
        
        const points = [];
        
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
            throw new Error('No points found within polygon. Try adjusting the grid resolution.');
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
        // Calculate average precipitation across all points
        const totalPrecipitation = precipitationData.reduce((sum, point) => sum + point.precipitation, 0);
        const avgPrecipitation = totalPrecipitation / precipitationData.length;
        
        // Convert precipitation from mm to meters
        const avgPrecipitationMeters = avgPrecipitation / 1000;
        
        // Calculate volume: area (m²) × precipitation (m) = volume (m³)
        const volumeM3 = totalArea * avgPrecipitationMeters;
        
        // Additional statistics
        const maxPrecipitation = Math.max(...precipitationData.map(p => p.precipitation));
        const minPrecipitation = Math.min(...precipitationData.map(p => p.precipitation));
        
        return {
            volumeM3: volumeM3,
            volumeLiters: volumeM3 * 1000,
            areaM2: totalArea,
            areaKm2: totalArea / 1_000_000,
            avgPrecipitationMm: avgPrecipitation,
            maxPrecipitationMm: maxPrecipitation,
            minPrecipitationMm: minPrecipitation,
            numSamplePoints: precipitationData.length,
            gridResolutionKm: gridResolutionKm
        };
    }
    
    displayResults(results) {
        const resultsDiv = document.getElementById('results');
        const resultsContent = document.getElementById('results-content');
        
        resultsContent.innerHTML = `
            <div class="result-item">
                <strong>Total Rain Volume:</strong> ${results.volumeM3.toFixed(2)} m³ (${results.volumeLiters.toFixed(2)} liters)
            </div>
            <div class="result-item">
                <strong>Polygon Area:</strong> ${results.areaKm2.toFixed(4)} km² (${results.areaM2.toFixed(2)} m²)
            </div>
            <div class="result-item">
                <strong>Average Precipitation:</strong> ${results.avgPrecipitationMm.toFixed(2)} mm
            </div>
            <div class="result-item">
                <strong>Precipitation Range:</strong> ${results.minPrecipitationMm.toFixed(2)} mm - ${results.maxPrecipitationMm.toFixed(2)} mm
            </div>
            <div class="result-item">
                <strong>Sample Points:</strong> ${results.numSamplePoints} (grid resolution: ${results.gridResolutionKm} km)
            </div>
            <div class="result-item" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #10b981;">
                <em>Note: Precipitation data is based on current/recent weather conditions from OpenWeatherMap. 
                For historical or forecast data, consider upgrading to OpenWeatherMap's premium APIs.</em>
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
