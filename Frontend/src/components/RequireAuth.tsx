import { Navigate } from "react-router-dom";
import { useAuth } from "@/state/stores";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
