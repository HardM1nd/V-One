import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../contexts/UserContext";

export default function useRequireAuth() {
    const { user } = useUserContext();
    const navigate = useNavigate();

    return useCallback(
        (event) => {
            if (user) return true;
            event?.preventDefault();
            event?.stopPropagation();
            navigate("/signup/");
            return false;
        },
        [navigate, user]
    );
}
