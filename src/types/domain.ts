/**
 * DOMAIN TYPES
 * 
 * These are the clean, normalized types used throughout the application.
 * All components, selectors, and state use these — never raw API types.
 */

// Normalized user (same structure, but guaranteed non-null when present)
export interface User {
  id: string;
  name: string;
}

// Task types as a discriminated union
// We support known types and gracefully handle unknown ones
export const TASK_TYPES = ['image', 'audio', 'text'] as const;
export type KnownTaskType = typeof TASK_TYPES[number];
export type TaskType = KnownTaskType | 'unknown';

// Normalized status enum — we map all the messy backend values to these
export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  QA = 'qa',
  Done = 'done',
  Blocked = 'blocked',
  Unknown = 'unknown',
}

// The clean task type used everywhere in the app
export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  assignee: User | null;
  annotationCount: number;
  updatedAt: number;                    // Always epoch-ms after normalization
  meta: Record<string, unknown>;
}

// For paginated state
export interface TasksPage {
  page: number;
  pageSize: number;
  total: number;
  taskIds: string[];                    // We store IDs, tasks live in normalized state
}

// WebSocket events in domain form
export type TaskUpdatedEvent = {
  kind: 'task.updated';
  taskId: string;
  status: TaskStatus;
  updatedAt: number;
};

export type TaskAssignedEvent = {
  kind: 'task.assigned';
  taskId: string;
  assignee: User | null;
};

export type AnnotationCreatedEvent = {
  kind: 'annotation.created';
  taskId: string;
  by: string;
  at: number;
};

export type TaskEvent = TaskUpdatedEvent | TaskAssignedEvent | AnnotationCreatedEvent;
