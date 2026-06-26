import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { TaskBoard } from '@/features/tasks/TaskBoard';
import { TaskFormModal } from '@/features/tasks/TaskFormModal';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useAuth } from '@/features/auth/AuthContext';
import { AddMemberForm } from './AddMemberForm';
import { useDeleteProject, useProject } from './useProjects';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: project, isLoading, isError, error } = useProject(projectId ?? '');
  const deleteProject = useDeleteProject();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  if (!projectId) return null;
  if (isLoading) return <p className="text-sm text-slate-500">Loading project…</p>;
  if (isError || !project) {
    return <Alert message={getErrorMessage(error, 'Unable to load project')} />;
  }

  const isOwner = project.owner === user?.id;

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}" and all of its tasks? This cannot be undone.`)) {
      return;
    }
    await deleteProject.mutateAsync(project.id);
    navigate('/projects');
  };

  return (
    <div>
      <Link to="/projects" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to projects
      </Link>

      <div className="mt-2 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {project.description || 'No description provided.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsTaskModalOpen(true)}>Add task</Button>
          {isOwner && (
            <Button variant="danger" onClick={handleDelete} isLoading={deleteProject.isPending}>
              Delete project
            </Button>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Team members</h2>
          <p className="mb-3 text-xs text-slate-500">{project.members.length} member(s)</p>
          <AddMemberForm projectId={project.id} />
        </div>
      )}

      <TaskBoard projectId={project.id} />

      {isTaskModalOpen && (
        <TaskFormModal projectId={project.id} onClose={() => setIsTaskModalOpen(false)} />
      )}
    </div>
  );
}
