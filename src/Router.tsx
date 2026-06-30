// router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { Suspense, type ReactNode, type ReactElement } from 'react';
import Layout from '@/pages/layout/Layout';
import RequireAuth from '@/components/RequireAuth';
import RequireNoAuth from '@/components/RequireNoAuth';
import RequireAdmin from '@/components/RequireAdmin';
import { CampLoader } from '@/components/CampLoader';
import PlayerLobby from './pages/PlayerLobby';
import PlayerProfilePage from './pages/Profile';

// Lazy load
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const PreferencesPage = lazy(() => import('@/pages/PreferencesPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CreateGame = lazy(() => import('@/pages/createGame'));
const LobbyAdminPage = lazy(() => import('@/pages/LobbyAdminPage'));
const JoinGamePage = lazy(() => import('@/pages/JoinGame'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminGames = lazy(() => import('@/pages/admin/AdminGames'));
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications'));
const AdminPrivacyRequests = lazy(() => import('@/pages/admin/AdminPrivacyRequests'));

const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('@/pages/TermsOfUse'));
const SharePhoto = lazy(() => import('@/pages/SharePhoto'));

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-camp-cream bg-topo text-center p-8">
    <div className="card-sign p-10 max-w-md">
      <h1 className="font-display text-4xl font-black text-camp-pine-dark mb-2">Page introuvable</h1>
      <p className="text-camp-bark mb-6">Le lien est peut-être expiré ou l'adresse incorrecte.</p>
      <a href="/dashboard" className="btn-primary inline-flex">Retour au tableau de bord</a>
    </div>
  </div>
);

const withSuspense = (el: ReactNode): ReactElement => (
  <Suspense fallback={<CampLoader />}>{el}</Suspense>
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

      {
        path: '/profile',
        element: withSuspense(
          <RequireAuth>
            <PlayerProfilePage />
          </RequireAuth>
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

      {
        path: '/lobby/:code',
        element: withSuspense(
          <RequireAuth>
            <PlayerLobby />
          </RequireAuth>
        ),
      },

      // mot de passe (public)
      { path: '/forgot-password', element: withSuspense(<ForgotPassword />) },
      { path: '/reset-password', element: withSuspense(<ResetPassword />) },

      // pages légales (publiques)
      { path: '/privacy', element: withSuspense(<PrivacyPolicy />) },
      { path: '/terms', element: withSuspense(<TermsOfUse />) },

      // PWA share target
      {
        path: '/share-photo',
        element: withSuspense(
          <RequireAuth>
            <SharePhoto />
          </RequireAuth>
        ),
      },

      // espace administrateur
      {
        path: '/admin',
        element: withSuspense(
          <RequireAuth>
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          </RequireAuth>
        ),
        children: [
          { index: true, element: withSuspense(<AdminOverview />) },
          { path: 'users', element: withSuspense(<AdminUsers />) },
          { path: 'games', element: withSuspense(<AdminGames />) },
          { path: 'notifications', element: withSuspense(<AdminNotifications />) },
          { path: 'privacy-requests', element: withSuspense(<AdminPrivacyRequests />) },
        ],
      },

      // redirects utiles
      { path: '/home', element: <Navigate to="/dashboard" replace /> },

      // 404
      { path: '*', element: <NotFound /> },
    ],
  },
]);
