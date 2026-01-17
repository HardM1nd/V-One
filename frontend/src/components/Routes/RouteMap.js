import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Исправление иконок для Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const RouteMap = ({ 
    departure, 
    destination, 
    departureLat, 
    departureLng, 
    destinationLat, 
    destinationLng,
    waypoints = [],
    height = "400px",
    interactive = true,
    onLocationSelect = null,
    onWaypointsChange = null,
    allowMultiPoint = false,
    onTileError = null
}) => {
    const mapRef = useRef(null);
    const hasWaypoints = Array.isArray(waypoints) && waypoints.length > 1;
    const hasCoordinates = departureLat && departureLng && destinationLat && destinationLng;
    
    // Центр карты
    const center = hasWaypoints
        ? [parseFloat(waypoints[0].lat), parseFloat(waypoints[0].lng)]
        : hasCoordinates
            ? [(parseFloat(departureLat) + parseFloat(destinationLat)) / 2, 
               (parseFloat(departureLng) + parseFloat(destinationLng)) / 2]
        : [55.7558, 37.6173]; // Москва по умолчанию

    // Координаты для маршрута
    const routeCoordinates = hasWaypoints
        ? waypoints.map((point) => [parseFloat(point.lat), parseFloat(point.lng)])
        : hasCoordinates
            ? [
                [parseFloat(departureLat), parseFloat(departureLng)],
                [parseFloat(destinationLat), parseFloat(destinationLng)]
              ]
            : [];

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (!interactive) return;
                const { lat, lng } = e.latlng;
                if (allowMultiPoint && onWaypointsChange) {
                    const newPoint = { lat, lng };
                    const nextPoints = [...(waypoints || []), newPoint];
                    onWaypointsChange(nextPoints);
                    return;
                }
                if (!onLocationSelect) return;
                if (!departureLat || !departureLng) {
                    onLocationSelect("departure", lat, lng);
                    return;
                }
                if (!destinationLat || !destinationLng) {
                    onLocationSelect("destination", lat, lng);
                    return;
                }
                onLocationSelect("departure", lat, lng);
                onLocationSelect("destination", null, null);
            },
        });
        return null;
    };

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    if (!hasCoordinates && !hasWaypoints && !interactive) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                    Координаты маршрута не указаны
                </p>
            </div>
        );
    }

    return (
        <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
            <MapContainer
                key={`${interactive}-${allowMultiPoint}-${waypoints.length}-${departureLat || ""}-${destinationLat || ""}`}
                center={center}
                zoom={(hasWaypoints || hasCoordinates) ? 6 : 5}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={interactive}
                whenCreated={(map) => {
                    mapRef.current = map;
                }}
            >
                <MapClickHandler />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    eventHandlers={onTileError ? { tileerror: onTileError } : undefined}
                />
                
                {hasWaypoints && (
                    <>
                        {waypoints.map((point, index) => (
                            <Marker
                                key={`wp-${index}`}
                                position={[parseFloat(point.lat), parseFloat(point.lng)]}
                            >
                                <Popup>
                                    <strong>Точка {index + 1}</strong>
                                </Popup>
                            </Marker>
                        ))}
                        <Polyline
                            positions={routeCoordinates}
                            color="blue"
                            weight={3}
                            opacity={0.7}
                        />
                    </>
                )}
                {!hasWaypoints && hasCoordinates && (
                    <>
                        <Marker position={[parseFloat(departureLat), parseFloat(departureLng)]}>
                            <Popup>
                                <strong>Отправление:</strong> {departure}
                            </Popup>
                        </Marker>
                        <Marker position={[parseFloat(destinationLat), parseFloat(destinationLng)]}>
                            <Popup>
                                <strong>Назначение:</strong> {destination}
                            </Popup>
                        </Marker>
                        <Polyline
                            positions={routeCoordinates}
                            color="blue"
                            weight={3}
                            opacity={0.7}
                        />
                    </>
                )}
            </MapContainer>
            {interactive && allowMultiPoint && (
                <div className="bg-blue-50 dark:bg-blue-900 p-2 text-sm text-center">
                    Кликните по карте, чтобы добавлять точки маршрута
                </div>
            )}
            {interactive && !allowMultiPoint && !hasCoordinates && (
                <div className="bg-blue-50 dark:bg-blue-900 p-2 text-sm text-center">
                    Кликните на карте, чтобы выбрать точку отправления, затем точку назначения
                </div>
            )}
        </div>
    );
};

export default RouteMap;

                            weight={3}
                            opacity={0.7}
                        />
                    </>
                )}
            </MapContainer>
            {interactive && allowMultiPoint && (
                <div className="bg-blue-50 dark:bg-blue-900 p-2 text-sm text-center">
                    Кликните по карте, чтобы добавлять точки маршрута
                </div>
            )}
            {interactive && !allowMultiPoint && !hasCoordinates && (
                <div className="bg-blue-50 dark:bg-blue-900 p-2 text-sm text-center">
                    Кликните на карте, чтобы выбрать точку отправления, затем точку назначения
                </div>
            )}
        </div>
    );
};

export default RouteMap;
