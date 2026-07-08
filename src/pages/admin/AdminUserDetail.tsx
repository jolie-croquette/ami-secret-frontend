import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import {
  adminApi,
  type AdminUserDetail as Detail,
} from '@/api/admin';
import { giftPhotoApi } from '@/api/giftPhoto';
import { TYPE_LABELS, STATUS_LABELS } from '@/api/privacyRequest';
import type { WishlistItem } from '@/api/types';
import { CampLoader } from '@/components/CampLoader';
import ConfirmModal from '@/components/ConfirmModal';
import WishlistEditor from '@/components/WishlistEditor';
import { MeritBadge } from '@/components/visuals/CampVisuals';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Ban,
  Bell,
  Camera,
  CircleCheck,
  Copy,
  Crown,
  Download,
  Gamepad2,
  Gift,
  Heart,
  HeartCrack,
  KeyRound,
  Loader2,
  Mail,
  MessageSquare,
  Palette,
  PawPrint,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldMinus,
  ShieldPlus,
  Smartphone,
  Tent,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

const fmtDate = (iso?: string): string =>
  iso
    ? new Date(iso).toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

const GAME_STATUS_LABELS: Record<string, string> = {
  lobby: 'En lobby',
  drawn: 'Tirage fait',
  revealed: 'Révélée',
};

const NOTIF_TYPE_LABELS: Record<string, string> = {
  message: 'Message',
  draw: 'Tirage',
  reveal: 'Révélation',
  removed: 'Retrait',
  'gift-photo': 'Photo',
};

const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).map((w) => w[0]?.toUpperCase()).slice(0, 2).join('') || 'AS';

/** Saisie de tags (j'aime, allergies…) — version compacte pour l'admin. */
function TagsInput({
  label,
  icon: Icon,
  values,
  onChange,
}: {
  label: string;
  icon: typeof Heart;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const v = raw.trim().replace(/\s+/g, ' ');
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) return setDraft('');
    onChange([...values, v]);
    setDraft('');
  };

  return (
    <div>
      <label className="field-label flex items-center gap-2">
        <Icon className="h-4 w-4 text-camp-pine" /> {label}
      </label>
      <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-camp-bark/25 bg-white/70 p-2 focus-within:ring-4 focus-within:ring-camp-sun/40">
        {values.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-camp-sand px-3 py-1 text-sm font-semibold text-camp-pine-dark">
            {t}
            <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="text-camp-berry">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => add(draft)}
          placeholder="Ajouter…"
          className="min-w-[120px] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
        />
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Bell; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-camp-bark/15 bg-white/60 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-camp-pine/10 text-camp-pine">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-lg font-black leading-tight text-camp-pine-dark">{value}</p>
        <p className="truncate text-xs text-camp-bark">{label}</p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, badge }: {
  icon: typeof Bell;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-sign p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-camp-pine-dark">
        <Icon className="h-5 w-5 text-camp-pine" /> {title}
        {badge !== undefined && (
          <span className="badge-merit bg-camp-sand text-camp-pine-dark">{badge}</span>
        )}
      </h2>
      {children}
    </div>
  );
}

