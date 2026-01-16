import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Chip, IconButton, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import useUserContext from "../../contexts/UserContext";

const RouteCard = ({ route, onLike, onSave, showActions = true }) => {
    const { axiosInstance } = useUserContext();
    const navigate = useNavigate();
    
    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onLike) {
            await onLike(route.id);
        } else {
            try {
                await axiosInstance.post(`post/routes/${route.id}/like/`);
                // Обновление будет через родительский компонент
            } catch (error) {
                console.error("Error liking route:", error);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSave) {
            await onSave(route.id);
        } else {
            try {
                await axiosInstance.post(`post/routes/${route.id}/save/`);
            } catch (error) {
                console.error("Error saving route:", error);
            }
        }
    };

    const formatDuration = (duration) => {
        if (!duration) return null;
        // Предполагаем формат "HH:MM:SS" или количество секунд
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

    const waypointCount = Array.isArray(route.waypoints) ? route.waypoints.length : 0;

    const handleCopyLink = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const link = `${window.location.origin}/route/${route.id}/`;
        try {
            await navigator.clipboard.writeText(link);
            alert("Ссылка скопирована");
        } catch (error) {
            console.error("Copy error:", error);
            alert("Не удалось скопировать ссылку");
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/route/${route.id}`)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    navigate(`/route/${route.id}`);
                }
            }}
            className="block bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition mb-3 cursor-pointer"
        >
            <div className="flex items-start gap-4">
                <Avatar
                    src={route.pilot?.profile_pic || null}
                    alt={route.pilot?.username}
                    sx={{ width: 48, height: 48 }}
                >
                    {route.pilot?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-semibold dark:text-gray-100 mb-1">
                                {route.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/user/${route.pilot?.id}/`);
                                    }}
                                    className="hover:text-purple-500 cursor-pointer"
                                    role="link"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.stopPropagation();
                                            navigate(`/user/${route.pilot?.id}/`);
                                        }
                                    }}
                                >
                                    @{route.pilot?.username}
                                </span>
                                {route.created_display && (
                                    <>
                                        <span>•</span>
                                        <span>{route.created_display}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {showActions && (
                            <div className="flex gap-1">
                                <Tooltip title="Лайк">
                                    <IconButton
                                        size="small"
                                        onClick={handleLike}
                                        color={route.is_liked ? "error" : "default"}
                                    >
                                        {route.is_liked ? (
                                            <FavoriteIcon fontSize="small" />
                                        ) : (
                                            <FavoriteBorderIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Сохранить">
                                    <IconButton
                                        size="small"
                                        onClick={handleSave}
                                        color={route.is_saved ? "primary" : "default"}
                                    >
                                        {route.is_saved ? (
                                            <BookmarkIcon fontSize="small" />
                                        ) : (
                                            <BookmarkBorderIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Скопировать ссылку">
                                    <IconButton
                                        size="small"
                                        onClick={handleCopyLink}
                                        color="default"
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mb-2 text-sm">
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                            <FlightTakeoffIcon fontSize="small" />
                            <span className="font-medium">{route.departure}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <FlightLandIcon fontSize="small" />
                            <span className="font-medium">{route.destination}</span>
                        </div>
                    </div>

                    {route.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                            {route.description}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                        {route.aircraft_type && (
                            <Chip
                                label={route.aircraft_type}
                                size="small"
                                variant="outlined"
                            />
                        )}
                        {waypointCount > 1 && (
                            <Chip
                                label={`Точек: ${waypointCount}`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                        {route.flight_date_display && (
                            <span>📅 {route.flight_date_display}</span>
                        )}
                        {route.flight_duration && (
                            <span>⏱️ {formatDuration(route.flight_duration)}</span>
                        )}
                        {route.distance && (
                            <span>📏 {parseFloat(route.distance).toFixed(0)} км</span>
                        )}
                        {(route.likes_count > 0 || route.saves_count > 0) && (
                            <span>
                                ❤️ {route.likes_count || 0} · 🔖 {route.saves_count || 0}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteCard;

