export interface SavedImage {
  id: string;
  name: string;
  dataUrl: string;
  timestamp: number;
}

const DB_NAME = 'XImageGenDB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('characters')) {
        db.createObjectStore('characters', { keyPath: 'id' });
      }
    };
  });
}

export async function saveTemplate(name: string, dataUrl: string): Promise<SavedImage> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('templates', 'readwrite');
    const store = transaction.objectStore('templates');
    const item: SavedImage = {
      id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name,
      dataUrl,
      timestamp: Date.now(),
    };
    const request = store.put(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function getTemplates(): Promise<SavedImage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('templates', 'readonly');
    const store = transaction.objectStore('templates');
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result as SavedImage[];
      items.sort((a, b) => b.timestamp - a.timestamp);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('templates', 'readwrite');
    const store = transaction.objectStore('templates');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveCharacter(name: string, dataUrl: string): Promise<SavedImage> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('characters', 'readwrite');
    const store = transaction.objectStore('characters');
    const item: SavedImage = {
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name,
      dataUrl,
      timestamp: Date.now(),
    };
    const request = store.put(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function getCharacters(): Promise<SavedImage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('characters', 'readonly');
    const store = transaction.objectStore('characters');
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result as SavedImage[];
      items.sort((a, b) => b.timestamp - a.timestamp);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCharacter(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('characters', 'readwrite');
    const store = transaction.objectStore('characters');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
