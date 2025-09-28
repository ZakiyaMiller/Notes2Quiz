import { useAuth } from '../../auth/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  return currentUser ? children : null;
};

export default ProtectedRoute;