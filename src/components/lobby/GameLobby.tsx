import { useCallback, useContext, useEffect, useState } from 'react';
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
} from 'lucide-react';
import { gamesApi } from '@/api/games';
import { messagesApi } from '@/api/messages';
import { ApiError } from '@/api/client';
import type {
  GameDetails,
  GameStatus,
  TargetPreferences,
  InboxMessage,
  GameProgress,
} from '@/api/types';
import { MeritBadge, Tent, Campfire, CampScene } from '@/components/visuals/CampVisuals';
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

export default function GameLobby({ admin }: { admin: boolean }) {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const me = auth?.user;

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [target, setTarget] = useState<TargetPreferences | null>(null);
  const [weeksGifted, setWeeksGifted] = useState<number[]>([]);
  const [busyWeek, setBusyWeek] = useState<number | null>(null);

  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [acting, setActing] = useState(false);

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
      setWeeksGifted(g.myWeeksGifted ?? []);

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
        messagesApi.inbox(code).then(setMessages).catch(() => setMessages([]));
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

  const toggleWeek = async (week: number) => {
    const gifted = !weeksGifted.includes(week);
    setBusyWeek(week);
    try {
      const res = await gamesApi.markWeek(code, week, gifted);
      setWeeksGifted(res.weeksGifted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setBusyWeek(null);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      await messagesApi.send(code, body);
      setDraft('');
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

  const status = STATUS_META[game.status];
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
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-camp-bark">Ton ami secret n’est pas encore disponible.</p>
                    )}
                  </div>
                )}

                {/* Suivi des semaines */}
                {game.isMember && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 font-display text-xl font-bold text-camp-pine-dark">Suivi des cadeaux</h2>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: game.numberOfWeeks }, (_, i) => i + 1).map((week) => {
                        const done = weeksGifted.includes(week);
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
                      Coche chaque semaine où tu as offert ton cadeau.
                    </p>
                  </div>
                )}

                {/* Messages anonymes */}
                {game.isMember && (
                  <div className="card-sign p-6">
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-camp-pine-dark">
                      <Inbox className="h-5 w-5 text-camp-lake" /> Messages anonymes
                    </h2>
                    <form onSubmit={sendMessage} className="mb-4 flex gap-2">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        maxLength={500}
                        placeholder="Un indice pour ton ami secret…"
                        className="field flex-1"
                      />
                      <button type="submit" disabled={sending} className="btn-primary !px-4">
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </button>
                    </form>
                    <div className="space-y-2">
                      <p className="field-label">Reçus (anonymes)</p>
                      {messages.length === 0 ? (
                        <p className="text-sm text-camp-bark/70">Aucun message reçu.</p>
                      ) : (
                        messages.map((m) => (
                          <div key={m._id} className="rounded-2xl border-2 border-camp-bark/15 bg-white/60 p-3">
                            <p className="text-sm text-camp-ink">{m.body}</p>
                            <p className="mt-1 text-xs text-camp-bark/60">
                              {new Date(m.createdAt).toLocaleDateString('fr-CA')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
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
                        <p className="field-label">Progression</p>
                        {progress.members.map((m) => (
                          <div key={m.user._id} className="flex items-center justify-between rounded-xl bg-camp-sand/30 px-3 py-2">
                            <span className="text-sm font-semibold text-camp-ink">{m.user.name}</span>
                            <span className="text-sm text-camp-bark">
                              {m.giftedCount}/{progress.numberOfWeeks} semaines
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
                          {!isP_admin && !drawn && (
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
    </div>
  );
}
