import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import { Badge } from "../ui/badge";

const navElement = [
    { key: "home", label: "Главная", icon: "ant-design:home-filled", href: "/" },
    { key: "explore", label: "Обзор", icon: "material-symbols:explore-outline-rounded", href: "/explore" },
    { key: "pilots", label: "Пилоты", icon: "material-symbols:flight-outline", href: "/pilots" },
    { key: "routes", label: "Маршруты", icon: "material-symbols:route-outline", href: "/routes" },
    { key: "notifications", label: "Уведомления", icon: "material-symbols:notifications-outline", href: "/notifications" },
    { key: "likes", label: "Лайки", icon: "icon-park-solid:like", href: "/likes" },
    { key: "saved", label: "Сохраненные", icon: "dashicons:cloud-saved", href: "/saved" },
    { key: "profile", label: "Профиль", icon: "healthicons:ui-user-profile", href: "/profile" },
    { key: "logout", label: "Выход", icon: "oi:account-logout", href: "/logout" },
];

const SideNav = (props) => {
    const { setShowSidebar, open } = props;
    const { axiosInstance, user, fetchUserData } = useUserContext();
    const [unreadCount, setUnreadCount] = useState(0);

    const location = useLocation();
    let cur = location.pathname.split("/").at(1);
    if (cur.length === 0) cur = "home";

    const fetchUnread = useCallback(async () => {
        if (!user) {
            setUnreadCount(0);
            return;
        }
        try {
            const response = await axiosInstance.get("accounts/notifications/unread_count/");
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    }, [axiosInstance, user]);

    useEffect(() => {
        fetchUnread();
        const handleNotificationsUpdate = () => fetchUnread();
        window.addEventListener("notifications:updated", handleNotificationsUpdate);
        return () => {
            window.removeEventListener("notifications:updated", handleNotificationsUpdate);
        };
    }, [fetchUnread, fetchUserData]);

    return (
        <div
            className={`w-full h-full transition-all duration-300 relative flex flex-col bg-background border-border ${
                open ? "border-r" : "sm:border-r"
            }`}
        >
            <header
                className={`flex bg-muted/60 w-[100%] h-14 lg:scale-[1_!important] transition origin-left duration-500 justify-center gap-4 border-b text-2xl text-primary items-center ${
                    !open && "scale-0"
                }`}
            >
                <h1 className="font-bold italic">V-one</h1>
            </header>
            <nav className="flex flex-col py-2 flex-grow overflow-y-scroll overflow-x-hidden">
                <button
                    className={`lg:hidden transition duration-300 rotate top-3 sm:top-4 text-primary sm:absolute sm:left-auto sm:right-2 ${
                        open
                            ? "sm:rotate-[720deg] absolute left-auto right-2"
                            : "fixed left-4 sm:absolute sm:left-auto sm:right-2"
                    }`}
                    onClick={() => setShowSidebar((p) => !p)}
                    aria-hidden="true"
                >
                    <iconify-icon
                        icon="charm:menu-hamburger"
                        rotate={open ? "180deg" : ""}
                        width="30px"
                    >
                        Toggle Sidebar
                    </iconify-icon>
                </button>
                {navElement.map((el) => {
                    const activeClass =
                        el.key === cur
                            ? "text-primary bg-accent/60"
                            : "text-muted-foreground";
                    return (
                        <Link
                            key={el.icon + el.label}
                            to={el.href}
                            className={`w-full flex text-left justify-left transition pl-[22%] items-center h-12 gap-3 rounded-md px-2 hover:bg-accent ${activeClass}`}
                        >
                            <span className="text-[1.5rem] ">
                                <iconify-icon icon={el.icon}></iconify-icon>
                            </span>
                            <span
                                className={`text-[1.05rem] ${
                                    open ? "scale-1" : "scale-0"
                                } transition-all duration-200 pl-6 origin-right lg:scale-100`}
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
