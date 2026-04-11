import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { isRoleMatch } from "../utils/roleUtils";

const ProtectedRoute = ({ roles = [], children }) => {
  const auth = useAuth();
  const location = useLocation();
  const allowed = isRoleMatch(auth.user?.role, roles);

  if (!auth.isLoggedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allowed) return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />;
  return children;
};

export default ProtectedRoute;
