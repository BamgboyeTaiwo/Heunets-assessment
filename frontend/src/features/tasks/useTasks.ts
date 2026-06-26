import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from './tasksApi';
import { CreateTaskPayload, UpdateTaskPayload } from './types';

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksQueryKeys.forProject(projectId) }),
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      tasksApi.update(projectId, taskId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksQueryKeys.forProject(projectId) }),
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(projectId, taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksQueryKeys.forProject(projectId) }),
  });
}
