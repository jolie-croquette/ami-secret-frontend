import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Gift, Sparkles, Inbox, UserMinus, BellOff, Camera } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { notificationsApi } from '@/api/notifications';
import type { AppNotification, NotificationType } from '@/api/types';

const POLL_MS = 45_000;

const ICONS: Record<NotificationType, typeof Bell> = {
  message: Inbox,
  draw: Gift,
  reveal: Sparkles,
  removed: UserMinus,
  'gift-photo': Camera,
};

/** Date relative compacte en français (« à l'instant », « il y a 5 min »…). */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export default function NotificationBell() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      setItems(res.items);
      setUnread(res.unreadCount);
    } catch {
      /* silencieux : la cloche ne doit pas casser l'UI */
    }
  }, []);

  // Premier chargement + sondage périodique.
  useEffect(() => {
    if (!auth?.user) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [auth?.user, refresh]);

  // Fermeture au clic extérieur / Échap.
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  if (!auth?.user) return null;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      try {
        await notificationsApi.markRead();
      } catch {
        /* ignore */
      }
      void refresh();
    }
  };

  const openLink = (n: AppNotification) => {
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => void toggle()}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-camp-bark/15 bg-white/60 text-camp-pine-dark transition hover:border-camp-pine/40"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-camp-ember px-1 text-[10px] font-extrabold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="card-sign absolute right-0 mt-2 w-80 max-w-[85vw] overflow-hidden p-1.5"
          >
            <p className="px-3 py-2 font-display text-sm font-black text-camp-pine-dark">
              Notifications
            </p>
            <div className="max-h-96 overflow-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-sm text-camp-bark">
                  <BellOff className="h-6 w-6 text-camp-bark/40" />
                  Aucune notification.
                </div>
              ) : (
                items.map((n) => {
                  const Icon = ICONS[n.type] ?? Bell;
                  return (
                    <button
                      key={n._id}
                      onClick={() => openLink(n)}
                      role="menuitem"
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-camp-sand/60 ${
                        n.readAt ? '' : 'bg-camp-sand/30'
                      }`}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-camp-pine/10 text-camp-pine">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-camp-ink">{n.title}</span>
                        <span className="block text-xs text-camp-bark/70">{relativeTime(n.createdAt)}</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
