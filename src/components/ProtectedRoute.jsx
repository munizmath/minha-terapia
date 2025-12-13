import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rotas que requerem autenticação
 * Permite acesso se não houver usuários cadastrados (primeira vez)
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, users } = useAuth();

    // Se não houver usuários cadastrados, permitir acesso (modo anônimo)
    if (users.length === 0) {
        return children;
    }

    // Se houver usuários mas não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

