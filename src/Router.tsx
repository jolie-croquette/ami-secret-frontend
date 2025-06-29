import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import Layout from '@/pages/layout/Layout';
import AuthPage from '@/pages/AuthPage';
import PreferencesPage from './pages/PreferencesPage';

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
    path: '/onboarding',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <PreferencesPage />
      }
    ]
  }

] as RouteObject[]);

export { router };
