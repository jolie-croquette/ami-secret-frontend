import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { X, Heart, HeartCrack, ShieldAlert, Palette, PawPrint, Loader2, Mail, Gift } from 'lucide-react';
import { userApi } from '@/api/user';
import type { WishlistItem } from '@/api/types';
import WishlistEditor from '@/components/WishlistEditor';
import { MeritBadge } from '@/components/visuals/CampVisuals';
import 'react-toastify/dist/ReactToastify.css';

const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).map((w) => w[0]?.toUpperCase()).slice(0, 2).join('') || 'AS';

function TagInput({
  label,
  icon: Icon,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof Heart;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const v = raw.trim().replace(/\s+/g, ' ');
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) return setDraft('');
    onChange([...values, v]);
    setDraft('');
  };

  return (
    <div>
      <label className="field-label flex items-center gap-2">
        <Icon className="h-4 w-4 text-camp-pine" /> {label}
      </label>
      <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-camp-bark/25 bg-white/70 p-2 focus-within:ring-4 focus-within:ring-camp-sun/40">
        {values.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-camp-sand px-3 py-1 text-sm font-semibold text-camp-pine-dark">
            {t}
            <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="text-camp-berry">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => add(draft)}
          placeholder={placeholder}
          className="min-w-[160px] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
        />
      </div>
    </div>
  );
}

export default function PlayerProfilePage() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const navigate = useNavigate();

  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [color, setColor] = useState('');
  const [animal, setAnimal] = useState('');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      try {
        const data = await userApi.preferences(user.id);
        if (!active) return;
        setLikes(data.likes ?? []);
        setDislikes(data.dislikes ?? []);
        setAllergies(data.allergies ?? []);
        setColor(data.favoriteColor ?? '');
        setAnimal(data.favoriteAnimal ?? '');
        setWishlist(data.wishlist ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const save = async () => {
    if (likes.length === 0) return toast.warning('Ajoute au moins un « j’aime ».');
    if (!color.trim() || !animal.trim()) return toast.warning('Couleur et animal sont requis.');
    setSaving(true);
    try {
      await userApi.onboard({
        likes,
        dislikes,
        allergies,
        color: color.trim(),
        animal: animal.trim(),
        wishlist: wishlist
          .map((w) => ({ title: w.title.trim(), url: w.url?.trim() || undefined, price: w.price?.trim() || undefined }))
          .filter((w) => w.title),
      });
      await auth?.refresh();
      toast.success('Profil mis à jour.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-sign mb-6 flex items-center gap-4 p-6"
        >
          <MeritBadge label={initials(user?.name)} className="h-16 w-16" />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-black text-camp-pine-dark">{user?.name}</h1>
            <p className="flex items-center gap-1.5 truncate text-sm text-camp-bark">
              <Mail className="h-4 w-4" /> {user?.email}
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-camp-pine" />
          </div>
        ) : (
          <div className="card-sign space-y-5 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-camp-pine-dark">Préférences cadeaux</h2>
            <TagInput label="J’aime" icon={Heart} values={likes} onChange={setLikes} placeholder="Ex : chocolat noir, plein air…" />
            <TagInput label="Je n’aime pas" icon={HeartCrack} values={dislikes} onChange={setDislikes} placeholder="Ex : réglisse…" />
            <TagInput label="Allergies" icon={ShieldAlert} values={allergies} onChange={setAllergies} placeholder="Ex : arachides…" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label flex items-center gap-2">
                  <Palette className="h-4 w-4 text-camp-pine" /> Couleur préférée
                </label>
                <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ex : Bleu pastel" className="field" />
              </div>
              <div>
                <label className="field-label flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-camp-pine" /> Animal préféré
                </label>
                <input value={animal} onChange={(e) => setAnimal(e.target.value)} placeholder="Ex : Renard" className="field" />
              </div>
            </div>

            <div>
              <label className="field-label flex items-center gap-2">
                <Gift className="h-4 w-4 text-camp-pine" /> Liste de souhaits
              </label>
              <p className="mb-2 text-xs text-camp-bark">
                Des idées précises (avec lien et prix) pour aider ton ami secret.
              </p>
              <WishlistEditor items={wishlist} onChange={setWishlist} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={save} disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enregistrer'}
              </button>
              <button onClick={() => navigate('/dashboard')} disabled={saving} className="btn-ghost">
                Retour
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
