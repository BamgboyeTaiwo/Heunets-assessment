import { ApiEnvelope, apiClient } from '@/services/apiClient';
import { AddMemberPayload, CreateProjectPayload, Project, UpdateProjectPayload } from './types';

export const projectsApi = {
  async list(): Promise<Project[]> {
    const { data } = await apiClient.get<ApiEnvelope<Project[]>>('/projects');
    return data.data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await apiClient.get<ApiEnvelope<Project>>(`/projects/${id}`);
    return data.data;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await apiClient.post<ApiEnvelope<Project>>('/projects', payload);
    return data.data;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const { data } = await apiClient.patch<ApiEnvelope<Project>>(`/projects/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  async addMember(id: string, payload: AddMemberPayload): Promise<Project> {
    const { data } = await apiClient.post<ApiEnvelope<Project>>(`/projects/${id}/members`, payload);
    return data.data;
  },
};
