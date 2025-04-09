import React, { useEffect, useRef, useState } from "react";
import './Weather.css';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import humidity_icon from '../assets/humidity.png';
import rain_icon from '../assets/rain.png';
import search_icon from '../assets/search.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';
import reload_icon from '../assets/reload.png';

const Weather = () => {
  const inputRef = useRef(null);
  const [weatherData, setWeatherData] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  const addRecent = (city) => {
    const updated = [city, ...recentSearches.filter(c => c !== city)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentCities", JSON.stringify(updated));
  };

  const search = async (city) => {
    if (!city) {
      alert("Enter City Name");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const apiKey = import.meta.env.VITE_APP_ID;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      const weatherDataJson = await weatherRes.json();
      const forecastDataJson = await forecastRes.json();

      if (!weatherRes.ok) {
        setErrorMsg(weatherDataJson.message || "City not found");
        setWeatherData(false);
        setForecast([]);
        setLoading(false);
        return;
      }

      const icon = allIcons[weatherDataJson.weather[0].icon] || clear_icon;
      setWeatherData({
        humidity: weatherDataJson.main.humidity,
        windSpeed: weatherDataJson.wind.speed,
        temperature: Math.floor(weatherDataJson.main.temp),
        location: weatherDataJson.name,
        icon: icon
      });

      const dailyForecast = forecastDataJson.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
      setForecast(dailyForecast);
      addRecent(weatherDataJson.name);
    } catch (err) {
      setErrorMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("recentCities");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    search("Bhubaneswar");
  }, []);

  return (
    <div className={`Weather ${theme}`}>
      <button className="theme-toggle" onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}>
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>

      <div className="search-bar">
        <input ref={inputRef} type="text" placeholder="Search" />
        <img src={search_icon} alt="search" onClick={() => search(inputRef.current.value)} />
        <img src={reload_icon} alt="reload" className="refresh-icon" onClick={() => search(weatherData?.location || "Bhubaneswar")} />
      </div>

      {loading && <div className="loading">Loading...</div>}
      {errorMsg && <div className="error">{errorMsg}</div>}

      {weatherData && !loading && (
        <>
          <img src={weatherData.icon} alt="weather" className="weather-icon" />
          <p className="temperature">{weatherData.temperature}°C</p>
          <p className="location">{weatherData.location}</p>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="humidity" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="wind" />
              <div>
                <p>{weatherData.windSpeed} Km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>

          {forecast.length > 0 && (
            <div className="forecast">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-card">
                    <p>{new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <img src={allIcons[day.weather[0].icon] || clear_icon} alt="icon" />
                    <p>{Math.round(day.main.temp)}°C</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="recent-searches">
        <h4>Recent Searches</h4>
        <ul>
          {recentSearches.map((city, index) => (
            <li key={index} onClick={() => search(city)}>{city}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Weather;
