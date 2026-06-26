import React, { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth?.user) {
    return <Navigate to="/" replace />;
  }

  // Tant que le profil de préférences n'est pas complété, on force le wizard.
  if (!auth.user.onBoarded && location.pathname !== '/onboard') {
    return <Navigate to="/onboard" replace />;
  }

  return children;
}
