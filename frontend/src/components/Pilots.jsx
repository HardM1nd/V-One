import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { getMediaUrl } from "../lib/utils";

const Pilots = () => {
    const { axiosInstance, user } = useUserContext();
    const navigate = useNavigate();
    const [pilots, setPilots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("-flight_hours");
    const [query, setQuery] = useState("");

    const fetchPilots = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter !== "all") {
                params.pilot_type = filter;
            }
            if (sortBy) {
                params.order_by = sortBy;
            }
            if (query) {
                params.q = query;
            }
            const response = await axiosInstance.get("accounts/pilots/", { params });
            setPilots(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching pilots:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, filter, sortBy, query]);

    useEffect(() => {
        fetchPilots();
    }, [fetchPilots]);

    const getPilotTypeBadge = (type) => {
        switch (type) {
            case "virtual":
                return "secondary";
            case "real":
                return "success";
            default:
                return "outline";
        }
    };

    const handleFollowToggle = async (pilotId) => {
        if (!user) {
            navigate("/signin/");
            return;
        }
        try {
            const response = await axiosInstance.post(`accounts/follow_unfollow/${pilotId}/`);
            const followed = response.data.followed;
            setPilots((prev) =>
                prev.map((pilot) =>
                    pilot.id === pilotId
                        ? {
                            ...pilot,
                            is_following: followed,
                            followers: Math.max(0, (pilot.followers || 0) + (followed ? 1 : -1)),
                        }
                        : pilot
                )
            );
        } catch (error) {
            console.error("Error follow/unfollow:", error);
        }
    };

    const truncateUsername = (username, maxLength = 5) => {
        if (username.length <= maxLength) return username;
        return username.substring(0, maxLength) + "...";
    };

    return (
        <div className="w-full max-w-[599px] mt-4 mx-auto px-2 sm:px-0">
            <Card className="bg-card p-3 sm:p-4">
                <h2 className="text-xl sm:text-2xl font-bold dark:text-gray-100 mb-4">
                    ✈️ Сообщество пилотов
                </h2>

                <div className="flex flex-col sm:flex-row justify-center items-center flex-wrap gap-2 mb-3">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Поиск пилотов"
                        className="w-full sm:min-w-[200px] mb-2 sm:mb-0"
                    />
                    <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
                    <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground mb-2 w-full"
                        >
                            <option value="-flight_hours">По часам налета (убывание)</option>
                            <option value="flight_hours">По часам налета (возрастание)</option>
                            <option value="username">По имени (А-Я)</option>
                            <option value="-username">По имени (Я-А)</option>
                        </select>
                        <Button
                            type="button"
                            onClick={() => setFilter("all")}
                            variant={filter === "all" ? "default" : "outline"}
                            size="sm"
                        >
                            Все
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setFilter("virtual")}
                            variant={filter === "virtual" ? "default" : "outline"}
                            size="sm"
                        >
                            Виртуальные
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setFilter("real")}
                            variant={filter === "real" ? "default" : "outline"}
                            size="sm"
                        >
                            Реальные
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : pilots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground mt-4">
                        Пилоты не найдены
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pilots.map((pilot) => (
                            <Card
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/user/${pilot.id}/`)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        navigate(`/user/${pilot.id}/`);
                                    }
                                }}
                                key={pilot.id}
                                className="transition hover:bg-accent/40 overflow-hidden"
                            >
                                <CardContent className="mt-3">
                                    <div className="mt-2 flex items-start gap-2 sm:gap-4">
                                        <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                                            <AvatarImage
                                                src={pilot?.profile_pic ? getMediaUrl(pilot.profile_pic) : ""}
                                                alt={pilot?.username}
                                            />
                                            <AvatarFallback>
                                                {pilot?.username?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <h3 className="text-base sm:text-lg font-semibold break-words truncate">
                                                        @{pilot.username}
                                                    </h3>
                                                </div>
                                                {user && user.id !== pilot.id && (
                                                    <Button
                                                        size="sm"
                                                        variant={pilot.is_following ? "outline" : "default"}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFollowToggle(pilot.id);
                                                        }}
                                                        className="flex-shrink-0 text-xs sm:text-sm px-2"
                                                    >
                                                        {pilot.is_following ? "Отписаться" : "Подписаться"}
                                                    </Button>
                                                )}
                                            </div>
                                            {pilot.bio && (
                                                <p className="text-sm text-muted-foreground mb-2 break-words">
                                                    {pilot.bio}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap justify-start gap-1.5 sm:gap-2 md:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                                                {pilot.pilot_type_display && (
                                                    <Badge variant={getPilotTypeBadge(pilot.pilot_type)} className="text-xs whitespace-nowrap">
                                                        {pilot.pilot_type_display}
                                                    </Badge>
                                                )}
                                                {pilot.flight_hours > 0 && (
                                                    <span className="whitespace-nowrap">
                                                        ✈️ {parseFloat(pilot.flight_hours).toFixed(1)} ч
                                                    </span>
                                                )}
                                                {pilot.aircraft_types_list && pilot.aircraft_types_list.length > 0 && (
                                                    <span className="break-words">
                                                        🛩️ {pilot.aircraft_types_list.slice(0, 2).join(", ")}
                                                        {pilot.aircraft_types_list.length > 2 && "..."}
                                                    </span>
                                                )}
                                                <span className="whitespace-nowrap">
                                                    👥 {pilot.followers} подписчиков
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Pilots;
