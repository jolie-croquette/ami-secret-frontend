import React, { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Navigate } from '@/i18n/router';

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const auth = useContext(AuthContext);

  if (auth?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
