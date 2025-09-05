import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

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
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
  "from-fuchsia-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-pink-400 to-rose-600",
  "from-teal-400 to-cyan-600",
];
const hashIdx = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % GRADS.length;
};
const initials = (name: string) =>
  name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "🙂";

// ————— Page —————
export default function LobbyAdminPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext) ?? ({} as any);
  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL as string, []);

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI liste
  const [search, setSearch] = useState("");

  // Modal profil
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<PlayerDetails | null>(null);
  const [profileGrad, setProfileGrad] = useState<string>(
    "from-emerald-400 to-green-600"
  );

  // ── Confirmation retrait joueur
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Player | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const token = () => localStorage.getItem("token");
  const ensureAuth = () => {
    const t = token();
    if (!t) {
      toast.error("Session expirée. Connecte-toi à nouveau.");
      logout?.();
      navigate("/login");
      return null;
    }
    return t;
  };

  // ——— Fetch + check admin
  const fetchGame = useCallback(async () => {
    const t = ensureAuth();
    if (!t || !code) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiUrl}/game/code/${code}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Erreur de chargement");

      const data: Game = json.data;
      const myId = String(user?._id ?? user?.id ?? user?.userId ?? "");
      const adminIds = (
        Array.isArray(data.adminIds) && data.adminIds.length > 0
          ? data.adminIds
          : (data.adminUsers ?? []).map((u) => u._id)
      ).map(String);

      if (!myId || !adminIds.includes(myId)) {
        navigate(`/room/${code}`, { replace: true }); // vue joueur
        return;
      }
      setGame(data);
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, code, navigate, user, logout]);

  useEffect(() => {
    void fetchGame();
  }, [fetchGame]);

  // ——— Dérivés
  const myId = String(user?._id ?? user?.id ?? user?.userId ?? "");
  const adminIdSet = useMemo(
    () =>
      new Set<string>(
        (game?.adminIds?.length
          ? game.adminIds
          : (game?.adminUsers ?? []).map((u) => u._id)
        )?.map(String) ?? []
      ),
    [game]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = game?.players ?? [];
    if (q)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "fr")); // tri A→Z
  }, [game, search]);

  const joinLink = `${window.location.origin}/game/join?code=${
    game?.code ?? ""
  }`;

  // ——— Actions API
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      toast.success("Lien copié");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  // copie juste le code (ex: ABC123)
  const copyCode = async () => {
    if (!game?.code) return;
    try {
      await navigator.clipboard.writeText(game.code);
      toast.success("Code copié");
    } catch {
      toast.error("Impossible de copier le code");
    }
  };

  // Partage natif si dispo, sinon fallback → copyLink()
  const shareJoin = async () => {
    const title = "Rejoins ma partie Ami Secret";
    const text = `Entre le code ${game?.code} pour nous rejoindre 🎁`;
    const url = joinLink;

    try {
      // @ts-ignore (compat TS)
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ title, text, url });
      } else {
        await copyLink();
      }
    } catch {
      await copyLink();
    }
  };

  const drawPairs = async () => {
    if (!game) return;
    const t = ensureAuth();
    if (!t) return;
    try {
      const res = await fetch(`${apiUrl}/game/${game._id}/draw`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Le tirage a échoué");
      toast.success("🎉 Tirage effectué !");
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    }
  };

  const canRemove = (p: Player) =>
    !adminIdSet.has(String(p._id)) && String(p._id) !== myId;

  // Ouvre le modal de confirmation
  const askRemovePlayer = (p: Player) => {
    if (!canRemove(p)) {
      toast.error("Impossible de retirer un admin ou vous-même");
      return;
    }
    setConfirmTarget(p);
    setConfirmOpen(true);
  };

  // Ferme le modal
  const closeConfirm = () => {
    if (confirmBusy) return; // évite de fermer pendant la requête
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  // Confirme et retire (optimiste, sans refresh)
  const confirmRemove = async () => {
    if (!game || !confirmTarget) return;
    const t = ensureAuth();
    if (!t) return;

    setConfirmBusy(true);

    // Sauvegarde + mise à jour optimiste
    const prevPlayers = game.players;
    setGame((g) =>
      g
        ? {
            ...g,
            players: g.players.filter((pl) => pl._id !== confirmTarget._id),
          }
        : g
    );

    try {
      const res = await fetch(
        `${apiUrl}/game/${game._id}/remove/${confirmTarget._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${t}` },
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Retrait impossible");

      toast.success(json?.message || "Joueur retiré.");
      setConfirmBusy(false);
      closeConfirm();
    } catch (e: any) {
      // rollback
      setGame((g) => (g ? { ...g, players: prevPlayers } : g));
      setConfirmBusy(false);
      toast.error(e?.message || "Erreur lors du retrait.");
    }
  };

  // ——— Profil joueur (modal)
  const openProfile = async (player: Player) => {
    const t = ensureAuth();
    if (!t) return;
    try {
      setProfileLoading(true);
      setProfileOpen(true);
      setProfile(null);
      setProfileGrad(GRADS[hashIdx(player._id + player.name)]);
      const res = await fetch(`${apiUrl}/user/preferences/${player._id}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.message || "Chargement du profil impossible");
      setProfile(json.data as PlayerDetails);
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
      setProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfile = () => {
    setProfileOpen(false);
    setProfile(null);
  };

  // Récupère la liste d'ID admin (peu importe adminIds/adminUsers côté backend)
  const adminIdsOf = (g: Game) =>
    (g?.adminIds?.length
      ? g.adminIds
      : (g?.adminUsers ?? []).map((u) => u._id)
    ).map(String);

  // ➜ Nommer un admin (optimiste)
  const promoteToAdmin = async (p: Player) => {
    if (!game) return;
    const t = ensureAuth();
    if (!t) return;

    const prev = game; // snapshot pour rollback
    // Optimiste: on ajoute l'ID dans adminIds
    setGame((g) => {
      if (!g) return g;
      const set = new Set(adminIdsOf(g));
      set.add(String(p._id));
      return { ...g, adminIds: Array.from(set) };
    });

    try {
      // ⚠️ Adapte la route à ton backend si besoin:
      // ex: POST /game/:id/admin/add/:userId
      const res = await fetch(`${apiUrl}/game/${game._id}/admin/add/${p._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.message || "Impossible de nommer admin");

      toast.success(json?.message || `${p.name} est maintenant admin.`);
    } catch (e: any) {
      // rollback
      setGame(prev);
      toast.error(e?.message || "Erreur lors de la nomination.");
    }
  };

  // ➜ Retirer un admin (optimiste)
  const revokeAdmin = async (p: Player) => {
    if (!game) return;
    if (String(p._id) === myId) {
      // Evite que l’admin courant se bloque lui-même hors de la page
      return toast.error(
        "Tu ne peux pas te retirer toi-même de l'administration."
      );
    }
    const t = ensureAuth();
    if (!t) return;

    const prev = game; // snapshot pour rollback
    setGame((g) => {
      if (!g) return g;
      const set = new Set(adminIdsOf(g));
      set.delete(String(p._id));
      return { ...g, adminIds: Array.from(set) };
    });

    try {
      // ⚠️ Adapte la route si besoin:
      // ex: POST /game/:id/admin/remove/:userId
      const res = await fetch(
        `${apiUrl}/game/${game._id}/admin/remove/${p._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${t}` },
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.message || "Impossible de retirer l'admin");

      toast.success(json?.message || `${p.name} n'est plus admin.`);
    } catch (e: any) {
      setGame(prev);
      toast.error(e?.message || "Erreur lors du retrait d'admin.");
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
          <button
            onClick={() => fetchGame()}
            className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  if (!game) return null;

  return (
    <div className="bg-yellow-50 min-h-screen py-12 px-4 relative">
      <div className="mt-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Détails */}
        <div className="md:col-span-2 lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col items-start justify-between">
            <button
              onClick={() => navigate(`/lobby/${game.code}`)}
              className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-300 text-green-900 px-3 py-1.5 text-xs font-semibold hover:bg-green-50"
              title="Basculer vers la vue joueur"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 12h12M12 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Vue joueur
            </button>
            <h2 className="text-2xl font-bold text-green-800">Détails de la partie</h2>
          </div>
          {/* code mis en avant + boutons */}
          <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50/50 p-4">
            <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold">
              Code
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-2xl font-extrabold text-green-900">
                {game.code}
              </span>
              <button
                onClick={copyCode}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-white px-3 py-1.5 text-xs font-semibold text-yellow-900 hover:bg-yellow-100"
                title="Copier le code"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="opacity-80"
                  fill="none"
                >
                  <path
                    d="M9 9h8v8H9z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M7 7h8M7 7v8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    opacity=".6"
                  />
                </svg>
                Copier
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={shareJoin}
                className="w-full rounded-full bg-white border border-green-300 text-green-900 hover:bg-green-50 font-semibold px-4 py-2 inline-flex items-center justify-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="opacity-80"
                  fill="none"
                >
                  <path
                    d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 4v12M12 4l-4 4M12 4l4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
                Partager le lien
              </button>
              <button
                onClick={copyLink}
                className="w-full rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-semibold px-4 py-2 border border-yellow-300 inline-flex items-center justify-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="opacity-80"
                  fill="none"
                >
                  <path
                    d="M10.5 13.5l3-3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M7 17a4 4 0 0 1 0-6l3-3a4 4 0 1 1 6 6l-1 1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
                Copier le lien
              </button>
            </div>
          </div>

          {/* infos */}
          <ul className="text-sm text-gray-700 space-y-2 mt-4">
            <li>
              <strong>Nom :</strong> {game.name}
            </li>
            <li>
              <strong>Durée :</strong> {game.numberOfWeeks} semaines
            </li>
            <li>
              <strong>Rappel :</strong> {game.reminderDayBefore} jours avant
            </li>
          </ul>

          {/* action principale */}
          <div className="mt-5">
            <button
              onClick={drawPairs}
              className="w-full py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold shadow"
            >
              Lancer le tirage au sort
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            👥 Participants ({game.players.length})
          </h2>

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
          <div className="hidden md:grid grid-cols-[1fr,1fr] px-4 py-2 text-[11px] font-semibold text-green-900/80 uppercase tracking-wide mt-4">
            <div>Participant</div>
            <div className="justify-self-end">Actions</div>
          </div>

          {/* Liste */}
          <div className="mt-2">
            <ul className="space-y-3" role="list">
              {filtered.length === 0 ? (
                <li className="text-sm text-gray-600">
                  Aucun participant ne correspond aux critères.
                </li>
              ) : (
                filtered.map((p) => {
                  const grad = GRADS[hashIdx(p._id + p.name)];
                  const isAdmin = adminIdSet.has(String(p._id));
                  const isMe = String(p._id) === myId;

                  return (
                    <li
                      key={p._id}
                      className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                    >
                      <div className="grid items-center gap-3 p-4 md:grid-cols-[1fr,1fr]">
                        {/* Participant */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} text-white grid place-items-center text-xs font-bold shrink-0`}
                          >
                            {initials(p.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-green-900 truncate">
                                {p.name}
                              </p>
                              {isAdmin && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
                                  ADMIN
                                </span>
                              )}
                              {isMe && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border">
                                  MOI
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {p.email}
                            </p>
                          </div>
                        </div>

                        {/* Actions (desktop) */}
                        <div className="hidden md:flex items-center gap-2 justify-self-end">
                          <button
                            onClick={() => openProfile(p)}
                            className="h-8 px-3 text-xs rounded-full border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                          >
                            Détails
                          </button>
                          <div className="hidden md:flex items-center gap-2 justify-self-end">
                            {isAdmin ? (
                              <button
                                onClick={() => revokeAdmin(p)}
                                title="Retirer les droits d’admin"
                                className="h-8 px-3 text-xs rounded-full border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              >
                                Retirer admin
                              </button>
                            ) : (
                              <button
                                onClick={() => promoteToAdmin(p)}
                                title="Nommer admin"
                                className="h-8 px-3 text-xs rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              >
                                Nommer admin
                              </button>
                            )}
                            <button
                              onClick={() => askRemovePlayer(p)}
                              disabled={!canRemove(p)}
                              title={
                                !canRemove(p)
                                  ? "Impossible de retirer un admin ou vous-même"
                                  : "Retirer ce joueur"
                              }
                              className={
                                "h-8 px-3 text-xs rounded-full border " +
                                (canRemove(p)
                                  ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                                  : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed")
                              }
                            >
                              Retirer
                            </button>
                          </div>
                        </div>

                        {/* Actions (mobile) */}
                        <div className="mt-2 md:hidden grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2">
                          <button
                            onClick={() => openProfile(p)}
                            className="h-9 px-3 text-xs rounded-full border border-cyan-200 bg-cyan-50 text-cyan-800"
                          >
                            Détails
                          </button>

                          {isAdmin ? (
                            <button
                              onClick={() => revokeAdmin(p)}
                              className="h-9 px-3 text-xs rounded-full border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            >
                              Retirer admin
                            </button>
                          ) : (
                            <button
                              onClick={() => promoteToAdmin(p)}
                              className="h-9 px-3 text-xs rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            >
                              Nommer admin
                            </button>
                          )}

                          <button
                            onClick={() => canRemove(p) && askRemovePlayer(p)}
                            disabled={!canRemove(p)}
                            title={!canRemove(p) ? 'Impossible de retirer un admin ou vous-même' : 'Retirer ce joueur'}
                            className={
                              'h-9 px-3 text-xs rounded-full border ' +
                              (canRemove(p)
                                ? 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed')
                            }
                          >
                            Retirer
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
        <ToastContainer
          position="top-center"
          autoClose={4000}
          theme="colored"
        />
      </div>

      {/* Modal Profil joueur */}
      {profileOpen && (
        <div
          className="fixed inset-0 bg-black/40 grid place-items-center z-50"
          onClick={closeProfile}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-[min(680px,92vw)] relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-profile-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeProfile}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
              aria-label="Fermer"
            >
              ×
            </button>

            {/* Header profil */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${profileGrad} text-white grid place-items-center text-sm font-bold`}
              >
                {initials(profile?.name || "")}
              </div>
              <div className="min-w-0">
                <h3
                  id="player-profile-title"
                  className="text-lg font-bold text-green-800 truncate"
                >
                  {profile?.name || "Profil"}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>

            {/* Contenu */}
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
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-1">
                        À propos
                      </p>
                      <p className="text-sm text-gray-700">{profile.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">
                        Aime
                      </p>
                      {profile.likes?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.likes.map((l, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-800 border border-green-200"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">—</p>
                      )}
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">
                        N’aime pas
                      </p>
                      {profile.dislikes?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.dislikes.map((d, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-800 border border-red-200"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">—</p>
                      )}
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">
                        Couleur préférée
                      </p>
                      <p className="text-sm text-gray-700">
                        {profile.favoriteColor || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">
                        Animal préféré
                      </p>
                      <p className="text-sm text-gray-700">
                        {profile.favoriteAnimal || "—"}
                      </p>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-wide text-green-900/70 font-semibold mb-2">
                        Allergies
                      </p>
                      {profile.allergies?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.allergies.map((a, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-900 border border-amber-200"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Aucune</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeProfile}
                className="px-4 py-2 rounded-full bg-white border hover:bg-gray-50 text-gray-800 font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal confirmation retrait joueur */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40"
          onClick={closeConfirm}
          onKeyDown={(e) => e.key === "Escape" && closeConfirm()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-remove-title"
        >
          <div
            className="relative w-[min(560px,92vw)] rounded-2xl bg-white p-6 shadow-2xl border border-yellow-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fermer */}
            <button
              onClick={closeConfirm}
              disabled={confirmBusy}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 text-xl disabled:opacity-50"
              aria-label="Fermer"
            >
              ×
            </button>

            {/* En-tête */}
            <div className="flex items-center gap-4">
              {/* Avatar dégradé cohérent avec la liste */}
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                  confirmTarget
                    ? GRADS[hashIdx(confirmTarget._id + confirmTarget.name)]
                    : "from-emerald-400 to-green-600"
                } text-white grid place-items-center text-sm font-bold`}
              >
                {initials(confirmTarget?.name || "")}
              </div>

              <div className="min-w-0">
                <h3
                  id="confirm-remove-title"
                  className="text-lg font-bold text-green-800 truncate"
                >
                  Retirer {confirmTarget?.name} ?
                </h3>
              </div>
            </div>

            {/* Corps */}
            <div className="mt-4 rounded-xl border bg-yellow-50/40 p-4">
              <p className="text-sm text-gray-700">
                Cette action retirera ce joueur de la partie. Il pourra toujours
                la rejoindre à nouveau avec le code{" "}
                <span className="font-mono font-semibold">{game?.code}</span>.
              </p>
            </div>

            {/* Pied de modal */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={closeConfirm}
                disabled={confirmBusy}
                className="px-4 py-2 rounded-full bg-white border hover:bg-gray-50 text-gray-800 font-semibold disabled:opacity-60"
              >
                Annuler
              </button>

              <button
                onClick={confirmRemove}
                disabled={confirmBusy}
                className={
                  "px-4 py-2 rounded-full font-semibold border " +
                  (confirmBusy
                    ? "bg-red-200 text-red-900 border-red-200 cursor-wait"
                    : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100")
                }
              >
                {confirmBusy ? "Suppression…" : "Retirer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
