import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { tasksApi } from './tasksApi';
import { CreateTaskPayload, Task, UpdateTaskPayload } from './types';

export const tasksQueryKeys = {
  forProject: (projectId: string) => ['projects', projectId, 'tasks'] as const,
};

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: tasksQueryKeys.forProject(projectId),
    queryFn: () => tasksApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.forProject(projectId) });
      toast.success('Task created');
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = tasksQueryKeys.forProject(projectId);

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      tasksApi.update(projectId, taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (current) =>
        current?.map((task) => (task.id === taskId ? { ...task, ...payload } : task)),
      );

      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      toast.error(getErrorMessage(error, 'Unable to update task'));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.forProject(projectId) });
      toast.success('Task deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to delete task')),
  });
}
