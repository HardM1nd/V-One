import React, { useState } from "react";
import { Tab, Tabs } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import RouteList from "./RouteList";
import RouteForm from "./RouteForm";
import useUserContext from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

const Routes = () => {
    const [queryParams, setQueryParams] = useSearchParams();
    const { user } = useUserContext();
    const navigate = useNavigate();
    const currentTab = queryParams.get("tab") || "all";
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTabChange = (event, newValue) => {
        setQueryParams({ tab: newValue });
    };

    const handleRouteCreated = () => {
        setRefreshKey(prev => prev + 1);
        setQueryParams({ tab: "my" });
    };

    const getEndpoint = () => {
        switch (currentTab) {
            case "my":
                return "post/routes/my/";
            case "saved":
                return "post/routes/saved/";
            default:
                return "post/routes/";
        }
    };

    return (
        <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
            <div className="bg-gray-100 dark:bg-[#030108] p-4 mb-4">
                <h2 className="text-2xl font-bold dark:text-gray-100 mb-4">
                    ✈️ Маршруты полетов
                </h2>
                
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    className="mb-4"
                >
                    <Tab label="Все маршруты" value="all" />
                    {user && <Tab label="Мои маршруты" value="my" />}
                    {user && <Tab label="Сохраненные" value="saved" />}
                    {user && <Tab label="Создать" value="create" />}
                </Tabs>
            </div>

            <div>
                {currentTab === "create" ? (
                    <RouteForm onSuccess={handleRouteCreated} />
                ) : (
                    <RouteList 
                        key={refreshKey}
                        endpoint={getEndpoint()}
                        showFilters={currentTab === "all"}
                    />
                )}
            </div>
        </div>
    );
};

export default Routes;

