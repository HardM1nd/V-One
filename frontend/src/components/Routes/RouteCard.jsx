import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getMediaUrl } from "../../lib/utils";

const RouteCard = ({ route, onLike, onSave, showActions = true }) => {
    const { axiosInstance, user } = useUserContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const isOwner = user && route && user.id === route.pilot?.id;

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onLike) {
            await onLike(route.id);
        } else {
            try {
                await axiosInstance.post(`post/routes/${route.id}/like/`);
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

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isOwner) {
            alert("У вас нет прав на удаление этого маршрута");
            return;
        }

        if (!window.confirm("Вы уверены, что хотите удалить этот маршрут?")) return;

        try {
            setLoading(true);
            await axiosInstance.delete(`post/routes/${route.id}/delete/`);
            alert("Маршрут удалён");
            navigate("/routes/?tab=my");
        } catch (error) {
            console.error("Ошибка при удалении маршрута:", error);
            alert("Не удалось удалить маршрут");
        } finally {
            setLoading(false);
        }
    };

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

    const formatDuration = (duration) => {
        if (!duration) return null;
        const parts = duration.split(":");
        if (parts.length === 3) {
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
        }
        return duration;
    };

    const waypointCount = Array.isArray(route.waypoints) ? route.waypoints.length : 0;

    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/route/${route.id}`)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    navigate(`/route/${route.id}`);
                }
            }}
            className="transition hover:bg-accent/40 mb-3 cursor-pointer"
        >
            <CardContent className="p-4">
                <div className="mt-2 flex items-start gap-4">
                    <Avatar className="mt-5 h-12 w-12">
                        <AvatarImage
                            src={
                                route.pilot?.profile_pic
                                    ? getMediaUrl(route.pilot.profile_pic)
                                    : ""
                            }
                            alt={route.pilot?.username}
                        />
                        <AvatarFallback>
                            {route.pilot?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">{route.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/user/${route.pilot?.id}/`);
                                        }}
                                        className="hover:text-primary cursor-pointer"
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Лайк"
                                        className={route.is_liked ? "text-red-500" : ""}
                                        onClick={handleLike}
                                    >
                                        <iconify-icon
                                            icon={
                                                route.is_liked
                                                    ? "bi:heart-fill"
                                                    : "bi:heart"
                                            }
                                        />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Сохранить"
                                        className={route.is_saved ? "text-blue-500" : ""}
                                        onClick={handleSave}
                                    >
                                        <iconify-icon
                                            icon={
                                                route.is_saved
                                                    ? "bi:bookmark-fill"
                                                    : "bi:bookmark"
                                            }
                                        />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Скопировать ссылку"
                                        onClick={handleCopyLink}
                                    >
                                        <iconify-icon icon="bi:link-45deg" />
                                    </Button>

                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Удалить маршрут"
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="text-destructive"
                                        >
                                            <iconify-icon icon="bi:trash" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mb-2 text-sm">
                            <div className="flex items-center gap-1 text-primary">
                                <iconify-icon icon="bi:airplane-engines" />
                                <span className="font-medium">{route.departure}</span>
                            </div>
                            <span className="text-muted-foreground">→</span>
                            <div className="flex items-center gap-1 text-emerald-600">
                                <iconify-icon icon="bi:geo-alt" />
                                <span className="font-medium">{route.destination}</span>
                            </div>
                        </div>

                        {route.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {route.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {route.aircraft_type && (
                                <Badge variant="outline">{route.aircraft_type}</Badge>
                            )}
                            {waypointCount > 1 && (
                                <Badge variant="outline">
                                    Точек: {waypointCount}
                                </Badge>
                            )}
                            {route.flight_date_display && (
                                <span>📅 {route.flight_date_display}</span>
                            )}
                            {route.flight_duration && (
                                <span>
                                    ⏱️ {formatDuration(route.flight_duration)}
                                </span>
                            )}
                            {route.distance && (
                                <span>
                                    📏 {parseFloat(route.distance).toFixed(0)} км
                                </span>
                            )}
                            {(route.likes_count > 0 ||
                                route.saves_count > 0) && (
                                <span>
                                    ❤️ {route.likes_count || 0} · 🔖{" "}
                                    {route.saves_count || 0}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RouteCard;
