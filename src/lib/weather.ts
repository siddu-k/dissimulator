import { WeatherData } from "@/types";

export async function fetchLiveWeatherData(lat: number, lng: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,surface_pressure&hourly=precipitation,soil_moisture_0_to_1cm&daily=precipitation_sum,precipitation_probability_max&forecast_days=3&timezone=auto`;
    
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) {
      throw new Error(`Open-Meteo API responded with status ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};

    const currentRainfall = Number(current.precipitation ?? current.rain ?? 0);
    const forecast24h = daily.precipitation_sum?.[0] 
      ? Number(daily.precipitation_sum[0])
      : hourly.precipitation?.slice(0, 24).reduce((a: number, b: number) => a + (b || 0), 0) || 0;

    const temp = Number(current.temperature_2m ?? 24);
    const humidity = Number(current.relative_humidity_2m ?? 70);
    const windSpeed = Number(current.wind_speed_10m ?? 12);
    const pressure = Number(current.surface_pressure ?? 1012);
    
    const soilMoisture = hourly.soil_moisture_0_to_1cm?.[0]
      ? Math.round(Number(hourly.soil_moisture_0_to_1cm[0]) * 100)
      : 55;

    let alert: string | undefined = undefined;
    if (forecast24h > 100 || currentRainfall > 30) {
      alert = "RED WARNING: High volume rainfall detected. Immediate flash flood vigilance.";
    } else if (forecast24h > 50 || currentRainfall > 15) {
      alert = "ORANGE ADVISORY: Significant precipitation expected in next 24 hours.";
    } else if (forecast24h > 20) {
      alert = "YELLOW WATCH: Moderate convective rainfall conditions.";
    }

    return {
      currentRainfallMm: currentRainfall,
      forecast24hRainfallMm: Math.round(forecast24h * 10) / 10,
      temperatureC: Math.round(temp * 10) / 10,
      humidityPercent: Math.round(humidity),
      windSpeedKmh: Math.round(windSpeed * 10) / 10,
      pressureHpa: Math.round(pressure),
      soilMoistureIndex: soilMoisture,
      weatherAlert: alert,
      isRealApi: true,
    };
  } catch (err: any) {
    console.error("Live weather fetch error:", err);
    throw new Error(`Failed to fetch real live weather data from Open-Meteo: ${err.message || String(err)}`);
  }
}
