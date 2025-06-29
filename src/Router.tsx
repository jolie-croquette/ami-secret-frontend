import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
  {
    path: '/',
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
