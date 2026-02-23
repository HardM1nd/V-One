import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Bell, UserPlus } from "lucide-react";
import useUserContext from "../../../contexts/UserContext";
import useThemeContext from "../../../contexts/themeContext";
import { Button } from "../../ui/button";
import { Avatar } from "../../ui/avatar";
import { Input } from "../../ui/input";
import { cn } from "../../../lib/utils";
import { DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "../../ui/dialog";

const AdminHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { profileData, logout, axiosInstance } = useUserContext();
    const { darkTheme, setDarkTheme } = useThemeContext();

    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [adminsOpen, setAdminsOpen] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [adminUserId, setAdminUserId] = useState("");
    const [adminLoading, setAdminLoading] = useState(false);

    const titleMap = {
        "/admin/dashboard": "Dashboard",
        "/admin/complaints": "Жалобы пользователей",
        "/admin/activity": "Действия пользователей",
        "/admin/settings": "Управление сайтом",
    };

    const title = titleMap[location.pathname] ?? "Админ‑панель";

    useEffect(() => {
        const loadUnread = async () => {
            try {
                const res = await axiosInstance.get("accounts/notifications/unread_count/");
                setUnreadCount(res.data?.unread_count || 0);
            } catch (e) {
                console.warn("Не удалось получить количество уведомлений:", e);
            }
        };
        loadUnread();
    }, [axiosInstance]);

    const loadNotifications = async () => {
        try {
            const res = await axiosInstance.get("accounts/notifications/", {
                params: { unread: 1 },
            });
            const all = res.data?.results || res.data || [];
            const onlySystem = all.filter((n) => n.type === "system");
            setSystemNotifications(onlySystem);
        } catch (e) {
            console.error("Не удалось загрузить уведомления системы:", e);
        }
    };

    const loadAdmins = async () => {
        setAdminLoading(true);
        try {
            const res = await axiosInstance.get("admin/admins/");
            const data = res.data || [];
            const list = Array.isArray(data.results) ? data.results : data;
            setAdmins(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error("Не удалось загрузить список администраторов:", e);
        } finally {
            setAdminLoading(false);
        }
    };

    const addAdmin = async () => {
        const id = Number(adminUserId);
        if (!id || Number.isNaN(id)) {
            alert("Укажите корректный ID пользователя.");
            return;
        }
        setAdminLoading(true);
        try {
            const res = await axiosInstance.post("admin/admins/", {
                user_id: id,
            });
            const newAdmin = res.data;
            setAdmins((prev) => {
                if (prev.some((u) => u.id === newAdmin.id)) return prev;
                return [...prev, newAdmin];
            });
            setAdminUserId("");
        } catch (e) {
            console.error("Не удалось выдать права администратора:", e);
            alert("Не удалось выдать права администратора. Проверьте ID пользователя.");
        } finally {
            setAdminLoading(false);
        }
    };

    const revokeAdmin = async (id) => {
        if (!window.confirm("Снять права администратора с этого пользователя?")) {
            return;
        }
        setAdminLoading(true);
        try {
            await axiosInstance.delete(`admin/admins/${id}/`);
            setAdmins((prev) => prev.filter((u) => u.id !== id));
        } catch (e) {
            console.error("Не удалось снять права администратора:", e);
            alert("Не удалось снять права администратора.");
        } finally {
            setAdminLoading(false);
        }
    };

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b bg-background px-4 py-3 md:px-6">
            <div>
                <h1 className="text-lg md:text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                    Панель управления для администраторов
                </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setDarkTheme((prev) => !prev)}
                    aria-label={
                        darkTheme
                            ? "Переключить на светлую тему"
                            : "Переключить на тёмную тему"
                    }
                >
                    <Sun className="h-4 w-4 dark:hidden" />
                    <Moon className="h-4 w-4 hidden dark:block" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                    onClick={async () => {
                        setNotificationsOpen((prev) => !prev);
                        if (!notificationsOpen) {
                            await loadNotifications();
                        }
                    }}
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-0.5 rounded-full bg-destructive text-[10px] flex items-center justify-center text-destructive-foreground">
                            {unreadCount}
                        </span>
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:inline-flex rounded-full"
                    onClick={() => {
                        setAdminsOpen(true);
                        loadAdmins();
                    }}
                >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Администратор
                </Button>

                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-2 rounded-full border px-2 py-1.5 md:px-3 md:py-1.5",
                        "bg-card hover:bg-accent transition-colors"
                    )}
                    onClick={() => {
                        logout();
                        navigate("/signin/");
                    }}
                >
                    <Avatar className="h-7 w-7">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                            {profileData?.username ? profileData.username[0]?.toUpperCase() : "A"}
                        </div>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-xs font-medium leading-tight">
                            {profileData?.username || "Администратор"}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                            Выйти из аккаунта
                        </span>
                    </div>
                </button>

                {notificationsOpen && (
                    <>
                        <DialogOverlay onClick={() => setNotificationsOpen(false)} />
                        <DialogContent
                            className="max-w-md"
                            onOverlayClick={() => setNotificationsOpen(false)}
                        >
                            <DialogHeader>
                                <DialogTitle>Уведомления системы</DialogTitle>
                            </DialogHeader>
                            <div className="mt-3 space-y-2 max-h-80 overflow-y-auto text-sm">
                                {systemNotifications.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Нет непрочитанных системных уведомлений.
                                    </p>
                                ) : (
                                    systemNotifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className="rounded-md border border-border bg-muted/40 px-3 py-2 space-y-1"
                                        >
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(n.created).toLocaleString("ru-RU")}
                                            </div>
                                            <div>{n.message}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </DialogContent>
                    </>
                )}

                {adminsOpen && (
                    <>
                        <DialogOverlay onClick={() => setAdminsOpen(false)} />
                        <DialogContent
                            className="max-w-lg"
                            onOverlayClick={() => setAdminsOpen(false)}
                        >
                            <DialogHeader>
                                <DialogTitle>Управление администраторами</DialogTitle>
                            </DialogHeader>
                            <div className="mt-3 space-y-4 text-sm">
                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground">
                                        Выдача прав администратора существующему пользователю по
                                        ID.
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="ID пользователя"
                                            value={adminUserId}
                                            onChange={(e) => setAdminUserId(e.target.value)}
                                            className="h-8"
                                        />
                                        <Button
                                            size="sm"
                                            className="rounded-full"
                                            onClick={addAdmin}
                                            disabled={adminLoading}
                                        >
                                            {adminLoading ? "Добавление..." : "Добавить"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Текущие администраторы
                                    </div>
                                    <div className="rounded-md border divide-y max-h-64 overflow-y-auto">
                                        {admins.length === 0 ? (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Администраторы не найдены.
                                            </div>
                                        ) : (
                                            admins.map((admin) => (
                                                <div
                                                    key={admin.id}
                                                    className="px-3 py-2 flex items-center justify-between gap-2 text-xs md:text-sm"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {admin.username}
                                                        </div>
                                                        {admin.email && (
                                                            <div className="text-[11px] text-muted-foreground">
                                                                {admin.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-full"
                                                        onClick={() => revokeAdmin(admin.id)}
                                                        disabled={adminLoading}
                                                    >
                                                        Снять права
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </>
                )}
            </div>
        </header>
    );
};

export default AdminHeader;

