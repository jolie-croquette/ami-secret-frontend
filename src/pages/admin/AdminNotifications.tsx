import { useCallback, useEffect, useState } from 'react';
import { adminApi, type ListNotificationsParams } from '@/api/admin';
import type { AdminNotificationRow, NotificationType } from '@/api/types';
import { CampLoader } from '@/components/CampLoader';
import { toast } from 'react-toastify';
import { Search, ChevronLeft, ChevronRight, MessageSquare, Shuffle, Sparkles, UserX } from 'lucide-react';

type TypeFilter = NonNullable<ListNotificationsParams['type']>;
type StatusFilter = NonNullable<ListNotificationsParams['status']>;

const LIMIT = 20;

const TYPE_LABEL: Record<NotificationType, string> = {
  message: 'Message',
  draw: 'Tirage',
  reveal: 'Révélation',
  removed: 'Retrait',
};

const TYPE_ICON: Record<NotificationType, typeof MessageSquare> = {
  message: MessageSquare,
  draw: Shuffle,
  reveal: Sparkles,
  removed: UserX,
};

function TypeBadge({ type }: { type: NotificationType }) {
  const Icon = TYPE_ICON[type];
  return (
    <span className="badge-merit inline-flex items-center gap-1 bg-camp-sand text-camp-pine-dark">
      <Icon className="h-3.5 w-3.5" /> {TYPE_LABEL[type]}
    </span>
  );
}

export default function AdminNotifications() {
  const [rows, setRows] = useState<AdminNotificationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (opts?: { page?: number; search?: string; type?: TypeFilter; status?: StatusFilter }) => {
      setLoading(true);
      try {
        const res = await adminApi.listNotifications({
          page: opts?.page ?? page,
          search: opts?.search ?? search,
          type: opts?.type ?? type,
          status: opts?.status ?? status,
          limit: LIMIT,
        });
        setRows(res.items);
        setTotal(res.total);
        setPages(res.pages);
        setPage(res.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur lors du chargement.');
      } finally {
        setLoading(false);
      }
    },
    [page, search, type, status]
  );

  useEffect(() => {
    void load({ page: 1, search: '', type: 'all', status: 'all' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load({ page: 1 });
        }}
        className="mb-5 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
          <input
            className="field pl-11"
            placeholder="Rechercher par titre ou code de partie…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="field sm:w-44"
          value={type}
          onChange={(e) => {
            const next = e.target.value as TypeFilter;
            setType(next);
            void load({ page: 1, type: next });
          }}
        >
          <option value="all">Tous les types</option>
          <option value="message">Message</option>
          <option value="draw">Tirage</option>
          <option value="reveal">Révélation</option>
          <option value="removed">Retrait</option>
        </select>
        <select
          className="field sm:w-40"
          value={status}
          onChange={(e) => {
            const next = e.target.value as StatusFilter;
            setStatus(next);
            void load({ page: 1, status: next });
          }}
        >
          <option value="all">Lues et non lues</option>
          <option value="unread">Non lues</option>
          <option value="read">Lues</option>
        </select>
        <button type="submit" className="btn-primary">
          Rechercher
        </button>
      </form>

      {loading ? (
        <CampLoader />
      ) : rows.length === 0 ? (
        <p className="card-sign p-8 text-center text-camp-bark">Aucune notification trouvée.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((n) => (
            <li key={n._id} className="card-sign flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={n.type} />
                  {!n.readAt && (
                    <span className="badge-merit bg-camp-ember text-white">Non lue</span>
                  )}
                  {n.gameCode && (
                    <span className="rounded-full bg-camp-sand/60 px-2 py-0.5 font-mono text-xs font-bold text-camp-bark">
                      {n.gameCode}
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-camp-pine-dark">{n.title}</p>
                <p className="mt-0.5 text-xs text-camp-bark">
                  {n.user?.name ?? 'Utilisateur inconnu'} · {new Date(n.createdAt).toLocaleString('fr-CA')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            className="icon-btn"
            disabled={page <= 1 || loading}
            onClick={() => void load({ page: page - 1 })}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-camp-bark">
            Page {page} / {pages} · {total} notifications
          </span>
          <button
            className="icon-btn"
            disabled={page >= pages || loading}
            onClick={() => void load({ page: page + 1 })}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
