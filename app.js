const LAT = 43.5890;
const LON = -79.6441;
const REFRESH_MS = 15 * 60 * 1000;

const $ = (selector) => document.querySelector(selector);
const weatherCodes = {
  0: ["Clear sky", "☀️"], 1: ["Mostly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
  45: ["Foggy", "🌫️"], 48: ["Icy fog", "🌫️"], 51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"], 61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"], 73: ["Snow", "🌨️"], 75: ["Heavy snow", "❄️"], 80: ["Showers", "🌦️"],
  81: ["Rain showers", "🌧️"], 82: ["Heavy showers", "🌧️"], 95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm", "⛈️"], 99: ["Thunderstorm", "⛈️"]
};

function condition(code) { return weatherCodes[code] || ["Conditions unavailable", "•"]; }
function displayTime(date) { return new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit" }).format(date); }
function updateClock() { $("#clock").textContent = displayTime(new Date()); }
function weatherUrl() {
  const params = new URLSearchParams({ latitude: LAT, longitude: LON, timezone: "America/Toronto", current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m", hourly: "temperature_2m,precipitation_probability,weather_code", daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset", forecast_days: "2" });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}
function setText(id, value) { $(id).textContent = value; }
function toHour(iso) { return new Intl.DateTimeFormat("en-CA", { hour: "numeric" }).format(new Date(iso)); }

async function loadWeather() {
  try {
    const response = await fetch(weatherUrl());
    if (!response.ok) throw new Error("Weather request failed");
    const data = await response.json();
    const now = data.current;
    const [label, icon] = condition(now.weather_code);
    setText("#weather-icon", icon); setText("#condition", label); setText("#temperature", Math.round(now.temperature_2m));
    setText("#feels-like", `Feels like ${Math.round(now.apparent_temperature)}°`);
    setText("#high-low", `${Math.round(data.daily.temperature_2m_max[0])}° / ${Math.round(data.daily.temperature_2m_min[0])}°`);
    setText("#precipitation", `${Math.round(now.precipitation)} mm now`);
    setText("#wind", `${Math.round(now.wind_speed_10m)} km/h`);
    setText("#humidity", `${Math.round(now.relative_humidity_2m)}%`);
    setText("#updated", `Updated ${displayTime(new Date())}`);
    setText("#sun-times", `Sunrise ${displayTime(new Date(data.daily.sunrise[0]))} · Sunset ${displayTime(new Date(data.daily.sunset[0]))}`);

    const start = data.hourly.time.findIndex((time) => new Date(time) >= new Date());
    $("#hourly").innerHTML = data.hourly.time.slice(start, start + 6).map((time, offset) => {
      const i = start + offset; const [, hourIcon] = condition(data.hourly.weather_code[i]); const pop = data.hourly.precipitation_probability[i];
      return `<article class="hour"><span class="hour-time">${offset === 0 ? "Now" : toHour(time)}</span><span class="hour-icon">${hourIcon}</span><strong class="hour-temp">${Math.round(data.hourly.temperature_2m[i])}°</strong><span class="hour-pop">${pop ? `${pop}% rain` : "Dry"}</span></article>`;
    }).join("");
  } catch (error) {
    setText("#updated", "Weather is temporarily unavailable");
    console.error(error);
  }
}

async function requestWakeLock() { try { if ("wakeLock" in navigator) await navigator.wakeLock.request("screen"); } catch (_) {} }

updateClock(); setInterval(updateClock, 1000); loadWeather(); setInterval(loadWeather, REFRESH_MS);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") requestWakeLock(); });
document.addEventListener("click", requestWakeLock, { once: true });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");


function showLoveMessage(){const message=$("#love-message");message.classList.add("is-visible");message.setAttribute("aria-hidden","false");setTimeout(()=>{message.classList.remove("is-visible");message.setAttribute("aria-hidden","true")},10000)}
setInterval(showLoveMessage,120000);
