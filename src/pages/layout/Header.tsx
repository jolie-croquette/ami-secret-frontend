import { useContext, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const auth = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleLogout = () => {
    auth?.logout();
    setDropdownOpen(false);
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

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-green-50/80 backdrop-blur-md shadow-md">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-extrabold text-green-900 tracking-tight">
            <i className="fa-solid fa-gift"></i> Ami(e) Secret
          </span>
        </Link>

        {auth?.user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="text-sm md:text-base text-green-800 font-semibold hover:underline"
            >
              <i className="fa-solid fa-user me-2"></i> {auth.user.name[0].toUpperCase() + auth.user.name.slice(1)}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-lg border border-yellow-300 z-50"
                >
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-yellow-50 rounded-xl"
                  >
                    <i className="fa-solid fa-right-from-bracket rotate-180 me-2"></i> Se déconnecter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
