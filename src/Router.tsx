import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import Layout from '@/pages/layout/Layout';
import AuthPage from '@/pages/AuthPage';
import PreferencesPage from './pages/PreferencesPage';
import Dashboard from './pages/Dashboard';
import RequireAuth from './components/RequireAuth';
import CreateGame from './pages/createGame';
import LobbyAdminPage from './pages/LobbyAdminPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <AuthPage />
      }
    ]
  },
  {
    path: '/onboard',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth>
            <PreferencesPage />
          </RequireAuth>
        )
      }
    ]
  },
  {
    path: '/dashboard',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth>
            <Dashboard />
          </RequireAuth> 
        )
      }
    ]
  },
  {
    path: '/games',
    element: <Layout />,
    children: [
      {
        path: 'create',
        element: (
          <RequireAuth>
            <CreateGame />
          </RequireAuth>
        )
      },
    ],      
  },
  {
    path: '/lobby',
    element: <Layout />,
    children: [
      {
        path: ':code',
        element: (
          <RequireAuth>
            <LobbyAdminPage />
          </RequireAuth>
        )
      }
    ]
  },
] as RouteObject[]);

export { router };
