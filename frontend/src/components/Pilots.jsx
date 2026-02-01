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

    return (
        <div className="w-[599px] max-w-[99%] mt-4 mx-auto">
            <Card className="bg-card p-4">
                <h2 className="text-2xl font-bold dark:text-gray-100 mb-4">
                    ✈️ Сообщество пилотов
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-3">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Поиск пилотов"
                        className="mb-4 min-w-[200px]"
                    />
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

                <div className="flex gap-2 mb-4">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    >
                        <option value="-flight_hours">По часам налета (убывание)</option>
                        <option value="flight_hours">По часам налета (возрастание)</option>
                        <option value="username">По имени (А-Я)</option>
                        <option value="-username">По имени (Я-А)</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : pilots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
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
                                className="transition hover:bg-accent/40"
                            >
                                <CardContent className="p-4">
                                    <div className="mt-4 flex items-start gap-4">
                                <Avatar className="h-14 w-14">
                                    <AvatarImage
                                        src={pilot?.profile_pic ? getMediaUrl(pilot.profile_pic) : ""}
                                        alt={pilot?.username}
                                    />
                                    <AvatarFallback>
                                        {pilot?.username?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold">
                                                        @{pilot.username}
                                                    </h3>
                                                    {pilot.pilot_type_display && (
                                                        <Badge variant={getPilotTypeBadge(pilot.pilot_type)}>
                                                            {pilot.pilot_type_display}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {user && user.id !== pilot.id && (
                                                    <Button
                                                        size="sm"
                                                        variant={pilot.is_following ? "outline" : "default"}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFollowToggle(pilot.id);
                                                        }}
                                                    >
                                                        {pilot.is_following ? "Отписаться" : "Подписаться"}
                                                    </Button>
                                                )}
                                            </div>
                                            {pilot.bio && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {pilot.bio}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                {pilot.flight_hours > 0 && (
                                                    <span>
                                                        ✈️ {parseFloat(pilot.flight_hours).toFixed(1)} ч
                                                    </span>
                                                )}
                                                {pilot.aircraft_types_list && pilot.aircraft_types_list.length > 0 && (
                                                    <span>
                                                        🛩️ {pilot.aircraft_types_list.slice(0, 2).join(", ")}
                                                        {pilot.aircraft_types_list.length > 2 && "..."}
                                                    </span>
                                                )}
                                                <span>
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
