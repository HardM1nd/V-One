const DB_NAME = "VOneProfileEdit";
const STORE = "drafts";
const KEY = "current";

function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE, { keyPath: "id" });
        };
    });
}

/**
 * Сохраняет черновик файла (аватар или обложка) в IndexedDB.
 * @param {string} field - "profile_pic" | "cover_pic"
 * @param {File} file
 */
export async function saveProfileEditFile(field, file) {
    if (!file || !(file instanceof Blob)) return;
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        store.get(KEY).onsuccess = (e) => {
            const data = e.target.result || { id: KEY, profile_pic: null, cover_pic: null };
            data[field] = {
                blob: file,
                fileName: file.name || "",
                sizeKb: Math.round(file.size / 1024),
            };
            store.put(data);
            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        };
    });
}

/**
 * Загружает черновик файла из IndexedDB.
 * @param {string} field - "profile_pic" | "cover_pic"
 * @returns {Promise<{ blob: Blob, fileName: string, sizeKb: number } | null>}
 */
export async function getProfileEditFile(field) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(KEY);
        req.onsuccess = () => {
            const row = req.result;
            db.close();
            resolve(row?.[field] ?? null);
        };
        req.onerror = () => {
            db.close();
            reject(req.error);
        };
    });
}

/**
 * Удаляет черновик одного поля.
 */
export async function clearProfileEditFile(field) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        store.get(KEY).onsuccess = (e) => {
            const data = e.target.result || { id: KEY, profile_pic: null, cover_pic: null };
            data[field] = null;
            store.put(data);
            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        };
    });
}

/**
 * Удаляет все черновики редактирования профиля.
 */
export async function clearAllProfileEditDrafts() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(KEY);
        tx.oncomplete = () => {
            db.close();
            resolve();
        };
        tx.onerror = () => reject(tx.error);
    });
}
