import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import { Badge } from "../ui/badge";

const navElement = [
    { key: "home", label: "Главная", icon: "ant-design:home-filled", href: "/" },
    {
        key: "explore",
        label: "Обзор",
        icon: "material-symbols:explore-outline-rounded",
        href: "/explore",
    },
    {
        key: "pilots",
        label: "Пилоты",
        icon: "material-symbols:flight",
        href: "/pilots",
    },
    {
        key: "routes",
        label: "Маршруты",
        icon: "material-symbols:route-outline",
        href: "/routes",
    },
    {
        key: "notifications",
        label: "Уведомления",
        icon: "material-symbols:notifications-outline",
        href: "/notifications",
    },
    { key: "likes", label: "Лайки", icon: "icon-park-solid:like", href: "/likes" },
    {
        key: "saved",
        label: "Сохраненные",
        icon: "dashicons:cloud-saved",
        href: "/saved",
    },
    {
        key: "profile",
        label: "Профиль",
        icon: "healthicons:ui-user-profile",
        href: "/profile",
    },
];

const SideNav = (props) => {
    const { setShowSidebar, open } = props;
    const { axiosInstance, user, profileData, fetchUserData } = useUserContext();
    const [unreadCount, setUnreadCount] = useState(0);
    const [navConfig, setNavConfig] = useState([]);

    const location = useLocation();
    let cur = location.pathname.split("/").at(1);
    if (cur.length === 0) cur = "home";

    // Only call auth-only API after session is verified (profile loaded); avoids 401 with stale/invalid token
    const sessionVerified = Boolean(user && profileData?.username);

    const fetchUnread = useCallback(async () => {
        if (!sessionVerified) {
            setUnreadCount(0);
            return;
        }
        try {
            const response = await axiosInstance.get(
                "accounts/notifications/unread_count/"
            );
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error fetching unread count:", error);
            }
            setUnreadCount(0);
        }
    }, [axiosInstance, sessionVerified]);

    useEffect(() => {
        fetchUnread();
        const handleNotificationsUpdate = () => fetchUnread();
        window.addEventListener("notifications:updated", handleNotificationsUpdate);
        return () => {
            window.removeEventListener("notifications:updated", handleNotificationsUpdate);
        };
    }, [fetchUnread, fetchUserData]);

    // Конфигурация навигации из backend (admin/navigation/public/)
    useEffect(() => {
        const loadNav = async () => {
            try {
                const res = await axiosInstance.get("admin/navigation/public/");
                setNavConfig(res.data || []);
            } catch (error) {
                // Если конфигурация недоступна, тихо используем дефолтный набор
                console.warn("Не удалось загрузить конфигурацию навигации:", error);
            }
        };
        loadNav();
    }, [axiosInstance]);

    const effectiveNav = useMemo(() => {
        if (!navConfig || navConfig.length === 0) return navElement;
        const configByKey = {};
        navConfig.forEach((item) => {
            configByKey[item.key] = item;
        });
        return navElement
            .filter((el) => {
                const cfg = configByKey[el.key];
                if (!cfg) return true;
                return cfg.is_visible_for_users && cfg.is_enabled;
            })
            .map((el) => {
                const cfg = configByKey[el.key];
                if (!cfg) return el;
                return {
                    ...el,
                    label: cfg.label || el.label,
                };
            });
    }, [navConfig]);

    return (
        <div
            className={`w-full h-full transition-all duration-300 relative flex flex-col bg-background border-border rounded-lg ${
                open ? "border-r" : "sm:border-r"
            }`}
        >
            <header
            className={`
                flex bg-muted/60 w-full h-14 justify-center gap-4
                border-b border-border dark:border-muted-foreground/20
                text-2xl text-primary items-center
                transition-all duration-300 rounded-r-lg
            `}
            >
            <h1 className={`font-bold transition-all duration-200 origin-right ${
                open ? "scale-1" : "scale-0"
            } lg:scale-100`}>V-One</h1>
            </header>
            <nav className="flex flex-col py-2 flex-grow overflow-y-auto overflow-x-hidden">
            <button
                className={`lg:hidden transition duration-1000 top-3 sm:top-4 text-primary absolute
                    ${open ? "right-2 rotate-[360deg]" : "left-2"}
                `}
                onClick={() => setShowSidebar((p) => !p)}
                aria-hidden="true"
            >
                <iconify-icon
                    icon="charm:menu-hamburger"
                    rotate={open ? "180deg" : ""}
                    width="30px"
                >
                    Открыть меню
                </iconify-icon>
            </button>
                {effectiveNav.map((el) => {
                    const activeClass =
                        el.key === cur
                            ? "text-primary bg-accent/60"
                            : "text-muted-foreground";
                    return (
                        <Link
                            key={el.icon + el.label}
                            to={el.href}
                            className={`w-full flex transition pl-[22%] items-center h-12 gap-3 rounded-r-lg px-2 hover:bg-accent ${activeClass}`}
                        >
                            <span className="text-[1.5rem] flex items-center justify-center ">
                                <iconify-icon icon={el.icon}></iconify-icon>
                            </span>
                            <span
                                className={`text-[1.05rem] ${
                                    open ? "scale-1" : "scale-0"
                                } transition-all duration-200 pl-3 origin-right lg:scale-100`}
                            >
                                {el.label}
                            </span>
                            {el.key === "notifications" && unreadCount > 0 && (
                                <Badge className="ml-auto mr-2" variant="default">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default SideNav;
