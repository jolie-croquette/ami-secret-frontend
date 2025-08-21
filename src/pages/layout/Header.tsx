import { useContext, useRef, useState, useEffect, KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function capitalizeWords(s?: string) {
  if (!s) return '';
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function Header() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => setDropdownOpen((v) => !v);
  const closeDropdown = () => setDropdownOpen(false);

  const handleLogout = () => {
    auth?.logout?.();
    setDropdownOpen(false);
    navigate('/login');
  };

  // Fermer le menu si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer au clavier (Escape) et gérer Enter/Space sur le bouton
  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      buttonRef.current?.focus();
    }
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDropdown();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onEsc as any);
    return () => document.removeEventListener('keydown', onEsc as any);
  }, []);

  const userName = capitalizeWords(auth?.user?.name) || 'Mon compte';
  const initials = (auth?.user?.name || 'A S')
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  // Optionnel : badge invitations si tu l'exposes via le contexte
  const invitesUnread = (auth as any)?.badges?.invitations ?? 0;

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-green-50/80 backdrop-blur-md shadow-md">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 py-3">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <span className="text-xl md:text-2xl font-extrabold text-green-900 tracking-tight group-hover:opacity-90">
            <i className="fa-solid fa-gift"></i> Ami(e) Secret
          </span>
        </Link>

        {auth?.user && (
          <div className="flex items-center gap-4">

            {/* Menu utilisateur */}
            <div className="relative" ref={dropdownRef}>
              <button
                ref={buttonRef}
                onClick={toggleDropdown}
                onKeyDown={onButtonKeyDown}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-controls="user-menu"
                className="flex items-center gap-2 text-sm md:text-base text-green-800 font-semibold hover:underline focus:outline-none"
              >
                <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold">
                  {initials}
                  {invitesUnread > 0 && (
                    <span
                      title={`${invitesUnread} invitation${invitesUnread > 1 ? 's' : ''} non lue${invitesUnread > 1 ? 's' : ''}`}
                      className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-yellow-400 text-green-900 text-[10px] flex items-center justify-center border border-white"
                    >
                      {invitesUnread}
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">{userName}</span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    id="user-menu"
                    role="menu"
                    aria-label="Menu utilisateur"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-yellow-300 z-50 p-1"
                  >
                    <Link
                      to="/dashboard"
                      onClick={closeDropdown}
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-green-900 hover:bg-yellow-50 rounded-lg"
                    >
                      <i className="fa-solid fa-list me-2" /> Mes parties
                    </Link>
                    <Link
                      to="/game/join"
                      onClick={closeDropdown}
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-green-900 hover:bg-yellow-50 rounded-lg"
                    >
                      <i className="fa-solid fa-right-to-bracket me-2" /> Rejoindre
                    </Link>
                    <Link
                      to="/game/create"
                      onClick={closeDropdown}
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-green-900 hover:bg-yellow-50 rounded-lg"
                    >
                      <i className="fa-solid fa-plus me-2" /> Créer une partie
                    </Link>

                    <div className="my-1 border-t border-yellow-200" />

                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-yellow-50 rounded-lg"
                    >
                      <i className="fa-solid fa-right-from-bracket rotate-180 me-2" /> Se déconnecter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
