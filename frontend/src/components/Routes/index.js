import React, { useState } from "react";
import { Tab, Tabs, Button } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import RouteList from "./RouteList";
import RouteForm from "./RouteForm";
import useUserContext from "../../contexts/UserContext";

const Routes = () => {
    const [queryParams, setQueryParams] = useSearchParams();
    const { user } = useUserContext();
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
            case "following":
                return "post/routes/following/";
            case "saved":
                return "post/routes/saved/";
            default:
                return "post/routes/";
        }
    };


    return (
        <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
            <div className="bg-gray-100 dark:bg-[#030108] p-4 mb-4">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                    <h2 className="text-2xl font-bold dark:text-gray-100">
                        ✈️ Маршруты
                    </h2>
                    {user && (
                        <Button
                            variant="contained"
                            onClick={() => setQueryParams({ tab: "create" })}
                        >
                            Создать маршрут
                        </Button>
                    )}
                </div>

                <Tabs
                    value={currentTab === "create" ? "all" : currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                >
                    <Tab label="Все" value="all" />
                    {user && <Tab label="Мои" value="my" />}
                    {user && <Tab label="Подписки" value="following" />}
                    {user && <Tab label="Сохраненные" value="saved" />}
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

