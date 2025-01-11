import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}