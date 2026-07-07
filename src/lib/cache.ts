import localforage from 'localforage';
import type { Task } from '@/types/domain';

const taskStore = localforage.createInstance({
  name: 'annotation-console',
  storeName: 'tasks',
});

interface TaskCacheEntry {
  tasks: Task[];
  page: number;
  pageSize: number;
  total: number;
  cachedAt: number;
}

const CACHE_KEY = 'tasks-cache';
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function cacheTasksAsync(
  tasks: Task[],
  page: number,
  pageSize: number,
  total: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const schedule =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 0);

    schedule(async () => {
      try {
        const entry: TaskCacheEntry = {
          tasks,
          page,
          pageSize,
          total,
          cachedAt: Date.now(),
        };

        await taskStore.setItem(CACHE_KEY, entry);
        resolve();
      } catch (e) {
        console.error('Failed to cache tasks:', e);
        reject(e);
      }
    });
  });
}

export async function loadCachedTasks(): Promise<TaskCacheEntry | null> {
  try {
    const entry = await taskStore.getItem<TaskCacheEntry>(CACHE_KEY);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.cachedAt;
    if (age > CACHE_TTL_MS) {
      console.log(`Cache is stale (${Math.round(age / 1000)}s old)`);
    }

    return entry;
  } catch (e) {
    console.error('Failed to load cached tasks:', e);
    return null;
  }
}

export async function clearTaskCache(): Promise<void> {
  try {
    await taskStore.removeItem(CACHE_KEY);
  } catch (e) {
    console.error('Failed to clear task cache:', e);
  }
}

export function isCacheFresh(cachedAt: number): boolean {
  return Date.now() - cachedAt < CACHE_TTL_MS;
}
