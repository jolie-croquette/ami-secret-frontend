import { useContext, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { TreePine, UserRound, LayoutGrid, LogIn, Plus, LogOut, ChevronDown, ShieldCheck, CircleHelp } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { OPEN_TUTORIAL_EVENT } from '@/components/MobileTutorial';
import { isMobileDevice } from '@/lib/pwa';

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

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  const handleLogout = () => {
    auth?.logout?.();
    close();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) close();
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const userName = capitalizeWords(auth?.user?.name) || 'Mon compte';
  const initials = (auth?.user?.name || 'AS')
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const menuItems = [
    { to: '/profile', icon: UserRound, label: 'Mon profil' },
    { to: '/dashboard', icon: LayoutGrid, label: 'Mes parties' },
    { to: '/game/join', icon: LogIn, label: 'Rejoindre une partie' },
    { to: '/game/create', icon: Plus, label: 'Créer une partie' },
    ...(auth?.isAdmin ? [{ to: '/admin', icon: ShieldCheck, label: 'Espace admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-camp-bark/15 bg-camp-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-5 py-3">
        <Link to={auth?.user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-camp-pine text-camp-cream shadow-sign-sm">
            <TreePine className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-black tracking-tight text-camp-pine-dark">
            Ami Secret
          </span>
        </Link>

        {!auth?.user && (
          <Link
            to="/login"
            className="rounded-full border-2 border-camp-pine/30 bg-white/60 px-4 py-1.5 text-sm font-extrabold text-camp-pine transition hover:border-camp-pine"
          >
            Se connecter
          </Link>
        )}

        {auth?.user && (
          <div className="flex items-center gap-2">
            {isMobileDevice() && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_TUTORIAL_EVENT))}
                aria-label="Aide — revoir le tutoriel"
                title="Aide"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-camp-bark/15 bg-white/60 text-camp-pine transition hover:border-camp-pine/40"
              >
                <CircleHelp className="h-5 w-5" />
              </button>
            )}
            <NotificationBell />
            <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-2 rounded-full border-2 border-camp-bark/15 bg-white/60 py-1 pl-1 pr-2.5 font-body font-bold text-camp-pine-dark transition hover:border-camp-pine/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-camp-ember text-sm font-extrabold text-white">
                {initials}
              </span>
              <span className="hidden sm:inline text-sm">{userName}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                  className="card-sign absolute right-0 mt-2 w-56 overflow-hidden p-1.5"
                >
                  {menuItems.map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={close}
                      role="menuitem"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-camp-ink hover:bg-camp-sand/60"
                    >
                      <Icon className="h-4 w-4 text-camp-pine" />
                      {label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-camp-bark/15" />
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-camp-berry hover:bg-camp-berry/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
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
