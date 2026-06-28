import { forwardRef, InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 9.93 7.5.781 0 1.541-.094 2.268-.272m3.328-1.667A10.43 10.43 0 0 0 22.066 12C20.774 7.662 16.756 4.5 12 4.5c-1.34 0-2.616.255-3.797.71m4.42 4.418a3 3 0 1 1-4.243 4.243"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', type, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isPassword && showPassword ? 'text' : type}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isPassword ? 'pr-10' : ''
            } ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
