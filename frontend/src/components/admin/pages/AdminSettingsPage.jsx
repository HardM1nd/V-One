import React, { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import useUserContext from "../../../contexts/UserContext";

const AdminSettingsPage = () => {
    const { axiosInstance } = useUserContext();
    const [navItems, setNavItems] = useState([]);
    const [navLoading, setNavLoading] = useState(false);
    const [navError, setNavError] = useState(null);

    const [siteSettings, setSiteSettings] = useState(null);
    const [siteLoading, setSiteLoading] = useState(false);
    const [siteError, setSiteError] = useState(null);
    const [siteSaving, setSiteSaving] = useState(false);

    useEffect(() => {
        const loadNav = async () => {
            setNavLoading(true);
            setNavError(null);
            try {
                const res = await axiosInstance.get("admin/navigation/");
                const data = res.data || [];
                setNavItems(data);
            } catch (e) {
                console.error("Ошибка загрузки навигации:", e);
                setNavError("Не удалось загрузить конфигурацию навигации.");
            } finally {
                setNavLoading(false);
            }
        };

        const loadSettings = async () => {
            setSiteLoading(true);
            setSiteError(null);
            try {
                const res = await axiosInstance.get("admin/site-settings/");
                setSiteSettings(res.data);
            } catch (e) {
                console.error("Ошибка загрузки настроек сайта:", e);
                setSiteError("Не удалось загрузить настройки сайта.");
            } finally {
                setSiteLoading(false);
            }
        };

        loadNav();
        loadSettings();
    }, [axiosInstance]);

    const updateNavItem = (id, patch) => {
        setNavItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    };

    const saveNavigation = async () => {
        setNavLoading(true);
        setNavError(null);
        try {
            await axiosInstance.put("admin/navigation/", navItems);
        } catch (e) {
            console.error("Ошибка сохранения навигации:", e);
            setNavError("Не удалось сохранить конфигурацию навигации.");
        } finally {
            setNavLoading(false);
        }
    };

    const toggleMaintenance = async () => {
        if (!siteSettings) return;
        setSiteSaving(true);
        setSiteError(null);
        try {
            const res = await axiosInstance.put("admin/site-settings/", {
                ...siteSettings,
                is_closed_for_public: !siteSettings.is_closed_for_public,
            });
            setSiteSettings(res.data);
        } catch (e) {
            console.error("Ошибка переключения режима обслуживания:", e);
            setSiteError("Не удалось изменить режим обслуживания.");
        } finally {
            setSiteSaving(false);
        }
    };

    const saveMaintenanceMessage = async () => {
        if (!siteSettings) return;
        setSiteSaving(true);
        setSiteError(null);
        try {
            const res = await axiosInstance.put("admin/site-settings/", siteSettings);
            setSiteSettings(res.data);
        } catch (e) {
            console.error("Ошибка сохранения сообщения:", e);
            setSiteError("Не удалось сохранить сообщение режима обслуживания.");
        } finally {
            setSiteSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl p-4 md:p-6 space-y-3">
                <h2 className="text-base md:text-lg font-semibold">Навигация публичного сайта</h2>
                <p className="text-sm text-muted-foreground">
                    Изменяйте названия вкладок и их отображение в публичном sidebar.
                </p>
                {navError && <p className="text-xs text-destructive">{navError}</p>}
                {navLoading && navItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-4 text-xs text-muted-foreground">
                        Загрузка конфигурации навигации...
                    </div>
                ) : (
                    <div className="rounded-xl border divide-y bg-card overflow-hidden">
                        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-[11px] font-medium text-muted-foreground">
                            <span>Ключ / название</span>
                            <span>Расположение</span>
                            <span>Виден пользователям</span>
                            <span>Раздел активен</span>
                        </div>
                        {navItems.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 px-3 py-3 text-xs md:text-sm items-center"
                            >
                                <div className="space-y-1">
                                    <div className="text-[11px] text-muted-foreground">
                                        Ключ: <span className="font-mono">{item.key}</span>
                                    </div>
                                    <Input
                                        value={item.label}
                                        onChange={(e) =>
                                            updateNavItem(item.id, { label: e.target.value })
                                        }
                                        className="h-8"
                                    />
                                </div>
                                <div className="text-[11px] md:text-xs text-muted-foreground">
                                    {item.location === "public_sidebar"
                                        ? "Публичный sidebar"
                                        : "Админский sidebar"}
                                </div>
                                <label className="inline-flex items-center gap-2 text-xs">
                                    <input
                                        type="checkbox"
                                        className="h-3 w-3"
                                        checked={item.is_visible_for_users}
                                        onChange={(e) =>
                                            updateNavItem(item.id, {
                                                is_visible_for_users: e.target.checked,
                                            })
                                        }
                                    />
                                    <span>Показывать</span>
                                </label>
                                <label className="inline-flex items-center gap-2 text-xs">
                                    <input
                                        type="checkbox"
                                        className="h-3 w-3"
                                        checked={item.is_enabled}
                                        onChange={(e) =>
                                            updateNavItem(item.id, {
                                                is_enabled: e.target.checked,
                                            })
                                        }
                                    />
                                    <span>Раздел включён</span>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={saveNavigation}
                        disabled={navLoading || navItems.length === 0}
                    >
                        {navLoading ? "Сохранение..." : "Сохранить навигацию"}
                    </Button>
                </div>
            </Card>

            <Card className="rounded-2xl p-4 md:p-6 space-y-3">
                <h2 className="text-base md:text-lg font-semibold">Режим обслуживания</h2>
                <p className="text-sm text-muted-foreground">
                    Полностью закройте сайт для обычных пользователей. Администраторы сохраняют доступ.
                </p>
                {siteError && <p className="text-xs text-destructive">{siteError}</p>}
                {siteLoading && !siteSettings ? (
                    <div className="rounded-xl border border-dashed p-4 text-xs text-muted-foreground">
                        Загрузка настроек сайта...
                    </div>
                ) : (
                    siteSettings && (
                        <div className="space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                        Текущее состояние:
                                    </div>
                                    <div className="text-sm font-medium">
                                        {siteSettings.is_closed_for_public
                                            ? "Сайт закрыт для обычных пользователей"
                                            : "Сайт доступен пользователям"}
                                    </div>
                                </div>
                                <Button
                                    variant={
                                        siteSettings.is_closed_for_public
                                            ? "outline"
                                            : "destructive"
                                    }
                                    className="rounded-full"
                                    onClick={toggleMaintenance}
                                    disabled={siteSaving}
                                >
                                    {siteSaving
                                        ? "Применение..."
                                        : siteSettings.is_closed_for_public
                                        ? "Выключить режим обслуживания"
                                        : "Включить режим обслуживания"}
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">
                                    Сообщение для посетителей
                                </label>
                                <Input
                                    value={siteSettings.maintenance_message || ""}
                                    onChange={(e) =>
                                        setSiteSettings({
                                            ...siteSettings,
                                            maintenance_message: e.target.value,
                                        })
                                    }
                                />
                                <div className="flex justify-end pt-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full"
                                        onClick={saveMaintenanceMessage}
                                        disabled={siteSaving}
                                    >
                                        {siteSaving ? "Сохранение..." : "Сохранить сообщение"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </Card>
        </div>
    );
};

export default AdminSettingsPage;

