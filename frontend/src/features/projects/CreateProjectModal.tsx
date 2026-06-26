import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useCreateProject } from './useProjects';
import { CreateProjectPayload } from './types';

interface CreateProjectModalProps {
  onClose: () => void;
}

export function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const createProject = useCreateProject();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectPayload>();

  const onSubmit = async (data: CreateProjectPayload) => {
    setServerError(null);
    try {
      await createProject.mutateAsync(data);
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to create project'));
    }
  };

  return (
    <Modal title="New project" onClose={onClose}>
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
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
