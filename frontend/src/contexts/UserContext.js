import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { jwtDecode } from 'jwt-decode';
import axios from "axios";

const userContext = createContext();

const defaultProfileData = {
    username: "",
    date_joined: "",
    profile_pic: "",
    following: "",
    follower: "",
};

const pyAnywhere = "https://ogayanfe.pythonanywhere.com/";

function UserContextProvider({ children }) {
    const userTokensFromStorage = (() => {
        try {
            const stored = localStorage.getItem("userTokens");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    })();
    
    const [user, setUser] = useState(() => {
        try {
            return userTokensFromStorage && userTokensFromStorage.access 
                ? jwtDecode(userTokensFromStorage.access)
                : null;
        } catch (error) {
            // Если токен невалиден, очищаем
            localStorage.removeItem("userTokens");
            return null;
        }
    });
    
    const SERVERURL = ["localhost:3000",].includes(window.location.host)
        ? "http://localhost:8000/"
        : pyAnywhere;
    const [profileData, setProfileData] = useState(defaultProfileData);
    const [tokens, setTokens] = useState(userTokensFromStorage);
    const tokensRef = useRef(tokens);
    
    useEffect(() => {
        tokensRef.current = tokens;
    }, [tokens]);
    
    // Функция выхода
    const logout = useCallback(() => {
        setUser(null);
        setTokens(null);
        setProfileData(defaultProfileData);
        localStorage.removeItem("userTokens");
    }, []);

    // Создаем базовый axios instance
    const axiosInstance = useMemo(() => {
        return axios.create({
            baseURL: SERVERURL + "api",
        });
    }, [SERVERURL]);

    // Функция для обновления токена
    const refreshToken = useCallback(async () => {
        const currentTokens = tokensRef.current;
        if (!currentTokens || !currentTokens.refresh) {
            logout();
            return null;
        }
        try {
            const response = await axios.post(SERVERURL + "api/accounts/token/refresh/", {
                refresh: currentTokens.refresh
            });
            const newTokens = {
                access: response.data.access,
                refresh: currentTokens.refresh
            };
            setTokens(newTokens);
            tokensRef.current = newTokens;
            localStorage.setItem("userTokens", JSON.stringify(newTokens));
            if (newTokens.access) {
                setUser(jwtDecode(newTokens.access));
            }
            return newTokens.access;
        } catch (error) {
            // Если refresh token истек, выходим
            logout();
            return null;
        }
    }, [SERVERURL, logout]);

    useEffect(() => {
        // Interceptor для автоматического обновления токена при 401
        const requestId = axiosInstance.interceptors.request.use(
            (config) => {
                const currentTokens = tokensRef.current;
                if (currentTokens && currentTokens.access) {
                    config.headers.Authorization = `Bearer ${currentTokens.access}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const responseId = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                // Если ошибка 401 и это не запрос на обновление токена или логин
                if (error.response?.status === 401 && 
                    !originalRequest._retry &&
                    !originalRequest.url?.includes('token/refresh') &&
                    !originalRequest.url?.includes('token/') &&
                    !originalRequest.url?.includes('signup')) {
                    originalRequest._retry = true;
                    
                    const newAccessToken = await refreshToken();
                    if (newAccessToken) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axiosInstance(originalRequest);
                    } else {
                        // Если не удалось обновить токен, перенаправляем на логин
                        if (window.location.pathname !== '/signin/') {
                            window.location.href = '/signin/';
                        }
                    }
                }
                
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestId);
            axiosInstance.interceptors.response.eject(responseId);
        };
    }, [axiosInstance, refreshToken]);

    const fetchUserData = useCallback(async () => {
        const currentTokens = tokensRef.current;
        if (!currentTokens || !currentTokens.access) {
            return;
        }
        try {
            const response = await axiosInstance.get("accounts/info/");
            setProfileData(response.data);
        } catch (error) {
            // Если не удалось получить данные, interceptor попытается обновить токен
            // Если и это не помогло, пользователь будет разлогинен
            console.error("Error fetching user data:", error);
        }
    }, [axiosInstance]);

    const login = (data, onfailure) => {
        axiosInstance
            .post("/accounts/token/", {
                username: data.username,
                password: data.password,
            })
            .then((response) => {
                if (response.status === 200) {
                    data = response.data;
                    setUser(jwtDecode(data.access));
                    setTokens(data);
                    tokensRef.current = data;
                    localStorage.setItem("userTokens", JSON.stringify(data));
                }
            })
            .catch((err) => {
                onfailure();
            });
    };

    const signup = (validatedData, onFailure) => {
        axiosInstance
            .post("/accounts/signup/", validatedData)
            .then((response) => {
                if (response.status < 400 && response.status >= 200) {
                    const { tokens } = response.data;
                    setUser(jwtDecode(tokens.access));
                    setTokens(tokens);
                    tokensRef.current = tokens;
                    localStorage.setItem("userTokens", JSON.stringify(tokens));
                }
            })
            .catch((error) => onFailure(error));
    };

    const updateInfo = async (formData, onSuccess, onFailure) => {
        axiosInstance
            .patch("accounts/profile/update/", formData)
            .then((response) => {
                onSuccess(response);
            })
            .catch((e) => {
                onFailure(e);
            });
    };

    const authcontext = {
        user: user,
        login: login,
        axiosInstance: axiosInstance,
        logout: logout,
        updateInfo: updateInfo,
        signup: signup,
        profileData: profileData,
        setProfileData: setProfileData,
        isDemoUser: profileData.username === "DemoUser",
        fetchUserData: fetchUserData,
    };

    useEffect(() => {
        if (tokens && tokens.access) {
            fetchUserData();
        }
    }, [tokens, fetchUserData]);

    return <userContext.Provider value={authcontext}>{children}</userContext.Provider>;
}

const useUserContext = () => {
    return useContext(userContext);
};

export default useUserContext;
export { userContext, UserContextProvider };
