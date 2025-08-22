import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Bouncy } from 'ldrs/react';
import 'ldrs/react/Bouncy.css';

interface Player {
  _id: string;
  name: string;
  email: string;
}
interface Game {
  _id: string;
  name: string;
  code: string;
  numberOfWeeks: number;
  reminderDayBefore: number;
  adminIds: string[];
  adminUsers?: { _id: string; name?: string }[];
  players: Player[];
}
interface PlayerDetails {
  _id: string;
  name: string;
  email: string;
  likes?: string[];
  dislikes?: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  allergies?: string[];
  bio?: string;
}

// ————— Helpers UI —————
const GRADS = [
  'from-emerald-400 to-green-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
  'from-teal-400 to-cyan-600',
];
const hashIdx = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % GRADS.length;
};
const initials = (name: string) =>
  name.trim().split(' ').filter(Boolean).map(w => w[0]?.toUpperCase()).slice(0, 2).join('') || '🙂';

export default function PlayerLobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext) ?? ({} as any);
  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL as string, []);

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  // Profil (modal)
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<PlayerDetails | null>(null);
  const [profileGrad, setProfileGrad] = useState<string>(GRADS[0]);

  // Quitter (modal)
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);

  const token = () => localStorage.getItem('token');
  const ensureAuth = () => {
    const t = token();
    if (!t) {
      toast.error('Session expirée. Connecte-toi à nouveau.');
      logout?.();
      navigate('/login');
      return null;
    }
    return t;
  };

  // ——— Fetch (⚠️ pas de redirection auto vers admin : on montre la vue joueur + un bouton de bascule si admin)
  const fetchGame = useCallback(async () => {
    const t = ensureAuth();
    if (!t || !code) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiUrl}/game/code/${code}`, { headers: { Authorization: `Bearer ${t}` } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'Erreur de chargement');
      setGame(json.data as Game);

      // Si l'utilisateur n'est ni admin ni joueur → on l'envoie vers la page de join
      const me = String(user?._id ?? user?.id ?? user?.userId ?? '');
      const admins = (json.data.adminIds?.length ? json.data.adminIds : (json.data.adminUsers ?? []).map((u:any) => u._id)).map(String);
      const isAdmin = me && admins.includes(me);
      const isPlayer = (json.data.players ?? []).some((p: Player) => String(p._id) === me);
      if (!isAdmin && !isPlayer) navigate(`/game/join?code=${code}`, { replace: true });
    } catch (e: any) {
      setError(e?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, code, navigate, user, logout]);

  useEffect(() => { void fetchGame(); }, [fetchGame]);

  // ——— Dérivés
  const myId = String(user?._id ?? user?.id ?? user?.userId ?? '');
  const adminIdSet = useMemo(
    () =>
      new Set<string>(
        (game?.adminIds?.length
          ? game.adminIds
          : (game?.adminUsers ?? []).map(u => u._id)
        )?.map(String) ?? []
      ),
    [game]
  );
  const isMeAdmin = myId && adminIdSet.has(myId);
  const isMePlayer = !!(game?.players ?? []).some(p => String(p._id) === myId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = game?.players ?? [];
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [game, search]);

  const joinLink = `${window.location.origin}/game/join?code=${game?.code ?? ''}`;

  // ——— Actions UI
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(joinLink); toast.success('Lien copié'); }
    catch { toast.error('Impossible de copier le lien'); }
  };
  const copyCode = async () => {
    if (!game?.code) return;
    try { await navigator.clipboard.writeText(game.code); toast.success('Code copié'); }
    catch { toast.error('Impossible de copier le code'); }
  };
  const shareJoin = async () => {
    const title = 'Rejoins ma partie Ami Secret';
    const text  = `Entre le code ${game?.code} pour nous rejoindre 🎁`;
    const url   = joinLink;
    try {
      // @ts-ignore
      if (navigator.share) { /* @ts-ignore */ await navigator.share({ title, text, url }); }
      else { await copyLink(); }
    } catch { await copyLink(); }
  };

  // ——— Profil
  const openProfile = async (player: Player) => {
    const t = ensureAuth(); if (!t) return;
    try {
      setProfileLoading(true);
      setProfileOpen(true);
      setProfile(null);
      setProfileGrad(GRADS[hashIdx(player._id + player.name)]);
      const res = await fetch(`${apiUrl}/user/preferences/${player._id}`, { headers: { Authorization: `Bearer ${t}` } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'Chargement du profil impossible');
      setProfile(json.data as PlayerDetails);
    } catch (e: any) {
      toast.error(e?.message || 'Erreur');
      setProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };
  const closeProfile = () => { setProfileOpen(false); setProfile(null); };

  // ——— Quitter (optimiste)
  const askLeave = () => setLeaveOpen(true);
  const closeLeave = () => { if (!leaveBusy) setLeaveOpen(false); };
  const confirmLeave = async () => {
    if (!game) return;
    const t = ensureAuth(); if (!t) return;
    setLeaveBusy(true);
    const prevPlayers = game.players;
    setGame(g => (g ? { ...g, players: g.players.filter(p => String(p._id) !== myId) } : g));
    try {
      const res = await fetch(`${apiUrl}/game/${game._id}/leave`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'Impossible de quitter la partie.');
      toast.success('Tu as quitté la partie.');
      setLeaveBusy(false);
      setLeaveOpen(false);
      navigate('/dashboard');
    } catch (e: any) {
      setGame(g => (g ? { ...g, players: prevPlayers } : g));
      setLeaveBusy(false);
      toast.error(e?.message || 'Erreur lors du départ.');
    }
  };

  // ——— Renders
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-3 text-green-800">
          <Bouncy size="56" speed="1.4" color="green" />
          <span className="font-semibold">Chargement du lobby…</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={() => fetchGame()} className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold">Réessayer</button>
        </div>
      </div>
    );
  }
  if (!game) return null;

  return (
    <div className="bg-yellow-50 min-h-screen py-12 px-4 relative">
      <div className="mt-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Détails (joueur) */}
        <div className="md:col-span-2 lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-green-800">Ta partie</h2>

            {/* ⬇️ Bouton de bascule visible uniquement si admin */}
            {isMeAdmin && (
              <button
                onClick={() => navigate(`/lobby/${game.code}/admin`)}
                className="inline-flex items-center gap-2 rounded-full bg-red-100 border border-red-300 text-red-900 px-3 py-1.5 text-xs font-semibold hover:bg-red-50"
                title="Passer à la vue admin"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 12h12M12 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Vue admin
              </button>
            )}
          </div>

          {/* Code + actions */}
          <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50/50 p-4">
            <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold">Code</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-2xl font-extrabold text-green-900">{game.code}</span>
              <button
                onClick={copyCode}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-white px-3 py-1.5 text-xs font-semibold text-yellow-900 hover:bg-yellow-100"
                title="Copier le code"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" className="opacity-80" fill="none">
                  <path d="M9 9h8v8H9z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7 7h8M7 7v8" stroke="currentColor" strokeWidth="1.8" opacity=".6" />
                </svg>
                Copier
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={shareJoin}
                className="w-full rounded-full bg-white border border-green-300 text-green-900 hover:bg-green-50 font-semibold px-4 py-2 inline-flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80" fill="none">
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 4v12M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Partager le lien
              </button>
              <button
                onClick={copyLink}
                className="w-full rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-semibold px-4 py-2 border border-yellow-300 inline-flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80" fill="none">
                  <path d="M10.5 13.5l3-3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7 17a4 4 0 0 1 0-6l3-3a4 4 0 1 1 6 6l-1 1" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Copier le lien
              </button>
            </div>
          </div>

          {/* infos */}
          <ul className="text-sm text-gray-700 space-y-2 mt-4">
            <li><strong>Nom :</strong> {game.name}</li>
            <li><strong>Durée :</strong> {game.numberOfWeeks} semaines</li>
            <li><strong>Rappel :</strong> {game.reminderDayBefore} jours avant</li>
          </ul>

          {/* préférences + quitter (quitter seulement si joueur) */}
          <div className="mt-5 space-y-2">
            {isMePlayer && (
              <button
                onClick={askLeave}
                className="w-full py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-800 font-bold border border-red-200"
              >
                Quitter la partie
              </button>
            )}
            {!isMePlayer && (
              <p className="text-xs text-gray-500">
                Tu es admin mais pas joueur dans cette partie. Tu peux gérer la partie via la <button className="underline" onClick={() => navigate(`/lobby/${game.code}`)}>vue admin</button>.
              </p>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-green-800 mb-4">👥 Participants ({game.players.length})</h2>

          {/* Recherche */}
          <div className="flex flex-col lg:flex-row gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche (nom ou courriel)"
              className="px-3 py-2 rounded-xl w-full border focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* En-têtes (desktop) */}
          <div className="hidden md:grid grid-cols-[1fr,auto] px-4 py-2 text-[11px] font-semibold text-green-900/80 uppercase tracking-wide mt-4">
            <div>Participant</div>
            <div className="justify-self-end">Profil</div>
          </div>

          {/* Liste */}
          <div className="mt-2">
            <ul className="space-y-3" role="list">
              {filtered.length === 0 ? (
                <li className="text-sm text-gray-600">Aucun participant ne correspond aux critères.</li>
              ) : (
                filtered.map((p) => {
                  const grad = GRADS[hashIdx(p._id + p.name)];
                  const isAdmin = adminIdSet.has(String(p._id));
                  const isMe = String(p._id) === myId;

                  return (
                    <li key={p._id} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                      <div className="grid items-center gap-3 p-4 md:grid-cols-[1fr,auto]">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} text-white grid place-items-center text-xs font-bold shrink-0`}>
                            {initials(p.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-green-900 truncate">{p.name}</p>
                              {isAdmin && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">ADMIN</span>
                              )}
                              {isMe && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border">MOI</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{p.email}</p>
                          </div>
                        </div>

                        <div className="justify-self-end">
                          <button
                            onClick={() => openProfile(p)}
                            className="h-8 px-3 text-xs rounded-full border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 hidden md:inline"
                          >
                            Détails
                          </button>
                        </div>

                        {/* Mobile chip */}
                        <div className="mt-2 md:hidden grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
                          <button
                            onClick={() => openProfile(p)}
                            className="h-9 px-3 text-xs rounded-full border border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
                          >
                            Détails
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Profil joueur */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50" onClick={closeProfile}>
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-[min(680px,92vw)] relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-profile-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeProfile} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl" aria-label="Fermer">×</button>

            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${profileGrad} text-white grid place-items-center text-sm font-bold`}>
                {initials(profile?.name || '')}
              </div>
              <div className="min-w-0">
                <h3 id="player-profile-title" className="text-lg font-bold text-green-800 truncate">{profile?.name || 'Profil'}</h3>
                <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
              </div>
            </div>

            <div className="mt-5">
              {profileLoading ? (
                <div className="flex items-center gap-3 text-green-800">
                  <Bouncy size="36" speed="1.2" color="green" />
                  <span className="text-sm">Chargement du profil…</span>
                </div>
              ) : !profile ? (
                <p className="text-sm text-gray-600">Profil introuvable.</p>
              ) : (
                <div className="space-y-5">
                  {profile.bio && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-1">À propos</p>
                      <p className="text-sm text-gray-700">{profile.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">Aime</p>
                      {profile.likes?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.likes.map((l, i) => (
                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-800 border border-green-200">{l}</span>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-500">—</p>}
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">N’aime pas</p>
                      {profile.dislikes?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.dislikes.map((d, i) => (
                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-800 border border-red-200">{d}</span>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-500">—</p>}
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">Couleur préférée</p>
                      <p className="text-sm text-gray-700">{profile.favoriteColor || '—'}</p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">Animal préféré</p>
                      <p className="text-sm text-gray-700">{profile.favoriteAnimal || '—'}</p>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">Allergies</p>
                      {profile.allergies?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.allergies.map((a, i) => (
                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-900 border border-amber-200">{a}</span>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-500">Aucune</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={closeProfile} className="px-4 py-2 rounded-full bg-white border hover:bg-gray-50 text-gray-800 font-semibold">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quitter */}
      {leaveOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40"
          onClick={closeLeave}
          onKeyDown={(e) => e.key === 'Escape' && closeLeave()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-title"
        >
          <div
            className="relative w-[min(560px,92vw)] rounded-2xl bg-white p-6 shadow-2xl border border-yellow-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLeave}
              disabled={leaveBusy}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 text-xl disabled:opacity-50"
              aria-label="Fermer"
            >
              ×
            </button>

            <h3 id="leave-title" className="text-lg font-bold text-green-800">Quitter la partie ?</h3>
            <div className="mt-4 rounded-xl border bg-yellow-50/40 p-4">
              <p className="text-sm text-gray-700">
                Tu pourras toujours revenir avec le code <span className="font-mono font-semibold">{game.code}</span>.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={closeLeave}
                disabled={leaveBusy}
                className="px-4 py-2 rounded-full bg-white border hover:bg-gray-50 text-gray-800 font-semibold disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                onClick={confirmLeave}
                disabled={leaveBusy}
                className={
                  'px-4 py-2 rounded-full font-semibold border ' +
                  (leaveBusy
                    ? 'bg-red-200 text-red-900 border-red-200 cursor-wait'
                    : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100')
                }
              >
                {leaveBusy ? 'Départ…' : 'Quitter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
