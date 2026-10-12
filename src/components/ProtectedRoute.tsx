import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext.tsx';
import { Activity } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-600/10 flex items-center justify-center text-teal-600 animate-pulse mb-3">
          <Activity size={28} className="animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Carregando FisioGest...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota exige papéis específicos e o usuário atual não tem permissão
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-6 text-center max-w-md mx-auto mt-12 bg-white rounded-2xl border border-rose-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Acesso Restrito</h2>
        <p className="text-sm text-slate-600 mb-4">
          Esta funcionalidade exige permissões de <strong>{allowedRoles.join(', ')}</strong>.
          Seu perfil atual é <strong>{role === 'admin' ? 'Fisioterapeuta (Admin)' : 'Secretária'}</strong>.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
