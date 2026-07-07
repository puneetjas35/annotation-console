/**
 * RAW API TYPES
 * 
 * These represent exactly what the backend sends — warts and all.
 * We never use these directly in components or state.
 * They exist solely to type the fetch response before normalization.
 */

// The backend sends users in this shape (or null for unassigned)
export interface RawUser {
  id: string;
  name: string;
}

// The backend task payload — intentionally messy
export interface RawTask {
  id: string;
  title: string;
  type: string;                           // Could be "image", "audio", "text", or unknown like "video"
  status: string;                         // Inconsistent: "in_progress", "InProgress", "done", "QA", "todo", "BLOCKED"
  assignee: RawUser | null;               // Sometimes null
  annotationCount: number | string;       // Sometimes a string like "42"
  updatedAt: number | string;             // Either epoch-ms (number) or ISO string
  meta?: Record<string, unknown>;         // Free-form, optional
}

// Paginated response wrapper
export interface RawTasksResponse {
  page: number;
  pageSize: number;
  total: number;
  items: RawTask[];
}

// WebSocket event types — these come through the live feed
export type RawWebSocketEvent =
  | { kind: 'task.updated'; payload: { id: string; status: string; updatedAt: number } }
  | { kind: 'task.assigned'; payload: { id: string; assignee: RawUser | null } }
  | { kind: 'annotation.created'; payload: { taskId: string; by: string; at: number } };
