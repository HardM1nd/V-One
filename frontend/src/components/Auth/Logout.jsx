import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";

const Logout = () => {
    const { logout } = useUserContext();

    useEffect(() => {
        document.title = "V-One | Выход";
        return function () {
            document.title = "V-One";
        };
    }, []);

    logout();
    return <Navigate to="/signin" />;
};

export default Logout;
