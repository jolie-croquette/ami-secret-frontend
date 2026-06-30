import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import {
  privacyRequestApi,
  TYPE_LABELS,
  STATUS_LABELS,
  type PrivacyRequest,
  type PrivacyRequestStatus,
} from '@/api/privacyRequest';

const STATUS_COLORS: Record<PrivacyRequestStatus, string> = {
  pending: 'bg-camp-sand text-camp-bark',
  in_progress: 'bg-camp-sun/30 text-camp-pine-dark',
  resolved: 'bg-camp-pine/15 text-camp-pine',
  rejected: 'bg-camp-berry/15 text-camp-berry',
};

const STATUS_ICON: Record<PrivacyRequestStatus, typeof CheckCircle2> = {
  pending: Clock,
  in_progress: RotateCcw,
  resolved: CheckCircle2,
  rejected: XCircle,
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' });

const STATUSES: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'resolved', label: 'Résolues' },
  { value: 'rejected', label: 'Refusées' },
];

export default function AdminPrivacyRequests() {
  const [items, setItems] = useState<PrivacyRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<PrivacyRequest | null>(null);
  const [editStatus, setEditStatus] = useState<PrivacyRequestStatus>('in_progress');
  const [editNote, setEditNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async (p = page, s = statusFilter) => {
    setLoading(true);
    try {
      const res = await privacyRequestApi.adminList(s, p);
      setItems(res.items);
      setTotal(res.total);
      setPages(res.pages);
      setPage(res.page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1, 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (r: PrivacyRequest) => {
    setEditing(r);
    setEditStatus(r.status);
    setEditNote(r.adminNote ?? '');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await privacyRequestApi.adminUpdate(editing._id, {
        status: editStatus,
        adminNote: editNote.trim() || undefined,
      });
      toast.success('Demande mise à jour.');
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mise à jour impossible.');
    } finally {
      setSaving(false);
    }
  };

  const onFilterChange = (s: string) => {
    setStatusFilter(s);
    void load(1, s);
  };

  return (
    <div>
      {/* En-tête + compteur */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-camp-bark">{total} demande{total !== 1 ? 's' : ''} au total</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onFilterChange(s.value)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                statusFilter === s.value
                  ? 'bg-camp-pine text-camp-cream'
                  : 'border border-camp-bark/20 bg-white/60 text-camp-bark hover:border-camp-pine/40'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-camp-pine" />
        </div>
      ) : items.length === 0 ? (
        <p className="card-sign p-8 text-center text-camp-bark">Aucune demande.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => {
            const Icon = STATUS_ICON[r.status];
            return (
              <li key={r._id} className="card-sign p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-camp-pine-dark">
                        {TYPE_LABELS[r.type]}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                        <Icon className="h-3 w-3" />
                        {STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    {r.user && (
                      <p className="mt-0.5 text-sm text-camp-bark">
                        {r.user.name} · <span className="text-camp-bark/60">{r.user.email}</span>
                      </p>
                    )}
                    {r.message && (
                      <p className="mt-1 text-sm text-camp-ink/80">{r.message}</p>
                    )}
                    {r.adminNote && (
                      <p className="mt-1 rounded bg-camp-sand/50 px-2 py-1 text-xs text-camp-ink">
                        <strong>Note :</strong> {r.adminNote}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-camp-bark/50">{fmtDate(r.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() => openEdit(r)}
                  >
                    Traiter
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button className="icon-btn" disabled={page <= 1 || loading} onClick={() => void load(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-camp-bark">Page {page} / {pages}</span>
          <button className="icon-btn" disabled={page >= pages || loading} onClick={() => void load(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal traitement */}
      {editing && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-camp-ink/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="card-sign relative z-10 w-full max-w-md space-y-4 p-6">
            <h2 className="font-display text-lg font-black text-camp-pine-dark">
              Traiter — {TYPE_LABELS[editing.type]}
            </h2>
            {editing.user && (
              <p className="text-sm text-camp-bark">{editing.user.name} · {editing.user.email}</p>
            )}
            {editing.message && (
              <p className="rounded-lg bg-camp-sand/40 p-3 text-sm text-camp-ink">{editing.message}</p>
            )}
            <div>
              <label className="field-label">Statut</label>
              <select
                className="field"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as PrivacyRequestStatus)}
              >
                {(Object.entries(STATUS_LABELS) as [PrivacyRequestStatus, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Note pour l'utilisateur (optionnel)</label>
              <textarea
                className="field min-h-[80px] resize-y"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                maxLength={500}
                placeholder="Ex : Données exportées et envoyées par courriel."
              />
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-primary flex-1" onClick={() => void saveEdit()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
