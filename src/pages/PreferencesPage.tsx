import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { X, Heart, HeartCrack, ShieldAlert, Palette, PawPrint, Loader2 } from 'lucide-react';
import { userApi } from '@/api/user';
import { tokenStore } from '@/api/client';
import 'react-toastify/dist/ReactToastify.css';

type Errors = { likes?: boolean; color?: boolean; animal?: boolean };

const COLOR_SUGGESTIONS = ['Bleu', 'Bleu pastel', 'Lavande', 'Vert', 'Jaune', 'Rouge', 'Rose', 'Turquoise', 'Violet'];
const ANIMAL_SUGGESTIONS = ['Chat', 'Chien', 'Panda', 'Dauphin', 'Lapin', 'Renard', 'Koala', 'Tigre', 'Loutre', 'Hibou'];

function ChipsInput({
  label,
  icon: Icon,
  values,
  setValues,
  required = false,
  hasError = false,
  placeholder = 'Tape puis Entrée',
}: {
  label: string;
  icon: typeof Heart;
  values: string[];
  setValues: (updater: (prev: string[]) => string[]) => void;
  required?: boolean;
  hasError?: boolean;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = (s: string) => s.trim().replace(/\s+/g, ' ');
  const exists = (s: string) => values.some((v) => v.toLowerCase() === s.toLowerCase());

  const addFromInput = () => {
    const val = normalized(input);
    if (!val) return;
    if (exists(val)) {
      setInput('');
      return;
    }
    setValues((prev) => [...prev, val]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFromInput();
    }
    if (e.key === 'Backspace' && !input && values.length > 0) {
      setValues((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div>
      <label className="field-label flex items-center gap-2">
        <Icon className="h-4 w-4 text-camp-pine" /> {label}
        {required && <span className="text-camp-berry">*</span>}
      </label>
      <div
        className={`flex flex-wrap gap-2 rounded-2xl border-2 bg-white/70 p-2 transition focus-within:ring-4 focus-within:ring-camp-sun/40 ${
          hasError ? 'border-camp-berry' : 'border-camp-bark/25'
        }`}
      >
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-camp-sand px-3 py-1 text-sm font-semibold text-camp-pine-dark"
          >
            {v}
            <button
              type="button"
              onClick={() => setValues((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-camp-berry hover:text-camp-ember-dark"
              aria-label={`Retirer ${v}`}
            >
              <X className="h-3.5 w-3.5" />
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
          className="min-w-[160px] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
        />
      </div>
      {required && hasError && (
        <p className="mt-1 text-xs text-camp-berry">Ajoute au moins un élément.</p>
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
  const auth = useContext(AuthContext);

  useEffect(() => {
    const draft = localStorage.getItem('prefs_draft');
    if (!draft) return;
    try {
      const d = JSON.parse(draft);
      setLikes(Array.isArray(d.likes) ? d.likes : []);
      setDislikes(Array.isArray(d.dislikes) ? d.dislikes : []);
      setAllergies(Array.isArray(d.allergies) ? d.allergies : []);
      setColor(typeof d.color === 'string' ? d.color : '');
      setAnimal(typeof d.animal === 'string' ? d.animal : '');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('prefs_draft', JSON.stringify({ likes, dislikes, allergies, color, animal }));
  }, [likes, dislikes, allergies, color, animal]);

  const cleanList = (arr: string[]) =>
    arr
      .map((s) => s.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenStore.get()) {
      toast.error('Non authentifié.');
      return navigate('/');
    }

    const errs: Errors = {
      likes: cleanList(likes).length === 0,
      color: !color.trim(),
      animal: !animal.trim(),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSubmitting(true);
    try {
      await userApi.onboard({
        likes: cleanList(likes),
        dislikes: cleanList(dislikes),
        allergies: cleanList(allergies),
        color: color.trim(),
        animal: animal.trim(),
      });
      await auth?.refresh();
      localStorage.removeItem('prefs_draft');
      toast.success('Préférences enregistrées.');
      setTimeout(() => navigate('/dashboard', { replace: true }), 700);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-4 py-12">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="card-sign mx-auto w-full max-w-2xl p-8 sm:p-10"
        noValidate
      >
        <h1 className="mb-1 text-center font-display text-3xl font-black text-camp-pine-dark">
          Mes préférences
        </h1>
        <p className="mb-8 text-center text-sm text-camp-bark">
          Aide ton ami secret à bien choisir : ce que tu aimes, ce que tu n’aimes pas, et tes allergies.
        </p>

        <div className="space-y-5">
          <ChipsInput label="J’aime" icon={Heart} values={likes} setValues={setLikes} required hasError={!!errors.likes} placeholder="Ex : chocolat noir, lecture, plein air…" />
          <ChipsInput label="Je n’aime pas" icon={HeartCrack} values={dislikes} setValues={setDislikes} placeholder="Ex : réglisse, films d’horreur…" />
          <ChipsInput label="Allergies" icon={ShieldAlert} values={allergies} setValues={setAllergies} placeholder="Ex : arachides, lactose…" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label flex items-center gap-2">
                <Palette className="h-4 w-4 text-camp-pine" /> Couleur préférée <span className="text-camp-berry">*</span>
              </label>
              <input
                list="colors"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ex : Bleu pastel"
                className={`field ${errors.color ? 'border-camp-berry' : ''}`}
              />
              <datalist id="colors">{COLOR_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className="field-label flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-camp-pine" /> Animal préféré <span className="text-camp-berry">*</span>
              </label>
              <input
                list="animals"
                value={animal}
                onChange={(e) => setAnimal(e.target.value)}
                placeholder="Ex : Renard"
                className={`field ${errors.animal ? 'border-camp-berry' : ''}`}
              />
              <datalist id="animals">{ANIMAL_SUGGESTIONS.map((a) => <option key={a} value={a} />)}</datalist>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enregistrer'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost" disabled={submitting}>
            Plus tard
          </button>
        </div>
      </motion.form>

      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
