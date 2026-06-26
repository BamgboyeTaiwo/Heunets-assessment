import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useAddMember } from './useProjects';
import { AddMemberPayload } from './types';

interface AddMemberFormProps {
  projectId: string;
}

export function AddMemberForm({ projectId }: AddMemberFormProps) {
  const addMember = useAddMember(projectId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberPayload>();

  const onSubmit = async (data: AddMemberPayload) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await addMember.mutateAsync(data);
      setSuccessMessage(`${data.email} was added to the project.`);
      reset();
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to add member'));
    }
  };

  return (
    <form className="flex items-end gap-2" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="member-email"
        type="email"
        placeholder="teammate@example.com"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      <Button type="submit" variant="secondary" isLoading={isSubmitting}>
        Add member
      </Button>
      {serverError && <p className="text-xs text-red-600">{serverError}</p>}
      {successMessage && <p className="text-xs text-emerald-600">{successMessage}</p>}
    </form>
  );
}
