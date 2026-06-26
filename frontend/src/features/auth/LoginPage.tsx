import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useAuth } from './AuthContext';
import { LoginPayload } from './types';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>();

  const redirectTo = (location.state as { from?: string })?.from ?? '/projects';

  const onSubmit = async (data: LoginPayload) => {
    setServerError(null);
    try {
      await login(data);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to log in'));
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Log in to TeamBoard</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <Alert message={serverError} />}
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
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
