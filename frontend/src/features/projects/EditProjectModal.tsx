import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useUpdateProject } from './useProjects';
import { Project, UpdateProjectPayload } from './types';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
}

export function EditProjectModal({ project, onClose }: EditProjectModalProps) {
  const updateProject = useUpdateProject(project.id);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProjectPayload>({
    defaultValues: {
      name: project.name,
      description: project.description,
    },
  });

  const onSubmit = async (data: UpdateProjectPayload) => {
    setServerError(null);
    try {
      await updateProject.mutateAsync(data);
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to update project'));
    }
  };

  return (
    <Modal title="Edit project" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <Alert message={serverError} />}
        <Input
          id="name"
          label="Project name"
          placeholder="Website Redesign"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: 2 })}
        />
        <TextArea
          id="description"
          label="Description (optional)"
          rows={3}
          placeholder="What is this project about?"
          {...register('description')}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
