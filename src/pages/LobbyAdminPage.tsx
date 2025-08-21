import { useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';

type Errors = Partial<{
  gameName: string;
  weeks: string;
  reminderDays: string;
}>;

const clampInt = (v: any, opts: { min?: number; max?: number; fallback?: number } = {}) => {
  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, fallback = 0 } = opts;
  const n = Number.parseInt(String(v), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

// Règles métier (même que le schéma backend)
const LIMITS = {
  weeks: { min: 1, max: 52 },
  reminderDays: { min: 0, max: 6 },
  gameName: { min: 3, max: 60 }, // confort UI
};

export default function CreateGame() {
  const { user } = useContext(AuthContext) ?? ({} as any);
  const [gameName, setGameName] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [reminderDays, setReminderDays] = useState(2);
  const [includeAdmin, setIncludeAdmin] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ gameName?: boolean; weeks?: boolean; reminderDays?: boolean }>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL as string, []);
  const navigate = useNavigate();

  // Refs pour focus auto sur la 1ère erreur
  const nameRef = useRef<HTMLInputElement | null>(null);
  const weeksRef = useRef<HTMLInputElement | null>(null);
  const reminderRef = useRef<HTMLInputElement | null>(null);

  const validate = (state?: { gameName: string; weeks: number; reminderDays: number }) => {
    const g = state?.gameName ?? gameName;
    const w = state?.weeks ?? weeks;
    const r = state?.reminderDays ?? reminderDays;

    const e: Errors = {};

    const gn = g.trim();
    if (!gn) e.gameName = 'Le nom de la partie est requis.';
    else if (gn.length < LIMITS.gameName.min) e.gameName = `Au moins ${LIMITS.gameName.min} caractères.`;
    else if (gn.length > LIMITS.gameName.max) e.gameName = `Maximum ${LIMITS.gameName.max} caractères.`;

    if (w < LIMITS.weeks.min || w > LIMITS.weeks.max) {
      e.weeks = `Entre ${LIMITS.weeks.min} et ${LIMITS.weeks.max} semaines.`;
    }

    if (r < LIMITS.reminderDays.min || r > LIMITS.reminderDays.max) {
      e.reminderDays = `Entre ${LIMITS.reminderDays.min} et ${LIMITS.reminderDays.max} jours.`;
    }

    return e;
  };

  const focusFirstError = (e: Errors) => {
    if (e.gameName) { nameRef.current?.focus(); return; }
    if (e.weeks) { weeksRef.current?.focus(); return; }
    if (e.reminderDays) { reminderRef.current?.focus(); return; }
  };

  const showError = (key: keyof Errors) => (touched[key] || submittedOnce) && errors[key];

  const onChangeName = (v: string) => {
    setGameName(v);
    if (touched.gameName || submittedOnce) {
      setErrors(validate({ gameName: v, weeks, reminderDays }));
    }
  };
  const onChangeWeeks = (v: string) => {
    const clamped = clampInt(v, { min: LIMITS.weeks.min, max: LIMITS.weeks.max, fallback: LIMITS.weeks.min });
    setWeeks(clamped);
    if (touched.weeks || submittedOnce) {
      setErrors(validate({ gameName, weeks: clamped, reminderDays }));
    }
  };
  const onChangeReminder = (v: string) => {
    const clamped = clampInt(v, { min: LIMITS.reminderDays.min, max: LIMITS.reminderDays.max, fallback: LIMITS.reminderDays.min });
    setReminderDays(clamped);
    if (touched.reminderDays || submittedOnce) {
      setErrors(validate({ gameName, weeks, reminderDays: clamped }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);

    const nowErrors = validate();
    setErrors(nowErrors);

    if (Object.keys(nowErrors).length > 0) {
      focusFirstError(nowErrors);
      toast.error('Corrige les champs en rouge.');
      return;
    }

    const adminName = String(user?.name || '').trim();
    if (!adminName) {
      toast.error("Impossible de récupérer le nom de l'administrateur.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const res = await fetch(`${apiUrl}/game/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: gameName.trim(),
          weeks,
          reminderDays,
          players: includeAdmin ? [adminName] : [],
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json?.message ||
          (!includeAdmin
            ? "Le serveur refuse une liste de joueurs vide. Active “Je participe” ou adapte l’API."
            : 'Erreur lors de la création de la partie.');
        throw new Error(msg);
      }

      toast.success('Partie créée ✨');
      navigate(`/lobby/${json.data.code}`);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'w-full px-4 py-2 rounded-full border focus:ring-2 shadow-sm transition';
  const ok = Object.keys(validate()).length === 0;

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

        {/* Nom */}
        <div className="mb-6">
          <label htmlFor="game-name" className="block text-sm font-semibold text-green-900 mb-2">
            Nom de la partie
          </label>
          <input
            id="game-name"
            ref={nameRef}
            type="text"
            value={gameName}
            onChange={(e) => onChangeName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, gameName: true }))}
            placeholder="Ex: Camp d'été 2025"
            className={
              inputBase +
              ' ' +
              (showError('gameName')
                ? 'border-red-300 focus:ring-red-300'
                : 'border-yellow-300 focus:ring-green-400')
            }
            aria-invalid={!!showError('gameName')}
            aria-describedby="name-help name-error"
            disabled={submitting}
            maxLength={LIMITS.gameName.max}
            required
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <p id="name-help" className="text-gray-500">
              {`Entre ${LIMITS.gameName.min} et ${LIMITS.gameName.max} caractères.`}
            </p>
            <p className="text-gray-400">{gameName.trim().length}/{LIMITS.gameName.max}</p>
          </div>
          {showError('gameName') && (
            <p id="name-error" className="mt-1 text-xs text-red-600">{errors.gameName}</p>
          )}
        </div>

        {/* Semaines */}
        <div className="mb-6">
          <label htmlFor="weeks" className="block text-sm font-semibold text-green-900 mb-2">
            Durée (semaines)
          </label>
          <input
            id="weeks"
            ref={weeksRef}
            type="number"
            min={LIMITS.weeks.min}
            max={LIMITS.weeks.max}
            value={weeks}
            onChange={(e) => onChangeWeeks(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, weeks: true }))}
            className={
              inputBase +
              ' ' +
              (showError('weeks')
                ? 'border-red-300 focus:ring-red-300'
                : 'border-yellow-300 focus:ring-green-400')
            }
            aria-invalid={!!showError('weeks')}
            aria-describedby="weeks-help weeks-error"
            disabled={submitting}
            inputMode="numeric"
            required
          />
          <p id="weeks-help" className="mt-1 text-xs text-gray-500">
            {`Entre ${LIMITS.weeks.min} et ${LIMITS.weeks.max} semaines.`}
          </p>
          {showError('weeks') && (
            <p id="weeks-error" className="mt-1 text-xs text-red-600">{errors.weeks}</p>
          )}
        </div>

        {/* Rappel */}
        <div className="mb-6">
          <label htmlFor="reminder" className="block text-sm font-semibold text-green-900 mb-2">
            Jours avant le rappel courriel
          </label>
          <input
            id="reminder"
            ref={reminderRef}
            type="number"
            min={LIMITS.reminderDays.min}
            max={LIMITS.reminderDays.max}
            value={reminderDays}
            onChange={(e) => onChangeReminder(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, reminderDays: true }))}
            className={
              inputBase +
              ' ' +
              (showError('reminderDays')
                ? 'border-red-300 focus:ring-red-300'
                : 'border-yellow-300 focus:ring-green-400')
            }
            aria-invalid={!!showError('reminderDays')}
            aria-describedby="reminder-help reminder-error"
            disabled={submitting}
            inputMode="numeric"
            required
          />
          <p id="reminder-help" className="mt-1 text-xs text-gray-500">
            {`Entre ${LIMITS.reminderDays.min} et ${LIMITS.reminderDays.max} jours.`}
          </p>
          {showError('reminderDays') && (
            <p id="reminder-error" className="mt-1 text-xs text-red-600">{errors.reminderDays}</p>
          )}
        </div>

        {/* Admin joue ? */}
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
              : 'Tu ne seras pas joueur — partage le code pour que les autres vous rejoignent.'}
          </p>
        </div>

        {/* Bannière d’info rapide */}
        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-900">
          Règles : {LIMITS.weeks.min}–{LIMITS.weeks.max} semaines • {LIMITS.reminderDays.min}–{LIMITS.reminderDays.max} jours de rappel • Nom {LIMITS.gameName.min}–{LIMITS.gameName.max} caractères.
        </div>

        <button
          type="submit"
          disabled={submitting || !ok}
          className={
            'w-full py-3 rounded-full text-white font-bold shadow-lg transition ' +
            (submitting || !ok
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600')
          }
        >
          {submitting ? 'Création…' : 'Lancer la partie'}
        </button>
      </motion.form>

      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </div>
  );
}
