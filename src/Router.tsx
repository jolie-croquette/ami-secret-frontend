// router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { Suspense, type ReactNode, type ReactElement } from 'react';
import Layout from '@/pages/layout/Layout';
import RequireAuth from '@/components/RequireAuth';
import RequireNoAuth from '@/components/RequireNoAuth';
import { Bouncy } from 'ldrs/react';
import 'ldrs/react/Bouncy.css';

// Lazy load
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const PreferencesPage = lazy(() => import('@/pages/PreferencesPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CreateGame = lazy(() => import('@/pages/createGame'));
const LobbyAdminPage = lazy(() => import('@/pages/LobbyAdminPage'));
const JoinGamePage = lazy(() => import('@/pages/JoinGame'));

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-center p-8">
    <div>
      <h1 className="text-3xl font-extrabold mb-2">Oups, page introuvable</h1>
      <p className="text-gray-600 mb-6">Le lien est peut-être expiré ou l'URL incorrecte.</p>
      <a href="/dashboard" className="px-5 py-2 rounded-full bg-green-600 text-white font-semibold">
        Retour au tableau de bord
      </a>
    </div>
  </div>
);

const withSuspense = (el: ReactNode): ReactElement => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
    <div className='min-h-[240px] flex items-start justify-center mt-20'>
      <Bouncy size="100" speed="1.5" color="green" />
    </div>
  </div>}>
    {el}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    // Un SEUL Layout pour toute l'app
    element: <Layout />,
    children: [
      // accueil (login)
      { 
        index: true, 
        path: '/', 
        element: withSuspense(
          <RequireNoAuth>
            <AuthPage />
          </RequireNoAuth>
        ) 
      },

      // onboarding préférences
      {
        path: '/onboard',
        element: withSuspense(
          <RequireAuth>
            <PreferencesPage />
          </RequireAuth>
        ),
      },

      // dashboard
      {
        path: '/dashboard',
        element: withSuspense(
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        ),
      },

      // game
      {
        path: '/game/create',
        element: withSuspense(
          <RequireAuth>
            <CreateGame />
          </RequireAuth>
        ),
      },
      {
        // principal (emails): /game/join?code=ABC123
        path: '/game/join',
        element: withSuspense(
          <RequireAuth>
            <JoinGamePage />
          </RequireAuth>
        ),
      },
      {
        // alias: /game/join/ABC123
        path: '/game/join/:code',
        element: withSuspense(
          <RequireAuth>
            <JoinGamePage />
          </RequireAuth>
        ),
      },

      // lobby
      {
        path: '/lobby/:code/admin',
        element: withSuspense(
          <RequireAuth>
            <LobbyAdminPage />
          </RequireAuth>
        ),
      },

      // redirects utiles
      { path: '/home', element: <Navigate to="/dashboard" replace /> },

      // 404
      { path: '*', element: <NotFound /> },
    ],
  },
]);
