import React, { useState } from "react";
import { TextField, Button, FormControlLabel, Switch } from "@mui/material";
import useUserContext from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import AirportSearch from "./AirportSearch";
import RouteMap from "./RouteMap";

const RouteForm = ({ route = null, onSuccess }) => {
    const { axiosInstance } = useUserContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: route?.title || '',
        departure: route?.departure || '',
        destination: route?.destination || '',
        departure_lat: route?.departure_lat || '',
        departure_lng: route?.departure_lng || '',
        destination_lat: route?.destination_lat || '',
        destination_lng: route?.destination_lng || '',
        description: route?.description || '',
        flight_date: route?.flight_date || '',
        flight_duration: route?.flight_duration || '',
        distance: route?.distance || '',
        aircraft_type: route?.aircraft_type || '',
        is_public: route?.is_public !== undefined ? route.is_public : true,
        route_file: null,
    });
    
    const [showMap, setShowMap] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            route_file: e.target.files[0]
        }));
    };

    const handleLocationSelect = (type, lat, lng) => {
        if (type === "departure") {
            setFormData(prev => ({
                ...prev,
                departure_lat: lat.toString(),
                departure_lng: lng.toString(),
            }));
        } else if (type === "destination") {
            setFormData(prev => ({
                ...prev,
                destination_lat: lat.toString(),
                destination_lng: lng.toString(),
            }));
        }
    };

    const handleGeocode = async (type) => {
        const address = type === "departure" ? formData.departure : formData.destination;
        if (!address) {
            alert("Сначала введите название места");
            return;
        }

        try {
            // Используем Nominatim (OpenStreetMap) для геокодинга
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                if (type === "departure") {
                    setFormData(prev => ({
                        ...prev,
                        departure_lat: lat,
                        departure_lng: lon,
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        destination_lat: lat,
                        destination_lng: lon,
                    }));
                }
                setShowMap(true);
                alert(`Координаты найдены: ${lat}, ${lon}`);
            } else {
                alert("Место не найдено. Попробуйте выбрать на карте вручную.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert("Ошибка при поиске координат. Выберите на карте вручную.");
        }
    };

    const formatDuration = (duration) => {
        // Преобразуем формат "HH:MM:SS" в "HH:MM" для input
        if (duration && duration.includes(':')) {
            const parts = duration.split(':');
            return `${parts[0]}:${parts[1]}`;
        }
        return duration || '';
    };

    const parseDuration = (value) => {
        // Преобразуем "HH:MM" в "HH:MM:SS"
        if (value && value.includes(':')) {
            const parts = value.split(':');
            return `${parts[0]}:${parts[1]}:00`;
        }
        return value;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'route_file') {
                    if (formData[key]) {
                        submitData.append(key, formData[key]);
                    }
                } else if (key === 'flight_duration') {
                    const duration = parseDuration(formData[key]);
                    if (duration) {
                        submitData.append(key, duration);
                    }
                } else if (key.includes('_lat') || key.includes('_lng')) {
                    // Координаты - отправляем только если есть значение
                    if (formData[key] && formData[key] !== '') {
                        submitData.append(key, formData[key]);
                    }
                } else if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            const url = route
                ? `post/routes/${route.id}/update/`
                : 'post/routes/create/';
            
            const method = route ? 'put' : 'post';
            await axiosInstance[method](url, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/routes/');
            }
        } catch (error) {
            console.error("Error saving route:", error);
            alert("Ошибка при сохранении маршрута. Проверьте данные.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-[#030108] p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
                {route ? 'Редактировать маршрут' : 'Создать маршрут полета'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                    fullWidth
                    label="Название маршрута"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    variant="outlined"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <AirportSearch
                            label="Точка отправления"
                            value={formData.departure}
                            onChange={(value) => setFormData(prev => ({ ...prev, departure: value }))}
                            onCoordinatesChange={(lat, lng) => {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    departure_lat: lat || '', 
                                    departure_lng: lng || '' 
                                }));
                            }}
                            lat={formData.departure_lat}
                            lng={formData.departure_lng}
                        />
                    </div>
                    <div>
                        <AirportSearch
                            label="Точка назначения"
                            value={formData.destination}
                            onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                            onCoordinatesChange={(lat, lng) => {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    destination_lat: lat || '', 
                                    destination_lng: lng || '' 
                                }));
                            }}
                            lat={formData.destination_lat}
                            lng={formData.destination_lng}
                        />
                    </div>
                </div>

                {(formData.departure_lat && formData.departure_lng && formData.destination_lat && formData.destination_lng) && (
                    <div className="mb-4">
                        <RouteMap
                            departure={formData.departure}
                            destination={formData.destination}
                            departureLat={formData.departure_lat}
                            departureLng={formData.departure_lng}
                            destinationLat={formData.destination_lat}
                            destinationLng={formData.destination_lng}
                            height="300px"
                        />
                    </div>
                )}

                <TextField
                    fullWidth
                    label="Описание"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    variant="outlined"
                />

                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        fullWidth
                        label="Дата полета"
                        name="flight_date"
                        type="date"
                        value={formData.flight_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Длительность (ЧЧ:ММ)"
                        name="flight_duration"
                        value={formatDuration(formData.flight_duration)}
                        onChange={handleChange}
                        placeholder="02:30"
                        variant="outlined"
                        helperText="Формат: часы:минуты"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        fullWidth
                        label="Расстояние (км)"
                        name="distance"
                        type="number"
                        value={formData.distance}
                        onChange={handleChange}
                        inputProps={{ step: "0.01", min: "0" }}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Тип самолета"
                        name="aircraft_type"
                        value={formData.aircraft_type}
                        onChange={handleChange}
                        placeholder="Например: Cessna 172"
                        variant="outlined"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Файл маршрута (опционально)
                    </label>
                    <input
                        type="file"
                        name="route_file"
                        onChange={handleFileChange}
                        accept=".pln,.fms,.gpx,.txt"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                </div>

                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.is_public}
                            onChange={handleChange}
                            name="is_public"
                        />
                    }
                    label="Публичный маршрут"
                />

                <div className="flex gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : (route ? 'Обновить' : 'Создать')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RouteForm;

