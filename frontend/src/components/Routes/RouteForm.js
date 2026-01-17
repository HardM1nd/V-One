import React, { useState, useEffect, useMemo } from "react";
import useUserContext from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import AirportSearch from "./AirportSearch";
import RouteMap from "./RouteMap";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const RouteForm = ({ route = null, onSuccess, prefillWaypoints = null }) => {
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
        waypoints: route?.waypoints || [],
        description: route?.description || '',
        flight_date: route?.flight_date || '',
        flight_duration: route?.flight_duration || '',
        distance: route?.distance || '',
        aircraft_type: route?.aircraft_type || '',
        visibility: route?.visibility || (route?.is_public === false ? "private" : "public"),
        route_file: null,
    });
    const [useWaypoints, setUseWaypoints] = useState(
        Array.isArray(route?.waypoints) && route.waypoints.length > 0
    );
    const [mapEnabled, setMapEnabled] = useState(true);
    const [geoJsonText, setGeoJsonText] = useState("");
    const [importError, setImportError] = useState("");

    const toRad = (value) => (value * Math.PI) / 180;
    const haversineKm = (a, b) => {
        const R = 6371;
        const dLat = toRad(b.lat - a.lat);
        const dLng = toRad(b.lng - a.lng);
        const lat1 = toRad(a.lat);
        const lat2 = toRad(b.lat);
        const h =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
        return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    };

    const computedDistanceKm = useMemo(() => {
        const points = useWaypoints && formData.waypoints.length > 1
            ? formData.waypoints
            : (formData.departure_lat && formData.departure_lng && formData.destination_lat && formData.destination_lng)
                ? [
                    { lat: parseFloat(formData.departure_lat), lng: parseFloat(formData.departure_lng) },
                    { lat: parseFloat(formData.destination_lat), lng: parseFloat(formData.destination_lng) },
                  ]
                : [];
        if (points.length < 2) return null;
        let total = 0;
        for (let i = 1; i < points.length; i += 1) {
            total += haversineKm(points[i - 1], points[i]);
        }
        return total;
    }, [
        useWaypoints,
        formData.waypoints,
        formData.departure_lat,
        formData.departure_lng,
        formData.destination_lat,
        formData.destination_lng,
    ]);
    
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

    useEffect(() => {
        if (!useWaypoints) return;
        const points = formData.waypoints || [];
        if (points.length === 0) return;
        const first = points[0];
        const last = points[points.length - 1];
        setFormData(prev => ({
            ...prev,
            departure_lat: first?.lat ?? '',
            departure_lng: first?.lng ?? '',
            destination_lat: last?.lat ?? '',
            destination_lng: last?.lng ?? '',
        }));
    }, [useWaypoints, formData.waypoints]);

    useEffect(() => {
        if (!prefillWaypoints || prefillWaypoints.length < 2) return;
        setUseWaypoints(true);
        setFormData((prev) => ({
            ...prev,
            waypoints: prefillWaypoints,
        }));
    }, [prefillWaypoints]);

    useEffect(() => {
        if (formData.title) return;
        if (useWaypoints && formData.waypoints.length > 1) {
            setFormData((prev) => ({
                ...prev,
                title: `Маршрут (${prev.waypoints.length} точек)`,
            }));
            return;
        }
        if (formData.departure && formData.destination) {
            setFormData((prev) => ({
                ...prev,
                title: `${prev.departure} → ${prev.destination}`,
            }));
        }
    }, [useWaypoints, formData.waypoints, formData.departure, formData.destination, formData.title]);

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

    const normalizeWaypoints = (points) => {
        if (!Array.isArray(points)) return [];
        return points
            .filter((p) => p && typeof p.lat !== "undefined" && typeof p.lng !== "undefined")
            .map((p) => ({
                lat: Number(p.lat),
                lng: Number(p.lng),
            }))
            .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));
    };

    const parseGeoJson = (content) => {
        const data = JSON.parse(content);
        if (data?.type === "FeatureCollection" && data.features?.length) {
            return parseGeoJson(JSON.stringify(data.features[0]));
        }
        if (data?.type === "Feature") {
            return parseGeoJson(JSON.stringify(data.geometry));
        }
        if (data?.type === "LineString" && Array.isArray(data.coordinates)) {
            return data.coordinates.map((coord) => ({
                lng: coord[0],
                lat: coord[1],
            }));
        }
        throw new Error("Неподдерживаемый GeoJSON");
    };

    const parseGpx = (content) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(content, "application/xml");
        const points = [];
        const trkpts = xml.getElementsByTagName("trkpt");
        for (let i = 0; i < trkpts.length; i += 1) {
            const lat = trkpts[i].getAttribute("lat");
            const lng = trkpts[i].getAttribute("lon");
            if (lat && lng) {
                points.push({ lat: Number(lat), lng: Number(lng) });
            }
        }
        if (points.length === 0) {
            throw new Error("GPX не содержит точек");
        }
        return points;
    };

    const handleImportRouteFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setImportError("");
            const content = await file.text();
            if (!content.trim()) {
                alert("Файл пустой");
                return;
            }
            let points = [];
            if (file.name.toLowerCase().endsWith(".gpx")) {
                points = parseGpx(content);
            } else if (file.name.toLowerCase().endsWith(".geojson") || file.name.toLowerCase().endsWith(".json")) {
                points = parseGeoJson(content);
            } else {
                alert("Поддерживаются только .gpx и .geojson");
                return;
            }
            const normalized = normalizeWaypoints(points);
            if (normalized.length < 2) {
                alert("Недостаточно точек для маршрута");
                return;
            }
            setUseWaypoints(true);
            setFormData((prev) => ({
                ...prev,
                waypoints: normalized,
            }));
        } catch (error) {
            console.error("Import error:", error);
            setImportError("Не удалось импортировать файл маршрута");
            alert("Не удалось импортировать файл маршрута");
        } finally {
            e.target.value = "";
        }
    };

    const handleImportGeoJsonText = () => {
        try {
            setImportError("");
            if (!geoJsonText.trim()) {
                alert("Вставьте GeoJSON");
                return;
            }
            const points = normalizeWaypoints(parseGeoJson(geoJsonText));
            if (points.length < 2) {
                alert("Недостаточно точек для маршрута");
                return;
            }
            setUseWaypoints(true);
            setFormData((prev) => ({
                ...prev,
                waypoints: points,
            }));
            setGeoJsonText("");
        } catch (error) {
            console.error("GeoJSON text import error:", error);
            setImportError("Не удалось импортировать GeoJSON из текста");
            alert("Не удалось импортировать GeoJSON из текста");
        }
    };

    const getRoutePoints = () => {
        if (useWaypoints && formData.waypoints.length > 1) {
            return formData.waypoints.map((point) => ({
                lat: parseFloat(point.lat),
                lng: parseFloat(point.lng),
            }));
        }
        if (formData.departure_lat && formData.departure_lng && formData.destination_lat && formData.destination_lng) {
            return [
                { lat: parseFloat(formData.departure_lat), lng: parseFloat(formData.departure_lng) },
                { lat: parseFloat(formData.destination_lat), lng: parseFloat(formData.destination_lng) },
            ];
        }
        return [];
    };

    const downloadGeoJson = () => {
        const points = getRoutePoints();
        if (points.length < 2) {
            alert("Недостаточно точек для экспорта");
            return;
        }
        const feature = {
            type: "Feature",
            properties: {
                title: formData.title || "Маршрут",
                aircraft_type: formData.aircraft_type || null,
                flight_date: formData.flight_date || null,
                distance: formData.distance || (computedDistanceKm ? computedDistanceKm.toFixed(2) : null),
            },
            geometry: {
                type: "LineString",
                coordinates: points.map((p) => [p.lng, p.lat]),
            },
        };
        const dataStr = JSON.stringify(feature, null, 2);
        const blob = new Blob([dataStr], { type: "application/geo+json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${formData.title || "route"}.geojson`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let nextFormData = { ...formData };
            if (useWaypoints && formData.waypoints.length > 1) {
                const first = formData.waypoints[0];
                const last = formData.waypoints[formData.waypoints.length - 1];
                nextFormData = {
                    ...nextFormData,
                    departure: formData.departure || "Точка 1",
                    destination: formData.destination || `Точка ${formData.waypoints.length}`,
                    departure_lat: first?.lat ?? formData.departure_lat,
                    departure_lng: first?.lng ?? formData.departure_lng,
                    destination_lat: last?.lat ?? formData.destination_lat,
                    destination_lng: last?.lng ?? formData.destination_lng,
                };
            }
            const submitData = new FormData();
            Object.keys(nextFormData).forEach(key => {
                if (key === 'route_file') {
                    if (nextFormData[key]) {
                        submitData.append(key, nextFormData[key]);
                    }
                } else if (key === 'waypoints') {
                    if (nextFormData.waypoints && nextFormData.waypoints.length > 0) {
                        submitData.append('waypoints', JSON.stringify(nextFormData.waypoints));
                    }
                } else if (key === 'flight_duration') {
                    const duration = parseDuration(nextFormData[key]);
                    if (duration) {
                        submitData.append(key, duration);
                    }
                } else if (key.includes('_lat') || key.includes('_lng')) {
                    // Координаты - отправляем только если есть значение
                    if (nextFormData[key] && nextFormData[key] !== '') {
                        submitData.append(key, nextFormData[key]);
                    }
                } else if (nextFormData[key] !== null && nextFormData[key] !== '') {
                    submitData.append(key, nextFormData[key]);
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
        <Card>
            <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">
                    {route ? "Редактировать маршрут" : "Создать маршрут полета"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Название маршрута</label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

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

                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={useWaypoints}
                            onChange={(e) => setUseWaypoints(e.target.checked)}
                            name="use_waypoints"
                        />
                        Маршрут по точкам
                    </label>
                    <div className="min-w-[200px]">
                        <label className="text-sm text-muted-foreground">Доступ</label>
                        <select
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleChange}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                        >
                            <option value="public">Публичный</option>
                            <option value="followers">Только подписчики</option>
                            <option value="private">Только я</option>
                        </select>
                    </div>
                </div>

                {useWaypoints && (
                    <div className="bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-lg space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Кликайте по карте, чтобы добавлять точки.
                        </div>
                        {!mapEnabled && (
                            <div className="text-sm text-red-600 dark:text-red-400">
                                Карта временно недоступна. Используйте импорт GeoJSON.
                            </div>
                        )}
                        {!mapEnabled && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMapEnabled(true)}
                            >
                                Попробовать карту снова
                            </Button>
                        )}
                        <details className="bg-white dark:bg-[#0f0f0f] p-3 rounded">
                            <summary className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                                Импорт GeoJSON / GPX
                            </summary>
                            <div className="mt-3">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                    Импорт маршрута (GPX / GeoJSON)
                                </label>
                                <input
                                    type="file"
                                    accept=".gpx,.geojson,.json"
                                    onChange={handleImportRouteFile}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                            </div>
                            <div className="mt-3">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                    Вставить GeoJSON текстом
                                </label>
                                <Textarea
                                    value={geoJsonText}
                                    onChange={(e) => setGeoJsonText(e.target.value)}
                                    rows={4}
                                    placeholder='{"type":"Feature","geometry":{"type":"LineString","coordinates":[[37.4147,55.9736],[39.9566,43.4499]]}}'
                                />
                                <div className="mt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleImportGeoJsonText}
                                        disabled={!geoJsonText.trim()}
                                    >
                                        Импортировать из текста
                                    </Button>
                                </div>
                            </div>
                        </details>
                        {importError && (
                            <div className="text-sm text-red-600 dark:text-red-400">
                                {importError}
                            </div>
                        )}
                        {mapEnabled && (
                            <RouteMap
                                waypoints={formData.waypoints}
                                onWaypointsChange={(points) =>
                                    setFormData(prev => ({ ...prev, waypoints: points }))
                                }
                                allowMultiPoint
                                height="300px"
                                onTileError={() => setMapEnabled(false)}
                            />
                        )}
                        {formData.waypoints.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Точек в маршруте: {formData.waypoints.length}
                                </div>
                                {formData.waypoints.map((point, index) => (
                                    <div
                                        key={`wp-${index}`}
                                        className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <span>
                                            Точка {index + 1}: {parseFloat(point.lat).toFixed(5)}, {parseFloat(point.lng).toFixed(5)}
                                        </span>
                                        <button
                                            type="button"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    waypoints: prev.waypoints.filter((_, i) => i !== index),
                                                }));
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setFormData(prev => ({ ...prev, waypoints: [] }))}
                                    >
                                        Очистить точки
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={downloadGeoJson}
                                    >
                                        Экспорт GeoJSON
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!useWaypoints && formData.departure_lat && formData.departure_lng && formData.destination_lat && formData.destination_lng && (
                    <div className="mb-4">
                        <RouteMap
                            departure={formData.departure}
                            destination={formData.destination}
                            departureLat={formData.departure_lat}
                            departureLng={formData.departure_lng}
                            destinationLat={formData.destination_lat}
                            destinationLng={formData.destination_lng}
                            waypoints={formData.waypoints}
                            height="300px"
                            interactive={false}
                        />
                    </div>
                )}

                <div>
                    <label className="text-sm text-muted-foreground">Описание</label>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Дата полета</label>
                        <Input
                            name="flight_date"
                            type="date"
                            value={formData.flight_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Длительность (ЧЧ:ММ)</label>
                        <Input
                            name="flight_duration"
                            value={formatDuration(formData.flight_duration)}
                            onChange={handleChange}
                            placeholder="02:30"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            Формат: часы:минуты
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Расстояние (км)</label>
                        <Input
                            name="distance"
                            type="number"
                            value={formData.distance}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            {computedDistanceKm
                                ? `Расчет по карте: ${computedDistanceKm.toFixed(1)} км`
                                : "Можно рассчитать по карте"}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Тип самолета</label>
                        <Input
                            name="aircraft_type"
                            value={formData.aircraft_type}
                            onChange={handleChange}
                            placeholder="Например: Cessna 172"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (!computedDistanceKm) return;
                            setFormData(prev => ({
                                ...prev,
                                distance: computedDistanceKm.toFixed(2),
                            }));
                        }}
                        disabled={!computedDistanceKm}
                    >
                        Рассчитать расстояние
                    </Button>
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

                {/* доступ задается через поле "Доступ" */}

                <div className="flex gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : (route ? 'Обновить' : 'Создать')}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
    );
};

export default RouteForm;


                    // Координаты - отправляем только если есть значение
                    if (nextFormData[key] && nextFormData[key] !== '') {
                        submitData.append(key, nextFormData[key]);
                    }
                } else if (nextFormData[key] !== null && nextFormData[key] !== '') {
                    submitData.append(key, nextFormData[key]);
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
        <Card>
            <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">
                    {route ? "Редактировать маршрут" : "Создать маршрут полета"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Название маршрута</label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

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

                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={useWaypoints}
                            onChange={(e) => setUseWaypoints(e.target.checked)}
                            name="use_waypoints"
                        />
                        Маршрут по точкам
                    </label>
                    <div className="min-w-[200px]">
                        <label className="text-sm text-muted-foreground">Доступ</label>
                        <select
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleChange}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                        >
                            <option value="public">Публичный</option>
                            <option value="followers">Только подписчики</option>
                            <option value="private">Только я</option>
                        </select>
                    </div>
                </div>

                {useWaypoints && (
                    <div className="bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-lg space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Кликайте по карте, чтобы добавлять точки.
                        </div>
                        {!mapEnabled && (
                            <div className="text-sm text-red-600 dark:text-red-400">
                                Карта временно недоступна. Используйте импорт GeoJSON.
                            </div>
                        )}
                        {!mapEnabled && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMapEnabled(true)}
                            >
                                Попробовать карту снова
                            </Button>
                        )}
                        <details className="bg-white dark:bg-[#0f0f0f] p-3 rounded">
                            <summary className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                                Импорт GeoJSON / GPX
                            </summary>
                            <div className="mt-3">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                    Импорт маршрута (GPX / GeoJSON)
                                </label>
                                <input
                                    type="file"
                                    accept=".gpx,.geojson,.json"
                                    onChange={handleImportRouteFile}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                            </div>
                            <div className="mt-3">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                    Вставить GeoJSON текстом
                                </label>
                                <Textarea
                                    value={geoJsonText}
                                    onChange={(e) => setGeoJsonText(e.target.value)}
                                    rows={4}
                                    placeholder='{"type":"Feature","geometry":{"type":"LineString","coordinates":[[37.4147,55.9736],[39.9566,43.4499]]}}'
                                />
                                <div className="mt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleImportGeoJsonText}
                                        disabled={!geoJsonText.trim()}
                                    >
                                        Импортировать из текста
                                    </Button>
                                </div>
                            </div>
                        </details>
                        {importError && (
                            <div className="text-sm text-red-600 dark:text-red-400">
                                {importError}
                            </div>
                        )}
                        {mapEnabled && (
                            <RouteMap
                                waypoints={formData.waypoints}
                                onWaypointsChange={(points) =>
                                    setFormData(prev => ({ ...prev, waypoints: points }))
                                }
                                allowMultiPoint
                                height="300px"
                                onTileError={() => setMapEnabled(false)}
                            />
                        )}
                        {formData.waypoints.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Точек в маршруте: {formData.waypoints.length}
                                </div>
                                {formData.waypoints.map((point, index) => (
                                    <div
                                        key={`wp-${index}`}
                                        className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <span>
                                            Точка {index + 1}: {parseFloat(point.lat).toFixed(5)}, {parseFloat(point.lng).toFixed(5)}
                                        </span>
                                        <button
                                            type="button"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    waypoints: prev.waypoints.filter((_, i) => i !== index),
                                                }));
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setFormData(prev => ({ ...prev, waypoints: [] }))}
                                    >
                                        Очистить точки
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={downloadGeoJson}
                                    >
                                        Экспорт GeoJSON
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!useWaypoints && formData.departure_lat && formData.departure_lng && formData.destination_lat && formData.destination_lng && (
                    <div className="mb-4">
                        <RouteMap
                            departure={formData.departure}
                            destination={formData.destination}
                            departureLat={formData.departure_lat}
                            departureLng={formData.departure_lng}
                            destinationLat={formData.destination_lat}
                            destinationLng={formData.destination_lng}
                            waypoints={formData.waypoints}
                            height="300px"
                            interactive={false}
                        />
                    </div>
                )}

                <div>
                    <label className="text-sm text-muted-foreground">Описание</label>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Дата полета</label>
                        <Input
                            name="flight_date"
                            type="date"
                            value={formData.flight_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Длительность (ЧЧ:ММ)</label>
                        <Input
                            name="flight_duration"
                            value={formatDuration(formData.flight_duration)}
                            onChange={handleChange}
                            placeholder="02:30"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            Формат: часы:минуты
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Расстояние (км)</label>
                        <Input
                            name="distance"
                            type="number"
                            value={formData.distance}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            {computedDistanceKm
                                ? `Расчет по карте: ${computedDistanceKm.toFixed(1)} км`
                                : "Можно рассчитать по карте"}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Тип самолета</label>
                        <Input
                            name="aircraft_type"
                            value={formData.aircraft_type}
                            onChange={handleChange}
                            placeholder="Например: Cessna 172"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (!computedDistanceKm) return;
                            setFormData(prev => ({
                                ...prev,
                                distance: computedDistanceKm.toFixed(2),
                            }));
                        }}
                        disabled={!computedDistanceKm}
                    >
                        Рассчитать расстояние
                    </Button>
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

                {/* доступ задается через поле "Доступ" */}

                <div className="flex gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : (route ? 'Обновить' : 'Создать')}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
    );
};

export default RouteForm;
