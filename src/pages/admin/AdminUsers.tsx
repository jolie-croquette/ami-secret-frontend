import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { adminApi, type ListUsersParams } from '@/api/admin';
import type { AdminUserRow } from '@/api/types';
import { CampLoader } from '@/components/CampLoader';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'react-toastify';
import {
  Search,
  Ban,
  RotateCcw,
  KeyRound,
  Trash2,
  ShieldPlus,
  ShieldMinus,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  CircleCheck,
} from 'lucide-react';

type StatusFilter = NonNullable<ListUsersParams['status']>;
type ConfirmKind = 'ban' | 'delete' | 'demote';

const LIMIT = 20;

function RoleBadge({ user }: { user: AdminUserRow }) {
  if (user.isBanned)
    return <span className="badge-merit bg-camp-berry/15 text-camp-berry">Banni</span>;
  if (user.role === 'admin')
    return (
      <span className="badge-merit bg-camp-pine text-camp-cream">
        <Crown className="h-3 w-3" /> Admin
      </span>
    );
  return <span className="badge-merit bg-camp-sand text-camp-pine-dark">Membre</span>;
}

export default function AdminUsers() {
  const auth = useContext(AuthContext);
  const meId = auth?.user?._id;

  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; user: AdminUserRow } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [resetInfo, setResetInfo] = useState<{ link: string; emailSent: boolean } | null>(null);

  const load = useCallback(
    async (opts?: { page?: number; search?: string; status?: StatusFilter }) => {
      setLoading(true);
      try {
        const res = await adminApi.listUsers({
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

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void load({ page: 1 });
  };

  const onStatusChange = (next: StatusFilter) => {
    setStatus(next);
    void load({ page: 1, status: next });
  };

  // ── Actions directes (réversibles) ──────────────────────────────
  const promote = async (u: AdminUserRow) => {
    setBusyId(u._id);
    try {
      await adminApi.setRole(u._id, 'admin');
      toast.success(`${u.name} est maintenant administrateur.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const unban = async (u: AdminUserRow) => {
    setBusyId(u._id);
    try {
      await adminApi.unbanUser(u._id);
      toast.success(`Bannissement levé pour ${u.name}.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const resetPwd = async (u: AdminUserRow) => {
    setBusyId(u._id);
    try {
      const res = await adminApi.resetPassword(u._id);
      setResetInfo(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  };

  // ── Actions confirmées ──────────────────────────────────────────
  const runConfirm = async () => {
    if (!confirm) return;
    const { kind, user } = confirm;
    setBusyId(user._id);
    try {
      if (kind === 'ban') {
        await adminApi.banUser(user._id, banReason.trim() || undefined);
        toast.success(`${user.name} a été banni.`);
      } else if (kind === 'demote') {
        await adminApi.setRole(user._id, 'user');
        toast.success(`${user.name} n'est plus administrateur.`);
      } else {
        await adminApi.deleteUser(user._id);
        toast.success(`${user.name} a été supprimé.`);
      }
      setConfirm(null);
      setBanReason('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = async () => {
    if (!resetInfo) return;
    try {
      await navigator.clipboard.writeText(resetInfo.link);
      toast.success('Lien copié.');
    } catch {
      toast.info('Copie impossible — sélectionnez le lien manuellement.');
    }
  };

  return (
    <div>
      {/* Filtres */}
      <form onSubmit={onSearch} className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
          <input
            className="field pl-11"
            placeholder="Rechercher par nom ou courriel…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="field sm:w-48"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        >
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="banned">Bannis</option>
          <option value="admin">Administrateurs</option>
        </select>
        <button type="submit" className="btn-primary">
          Rechercher
        </button>
      </form>

      {loading ? (
        <CampLoader />
      ) : rows.length === 0 ? (
        <p className="card-sign p-8 text-center text-camp-bark">Aucun utilisateur trouvé.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((u) => {
            const isSelf = u._id === meId;
            const isAdmin = u.role === 'admin';
            const busy = busyId === u._id;
            return (
              <li key={u._id} className="card-sign flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-bold text-camp-pine-dark">
                      {u.name}
                    </span>
                    <RoleBadge user={u} />
                    {!u.onBoarded && (
                      <span className="badge-merit bg-camp-sand/70 text-camp-bark">Profil incomplet</span>
                    )}
                  </div>
                  <p className="truncate text-sm text-camp-bark">{u.email}</p>
                  {u.isBanned && u.banReason && (
                    <p className="mt-0.5 text-xs text-camp-berry">Motif : {u.banReason}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Rôle */}
                  {!isAdmin && (
                    <button
                      className="icon-btn"
                      title="Promouvoir administrateur"
                      disabled={busy}
                      onClick={() => void promote(u)}
                    >
                      <ShieldPlus className="h-4 w-4" />
                    </button>
                  )}
                  {isAdmin && !isSelf && (
                    <button
                      className="icon-btn"
                      title="Retirer le rôle admin"
                      disabled={busy}
                      onClick={() => setConfirm({ kind: 'demote', user: u })}
                    >
                      <ShieldMinus className="h-4 w-4" />
                    </button>
                  )}

                  {/* Reset mot de passe */}
                  <button
                    className="icon-btn"
                    title="Réinitialiser le mot de passe"
                    disabled={busy}
                    onClick={() => void resetPwd(u)}
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>

                  {/* Ban / unban */}
                  {u.isBanned ? (
                    <button
                      className="icon-btn"
                      title="Lever le bannissement"
                      disabled={busy}
                      onClick={() => void unban(u)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      className="icon-btn icon-btn-danger"
                      title={isSelf || isAdmin ? 'Action non autorisée' : 'Bannir'}
                      disabled={busy || isSelf || isAdmin}
                      onClick={() => {
                        setBanReason('');
                        setConfirm({ kind: 'ban', user: u });
                      }}
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  )}

                  {/* Suppression */}
                  <button
                    className="icon-btn icon-btn-danger"
                    title={isSelf || isAdmin ? 'Action non autorisée' : 'Supprimer'}
                    disabled={busy || isSelf || isAdmin}
                    onClick={() => setConfirm({ kind: 'delete', user: u })}
                  >
                    <Trash2 className="h-4 w-4" />
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
          <button
            className="icon-btn"
            disabled={page <= 1 || loading}
            onClick={() => void load({ page: page - 1 })}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-camp-bark">
            Page {page} / {pages} · {total} comptes
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

      {/* Confirmation des actions sensibles */}
      <ConfirmModal
        open={!!confirm}
        tone={confirm?.kind === 'demote' ? 'default' : 'danger'}
        title={
          confirm?.kind === 'ban'
            ? `Bannir ${confirm.user.name} ?`
            : confirm?.kind === 'delete'
              ? `Supprimer ${confirm.user.name} ?`
              : `Retirer le rôle admin ?`
        }
        message={
          confirm?.kind === 'ban'
            ? 'La personne ne pourra plus se connecter tant que le bannissement est actif.'
            : confirm?.kind === 'delete'
              ? 'Suppression définitive du compte et retrait de toutes les parties. Action irréversible.'
              : 'Cette personne perdra l’accès à l’espace administrateur.'
        }
        confirmLabel={
          confirm?.kind === 'ban' ? 'Bannir' : confirm?.kind === 'delete' ? 'Supprimer' : 'Retirer'
        }
        loading={!!busyId}
        onCancel={() => {
          setConfirm(null);
          setBanReason('');
        }}
        onConfirm={() => void runConfirm()}
      >
        {confirm?.kind === 'ban' && (
          <div className="mb-2">
            <label className="field-label">Motif (optionnel)</label>
            <input
              className="field"
              placeholder="Ex : comportement inapproprié"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              maxLength={280}
            />
          </div>
        )}
      </ConfirmModal>

      {/* Résultat de la réinitialisation */}
      <ConfirmModal
        open={!!resetInfo}
        title="Lien de réinitialisation"
        confirmLabel="Terminé"
        cancelLabel="Fermer"
        onCancel={() => setResetInfo(null)}
        onConfirm={() => setResetInfo(null)}
        message={
          resetInfo?.emailSent ? (
            <span className="inline-flex items-center gap-2 text-camp-pine">
              <CircleCheck className="h-4 w-4" /> Un courriel a été envoyé à l’utilisateur.
            </span>
          ) : (
            'Le courriel n’a pas pu être envoyé (SMTP non configuré). Transmettez ce lien à l’utilisateur — il expire dans 1 heure.'
          )
        }
      >
        {resetInfo && (
          <div className="flex items-center gap-2">
            <input className="field text-xs" readOnly value={resetInfo.link} />
            <button type="button" className="icon-btn" title="Copier" onClick={() => void copyLink()}>
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
