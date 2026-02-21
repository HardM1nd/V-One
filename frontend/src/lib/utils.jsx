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

/** Базовый URL бэкенда (без /api) для медиа. Берётся из VITE_API_URL в .env */
function getBackendBaseUrl() {
    const env = import.meta.env.VITE_API_URL || "";
    if (!env) return "";
    return env.replace(/\/api\/?$/, "").replace(/\/$/, "") || env;
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
