import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";

const navElement = [
    { name: "Home", icon: "ant-design:home-filled", href: "/" },
    { name: "Explore", icon: "material-symbols:explore-outline-rounded", href: "/explore" },
    { name: "Pilots", icon: "material-symbols:flight-outline", href: "/pilots" },
    { name: "Routes", icon: "material-symbols:route-outline", href: "/routes" },
    { name: "Notifications", icon: "material-symbols:notifications-outline", href: "/notifications" },
    { name: "Likes", icon: "icon-park-solid:like", href: "/likes" },
    { name: "Saved", icon: "dashicons:cloud-saved", href: "/saved" },
    { name: "Profile", icon: "healthicons:ui-user-profile", href: "/profile" },
    { name: "Logout", icon: "oi:account-logout", href: "/logout" },
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
            className={`w-full h-full transition-all duration-300 relative  flex flex-col bg-white border-gray-300 dark:bg-black ${
                open ? "border-r-4" : "sm:border-r-4"
            }`}
        >
            <header
                className={`flex dark:bg-[#030409] w-[100%] bg-gray-100  h-14 lg:scale-[1_!important] transition origin-left duration-500 justify-center gap-4 dark:border-b-gray-900 text-2xl text-purple-500 items-center ${
                    !open && "scale-0"
                }`}
            >
                <h1 className="font-bold italic">V-one</h1>
            </header>
            <nav className="flex flex-col py-2 flex-grow overflow-y-scroll overflow-x-hidden">
                <button
                    className={`lg:hidden transition duration-300 rotate top-3 sm:top-4 text-purple-500 sm:absolute sm:left-auto sm:right-2 ${
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
                        el.name.toLowerCase() === cur
                            ? "text-purple-500 scale-110 hover"
                            : "text-gray-500 dark:text-gray-300";
                    return (
                        <Link
                            key={el.icon + el.name}
                            to={el.href}
                            className={`w-full flex text-left justify-left transition hover:scale-110 pl-[25%] items-center h-14 pt-3 ${activeClass}`}
                        >
                            <span className="text-[1.7rem] ">
                                <iconify-icon icon={el.icon}></iconify-icon>
                            </span>
                            <span
                                className={`text-[1.2rem] ${
                                    open ? "scale-1" : "scale-0"
                                } transition-all duration-200 pl-6 origin-right lg:scale-100`}
                            >
                                {el.name}
                            </span>
                            {el.name === "Notifications" && unreadCount > 0 && (
                                <span className="ml-auto mr-4 text-xs bg-purple-500 text-white rounded-full px-2 py-0.5">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default SideNav;
