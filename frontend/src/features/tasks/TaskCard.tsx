import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ProjectMember } from '@/features/projects/types';
import { TASK_STATUSES, Task, TaskStatus } from './types';

const priorityClasses: Record<Task['priority'], string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

interface TaskCardProps {
  task: Task;
  members: ProjectMember[];
  onStatusChange: (status: TaskStatus) => void;
  onAssigneeChange: (assignee: string) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function TaskCard({
  task,
  members,
  onStatusChange,
  onAssigneeChange,
  onDelete,
  isUpdating,
  isDeleting,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`rounded-md border border-slate-200 bg-white p-3 shadow-sm transition-shadow ${
        isDragging ? 'z-10 opacity-60 shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          aria-label="Drag to move task"
          className="-ml-1 mt-0.5 cursor-grab touch-none rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
            <circle cx="2" cy="2" r="1.5" />
            <circle cx="8" cy="2" r="1.5" />
            <circle cx="2" cy="7" r="1.5" />
            <circle cx="8" cy="7" r="1.5" />
            <circle cx="2" cy="12" r="1.5" />
            <circle cx="8" cy="12" r="1.5" />
          </svg>
        </button>
        <h4 className="flex-1 text-sm font-medium text-slate-900">{task.title}</h4>
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
        <select
          aria-label="Task assignee"
          value={task.assignee ?? ''}
          disabled={isUpdating}
          onChange={(event) => onAssigneeChange(event.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
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
