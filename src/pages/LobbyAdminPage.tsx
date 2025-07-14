import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

interface Invitation {
  _id: string;
  status: 'pending' | 'accepted' | 'refused';
  recipient: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Game {
  _id: string;
  name: string;
  code: string;
  numberOfWeeks: number;
  reminderDayBefore: number;
  invitations: Invitation[];
  admin: {
    _id: string;
    name: string;
  };
}

export default function LobbyAdminPage() {
  const { code } = useParams();
  const auth = useContext(AuthContext);
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);

  useEffect(() => {
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

    if (auth?.user) fetchGame();
  }, [code, auth?.user]);

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

      setGame((prev) =>
        prev
          ? {
              ...prev,
              invitations: prev.invitations.filter((inv) => inv._id !== invitationId),
            }
          : null
      );
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

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!game) return null;

  return (
    <div className="bg-yellow-50 min-h-screen py-12 px-4">
      <div className="mt-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-green-800 mb-4">🎮 Détails de la partie</h2>
          <ul className="text-lg text-gray-700 space-y-2">
            <li><strong>Nom :</strong> {game?.name}</li>
            <li><strong>Code :</strong> <span className="font-mono">{game?.code}</span></li>
            <li><strong>Durée :</strong> {game?.numberOfWeeks} semaines</li>
            <li><strong>Rappel :</strong> {game?.reminderDayBefore} jours avant</li>
            <li><strong>Admin :</strong> {game?.admin.name}</li>
          </ul>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-green-800 mb-4">👥 Participants</h2>
          <div className="space-y-3">
            {game?.invitations.map((inv) => (
              <div
                key={inv._id}
                onClick={() => setSelectedInvitationId((prev) => (prev === inv._id ? null : inv._id))}
                className="flex justify-between items-center p-3 rounded-xl border bg-gray-50 hover:bg-yellow-50 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{inv.recipient.name}</p>
                  <p className="text-xs text-gray-500">{inv.recipient.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                    ${inv.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      inv.status === 'refused' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                    {inv.status === 'pending' ? 'En attente' :
                      inv.status === 'accepted' ? 'Accepté' : 'Refusé'}
                  </span>
                  {selectedInvitationId === inv._id && inv.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelInvitation(inv._id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full"
                    >
                    Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg disabled:opacity-50"
              disabled={game?.invitations.some((inv) => inv.status !== 'accepted')}
              onClick={handleDraw}
            >
              🎁 Lancer le tirage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
