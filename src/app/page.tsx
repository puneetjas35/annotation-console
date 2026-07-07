'use client';

import { useTasksWithCache } from '@/store/hooks/useTasksWithCache';
import { useTaskFeed } from '@/store/hooks/useTaskFeed';
import { TaskList } from '@/components/TaskList';
import { TaskDetail } from '@/components/TaskDetail';
import { TaskFilters } from '@/components/TaskFilters';
import { Pagination } from '@/components/Pagination';
import { useAppSelector } from '@/store/hooks';
import { selectLoadingState, selectSelectedTask } from '@/store/selectors';

export default function Home() {
  // Initialize data loading with cache
  const { isCachedData } = useTasksWithCache();

  // Initialize WebSocket connection
  const { isConnected, error: wsError } = useTaskFeed();

  const { isLoading, hasError, error } = useAppSelector(selectLoadingState);
  const selectedTask = useAppSelector(selectSelectedTask);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Annotation Console</h1>
          <div className="flex items-center gap-4 mt-2 text-sm">
            {/* Connection status */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-gray-600">
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>

            {/* Cache indicator */}
            {isCachedData && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                Showing cached data
              </span>
            )}

            {/* WebSocket error */}
            {wsError && (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                {wsError}
              </span>
            )}
          </div>
        </header>

        {/* Error state */}
        {hasError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Failed to load tasks</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Main content */}
        <div className="flex gap-6">
          {/* Left panel: Task list */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow">
              {/* Filters */}
              <div className="p-4 border-b">
                <TaskFilters />
              </div>

              {/* Task list */}
              <div className="task-list-scroll max-h-[calc(100vh-320px)] overflow-y-auto">
                <TaskList isLoading={isLoading} />
              </div>

              {/* Pagination */}
              <div className="p-4 border-t">
                <Pagination />
              </div>
            </div>
          </div>

          {/* Right panel: Task detail */}
          <div className="w-96 shrink-0">
            <div className="bg-white rounded-lg shadow sticky top-6">
              {selectedTask ? (
                <TaskDetail task={selectedTask} />
              ) : (
                <div className="p-8 text-center text-gray-500">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Select a task to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
