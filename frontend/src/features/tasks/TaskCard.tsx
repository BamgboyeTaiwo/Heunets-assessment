import { TASK_STATUSES, Task, TaskStatus } from './types';

const priorityClasses: Record<Task['priority'], string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function TaskCard({ task, onStatusChange, onDelete, isUpdating, isDeleting }: TaskCardProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-900">{task.title}</h4>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${priorityClasses[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description && <p className="mt-1 text-xs text-slate-500">{task.description}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        <select
          aria-label="Task status"
          value={task.status}
          disabled={isUpdating}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TASK_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
