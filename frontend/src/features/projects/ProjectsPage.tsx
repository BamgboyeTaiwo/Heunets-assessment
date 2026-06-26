import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectCard } from './ProjectCard';
import { useProjects } from './useProjects';

export function ProjectsPage() {
  const { data: projects, isLoading, isError, error } = useProjects();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Your projects</h1>
        <Button onClick={() => setIsCreateOpen(true)}>New project</Button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading projects…</p>}
      {isError && <Alert message={getErrorMessage(error, 'Unable to load projects')} />}

      {projects && projects.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No projects yet. Create your first one to get started.
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {isCreateOpen && <CreateProjectModal onClose={() => setIsCreateOpen(false)} />}
    </div>
  );
}
