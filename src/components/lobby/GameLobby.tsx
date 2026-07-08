import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
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

const STATUS_META: Record<GameStatus, { label: string; classes: string }> = {
  lobby: { label: 'En attente', classes: 'bg-camp-sun/30 text-camp-bark' },
  drawn: { label: 'Tirage fait', classes: 'bg-camp-ember/20 text-camp-ember-dark' },
  revealed: { label: 'Révélé', classes: 'bg-camp-pine/15 text-camp-pine-dark' },
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
 * Messagerie anonyme temporairement désactivée (purge des anciens messages à
 * faire en base). Le backend renvoie aussi 503 tant que CHAT_ENABLED n'est pas
 * activé — repasser ce flag à false ici une fois la purge faite.
 */
const CHAT_TEMPORARILY_DISABLED = true;

export default function GameLobby({ admin }: { admin: boolean }) {
  const { code = '' } = useParams();
  const navigate = useNavigate();
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
      setError(err instanceof Error ? err.message : 'Erreur de chargement.');
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
    if (!name) return toast.warning('Le nom de la partie est requis.');
    setSavingDetails(true);
    try {
      const lobby = game.status === 'lobby';
      await gamesApi.updateGame(game._id, {
        name,
        // semaines & rappel verrouillés après le tirage
        numberOfWeeks: lobby ? editWeeks : undefined,
        reminderDayBefore: lobby ? editReminder : undefined,
      });
      toast.success('Partie mise à jour.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible.');
    } finally {
      setSavingDetails(false);
    }
  };

  const removePlayer = async (userId: string, name: string) => {
    if (!game) return;
    if (!window.confirm(`Expulser ${name} de la partie ?`)) return;
    setBusyPlayer(userId);
    try {
      await gamesApi.removePlayer(game._id, userId);
      toast.success(`${name} a été expulsé.`);
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
        toast.success(`${name} n'est plus organisateur.`);
      } else {
        await gamesApi.addAdmin(game._id, userId);
        toast.success(`${name} est maintenant organisateur.`);
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setBusyPlayer(null);
    }
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copié.`);
    } catch {
      toast.error('Copie impossible.');
    }
  };

  const joinLink = `${window.location.origin}/game/join?code=${code}`;

  const handleDraw = async () => {
    if (!game) return;
    if (game.players.length < 2) return toast.warning('Il faut au moins 2 participants.');
    if (!window.confirm('Lancer le tirage ? Cette action est définitive.')) return;
    setActing(true);
    try {
      await gamesApi.draw(code);
      toast.success('Tirage effectué.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Échec du tirage.');
    } finally {
      setActing(false);
    }
  };

  const handleReveal = async () => {
    if (!window.confirm('Révéler tous les amis secrets ?')) return;
    setActing(true);
    try {
      await gamesApi.reveal(code);
      toast.success('Amis secrets révélés.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Échec de la révélation.');
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
      toast.error(err instanceof Error ? err.message : 'Erreur.');
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
        toast.error(err instanceof Error ? err.message : 'Erreur.');
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
      toast.success('Message envoyé.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Envoi impossible.');
    } finally {
      setSending(false);
    }
  };

  const leave = async () => {
    if (!game) return;
    if (!window.confirm('Quitter cette partie ?')) return;
    try {
      await gamesApi.leave(game._id);
      toast.success('Tu as quitté la partie.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du départ.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-camp-cream bg-topo">
        <div className="grid min-h-[70vh] place-items-center">
          <div className="flex flex-col items-center gap-3">
            <Campfire className="w-20" />
            <span className="font-hand text-2xl text-camp-ember-dark">Chargement du lobby…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="grid min-h-screen place-items-center bg-camp-cream bg-topo p-6 text-center">
        <div className="card-sign max-w-md p-8">
          <h2 className="mb-2 font-display text-2xl font-black text-camp-berry">Oups</h2>
          <p className="mb-5 text-camp-bark">{error ?? 'Partie introuvable.'}</p>
          <button onClick={() => void load()} className="btn-primary">Réessayer</button>
        </div>
      </div>
    );
  }

  const status = STATUS_META[game.status] ?? STATUS_META.lobby;
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
                  <span className={`badge-merit ${status.classes}`}>{status.label}</span>
                  <span className="text-sm text-camp-bark">{game.numberOfWeeks} semaines</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {game.isAdmin && !admin && (
                <button onClick={() => navigate(`/lobby/${code}/admin`)} className="btn-ghost !py-2 !px-4 text-sm">
                  <ShieldCheck className="h-4 w-4" /> Vue admin
                </button>
              )}
              {admin && (
                <button onClick={() => navigate(`/lobby/${code}`)} className="btn-ghost !py-2 !px-4 text-sm">
                  <ArrowLeft className="h-4 w-4" /> Vue joueur
                </button>
              )}
            </div>
          </div>

          {/* Code + partage */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-camp-bark/30 bg-camp-sand/30 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-camp-bark/70">Code</p>
              <p className="font-display text-2xl font-black tracking-[0.25em] text-camp-pine-dark">{game.code}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={() => copy(game.code, 'Code')} className="btn-ghost !py-2 !px-4 text-sm">
                <Copy className="h-4 w-4" /> Copier le code
              </button>
              <button onClick={() => copy(joinLink, 'Lien')} className="btn-ember !py-2 !px-4 text-sm">
                <Share2 className="h-4 w-4" /> Partager le lien
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
                  <Settings className="h-5 w-5 text-camp-pine" /> Détails de la partie
                </h2>
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="field-label">Nombre de semaines</label>
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
                      <label className="field-label">Jour de rappel (0–6 j. avant)</label>
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
                      Le nombre de semaines et le rappel sont verrouillés après le tirage.
                    </p>
                  )}
                  <button onClick={() => void saveDetails()} disabled={savingDetails} className="btn-primary">
                    {savingDetails ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Enregistrer
                  </button>
                </div>
              </div>
            )}

            {/* Tirage / lobby */}
            {!drawn ? (
              <div className="card-sign flex flex-col items-center gap-3 p-8 text-center">
                <Tent className="w-20" />
                <h2 className="font-display text-xl font-bold text-camp-pine-dark">En attente du tirage</h2>
                <p className="text-sm text-camp-bark">
                  {game.players.length} participant{game.players.length > 1 ? 's' : ''} pour l’instant.
                </p>
                {game.isAdmin && (
                  <button onClick={handleDraw} disabled={acting} className="btn-primary mt-2">
                    {acting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    Lancer le tirage
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Ma cible */}
                {game.isMember && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Gift className="h-5 w-5 text-camp-ember" /> Mon ami secret
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
                            <p className="field-label">Aime</p>
                            <Chips items={target.likes} tone="bg-camp-pine/10 text-camp-pine-dark" />
                          </div>
                          <div>
                            <p className="field-label">N’aime pas</p>
                            <Chips items={target.dislikes} tone="bg-camp-berry/10 text-camp-berry" />
                          </div>
                          <div>
                            <p className="field-label">Couleur préférée</p>
                            <p className="text-sm text-camp-ink">{target.favoriteColor || '—'}</p>
                          </div>
                          <div>
                            <p className="field-label">Animal préféré</p>
                            <p className="text-sm text-camp-ink">{target.favoriteAnimal || '—'}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="field-label">Allergies</p>
                            <Chips items={target.allergies} tone="bg-camp-sun/30 text-camp-bark" />
                          </div>
                          {target.wishlist && target.wishlist.length > 0 && (
                            <div className="sm:col-span-2">
                              <p className="field-label flex items-center gap-1.5">
                                <Gift className="h-4 w-4 text-camp-ember" /> Idées de cadeaux
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
                      <p className="text-sm text-camp-bark">Ton ami secret n’est pas encore disponible.</p>
                    )}
                  </div>
                )}

                {/* Suivi des cadeaux reçus */}
                {game.isMember && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 font-display text-xl font-bold text-camp-pine-dark">Cadeaux reçus</h2>
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
                            title={`Semaine ${week}`}
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
                      Coche chaque semaine où tu as bien reçu ton cadeau.
                    </p>
                  </div>
                )}

                {/* Fil de photos de la partie */}
                {game.isMember && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Gift className="h-5 w-5 text-camp-berry" /> Photos de la partie
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
                      <Inbox className="h-5 w-5 text-camp-lake" /> Messages anonymes
                    </h2>
                    <div className="flex items-start gap-3 rounded-2xl border-2 border-camp-sun/40 bg-camp-sun/10 p-4">
                      <span className="text-xl" aria-hidden>🚧</span>
                      <div>
                        <p className="text-sm font-bold text-camp-pine-dark">
                          Messagerie temporairement indisponible
                        </p>
                        <p className="mt-0.5 text-sm text-camp-bark">
                          On fait un peu de ménage dans le courrier du camp. Les messages anonymes reviennent très bientôt !
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {game.isMember && !CHAT_TEMPORARILY_DISABLED && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Inbox className="h-5 w-5 text-camp-lake" /> Messages anonymes
                    </h2>

                    <div className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-camp-sand/80 p-1">
                      {(
                        [
                          { tab: 'target', label: 'Ma personne à gâter' },
                          { tab: 'gifter', label: 'Mon bienfaiteur secret' },
                        ] as { tab: MessageRecipient; label: string }[]
                      ).map(({ tab, label }) => (
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
                          {label}
                        </button>
                      ))}
                    </div>

                    <p className="mb-4 text-xs text-camp-bark/70">
                      {chatTab === 'target'
                        ? 'Conversation anonyme avec ta personne à gâter.'
                        : 'Conversation anonyme avec ton bienfaiteur secret — tu peux lui répondre sans savoir qui c’est.'}
                    </p>

                    <div className="mb-4 space-y-3">
                      {threads[chatTab].length === 0 ? (
                        <p className="text-sm text-camp-bark/70">
                          {chatTab === 'target'
                            ? 'Aucun message pour l’instant. Envoie un indice à ta personne à gâter !'
                            : 'Aucun message pour l’instant. Remercie ou questionne ton bienfaiteur secret !'}
                        </p>
                      ) : (
                        threads[chatTab].map((m) => (
                          <div
                            key={m._id}
                            className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}
                          >
                            <span className="mb-1 px-1 text-xs font-bold text-camp-bark/70">
                              {m.mine
                                ? 'Moi'
                                : chatTab === 'target'
                                  ? 'Ma personne à gâter'
                                  : 'Mon bienfaiteur secret'}
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
                                {new Date(m.createdAt).toLocaleDateString('fr-CA')}
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
                        placeholder={
                          chatTab === 'target'
                            ? 'Un indice pour ta personne à gâter…'
                            : 'Un mot pour ton bienfaiteur secret…'
                        }
                        className="field flex-1"
                      />
                      <button type="submit" disabled={sending} className="btn-primary !px-4">
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </button>
                    </form>
                  </div>
                )}

                {/* Admin : révélation + progression */}
                {admin && game.isAdmin && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Crown className="h-5 w-5 text-camp-sun" /> Organisateur
                    </h2>
                    {game.status === 'drawn' && (
                      <button onClick={handleReveal} disabled={acting} className="btn-ember mb-4">
                        {acting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />}
                        Révéler les amis secrets
                      </button>
                    )}
                    {progress && (
                      <div className="space-y-2">
                        <p className="field-label">Progression des cadeaux reçus</p>
                        <ProgressViz progress={progress} />
                      </div>
                    )}
                  </div>
                )}

                {/* Résultat du tirage — réservé à l'admin du site (modération) */}
                {game.isSiteAdmin && game.assignments && game.assignments.length > 0 && (
                  <div className="card-sign border-camp-ember/40 p-6">
                    <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Eye className="h-5 w-5 text-camp-ember" /> Résultat du tirage
                    </h2>
                    <p className="mb-3 text-xs text-camp-bark">
                      Visible uniquement par l’administration du site — qui offre à qui.
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
                Participants ({game.players.length})
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
                          <Crown className="h-3 w-3" /> Orga
                        </span>
                      )}
                      {isMe && <span className="badge-merit bg-camp-pine/15 text-camp-pine-dark">Moi</span>}

                      {canManage && (
                        <span className="flex items-center gap-1">
                          <button
                            className="icon-btn !h-8 !w-8"
                            title={isP_admin ? 'Retirer le rôle organisateur' : 'Nommer organisateur'}
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
                              title="Expulser de la partie"
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
                  <LogOut className="h-4 w-4" /> Quitter la partie
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
              Tu as bien reçu ton cadeau ?
            </h2>
            <p className="mb-1 text-center text-sm text-camp-bark">
              Confirme seulement si <strong>tu as reçu</strong> ton cadeau cette semaine — pas que tu en as donné un.
            </p>
            <p className="mb-5 text-center text-xs text-camp-bark/70">
              ⚠️ Si tu partages une photo, fais attention à ne pas révéler l'identité de ton Ami Secret.
            </p>
            <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-camp-bark select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-camp-pine"
                onChange={(e) => { dontShowRef.current = e.target.checked; }}
              />
              Ne plus afficher ce message
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReceivedConfirmWeek(null)}
                className="btn-ghost flex-1"
              >
                Annuler
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
                Oui, j'ai reçu mon cadeau
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
            toast.success('Photo partagée avec la partie !');
            loadPhotos();
          }}
        />
      )}
    </div>
  );
}
