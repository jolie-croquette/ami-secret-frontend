import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { Bouncy } from 'ldrs/react';
import 'ldrs/react/Bouncy.css';

// ───────────────────────────────── Types
interface Preferences {
  likes: string[];
  dislikes: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  allergies: string[];
  bio?: string;
}

// ───────────────────────────────── Helpers
const GRADS = [
  'from-emerald-400 to-green-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
  'from-teal-400 to-cyan-600',
];
const hashIdx = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % GRADS.length;
};
const initials = (name?: string) =>
  (name || '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || '🙂';

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Chip input for lists (likes, dislikes, allergies)
function TagInput({
  label,
  values,
  onChange,
  placeholder,
  maxItems = 50,
  maxLen = 48,
}: {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  maxLen?: number;
}) {
  const [draft, setDraft] = useState('');

  const add = useCallback((raw: string) => {
    let v = raw.trim();
    if (!v) return;
    if (v.length > maxLen) v = v.slice(0, maxLen);
    if (values.includes(v)) return;
    if (values.length >= maxItems) return toast.warning(`Maximum ${maxItems} éléments`);
    onChange([...values, v]);
    setDraft('');
  }, [values, onChange, maxItems, maxLen]);

  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-green-900 mb-2">{label}</label>
      <div className="rounded-xl border border-yellow-200 bg-white p-2 flex flex-wrap gap-2">
        {values.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-green-50 text-green-800 border border-green-200">
            {t}
            <button type="button" onClick={() => remove(i)} className="text-green-700/70 hover:text-green-900">×</button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={placeholder || 'Appuie sur Entrée pour ajouter'}
          className="flex-1 min-w-[160px] px-2 py-1 outline-none text-sm"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">Entrée pour ajouter · {maxLen} caractères max</p>
    </div>
  );
}

// ───────────────────────────────── Page
export default function PlayerProfilePage() {
  const { user, logout } = useContext(AuthContext) ?? ({} as any);
  const navigate = useNavigate();

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL as string, []);
  const meId = String(user?._id ?? user?.id ?? user?.userId ?? '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [prefs, setPrefs] = useState<Preferences>({ likes: [], dislikes: [], allergies: [], favoriteColor: '', favoriteAnimal: '', bio: '' });

  const [grad, setGrad] = useState(GRADS[0]);

  const ensureAuth = useCallback(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      toast.error('Session expirée. Connecte-toi à nouveau.');
      logout?.();
      navigate('/login');
      return null;
    }
    return t;
  }, [logout, navigate]);

  // Load profile + preferences
  useEffect(() => {
    if (!meId) return;
    setGrad(GRADS[hashIdx(meId + name)]);

    const run = async () => {
      const token = ensureAuth();
      if (!token) return;
      try {
        setLoading(true);
        // Preferences
        const res = await fetch(`${apiUrl}/user/preferences/${meId}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || 'Impossible de charger le profil');
        const data = json.data.user || {};
        setPrefs({
          likes: Array.isArray(data.likes) ? data.likes : [],
          dislikes: Array.isArray(data.dislikes) ? data.dislikes : [],
          allergies: Array.isArray(data.allergies) ? data.allergies : [],
          favoriteColor: data.favoriteColor || '',
          favoriteAnimal: data.favoriteAnimal || '',
        });
        // Optionnel: si tu exposes un /user/me, tu peux rafraîchir name/email ici
      } catch (e: any) {
        toast.error(e?.message || 'Erreur de chargement du profil');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [apiUrl, ensureAuth, meId, name]);

  const saveAll = async () => {
    if (!name.trim()) return toast.warning('Le nom est requis.');
    if (!emailValid(email)) return toast.warning('Adresse courriel invalide.');

    const token = ensureAuth();
    if (!token) return;

    setSaving(true);
    try {
      // 1) Mettre à jour le compte (nom/courriel)
      const res1 = await fetch(`${apiUrl}/user/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const j1 = await res1.json().catch(() => ({}));
      if (!res1.ok) throw new Error(j1?.message || 'Impossible de mettre à jour le compte');

      // 2) Mettre à jour les préférences
      const res2 = await fetch(`${apiUrl}/user/preferences/${meId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          likes: prefs.likes,
          dislikes: prefs.dislikes,
          favoriteColor: prefs.favoriteColor || undefined,
          favoriteAnimal: prefs.favoriteAnimal || undefined,
          allergies: prefs.allergies,
          bio: prefs.bio || undefined,
        }),
      });
      const j2 = await res2.json().catch(() => ({}));
      if (!res2.ok) throw new Error(j2?.message || 'Impossible de mettre à jour les préférences');

      // Met à jour le contexte si possible
      try {
        if ((user as any) && 'name' in (user as any)) (user as any).name = name.trim();
        if ((user as any) && 'email' in (user as any)) (user as any).email = email.trim();
        (AuthContext as any)?.setUser?.({ ...(user as any), name: name.trim(), email: email.trim() });
      } catch {}

      toast.success('Profil mis à jour ✨');
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const gradCls = `bg-gradient-to-br ${grad}`;

  return (
    <div className="bg-yellow-50 min-h-screen py-16 px-4">
      {loading ? (
        <div className="min-h-[60vh] grid place-items-center">
          <div className="flex items-center gap-3 text-green-800">
            <Bouncy size="56" speed="1.4" color="green" />
            <span className="font-semibold">Chargement du profil…</span>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full ${gradCls} text-white grid place-items-center text-base font-bold`}>
                {initials(name)}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold text-green-800 truncate">Mon profil</h1>
                <p className="text-sm text-gray-600 truncate">Gère ton compte et tes préférences cadeaux</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="mt-6 grid gap-6">
            {/* Compte */}
            <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-6">
              <h2 className="text-lg font-bold text-green-800 mb-4">Compte</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-900 mb-2">Nom</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ton nom"
                    className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-900 mb-2">Courriel</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    type="email"
                    className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Préférences */}
            <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-6">
              <h2 className="text-lg font-bold text-green-800 mb-4">Préférences cadeaux</h2>

              <div className="grid gap-6">
                <TagInput
                  label="Aime"
                  values={prefs.likes}
                  onChange={(v) => setPrefs((p) => ({ ...p, likes: v }))}
                  placeholder="Ex: chocolat noir, lego, café"
                />
                <TagInput
                  label="N’aime pas"
                  values={prefs.dislikes}
                  onChange={(v) => setPrefs((p) => ({ ...p, dislikes: v }))}
                  placeholder="Ex: parfum fort, noix de coco"
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-2">Couleur préférée</label>
                    <input
                      value={prefs.favoriteColor || ''}
                      onChange={(e) => setPrefs((p) => ({ ...p, favoriteColor: e.target.value }))}
                      placeholder="Ex: Vert forêt"
                      className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-2">Animal préféré</label>
                    <input
                      value={prefs.favoriteAnimal || ''}
                      onChange={(e) => setPrefs((p) => ({ ...p, favoriteAnimal: e.target.value }))}
                      placeholder="Ex: Loutre"
                      className="w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm"
                    />
                  </div>
                </div>

                <TagInput
                  label="Allergies"
                  values={prefs.allergies}
                  onChange={(v) => setPrefs((p) => ({ ...p, allergies: v }))}
                  placeholder="Ex: arachides, pollen"
                />

                <div>
                  <label className="block text-sm font-semibold text-green-900 mb-2">À propos (bio)</label>
                  <textarea
                    value={prefs.bio || ''}
                    onChange={(e) => setPrefs((p) => ({ ...p, bio: e.target.value.slice(0, 500) }))}
                    placeholder="Quelques infos utiles pour ton ami(e) secret(e)…"
                    className="w-full px-4 py-2 rounded-xl border border-yellow-300 focus:ring-2 focus:ring-green-400 shadow-sm min-h-[110px]"
                  />
                  <p className="mt-1 text-xs text-gray-500">500 caractères max</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => navigate(-1)}
                disabled={saving}
                className="px-4 py-2 rounded-full bg-white border hover:bg-gray-50 text-gray-800 font-semibold disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                onClick={saveAll}
                disabled={saving}
                className={
                  'px-5 py-2 rounded-full font-bold shadow ' +
                  (saving ? 'bg-green-300 text-white cursor-wait' : 'bg-green-600 hover:bg-green-700 text-white')
                }
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </div>
  );
}
