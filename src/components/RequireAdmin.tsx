import React, { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

/** Restreint l'accès aux administrateurs. À placer à l'intérieur d'un RequireAuth. */
export default function RequireAdmin({ children }: { children: React.ReactElement }) {
  const auth = useContext(AuthContext);

  if (!auth?.user) return <Navigate to="/" replace />;
  if (auth.user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}
