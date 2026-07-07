import type { RawTask, RawUser } from '@/types/api';
import {
  Task,
  TaskStatus,
  TaskType,
  TASK_TYPES,
  User,
  TaskEvent,
  KnownTaskType,
} from '@/types/domain';

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function toTimestamp(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return Date.now();
}

export function normalizeStatus(raw: string): TaskStatus {
  const lower = raw.toLowerCase().trim();

  switch (lower) {
    case 'todo':
      return TaskStatus.Todo;
    case 'in_progress':
    case 'inprogress':
    case 'in progress':
      return TaskStatus.InProgress;
    case 'qa':
    case 'review':
      return TaskStatus.QA;
    case 'done':
    case 'complete':
    case 'completed':
      return TaskStatus.Done;
    case 'blocked':
      return TaskStatus.Blocked;
    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Unknown task status: "${raw}", defaulting to Unknown`);
      }
      return TaskStatus.Unknown;
  }
}

function normalizeType(raw: string): TaskType {
  const lower = raw.toLowerCase().trim() as KnownTaskType;

  if (TASK_TYPES.includes(lower)) {
    return lower;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(`Unknown task type: "${raw}", defaulting to 'unknown'`);
  }
  return 'unknown';
}

function normalizeUser(raw: RawUser | null | undefined): User | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
  };
}

export function normalizeTask(raw: RawTask): Task | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  if (typeof raw.id !== 'string' || !raw.id) {
    return null;
  }

  if (typeof raw.title !== 'string') {
    return null;
  }

  return {
    id: raw.id,
    title: raw.title,
    type: typeof raw.type === 'string' ? normalizeType(raw.type) : 'unknown',
    status:
      typeof raw.status === 'string'
        ? normalizeStatus(raw.status)
        : TaskStatus.Unknown,
    assignee: normalizeUser(raw.assignee),
    annotationCount: toNumber(raw.annotationCount, 0),
    updatedAt: toTimestamp(raw.updatedAt),
    meta: raw.meta && typeof raw.meta === 'object' ? raw.meta : {},
  };
}

export function normalizeTasks(rawTasks: RawTask[]): Task[] {
  const tasks: Task[] = [];

  for (const raw of rawTasks) {
    const normalized = normalizeTask(raw);
    if (normalized) {
      tasks.push(normalized);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('Skipped malformed task:', raw);
    }
  }

  return tasks;
}

export function normalizeWebSocketEvent(raw: unknown): TaskEvent | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const event = raw as {
    kind?: string;
    payload?: Record<string, unknown>;
  };

  if (!event.kind || !event.payload) {
    return null;
  }

  switch (event.kind) {
    case 'task.updated': {
      const { id, status, updatedAt } = event.payload as {
        id?: string;
        status?: string;
        updatedAt?: number;
      };
      if (typeof id !== 'string' || typeof status !== 'string') {
        return null;
      }
      return {
        kind: 'task.updated',
        taskId: id,
        status: normalizeStatus(status),
        updatedAt: toTimestamp(updatedAt),
      };
    }

    case 'task.assigned': {
      const { id, assignee } = event.payload as {
        id?: string;
        assignee?: RawUser | null;
      };
      if (typeof id !== 'string') {
        return null;
      }
      return {
        kind: 'task.assigned',
        taskId: id,
        assignee: normalizeUser(assignee),
      };
    }

    case 'annotation.created': {
      const { taskId, by, at } = event.payload as {
        taskId?: string;
        by?: string;
        at?: number;
      };
      if (typeof taskId !== 'string' || typeof by !== 'string') {
        return null;
      }
      return {
        kind: 'annotation.created',
        taskId,
        by,
        at: toTimestamp(at),
      };
    }

    default:
      return null;
  }
}
