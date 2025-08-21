import { useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';

export default function CreateGame() {
  const { user } = useContext(AuthContext) ?? ({} as any);
  const [gameName, setGameName] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [reminderDays, setReminderDays] = useState(2);
  const [includeAdmin, setIncludeAdmin] = useState(true); // admin joue ou non
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL as string, []);
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement | null>(null);

  // focus sur le champ nom au premier rendu
  // (pas de useEffect pour rester minimal — React focus via ref dans onLoad)
  const onNameRef = (el: HTMLInputElement | null) => {
    nameRef.current = el;
    if (el) el.focus();
  };

  const clampInt = (v: any, { min = 0, fallback = 0 }: { min?: number; fallback?: number } = {}) => {
    const n = Number.parseInt(String(v), 10);
    if (Number.isNaN(n)) return fallback;
    return Math.max(min, n);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const adminName = String(user?.name || '').trim();
    if (!adminName) {
      setError("Impossible de récupérer le nom de l'administrateur.");
      return;
    }

    const cleanName = gameName.trim();
    const cleanWeeks = clampInt(weeks, { min: 1, fallback: 1 });
    const cleanReminder = clampInt(reminderDays, { min: 0, fallback: 0 });

    if (!cleanName || cleanWeeks <= 0 || cleanReminder < 0) {
      setError('Veuillez remplir tous les champs correctement.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const payload = {
        name: cleanName,
        weeks: cleanWeeks,
        reminderDays: cleanReminder,
        // admin dans la liste seulement s’il participe
        players: includeAdmin ? [adminName] : [],
      };

      const res = await fetch(`${apiUrl}/game/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Remonte un message clair si le backend refuse players: []
        const msg =
          json?.message ||
          (!includeAdmin
            ? "Le serveur refuse une liste de joueurs vide. Active l’option “Je participe” ou adapte l’API."
            : 'Erreur lors de la création de la partie.');
        throw new Error(msg);
      }

      toast.success('Partie créée ✨');
      navigate(`/lobby/${json.data.code}`);
    } catch (err: any) {
      setError(err?.message || 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
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
        noValidate
        aria-labelledby="create-game-title"
      >
        <h1 id="create-game-title" className="text-3xl font-extrabold text-green-800 mb-8 text-center">
          🎉 Créer une partie
        </h1>

        <div className="mb-6">
          <label htmlFor="game-name" className="block text-sm font-semibold text-green-900 mb-2">
            Nom de la partie
          </label>
          <input
            id="game-name"
            ref={onNameRef}
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Ex: Camp d'été 2025"
            className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
            disabled={submitting}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="weeks" className="block text-sm font-semibold text-green-900 mb-2">
            Durée (semaines)
          </label>
          <input
            id="weeks"
            type="number"
            min={1}
            value={weeks}
            onChange={(e) => setWeeks(clampInt(e.target.value, { min: 1, fallback: 1 }))}
            className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
            disabled={submitting}
            required
            inputMode="numeric"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="reminder" className="block text-sm font-semibold text-green-900 mb-2">
            Jours avant le rappel courriel
          </label>
          <input
            id="reminder"
            type="number"
            min={0}
            value={reminderDays}
            onChange={(e) => setReminderDays(clampInt(e.target.value, { min: 0, fallback: 0 }))}
            className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
            disabled={submitting}
            required
            inputMode="numeric"
          />
        </div>

        <div className="mb-6">
          <label className="inline-flex items-center text-green-900 font-semibold">
            <input
              type="checkbox"
              checked={includeAdmin}
              onChange={() => setIncludeAdmin((v) => !v)}
              className="mr-2 accent-green-600"
              disabled={submitting}
            />
            Je participe moi-même à la partie
          </label>
          <p className="mt-2 text-xs text-gray-600">
            {includeAdmin
              ? 'Tu seras ajouté aux joueurs au moment de la création.'
              : 'Tu ne seras pas joueur — tu gères seulement la partie. Les autres rejoindront avec le code.'}
          </p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 rounded-full text-white font-bold shadow-lg ${
            submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {submitting ? 'Création…' : 'Lancer la partie'}
        </button>
      </motion.form>

      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </div>
  );
}
