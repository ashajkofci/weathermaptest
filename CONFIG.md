# Configuration Example

## OpenWeatherMap API Key

To use this application, you need an OpenWeatherMap API key.

### Getting Your Free API Key

1. Visit https://openweathermap.org/api
2. Click "Sign Up" or "Get API Key"
3. Create a free account
4. Navigate to your API keys page
5. Copy your default API key (or create a new one)

### Using the API Key

- Enter your API key in the text field at the top of the application
- Click "Save" to store it in your browser's localStorage
- The key is saved locally and never transmitted to any server except OpenWeatherMap

### API Limits (Free Tier)

- 60 calls per minute
- 1,000,000 calls per month
- Current weather data only

### Recommended Settings

For optimal results:

**Small areas (<10 km²):**
- Grid Resolution: 1-2 km
- Expected sample points: 10-50
- Processing time: 5-20 seconds

**Medium areas (10-100 km²):**
- Grid Resolution: 3-5 km
- Expected sample points: 20-100
- Processing time: 10-40 seconds

**Large areas (>100 km²):**
- Grid Resolution: 5-10 km
- Expected sample points: 50-200
- Processing time: 30-120 seconds

Note: Higher resolution (more sample points) provides better accuracy but increases API calls and processing time.
