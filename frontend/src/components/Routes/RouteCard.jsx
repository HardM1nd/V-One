import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getMediaUrl } from "../../lib/utils";

const RouteCardOptionsComponent = ({ onEdit, onDelete, onClose, showEdit }) => {
    useEffect(() => {
        window.addEventListener("click", onClose);
        return () => window.removeEventListener("click", onClose);
    }, [onClose]);

    return (
        <div className="flex flex-col items-start rounded-md text-sm border bg-card shadow z-20">
            {showEdit && (
                <>
                    <button
                        type="button"
                        className="flex gap-2 justify-between p-2 w-full hover:bg-accent"
                        onClick={onEdit}
                    >
                        <span>Редактировать</span>
                        <iconify-icon icon="material-symbols:edit" />
                    </button>
                    <div className="w-full h-px bg-border" />
                </>
            )}
            <button
                type="button"
                className="flex gap-2 justify-between p-2 w-full hover:bg-accent text-destructive"
                onClick={onDelete}
            >
                <span>Удалить</span>
                <iconify-icon icon="material-symbols:delete-rounded" />
            </button>
        </div>
    );
};

const RouteCard = ({ route, onLike, onSave, showActions = true }) => {
    const { axiosInstance, user, isAdmin } = useUserContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [openOptions, setOpenOptions] = useState(false);

    const currentUserId = user?.user_id ?? user?.id;
    const isOwner = currentUserId != null && route && Number(currentUserId) === Number(route.pilot?.id);
    const canManageMenu = isOwner || isAdmin;

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

        if (!isOwner && !isAdmin) {
            alert("У вас нет прав на удаление этого маршрута");
            return;
        }

        const confirmText = isAdmin && !isOwner
            ? "Удалить этот маршрут как администратор?"
            : "Вы уверены, что хотите удалить этот маршрут?";
        if (!window.confirm(confirmText)) return;

        try {
            setLoading(true);
            await axiosInstance.delete(`post/routes/${route.id}/delete/`);
            alert("Маршрут удалён");
            navigate(isOwner ? "/routes/?tab=my" : "/routes/");
        } catch (error) {
            console.error("Ошибка при удалении маршрута:", error);
            alert("Не удалось удалить маршрут");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenOptions(false);
        navigate(`/route/${route.id}?edit=1`);
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
            className="transition hover:bg-accent/40 mb-3 cursor-pointer overflow-hidden"
        >
            <CardContent className="p-3">
                <div className="mt-2 flex items-start gap-2 sm:gap-4">
                    <Avatar className="mt-5 h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
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

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold m-1 break-words">{route.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/user/${route.pilot?.id}/`);
                                        }}
                                        className="hover:text-primary cursor-pointer truncate"
                                    >
                                        @{route.pilot?.username}
                                    </span>
                                </div>
                            </div>

                            {showActions && (
                                <div className="flex gap-0.5 sm:gap-1 relative flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Лайк"
                                        className={`${route.is_liked ? "text-red-500" : ""} h-8 w-8 sm:h-10 sm:w-10`}
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
                                        className={`${route.is_saved ? "text-blue-500" : ""} h-8 w-8 sm:h-10 sm:w-10`}
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
                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                        onClick={handleCopyLink}
                                    >
                                        <iconify-icon icon="bi:link-45deg" />
                                    </Button>

                                    {canManageMenu && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setOpenOptions((prev) => !prev);
                                                }}
                                                className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10"
                                                title="Меню"
                                            >
                                                <span className="sr-only">Меню</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                            {openOptions && (
                                                <div className="absolute right-1 top-12 z-20">
                                                    <RouteCardOptionsComponent
                                                        onClose={() => setOpenOptions(false)}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        showEdit={isOwner}
                                                    />
                                                </div>
                                            )}
                                        </>
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
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2 break-words">
                                {route.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
                            {route.aircraft_type && (
                                <Badge variant="outline" className="whitespace-nowrap text-xs">{route.aircraft_type}</Badge>
                            )}
                            {waypointCount > 1 && (
                                <Badge variant="outline" className="whitespace-nowrap text-xs">
                                    Точек: {waypointCount}
                                </Badge>
                            )}
                            {route.flight_date_display && (
                                <span className="whitespace-nowrap">📅 {route.flight_date_display}</span>
                            )}
                            {route.flight_duration && (
                                <span className="whitespace-nowrap">
                                    ⏱️ {formatDuration(route.flight_duration)}
                                </span>
                            )}
                            {route.distance && (
                                <span className="whitespace-nowrap">
                                    📏 {parseFloat(route.distance).toFixed(0)} км
                                </span>
                            )}
                            {(route.likes_count > 0 ||
                                route.saves_count > 0) && (
                                <span className="whitespace-nowrap">
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
