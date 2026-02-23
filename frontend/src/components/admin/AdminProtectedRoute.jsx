import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";

const AdminProtectedRoute = () => {
    const { user, isAdmin } = useUserContext();

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;

