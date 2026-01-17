import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";

const Notifications = () => {
    const { axiosInstance } = useUserContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextUrl, setNextUrl] = useState(null);
    const [unreadOnly, setUnreadOnly] = useState(false);

    const fetchNotifications = useCallback(async (url = null) => {
        try {
            setLoading(true);
            const requestUrl = url || "accounts/notifications/";
            const response = await axiosInstance.get(requestUrl, {
                params: url ? undefined : { unread: unreadOnly ? "1" : "" },
            });
            const data = response.data.results || response.data;
            if (url) {
                setNotifications((prev) => [...prev, ...data]);
            } else {
                setNotifications(data);
            }
            setNextUrl(response.data.next || null);
            window.dispatchEvent(new Event("notifications:updated"));
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, unreadOnly]);

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
            if (unreadOnly) {
                fetchNotifications();
            }
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

    const loadMore = () => {
        if (nextUrl) {
            fetchNotifications(nextUrl);
        }
    };

    return (
        <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
            <Card className="p-4">
                <CardHeader className="px-0 pt-0">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold">🔔 Уведомления</h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={unreadOnly ? "default" : "outline"}
                                onClick={() => setUnreadOnly((prev) => !prev)}
                            >
                                {unreadOnly ? "Все" : "Непрочитанные"}
                            </Button>
                            <Button variant="outline" onClick={markAllRead}>
                                Прочитать все
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Уведомлений пока нет
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => {
                            const link = buildLink(notification);
                            return (
                                <Card
                                    key={notification.id}
                                    className={`p-4 rounded-lg ${
                                        notification.is_read
                                            ? "bg-card"
                                            : "bg-primary/10"
                                    }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-1">
                                                <div className="text-sm text-foreground">
                                                    {notification.message || "Новое уведомление"}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {link && (
                                                        <Link
                                                            to={link}
                                                            className="text-sm text-primary hover:underline"
                                                            onClick={() => {
                                                                if (!notification.is_read) {
                                                                    markRead(notification.id);
                                                                }
                                                            }}
                                                        >
                                                            Открыть
                                                        </Link>
                                                    )}
                                                    {!notification.is_read && (
                                                        <Badge variant="secondary">Новое</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {!notification.is_read && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => markRead(notification.id)}
                                                >
                                                    Прочитано
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {nextUrl && (
                            <div className="flex justify-center pt-2">
                                <Button variant="outline" onClick={loadMore}>
                                    Показать еще
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Notifications;


import useUserContext from "../../contexts/UserContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";

const Notifications = () => {
    const { axiosInstance } = useUserContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextUrl, setNextUrl] = useState(null);
    const [unreadOnly, setUnreadOnly] = useState(false);

    const fetchNotifications = useCallback(async (url = null) => {
        try {
            setLoading(true);
            const requestUrl = url || "accounts/notifications/";
            const response = await axiosInstance.get(requestUrl, {
                params: url ? undefined : { unread: unreadOnly ? "1" : "" },
            });
            const data = response.data.results || response.data;
            if (url) {
                setNotifications((prev) => [...prev, ...data]);
            } else {
                setNotifications(data);
            }
            setNextUrl(response.data.next || null);
            window.dispatchEvent(new Event("notifications:updated"));
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, unreadOnly]);

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
            if (unreadOnly) {
                fetchNotifications();
            }
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

    const loadMore = () => {
        if (nextUrl) {
            fetchNotifications(nextUrl);
        }
    };

    return (
        <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
            <Card className="p-4">
                <CardHeader className="px-0 pt-0">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold">🔔 Уведомления</h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={unreadOnly ? "default" : "outline"}
                                onClick={() => setUnreadOnly((prev) => !prev)}
                            >
                                {unreadOnly ? "Все" : "Непрочитанные"}
                            </Button>
                            <Button variant="outline" onClick={markAllRead}>
                                Прочитать все
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Уведомлений пока нет
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => {
                            const link = buildLink(notification);
                            return (
                                <Card
                                    key={notification.id}
                                    className={`p-4 rounded-lg ${
                                        notification.is_read
                                            ? "bg-card"
                                            : "bg-primary/10"
                                    }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-1">
                                                <div className="text-sm text-foreground">
                                                    {notification.message || "Новое уведомление"}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {link && (
                                                        <Link
                                                            to={link}
                                                            className="text-sm text-primary hover:underline"
                                                            onClick={() => {
                                                                if (!notification.is_read) {
                                                                    markRead(notification.id);
                                                                }
                                                            }}
                                                        >
                                                            Открыть
                                                        </Link>
                                                    )}
                                                    {!notification.is_read && (
                                                        <Badge variant="secondary">Новое</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {!notification.is_read && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => markRead(notification.id)}
                                                >
                                                    Прочитано
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {nextUrl && (
                            <div className="flex justify-center pt-2">
                                <Button variant="outline" onClick={loadMore}>
                                    Показать еще
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Notifications;

