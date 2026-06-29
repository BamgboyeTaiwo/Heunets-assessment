import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { PropsWithChildren } from 'react';
import { Alert } from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { ProjectMember } from '@/features/projects/types';
import { TaskCard } from './TaskCard';
import { TASK_STATUSES, Task, TaskStatus } from './types';
import { useDeleteTask, useTasks, useUpdateTask } from './useTasks';

interface TaskBoardProps {
  projectId: string;
  members: ProjectMember[];
}

interface ColumnProps extends PropsWithChildren {
  status: TaskStatus;
  label: string;
}

function Column({ status, label, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-3 transition-colors ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-slate-100'}`}
    >
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{label}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function TaskBoard({ projectId, members }: TaskBoardProps) {
  const { data: tasks, isLoading, isError, error } = useTasks(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  if (isLoading) return <p className="text-sm text-slate-500">Loading tasks…</p>;
  if (isError) return <Alert message={getErrorMessage(error, 'Unable to load tasks')} />;
  if (!tasks) return null;

  const tasksByStatus = (status: TaskStatus) => tasks.filter((task) => task.status === status);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((candidate: Task) => candidate.id === taskId);
    if (!task || task.status === newStatus) return;
    updateTask.mutate({ taskId, payload: { status: newStatus } });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TASK_STATUSES.map((column) => {
          const columnTasks = tasksByStatus(column.value);
          return (
            <Column key={column.value} status={column.value} label={`${column.label} (${columnTasks.length})`}>
              {columnTasks.map((task) => (
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
              {columnTasks.length === 0 && <p className="text-xs text-slate-400">No tasks</p>}
            </Column>
          );
        })}
      </div>
    </DndContext>
  );
}
