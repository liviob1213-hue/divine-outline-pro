// Offline data cache using IndexedDB for hymns and bible chapters
const DB_NAME = "pregai-offline";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("hinos")) {
        db.createObjectStore("hinos", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("bible_chapters")) {
        db.createObjectStore("bible_chapters", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("hinos_search_cache")) {
        const store = db.createObjectStore("hinos_search_cache", { keyPath: "query" });
        store.createIndex("timestamp", "timestamp");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// === HINOS ===

export async function cacheHinos(hinos: any[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("hinos", "readwrite");
  const store = tx.objectStore("hinos");
  for (const hino of hinos) {
    store.put(hino);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedHino(id: number): Promise<any | null> {
  const db = await openDB();
  const tx = db.transaction("hinos", "readonly");
  const store = tx.objectStore("hinos");
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function searchCachedHinos(query: string): Promise<any[]> {
  const db = await openDB();
  const tx = db.transaction("hinos", "readonly");
  const store = tx.objectStore("hinos");

  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const q = query.toLowerCase();

    // Check if searching by number
    const numMatch = q.match(/^(\d+)$/);

    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) {
        resolve(results.slice(0, 10));
        return;
      }

      const hino = cursor.value;

      if (numMatch && hino.id === parseInt(numMatch[1])) {
        results.push(hino);
      } else if (!numMatch) {
        const searchFields = `${hino.titulo} ${hino.coro || ""} ${hino.letra_completa}`.toLowerCase();
        if (searchFields.includes(q)) {
          results.push(hino);
        }
      }

      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

export async function getAllCachedHinosCount(): Promise<number> {
  const db = await openDB();
  const tx = db.transaction("hinos", "readonly");
  const store = tx.objectStore("hinos");
  return new Promise((resolve, reject) => {
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// === BIBLE CHAPTERS ===

export async function cacheBibleChapter(
  version: string,
  book: string,
  chapter: number,
  content: string
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("bible_chapters", "readwrite");
  const store = tx.objectStore("bible_chapters");
  store.put({
    key: `${version}|${book}|${chapter}`,
    version,
    book,
    chapter,
    content,
    timestamp: Date.now(),
  });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedBibleChapter(
  version: string,
  book: string,
  chapter: number
): Promise<string | null> {
  const db = await openDB();
  const tx = db.transaction("bible_chapters", "readonly");
  const store = tx.objectStore("bible_chapters");
  return new Promise((resolve, reject) => {
    const req = store.get(`${version}|${book}|${chapter}`);
    req.onsuccess = () => resolve(req.result?.content || null);
    req.onerror = () => reject(req.error);
  });
}

// === SEARCH CACHE ===

export async function cacheSearchResults(query: string, results: any[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("hinos_search_cache", "readwrite");
  const store = tx.objectStore("hinos_search_cache");
  store.put({ query: query.toLowerCase(), results, timestamp: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedSearchResults(query: string): Promise<any[] | null> {
  const db = await openDB();
  const tx = db.transaction("hinos_search_cache", "readonly");
  const store = tx.objectStore("hinos_search_cache");
  return new Promise((resolve, reject) => {
    const req = store.get(query.toLowerCase());
    req.onsuccess = () => {
      const result = req.result;
      if (!result) return resolve(null);
      // Cache valid for 7 days
      if (Date.now() - result.timestamp > 7 * 24 * 60 * 60 * 1000) return resolve(null);
      resolve(result.results);
    };
    req.onerror = () => reject(req.error);
  });
}

// === NETWORK STATUS ===

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const onlineHandler = () => callback(true);
  const offlineHandler = () => callback(false);
  window.addEventListener("online", onlineHandler);
  window.addEventListener("offline", offlineHandler);
  return () => {
    window.removeEventListener("online", onlineHandler);
    window.removeEventListener("offline", offlineHandler);
  };
}
