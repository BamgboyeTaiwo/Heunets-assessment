import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { ProjectMember } from '@/features/projects/types';
import { useCreateTask } from './useTasks';
import { CreateTaskPayload, TaskPriority } from './types';

interface TaskFormModalProps {
  projectId: string;
  members: ProjectMember[];
  onClose: () => void;
}

export function TaskFormModal({ projectId, members, onClose }: TaskFormModalProps) {
  const createTask = useCreateTask(projectId);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskPayload>({ defaultValues: { priority: 'medium' } });

  const onSubmit = async (data: CreateTaskPayload) => {
    setServerError(null);
    try {
      await createTask.mutateAsync(data);
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to create task'));
    }
  };

  return (
    <Modal title="New task" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <Alert message={serverError} />}
        <Input
          id="title"
          label="Title"
          placeholder="Set up CI pipeline"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required', minLength: 2 })}
        />
        <TextArea
          id="description"
          label="Description (optional)"
          rows={3}
          placeholder="Add more detail about this task"
          {...register('description')}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="priority" className="text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('priority')}
          >
            {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => (
              <option key={priority} value={priority}>
                {priority[0].toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="assignee" className="text-sm font-medium text-slate-700">
            Assignee
          </label>
          <select
            id="assignee"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('assignee')}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
