import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-indigo-600">
          TeamBoard
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.name}</span>
            <Button variant="ghost" onClick={logout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
