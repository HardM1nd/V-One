import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const RouteForm = ({ route = null, onSuccess }) => {
    const { axiosInstance } = useUserContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: route?.title || "",
        departure: route?.departure || "",
        destination: route?.destination || "",
        description: route?.description || "",
        flight_date: route?.flight_date || "",
        flight_duration: route?.flight_duration || "",
        distance: route?.distance || "",
        aircraft_type: route?.aircraft_type || "",
        visibility: route?.visibility || (route?.is_public === false ? "private" : "public"),
    });

    useEffect(() => {
        if (!formData.title && formData.departure && formData.destination) {
            setFormData((prev) => ({
                ...prev,
                title: `${prev.departure} → ${prev.destination}`,
            }));
        }
    }, [formData.departure, formData.destination, formData.title]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach((key) => {
                const value = formData[key];
                if (value !== null && value !== "") {
                    submitData.append(key, value);
                }
            });

            const url = route
                ? `post/routes/${route.id}/update/`
                : "post/routes/create/";
            const method = route ? "put" : "post";

            await axiosInstance[method](url, submitData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (onSuccess) {
                onSuccess();
            } else {
                navigate("/routes/");
            }
        } catch (error) {
            console.error("Error saving route:", error);
            alert("Ошибка при сохранении маршрута. Проверьте данные.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">
                    {route ? "Редактировать маршрут" : "Создать маршрут полета"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-muted-foreground">
                            Название маршрута
                        </label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground">
                                Точка отправления
                            </label>
                            <Input
                                name="departure"
                                value={formData.departure}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">
                                Точка назначения
                            </label>
                            <Input
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground">Описание</label>
                        <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Дата полета</label>
                            <Input
                                name="flight_date"
                                type="date"
                                value={formData.flight_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">
                                Длительность (ЧЧ:ММ)
                            </label>
                            <Input
                                name="flight_duration"
                                value={formData.flight_duration}
                                onChange={handleChange}
                                placeholder="02:30"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Расстояние (км)</label>
                            <Input
                                name="distance"
                                type="number"
                                value={formData.distance}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Тип самолета</label>
                            <Input
                                name="aircraft_type"
                                value={formData.aircraft_type}
                                onChange={handleChange}
                                placeholder="Например: Cessna 172"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Доступ</label>
                            <select
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleChange}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                <option value="public">Публичный</option>
                                <option value="followers">Только подписчики</option>
                                <option value="private">Только я</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Сохранение..." : route ? "Обновить" : "Создать"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default RouteForm;




