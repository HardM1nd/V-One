import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, AlertTriangle, Activity, Settings } from "lucide-react";
import { cn } from "../../../lib/utils";

const links = [
    {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        to: "/admin/complaints",
        label: "Жалобы",
        icon: AlertTriangle,
    },
    {
        to: "/admin/activity",
        label: "Действия пользователей",
        icon: Activity,
    },
    {
        to: "/admin/settings",
        label: "Управление сайтом",
        icon: Settings,
    },
];

const AdminSidebar = () => {
    return (
        <aside className="hidden md:flex md:flex-col w-60 lg:w-64 border-r bg-background px-3 py-4 gap-4">
            <div className="px-2">
                <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
                    <span className="h-7 w-7 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                        A
                    </span>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight">Admin Panel</span>
                        <span className="text-[11px] text-muted-foreground leading-tight">
                            Управление платформой
                        </span>
                    </div>
                </div>
            </div>
            <nav className="flex-1 flex flex-col gap-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    "text-muted-foreground hover:text-foreground hover:bg-accent",
                                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                                )
                            }
                        >
                            <Icon className="h-4 w-4" />
                            <span>{link.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

export default AdminSidebar;

