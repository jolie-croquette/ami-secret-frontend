import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import Layout from '@/pages/layout/Layout';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
      }
    ]
  },
  {
    path: '/connexion',
  },
  {
    path: '/inscription',
  }
];

const router = createBrowserRouter(routes);

export { router };
