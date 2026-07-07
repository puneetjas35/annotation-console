import { TaskStatus } from '@/types/domain';

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  [TaskStatus.Todo]: {
    label: 'To Do',
    className: 'bg-gray-100 text-gray-700',
  },
  [TaskStatus.InProgress]: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-700',
  },
  [TaskStatus.QA]: {
    label: 'QA',
    className: 'bg-purple-100 text-purple-700',
  },
  [TaskStatus.Done]: {
    label: 'Done',
    className: 'bg-green-100 text-green-700',
  },
  [TaskStatus.Blocked]: {
    label: 'Blocked',
    className: 'bg-red-100 text-red-700',
  },
  [TaskStatus.Unknown]: {
    label: 'Unknown',
    className: 'bg-yellow-100 text-yellow-700',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}
