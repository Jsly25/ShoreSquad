document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData();
    // Refresh weather data every 30 minutes
    setInterval(fetchWeatherData, 30 * 60 * 1000);
});

async function fetchWeatherData() {
    try {
        const response = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast');
        const data = await response.json();
        
        if (!response.ok) throw new Error('Failed to fetch weather data');
        
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError();
    }
}

function displayWeather(data) {
    const weatherItem = data.items[0];
    const forecast = weatherItem.general;
    const eastRegion = weatherItem.periods[0].regions.east;
    
    const temp = {
        avg: Math.round((parseInt(forecast.temperature.low) + parseInt(forecast.temperature.high)) / 2),
        low: forecast.temperature.low,
        high: forecast.temperature.high
    };
    
    const humidity = {
        avg: Math.round((parseInt(forecast.relative_humidity.low) + parseInt(forecast.relative_humidity.high)) / 2),
        low: forecast.relative_humidity.low,
        high: forecast.relative_humidity.high
    };

    const weatherHtml = `
        <div class="p-3 text-center">
            <div class="mb-4">
                <h3 class="display-4 mb-0">${temp.avg}°C</h3>
                <p class="text-muted">
                    <small>Low: ${temp.low}°C | High: ${temp.high}°C</small>
                </p>
            </div>
            
            <div class="mb-4">
                <img src="${getWeatherIcon(forecast.forecast)}" 
                     alt="${forecast.forecast}" 
                     style="width: 64px; height: 64px;">
                <p class="lead mb-0">${eastRegion}</p>
                <p class="text-muted"><small>${forecast.forecast}</small></p>
            </div>

            <div class="row g-3 text-start">
                <div class="col-6">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="card-title">
                                <i class="fas fa-water text-primary"></i> Humidity
                            </h6>
                            <p class="card-text">${humidity.avg}%
                                <small class="text-muted">(${humidity.low}-${humidity.high}%)</small>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="col-6">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="card-title">
                                <i class="fas fa-wind text-primary"></i> Wind
                            </h6>
                            <p class="card-text">${forecast.wind.speed.low}-${forecast.wind.speed.high} ${forecast.wind.unit}
                                <small class="text-muted">${forecast.wind.direction}</small>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 text-muted">
                <small>
                    <i class="fas fa-clock"></i> 
                    Updated: ${new Date(weatherItem.update_timestamp).toLocaleTimeString()}
                </small>
            </div>
        </div>
    `;

    document.getElementById('weather-container').innerHTML = weatherHtml;
}

function showError() {
    document.getElementById('weather-container').innerHTML = `
        <div class="text-center text-danger p-4">
            <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
            <p>Unable to load weather data</p>
        </div>
    `;
}

function getWeatherIcon(forecast) {
    const iconMap = {
        'Partly Cloudy': 'https://openweathermap.org/img/wn/02d@2x.png',
        'Cloudy': 'https://openweathermap.org/img/wn/03d@2x.png',
        'Light Rain': 'https://openweathermap.org/img/wn/10d@2x.png',
        'Moderate Rain': 'https://openweathermap.org/img/wn/10d@2x.png',
        'Heavy Rain': 'https://openweathermap.org/img/wn/09d@2x.png',
        'Thundery Showers': 'https://openweathermap.org/img/wn/11d@2x.png',
        'Fair': 'https://openweathermap.org/img/wn/01d@2x.png',
        'Fair (Night)': 'https://openweathermap.org/img/wn/01n@2x.png',
        'Fair & Warm': 'https://openweathermap.org/img/wn/01d@2x.png'
    };
    return iconMap[forecast] || 'https://openweathermap.org/img/wn/02d@2x.png';
}

function showWeatherLoading() {
    document.getElementById('weather-container').innerHTML = '<span style="color:#1976d2;">Loading...</span>';
}

