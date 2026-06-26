import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from './projectsApi';
import { AddMemberPayload, CreateProjectPayload, UpdateProjectPayload } from './types';

export const projectsQueryKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectsQueryKeys.all,
    queryFn: projectsApi.list,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectsQueryKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all }),
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => projectsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(id) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all }),
  });
}

export function useAddMember(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMemberPayload) => projectsApi.addMember(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(id) }),
  });
}
