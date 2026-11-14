import { Navigate } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";

function LoginRequiredRoute({ children }) {
    const { user } = useUserContext();
    return user ? children : <Navigate to="/signup/" replace />;
}

export default LoginRequiredRoute;
