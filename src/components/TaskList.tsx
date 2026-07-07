'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectSortedFilteredTasks } from '@/store/selectors';
import { setSelectedTask } from '@/store/tasksSlice';
// import { Task, TaskStatus } from '@/types/domain';
import { StatusBadge } from './StatusBadge';
import { LoadingSpinner } from './LoadingSpinner';
import type { SortConfig, SortField } from '@/store/selectors';

interface TaskListProps {
  isLoading: boolean;
}
 function SortIcon({
  field,
  sortConfig,
}: {
  field: SortField;
  sortConfig: SortConfig;
}) {
  if (sortConfig.field !== field) {
    return (
      <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }

  return sortConfig.direction === 'asc' ? (
    <svg
      className="w-4 h-4 text-blue-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  ) : (
    <svg
      className="w-4 h-4 text-blue-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export function TaskList({ isLoading }: TaskListProps) {
  const dispatch = useAppDispatch();
  const selectedTaskId = useAppSelector((state) => state.tasks.selectedTaskId);

const [now, setNow] = useState(() => 0);

useEffect(() => {
  setNow(Date.now());

  const id = setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => clearInterval(id);
}, []);

useEffect(() => {
  const id = setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => clearInterval(id);
}, []);
  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'updatedAt',
    direction: 'desc',
  });

  const tasks = useAppSelector((state) =>
    selectSortedFilteredTasks(state, sortConfig)
  );

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleSelectTask = (taskId: string) => {
    dispatch(setSelectedTask(taskId));
  };

  const formatTime = (timestamp: number) => {
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

 

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p>No tasks match your filters</p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50 sticky top-0">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button
              onClick={() => handleSort('title')}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              Task
              <SortIcon field="title" sortConfig={sortConfig} />
            </button>
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Assignee
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button
              onClick={() => handleSort('annotationCount')}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              Annotations
              <SortIcon field="annotationCount" sortConfig={sortConfig} />
            </button>
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button
              onClick={() => handleSort('updatedAt')}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              Updated
              <SortIcon field="updatedAt" sortConfig={sortConfig} />
            </button>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <tr
            key={task.id}
            onClick={() => handleSelectTask(task.id)}
            className={`cursor-pointer transition-colors ${
              selectedTaskId === task.id
                ? 'bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{task.title}</span>
                {task.meta?.priority === 'high' && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                    High
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{task.id}</span>
            </td>
            <td className="px-4 py-3">
              <span className="capitalize text-sm text-gray-700">
                {task.type}
              </span>
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={task.status} />
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">
              {task.assignee?.name ?? (
                <span className="text-gray-400 italic">Unassigned</span>
              )}
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">
              {task.annotationCount}
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
              {formatTime(task.updatedAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
