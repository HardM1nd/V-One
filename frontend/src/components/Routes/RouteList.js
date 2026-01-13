import React, { useState, useEffect } from "react";
import RouteCard from "./RouteCard";
import useUserContext from "../../contexts/UserContext";
import { CircularProgress, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const RouteList = ({ endpoint, pilotId = null, showFilters = true }) => {
    const { axiosInstance } = useUserContext();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextUrl, setNextUrl] = useState(null);
    const [filters, setFilters] = useState({
        aircraft_type: '',
        order_by: '-created',
    });

    useEffect(() => {
        fetchRoutes();
    }, [endpoint, pilotId, filters]);

    const fetchRoutes = async (url = null) => {
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

            const response = await axiosInstance.get(requestUrl, { params });
            const data = response.data.results || response.data;
            
            if (url) {
                // Загрузка следующей страницы
                setRoutes(prev => [...prev, ...data]);
            } else {
                setRoutes(data);
            }
            setNextUrl(response.data.next || null);
        } catch (error) {
            console.error("Error fetching routes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (routeId) => {
        try {
            const response = await axiosInstance.post(`post/routes/${routeId}/like/`);
            setRoutes(prev =>
                prev.map(route =>
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
            setRoutes(prev =>
                prev.map(route =>
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
                <CircularProgress />
            </div>
        );
    }

    if (routes.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Маршруты не найдены
            </div>
        );
    }

    return (
        <div>
            {showFilters && (
                <div className="bg-gray-100 dark:bg-[#030108] p-4 mb-4 rounded-lg flex gap-4 flex-wrap">
                    <TextField
                        label="Тип самолета"
                        value={filters.aircraft_type}
                        onChange={(e) =>
                            setFilters(prev => ({ ...prev, aircraft_type: e.target.value }))
                        }
                        size="small"
                        className="min-w-[200px]"
                    />
                    <FormControl size="small" className="min-w-[200px]">
                        <InputLabel>Сортировка</InputLabel>
                        <Select
                            value={filters.order_by}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, order_by: e.target.value }))
                            }
                            label="Сортировка"
                        >
                            <MenuItem value="-created">Новые сначала</MenuItem>
                            <MenuItem value="created">Старые сначала</MenuItem>
                            <MenuItem value="-flight_date">По дате полета (новые)</MenuItem>
                            <MenuItem value="flight_date">По дате полета (старые)</MenuItem>
                            <MenuItem value="-distance">По расстоянию (больше)</MenuItem>
                            <MenuItem value="distance">По расстоянию (меньше)</MenuItem>
                        </Select>
                    </FormControl>
                </div>
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
                    <button
                        onClick={loadMore}
                        className="text-purple-500 hover:text-purple-700 dark:text-purple-400 px-4 py-2 rounded-lg border border-purple-500"
                    >
                        Загрузить еще
                    </button>
                </div>
            )}
        </div>
    );
};

export default RouteList;

