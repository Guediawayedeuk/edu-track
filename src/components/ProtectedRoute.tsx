import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import RoleLoadingScreen from "./RoleLoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const DASHBOARD_MAP: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  parent: "/parent",
};

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading, roleLoaded } = useAuth();

  if (loading) return <RoleLoadingScreen step={0} message="Vérification de la session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roleLoaded) return <RoleLoadingScreen step={1} message="Détection de votre rôle..." />;
  if (!role) return <Navigate to="/no-role" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={DASHBOARD_MAP[role] || "/"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
