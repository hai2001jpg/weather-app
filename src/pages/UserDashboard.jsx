import { useEffect, useState, useRef } from 'react';
import { getLocationKey } from '../api/weatherAPI';
import WeatherCard from '../components/WeatherCard';

const API_KEY =  import.meta.env.VITE_ACCUWEATHER_API_KEY;
const BASE_URL = "https://dataservice.accuweather.com";

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const UserDashboard = ({ user, setUser }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cityInput, setCityInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchedCities, setSearchedCities] = useState([]);
    const debouncedInput = useDebounce(cityInput, 400);
    const suggestionsRef = useRef();

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolokácia nie je podporovaná vo Vašom prehliadači.');
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const loc = await getLocationKey(latitude, longitude);
                setLocation(loc);
            } catch (err) {
                setError('Nepodarilo sa získať dáta.');
            } finally {
                setLoading(false);
            }
        }, () => {
            setError('Nepodarilo sa získať Vašu polohu.');
            setLoading(false);
        });
    }, []);

    // Fetch autocomplete suggestions
    useEffect(() => {
        if (!debouncedInput) {
            setSuggestions([]);
            return;
        }
        // AccuWeather autocomplete API
        const fetchSuggestions = async () => {
            try {
                const res = await fetch(
                    `${BASE_URL}/locations/v1/cities/autocomplete?apikey=${API_KEY}&q=${debouncedInput}`
                );
                const data = await res.json();
                setSuggestions(Array.isArray(data) ? data : []);
            } catch {
                setSuggestions([]);
            }
        };
        fetchSuggestions();
    }, [debouncedInput]);

    // Fetch user's saved cities on mount
    useEffect(() => {
        if (!user?.id) return;
        fetch(`http://localhost:5000/api/cities?userId=${user.id}`)
            .then(res => res.json())
            .then(data => setSearchedCities(data))
            .catch(() => setSearchedCities([]));
    }, [user]);

    // Add city to backend and state
    const handleAddCity = async (city) => {
        if (!user?.id) return;
        await fetch('http://localhost:5000/api/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                Key: city.Key,
                LocalizedName: city.LocalizedName,
                Country: city.Country?.LocalizedName || city.Country
            })
        });
        setSearchedCities([city, ...searchedCities]);
    };

    // Remove city from backend and state
    const handleRemoveCity = async (cityKey) => {
        if (!user?.id) return;
        await fetch(`http://localhost:5000/api/cities/${cityKey}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
        setSearchedCities(searchedCities.filter(c => c.Key !== cityKey));
    };

    return(
        <>
        <div className="flex flex-col items-end h-screen bg-gray-100">
            {/* Hero section with weather */}
            <div className="w-full flex flex-col items-center justify-center bg-blue-100 py-8 mb-8 shadow">
                {loading ? (
                    <p>Načítava sa počasie...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : location ? (
                    <div className="flex flex-col items-center w-full h-[250px]">
                        <WeatherCard 
                            locationKey={location.key} 
                            city={location.city} 
                            country={location.country} 
                        />
                    </div>
                ) : null}
            </div>
            {/* City search input and autocomplete */}
            <div className="w-full flex flex-col items-center mb-4 relative">
                <form
                    className="flex gap-2"
                    autoComplete="off"
                    onSubmit={e => {
                        e.preventDefault();
                        if (selectedCity && !searchedCities.some(c => c.Key === selectedCity.Key)) {
                            handleAddCity(selectedCity);
                        }
                        setCityInput("");
                        setSuggestions([]);
                        setSelectedCity(null);
                    }}
                >
                    <input
                        type="text"
                        value={cityInput}
                        onChange={e => {
                            setCityInput(e.target.value);
                            setSelectedCity(null);
                        }}
                        placeholder="Vyberte mesto/obec..."
                        className="p-2 rounded border border-gray-600 focus:outline-none focus:ring w-64 "
                        onFocus={() => suggestions.length && setSuggestions(suggestions)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        disabled={!selectedCity}
                    >
                        Pridať mesto
                    </button>
                </form>
                {/* Suggestions dropdown */}
                {suggestions.length > 0 && cityInput && (
                    <ul
                        ref={suggestionsRef}
                        className="absolute z-10 bg-white border border-gray-300 rounded w-64 mt-1 max-h-60 overflow-y-auto shadow-lg"
                    >
                        {suggestions.map(s => (
                            <li
                                key={s.Key}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                onClick={() => {
                                    setSelectedCity(s);
                                    setCityInput(`${s.LocalizedName}, ${s.Country.LocalizedName}`);
                                    setSuggestions([]);
                                }}
                            >
                                {s.LocalizedName}, {s.Country.LocalizedName}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {/* Weather cards for searched cities */}
            <div className="flex flex-wrap justify-center">
                {searchedCities.map(city => (
                    <WeatherCard 
                        key={city.Key} 
                        locationKey={city.Key} 
                        city={city.LocalizedName} 
                        country={city.Country?.LocalizedName || city.Country} 
                        onRemove={handleRemoveCity}
                    />
                ))}
            </div>
        </div>
        </>
    )
}

export default UserDashboard;