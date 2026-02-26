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

const ABSOLUTE_URL_RE = /^[a-z][a-z0-9+.-]*:/i;

function normalizeBaseUrl(value) {
    if (!value) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    return trimmed.replace(/\/+$/, "");
}

function getMediaBaseUrl() {
    return normalizeBaseUrl(import.meta.env.VITE_MEDIA_URL || "");
}

/** Базовый URL бэкенда (без /api) для медиа и статики */
function getBackendBaseUrl() {
    const env = import.meta.env.VITE_API_URL || "";
    if (env) return normalizeBaseUrl(env.replace(/\/api\/?$/, "")) || env;
    if (typeof window !== "undefined") return `${window.location.protocol}//${window.location.hostname}:8000`;
    return "";
}

function joinUrl(base, path) {
    const normalizedBase = normalizeBaseUrl(base);
    if (!normalizedBase) return path;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
}

function isLocalhostHost(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1";
}

function replaceLocalhostUrl(url, mediaBase) {
    if (!mediaBase) return url;
    try {
        const parsed = new URL(url);
        if (!isLocalhostHost(parsed.hostname)) return url;
        return joinUrl(mediaBase, `${parsed.pathname}${parsed.search}${parsed.hash}`);
    } catch {
        return url;
    }
}

/**
 * Возвращает полный URL для медиа-файла.
 * Относительные пути (/media/...) запрашиваются с VITE_MEDIA_URL (если задан) или бэкенда,
 * а абсолютные localhost URL при наличии VITE_MEDIA_URL перенаправляются на него.
 */
export function getMediaUrl(url) {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (ABSOLUTE_URL_RE.test(trimmed)) {
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return replaceLocalhostUrl(trimmed, getMediaBaseUrl());
        }
        return trimmed;
    }
    const base = getMediaBaseUrl() || getBackendBaseUrl();
    return base ? joinUrl(base, trimmed) : trimmed;
}
