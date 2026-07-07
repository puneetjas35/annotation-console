import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { tasksSelectors } from './tasksSlice';
import { Task, TaskStatus } from '@/types/domain';

const selectTasksState = (state: RootState) => state.tasks;
const selectEntities = (state: RootState) => state.tasks.entities;
const selectFilters = (state: RootState) => state.tasks.filters;

export const selectAllTasks = createSelector([selectEntities], (entities) =>
  tasksSelectors.selectAll(entities)
);

export const selectTaskById = (state: RootState, taskId: string) =>
  tasksSelectors.selectById(state.tasks.entities, taskId);

export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectFilters],
  (tasks, filters): Task[] => {
    let filtered = tasks;

    if (filters.status !== 'all') {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }
);

export type SortField = 'updatedAt' | 'annotationCount' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const selectSortedFilteredTasks = createSelector(
  [selectFilteredTasks, (_state: RootState, sortConfig: SortConfig) => sortConfig],
  (tasks, sortConfig): Task[] => {
    const { field, direction } = sortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;

    return [...tasks].sort((a, b) => {
      switch (field) {
        case 'updatedAt':
          return (a.updatedAt - b.updatedAt) * multiplier;
        case 'annotationCount':
          return (a.annotationCount - b.annotationCount) * multiplier;
        case 'title':
          return a.title.localeCompare(b.title) * multiplier;
        default:
          return 0;
      }
    });
  }
);

export const selectPaginationInfo = createSelector(
  [selectTasksState],
  (state) => ({
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    totalTasks: state.totalTasks,
    totalPages: Math.ceil(state.totalTasks / state.pageSize),
  })
);

export const selectLoadingState = createSelector(
  [selectTasksState],
  (state) => ({
    isLoading: state.loadingStatus === 'loading',
    hasError: state.loadingStatus === 'failed',
    error: state.error,
    isCachedData: state.isCachedData,
  })
);

export const selectSelectedTask = createSelector(
  [selectEntities, selectTasksState],
  (entities, state) => {
    if (!state.selectedTaskId) return null;
    return tasksSelectors.selectById(entities, state.selectedTaskId);
  }
);

export const selectStatusCounts = createSelector([selectAllTasks], (tasks) => {
  const counts: Record<TaskStatus, number> = {
    [TaskStatus.Todo]: 0,
    [TaskStatus.InProgress]: 0,
    [TaskStatus.QA]: 0,
    [TaskStatus.Done]: 0,
    [TaskStatus.Blocked]: 0,
    [TaskStatus.Unknown]: 0,
  };

  for (const task of tasks) {
    counts[task.status]++;
  }

  return counts;
});

export const selectIsTaskKnown = (state: RootState, taskId: string) =>
  state.tasks.knownTaskIds.includes(taskId);
