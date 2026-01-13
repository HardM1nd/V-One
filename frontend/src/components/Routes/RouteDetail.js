import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Avatar, Chip, IconButton, CircularProgress } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useUserContext from "../../contexts/UserContext";
import RouteForm from "./RouteForm";
import RouteMap from "./RouteMap";

const RouteDetail = () => {
    const { routeId } = useParams();
    const navigate = useNavigate();
    const { axiosInstance, user } = useUserContext();
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        fetchRoute();
    }, [routeId]);

    const fetchRoute = async () => {
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
    };

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

    const isOwner = user && route && user.id === route.pilot?.id;

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <CircularProgress />
            </div>
        );
    }

    if (!route) {
        return (
            <div className="text-center py-8 text-gray-500">
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
            <div className="bg-gray-100 dark:bg-[#030108] p-6 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={route.pilot?.profile_pic || null}
                            alt={route.pilot?.username}
                            sx={{ width: 48, height: 48 }}
                        >
                            {route.pilot?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                            <Link
                                to={`/user/${route.pilot?.id}/`}
                                className="text-lg font-semibold hover:text-purple-500 dark:text-gray-100"
                            >
                                @{route.pilot?.username}
                            </Link>
                            {route.created_display && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {route.created_display}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isOwner && (
                            <>
                                <IconButton onClick={() => setEditing(true)} color="primary">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={handleDelete} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        )}
                        <IconButton
                            onClick={handleLike}
                            color={route.is_liked ? "error" : "default"}
                        >
                            {route.is_liked ? (
                                <FavoriteIcon />
                            ) : (
                                <FavoriteBorderIcon />
                            )}
                        </IconButton>
                        <IconButton
                            onClick={handleSave}
                            color={route.is_saved ? "primary" : "default"}
                        >
                            {route.is_saved ? (
                                <BookmarkIcon />
                            ) : (
                                <BookmarkBorderIcon />
                            )}
                        </IconButton>
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-4 dark:text-gray-100">
                    {route.title}
                </h1>

                <div className="flex items-center gap-4 mb-4 text-lg">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <FlightTakeoffIcon />
                        <span className="font-semibold">{route.departure}</span>
                    </div>
                    <span className="text-gray-400 text-2xl">→</span>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <FlightLandIcon />
                        <span className="font-semibold">{route.destination}</span>
                    </div>
                </div>

                {route.description && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {route.description}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                    {route.aircraft_type && (
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Тип самолета:</span>
                            <Chip label={route.aircraft_type} className="ml-2" />
                        </div>
                    )}
                    {route.flight_date_display && (
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Дата полета:</span>
                            <span className="ml-2 dark:text-gray-300">{route.flight_date_display}</span>
                        </div>
                    )}
                    {route.flight_duration && (
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Длительность:</span>
                            <span className="ml-2 dark:text-gray-300">{formatDuration(route.flight_duration)}</span>
                        </div>
                    )}
                    {route.distance && (
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Расстояние:</span>
                            <span className="ml-2 dark:text-gray-300">{parseFloat(route.distance).toFixed(0)} км</span>
                        </div>
                    )}
                </div>

                {route.route_file && (
                    <div className="mb-4">
                        <a
                            href={route.route_file}
                            download
                            className="text-purple-500 hover:text-purple-700 dark:text-purple-400 underline"
                        >
                            📎 Скачать файл маршрута
                        </a>
                    </div>
                )}

                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>❤️ {route.likes_count || 0} лайков</span>
                    <span>🔖 {route.saves_count || 0} сохранений</span>
                </div>

                {(route.departure_lat && route.departure_lng && route.destination_lat && route.destination_lng) && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3 dark:text-gray-200">
                            Карта маршрута
                        </h3>
                        <RouteMap
                            departure={route.departure}
                            destination={route.destination}
                            departureLat={route.departure_lat}
                            departureLng={route.departure_lng}
                            destinationLat={route.destination_lat}
                            destinationLng={route.destination_lng}
                            interactive={false}
                            height="500px"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RouteDetail;

