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
