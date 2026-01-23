import React from "react";

// Временная заглушка вместо карты (Leaflet отключен из-за проблем со сборкой CSS)
const RouteMap = ({
    departure,
    destination,
    height = "300px",
}) => {
    return (
        <div
            className="w-full rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/40 text-sm text-muted-foreground"
            style={{ height }}
        >
            <div className="text-center px-4">
                <p className="font-medium mb-1">
                    Карта маршрута временно отключена
                </p>
                <p>
                    {departure && destination
                        ? `${departure} → ${destination}`
                        : "Маршрут будет показан здесь, когда карта будет включена."}
                </p>
            </div>
        </div>
    );
};

export default RouteMap;

