import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import RouteForm from "./RouteForm";
import RouteMap from "./RouteMap";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const RouteDetail = () => {
    const { routeId } = useParams();
    const navigate = useNavigate();
    const { axiosInstance, user } = useUserContext();
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    const fetchRoute = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`post/routes/${routeId}/`);
            setRoute(response.data);
        } catch (error) {
            console.error("Error fetching route:", error);
            navigate("/routes/");
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, navigate, routeId]);

    useEffect(() => {
        fetchRoute();
    }, [fetchRoute]);

    const handleLike = async () => {
        try {
            const response = await axiosInstance.post(`post/routes/${routeId}/like/`);
            setRoute(prev => ({
                ...prev,
                is_liked: response.data.liked,
                likes_count: response.data.likes_count,
            }));
        } catch (error) {
            console.error("Error liking route:", error);
        }
    };

    const handleSave = async () => {
        try {
            const response = await axiosInstance.post(`post/routes/${routeId}/save/`);
            setRoute(prev => ({
                ...prev,
                is_saved: response.data.saved,
                saves_count: response.data.saves_count,
            }));
        } catch (error) {
            console.error("Error saving route:", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Вы уверены, что хотите удалить этот маршрут?")) {
            return;
        }
        try {
            await axiosInstance.delete(`post/routes/${routeId}/delete/`);
            navigate("/routes/?tab=my");
        } catch (error) {
            console.error("Error deleting route:", error);
            alert("Ошибка при удалении маршрута");
        }
    };

    const handleUpdateSuccess = () => {
        setEditing(false);
        fetchRoute();
    };

    const formatDuration = (duration) => {
        if (!duration) return null;
        const parts = duration.split(':');
        if (parts.length === 3) {
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            if (hours > 0) {
                return `${hours}ч ${minutes}м`;
            }
            return `${minutes}м`;
        }
        return duration;
    };

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

    const getRoutePoints = () => {
        if (route?.waypoints && route.waypoints.length > 1) {
            return route.waypoints.map(point => ({
                lat: parseFloat(point.lat),
                lng: parseFloat(point.lng),
            }));
        }
        if (route?.departure_lat && route?.departure_lng && route?.destination_lat && route?.destination_lng) {
            return [
                { lat: parseFloat(route.departure_lat), lng: parseFloat(route.departure_lng) },
                { lat: parseFloat(route.destination_lat), lng: parseFloat(route.destination_lng) },
            ];
        }
        return [];
    };

    const calculateDistance = () => {
        const points = getRoutePoints();
        if (points.length < 2) return null;
        let total = 0;
        for (let i = 1; i < points.length; i += 1) {
            total += haversineKm(points[i - 1], points[i]);
        }
        return total;
    };

    const downloadGeoJson = () => {
        const points = getRoutePoints();
        if (points.length < 2) {
            alert("Недостаточно точек для экспорта");
            return;
        }
        const computedDistance = calculateDistance();
        const feature = {
            type: "Feature",
            properties: {
                title: route?.title || "Маршрут",
                aircraft_type: route?.aircraft_type || null,
                flight_date: route?.flight_date || null,
                distance: route?.distance || (computedDistance ? computedDistance.toFixed(2) : null),
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
        link.download = `route-${route?.id || "export"}.geojson`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const copyRouteLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Ссылка скопирована");
        } catch (error) {
            console.error("Copy error:", error);
            alert("Не удалось скопировать ссылку");
        }
    };

    const buildOsmUrl = () => {
        const points = getRoutePoints();
        if (points.length < 2) return null;
        const routeParam = points.map((p) => `${p.lat},${p.lng}`).join(";");
        return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${routeParam}`;
    };

    const isOwner = user && route && user.id === route.pilot?.id;

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
        );
    }

    if (!route) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Маршрут не найден
            </div>
        );
    }

    if (editing) {
        return (
            <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
                <RouteForm route={route} onSuccess={handleUpdateSuccess} />
            </div>
        );
    }

    return (
        <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={route.pilot?.profile_pic || ""} alt={route.pilot?.username} />
                                <AvatarFallback>
                                    {route.pilot?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <Link
                                    to={`/user/${route.pilot?.id}/`}
                                    className="text-lg font-semibold hover:text-primary"
                                >
                                    @{route.pilot?.username}
                                </Link>
                                {route.created_display && (
                                    <div className="text-sm text-muted-foreground">
                                        {route.created_display}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isOwner && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setEditing(true)}
                                        title="Редактировать"
                                    >
                                        <iconify-icon icon="bi:pencil" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={handleDelete}
                                        title="Удалить"
                                    >
                                        <iconify-icon icon="bi:trash" />
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLike}
                                className={route.is_liked ? "text-red-500" : ""}
                            >
                                <iconify-icon icon={route.is_liked ? "bi:heart-fill" : "bi:heart"} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSave}
                                className={route.is_saved ? "text-blue-500" : ""}
                            >
                                <iconify-icon icon={route.is_saved ? "bi:bookmark-fill" : "bi:bookmark"} />
                            </Button>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-4">{route.title}</h1>

                    <div className="flex items-center gap-4 mb-4 text-lg">
                        <div className="flex items-center gap-2 text-primary">
                            <iconify-icon icon="bi:airplane-engines" />
                            <span className="font-semibold">{route.departure}</span>
                        </div>
                        <span className="text-muted-foreground text-2xl">→</span>
                        <div className="flex items-center gap-2 text-emerald-600">
                            <iconify-icon icon="bi:geo-alt" />
                            <span className="font-semibold">{route.destination}</span>
                        </div>
                    </div>

                    {route.description && (
                        <div className="mb-4 p-4 bg-muted rounded-lg">
                            <p className="text-foreground whitespace-pre-wrap">{route.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        {route.aircraft_type && (
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Тип самолета:</span>
                                <Badge variant="outline">{route.aircraft_type}</Badge>
                            </div>
                        )}
                        {route.visibility_display && (
                            <div>
                                <span className="text-muted-foreground">Доступ:</span>
                                <span className="ml-2">{route.visibility_display}</span>
                            </div>
                        )}
                        {route.flight_date_display && (
                            <div>
                                <span className="text-muted-foreground">Дата полета:</span>
                                <span className="ml-2">{route.flight_date_display}</span>
                            </div>
                        )}
                        {route.flight_duration && (
                            <div>
                                <span className="text-muted-foreground">Длительность:</span>
                                <span className="ml-2">{formatDuration(route.flight_duration)}</span>
                            </div>
                        )}
                        {route.distance && (
                            <div>
                                <span className="text-muted-foreground">Расстояние:</span>
                                <span className="ml-2">{parseFloat(route.distance).toFixed(0)} км</span>
                            </div>
                        )}
                        {!route.distance && calculateDistance() && (
                            <div>
                                <span className="text-muted-foreground">Расстояние (по карте):</span>
                                <span className="ml-2">
                                    {calculateDistance().toFixed(0)} км
                                </span>
                            </div>
                        )}
                    </div>

                    {route.route_file && (
                        <div className="mb-4">
                            <a
                                href={route.route_file}
                                download
                                className="text-primary hover:underline"
                            >
                                📎 Скачать файл маршрута
                            </a>
                        </div>
                    )}
                    <div className="mb-4 flex flex-wrap gap-3">
                        <Button variant="outline" onClick={downloadGeoJson} type="button">
                            🧭 Скачать GeoJSON
                        </Button>
                        <Button variant="outline" onClick={copyRouteLink} type="button">
                            🔗 Скопировать ссылку
                        </Button>
                        {buildOsmUrl() && (
                            <Button asChild variant="outline">
                                <a href={buildOsmUrl()} target="_blank" rel="noreferrer">
                                    🗺️ Открыть в OSM
                                </a>
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                        <span>❤️ {route.likes_count || 0} лайков</span>
                        <span>🔖 {route.saves_count || 0} сохранений</span>
                    </div>

                    {((route.departure_lat && route.departure_lng && route.destination_lat && route.destination_lng) || (route.waypoints && route.waypoints.length > 1)) && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-3">Карта маршрута</h3>
                            <RouteMap
                                departure={route.departure}
                                destination={route.destination}
                                departureLat={route.departure_lat}
                                departureLng={route.departure_lng}
                                destinationLat={route.destination_lat}
                                destinationLng={route.destination_lng}
                                waypoints={route.waypoints || []}
                                interactive={false}
                                height="500px"
                            />
                            {route.waypoints && route.waypoints.length > 0 && (
                                <div className="mt-4 bg-muted p-3 rounded-lg">
                                    <div className="text-sm font-semibold mb-2">Точки маршрута</div>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        {route.waypoints.map((point, index) => (
                                            <div key={`wp-${index}`}>
                                                {index + 1}. {parseFloat(point.lat).toFixed(5)},{" "}
                                                {parseFloat(point.lng).toFixed(5)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RouteDetail;
