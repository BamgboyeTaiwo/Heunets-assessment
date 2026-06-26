import { ApiEnvelope, apiClient } from '@/services/apiClient';
import { CreateTaskPayload, Task, UpdateTaskPayload } from './types';

export const tasksApi = {
  async list(projectId: string): Promise<Task[]> {
    const { data } = await apiClient.get<ApiEnvelope<Task[]>>(`/projects/${projectId}/tasks`);
    return data.data;
  },

  async create(projectId: string, payload: CreateTaskPayload): Promise<Task> {
    const { data } = await apiClient.post<ApiEnvelope<Task>>(
      `/projects/${projectId}/tasks`,
      payload,
    );
    return data.data;
  },

  async update(projectId: string, taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await apiClient.patch<ApiEnvelope<Task>>(
      `/projects/${projectId}/tasks/${taskId}`,
      payload,
    );
    return data.data;
  },

  async remove(projectId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
};
