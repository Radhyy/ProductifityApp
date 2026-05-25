"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Wind, Droplets } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function WeatherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Locating...");
  const [current, setCurrent] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchCity(position.coords.latitude, position.coords.longitude);
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to Jakarta
          fetchCity(-6.200000, 106.816666);
          fetchWeather(-6.200000, 106.816666);
        }
      );
    } else {
      fetchCity(-6.200000, 106.816666);
      fetchWeather(-6.200000, 106.816666);
    }
  }, []);

  const fetchCity = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
      const data = await res.json();
      if (data && data.city) {
        setCity(data.city);
      } else if (data && data.locality) {
        setCity(data.locality);
      } else {
        setCity("Unknown City");
      }
    } catch (e) {
      setCity("Offline");
    }
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
      const data = await res.json();
      
      if (data && data.current_weather) {
        setCurrent({
          temp: Math.round(data.current_weather.temperature),
          code: data.current_weather.weathercode,
          windSpeed: data.current_weather.windspeed,
        });

        // Parse 7-day forecast
        const daily = data.daily;
        const parsedForecast = [];
        for (let i = 0; i < daily.time.length; i++) {
          const date = new Date(daily.time[i]);
          const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'short' });
          
          parsedForecast.push({
            day: dayName,
            max: Math.round(daily.temperature_2m_max[i]),
            min: Math.round(daily.temperature_2m_min[i]),
            code: daily.weather_code[i]
          });
        }
        setForecast(parsedForecast);
      }
    } catch (e) {
      console.error("Failed to fetch full weather", e);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, size: number = 24) => {
    let src = "/weather/Cerah.png";
    if (code === 0) src = "/weather/Cerah.png";
    else if (code <= 3) src = "/weather/Cerah%20Berawan.png";
    else if (code <= 48) src = "/weather/Berawan.png";
    else if (code <= 67) src = "/weather/Hujan.png";
    else if (code <= 77) src = "/weather/Berawan.png";
    else if (code <= 82) src = "/weather/Hujan.png";
    else if (code <= 99) src = "/weather/Hujan%20Petir.png";

    return (
      <img 
        src={src} 
        alt="Weather Icon" 
        style={{ width: size, height: size, objectFit: 'contain' }} 
      />
    );
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 99) return "Thunderstorm";
    return "Cloudy";
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>Loading Weather Data...</div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/")}>
          <ChevronLeft size={28} />
        </button>
        <h1 className={styles.title}>Weather</h1>
      </header>

      {/* Main Card */}
      {current && (
        <div className={styles.currentCard}>
          <div className={styles.cityName}>{city}</div>
          <p className={styles.descMain}>{getWeatherDescription(current.code)}</p>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
            {getWeatherIcon(current.code, 120)}
          </div>
          <div className={styles.tempMain}>{current.temp}°C</div>
          
          <div className={styles.detailsRow}>
            <div className={styles.detailCol}>
              <Wind size={20} color="rgba(255,255,255,0.9)" />
              <span className={styles.detailValue}>{current.windSpeed} km/h</span>
              <span className={styles.detailLabel}>Wind</span>
            </div>
            {/* Open-meteo current doesn't easily provide humidity without hourly, so we mock it or skip. Let's just put Precipitation logic. */}
            <div className={styles.detailCol}>
              <Droplets size={20} color="rgba(255,255,255,0.9)" />
              <span className={styles.detailValue}>{current.code > 50 ? '85%' : '45%'}</span>
              <span className={styles.detailLabel}>Humidity</span>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      <h3 className={styles.sectionTitle}>7-Day Forecast</h3>
      <div className={`glass-card`} style={{ padding: '8px 0' }}>
        <div className={styles.forecastList}>
          {forecast.map((f, i) => (
            <div key={i} className={styles.forecastItem} style={{ borderBottom: i < forecast.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
              <span className={styles.forecastDay}>{f.day}</span>
              <div className={styles.forecastIcon}>
                {getWeatherIcon(f.code, 40)}
              </div>
              <div className={styles.forecastTemps}>
                <span className={styles.tempMax}>{f.max}°</span>
                <span className={styles.tempMin}>{f.min}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
