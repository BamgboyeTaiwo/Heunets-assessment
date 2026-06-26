import { Link } from 'react-router-dom';
import { Project } from './types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="font-semibold text-slate-900">{project.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
        {project.description || 'No description provided.'}
      </p>
      <p className="mt-3 text-xs text-slate-400">
        {project.members.length} member{project.members.length === 1 ? '' : 's'}
      </p>
    </Link>
  );
}
