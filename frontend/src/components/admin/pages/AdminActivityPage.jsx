import React, { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import useUserContext from "../../../contexts/UserContext";

const AdminActivityPage = () => {
    const { axiosInstance } = useUserContext();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get("admin/activity/");
                const data = res.data?.results || res.data || [];
                setItems(data);
            } catch (e) {
                console.error("Ошибка загрузки логов действий:", e);
                setError("Не удалось загрузить действия пользователей.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [axiosInstance]);

    const filtered = items.filter((item) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
            item.action.toLowerCase().includes(s) ||
            (item.user?.username || "").toLowerCase().includes(s) ||
            (item.path || "").toLowerCase().includes(s) ||
            (item.ip_address || "").toLowerCase().includes(s)
        );
    });

    return (
        <Card className="rounded-2xl p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2 className="text-base md:text-lg font-semibold">Действия пользователей</h2>
                <Input
                    placeholder="Поиск по пользователю, действию, пути, IP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-72"
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {loading ? (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    Загрузка действий...
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    Пока нет записей о действиях пользователей.
                </div>
            ) : (
                <div className="rounded-xl border divide-y bg-card">
                    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-xs font-medium text-muted-foreground">
                        <span>Пользователь / время</span>
                        <span>Действие</span>
                        <span>Путь</span>
                        <span>IP</span>
                    </div>
                    {filtered.map((log) => (
                        <div
                            key={log.id}
                            className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)] gap-3 px-3 py-3 text-xs md:text-sm items-start"
                        >
                            <div className="space-y-1">
                                <div className="font-medium">
                                    {log.user?.username || "Системное действие"}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                    {new Date(log.created).toLocaleString("ru-RU")}
                                </div>
                            </div>
                            <div className="text-xs md:text-sm whitespace-pre-wrap">
                                {log.action}
                            </div>
                            <div className="text-xs md:text-sm break-all text-muted-foreground">
                                {log.path || "—"}
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground">
                                {log.ip_address || "—"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default AdminActivityPage;

