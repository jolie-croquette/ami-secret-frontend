import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, type ListGamesParams } from '@/api/admin';
import type { AdminGameRow, GameStatus } from '@/api/types';
import { CampLoader } from '@/components/CampLoader';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'react-toastify';
import { giftPhotoApi, type GiftPhoto } from '@/api/giftPhoto';
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
  Images,
  X,
  Loader2,
  RotateCcw,
} from 'lucide-react';

type StatusFilter = NonNullable<ListGamesParams['status']>;
type ConfirmKind = 'draw' | 'reveal' | 'delete' | 'hard-delete';

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
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminGameRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; game: AdminGameRow } | null>(null);

  const [photosGame, setPhotosGame] = useState<AdminGameRow | null>(null);
  const [photos, setPhotos] = useState<GiftPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);

  const openPhotos = async (g: AdminGameRow) => {
    setPhotosGame(g);
    setLoadingPhotos(true);
    try {
      const data = await giftPhotoApi.list(g.code);
      setPhotos(data);
    } catch {
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleAdminDeletePhoto = async (photo: GiftPhoto) => {
    if (!confirm) { /* no-op guard */ }
    setDeletingPhoto(photo._id);
    try {
      await giftPhotoApi.adminDelete(photo._id);
      setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
      toast.success('Photo supprimée.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setDeletingPhoto(null);
    }
  };

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

  const restore = async (g: AdminGameRow) => {
    setBusyId(g._id);
    try {
      await adminApi.restoreGame(g._id);
      toast.success('Partie restaurée.');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Restauration impossible.');
    } finally {
      setBusyId(null);
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
      } else if (kind === 'hard-delete') {
        await adminApi.hardDeleteGame(game._id);
        toast.success('Partie supprimée définitivement.');
      } else {
        await adminApi.deleteGame(game._id);
        toast.success('Partie déplacée dans la corbeille.');
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
          <option value="deleted">Corbeille</option>
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
                    {g.deletedAt && (
                      <span className="badge-merit bg-camp-berry/15 text-camp-berry">Supprimée</span>
                    )}
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
                  {g.deletedAt ? (
                    <>
                      <button
                        className="icon-btn"
                        title="Restaurer la partie"
                        disabled={busy}
                        onClick={() => void restore(g)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        title="Supprimer définitivement (irréversible)"
                        disabled={busy}
                        onClick={() => setConfirm({ kind: 'hard-delete', game: g })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                  <>
                  <button
                    className="icon-btn"
                    title="Ouvrir la partie (vue organisateur)"
                    disabled={busy}
                    onClick={() => navigate(`/lobby/${g.code}/admin`)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="icon-btn"
                    title="Gérer les photos"
                    disabled={busy}
                    onClick={() => void openPhotos(g)}
                  >
                    <Images className="h-4 w-4" />
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
                    title="Supprimer la partie (corbeille, restaurable)"
                    disabled={busy}
                    onClick={() => setConfirm({ kind: 'delete', game: g })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  </>
                  )}
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
        tone={confirm?.kind === 'delete' || confirm?.kind === 'hard-delete' ? 'danger' : 'default'}
        title={
          confirm?.kind === 'draw'
            ? 'Forcer le tirage ?'
            : confirm?.kind === 'reveal'
              ? 'Forcer la révélation ?'
              : confirm?.kind === 'hard-delete'
                ? `Supprimer définitivement « ${confirm?.game.name} » ?`
                : `Supprimer « ${confirm?.game.name} » ?`
        }
        message={
          confirm?.kind === 'draw'
            ? 'Chaque participant se verra attribuer un ami secret. La partie passera au statut « Tirée ».'
            : confirm?.kind === 'reveal'
              ? 'Tous les amis secrets seront dévoilés aux participants.'
              : confirm?.kind === 'hard-delete'
                ? 'Suppression définitive de la partie, de ses messages et de ses photos. Action irréversible.'
                : 'La partie sera déplacée dans la corbeille et disparaîtra pour tous les participants. Elle restera restaurable depuis le filtre « Corbeille ».'
        }
        confirmLabel={
          confirm?.kind === 'draw'
            ? 'Tirer'
            : confirm?.kind === 'reveal'
              ? 'Révéler'
              : confirm?.kind === 'hard-delete'
                ? 'Supprimer définitivement'
                : 'Supprimer'
        }
        loading={!!busyId}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void runConfirm()}
      />

      {/* Modal photos */}
      {photosGame && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-camp-ink/40 backdrop-blur-sm" onClick={() => setPhotosGame(null)} />
          <div className="card-sign relative z-10 flex w-full max-w-2xl flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-black text-camp-pine-dark">
                Photos : {photosGame.name}
              </h2>
              <button type="button" onClick={() => setPhotosGame(null)} className="text-camp-bark/50 hover:text-camp-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            {loadingPhotos ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-camp-bark/40" /></div>
            ) : photos.length === 0 ? (
              <p className="text-sm text-camp-bark/70">Aucune photo pour cette partie.</p>
            ) : (
              <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                {photos.map((photo) => {
                  const name = typeof photo.user === 'string' ? '' : photo.user.name;
                  return (
                    <figure key={photo._id} className="overflow-hidden rounded-xl border border-camp-bark/15 bg-white/50">
                      <div className="relative">
                        <img
                          src={photo.imageUrl}
                          alt={`Photo semaine ${photo.week}`}
                          className="aspect-square w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => void handleAdminDeletePhoto(photo)}
                          disabled={deletingPhoto === photo._id}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-camp-ember shadow hover:bg-white"
                          aria-label="Supprimer"
                        >
                          {deletingPhoto === photo._id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <figcaption className="p-2">
                        <p className="text-xs font-bold text-camp-pine-dark">{name}</p>
                        <p className="text-xs text-camp-bark/70">Semaine {photo.week}</p>
                        {photo.caption && <p className="mt-0.5 text-xs text-camp-ink">{photo.caption}</p>}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
