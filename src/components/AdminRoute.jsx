import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se não é admin, redireciona para home com mensagem
  if (user.role !== 'ADMIN') {
    return <Navigate to="/offers" state={{ message: 'Acesso negado. Apenas administradores podem acessar esta área.' }} replace />;
  }

  // Se é admin, renderiza o componente
  return children;
}

export default AdminRoute;
