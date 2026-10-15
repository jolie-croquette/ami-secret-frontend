import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useNavigate, useLocalizePath } from '@/i18n/navigation';
import { formatDate } from '@/i18n/format';
import { AuthContext } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import {
  Copy,
  Share2,
  Loader2,
  Sparkles,
  Eye,
  Gift,
  Send,
  Check,
  Crown,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Inbox,
  Save,
  UserMinus,
  ShieldPlus,
  ShieldMinus,
  Settings,
  ArrowRight,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { gamesApi } from '@/api/games';
import { messagesApi, type MessageRecipient } from '@/api/messages';
import { giftPhotoApi, type GiftPhoto } from '@/api/giftPhoto';
import { ApiError } from '@/api/client';
import type {
  GameDetails,
  GameStatus,
  TargetPreferences,
  InboxThreads,
  GameProgress,
} from '@/api/types';
import { MeritBadge, Tent, Campfire, CampScene } from '@/components/visuals/CampVisuals';
import ProgressViz from '@/components/lobby/ProgressViz';
import GiftPhotoPrompt from '@/components/lobby/GiftPhotoPrompt';
import GiftPhotoFeed from '@/components/lobby/GiftPhotoFeed';
import 'react-toastify/dist/ReactToastify.css';

const STATUS_CLASSES: Record<GameStatus, string> = {
  lobby: 'bg-camp-sun/30 text-camp-bark',
  drawn: 'bg-camp-ember/20 text-camp-ember-dark',
  revealed: 'bg-camp-pine/15 text-camp-pine-dark',
};

const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).map((w) => w[0]?.toUpperCase()).slice(0, 2).join('') || 'AS';

function Chips({ items, tone }: { items?: string[]; tone: string }) {
  if (!items?.length) return <p className="text-sm text-camp-bark/60">—</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((v, i) => (
        <span key={i} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{v}</span>
      ))}
    </div>
  );
}

/**
 * Coupe-circuit de la messagerie anonyme : passer à true pour afficher l'avis
 * « temporairement indisponible » à la place des fils (le backend a son propre
 * flag CHAT_ENABLED qui répond 503 côté API).
 */
const CHAT_TEMPORARILY_DISABLED = false;

