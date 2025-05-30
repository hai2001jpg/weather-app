const API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY;
const BASE_URL = "https://dataservice.accuweather.com";

// Step 1: Get location key from latitude & longitude
export const getLocationKey = async (lat, lon) => {
  const response = await fetch(
    `${BASE_URL}/locations/v1/cities/geoposition/search?apikey=${API_KEY}&q=${lat},${lon}`
  );
  const data = await response.json();
  return {
    key: data.Key,
    city: data.LocalizedName,
    country: data.Country.LocalizedName
  };
};

// Step 2: Get current weather using location key
export const getCurrentWeather = async (locationKey) => {
  const response = await fetch(
    `${BASE_URL}/currentconditions/v1/${locationKey}?apikey=${API_KEY}&language=sk-sk`
  );
  const data = await response.json();
  return data[0]; // returns an object with current weather details
};

// Step 3: Get 5-day forecast using location key
export const getFiveDayForecast = async (locationKey) => {
  const response = await fetch(
    `${BASE_URL}/forecasts/v1/daily/5day/${locationKey}?apikey=${API_KEY}&metric=true`
  );
  const data = await response.json();
  return data.DailyForecasts; // returns an array of daily forecasts
};