type ConfirmKind = 'ban' | 'delete' | 'demote' | 'delete-photo';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const meId = auth?.user?._id;

  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Identité & compte
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [campName, setCampName] = useState('');
  const [email, setEmail] = useState('');
  const [savingIdentity, setSavingIdentity] = useState(false);

  // Préférences
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [color, setColor] = useState('');
  const [animal, setAnimal] = useState('');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; photoId?: string } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [resetInfo, setResetInfo] = useState<{ link: string; emailSent: boolean } | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await adminApi.getUser(id);
      setDetail(data);
      const u = data.user;
      const parts = (u.name ?? '').trim().split(/\s+/);
      setFirstName(u.firstName ?? parts[0] ?? '');
      setLastName(u.lastName ?? parts.slice(1).join(' '));
      setCampName(u.campName ?? '');
      setEmail(u.email);
      setLikes(u.likes ?? []);
      setDislikes(u.dislikes ?? []);
      setAllergies(u.allergies ?? []);
      setColor(u.favoriteColor ?? '');
      setAnimal(u.favoriteAnimal ?? '');
      setWishlist(u.wishlist ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <CampLoader />;
  if (!detail || !id) {
    return (
      <div className="card-sign p-8 text-center text-camp-bark">
        Utilisateur introuvable.{' '}
        <Link to="/admin/users" className="font-semibold text-camp-pine hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const u = detail.user;
  const isSelf = u._id === meId;
  const isAdmin = u.role === 'admin';

  const saveIdentity = async () => {
    if (!firstName.trim()) return toast.warning('Le prénom est requis.');
    if (!lastName.trim()) return toast.warning('Le nom est requis.');
    if (!email.trim()) return toast.warning('Le courriel est requis.');
    setSavingIdentity(true);
    try {
      await adminApi.updateUser(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        campName: campName.trim(),
        email: email.trim() !== u.email ? email.trim() : undefined,
      });
      toast.success('Identité mise à jour.');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mise à jour impossible.');
    } finally {
      setSavingIdentity(false);
    }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      await adminApi.updateUser(id, {
        likes,
        dislikes,
        allergies,
        favoriteColor: color.trim(),
        favoriteAnimal: animal.trim(),
        wishlist: wishlist
          .map((w) => ({ title: w.title.trim(), url: w.url?.trim() || undefined, price: w.price?.trim() || undefined }))
          .filter((w) => w.title),
      });
      toast.success('Préférences mises à jour.');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mise à jour impossible.');
    } finally {
      setSavingPrefs(false);
    }
  };

  // ── Actions sur le compte ────────────────────────────────────────
  const promote = async () => {
    setBusy(true);
    try {
      await adminApi.setRole(id, 'admin');
      toast.success(`${u.name} est maintenant administrateur.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusy(false);
    }
  };

  const unban = async () => {
    setBusy(true);
    try {
      await adminApi.unbanUser(id);
      toast.success('Bannissement levé.');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusy(false);
    }
  };

  const resetPwd = async () => {
    setBusy(true);
    try {
      setResetInfo(await adminApi.resetPassword(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusy(false);
    }
  };

  const exportData = async () => {
    setBusy(true);
    try {
      const data = await adminApi.exportUser(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ami-secret-export-${u.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export impossible.');
    } finally {
      setBusy(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.kind === 'ban') {
        await adminApi.banUser(id, banReason.trim() || undefined);
        toast.success(`${u.name} a été banni.`);
        await load();
      } else if (confirm.kind === 'demote') {
        await adminApi.setRole(id, 'user');
        toast.success(`${u.name} n'est plus administrateur.`);
        await load();
      } else if (confirm.kind === 'delete-photo' && confirm.photoId) {
        await giftPhotoApi.adminDelete(confirm.photoId);
        toast.success('Photo supprimée.');
        await load();
      } else if (confirm.kind === 'delete') {
        await adminApi.deleteUser(id);
        toast.success(`${u.name} a été supprimé.`);
        navigate('/admin/users', { replace: true });
        return;
      }
      setConfirm(null);
      setBanReason('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusy(false);
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
    <div className="space-y-5">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-bold text-camp-pine hover:underline">
        <ArrowLeft className="h-4 w-4" /> Tous les utilisateurs
      </Link>

      {/* En-tête */}
      <div className="card-sign p-6">
        <div className="flex flex-wrap items-center gap-4">
          <MeritBadge label={initials(u.name)} className="h-16 w-16 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-black text-camp-pine-dark">{u.name}</h1>
              {u.campName && (
                <span className="badge-merit bg-camp-sun/30 text-camp-pine-dark">
                  <Tent className="h-3 w-3" /> {u.campName}
                </span>
              )}
              {u.isBanned && <span className="badge-merit bg-camp-berry/15 text-camp-berry">Banni</span>}
              {isAdmin && (
                <span className="badge-merit bg-camp-pine text-camp-cream">
                  <Crown className="h-3 w-3" /> Admin
                </span>
              )}
              {!u.onBoarded && (
                <span className="badge-merit bg-camp-sand/70 text-camp-bark">Profil incomplet</span>
              )}
            </div>
            <p className="flex items-center gap-1.5 truncate text-sm text-camp-bark">
              <Mail className="h-4 w-4" /> {u.email}
            </p>
            <p className="mt-0.5 text-xs text-camp-bark/70">
              Compte créé : {fmtDate(u.createdAt)} · Dernière connexion : {fmtDate(u.lastLogin)}
            </p>
            {u.isBanned && u.banReason && (
              <p className="mt-0.5 text-xs text-camp-berry">Motif du bannissement : {u.banReason}</p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile icon={Gamepad2} label="Parties" value={detail.counts.games} />
          <StatTile icon={Bell} label="Notifications" value={detail.counts.notifications} />
          <StatTile icon={Camera} label="Photos" value={detail.counts.photos} />
          <StatTile icon={MessageSquare} label="Messages envoyés" value={detail.counts.messagesSent} />
          <StatTile icon={MessageSquare} label="Messages reçus" value={detail.counts.messagesReceived} />
          <StatTile icon={Smartphone} label="Appareils push" value={detail.counts.pushSubscriptions} />
        </div>
      </div>

      {/* Identité & compte */}
      <Section icon={UserRound} title="Identité et compte">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Prénom</label>
            <input className="field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Nom</label>
            <input className="field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Nom de camp (affiché dans les parties)</label>
            <input className="field" value={campName} onChange={(e) => setCampName(e.target.value)} placeholder="Aucun" />
          </div>
          <div>
            <label className="field-label">Courriel</label>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <button className="btn-primary mt-4" disabled={savingIdentity} onClick={() => void saveIdentity()}>
          {savingIdentity ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer l’identité'}
        </button>
      </Section>

      {/* Préférences cadeaux */}
      <Section icon={Gift} title="Préférences cadeaux">
        <div className="space-y-4">
          <TagsInput label="J'aime" icon={Heart} values={likes} onChange={setLikes} />
          <TagsInput label="Je n'aime pas" icon={HeartCrack} values={dislikes} onChange={setDislikes} />
          <TagsInput label="Allergies" icon={ShieldAlert} values={allergies} onChange={setAllergies} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label flex items-center gap-2">
                <Palette className="h-4 w-4 text-camp-pine" /> Couleur préférée
              </label>
              <input className="field" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div>
              <label className="field-label flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-camp-pine" /> Animal préféré
              </label>
              <input className="field" value={animal} onChange={(e) => setAnimal(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="field-label">Liste de souhaits</label>
            <WishlistEditor items={wishlist} onChange={setWishlist} />
          </div>
          <button className="btn-primary" disabled={savingPrefs} onClick={() => void savePrefs()}>
            {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer les préférences'}
          </button>
        </div>
      </Section>

      {/* Parties */}
      <Section icon={Gamepad2} title="Parties" badge={String(detail.games.length)}>
        {detail.games.length === 0 ? (
          <p className="text-sm text-camp-bark">Aucune partie.</p>
        ) : (
          <ul className="space-y-2">
            {detail.games.map((g) => (
              <li key={g._id} className="flex flex-wrap items-center gap-2 rounded-xl border border-camp-bark/15 bg-white/60 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-camp-pine-dark">{g.name}</span>
                    <span className="rounded bg-camp-sand px-1.5 py-0.5 font-mono text-xs font-bold text-camp-pine-dark">{g.code}</span>
                    <span className="badge-merit bg-camp-sand text-camp-pine-dark">{GAME_STATUS_LABELS[g.status] ?? g.status}</span>
                    {g.isGameAdmin && (
                      <span className="badge-merit bg-camp-pine/15 text-camp-pine-dark">Organisateur</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-camp-bark/70">
                    {g.memberCount} joueur{g.memberCount > 1 ? 's' : ''} · {(g.weeksReceived ?? []).length}/{g.numberOfWeeks} cadeaux reçus
                    {g.joinedAt ? ` · a rejoint le ${fmtDate(g.joinedAt)}` : ''}
                  </p>
                </div>
                <Link to={`/lobby/${g.code}/admin`} className="btn-ghost !px-3 !py-1.5 text-xs">
                  Voir la partie
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications reçues" badge={String(detail.notifications.total)}>
        {detail.notifications.items.length === 0 ? (
          <p className="text-sm text-camp-bark">Aucune notification.</p>
        ) : (
          <>
            <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {detail.notifications.items.map((n) => (
                <li key={n._id} className="flex items-start gap-2 rounded-xl border border-camp-bark/15 bg-white/60 p-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? 'bg-camp-bark/25' : 'bg-camp-ember'}`} title={n.readAt ? 'Lue' : 'Non lue'} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-camp-ink">{n.title}</p>
                    <p className="text-xs text-camp-bark/70">
                      {NOTIF_TYPE_LABELS[n.type] ?? n.type}
                      {n.gameCode ? ` · ${n.gameCode}` : ''} · {fmtDate(n.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {detail.notifications.total > detail.notifications.items.length && (
              <p className="mt-2 text-xs text-camp-bark/70">
                Les {detail.notifications.items.length} plus récentes sont affichées (sur {detail.notifications.total}).
              </p>
            )}
          </>
        )}
      </Section>

      {/* Photos */}
      <Section icon={Camera} title="Photos partagées" badge={String(detail.photos.length)}>
        {detail.photos.length === 0 ? (
          <p className="text-sm text-camp-bark">Aucune photo.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {detail.photos.map((p) => (
              <figure key={p._id} className="overflow-hidden rounded-xl border border-camp-bark/15 bg-white/60">
                <a href={p.imageUrl} target="_blank" rel="noreferrer">
                  <img src={p.imageUrl} alt={p.caption || 'Photo de cadeau'} className="aspect-square w-full object-cover" loading="lazy" />
                </a>
                <figcaption className="flex items-start justify-between gap-1 p-2">
                  <div className="min-w-0 text-xs text-camp-bark">
                    <p className="truncate font-semibold text-camp-pine-dark">
                      {p.game ? `${p.game.name} · sem. ${p.week}` : `Semaine ${p.week}`}
                    </p>
                    {p.caption && <p className="truncate">{p.caption}</p>}
                    <p className="text-camp-bark/60">{fmtDate(p.createdAt)}</p>
                  </div>
                  <button
                    className="icon-btn icon-btn-danger shrink-0"
                    title="Supprimer la photo"
                    disabled={busy}
                    onClick={() => setConfirm({ kind: 'delete-photo', photoId: p._id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Section>

      {/* Demandes vie privée */}
      <Section icon={ShieldCheck} title="Demandes vie privée (Loi 25)" badge={String(detail.privacyRequests.length)}>
        {detail.privacyRequests.length === 0 ? (
          <p className="text-sm text-camp-bark">Aucune demande.</p>
        ) : (
          <ul className="space-y-2">
            {detail.privacyRequests.map((r) => (
              <li key={r._id} className="rounded-xl border border-camp-bark/15 bg-white/60 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-camp-pine-dark">
                    {TYPE_LABELS[r.type as keyof typeof TYPE_LABELS] ?? r.type}
                  </span>
                  <span className="badge-merit bg-camp-sand text-camp-pine-dark">
                    {STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] ?? r.status}
                  </span>
                </div>
                {r.message && <p className="mt-1 text-camp-bark/80">{r.message}</p>}
                {r.adminNote && (
                  <p className="mt-1 rounded bg-camp-sand/50 px-2 py-1 text-xs text-camp-ink">
                    <strong>Note :</strong> {r.adminNote}
                  </p>
                )}
                <p className="mt-1 text-xs text-camp-bark/50">{fmtDate(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Actions */}
      <Section icon={ShieldCheck} title="Actions sur le compte">
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" disabled={busy} onClick={() => void resetPwd()}>
            <KeyRound className="h-4 w-4" /> Réinitialiser le mot de passe
          </button>
          <button className="btn-ghost" disabled={busy} onClick={() => void exportData()}>
            <Download className="h-4 w-4" /> Exporter les données (JSON)
          </button>
          {!isAdmin ? (
            <button className="btn-ghost" disabled={busy} onClick={() => void promote()}>
              <ShieldPlus className="h-4 w-4" /> Promouvoir administrateur
            </button>
          ) : (
            !isSelf && (
              <button className="btn-ghost" disabled={busy} onClick={() => setConfirm({ kind: 'demote' })}>
                <ShieldMinus className="h-4 w-4" /> Retirer le rôle admin
              </button>
            )
          )}
          {u.isBanned ? (
            <button className="btn-ghost" disabled={busy} onClick={() => void unban()}>
              <RotateCcw className="h-4 w-4" /> Lever le bannissement
            </button>
          ) : (
            <button
              className="btn-ghost !border-camp-berry/40 !text-camp-berry"
              disabled={busy || isSelf || isAdmin}
              title={isSelf || isAdmin ? 'Action non autorisée' : undefined}
              onClick={() => {
                setBanReason('');
                setConfirm({ kind: 'ban' });
              }}
            >
              <Ban className="h-4 w-4" /> Bannir
            </button>
          )}
          <button
            className="btn-ghost !border-camp-berry/40 !text-camp-berry"
            disabled={busy || isSelf || isAdmin}
            title={isSelf || isAdmin ? 'Action non autorisée' : undefined}
            onClick={() => setConfirm({ kind: 'delete' })}
          >
            <Trash2 className="h-4 w-4" /> Supprimer le compte
          </button>
        </div>
      </Section>

      {/* Confirmations */}
      <ConfirmModal
        open={!!confirm}
        tone={confirm?.kind === 'demote' ? 'default' : 'danger'}
        title={
          confirm?.kind === 'ban'
            ? `Bannir ${u.name} ?`
            : confirm?.kind === 'delete'
              ? `Supprimer ${u.name} ?`
              : confirm?.kind === 'delete-photo'
                ? 'Supprimer cette photo ?'
                : 'Retirer le rôle admin ?'
        }
        message={
          confirm?.kind === 'ban'
            ? 'La personne ne pourra plus se connecter tant que le bannissement est actif.'
            : confirm?.kind === 'delete'
              ? 'Suppression définitive du compte et retrait de toutes les parties. Action irréversible.'
              : confirm?.kind === 'delete-photo'
                ? 'La photo sera retirée du fil de la partie. Action irréversible.'
                : 'Cette personne perdra l’accès à l’espace administrateur.'
        }
        confirmLabel={
          confirm?.kind === 'ban'
            ? 'Bannir'
            : confirm?.kind === 'demote'
              ? 'Retirer'
              : 'Supprimer'
        }
        loading={busy}
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