export default function GameLobby({ admin }: { admin: boolean }) {
  const { t } = useTranslation('lobby');
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const localizePath = useLocalizePath();
  const auth = useContext(AuthContext);
  const me = auth?.user;

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [target, setTarget] = useState<TargetPreferences | null>(null);
  const [weeksReceived, setWeeksReceived] = useState<number[]>([]);
  const [busyWeek, setBusyWeek] = useState<number | null>(null);

  const emptyThreads: InboxThreads = { target: [], gifter: [] };
  const [threads, setThreads] = useState<InboxThreads>(emptyThreads);
  const [chatTab, setChatTab] = useState<MessageRecipient>('target');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [acting, setActing] = useState(false);

  const [photos, setPhotos] = useState<GiftPhoto[]>([]);
  const loadPhotos = () => giftPhotoApi.list(code).then(setPhotos).catch(() => setPhotos([]));

  const RECEIVED_CONFIRM_KEY = 'ami-secret:skip-received-confirm';
  const [receivedConfirmWeek, setReceivedConfirmWeek] = useState<number | null>(null);
  const dontShowRef = useRef(false);
  const [photoPromptWeek, setPhotoPromptWeek] = useState<number | null>(null);

  // Gestion organisateur : édition des détails + gestion des joueurs.
  const [editName, setEditName] = useState('');
  const [editWeeks, setEditWeeks] = useState(7);
  const [editReminder, setEditReminder] = useState(0);
  const [savingDetails, setSavingDetails] = useState(false);
  const [busyPlayer, setBusyPlayer] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const g = await gamesApi.byCode(code);
      setGame(g);
      setWeeksReceived(g.myWeeksReceived ?? []);

      if (!g.isAdmin && !g.isMember) {
        navigate(`/game/join?code=${code}`, { replace: true });
        return;
      }
      if (admin && !g.isAdmin) {
        navigate(`/lobby/${code}`, { replace: true });
        return;
      }

      if (g.status !== 'lobby' && g.isMember) {
        gamesApi.myTarget(code).then(setTarget).catch(() => setTarget(null));
        if (!CHAT_TEMPORARILY_DISABLED) {
          messagesApi.inbox(code).then(setThreads).catch(() => setThreads({ target: [], gifter: [] }));
        }
        loadPhotos();
      }
      if (admin && g.isAdmin && g.status !== 'lobby') {
        gamesApi.progress(code).then(setProgress).catch(() => setProgress(null));
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        auth?.logout?.();
        navigate('/', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : i18n.t('loadError', { ns: 'lobby' }));
    } finally {
      setLoading(false);
    }
  }, [code, admin, navigate, auth]);

  useEffect(() => {
    void load();
  }, [load]);

  // Synchronise le formulaire d'édition avec la partie chargée.
  useEffect(() => {
    if (!game) return;
    setEditName(game.name);
    setEditWeeks(game.numberOfWeeks);
    setEditReminder(game.reminderDayBefore ?? 0);
  }, [game]);

  const saveDetails = async () => {
    if (!game) return;
    const name = editName.trim();
    if (!name) return toast.warning(t('details.nameRequired'));
    setSavingDetails(true);
    try {
      const lobby = game.status === 'lobby';
      await gamesApi.updateGame(game._id, {
        name,
        // semaines & rappel verrouillés après le tirage
        numberOfWeeks: lobby ? editWeeks : undefined,
        reminderDayBefore: lobby ? editReminder : undefined,
      });
      toast.success(t('details.saved'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('details.saveError'));
    } finally {
      setSavingDetails(false);
    }
  };

  const removePlayer = async (userId: string, name: string) => {
    if (!game) return;
    if (!window.confirm(t('players.kickConfirm', { name }))) return;
    setBusyPlayer(userId);
    try {
      await gamesApi.removePlayer(game._id, userId);
      toast.success(t('players.kicked', { name }));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setBusyPlayer(null);
    }
  };

  const toggleOrganizer = async (userId: string, name: string, isOrga: boolean) => {
    if (!game) return;
    setBusyPlayer(userId);
    try {
      if (isOrga) {
        await gamesApi.removeAdmin(game._id, userId);
        toast.success(t('players.noLongerOrganizer', { name }));
      } else {
        await gamesApi.addAdmin(game._id, userId);
        toast.success(t('players.nowOrganizer', { name }));
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setBusyPlayer(null);
    }
  };

  const copy = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      toast.error(t('copyError'));
    }
  };

  // Lien d'invitation dans la langue courante (les invités arrivent sur la même version).
  const joinLink = `${window.location.origin}${localizePath('/game/join')}?code=${code}`;

  const handleDraw = async () => {
    if (!game) return;
    if (game.players.length < 2) return toast.warning(t('waiting.needTwo'));
    if (!window.confirm(t('waiting.drawConfirm'))) return;
    setActing(true);
    try {
      await gamesApi.draw(code);
      toast.success(t('waiting.drawn'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('waiting.drawError'));
    } finally {
      setActing(false);
    }
  };

  const handleReveal = async () => {
    if (!window.confirm(t('organizer.revealConfirm'))) return;
    setActing(true);
    try {
      await gamesApi.reveal(code);
      toast.success(t('organizer.revealed'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('organizer.revealError'));
    } finally {
      setActing(false);
    }
  };

  const doMarkReceived = async (week: number) => {
    setBusyWeek(week);
    try {
      const res = await gamesApi.markWeek(code, week, true);
      setWeeksReceived(res.weeksReceived);
      setPhotoPromptWeek(week);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('weeksReceived.error'));
    } finally {
      setBusyWeek(null);
    }
  };

  const toggleWeek = async (week: number) => {
    const received = !weeksReceived.includes(week);
    if (!received) {
      // Décocher — pas de confirmation nécessaire
      setBusyWeek(week);
      try {
        const res = await gamesApi.markWeek(code, week, false);
        setWeeksReceived(res.weeksReceived);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('weeksReceived.error'));
      } finally {
        setBusyWeek(null);
      }
      return;
    }
    // Cocher — afficher la popup de confirmation, sauf si l'utilisateur a choisi de ne plus la voir
    if (localStorage.getItem(RECEIVED_CONFIRM_KEY) === '1') {
      void doMarkReceived(week);
    } else {
      dontShowRef.current = false;
      setReceivedConfirmWeek(week);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      await messagesApi.send(code, body, chatTab);
      setDraft('');
      const updated = await messagesApi.inbox(code).catch(() => null);
      if (updated) setThreads(updated);
      toast.success(t('chat.sent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('chat.sendError'));
    } finally {
      setSending(false);
    }
  };

  const [deleting, setDeleting] = useState(false);
  const deleteGame = async () => {
    if (!game) return;
    if (!window.confirm(t('details.deleteConfirm', { name: game.name }))) return;
    setDeleting(true);
    try {
      await gamesApi.deleteGame(game._id);
      toast.success(t('details.deleted'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('details.deleteError'));
      setDeleting(false);
    }
  };

  const leave = async () => {
    if (!game) return;
    if (!window.confirm(t('players.leaveConfirm'))) return;
    try {
      await gamesApi.leave(game._id);
      toast.success(t('players.left'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('players.leaveError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-camp-cream bg-topo">
        <div className="grid min-h-[70vh] place-items-center">
          <div className="flex flex-col items-center gap-3">
            <Campfire className="w-20" />
            <span className="font-hand text-2xl text-camp-ember-dark">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="grid min-h-screen place-items-center bg-camp-cream bg-topo p-6 text-center">
        <div className="card-sign max-w-md p-8">
          <h2 className="mb-2 font-display text-2xl font-black text-camp-berry">{t('oops')}</h2>
          <p className="mb-5 text-camp-bark">{error ?? t('notFound')}</p>
          <button onClick={() => void load()} className="btn-primary">{t('retry')}</button>
        </div>
      </div>
    );
  }

  const statusKey: GameStatus = game.status in STATUS_CLASSES ? game.status : 'lobby';
  const drawn = game.status !== 'lobby';

  return (
    <div className="relative min-h-screen bg-camp-cream bg-topo px-4 py-8 pb-40">
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <div className="card-sign mb-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <MeritBadge label={game.name.charAt(0).toUpperCase()} className="h-16 w-16 shrink-0" />
              <div>
                <h1 className="font-display text-3xl font-black text-camp-pine-dark">{game.name}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`badge-merit ${STATUS_CLASSES[statusKey]}`}>{t(`status.${statusKey}`, { ns: 'games' })}</span>
                  <span className="text-sm text-camp-bark">{t('weeks', { count: game.numberOfWeeks })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {game.isAdmin && !admin && (
                <button onClick={() => navigate(`/lobby/${code}/admin`)} className="btn-ghost !py-2 !px-4 text-sm">
                  <ShieldCheck className="h-4 w-4" /> {t('adminView')}
                </button>
              )}
              {admin && (
                <button onClick={() => navigate(`/lobby/${code}`)} className="btn-ghost !py-2 !px-4 text-sm">
                  <ArrowLeft className="h-4 w-4" /> {t('playerView')}
                </button>
              )}
            </div>
          </div>

          {/* Code + partage */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-camp-bark/30 bg-camp-sand/30 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-camp-bark/70">{t('code')}</p>
              <p className="font-display text-2xl font-black tracking-[0.25em] text-camp-pine-dark">{game.code}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={() => copy(game.code, t('codeCopied'))} className="btn-ghost !py-2 !px-4 text-sm">
                <Copy className="h-4 w-4" /> {t('copyCode')}
              </button>
              <button onClick={() => copy(joinLink, t('linkCopied'))} className="btn-ember !py-2 !px-4 text-sm">
                <Share2 className="h-4 w-4" /> {t('shareLink')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="space-y-6 lg:col-span-2">
            {/* Gestion des détails (organisateur) */}
            {admin && game.isAdmin && (
              <div className="card-sign p-6">
                <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                  <Settings className="h-5 w-5 text-camp-pine" /> {t('details.title')}
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="field-label">{t('details.name')}</label>
                    <input
                      className="field"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={t('details.namePlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="field-label">{t('details.weeks')}</label>
                      <input
                        className="field"
                        type="number"
                        min={1}
                        max={52}
                        value={editWeeks}
                        disabled={drawn}
                        onChange={(e) => setEditWeeks(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="field-label">{t('details.reminder')}</label>
                      <input
                        className="field"
                        type="number"
                        min={0}
                        max={6}
                        value={editReminder}
                        disabled={drawn}
                        onChange={(e) => setEditReminder(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  {drawn && (
                    <p className="text-xs text-camp-bark/70">
                      {t('details.locked')}
                    </p>
                  )}
                  <button onClick={() => void saveDetails()} disabled={savingDetails} className="btn-primary">
                    {savingDetails ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {t('details.save')}
                  </button>

                  <div className="mt-2 border-t border-camp-bark/10 pt-4">
                    <button
                      onClick={() => void deleteGame()}
                      disabled={deleting}
                      className="btn-ghost !border-camp-berry/40 !text-camp-berry"
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      {t('details.delete')}
                    </button>
                    <p className="mt-1.5 text-xs text-camp-bark/70">
                      {t('details.deleteHint')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tirage / lobby */}
            {!drawn ? (
              <div className="card-sign flex flex-col items-center gap-3 p-8 text-center">
                <Tent className="w-20" />
                <h2 className="font-display text-xl font-bold text-camp-pine-dark">{t('waiting.title')}</h2>
                <p className="text-sm text-camp-bark">
                  {t('waiting.players', { count: game.players.length })}
                </p>
                {game.isAdmin && (
                  <button onClick={handleDraw} disabled={acting} className="btn-primary mt-2">
                    {acting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    {t('waiting.draw')}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Ma cible */}
                {game.isMember && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Gift className="h-5 w-5 text-camp-ember" /> {t('target.title')}
                    </h2>
                    {target ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-camp-pine text-camp-cream font-extrabold">
                            {initials(target.name)}
                          </span>
                          <p className="font-display text-lg font-bold text-camp-pine-dark">{target.name}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <p className="field-label">{t('target.likes')}</p>
                            <Chips items={target.likes} tone="bg-camp-pine/10 text-camp-pine-dark" />
                          </div>
                          <div>
                            <p className="field-label">{t('target.dislikes')}</p>
                            <Chips items={target.dislikes} tone="bg-camp-berry/10 text-camp-berry" />
                          </div>
                          <div>
                            <p className="field-label">{t('target.color')}</p>
                            <p className="text-sm text-camp-ink">{target.favoriteColor || '—'}</p>
                          </div>
                          <div>
                            <p className="field-label">{t('target.animal')}</p>
                            <p className="text-sm text-camp-ink">{target.favoriteAnimal || '—'}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="field-label">{t('target.allergies')}</p>
                            <Chips items={target.allergies} tone="bg-camp-sun/30 text-camp-bark" />
                          </div>
                          {target.wishlist && target.wishlist.length > 0 && (
                            <div className="sm:col-span-2">
                              <p className="field-label flex items-center gap-1.5">
                                <Gift className="h-4 w-4 text-camp-ember" /> {t('target.wishlist')}
                              </p>
                              <ul className="space-y-1.5">
                                {target.wishlist.map((w, i) => (
                                  <li
                                    key={i}
                                    className="flex flex-wrap items-center gap-x-2 rounded-xl border-2 border-camp-bark/15 bg-white/60 px-3 py-2 text-sm"
                                  >
                                    {w.url ? (
                                      <a
                                        href={w.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-semibold text-camp-pine underline underline-offset-2 hover:text-camp-pine-dark"
                                      >
                                        {w.title}
                                      </a>
                                    ) : (
                                      <span className="font-semibold text-camp-ink">{w.title}</span>
                                    )}
                                    {w.price && (
                                      <span className="rounded-full bg-camp-sand px-2 py-0.5 text-xs font-bold text-camp-bark">
                                        {w.price}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-camp-bark">{t('target.unavailable')}</p>
                    )}
                  </div>
                )}

                {/* Suivi des cadeaux reçus */}
                {game.isMember && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 font-display text-xl font-bold text-camp-pine-dark">{t('weeksReceived.title')}</h2>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: game.numberOfWeeks }, (_, i) => i + 1).map((week) => {
                        const done = weeksReceived.includes(week);
                        return (
                          <button
                            key={week}
                            onClick={() => void toggleWeek(week)}
                            disabled={busyWeek === week}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 font-bold transition ${
                              done
                                ? 'border-camp-pine bg-camp-pine text-camp-cream'
                                : 'border-camp-bark/25 bg-white/60 text-camp-bark hover:border-camp-pine/50'
                            }`}
                            title={t('weeksReceived.week', { week })}
                            aria-label={t('weeksReceived.week', { week })}
                            aria-pressed={done}
                          >
                            {busyWeek === week ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : done ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              week
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-xs text-camp-bark">
                      {t('weeksReceived.hint')}
                    </p>
                  </div>
                )}

                {/* Fil de photos de la partie */}
                {game.isMember && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Gift className="h-5 w-5 text-camp-berry" /> {t('photos.title')}
                    </h2>
                    <GiftPhotoFeed
                      photos={photos}
                      currentUserId={me?._id}
                      canDeleteAll={game.isAdmin || (me?.role === 'admin')}
                      gameCode={code}
                      onChanged={loadPhotos}
                    />
                  </div>
                )}

                {/* Messages anonymes — deux fils : ma personne à gâter et mon bienfaiteur secret */}
                {game.isMember && CHAT_TEMPORARILY_DISABLED && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Inbox className="h-5 w-5 text-camp-lake" /> {t('chat.title')}
                    </h2>
                    <div className="flex items-start gap-3 rounded-2xl border-2 border-camp-sun/40 bg-camp-sun/10 p-4">
                      <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-camp-sun" />
                      <div>
                        <p className="text-sm font-bold text-camp-pine-dark">
                          {t('chat.disabledTitle')}
                        </p>
                        <p className="mt-0.5 text-sm text-camp-bark">
                          {t('chat.disabledBody')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {game.isMember && !CHAT_TEMPORARILY_DISABLED && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Inbox className="h-5 w-5 text-camp-lake" /> {t('chat.title')}
                    </h2>

                    <div className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-camp-sand/80 p-1">
                      {(['target', 'gifter'] as MessageRecipient[]).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setChatTab(tab)}
                          className={`rounded-full py-1.5 text-sm font-extrabold transition ${
                            chatTab === tab
                              ? 'bg-camp-pine text-camp-cream shadow-sign-sm'
                              : 'text-camp-pine'
                          }`}
                        >
                          {t(`chat.tabs.${tab}`)}
                        </button>
                      ))}
                    </div>

                    <p className="mb-4 text-xs text-camp-bark/70">
                      {t(`chat.intro.${chatTab}`)}
                    </p>

                    <div className="mb-4 space-y-3">
                      {threads[chatTab].length === 0 ? (
                        <p className="text-sm text-camp-bark/70">
                          {t(`chat.empty.${chatTab}`)}
                        </p>
                      ) : (
                        threads[chatTab].map((m) => (
                          <div
                            key={m._id}
                            className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}
                          >
                            <span className="mb-1 px-1 text-xs font-bold text-camp-bark/70">
                              {m.mine ? t('chat.me') : t(`chat.other.${chatTab}`)}
                            </span>
                            <div
                              className={`max-w-[85%] rounded-2xl border-2 p-3 ${
                                m.mine
                                  ? 'border-camp-pine bg-camp-pine text-camp-cream'
                                  : 'border-camp-bark/15 bg-white/70 text-camp-ink'
                              }`}
                            >
                              <p className="text-sm">{m.body}</p>
                              <p
                                className={`mt-1 text-xs ${
                                  m.mine ? 'text-camp-cream/70' : 'text-camp-bark/60'
                                }`}
                              >
                                {formatDate(m.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={sendMessage} className="flex gap-2">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        maxLength={500}
                        placeholder={t(`chat.placeholder.${chatTab}`)}
                        aria-label={t(`chat.placeholder.${chatTab}`)}
                        className="field flex-1"
                      />
                      <button type="submit" disabled={sending} className="btn-primary !px-4" aria-label={t('chat.send')}>
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </button>
                    </form>
                  </div>
                )}

                {/* Admin : révélation + progression */}
                {admin && game.isAdmin && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Crown className="h-5 w-5 text-camp-sun" /> {t('organizer.title')}
                    </h2>
                    {game.status === 'drawn' && (
                      <button onClick={handleReveal} disabled={acting} className="btn-ember mb-4">
                        {acting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />}
                        {t('organizer.reveal')}
                      </button>
                    )}
                    {progress && (
                      <div className="space-y-2">
                        <p className="field-label">{t('organizer.progress')}</p>
                        <ProgressViz progress={progress} />
                      </div>
                    )}
                  </div>
                )}

                {/* Résultat du tirage — réservé à l'admin du site (modération) */}
                {game.isSiteAdmin && game.assignments && game.assignments.length > 0 && (
                  <div className="card-sign border-camp-ember/40 p-6">
                    <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Eye className="h-5 w-5 text-camp-ember" /> {t('assignments.title')}
                    </h2>
                    <p className="mb-3 text-xs text-camp-bark">
                      {t('assignments.hint')}
                    </p>
                    <ul className="space-y-1.5">
                      {game.assignments.map((a) => (
                        <li
                          key={a.from._id}
                          className="flex items-center gap-2 rounded-xl bg-camp-sand/30 px-3 py-2 text-sm"
                        >
                          <span className="font-semibold text-camp-pine-dark">{a.from.name}</span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-camp-ember" />
                          <span className="font-semibold text-camp-pine">{a.to.name ?? '—'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Colonne participants */}
          <div className="space-y-6">
            <div className="card-sign p-6">
              <h2 className="mb-4 font-display text-xl font-bold text-camp-pine-dark">
                {t('players.title', { count: game.players.length })}
              </h2>
              <ul className="space-y-2">
                {game.players.map((p) => {
                  const isP_admin = game.adminIds.includes(p._id);
                  const isMe = me?.id === p._id;
                  // Tout organisateur peut gérer/expulser, peu importe la vue (joueur ou admin).
                  const canManage = game.isAdmin && !isMe;
                  const playerBusy = busyPlayer === p._id;
                  return (
                    <li key={p._id} className="flex items-center gap-2 rounded-2xl border-2 border-camp-bark/15 bg-white/50 p-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-camp-moss text-sm font-extrabold text-white">
                        {initials(p.name)}
                      </span>
                      <span className="flex-1 truncate text-sm font-semibold text-camp-ink">{p.name}</span>
                      {isP_admin && (
                        <span className="badge-merit bg-camp-sun/30 text-camp-bark">
                          <Crown className="h-3 w-3" /> {t('players.organizer')}
                        </span>
                      )}
                      {isMe && <span className="badge-merit bg-camp-pine/15 text-camp-pine-dark">{t('players.me')}</span>}

                      {canManage && (
                        <span className="flex items-center gap-1">
                          <button
                            className="icon-btn !h-8 !w-8"
                            title={isP_admin ? t('players.removeOrganizer') : t('players.makeOrganizer')}
                            aria-label={isP_admin ? t('players.removeOrganizer') : t('players.makeOrganizer')}
                            disabled={playerBusy}
                            onClick={() => void toggleOrganizer(p._id, p.name, isP_admin)}
                          >
                            {playerBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isP_admin ? (
                              <ShieldMinus className="h-4 w-4" />
                            ) : (
                              <ShieldPlus className="h-4 w-4" />
                            )}
                          </button>
                          {!isP_admin && (!drawn || game.isSiteAdmin) && (
                            <button
                              className="icon-btn icon-btn-danger !h-8 !w-8"
                              title={t('players.kick')}
                              aria-label={t('players.kick')}
                              disabled={playerBusy}
                              onClick={() => void removePlayer(p._id, p.name)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          )}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {game.isMember && !drawn && (
                <button onClick={leave} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-camp-berry/10 px-4 py-2 text-sm font-bold text-camp-berry hover:bg-camp-berry/20">
                  <LogOut className="h-4 w-4" /> {t('players.leave')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <CampScene className="pointer-events-none absolute bottom-0 left-0 h-28 w-full" />
      <ToastContainer position="top-center" autoClose={3500} theme="colored" />

      {/* Popup de confirmation — cadeau reçu */}
      {receivedConfirmWeek !== null && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-camp-ink/40 backdrop-blur-sm" onClick={() => setReceivedConfirmWeek(null)} />
          <div className="card-sign relative z-10 w-full max-w-sm p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-camp-amber/15 text-camp-amber mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-center font-display text-lg font-black text-camp-pine-dark">
              {t('confirmReceived.title')}
            </h2>
            <p className="mb-1 text-center text-sm text-camp-bark">
              <Trans t={t} i18nKey="confirmReceived.body" components={{ strong: <strong /> }} />
            </p>
            <p className="mb-5 flex items-start justify-center gap-1.5 text-center text-xs text-camp-bark/70">
              <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-camp-sun" />
              {t('confirmReceived.photoWarning')}
            </p>
            <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-camp-bark select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-camp-pine"
                onChange={(e) => { dontShowRef.current = e.target.checked; }}
              />
              {t('confirmReceived.dontShowAgain')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReceivedConfirmWeek(null)}
                className="btn-ghost flex-1"
              >
                {t('confirmReceived.cancel')}
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => {
                  if (dontShowRef.current) localStorage.setItem(RECEIVED_CONFIRM_KEY, '1');
                  const week = receivedConfirmWeek;
                  setReceivedConfirmWeek(null);
                  void doMarkReceived(week);
                }}
              >
                {t('confirmReceived.confirm')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {photoPromptWeek !== null && (
        <GiftPhotoPrompt
          code={code}
          week={photoPromptWeek}
          onClose={() => setPhotoPromptWeek(null)}
          onUploaded={() => {
            toast.success(t('photos.shared'));
            loadPhotos();
          }}
        />
      )}
    </div>
  );
}
