export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export interface AddMemberPayload {
  email: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
}
