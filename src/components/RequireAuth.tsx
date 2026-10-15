import React, { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Navigate } from '@/i18n/router';
import { stripLang } from '@/i18n/lang';

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  // Tant que le profil de préférences n'est pas complété, on force le wizard.
  if (!auth.user.onBoarded && stripLang(location.pathname) !== '/onboard') {
    return <Navigate to="/onboard" replace />;
  }

  return children;
}
