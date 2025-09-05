import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Errors = { likes?: boolean; color?: boolean; animal?: boolean };

const COLOR_SUGGESTIONS = [
  'Bleu', 'Bleu pastel', 'Lavande', 'Vert', 'Jaune', 'Rouge', 'Rose', 'Noir', 'Blanc', 'Gris', 'Turquoise', 'Violet'
];
const ANIMAL_SUGGESTIONS = [
  'Chat', 'Chien', 'Panda', 'Dauphin', 'Lapin', 'Renard', 'Koala', 'Tigre', 'Loutre', 'Hérisson', 'Hibou'
];

// ---- Composant de liste en “chips” ----
function ChipsInput({
  label,
  values,
  setValues,
  required = false,
  hasError = false,
  placeholder = 'Tape puis Enter',
  'aria-describedby': ariaDescribedBy,
}: {
  label: string;
  values: string[];
  setValues: (updater: (prev: string[]) => string[]) => void;
  required?: boolean;
  hasError?: boolean;
  placeholder?: string;
  'aria-describedby'?: string;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = (s: string) => s.trim().replace(/\s+/g, ' ');
  const exists = (s: string, arr = values) =>
    arr.some(v => v.toLowerCase() === s.toLowerCase());

  const addFromInput = () => {
    const val = normalized(input);
    if (!val) return;
    if (exists(val)) {
      setInput('');
      return toast.info(`“${val}” est déjà ajouté`);
    }
    setValues(prev => [...prev, val]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFromInput();
    }
    if (e.key === 'Backspace' && !input && values.length > 0) {
      // supprime le dernier
      setValues(prev => prev.slice(0, -1));
    }
  };

  const removeAt = (i: number) => {
    setValues(prev => prev.filter((_, idx) => idx !== i));
    inputRef.current?.focus();
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-green-900 mb-2">
        {label}{required && <span className="text-red-600"> *</span>}
      </label>

      <div
        className={`flex flex-wrap gap-2 rounded-2xl border bg-white p-2 focus-within:ring-2 focus-within:ring-yellow-400 ${
          hasError ? 'border-red-500' : 'border-yellow-300'
        }`}
      >
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-2 rounded-full bg-yellow-100 text-green-900 px-3 py-1 text-sm"
          >
            {v}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="text-red-600 hover:text-red-700"
              aria-label={`Retirer ${v}`}
              title="Retirer"
            >
              ✕
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addFromInput}
          placeholder={placeholder}
          aria-describedby={ariaDescribedBy}
          className="min-w-[180px] flex-1 bg-transparent outline-none px-2 py-1 text-sm"
        />
      </div>

      {required && hasError && (
        <p className="text-red-600 text-xs mt-1">Veuillez ajouter au moins un “J’aime”.</p>
      )}
    </div>
  );
}

