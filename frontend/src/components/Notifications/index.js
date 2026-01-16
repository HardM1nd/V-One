import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import { Button } from "@mui/material";

const Notifications = () => {
    const { axiosInstance } = useUserContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("accounts/notifications/");
            setNotifications(response.data.results || response.data);
            window.dispatchEvent(new Event("notifications:updated"));
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markRead = async (id) => {
        try {
            await axiosInstance.post(`accounts/notifications/${id}/read/`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            window.dispatchEvent(new Event("notifications:updated"));
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const markAllRead = async () => {
        try {
            await axiosInstance.post("accounts/notifications/read_all/");
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            window.dispatchEvent(new Event("notifications:updated"));
        } catch (error) {
            console.error("Error marking all read:", error);
        }
    };

    const buildLink = (notification) => {
        if (notification.target_type === "route" && notification.target_id) {
            return `/route/${notification.target_id}`;
        }
        if (notification.target_type === "post" && notification.target_id) {
            return `/post/${notification.target_id}`;
        }
        if (notification.target_type === "user" && notification.target_id) {
            return `/user/${notification.target_id}`;
        }
        return null;
    };

    return (
        <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
            <div className="bg-gray-100 dark:bg-[#030108] p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold dark:text-gray-100">🔔 Уведомления</h2>
                    <Button variant="outlined" onClick={markAllRead}>
                        Прочитать все
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-8 dark:text-gray-400">Загрузка...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 dark:text-gray-400">
                        Уведомлений пока нет
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => {
                            const link = buildLink(notification);
                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg ${
                                        notification.is_read
                                            ? "bg-gray-50 dark:bg-[#1a1a1a]"
                                            : "bg-purple-50 dark:bg-[#2a1f3d]"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                {notification.message || "Новое уведомление"}
                                            </div>
                                            {link && (
                                                <Link
                                                    to={link}
                                                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                                                >
                                                    Открыть
                                                </Link>
                                            )}
                                        </div>
                                        {!notification.is_read && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => markRead(notification.id)}
                                            >
                                                Прочитано
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;

