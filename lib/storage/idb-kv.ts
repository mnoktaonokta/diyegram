const DB_NAME = "diyegram";
const DB_VERSION = 1;
const STORE_NAME = "kv";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const request = run(tx.objectStore(STORE_NAME));

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as T);
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export function idbGet<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  return runTransaction("readonly", (store) => store.get(key)).then(
    (value) => value ?? null,
  );
}

export function idbSet<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  return runTransaction("readwrite", (store) => store.put(value, key)).then(
    () => undefined,
  );
}
