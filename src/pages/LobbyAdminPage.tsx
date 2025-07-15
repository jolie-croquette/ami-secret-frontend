import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

interface Game {
  _id: string;
  name: string;
  code: string;
  numberOfWeeks: number;
  reminderDayBefore: number;
  players: {
    _id: string;
    name: string;
    email: string;
    invitationStatus: 'pending' | 'accepted' | 'refused' | 'none';
  }[];
  invitations: {
    _id: string;
    recipient: {
      _id: string;
    };
  }[];
}


interface PlayerDetails {
  _id: string;
  name: string;
  email: string;
  invitationStatus?: 'pending' | 'accepted' | 'refused' | 'none';
  likes?: string[];
  dislikes?: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  allergies?: string[];
}


export default function LobbyAdminPage() {
  const { code } = useParams();
  const auth = useContext(AuthContext);
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false); // Pour afficher le popup de chargement
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [detailPlayer, setDetailPlayer] = useState<PlayerDetails | null>(null);

  const fetchPlayerDetails = async (playerId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/preferences/${playerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setDetailPlayer(json.data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des détails :", err.message);
      alert("Impossible de charger les détails du joueur.");
    }
  };


  const fetchGame = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/code/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      if (json.data.admin._id !== auth?.user?.id) {
        setError("Accès refusé : vous n'êtes pas l'administrateur de cette partie.");
        return;
      }

      setGame(json.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.user) fetchGame();
  }, [code, auth?.user]);


  const handleRemovePlayer = async (playerId: string) => {
    if (!game) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/${game._id}/player/${playerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      await fetchGame();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };


  const handleCancelInvitation = async (invitationId: string) => {
    if (!game) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/${game._id}/invitation/${invitationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors de l'annulation de l'invitation");

      await fetchGame();
    } catch (err) {
      alert("Erreur: " + (err as Error).message);
    }
  };

  const handleDraw = async () => {
    if (!game) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/${game._id}/draw`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      alert("🎉 Le tirage au sort a été effectué !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleInv = async () => {
    if (!game) return;
    const token = localStorage.getItem('token');
    setSending(true);

    const toInvite = game.players.filter(
      (p) => p.invitationStatus === 'none' || p.invitationStatus === 'refused'
    );

    for (const player of toInvite) {
      setCurrentPlayer(player.name);
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/game/${game.code}/invite`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameId: game._id,
            playerId: player._id,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
      } catch (err: any) {
        console.error(`Erreur avec ${player.name} : ${err.message}`);
      }
    }

    await fetchGame();
    setSending(false);
    setCurrentPlayer(null);
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!game) return null;

  return (
    <div className="bg-yellow-50 min-h-screen py-12 px-4 relative">
      {sending && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center">
            <p className="text-xl font-bold text-green-800">Envoi des invitations...</p>
            <p className="text-gray-600 mt-2">Merci de patienter pendant l'envoi des courriels ✉️</p>
            <p className="text-gray-600 mt-2">Envoie en cours à : {currentPlayer}</p>
          </div>
        </div>
      )}

      <div className="mt-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-green-800 mb-4">🎮 Détails de la partie</h2>
          <ul className="text-lg text-gray-700 space-y-2">
            <li><strong>Nom :</strong> {game.name}</li>
            <li><strong>Code :</strong> <span className="font-mono">{game.code}</span></li>
            <li><strong>Durée :</strong> {game.numberOfWeeks} semaines</li>
            <li><strong>Rappel :</strong> {game.reminderDayBefore} jours avant</li>
          </ul>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-green-800 mb-4">👥 Participants</h2>
          <div className="space-y-3">
          {game.players.map((player) => (
            <div
              key={player._id}
              className="relative flex justify-between items-center p-3 rounded-xl border bg-gray-50 hover:bg-yellow-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{player.name}</p>
                <p className="text-xs text-gray-500">{player.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                  ${player.invitationStatus === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : player.invitationStatus === 'refused'
                    ? 'bg-red-100 text-red-800'
                    : player.invitationStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {player.invitationStatus === 'pending'
                    ? 'En attente'
                    : player.invitationStatus === 'accepted'
                    ? 'Accepté'
                    : player.invitationStatus === 'refused'
                    ? 'Refusé'
                    : 'Aucune invitation envoyée'}
                </span>

                <div className="flex items-center gap-2 p-2 rounded-2xl bg-gray-400">
                  {/* Bouton : Annuler l’invitation */}
                  {player.invitationStatus === 'pending' && (
                    <button
                      onClick={() => {
                        const invitation = game.invitations?.find(
                          (inv) => inv.recipient._id === player._id
                        );
                        if (invitation) handleCancelInvitation(invitation._id);
                        else alert("Invitation introuvable.");
                      }}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    >
                      Annuler l’invitation
                    </button>
                  )}

                  {/* Bouton : Retirer le joueur */}
                  <button
                    onClick={() => handleRemovePlayer(player._id)}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
                  >
                    Retirer
                  </button>

                  {/* Bouton : Voir préférences */}
                  <button
                    onClick={() => fetchPlayerDetails(player._id)}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200"
                  >
                    Préférences
                  </button>
                </div>


              </div>
            </div>
          ))}

          </div>

          <div className="mt-8 text-center flex flex-col items-center gap-4">
            {game.players.some(p => p.invitationStatus === 'none' || p.invitationStatus === 'refused') && (
              <button
                className='inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-full shadow-lg'
                onClick={handleInv}
                disabled={sending}
              >
                Envoyer les invitations
              </button>
            )}
          </div>
        </div>
      </div>
      {detailPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full relative">
            <h2 className="text-2xl font-bold text-green-800 mb-4">👤 Détails du joueur</h2>
            <p><strong>Nom :</strong> {detailPlayer.name}</p>
            <p><strong>Courriel :</strong> {detailPlayer.email}</p>
            <hr className="my-4" />

            <h3 className="text-lg font-semibold mb-2 text-green-700">🎁 Préférences</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><strong>Aime :</strong> {detailPlayer.likes?.join(', ') || '—'}</li>
              <li><strong>N’aime pas :</strong> {detailPlayer.dislikes?.join(', ') || '—'}</li>
              <li><strong>Couleur préférée :</strong> {detailPlayer.favoriteColor || '—'}</li>
              <li><strong>Animal préféré :</strong> {detailPlayer.favoriteAnimal || '—'}</li>
              <li><strong>Allergies :</strong> {detailPlayer.allergies?.join(', ') || 'Aucune'}</li>
            </ul>

            <button
              onClick={() => setDetailPlayer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
