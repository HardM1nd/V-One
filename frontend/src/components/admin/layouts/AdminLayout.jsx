import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../pages/AdminHeader";
import AdminSidebar from "../pages/AdminSidebar.jsx";

const AdminLayout = () => {
    return (
        <div className="min-h-screen w-screen bg-background text-foreground flex overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 flex flex-col bg-background">
                <AdminHeader />
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

