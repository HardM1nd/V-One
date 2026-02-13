import React, { useState, useEffect, useMemo } from "react";
import { Input } from "../ui/input";

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
    const [showOptions, setShowOptions] = useState(false);
    const filteredOptions = useMemo(() => {
        if (!inputValue) return options;
        const needle = inputValue.toLowerCase();
        return options.filter((opt) =>
            `${opt.name} ${opt.code}`.toLowerCase().includes(needle)
        );
    }, [inputValue]);

    useEffect(() => {
        if (value) {
            setInputValue(value);
        }
    }, [value]);

    const handleInputChange = (event, newInputValue) => {
        const value = typeof newInputValue === "string" ? newInputValue : event.target.value;
        setInputValue(value);
        onChange(value);

        const coordMatch = value.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                onCoordinatesChange(lat, lng);
            }
        }
    };

    const handleOptionSelect = (option) => {
        setInputValue(option.name);
        onChange(option.name);
        onCoordinatesChange(option.lat, option.lng);
        setShowOptions(false);
    };

    return (
        <div className="relative">
            <label className="text-sm text-muted-foreground">{label}</label>
            <Input
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setShowOptions(true)}
                onBlur={() => setTimeout(() => setShowOptions(false), 150)}
            />
            {showOptions && filteredOptions.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-md border bg-background shadow">
                    {filteredOptions.map((option) => (
                        <button
                            type="button"
                            key={option.code}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleOptionSelect(option)}
                        >
                            <strong>{option.name}</strong>
                            <div className="text-xs text-muted-foreground">
                                {option.code} • {option.lat.toFixed(4)}, {option.lng.toFixed(4)}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AirportSearch;

