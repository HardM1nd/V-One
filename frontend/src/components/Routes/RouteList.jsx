import React, { useState, useEffect, useCallback } from "react";
import RouteCard from "./RouteCard";
import useUserContext from "../../contexts/UserContext";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

const RouteList = ({ endpoint, pilotId = null, showFilters = true }) => {
    const { axiosInstance } = useUserContext();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextUrl, setNextUrl] = useState(null);
    const [filters, setFilters] = useState({
        q: "",
        aircraft_type: "",
        distance_min: "",
        distance_max: "",
        order_by: "-created",
    });
    const [filtersOpen, setFiltersOpen] = useState(false);

    const resetFilters = () => {
        setFilters({
            q: "",
            aircraft_type: "",
            distance_min: "",
            distance_max: "",
            order_by: "-created",
        });
    };

    const fetchRoutes = useCallback(
        async (url = null) => {
            try {
                setLoading(true);
                const requestUrl = url || endpoint;
                const params = {};

                if (pilotId) {
                    params.pilot = pilotId;
                }
                if (filters.aircraft_type) {
                    params.aircraft_type = filters.aircraft_type;
                }
                if (filters.order_by) {
                    params.order_by = filters.order_by;
                }
                if (filters.q) {
                    params.q = filters.q;
                }
                if (filters.distance_min) {
                    params.distance_min = filters.distance_min;
                }
                if (filters.distance_max) {
                    params.distance_max = filters.distance_max;
                }

                const response = await axiosInstance.get(requestUrl, { params });
                const data = response.data.results || response.data;

                if (url) {
                    setRoutes((prev) => [...prev, ...data]);
                } else {
                    setRoutes(data);
                }
                setNextUrl(response.data.next || null);
            } catch (error) {
                console.error("Error fetching routes:", error);
            } finally {
                setLoading(false);
            }
        },
        [axiosInstance, endpoint, pilotId, filters]
    );

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleLike = async (routeId) => {
        try {
            const response = await axiosInstance.post(`post/routes/${routeId}/like/`);
            setRoutes((prev) =>
                prev.map((route) =>
                    route.id === routeId
                        ? {
                              ...route,
                              is_liked: response.data.liked,
                              likes_count: response.data.likes_count,
                          }
                        : route
                )
            );
        } catch (error) {
            console.error("Error liking route:", error);
        }
    };

    const handleSave = async (routeId) => {
        try {
            const response = await axiosInstance.post(`post/routes/${routeId}/save/`);
            setRoutes((prev) =>
                prev.map((route) =>
                    route.id === routeId
                        ? {
                              ...route,
                              is_saved: response.data.saved,
                              saves_count: response.data.saves_count,
                          }
                        : route
                )
            );
        } catch (error) {
            console.error("Error saving route:", error);
        }
    };

    const loadMore = () => {
        if (nextUrl) {
            fetchRoutes(nextUrl);
        }
    };

    if (loading && routes.length === 0) {
        return (
            <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
        );
    }

    if (routes.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Маршруты не найдены
            </div>
        );
    }

    return (
        <div>
            {showFilters && (
                <Card className="mb-4">
                    <CardContent className="p-4 space-y-3">
                        <div className="mt-3 flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setFiltersOpen((prev) => !prev)}
                            >
                                {filtersOpen ? "Скрыть фильтры" : "Показать фильтры"}
                            </Button>
                            <Button variant="ghost" onClick={resetFilters}>
                                Сбросить
                            </Button>
                        </div>
                        {filtersOpen && (
                            <div className="flex gap-4 flex-wrap">
                                <Input
                                    placeholder="Поиск"
                                    value={filters.q}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            q: e.target.value,
                                        }))
                                    }
                                    className="min-w-[200px]"
                                />
                                <Input
                                    placeholder="Тип самолета"
                                    value={filters.aircraft_type}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            aircraft_type: e.target.value,
                                        }))
                                    }
                                    className="min-w-[200px]"
                                />
                                <Input
                                    placeholder="Мин. дистанция"
                                    value={filters.distance_min}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            distance_min: e.target.value,
                                        }))
                                    }
                                    type="number"
                                    className="min-w-[160px]"
                                />
                                <Input
                                    placeholder="Макс. дистанция"
                                    value={filters.distance_max}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            distance_max: e.target.value,
                                        }))
                                    }
                                    type="number"
                                    className="min-w-[160px]"
                                />
                                <select
                                    value={filters.order_by}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            order_by: e.target.value,
                                        }))
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground min-w-[200px]"
                                >
                                    <option value="-created">Новые сначала</option>
                                    <option value="created">Старые сначала</option>
                                    <option value="-flight_date">
                                        По дате полета (новые)
                                    </option>
                                    <option value="flight_date">
                                        По дате полета (старые)
                                    </option>
                                    <option value="-distance">
                                        По расстоянию (больше)
                                    </option>
                                    <option value="distance">
                                        По расстоянию (меньше)
                                    </option>
                                </select>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div>
                {routes.map((route) => (
                    <RouteCard
                        key={route.id}
                        route={route}
                        onLike={handleLike}
                        onSave={handleSave}
                    />
                ))}
            </div>

            {nextUrl && (
                <div className="text-center py-4">
                    <Button variant="outline" onClick={loadMore}>
                        Загрузить еще
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RouteList;

