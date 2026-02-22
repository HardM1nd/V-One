import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const userContext = createContext();

const defaultProfileData = {
    username: "",
    date_joined: "",
    profile_pic: "",
    following: "",
    follower: "",
};

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
            if (!userTokensFromStorage?.access) return null;
            const decoded = jwtDecode(userTokensFromStorage.access);
            if (decoded.exp != null && decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem("userTokens");
                return null;
            }
            return decoded;
        } catch (error) {
            localStorage.removeItem("userTokens");
            return null;
        }
    });

    const envApiUrl = import.meta.env.VITE_API_URL || "";
    const SERVERURL = envApiUrl
        ? envApiUrl.endsWith("/")
            ? envApiUrl
            : envApiUrl + "/"
        : "";

    const [profileData, setProfileData] = useState(defaultProfileData);
    const [tokens, setTokens] = useState(() => {
        if (!userTokensFromStorage?.access) return null;
        try {
            const decoded = jwtDecode(userTokensFromStorage.access);
            if (decoded.exp != null && decoded.exp * 1000 < Date.now()) {
                return null;
            }
        } catch {
            return null;
        }
        return userTokensFromStorage;
    });
    const tokensRef = useRef(tokens);

    useEffect(() => {
        tokensRef.current = tokens;
    }, [tokens]);

    const logout = useCallback(() => {
        setUser(null);
        setTokens(null);
        setProfileData(defaultProfileData);
        localStorage.removeItem("userTokens");
    }, []);

    const axiosInstance = useMemo(() => {
        return axios.create({
            baseURL: SERVERURL + "api",
        });
    }, [SERVERURL]);

    const refreshToken = useCallback(async () => {
        const currentTokens = tokensRef.current;
        if (!currentTokens || !currentTokens.refresh) {
            logout();
            return null;
        }
        try {
            const response = await axios.post(SERVERURL + "api/accounts/token/refresh/", {
                refresh: currentTokens.refresh,
            });
            const newTokens = {
                access: response.data.access,
                refresh: currentTokens.refresh,
            };
            setTokens(newTokens);
            tokensRef.current = newTokens;
            localStorage.setItem("userTokens", JSON.stringify(newTokens));
            if (newTokens.access) {
                setUser(jwtDecode(newTokens.access));
            }
            return newTokens.access;
        } catch (error) {
            logout();
            return null;
        }
    }, [SERVERURL, logout]);

    useEffect(() => {
        const requestId = axiosInstance.interceptors.request.use(
            (config) => {
                const currentTokens = tokensRef.current;
                if (currentTokens && currentTokens.access) {
                    config.headers.Authorization = `Bearer ${currentTokens.access}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseId = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url?.includes("token/refresh") &&
                    !originalRequest.url?.includes("token/") &&
                    !originalRequest.url?.includes("signup")
                ) {
                    originalRequest._retry = true;

                    const newAccessToken = await refreshToken();
                    if (newAccessToken) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axiosInstance(originalRequest);
                    }
                    if (window.location.pathname !== "/signin/") {
                        window.location.href = "/signin/";
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
                    const tokensData = response.data;
                    setUser(jwtDecode(tokensData.access));
                    setTokens(tokensData);
                    tokensRef.current = tokensData;
                    localStorage.setItem("userTokens", JSON.stringify(tokensData));
                }
            })
            .catch(() => {
                onfailure();
            });
    };

    const signup = (validatedData, onFailure) => {
        axiosInstance
            .post("/accounts/signup/", validatedData)
            .then((response) => {
                if (response.status < 400 && response.status >= 200) {
                    const { tokens: tokensData } = response.data;
                    setUser(jwtDecode(tokensData.access));
                    setTokens(tokensData);
                    tokensRef.current = tokensData;
                    localStorage.setItem("userTokens", JSON.stringify(tokensData));
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
        user,
        login,
        axiosInstance,
        logout,
        updateInfo,
        signup,
        profileData,
        setProfileData,
        isDemoUser: profileData?.is_read_only === true || profileData?.username === "DemoUser",
        isAdmin: user?.is_staff === true,
        fetchUserData,
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




