document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData();
    fetch4DayForecast();
    // Refresh weather data every 15 minutes
    setInterval(() => {
        fetchWeatherData();
        fetch4DayForecast();
    }, 15 * 60 * 1000);
});

async function fetchWeatherData() {
    try {
        // Fetch current weather readings
        const response = await fetch('https://api.data.gov.sg/v1/environment/air-temperature');
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const data = await response.json();
        
        // Get the reading for Pasir Ris
        const reading = data.items[0].readings.find(r => r.station_id === 'S106');
        if (!reading) throw new Error('No data available for Pasir Ris');
        
        displayCurrentWeather(reading);
    } catch (error) {
        console.error('Error:', error);
        showError('weather-container');
    }
}

async function fetch4DayForecast() {
    try {
        const response = await fetch('https://api.data.gov.sg/v1/environment/4-day-weather-forecast');
        if (!response.ok) throw new Error('Failed to fetch forecast');
        const data = await response.json();
        
        display4DayForecast(data);
    } catch (error) {
        console.error('Error:', error);
        showError('forecast-container');
    }
}

function displayCurrentWeather(reading) {
    const weatherHtml = `
        <div class="weather-content">
            <div class="current-temp text-center">
                <h3 class="mb-0">${reading.value}°C</h3>
                <p class="text-muted">
                    <i class="fas fa-map-marker-alt"></i> Pasir Ris
                </p>
            </div>
            <div class="weather-details mt-4">
                <div class="row g-3">
                    <div class="col-6">
                        <div class="weather-card">
                            <i class="fas fa-clock"></i>
                            <p class="mb-0">Updated at ${new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-card">
                            <i class="fas fa-thermometer-half"></i>
                            <p class="mb-0">Temperature</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('weather-container').innerHTML = weatherHtml;
}

function display4DayForecast(data) {
    const forecasts = data.items[0].forecasts;
    let forecastHtml = '<div class="row g-4">';
    
    forecasts.forEach(day => {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        forecastHtml += `
            <div class="col-md-3">
                <div class="forecast-card card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${formattedDate}</h5>
                        <div class="weather-icon my-3">
                            ${getWeatherIcon(day.forecast)}
                        </div>
                        <p class="forecast-temp">
                            <span class="high">${day.temperature.high}°C</span>
                            <span class="low">${day.temperature.low}°C</span>
                        </p>
                        <p class="forecast-desc">${day.forecast}</p>
                        <p class="forecast-humidity small text-muted">
                            <i class="fas fa-water"></i> ${day.relative_humidity.low}-${day.relative_humidity.high}%
                        </p>
                    </div>
                </div>
            </div>
        `;
    });
    
    forecastHtml += '</div>';
    document.getElementById('forecast-container').innerHTML = forecastHtml;
}

function getWeatherIcon(forecast) {
    // Map NEA's forecast descriptions to Font Awesome icons
    const iconMap = {
        'Fair': '<i class="fas fa-sun text-warning"></i>',
        'Fair (Day)': '<i class="fas fa-sun text-warning"></i>',
        'Partly Cloudy': '<i class="fas fa-cloud-sun text-primary"></i>',
        'Cloudy': '<i class="fas fa-cloud text-secondary"></i>',
        'Light Rain': '<i class="fas fa-cloud-rain text-info"></i>',
        'Moderate Rain': '<i class="fas fa-cloud-showers-heavy text-info"></i>',
        'Heavy Rain': '<i class="fas fa-cloud-showers-heavy text-primary"></i>',
        'Showers': '<i class="fas fa-cloud-rain text-info"></i>',
        'Light Showers': '<i class="fas fa-cloud-rain text-info"></i>',
        'Heavy Showers': '<i class="fas fa-cloud-showers-heavy text-primary"></i>',
        'Thundery Showers': '<i class="fas fa-bolt text-warning"></i>',
        'Heavy Thundery Showers': '<i class="fas fa-bolt text-warning"></i>',
        'Heavy Thundery Showers with Gusty Winds': '<i class="fas fa-wind text-warning"></i>'
    };
    
    return iconMap[forecast] || '<i class="fas fa-cloud text-secondary"></i>';
}

function showError(containerId) {
    document.getElementById(containerId).innerHTML = `
        <div class="text-center text-danger p-4">
            <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
            <p>Unable to load weather data. Please try again later.</p>
        </div>
    `;
}
