'use client';

import { Task } from '@/types/domain';
import { useTaskSummary } from '@/store/hooks/useTaskSummary';
import { SafeMarkdown } from './SafeMarkdown';
import { StatusBadge } from './StatusBadge';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedTask } from '@/store/tasksSlice';

interface TaskDetailProps {
  task: Task;
}

export function TaskDetail({ task }: TaskDetailProps) {
  const dispatch = useAppDispatch();
  const { content, isLoading, isStreaming, error } = useTaskSummary({
    taskId: task.id,
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClose = () => {
    dispatch(setSelectedTask(null));
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-4 border-b flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {task.title}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{task.id}</p>
        </div>
        <button
          onClick={handleClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Task info */}
      <div className="p-4 border-b space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              Type
            </label>
            <p className="text-sm text-gray-900 capitalize mt-0.5">
              {task.type}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              Status
            </label>
            <div className="mt-0.5">
              <StatusBadge status={task.status} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              Assignee
            </label>
            <p className="text-sm text-gray-900 mt-0.5">
              {task.assignee?.name ?? (
                <span className="text-gray-400 italic">Unassigned</span>
              )}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              Annotations
            </label>
            <p className="text-sm text-gray-900 mt-0.5">
              {task.annotationCount}
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">
            Last Updated
          </label>
          <p className="text-sm text-gray-900 mt-0.5">
            {formatDate(task.updatedAt)}
          </p>
        </div>

        {task.meta && Object.keys(task.meta).length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              Metadata
            </label>
            <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono">
              {JSON.stringify(task.meta, null, 2)}
            </div>
          </div>
        )}
      </div>

      {/* AI Summary */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">AI Summary</h3>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              Streaming
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && !content && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Failed to load summary: {error}
            </div>
          )}

          {content && (
            <div className={isStreaming ? 'streaming-cursor' : ''}>
              <SafeMarkdown content={content} />
            </div>
          )}

          {!isLoading && !error && !content && (
            <p className="text-sm text-gray-500 italic">No summary available</p>
          )}
        </div>
      </div>
    </div>
  );
}
