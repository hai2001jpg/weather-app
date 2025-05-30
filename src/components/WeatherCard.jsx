import { useEffect, useState } from 'react';
import { getCurrentWeather } from '../api/weatherAPI';

const WeatherCard = ({ locationKey, city, country, onRemove }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!locationKey) return;
    setLoading(true);
    setError(null);
    setWeather(null);
    getCurrentWeather(locationKey)
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to fetch weather.');
        setLoading(false);
      });
  }, [locationKey]);

  return (
    <div className="relative bg-white rounded-lg shadow-md p-6 m-4 min-w-[250px] flex flex-col items-center">
      {onRemove && (
        <button
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          onClick={() => onRemove(locationKey)}
          aria-label="Remove city"
        >×</button>
      )}
      <h3 className="text-xl font-bold mb-2">{city}{country ? `, ${country}` : ''}</h3>
      {loading ? (
        <p>Načítava sa...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : weather ? (
        <>
          <p className="text-lg">{weather.WeatherText}</p>
          <p className="text-2xl font-semibold">
            {weather.Temperature.Metric.Value}&deg;{weather.Temperature.Metric.Unit}
           </p>
        </>
      ) : null}
    </div>
  );
};

export default WeatherCard;
