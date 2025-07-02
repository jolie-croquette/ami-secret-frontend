// CreateGamePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CreateGame() {
  const [gameName, setGameName] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [reminderDays, setReminderDays] = useState(2);
  const [players, setPlayers] = useState(['']);
  const [suggestions, setSuggestions] = useState<string[][]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePlayerChange = async (index: number, value: string) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });

    if (value.length > 2) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/search?query=${value}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setSuggestions((prev) => {
            const copy = [...prev];
            copy[index] = json.data.map((u: any) => u.name);
            return copy;
          });
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions((prev) => {
        const copy = [...prev];
        copy[index] = [];
        return copy;
      });
    }
  };

  const selectSuggestion = (index: number, name: string) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = name;
      return copy;
    });
    setSuggestions((prev) => {
      const copy = [...prev];
      copy[index] = [];
      return copy;
    });
  };

  const addPlayer = () => {
    setPlayers((prev) => [...prev, '']);
    setSuggestions((prev) => [...prev, []]);
  };

  const removePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gameName.trim() || weeks <= 0 || reminderDays < 0 || players.some(p => !p.trim())) {
      setError('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Non authentifié");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: gameName,
          weeks,
          reminderDays,
          players
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur lors de la création de la partie');

      navigate(`/lobby/${json.data.code}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 py-20 px-4 flex justify-center items-start">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10 border border-yellow-300"
      >
        <h1 className="text-3xl font-extrabold text-green-800 mb-8 text-center">🎉 Créer une partie</h1>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-green-900 mb-2">Nom de la partie</label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Ex: Ami Secret Semaine 1"
            className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-green-900 mb-2">Durée (semaines)</label>
          <input
            type="number"
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
            min={1}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-green-900 mb-2">Jours avant le rappel courriel</label>
          <input
            type="number"
            value={reminderDays}
            onChange={(e) => setReminderDays(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
            min={0}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-green-900 mb-2">Participants (prénoms)</label>
          <div className="space-y-2">
            {players.map((player, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={player}
                    onChange={(e) => handlePlayerChange(i, e.target.value)}
                    className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
                    placeholder={`Joueur ${i + 1}`}
                    required
                  />
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(i)}
                      className="text-red-500 hover:text-red-700"
                    >❌</button>
                  )}
                </div>
                {suggestions[i] && suggestions[i].length > 0 && (
                  <ul className="absolute left-0 right-0 bg-white border border-yellow-200 rounded-xl mt-1 shadow-lg z-10">
                    {suggestions[i].map((s, si) => (
                      <li
                        key={si}
                        className="px-4 py-2 hover:bg-yellow-100 cursor-pointer text-sm"
                        onClick={() => selectSuggestion(i, s)}
                      >{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPlayer}
              className="text-sm text-yellow-600 hover:text-yellow-800 underline"
            >+ Ajouter un joueur</button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg"
        >
          Lancer la partie 🎲
        </button>
      </motion.form>
    </div>
  );
}
