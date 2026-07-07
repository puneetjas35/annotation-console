import {
  selectFilteredTasks,
  selectSortedFilteredTasks,
  selectStatusCounts,
} from '@/store/selectors';
import { Task, TaskStatus } from '@/types/domain';
import type { RootState } from '@/store';

const createMockState = (tasks: Task[], filters = {}): RootState => ({
  tasks: {
    entities: {
      ids: tasks.map((t) => t.id),
      entities: tasks.reduce(
        (acc, t) => ({ ...acc, [t.id]: t }),
        {}
      ),
    },
    currentPage: 1,
    pageSize: 20,
    totalTasks: tasks.length,
    filters: {
      status: 'all',
      type: 'all',
      search: '',
      ...filters,
    },
    selectedTaskId: null,
    loadingStatus: 'idle',
    error: null,
    isCachedData: false,
    lastFetchedAt: null,
    knownTaskIds: new Set(tasks.map((t) => t.id)),
  },
});

const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Image Task',
    type: 'image',
    status: TaskStatus.InProgress,
    assignee: { id: 'u1', name: 'John' },
    annotationCount: 5,
    updatedAt: 1000,
    meta: {},
  },
  {
    id: 't2',
    title: 'Audio Task',
    type: 'audio',
    status: TaskStatus.Done,
    assignee: null,
    annotationCount: 10,
    updatedAt: 2000,
    meta: {},
  },
  {
    id: 't3',
    title: 'Text Task',
    type: 'text',
    status: TaskStatus.Todo,
    assignee: { id: 'u2', name: 'Jane' },
    annotationCount: 3,
    updatedAt: 3000,
    meta: {},
  },
];

describe('selectFilteredTasks', () => {
  it('returns all tasks when no filters applied', () => {
    const state = createMockState(mockTasks);
    const result = selectFilteredTasks(state);

    expect(result).toHaveLength(3);
  });

  it('filters by status', () => {
    const state = createMockState(mockTasks, { status: TaskStatus.Done });
    const result = selectFilteredTasks(state);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('t2');
  });

  it('filters by type', () => {
    const state = createMockState(mockTasks, { type: 'image' });
    const result = selectFilteredTasks(state);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('t1');
  });

  it('filters by search term', () => {
    const state = createMockState(mockTasks, { search: 'audio' });
    const result = selectFilteredTasks(state);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('t2');
  });

  it('combines multiple filters', () => {
    const state = createMockState(mockTasks, {
      type: 'image',
      status: TaskStatus.InProgress,
    });
    const result = selectFilteredTasks(state);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('t1');
  });
});

describe('selectSortedFilteredTasks', () => {
  it('sorts by updatedAt descending', () => {
    const state = createMockState(mockTasks);
    const result = selectSortedFilteredTasks(state, {
      field: 'updatedAt',
      direction: 'desc',
    });

    expect(result.map((t) => t.id)).toEqual(['t3', 't2', 't1']);
  });

  it('sorts by updatedAt ascending', () => {
    const state = createMockState(mockTasks);
    const result = selectSortedFilteredTasks(state, {
      field: 'updatedAt',
      direction: 'asc',
    });

    expect(result.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
  });

  it('sorts by annotationCount', () => {
    const state = createMockState(mockTasks);
    const result = selectSortedFilteredTasks(state, {
      field: 'annotationCount',
      direction: 'desc',
    });

    expect(result.map((t) => t.id)).toEqual(['t2', 't1', 't3']);
  });

  it('sorts by title', () => {
    const state = createMockState(mockTasks);
    const result = selectSortedFilteredTasks(state, {
      field: 'title',
      direction: 'asc',
    });

    expect(result.map((t) => t.id)).toEqual(['t2', 't1', 't3']);
  });
});

describe('selectStatusCounts', () => {
  it('counts tasks by status', () => {
    const state = createMockState(mockTasks);
    const result = selectStatusCounts(state);

    expect(result[TaskStatus.InProgress]).toBe(1);
    expect(result[TaskStatus.Done]).toBe(1);
    expect(result[TaskStatus.Todo]).toBe(1);
    expect(result[TaskStatus.Blocked]).toBe(0);
  });
});