export default function PreferencesPage() {
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [color, setColor] = useState('');
  const [animal, setAnimal] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL as string, []);
  const token = useMemo(() => localStorage.getItem('token'), []);

  const auth = useContext(AuthContext);

  // ---- Chargement / sauvegarde brouillon ----
  useEffect(() => {
    const draft = localStorage.getItem('prefs_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setLikes(Array.isArray(d.likes) ? d.likes : []);
        setDislikes(Array.isArray(d.dislikes) ? d.dislikes : []);
        setAllergies(Array.isArray(d.allergies) ? d.allergies : []);
        setColor(typeof d.color === 'string' ? d.color : '');
        setAnimal(typeof d.animal === 'string' ? d.animal : '');
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({ likes, dislikes, allergies, color, animal });
    localStorage.setItem('prefs_draft', payload);
  }, [likes, dislikes, allergies, color, animal]);

  // ---- Helpers ----
  const cleanList = (arr: string[]) =>
    arr
      .map(s => s.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .filter((v, i, a) => a.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i);

  const validate = (): Errors => {
    const errs: Errors = {
      likes: cleanList(likes).length === 0,
      color: !color.trim(),
      animal: !animal.trim(),
    };
    setErrors(errs);
    return errs;
  };

  const hasErrors = (e: Errors) => Object.values(e).some(Boolean);

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Non authentifié');
      return navigate('/');
    }

    const errs = validate();
    if (hasErrors(errs)) return;

    setSubmitting(true);
    try {
      const body = {
        likes: cleanList(likes),
        dislikes: cleanList(dislikes),
        allergies: cleanList(allergies),
        color: color.trim(),
        animal: animal.trim(),
      };

      const res = await fetch(`${apiUrl}/user/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const text = await res.text(); // safe même si vide
      if (!res.ok) {
        const message = (() => {
          try { return JSON.parse(text)?.message; } catch { return text; }
        })() || "Erreur lors de l'envoi des préférences";
        throw new Error(message);
      }

      let updatedUser: any = null;
      try { updatedUser = JSON.parse(text)?.data?.user ?? null; } catch {}
      if (updatedUser && auth?.setUser) {
        auth.setUser(updatedUser);
      }

      toast.success('Préférences enregistrées avec succès !');
      localStorage.removeItem('prefs_draft');
      // Petit délai pour laisser le toast apparaître
      setTimeout(() => navigate('/dashboard', { replace: true }), 900);
    } catch (err: any) {
      toast.error(err?.message || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Rendu ----
  return (
    <div className="min-h-screen bg-yellow-50 py-20 px-4 flex justify-center items-start">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 border border-yellow-300"
        noValidate
      >
        <h1 className="text-3xl font-extrabold text-green-800 mb-6 text-center">
          Mes préférences
        </h1>
        <p className="text-center text-green-800/80 mb-8">
          Aide ton ami(e) secret à choisir mieux : ajoute ce que tu <strong>aimes</strong>, ce que tu <strong>n’aimes pas</strong>, et tes <strong>allergies</strong>.
        </p>

        <ChipsInput
          label="J'aime"
          values={likes}
          setValues={setLikes}
          required
          hasError={!!errors.likes}
          aria-describedby="hint-likes"
          placeholder="Ex: chocolat noir, manga, DIY…"
        />
        <p id="hint-likes" className="sr-only">Ajoute au moins un élément.</p>

        <ChipsInput
          label="J'aime pas"
          values={dislikes}
          setValues={setDislikes}
          placeholder="Ex: réglisse noire, films d’horreur…"
        />

        <ChipsInput
          label="Allergies"
          values={allergies}
          setValues={setAllergies}
          placeholder="Ex: arachides, lactose, pollen…"
        />

        <div className="mb-6">
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Couleur préférée <span className="text-red-600">*</span>
          </label>
          <input
            list="colors"
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ex: Bleu pastel, Lavande…"
            className={`w-full px-4 py-2 rounded-full border shadow-sm focus:ring-2 focus:ring-yellow-400 ${
              errors.color ? 'border-red-500' : 'border-yellow-300'
            }`}
          />
          {errors.color && (
            <p className="text-red-600 text-xs mt-1">Veuillez indiquer une couleur préférée.</p>
          )}
          <datalist id="colors">
            {COLOR_SUGGESTIONS.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Animal préféré <span className="text-red-600">*</span>
          </label>
          <input
            list="animals"
            type="text"
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
            placeholder="Ex: Panda, Chat, Dauphin…"
            className={`w-full px-4 py-2 rounded-full border shadow-sm focus:ring-2 focus:ring-yellow-400 ${
              errors.animal ? 'border-red-500' : 'border-yellow-300'
            }`}
          />
          {errors.animal && (
            <p className="text-red-600 text-xs mt-1">Veuillez indiquer un animal préféré.</p>
          )}
          <datalist id="animals">
            {ANIMAL_SUGGESTIONS.map(a => <option key={a} value={a} />)}
          </datalist>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-full text-white font-bold shadow-lg ${
              submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer mes préférences'}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 rounded-full bg-white border border-yellow-300 hover:bg-yellow-50 text-green-900 font-bold shadow-sm"
          >
            Plus tard
          </button>
        </div>
      </motion.form>

      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </div>
  );
}
