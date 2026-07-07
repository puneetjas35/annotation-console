import {
  normalizeTask,
  normalizeTasks,
  normalizeStatus,
  normalizeWebSocketEvent,
} from '@/lib/normalize';
import { TaskStatus } from '@/types/domain';
import type { RawTask } from '@/types/api';

describe('normalizeStatus', () => {
  it('normalizes various status formats to enum values', () => {
    expect(normalizeStatus('todo')).toBe(TaskStatus.Todo);
    expect(normalizeStatus('TODO')).toBe(TaskStatus.Todo);
    expect(normalizeStatus('in_progress')).toBe(TaskStatus.InProgress);
    expect(normalizeStatus('InProgress')).toBe(TaskStatus.InProgress);
    expect(normalizeStatus('inprogress')).toBe(TaskStatus.InProgress);
    expect(normalizeStatus('done')).toBe(TaskStatus.Done);
    expect(normalizeStatus('DONE')).toBe(TaskStatus.Done);
    expect(normalizeStatus('QA')).toBe(TaskStatus.QA);
    expect(normalizeStatus('qa')).toBe(TaskStatus.QA);
    expect(normalizeStatus('blocked')).toBe(TaskStatus.Blocked);
    expect(normalizeStatus('BLOCKED')).toBe(TaskStatus.Blocked);
  });

  it('returns Unknown for unrecognized statuses', () => {
    expect(normalizeStatus('invalid')).toBe(TaskStatus.Unknown);
    expect(normalizeStatus('')).toBe(TaskStatus.Unknown);
    expect(normalizeStatus('random')).toBe(TaskStatus.Unknown);
  });
});

describe('normalizeTask', () => {
  const validRawTask: RawTask = {
    id: 't1',
    title: 'Test Task',
    type: 'image',
    status: 'in_progress',
    assignee: { id: 'u1', name: 'John' },
    annotationCount: 5,
    updatedAt: 1719600000000,
    meta: { priority: 'high' },
  };

  it('normalizes a valid task', () => {
    const result = normalizeTask(validRawTask);

    expect(result).toEqual({
      id: 't1',
      title: 'Test Task',
      type: 'image',
      status: TaskStatus.InProgress,
      assignee: { id: 'u1', name: 'John' },
      annotationCount: 5,
      updatedAt: 1719600000000,
      meta: { priority: 'high' },
    });
  });

  it('handles string annotationCount', () => {
    const task: RawTask = { ...validRawTask, annotationCount: '42' };
    const result = normalizeTask(task);

    expect(result?.annotationCount).toBe(42);
  });

  it('handles ISO string updatedAt', () => {
    const isoDate = '2024-06-28T12:00:00.000Z';
    const task: RawTask = { ...validRawTask, updatedAt: isoDate };
    const result = normalizeTask(task);

    expect(result?.updatedAt).toBe(Date.parse(isoDate));
  });

  it('handles null assignee', () => {
    const task: RawTask = { ...validRawTask, assignee: null };
    const result = normalizeTask(task);

    expect(result?.assignee).toBeNull();
  });

  it('handles unknown task type', () => {
    const task: RawTask = { ...validRawTask, type: 'video' };
    const result = normalizeTask(task);

    expect(result?.type).toBe('unknown');
  });

  it('returns null for missing id', () => {
    const task = { ...validRawTask, id: '' } as RawTask;
    const result = normalizeTask(task);

    expect(result).toBeNull();
  });

  it('provides fallback for missing meta', () => {
    const task: RawTask = { ...validRawTask, meta: undefined };
    const result = normalizeTask(task);

    expect(result?.meta).toEqual({});
  });
});

describe('normalizeTasks', () => {
  it('filters out invalid tasks', () => {
    const rawTasks: RawTask[] = [
      {
        id: 't1',
        title: 'Valid',
        type: 'image',
        status: 'todo',
        assignee: null,
        annotationCount: 0,
        updatedAt: Date.now(),
      },
      {
        id: '',
        title: 'Invalid - no id',
        type: 'image',
        status: 'todo',
        assignee: null,
        annotationCount: 0,
        updatedAt: Date.now(),
      },
    ];

    const result = normalizeTasks(rawTasks);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('t1');
  });
});

describe('normalizeWebSocketEvent', () => {
  it('normalizes task.updated event', () => {
    const raw = {
      kind: 'task.updated',
      payload: { id: 't1', status: 'done', updatedAt: 1719600000000 },
    };

    const result = normalizeWebSocketEvent(raw);

    expect(result).toEqual({
      kind: 'task.updated',
      taskId: 't1',
      status: TaskStatus.Done,
      updatedAt: 1719600000000,
    });
  });

  it('normalizes task.assigned event', () => {
    const raw = {
      kind: 'task.assigned',
      payload: { id: 't1', assignee: { id: 'u1', name: 'John' } },
    };

    const result = normalizeWebSocketEvent(raw);

    expect(result).toEqual({
      kind: 'task.assigned',
      taskId: 't1',
      assignee: { id: 'u1', name: 'John' },
    });
  });

  it('normalizes annotation.created event', () => {
    const raw = {
      kind: 'annotation.created',
      payload: { taskId: 't1', by: 'u1', at: 1719600000000 },
    };

    const result = normalizeWebSocketEvent(raw);

    expect(result).toEqual({
      kind: 'annotation.created',
      taskId: 't1',
      by: 'u1',
      at: 1719600000000,
    });
  });

  it('returns null for unknown event kind', () => {
    const raw = {
      kind: 'unknown.event',
      payload: {},
    };

    const result = normalizeWebSocketEvent(raw);

    expect(result).toBeNull();
  });

  it('returns null for malformed event', () => {
    expect(normalizeWebSocketEvent(null)).toBeNull();
    expect(normalizeWebSocketEvent({})).toBeNull();
    expect(normalizeWebSocketEvent({ kind: 'task.updated' })).toBeNull();
  });
});
