import { useContext, useEffect, useState, type ComponentType } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  Heart,
  HeartCrack,
  ShieldAlert,
  Palette,
  PawPrint,
  Loader2,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import { userApi } from '@/api/user';
import { tokenStore } from '@/api/client';
import type { WishlistItem } from '@/api/types';
import WishlistEditor from '@/components/WishlistEditor';
import 'react-toastify/dist/ReactToastify.css';

const COLOR_SUGGESTIONS = ['Bleu', 'Bleu pastel', 'Lavande', 'Vert', 'Jaune', 'Rouge', 'Rose', 'Turquoise', 'Violet'];
const ANIMAL_SUGGESTIONS = ['Chat', 'Chien', 'Panda', 'Dauphin', 'Lapin', 'Renard', 'Koala', 'Tigre', 'Loutre', 'Hibou'];

const clean = (arr: string[]): string[] =>
  arr
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);

/** Liste de réponses : un champ par réponse, avec ajout/retrait. */
function AnswerList({
  values,
  onChange,
  placeholder,
  icon: Icon,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const rows = values.length ? values : [''];
  const update = (i: number, v: string) => {
    const next = [...rows];
    next[i] = v;
    onChange(next);
  };
  const add = () => onChange([...rows, '']);
  const removeAt = (i: number) => {
    const next = rows.filter((_, idx) => idx !== i);
    onChange(next.length ? next : ['']);
  };

  return (
    <div className="space-y-2">
      {rows.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/40" />
            <input
              className="field pl-11"
              placeholder={placeholder}
              value={val}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (i === rows.length - 1 && val.trim()) add();
                }
              }}
            />
          </div>
          {rows.length > 1 && (
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              onClick={() => removeAt(i)}
              aria-label="Retirer cette réponse"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn-ghost !px-4 !py-2 text-sm" onClick={add}>
        <Plus className="h-4 w-4" /> Ajouter une réponse
      </button>
    </div>
  );
}

const TOTAL_STEPS = 7;

export default function PreferencesPage() {
  const [likes, setLikes] = useState<string[]>(['']);
  const [dislikes, setDislikes] = useState<string[]>(['']);
  const [allergies, setAllergies] = useState<string[]>(['']);
  const [color, setColor] = useState('');
  const [animal, setAnimal] = useState('');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  // Brouillon : reprise en cas de retour sur la page.
  useEffect(() => {
    const draft = localStorage.getItem('prefs_draft');
    if (!draft) return;
    try {
      const d = JSON.parse(draft);
      if (Array.isArray(d.likes) && d.likes.length) setLikes(d.likes);
      if (Array.isArray(d.dislikes) && d.dislikes.length) setDislikes(d.dislikes);
      if (Array.isArray(d.allergies) && d.allergies.length) setAllergies(d.allergies);
      if (typeof d.color === 'string') setColor(d.color);
      if (typeof d.animal === 'string') setAnimal(d.animal);
      if (Array.isArray(d.wishlist)) setWishlist(d.wishlist);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('prefs_draft', JSON.stringify({ likes, dislikes, allergies, color, animal, wishlist }));
  }, [likes, dislikes, allergies, color, animal, wishlist]);

  const canAdvance = (): boolean => {
    if (step === 0 && clean(likes).length === 0) {
      toast.warning('Ajoute au moins une chose que tu aimes.');
      return false;
    }
    if (step === 4 && !color.trim()) {
      toast.warning('Indique ta couleur préférée.');
      return false;
    }
    if (step === 5 && !animal.trim()) {
      toast.warning('Indique ton animal préféré.');
      return false;
    }
    return true;
  };

  const next = () => {
    if (!canAdvance()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!tokenStore.get()) {
      toast.error('Non authentifié.');
      return navigate('/');
    }
    const L = clean(likes);
    if (L.length === 0) {
      setStep(0);
      return toast.warning('Ajoute au moins une chose que tu aimes.');
    }
    if (!color.trim()) {
      setStep(4);
      return toast.warning('Indique ta couleur préférée.');
    }
    if (!animal.trim()) {
      setStep(5);
      return toast.warning('Indique ton animal préféré.');
    }

    setSubmitting(true);
    try {
      await userApi.onboard({
        likes: L,
        dislikes: clean(dislikes),
        allergies: clean(allergies),
        color: color.trim(),
        animal: animal.trim(),
        wishlist: wishlist
          .map((w) => ({ title: w.title.trim(), url: w.url?.trim() || undefined, price: w.price?.trim() || undefined }))
          .filter((w) => w.title),
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

  const steps: { title: string; subtitle: string; content: React.ReactNode }[] = [
    {
      title: 'Ce que tu aimes',
      subtitle: 'Une réponse par champ — ajoute-en autant que tu veux.',
      content: (
        <AnswerList values={likes} onChange={setLikes} icon={Heart} placeholder="Ex : chocolat noir" />
      ),
    },
    {
      title: "Ce que tu n'aimes pas",
      subtitle: 'Optionnel — ça aide ton ami secret à éviter les faux pas.',
      content: (
        <AnswerList values={dislikes} onChange={setDislikes} icon={HeartCrack} placeholder="Ex : réglisse" />
      ),
    },
    {
      title: 'Tes allergies',
      subtitle: 'Optionnel — important pour les cadeaux gourmands.',
      content: (
        <AnswerList values={allergies} onChange={setAllergies} icon={ShieldAlert} placeholder="Ex : arachides" />
      ),
    },
    {
      title: 'Ta liste de souhaits',
      subtitle: 'Optionnel — des idées précises (titre, lien, prix) pour ton ami secret.',
      content: <WishlistEditor items={wishlist} onChange={setWishlist} />,
    },
    {
      title: 'Ta couleur préférée',
      subtitle: 'Une seule réponse.',
      content: (
        <div className="relative">
          <Palette className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/40" />
          <input
            list="colors"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ex : Bleu pastel"
            className="field pl-11"
          />
          <datalist id="colors">
            {COLOR_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      ),
    },
    {
      title: 'Ton animal préféré',
      subtitle: 'Une seule réponse.',
      content: (
        <div className="relative">
          <PawPrint className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/40" />
          <input
            list="animals"
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
            placeholder="Ex : Renard"
            className="field pl-11"
          />
          <datalist id="animals">
            {ANIMAL_SUGGESTIONS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
      ),
    },
    {
      title: 'Récapitulatif',
      subtitle: 'Tout est bon ? Tu pourras modifier plus tard depuis ton profil.',
      content: (
        <dl className="space-y-3 text-sm">
          <Recap label="J'aime" values={clean(likes)} />
          <Recap label="Je n'aime pas" values={clean(dislikes)} />
          <Recap label="Allergies" values={clean(allergies)} />
          <Recap
            label="Liste de souhaits"
            values={wishlist
              .filter((w) => w.title.trim())
              .map((w) => w.title.trim() + (w.price?.trim() ? ` (${w.price.trim()})` : ''))}
          />
          <Recap label="Couleur préférée" values={color.trim() ? [color.trim()] : []} />
          <Recap label="Animal préféré" values={animal.trim() ? [animal.trim()] : []} />
        </dl>
      ),
    },
  ];

  const isReview = step === TOTAL_STEPS - 1;
  const current = steps[step];

  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Progression */}
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-camp-bark">
          <span>
            Étape {step + 1} sur {TOTAL_STEPS}
          </span>
        </div>
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-camp-sand/70">
          <motion.div
            className="h-full rounded-full bg-camp-pine"
            initial={false}
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="card-sign p-8 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-2xl font-black text-camp-pine-dark sm:text-3xl">
                {current.title}
              </h1>
              <p className="mb-6 mt-1 text-sm text-camp-bark">{current.subtitle}</p>
              {current.content}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn-ghost"
              onClick={prev}
              disabled={step === 0 || submitting}
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </button>

            {isReview ? (
              <button type="button" className="btn-primary" onClick={() => void handleSubmit()} disabled={submitting}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <Check className="h-5 w-5" /> Enregistrer
                  </>
                )}
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={next} disabled={submitting}>
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}

function Recap({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-camp-bark/10 pb-2">
      <dt className="font-bold text-camp-pine-dark">{label} :</dt>
      <dd className="text-camp-bark">
        {values.length ? (
          <span className="flex flex-wrap gap-1.5">
            {values.map((v) => (
              <span key={v} className="rounded-full bg-camp-sand px-2.5 py-0.5 text-xs font-semibold text-camp-pine-dark">
                {v}
              </span>
            ))}
          </span>
        ) : (
          <span className="italic text-camp-bark/60">—</span>
        )}
      </dd>
    </div>
  );
}
