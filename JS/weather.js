/**
 * MÓDULO DE CLIMA
 * Integra la API de OpenWeather para obtener información del clima
 */

class WeatherManager {
    constructor() {
        // Usar API gratuita de Open-Meteo que no requiere API key
        this.baseURL = 'https://api.open-meteo.com/v1/forecast';
        this.geocodingURL = 'https://geocoding-api.open-meteo.com/v1/search';
        this.cache = this.loadWeatherCache();
        this.weatherEmojis = {
            'clear': '☀️',
            'cloudy': '☁️',
            'rainy': '🌧️',
            'snow': '❄️',
            'thunderstorm': '⛈️',
            'fog': '🌫️',
            'windy': '💨'
        };
    }

    /**
     * Carga el cache del clima del localStorage
     */
    loadWeatherCache() {
        const cached = localStorage.getItem('weatherCache');
        return cached ? JSON.parse(cached) : {};
    }

    /**
     * Guarda el cache del clima en localStorage
     */
    saveWeatherCache() {
        localStorage.setItem('weatherCache', JSON.stringify(this.cache));
    }

    /**
     * Obtiene las coordenadas de una ciudad
     */
    async getCoordinates(city) {
        try {
            const response = await fetch(
                `${this.geocodingURL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
            );
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    latitude: result.latitude,
                    longitude: result.longitude,
                    name: result.name,
                    country: result.country
                };
            }
            
            throw new Error('Ciudad no encontrada');
        } catch (error) {
            console.error('Error al obtener coordenadas:', error);
            throw new Error(`No se pudo encontrar la ciudad: ${city}`);
        }
    }

    /**
     * Obtiene el clima de una ciudad
     */
    async getWeather(city) {
        try {
            // Verifica cache
            const cached = this.cache[city.toLowerCase()];
            if (cached && (Date.now() - cached.timestamp) < 3600000) { // 1 hora
                return cached.data;
            }

            // Obtiene coordenadas
            const coords = await this.getCoordinates(city);

            // Obtiene datos del clima
            const response = await fetch(
                `${this.baseURL}?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            const current = data.current;

            const weatherData = {
                city: coords.name,
                country: coords.country,
                temperature: Math.round(current.temperature_2m),
                weatherCode: current.weather_code,
                condition: this.getWeatherCondition(current.weather_code),
                emoji: this.getWeatherEmoji(current.weather_code),
                windSpeed: Math.round(current.wind_speed_10m),
                timestamp: Date.now()
            };

            // Guarda en cache
            this.cache[city.toLowerCase()] = {
                data: weatherData,
                timestamp: Date.now()
            };
            this.saveWeatherCache();

            // Dispara evento personalizado
            document.dispatchEvent(new CustomEvent('weatherUpdated', { detail: weatherData }));

            return weatherData;
        } catch (error) {
            console.error('Error al obtener el clima:', error);
            throw error;
        }
    }

    /**
     * Obtiene la condición del clima basada en el código WMO
     */
    getWeatherCondition(code) {
        const conditions = {
            0: 'Cielo despejado',
            1: 'Mayormente despejado',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Brumoso',
            48: 'Niebla',
            51: 'Llovizna ligera',
            53: 'Llovizna moderada',
            55: 'Llovizna densa',
            61: 'Lluvia ligera',
            63: 'Lluvia moderada',
            65: 'Lluvia fuerte',
            71: 'Nieve ligera',
            73: 'Nieve moderada',
            75: 'Nieve fuerte',
            80: 'Lluvia ligera con chubascos',
            81: 'Lluvia moderada con chubascos',
            82: 'Lluvia fuerte con chubascos',
            85: 'Chubascos de nieve ligera',
            86: 'Chubascos de nieve fuerte',
            95: 'Tormenta',
            96: 'Tormenta con granizo ligero',
            99: 'Tormenta con granizo fuerte'
        };
        return conditions[code] || 'Desconocido';
    }

    /**
     * Obtiene el emoji del clima basado en el código WMO
     */
    getWeatherEmoji(code) {
        if (code === 0 || code === 1) return '☀️';
        if (code === 2 || code === 3) return '☁️';
        if (code >= 45 && code <= 48) return '🌫️';
        if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
        if ((code >= 71 && code <= 75) || (code >= 85 && code <= 86)) return '❄️';
        if (code >= 95 && code <= 99) return '⛈️';
        return '🌤️';
    }

    /**
     * Obtiene temperaturas en diferentes unidades
     */
    convertTemperature(celsius, unit = 'C') {
        switch(unit) {
            case 'F':
                return Math.round((celsius * 9/5) + 32);
            case 'K':
                return Math.round(celsius + 273.15);
            default:
                return celsius;
        }
    }

    /**
     * Convierte velocidad del viento
     */
    convertWindSpeed(kmh, unit = 'kmh') {
        switch(unit) {
            case 'ms':
                return (kmh / 3.6).toFixed(1);
            case 'mph':
                return (kmh * 0.621371).toFixed(1);
            case 'knots':
                return (kmh * 0.539957).toFixed(1);
            default:
                return kmh;
        }
    }

    /**
     * Obtiene el pronóstico para múltiples ciudades
     */
    async getWeatherForMultipleCities(cities) {
        try {
            const results = await Promise.all(
                cities.map(city => this.getWeather(city).catch(err => ({
                    city,
                    error: err.message
                })))
            );
            return results;
        } catch (error) {
            console.error('Error al obtener clima para múltiples ciudades:', error);
            throw error;
        }
    }

    /**
     * Limpia el cache
     */
    clearCache() {
        this.cache = {};
        localStorage.removeItem('weatherCache');
    }

    /**
     * Obtiene el cache completo
     */
    getCache() {
        return { ...this.cache };
    }
}

// Instancia global del gestor de clima
const weatherManager = new WeatherManager();
