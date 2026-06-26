import { useCallback, useEffect, useState } from 'react';
import { adminApi, type ListGamesParams, type AdminGameDetail } from '@/api/admin';
import type { AdminGameRow, GameStatus } from '@/api/types';
import { CampLoader } from '@/components/CampLoader';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'react-toastify';
import {
  Search,
  Eye,
  Shuffle,
  Sparkles,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Pencil,
  UserMinus,
  Loader2,
  Gift,
  ArrowRight,
} from 'lucide-react';

type StatusFilter = NonNullable<ListGamesParams['status']>;
type ConfirmKind = 'draw' | 'reveal' | 'delete';

const LIMIT = 20;

const STATUS_LABEL: Record<GameStatus, string> = {
  lobby: 'En attente',
  drawn: 'Tirée',
  revealed: 'Révélée',
};

function StatusBadge({ status }: { status: GameStatus }) {
  const cls =
    status === 'lobby'
      ? 'bg-camp-sand text-camp-pine-dark'
      : status === 'drawn'
        ? 'bg-camp-pine text-camp-cream'
        : 'bg-camp-ember text-white';
  return <span className={`badge-merit ${cls}`}>{STATUS_LABEL[status]}</span>;
}

export default function AdminGames() {
  const [rows, setRows] = useState<AdminGameRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; game: AdminGameRow } | null>(null);
  const [detail, setDetail] = useState<AdminGameDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [edit, setEdit] = useState<AdminGameRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editWeeks, setEditWeeks] = useState(7);
  const [editReminder, setEditReminder] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(
    async (opts?: { page?: number; search?: string; status?: StatusFilter }) => {
      setLoading(true);
      try {
        const res = await adminApi.listGames({
          page: opts?.page ?? page,
          search: opts?.search ?? search,
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
    [page, search, status]
  );

  useEffect(() => {
    void load({ page: 1, search: '', status: 'all' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (g: AdminGameRow) => {
    setDetailLoading(true);
    setDetail({
      _id: g._id,
      name: g.name,
      code: g.code,
      status: g.status,
      numberOfWeeks: g.numberOfWeeks,
    });
    try {
      setDetail(await adminApi.getGame(g._id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Détails indisponibles.');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const removeMember = async (userId: string, name: string) => {
    if (!detail) return;
    if (!window.confirm(`Retirer ${name} de « ${detail.name} » ?`)) return;
    setRemovingId(userId);
    try {
      await adminApi.removeGameMember(detail._id, userId);
      toast.success(`${name} a été retiré de la partie.`);
      setDetail(await adminApi.getGame(detail._id));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Retrait impossible.');
    } finally {
      setRemovingId(null);
    }
  };

  const openEdit = (g: AdminGameRow) => {
    setEditName(g.name);
    setEditWeeks(g.numberOfWeeks);
    setEditReminder(g.reminderDayBefore ?? 0);
    setEdit(g);
  };

  const saveEdit = async () => {
    if (!edit) return;
    const name = editName.trim();
    if (!name) {
      toast.warning('Le nom est requis.');
      return;
    }
    setSavingEdit(true);
    try {
      await adminApi.updateGame(edit._id, {
        name,
        numberOfWeeks: editWeeks,
        reminderDayBefore: editReminder,
      });
      toast.success('Partie mise à jour.');
      setEdit(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mise à jour impossible.');
    } finally {
      setSavingEdit(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { kind, game } = confirm;
    setBusyId(game._id);
    try {
      if (kind === 'draw') {
        await adminApi.forceDraw(game._id);
        toast.success('Tirage effectué.');
      } else if (kind === 'reveal') {
        await adminApi.forceReveal(game._id);
        toast.success('Amis secrets révélés.');
      } else {
        await adminApi.deleteGame(game._id);
        toast.success('Partie supprimée.');
      }
      setConfirm(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  };

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
            placeholder="Rechercher par nom ou code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="field sm:w-48"
          value={status}
          onChange={(e) => {
            const next = e.target.value as StatusFilter;
            setStatus(next);
            void load({ page: 1, status: next });
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="lobby">En attente</option>
          <option value="drawn">Tirées</option>
          <option value="revealed">Révélées</option>
        </select>
        <button type="submit" className="btn-primary">
          Rechercher
        </button>
      </form>

      {loading ? (
        <CampLoader />
      ) : rows.length === 0 ? (
        <p className="card-sign p-8 text-center text-camp-bark">Aucune partie trouvée.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((g) => {
            const busy = busyId === g._id;
            const creator = g.createdBy && typeof g.createdBy === 'object' ? g.createdBy.name : null;
            return (
              <li key={g._id} className="card-sign flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-bold text-camp-pine-dark">
                      {g.name}
                    </span>
                    <StatusBadge status={g.status} />
                    <span className="rounded-full bg-camp-sand/60 px-2 py-0.5 font-mono text-xs font-bold text-camp-bark">
                      {g.code}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-3 text-sm text-camp-bark">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" /> {g.memberCount}
                    </span>
                    <span>{g.numberOfWeeks} sem.</span>
                    {creator && <span className="truncate">par {creator}</span>}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    className="icon-btn"
                    title="Détails"
                    disabled={busy}
                    onClick={() => void openDetail(g)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="icon-btn"
                    title="Modifier la partie"
                    disabled={busy}
                    onClick={() => openEdit(g)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {g.status === 'lobby' && (
                    <button
                      className="icon-btn"
                      title="Forcer le tirage"
                      disabled={busy || g.memberCount < 2}
                      onClick={() => setConfirm({ kind: 'draw', game: g })}
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>
                  )}
                  {g.status === 'drawn' && (
                    <button
                      className="icon-btn"
                      title="Forcer la révélation"
                      disabled={busy}
                      onClick={() => setConfirm({ kind: 'reveal', game: g })}
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    className="icon-btn icon-btn-danger"
                    title="Supprimer la partie"
                    disabled={busy}
                    onClick={() => setConfirm({ kind: 'delete', game: g })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
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
            Page {page} / {pages} · {total} parties
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

      {/* Confirmation */}
      <ConfirmModal
        open={!!confirm}
        tone={confirm?.kind === 'delete' ? 'danger' : 'default'}
        title={
          confirm?.kind === 'draw'
            ? 'Forcer le tirage ?'
            : confirm?.kind === 'reveal'
              ? 'Forcer la révélation ?'
              : `Supprimer « ${confirm?.game.name} » ?`
        }
        message={
          confirm?.kind === 'draw'
            ? 'Chaque participant se verra attribuer un ami secret. La partie passera au statut « Tirée ».'
            : confirm?.kind === 'reveal'
              ? 'Tous les amis secrets seront dévoilés aux participants.'
              : 'Suppression définitive de la partie et de ses messages. Action irréversible.'
        }
        confirmLabel={
          confirm?.kind === 'draw' ? 'Tirer' : confirm?.kind === 'reveal' ? 'Révéler' : 'Supprimer'
        }
        loading={!!busyId}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void runConfirm()}
      />

      {/* Détails */}
      <ConfirmModal
        open={!!detail}
        title={detail ? detail.name : 'Partie'}
        confirmLabel="Fermer"
        cancelLabel="Fermer"
        onCancel={() => setDetail(null)}
        onConfirm={() => setDetail(null)}
      >
        {detailLoading ? (
          <p className="text-sm text-camp-bark">Chargement…</p>
        ) : detail ? (
          <div className="max-h-80 space-y-2 overflow-auto">
            <p className="text-sm text-camp-bark">
              Code <span className="font-mono font-bold">{detail.code}</span> · {detail.numberOfWeeks}{' '}
              semaines · statut {STATUS_LABEL[detail.status]}
            </p>
            {detail.status === 'lobby' ? (
              <p className="rounded-xl bg-camp-sand/40 px-3 py-2 text-xs text-camp-bark">
                Le tirage n’a pas encore été effectué — aucune attribution à afficher.
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-camp-bark">
                <Gift className="h-3.5 w-3.5 text-camp-pine" /> Résultat du tirage : qui offre à qui
              </p>
            )}
            <ul className="divide-y divide-camp-bark/10">
              {(detail.members ?? []).map((m) => (
                <li key={m.user._id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-camp-pine-dark">
                      {m.user.name}
                    </span>
                    {m.secretFriend && (
                      <span className="flex items-center gap-1 truncate text-xs text-camp-bark">
                        <ArrowRight className="h-3 w-3 shrink-0 text-camp-pine" />
                        offre à{' '}
                        <span className="font-semibold text-camp-pine">{m.secretFriend.name}</span>
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-camp-bark">{m.weeksReceived?.length ?? 0} reçus</span>
                  <button
                    className="icon-btn icon-btn-danger !h-8 !w-8 shrink-0"
                    title="Retirer de la partie"
                    disabled={removingId === m.user._id}
                    onClick={() => void removeMember(m.user._id, m.user.name)}
                  >
                    {removingId === m.user._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </button>
                </li>
              ))}
              {(detail.members ?? []).length === 0 && (
                <li className="py-2 text-sm text-camp-bark">Aucun membre.</li>
              )}
            </ul>
          </div>
        ) : null}
      </ConfirmModal>

      {/* Édition d'une partie */}
      <ConfirmModal
        open={!!edit}
        title={edit ? `Modifier « ${edit.name} »` : 'Modifier'}
        confirmLabel="Enregistrer"
        loading={savingEdit}
        onCancel={() => setEdit(null)}
        onConfirm={() => void saveEdit()}
      >
        <div className="space-y-3">
          <div>
            <label className="field-label">Nom de la partie</label>
            <input
              className="field"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nom"
            />
          </div>
          <div>
            <label className="field-label">Nombre de semaines</label>
            <input
              className="field"
              type="number"
              min={1}
              max={52}
              value={editWeeks}
              onChange={(e) => setEditWeeks(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="field-label">Jour de rappel (0–6 jours avant)</label>
            <input
              className="field"
              type="number"
              min={0}
              max={6}
              value={editReminder}
              onChange={(e) => setEditReminder(Number(e.target.value))}
            />
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
