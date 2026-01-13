import React, { useState, useEffect } from "react";
import { Avatar, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import useUserContext from "../contexts/UserContext";
import axios from "axios";

const Pilots = () => {
    const { axiosInstance } = useUserContext();
    const [pilots, setPilots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("-flight_hours");

    useEffect(() => {
        fetchPilots();
    }, [filter, sortBy]);

    const fetchPilots = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter !== "all") {
                params.pilot_type = filter;
            }
            if (sortBy) {
                params.order_by = sortBy;
            }
            const response = await axiosInstance.get("accounts/pilots/", { params });
            setPilots(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching pilots:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPilotTypeColor = (type) => {
        switch (type) {
            case "virtual":
                return "primary";
            case "real":
                return "success";
            case "both":
                return "secondary";
            default:
                return "default";
        }
    };

    return (
        <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
            <div className="bg-gray-100 dark:bg-[#030108] p-4">
                <h2 className="text-2xl font-bold dark:text-gray-100 mb-4">
                    ✈️ Сообщество пилотов
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    <Chip
                        label="Все"
                        onClick={() => setFilter("all")}
                        color={filter === "all" ? "primary" : "default"}
                        variant={filter === "all" ? "filled" : "outlined"}
                    />
                    <Chip
                        label="Виртуальные"
                        onClick={() => setFilter("virtual")}
                        color={filter === "virtual" ? "primary" : "default"}
                        variant={filter === "virtual" ? "filled" : "outlined"}
                    />
                    <Chip
                        label="Реальные"
                        onClick={() => setFilter("real")}
                        color={filter === "real" ? "primary" : "default"}
                        variant={filter === "real" ? "filled" : "outlined"}
                    />
                    <Chip
                        label="Оба типа"
                        onClick={() => setFilter("both")}
                        color={filter === "both" ? "primary" : "default"}
                        variant={filter === "both" ? "filled" : "outlined"}
                    />
                </div>

                <div className="flex gap-2 mb-4">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="p-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border-none"
                    >
                        <option value="-flight_hours">По часам налета (убывание)</option>
                        <option value="flight_hours">По часам налета (возрастание)</option>
                        <option value="username">По имени (А-Я)</option>
                        <option value="-username">По имени (Я-А)</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-8 dark:text-gray-400">Загрузка...</div>
                ) : pilots.length === 0 ? (
                    <div className="text-center py-8 dark:text-gray-400">
                        Пилоты не найдены
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pilots.map((pilot) => (
                            <Link
                                key={pilot.id}
                                to={`/user/${pilot.id}/`}
                                className="block bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition"
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar
                                        src={pilot.profile_pic || null}
                                        alt={pilot.username}
                                        sx={{ width: 64, height: 64 }}
                                    >
                                        {pilot.username?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold dark:text-gray-100">
                                                @{pilot.username}
                                            </h3>
                                            {pilot.pilot_type_display && (
                                                <Chip
                                                    label={pilot.pilot_type_display}
                                                    size="small"
                                                    color={getPilotTypeColor(pilot.pilot_type)}
                                                />
                                            )}
                                        </div>
                                        {pilot.bio && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {pilot.bio}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pilots;

