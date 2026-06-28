import { Alert } from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { ProjectMember } from '@/features/projects/types';
import { TaskCard } from './TaskCard';
import { TASK_STATUSES, TaskStatus } from './types';
import { useDeleteTask, useTasks, useUpdateTask } from './useTasks';

interface TaskBoardProps {
  projectId: string;
  members: ProjectMember[];
}

export function TaskBoard({ projectId, members }: TaskBoardProps) {
  const { data: tasks, isLoading, isError, error } = useTasks(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  if (isLoading) return <p className="text-sm text-slate-500">Loading tasks…</p>;
  if (isError) return <Alert message={getErrorMessage(error, 'Unable to load tasks')} />;
  if (!tasks) return null;

  const tasksByStatus = (status: TaskStatus) => tasks.filter((task) => task.status === status);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {TASK_STATUSES.map((column) => (
        <div key={column.value} className="rounded-lg bg-slate-100 p-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            {column.label} ({tasksByStatus(column.value).length})
          </h3>
          <div className="flex flex-col gap-2">
            {tasksByStatus(column.value).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                members={members}
                isUpdating={updateTask.isPending && updateTask.variables?.taskId === task.id}
                isDeleting={deleteTask.isPending && deleteTask.variables === task.id}
                onStatusChange={(status) => updateTask.mutate({ taskId: task.id, payload: { status } })}
                onAssigneeChange={(assignee) =>
                  updateTask.mutate({ taskId: task.id, payload: { assignee } })
                }
                onDelete={() => deleteTask.mutate(task.id)}
              />
            ))}
            {tasksByStatus(column.value).length === 0 && (
              <p className="text-xs text-slate-400">No tasks</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
