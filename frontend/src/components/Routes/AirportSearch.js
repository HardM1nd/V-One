import React, { useState, useEffect } from "react";
import { TextField, Autocomplete, Box } from "@mui/material";

// Популярные аэропорты России и мира (можно расширить или подключить API)
const POPULAR_AIRPORTS = [
    { name: "Москва (Шереметьево)", code: "UUEE", lat: 55.9736, lng: 37.4147 },
    { name: "Москва (Домодедово)", code: "UUDD", lat: 55.4143, lng: 37.8995 },
    { name: "Санкт-Петербург (Пулково)", code: "ULLI", lat: 59.8003, lng: 30.2625 },
    { name: "Екатеринбург (Кольцово)", code: "USSS", lat: 56.7431, lng: 60.8028 },
    { name: "Новосибирск (Толмачево)", code: "UNNT", lat: 55.0126, lng: 82.6507 },
    { name: "Сочи", code: "URSS", lat: 43.4499, lng: 39.9566 },
    { name: "Краснодар", code: "URKK", lat: 45.0347, lng: 39.1706 },
    { name: "Казань", code: "UWKD", lat: 55.6062, lng: 49.2787 },
    { name: "Лондон (Хитроу)", code: "EGLL", lat: 51.4700, lng: -0.4543 },
    { name: "Париж (Шарль де Голль)", code: "LFPG", lat: 49.0097, lng: 2.5479 },
    { name: "Франкфурт", code: "EDDF", lat: 50.0379, lng: 8.5622 },
    { name: "Дубай", code: "OMDB", lat: 25.2532, lng: 55.3657 },
    { name: "Нью-Йорк (JFK)", code: "KJFK", lat: 40.6413, lng: -73.7781 },
    { name: "Лос-Анджелес", code: "KLAX", lat: 33.9425, lng: -118.4081 },
];

const AirportSearch = ({ 
    label, 
    value, 
    onChange, 
    onCoordinatesChange,
    lat,
    lng 
}) => {
    const [inputValue, setInputValue] = useState(value || "");
    const options = POPULAR_AIRPORTS;

    useEffect(() => {
        if (value) {
            setInputValue(value);
        }
    }, [value]);

    const handleChange = (event, newValue) => {
        if (newValue) {
            onChange(newValue.name || newValue);
            if (newValue.lat && newValue.lng) {
                onCoordinatesChange(newValue.lat, newValue.lng);
            }
        } else {
            onChange("");
            onCoordinatesChange(null, null);
        }
    };

    const handleInputChange = (event, newInputValue) => {
        setInputValue(newInputValue);
        onChange(newInputValue);
        
        // Если введены координаты в формате "lat, lng"
        const coordMatch = newInputValue.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                onCoordinatesChange(lat, lng);
            }
        }
    };

    return (
        <Box>
            <Autocomplete
                freeSolo
                options={options}
                getOptionLabel={(option) => 
                    typeof option === 'string' 
                        ? option 
                        : `${option.name} (${option.code})`
                }
                value={inputValue}
                onChange={handleChange}
                onInputChange={handleInputChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        placeholder="Например: Москва (Шереметьево) или 55.9736, 37.4147"
                        variant="outlined"
                        fullWidth
                    />
                )}
                renderOption={(props, option) => (
                    <Box component="li" {...props}>
                        <div>
                            <strong>{option.name}</strong>
                            <br />
                            <span className="text-sm text-gray-500">
                                {option.code} • {option.lat.toFixed(4)}, {option.lng.toFixed(4)}
                            </span>
                        </div>
                    </Box>
                )}
            />
            {lat && lng && (
                <div className="text-xs text-gray-500 mt-1">
                    Координаты: {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
                </div>
            )}
        </Box>
    );
};

export default AirportSearch;

