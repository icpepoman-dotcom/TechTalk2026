// IndexedDB storage utility for storing large images and full website state without localStorage quota limits.

const DB_NAME = 'icpep_techtalk_db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval_store';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (e) => {
          console.warn('IndexedDB open error:', e);
          resolve(null);
        };

        request.onblocked = () => {
          console.warn('IndexedDB open blocked');
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB not supported or accessible:', err);
        resolve(null);
      }
    });
  }

  return dbPromise;
}

export async function dbSetItem<T = unknown>(key: string, value: T): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);

        req.onsuccess = () => resolve(true);
        req.onerror = (err) => {
          console.warn(`IndexedDB write error for ${key}:`, err);
          resolve(false);
        };
      } catch (txErr) {
        console.warn('IndexedDB transaction error:', txErr);
        resolve(false);
      }
    });
  } catch (err) {
    console.warn(`dbSetItem failed for key ${key}:`, err);
    return false;
  }
}

export async function dbGetItem<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          resolve(req.result !== undefined ? req.result : null);
        };
        req.onerror = (err) => {
          console.warn(`IndexedDB read error for ${key}:`, err);
          resolve(null);
        };
      } catch (txErr) {
        console.warn('IndexedDB read transaction error:', txErr);
        resolve(null);
      }
    });
  } catch (err) {
    console.warn(`dbGetItem failed for key ${key}:`, err);
    return null;
  }
}

export async function dbRemoveItem(key: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

export async function dbClearAll(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}
