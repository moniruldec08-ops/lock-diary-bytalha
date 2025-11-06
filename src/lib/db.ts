import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  lockPassword: string;
  theme: 'light' | 'dark' | 'auto';
  biometricEnabled: boolean;
  streakCount: number;
  lastEntryDate: string;
  achievements: string[];
}

interface DiaryDB extends DBSchema {
  entries: {
    key: string;
    value: DiaryEntry;
    indexes: { 'by-date': string };
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbInstance: IDBPDatabase<DiaryDB> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DiaryDB>('my-diary-pro', 1, {
    upgrade(db) {
      // Create entries store
      if (!db.objectStoreNames.contains('entries')) {
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('by-date', 'date');
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// Entry operations
export async function getAllEntries(): Promise<DiaryEntry[]> {
  const db = await getDB();
  return db.getAll('entries');
}

export async function getEntry(id: string): Promise<DiaryEntry | undefined> {
  const db = await getDB();
  return db.get('entries', id);
}

export async function addEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiaryEntry> {
  const db = await getDB();
  const now = Date.now();
  const newEntry: DiaryEntry = {
    ...entry,
    id: `entry-${now}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.add('entries', newEntry);
  return newEntry;
}

export async function updateEntry(id: string, updates: Partial<DiaryEntry>): Promise<void> {
  const db = await getDB();
  const entry = await db.get('entries', id);
  if (entry) {
    const updated = { ...entry, ...updates, updatedAt: Date.now() };
    await db.put('entries', updated);
  }
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('entries', id);
}

// Settings operations
export async function getSetting(key: string): Promise<any> {
  const db = await getDB();
  const setting = await db.get('settings', key);
  return setting?.value;
}

export async function setSetting(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function isLockSetup(): Promise<boolean> {
  const password = await getSetting('lockPassword');
  return !!password;
}

export async function setLockPassword(password: string): Promise<void> {
  await setSetting('lockPassword', password);
}

export async function verifyLockPassword(password: string): Promise<boolean> {
  const stored = await getSetting('lockPassword');
  return stored === password;
}

export async function updateStreak(): Promise<number> {
  const lastDate = await getSetting('lastEntryDate');
  const today = new Date().toDateString();
  
  let streak = (await getSetting('streakCount')) || 0;
  
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate === yesterday.toDateString()) {
      streak += 1;
    } else if (lastDate !== today) {
      streak = 1;
    }
    
    await setSetting('streakCount', streak);
    await setSetting('lastEntryDate', today);
  }
  
  return streak;
}
