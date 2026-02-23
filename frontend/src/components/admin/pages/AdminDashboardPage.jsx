import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import useUserContext from "../../../contexts/UserContext";

const AdminDashboardPage = () => {
    const { axiosInstance } = useUserContext();
    const [metrics, setMetrics] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [metricsRes, activityRes] = await Promise.all([
                axiosInstance.get("admin/dashboard/metrics/"),
                axiosInstance.get("admin/dashboard/activity-chart/"),
            ]);
            setMetrics(metricsRes.data);
            setActivity(activityRes.data || []);
        } catch (e) {
            console.error("Ошибка загрузки данных дашборда:", e);
            setError("Не удалось загрузить данные дашборда.");
        } finally {
            setLoading(false);
        }
    }, [axiosInstance]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const maxCount = useMemo(
        () =>
            activity.length
                ? Math.max(
                      ...activity.map((p) => {
                          const value = p && typeof p.count === "number" ? p.count : 0;
                          return value || 0;
                      })
                  ) || 1
                : 1,
        [activity]
    );

    const formatShortDate = (value) => {
        try {
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return value;
            return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
        } catch {
            return value;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Пользователи всего</span>
                    <span className="text-2xl font-semibold">
                        {metrics ? metrics.total_users : "—"}
                    </span>
                </Card>
                <Card className="rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Активные за последние 24 часа</span>
                    <span className="text-2xl font-semibold">
                        {metrics ? metrics.active_last_day : "—"}
                    </span>
                </Card>
                <Card className="rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Новых жалоб за сутки</span>
                    <span className="text-2xl font-semibold">
                        {metrics ? metrics.new_complaints : "—"}
                    </span>
                </Card>
                <Card className="rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Действий за 24 часа</span>
                    <span className="text-2xl font-semibold">
                        {metrics ? metrics.actions_last_day : "—"}
                    </span>
                </Card>
            </div>

            <Card className="rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold">Активность пользователей</h2>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Количество зафиксированных действий по дням.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                        {loading ? "Обновление..." : "Обновить"}
                    </Button>
                </div>

                {error && (
                    <p className="text-xs md:text-sm text-destructive mb-3">
                        {error}
                    </p>
                )}

                {activity.length === 0 ? (
                    <div className="h-48 md:h-64 rounded-xl bg-background flex items-center justify-center text-xs text-muted-foreground border border-border/60">
                        Пока нет данных об активности пользователей.
                    </div>
                ) : (
                    <div className="h-48 md:h-64 rounded-xl bg-background px-4 py-3 flex items-end gap-2 overflow-x-auto border border-border/60">
                        {activity.map((point) => {
                            const count =
                                point && typeof point.count === "number" ? point.count : 0;
                            const heightPercent = (count / maxCount) * 100;
                            return (
                                <div
                                    key={point.date}
                                    className="flex flex-col items-center gap-1 min-w-[36px]"
                                >
                                    <div
                                        className="w-4 rounded-full bg-primary/80 shadow-sm"
                                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatShortDate(point.date)}
                                    </span>
                                    <span className="text-[10px] text-foreground font-medium">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminDashboardPage;

