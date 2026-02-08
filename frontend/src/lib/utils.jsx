export function cn(...inputs) {
    return inputs
        .flat()
        .filter(Boolean)
        .join(" ");
}

export function formatDateTime(value, fallback = "") {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback || value;
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

/** Базовый URL бэкенда (без /api) для медиа — совпадает с API (удалённое хранилище в проде) */
function getBackendBaseUrl() {
    const env = import.meta.env.VITE_API_URL || "";
    if (env) return env.replace(/\/api\/?$/, "").replace(/\/$/, "") || env;
    if (typeof window === "undefined") return "";
    if (/localhost|127\.0\.0\.1/.test(window.location.host)) {
        return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    return "https://ogayanfe.pythonanywhere.com";
}

/**
 * Возвращает полный URL для медиа-файла.
 * Относительные пути (/media/...) запрашиваются с бэкенда, иначе возвращается как есть.
 */
export function getMediaUrl(url) {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    const base = getBackendBaseUrl();
    return base ? `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}` : trimmed;
}
