import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useAuth } from './AuthContext';
import { SignupPayload } from './types';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupPayload>();

  const onSubmit = async (data: SignupPayload) => {
    setServerError(null);
    try {
      await signup(data);
      navigate('/projects', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to sign up'));
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Create your account</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <Alert message={serverError} />}
        <Input
          id="name"
          label="Name"
          placeholder="Ada Lovelace"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: 2 })}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Sign up
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
