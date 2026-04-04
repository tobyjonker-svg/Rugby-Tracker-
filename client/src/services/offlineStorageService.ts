/**
 * IndexedDB Offline Storage Service
 * Handles local data persistence and sync queue for offline support
 */

interface StoredTraining {
  id?: number;
  userId: number;
  type: "gym" | "running" | "conditioning";
  date: Date;
  duration?: number;
  intensity?: number;
  notes?: string;
  gymData?: Record<string, unknown>;
  runningData?: Record<string, unknown>;
  conditioningData?: Record<string, unknown>;
  synced: boolean;
  syncedAt?: Date;
}

interface SyncQueueItem {
  id: string;
  type: "training" | "match" | "goal";
  action: "create" | "update" | "delete";
  data: unknown;
  timestamp: number;
  retries: number;
}

class OfflineStorageService {
  private dbName = "RugbyTrackerDB";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create training sessions store
        if (!db.objectStoreNames.contains("trainingSessions")) {
          const store = db.createObjectStore("trainingSessions", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("userId", "userId", { unique: false });
          store.createIndex("synced", "synced", { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        // Create offline metadata
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" });
        }
      };
    });
  }

  async saveTrainingSession(session: StoredTraining): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["trainingSessions"],
        "readwrite"
      );
      const store = transaction.objectStore("trainingSessions");
      const request = store.add({
        ...session,
        synced: false,
        date: session.date.toISOString(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as number);
    });
  }

  async getUnsyncedSessions(userId: number): Promise<StoredTraining[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["trainingSessions"],
        "readonly"
      );
      const store = transaction.objectStore("trainingSessions");
      const index = store.index("synced");
      const request = index.getAll(IDBKeyRange.only(false));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const sessions = (request.result as unknown[]).filter(
          (s: any) => s.userId === userId
        );
        resolve(
          sessions.map((s: any) => ({
            ...s,
            date: new Date(s.date),
          }))
        );
      };
    });
  }

  async addToSyncQueue(item: Omit<SyncQueueItem, "id">): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      const request = store.add({
        ...item,
        id: `${item.type}-${Date.now()}`,
        timestamp: Date.now(),
        retries: 0,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["syncQueue"], "readonly");
      const store = transaction.objectStore("syncQueue");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as SyncQueueItem[]);
    });
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async markSessionSynced(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["trainingSessions"],
        "readwrite"
      );
      const store = transaction.objectStore("trainingSessions");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const session = getRequest.result;
        session.synced = true;
        session.syncedAt = new Date().toISOString();
        const updateRequest = store.put(session);

        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearOldData(daysOld: number = 90): Promise<void> {
    if (!this.db) await this.init();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["trainingSessions"],
        "readwrite"
      );
      const store = transaction.objectStore("trainingSessions");
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const session = cursor.value;
          if (
            session.synced &&
            new Date(session.date) < cutoffDate
          ) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnline(callback: () => void): void {
    window.addEventListener("online", callback);
  }

  onOffline(callback: () => void): void {
    window.addEventListener("offline", callback);
  }
}

export const offlineStorage = new OfflineStorageService();
