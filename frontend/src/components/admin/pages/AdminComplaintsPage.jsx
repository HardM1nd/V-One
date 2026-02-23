import React, { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import useUserContext from "../../../contexts/UserContext";

const STATUS_LABELS = {
    new: "Новая",
    in_progress: "В работе",
    closed: "Закрыта",
};

const AdminComplaintsPage = () => {
    const { axiosInstance } = useUserContext();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {};
                if (statusFilter) params.status = statusFilter;
                const res = await axiosInstance.get("admin/complaints/", { params });
                const data = res.data?.results || res.data || [];
                setItems(data);
            } catch (e) {
                console.error("Ошибка загрузки жалоб:", e);
                setError("Не удалось загрузить список жалоб.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [axiosInstance, statusFilter]);

    const filteredItems = items.filter((item) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
            item.text.toLowerCase().includes(s) ||
            item.category.toLowerCase().includes(s) ||
            item.user.username.toLowerCase().includes(s)
        );
    });

    const updateStatus = async (id, status) => {
        setSavingId(id);
        try {
            const res = await axiosInstance.patch(`admin/complaints/${id}/`, { status });
            const updated = res.data;
            setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
        } catch (e) {
            console.error("Ошибка обновления жалобы:", e);
            alert("Не удалось обновить статус жалобы.");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <Card className="rounded-2xl p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2 className="text-base md:text-lg font-semibold">Жалобы пользователей</h2>
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                    <Input
                        placeholder="Поиск по тексту, категории, пользователю..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64"
                    />
                    <select
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Все статусы</option>
                        <option value="new">Новые</option>
                        <option value="in_progress">В работе</option>
                        <option value="closed">Закрытые</option>
                    </select>
                </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {loading ? (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    Загрузка жалоб...
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    Жалоб не найдено.
                </div>
            ) : (
                <div className="rounded-xl border divide-y bg-card">
                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.5fr)] gap-3 px-3 py-2 text-xs font-medium text-muted-foreground">
                        <span>Пользователь / дата</span>
                        <span>Текст</span>
                        <span>Категория</span>
                        <span>Статус</span>
                    </div>
                    {filteredItems.map((complaint) => (
                        <div
                            key={complaint.id}
                            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.5fr)] gap-3 px-3 py-3 text-xs md:text-sm items-start"
                        >
                            <div className="space-y-1">
                                <div className="font-medium">{complaint.user.username}</div>
                                <div className="text-[11px] text-muted-foreground">
                                    {new Date(complaint.created).toLocaleString("ru-RU")}
                                </div>
                            </div>
                            <div className="text-xs md:text-sm whitespace-pre-wrap line-clamp-4">
                                {complaint.text}
                            </div>
                            <div className="text-xs md:text-sm">
                                {complaint.category || "—"}
                            </div>
                            <div className="flex flex-col gap-1 items-start">
                                <select
                                    className="h-8 rounded-md border bg-background px-2 text-xs md:text-sm"
                                    value={complaint.status}
                                    onChange={(e) =>
                                        updateStatus(
                                            complaint.id,
                                            e.target.value
                                        )
                                    }
                                    disabled={savingId === complaint.id}
                                >
                                    <option value="new">{STATUS_LABELS.new}</option>
                                    <option value="in_progress">{STATUS_LABELS.in_progress}</option>
                                    <option value="closed">{STATUS_LABELS.closed}</option>
                                </select>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full text-xs md:text-sm"
                                    onClick={() => updateStatus(complaint.id, complaint.status)}
                                    disabled={savingId === complaint.id}
                                >
                                    {savingId === complaint.id ? "Сохранение..." : "Сохранить"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default AdminComplaintsPage;

