import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

export default function Header() {
  const auth = useContext(AuthContext);

  return (
    <header className="bg-primary text-primary-foreground shadow-sm sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo / Titre du site */}
        <Link to="/" className="text-2xl font-black tracking-tight hover:opacity-90 transition-all">
          🎁 Ami Secret
        </Link>

        {/* Navigation conditionnelle */}
        <nav className="flex items-center gap-6 text-sm">
          {auth?.user ? (
            <div className="flex items-center gap-3">
              <span className="font-medium">Bienvenue, <span className="font-semibold">{auth.user.name}</span></span>
              <button
                onClick={auth.logout}
                className="bg-destructive text-destructive-foreground px-4 py-1 rounded-md text-sm hover:bg-opacity-90 transition-all"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            <>
              <Link to="/connexion" className="hover:underline hover:opacity-80 transition-all">
                Connexion
              </Link>
              <Link to="/inscription" className="bg-secondary px-3 py-1.5 rounded-md font-medium text-secondary-foreground hover:bg-opacity-90 transition-all">
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}