async function loadWeatherData() {
    try {
        const response = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast');
        if (!response.ok) throw new Error('Weather data not available');
        const data = await response.json();
        const forecast = data.items[0].general;
        const periods = data.items[0].periods;
        const eastForecast = periods[0].regions.east;
        const tempAvg = Math.round((parseInt(forecast.temperature.low) + parseInt(forecast.temperature.high)) / 2);
        const humidityAvg = Math.round((parseInt(forecast.relative_humidity.low) + parseInt(forecast.relative_humidity.high)) / 2);
        const wind = `${forecast.wind.speed.low}-${forecast.wind.speed.high} ${forecast.wind.unit}`;
        const iconUrl = getWeatherIcon(forecast.forecast);
        const updateTime = new Date(data.items[0].update_timestamp);
        document.getElementById('weather-container').innerHTML = `
            <div class="weather-content">
                <div class="weather-main">
                    <div class="temperature">
                        <span class="temp-value">${tempAvg}</span>°C
                        <span class="temp-range">(${forecast.temperature.low}-${forecast.temperature.high}°C)</span>
                    </div>
                    <div class="weather-description">
                        <img src="${iconUrl}" alt="${forecast.forecast}" class="weather-icon">
                        <span class="description">${eastForecast}</span>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="humidity">
                        <i class="fas fa-water"></i> Humidity: ${humidityAvg}%
                        <span class="small">(${forecast.relative_humidity.low}-${forecast.relative_humidity.high}%)</span>
                    </div>
                    <div class="wind">
                        <i class="fas fa-wind"></i> Wind: ${wind}
                        <span class="small">${forecast.wind.direction}</span>
                    </div>
                </div>
                <div class="location">
                    <i class="fas fa-map-marker-alt"></i> Pasir Ris Beach
                </div>
                <div class="last-updated">
                    Last updated: ${updateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('weather-container').innerHTML = `<span style="color:#d32f2f;">Unable to load weather data</span>`;
    }
}

function getWeatherIcon(forecast) {
    const iconMap = {
        'Partly Cloudy': 'https://openweathermap.org/img/wn/02d@2x.png',
        'Cloudy': 'https://openweathermap.org/img/wn/03d@2x.png',
        'Light Rain': 'https://openweathermap.org/img/wn/10d@2x.png',
        'Moderate Rain': 'https://openweathermap.org/img/wn/10d@2x.png',
        'Heavy Rain': 'https://openweathermap.org/img/wn/09d@2x.png',
        'Thundery Showers': 'https://openweathermap.org/img/wn/11d@2x.png',
        'Fair': 'https://openweathermap.org/img/wn/01d@2x.png',
        'Fair (Night)': 'https://openweathermap.org/img/wn/01n@2x.png',
        'Fair & Warm': 'https://openweathermap.org/img/wn/01d@2x.png'
    };
    return iconMap[forecast] || 'https://openweathermap.org/img/wn/02d@2x.png';
}

// On page load
window.handleWeatherData = handleWeatherData;
document.addEventListener('DOMContentLoaded', loadWeatherData);

// Mobile Menu
function setupMobileMenu() {
    // TODO: Implement hamburger menu for mobile
}

// Weather API Integration
async function loadWeatherData() {
    // Remove any previous JSONP script
    const oldScript = document.getElementById('nea-weather-jsonp');
    if (oldScript) oldScript.remove();

    // Create a new script tag for JSONP
    const script = document.createElement('script');
    script.id = 'nea-weather-jsonp';
    script.src = 'https://api.data.gov.sg/v1/environment/24-hour-weather-forecast?callback=handleWeatherData';
    document.body.appendChild(script);
}

// JSONP callback
function handleWeatherData(data) {
    try {
        const forecast = data.items[0].general;
        const periods = data.items[0].periods;
        const currentPeriod = periods[0];
        const eastForecast = currentPeriod.regions.east;
        const tempAvg = Math.round((parseInt(forecast.temperature.low) + parseInt(forecast.temperature.high)) / 2);
        const humidityAvg = Math.round((parseInt(forecast.relative_humidity.low) + parseInt(forecast.relative_humidity.high)) / 2);
        const wind = `${forecast.wind.speed.low}-${forecast.wind.speed.high} ${forecast.wind.unit}`;
        const iconUrl = getWeatherIcon(forecast.forecast);
        const updateTime = new Date(data.items[0].update_timestamp);

        const weatherHtml = `
            <div class="weather-content">
                <div class="weather-main">
                    <div class="temperature">
                        <span class="temp-value">${tempAvg}</span>°C
                        <span class="temp-range">(${forecast.temperature.low}-${forecast.temperature.high}°C)</span>
                    </div>
                    <div class="weather-description">
                        <img src="${iconUrl}" alt="${forecast.forecast}" class="weather-icon">
                        <span class="description">${eastForecast}</span>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="humidity">
                        <i class="fas fa-water"></i> Humidity: ${humidityAvg}%
                        <span class="small">(${forecast.relative_humidity.low}-${forecast.relative_humidity.high}%)</span>
                    </div>
                    <div class="wind">
                        <i class="fas fa-wind"></i> Wind: ${wind}
                        <span class="small">${forecast.wind.direction}</span>
                    </div>
                </div>
                <div class="location">
                    <i class="fas fa-map-marker-alt"></i> Pasir Ris Beach
                </div>
                <div class="last-updated">
                    Last updated: ${updateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
            </div>
        `;
        document.getElementById('weather-container').innerHTML = weatherHtml;
    } catch (error) {
        showError('Unable to load weather data');
    }
}

function showError(message) {
    document.getElementById('weather-container').innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Helper function to get weather icons based on forecast
function getWeatherIcon(forecast) {
    const iconMap = {
        'Partly Cloudy': 'https://openweathermap.org/img/wn/02d@2x.png',
        'Cloudy': 'https://openweathermap.org/img/wn/03d@2x.png',
        'Light Rain': 'https://openweathermap.org/img/wn/10d@2x.png',
        'Moderate Rain': 'https://openweathermap.org/img/wn/10d@2x.png',
        'Heavy Rain': 'https://openweathermap.org/img/wn/09d@2x.png',
        'Thundery Showers': 'https://openweathermap.org/img/wn/11d@2x.png',
        'Fair': 'https://openweathermap.org/img/wn/01d@2x.png',
        'Fair (Night)': 'https://openweathermap.org/img/wn/01n@2x.png',
        'Fair & Warm': 'https://openweathermap.org/img/wn/01d@2x.png'
    };
    return iconMap[forecast] || 'https://openweathermap.org/img/wn/02d@2x.png';
}

// Map Integration
function initializeMap() {
    // TODO: Integrate with mapping service (e.g., Google Maps, Mapbox)
    const mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = '<p>Map loading...</p>';
}

// Events Loading
function loadEvents() {
    const events = [
        {
            title: 'Weekend Beach Cleanup',
            date: '2025-06-15',
            location: 'Sunset Beach',
            participants: 25
        },
        // Add more events as needed
    ];

    const eventsGrid = document.querySelector('.events-grid');
    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.classList.add('event-card');
    card.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.date}</p>
        <p>${event.location}</p>
        <p>${event.participants} participants</p>
    `;
    return card;
}

// Scroll Animations
function setupAnimations() {
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        },
        { threshold: 0.1 }
    );

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Error Handling
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    // TODO: Implement user-friendly error messaging
}

// Performance Monitoring
const performance = {
    init() {
        this.markStartTime();
        window.addEventListener('load', () => this.markLoadTime());
    },

    markStartTime() {
        this.startTime = performance.now();
    },

    markLoadTime() {
        const loadTime = performance.now() - this.startTime;
        console.log(`Page loaded in ${loadTime}ms`);
    }
};

performance.init();
