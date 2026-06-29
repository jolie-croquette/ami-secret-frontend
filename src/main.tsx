import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { router }  from './Router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <AuthProvider>
      <RouterProvider router={router}/>
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  </ErrorBoundary>
)
