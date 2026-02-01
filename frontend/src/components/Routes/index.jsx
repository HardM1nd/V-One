import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteList from "./RouteList";
import RouteForm from "./RouteForm";
import useUserContext from "../../contexts/UserContext";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const Routes = () => {
    const [queryParams, setQueryParams] = useSearchParams();
    const { user } = useUserContext();
    const currentTab = queryParams.get("tab") || "all";
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTabChange = (newValue) => {
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
        <div className="w-[599px] max-w-[99%] mt-3 mx-auto">
            <Card className="mb-4">
                <CardContent className="p-4 space-y-3">
                    <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                        <h2 className="text-2xl font-bold">✈️ Маршруты</h2>
                        {user && (
                            <Button onClick={() => setQueryParams({ tab: "create" })}>
                                Создать маршрут
                            </Button>
                        )}
                    </div>
                    <div className="flex justify-center gap-2">
                        {[
                            { label: "Все", value: "all" },
                            ...(user ? [{ label: "Мои", value: "my" }] : []),
                            ...(user ? [{ label: "Подписки", value: "following" }] : []),
                            ...(user ? [{ label: "Сохраненные", value: "saved" }] : []),
                        ].map((tab) => (
                            <Button
                                key={tab.value}
                                size="sm"
                                variant={(currentTab === "create" ? "all" : currentTab) === tab.value ? "default" : "outline"}
                                onClick={() => handleTabChange(tab.value)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

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

