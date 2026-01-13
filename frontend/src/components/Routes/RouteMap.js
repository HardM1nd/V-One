import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
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
    height = "400px",
    interactive = true,
    onLocationSelect = null
}) => {
    const mapRef = useRef(null);

    // Определяем координаты
    const hasCoordinates = departureLat && departureLng && destinationLat && destinationLng;
    
    // Центр карты
    const center = hasCoordinates
        ? [(parseFloat(departureLat) + parseFloat(destinationLat)) / 2, 
           (parseFloat(departureLng) + parseFloat(destinationLng)) / 2]
        : [55.7558, 37.6173]; // Москва по умолчанию

    // Координаты для маршрута
    const routeCoordinates = hasCoordinates
        ? [
            [parseFloat(departureLat), parseFloat(departureLng)],
            [parseFloat(destinationLat), parseFloat(destinationLng)]
          ]
        : [];

    // Обработка клика на карте для выбора координат
    useEffect(() => {
        if (!interactive || !onLocationSelect || !mapRef.current) return;

        const map = mapRef.current;
        let markers = [];
        let clickCount = 0;

        const handleMapClick = (e) => {
            const { lat, lng } = e.latlng;
            
            if (clickCount === 0) {
                // Первый клик - точка отправления
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup("Точка отправления").openPopup();
                markers.push(marker);
                onLocationSelect("departure", lat, lng);
                clickCount = 1;
            } else if (clickCount === 1) {
                // Второй клик - точка назначения
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup("Точка назначения").openPopup();
                markers.push(marker);
                onLocationSelect("destination", lat, lng);
                
                // Рисуем линию между точками
                if (markers.length === 2) {
                    const polyline = L.polyline([
                        [markers[0].getLatLng().lat, markers[0].getLatLng().lng],
                        [markers[1].getLatLng().lat, markers[1].getLatLng().lng]
                    ], { color: "blue", weight: 3 }).addTo(map);
                    map.fitBounds(polyline.getBounds());
                }
                clickCount = 2;
            } else {
                // Сброс и начало заново
                markers.forEach(m => m.remove());
                markers = [];
                clickCount = 0;
                handleMapClick(e);
            }
        };

        map.on("click", handleMapClick);

        return () => {
            map.off("click", handleMapClick);
            markers.forEach(m => m.remove());
        };
    }, [interactive, onLocationSelect]);

    if (!hasCoordinates && !interactive) {
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
                center={center}
                zoom={hasCoordinates ? 6 : 5}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
                scrollWheelZoom={interactive}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {hasCoordinates && (
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
            {interactive && !hasCoordinates && (
                <div className="bg-blue-50 dark:bg-blue-900 p-2 text-sm text-center">
                    Кликните на карте, чтобы выбрать точку отправления, затем точку назначения
                </div>
            )}
        </div>
    );
};

export default RouteMap;
