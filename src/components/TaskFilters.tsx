'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setFilter } from '@/store/tasksSlice';
import { TaskStatus, TaskType, TASK_TYPES } from '@/types/domain';

export function TaskFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.tasks.filters);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    dispatch(
      setFilter({
        status: value === 'all' ? 'all' : (value as TaskStatus),
      })
    );
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    dispatch(
      setFilter({
        type: value === 'all' ? 'all' : (value as TaskType),
      })
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({ search: e.target.value }));
  };

  const clearFilters = () => {
    dispatch(
      setFilter({
        status: 'all',
        type: 'all',
        search: '',
      })
    );
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.type !== 'all' ||
    filters.search.trim() !== '';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="flex-1 min-w-\[200px\]">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={handleStatusChange}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Statuses</option>
        <option value={TaskStatus.Todo}>To Do</option>
        <option value={TaskStatus.InProgress}>In Progress</option>
        <option value={TaskStatus.QA}>QA</option>
        <option value={TaskStatus.Done}>Done</option>
        <option value={TaskStatus.Blocked}>Blocked</option>
        <option value={TaskStatus.Unknown}>Unknown</option>
      </select>

      {/* Type filter */}
      <select
        value={filters.type}
        onChange={handleTypeChange}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Types</option>
        {TASK_TYPES.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
        <option value="unknown">Unknown</option>
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
