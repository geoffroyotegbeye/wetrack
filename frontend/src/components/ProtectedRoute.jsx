import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#FF4500]" />
  </div>
);

// Affiche les routes enfants si l'utilisateur est connecté, sinon renvoie vers /login.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) return <Spinner />;

  if (!isAuthenticated) {
    const returnTo = location.pathname + location.search;
    const target = returnTo && returnTo !== '/' ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
