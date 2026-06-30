import { useState } from 'react';
import { X, Download, Trash2, Save, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminApi } from '@/api/admin';
import type { AdminUserRow } from '@/api/types';

interface WishlistItem {
  title: string;
  url?: string;
  price?: string;
}

interface Props {
  user: AdminUserRow;
  onClose: () => void;
  onDeleted: () => void;
}

function TagsInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v) && values.length < 20) {
      onChange([...values, v]);
      setInput('');
    }
  };

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="mb-1 flex flex-wrap gap-1">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-camp-sand px-2 py-0.5 text-xs font-medium text-camp-pine-dark"
          >
            {v}
            <button
              type="button"
              className="text-camp-bark/60 hover:text-camp-ink"
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="field flex-1 text-sm"
          placeholder="Ajouter…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          maxLength={50}
        />
        <button type="button" className="btn-ghost px-3 py-1 text-sm" onClick={add}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function UserPrivacyModal({ user, onClose, onDeleted }: Props) {
  const [tab, setTab] = useState<'prefs' | 'export' | 'delete'>('prefs');

  // Prefs state
  const [likes, setLikes] = useState<string[]>(user.likes ?? []);
  const [dislikes, setDislikes] = useState<string[]>(user.dislikes ?? []);
  const [allergies, setAllergies] = useState<string[]>(user.allergies ?? []);
  const [favoriteColor, setFavoriteColor] = useState(user.favoriteColor ?? '');
  const [favoriteAnimal, setFavoriteAnimal] = useState(user.favoriteAnimal ?? '');
  const [wishlist, setWishlist] = useState<WishlistItem[]>(user.wishlist ?? []);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      await adminApi.updateUser(user._id, {
        likes,
        dislikes,
        allergies,
        favoriteColor: favoriteColor || undefined,
        favoriteAnimal: favoriteAnimal || undefined,
        wishlist,
      });
      toast.success('Préférences mises à jour.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mise à jour impossible.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const data = await adminApi.exportUser(user._id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ami-secret-export-${user.name.replace(/\s+/g, '-')}-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export impossible.');
    } finally {
      setExporting(false);
    }
  };

  const purgeUser = async () => {
    if (deleteConfirm.trim().toLowerCase() !== 'supprimer') {
      toast.warning('Tapez « supprimer » pour confirmer.');
      return;
    }
    setDeleting(true);
    try {
      await adminApi.deleteUser(user._id);
      toast.success(`${user.name} a été supprimé définitivement.`);
      onDeleted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Suppression impossible.');
      setDeleting(false);
    }
  };

  const updateWishlistItem = (i: number, field: keyof WishlistItem, value: string) => {
    setWishlist((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const removeWishlistItem = (i: number) => {
    setWishlist((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addWishlistItem = () => {
    if (wishlist.length < 20) setWishlist((prev) => [...prev, { title: '' }]);
  };

  const TABS = [
    { key: 'prefs' as const, label: 'Rectification' },
    { key: 'export' as const, label: 'Portabilité' },
    { key: 'delete' as const, label: 'Suppression' },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-camp-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="card-sign relative z-10 flex w-full max-w-lg flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black text-camp-pine-dark">Vie privée — {user.name}</h2>
            <p className="text-xs text-camp-bark/70">Droits Loi 25 / LPRPSP</p>
          </div>
          <button type="button" onClick={onClose} className="text-camp-bark/50 hover:text-camp-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-camp-sand/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
                tab === t.key
                  ? 'bg-white text-camp-pine-dark shadow-sm'
                  : 'text-camp-bark/70 hover:text-camp-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Rectification */}
        {tab === 'prefs' && (
          <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
            <TagsInput label="J'aime" values={likes} onChange={setLikes} />
            <TagsInput label="Je n'aime pas" values={dislikes} onChange={setDislikes} />
            <TagsInput label="Allergies / restrictions" values={allergies} onChange={setAllergies} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Couleur préférée</label>
                <input
                  className="field text-sm"
                  value={favoriteColor}
                  onChange={(e) => setFavoriteColor(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="field-label">Animal préféré</label>
                <input
                  className="field text-sm"
                  value={favoriteAnimal}
                  onChange={(e) => setFavoriteAnimal(e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="field-label mb-0">Liste de souhaits</label>
                {wishlist.length < 20 && (
                  <button type="button" className="text-xs text-camp-pine underline" onClick={addWishlistItem}>
                    + Ajouter
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {wishlist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-camp-sand/30 p-2">
                    <div className="flex-1 space-y-1">
                      <input
                        className="field text-sm"
                        placeholder="Titre *"
                        value={item.title}
                        onChange={(e) => updateWishlistItem(i, 'title', e.target.value)}
                        maxLength={200}
                      />
                      <input
                        className="field text-sm"
                        placeholder="URL (optionnel)"
                        value={item.url ?? ''}
                        onChange={(e) => updateWishlistItem(i, 'url', e.target.value)}
                      />
                      <input
                        className="field text-sm"
                        placeholder="Prix (optionnel)"
                        value={item.price ?? ''}
                        onChange={(e) => updateWishlistItem(i, 'price', e.target.value)}
                        maxLength={50}
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-camp-bark/50 hover:text-camp-berry"
                      onClick={() => removeWishlistItem(i)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {wishlist.length === 0 && (
                  <p className="text-xs text-camp-bark/60">Aucun souhait enregistré.</p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => void savePrefs()}
              disabled={savingPrefs}
            >
              {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer les préférences
            </button>
          </div>
        )}

        {/* Portabilité */}
        {tab === 'export' && (
          <div className="space-y-4">
            <p className="text-sm text-camp-bark">
              Génère un fichier JSON contenant toutes les données personnelles de{' '}
              <strong>{user.name}</strong> : profil, parties, messages, notifications et photos.
            </p>
            <p className="text-xs text-camp-bark/60">
              Les mots de passe et jetons de réinitialisation sont exclus de l'export.
            </p>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => void exportData()}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Télécharger les données (JSON)
            </button>
          </div>
        )}

        {/* Suppression */}
        {tab === 'delete' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-camp-berry/30 bg-camp-berry/10 p-3 text-sm text-camp-berry">
              <strong>Action irréversible.</strong> Supprime le compte, les messages, les notifications,
              les abonnements push et les photos. Retire également l'utilisateur de toutes les parties.
            </div>
            <div>
              <label className="field-label">
                Tapez <strong>supprimer</strong> pour confirmer
              </label>
              <input
                className="field border-camp-berry/50"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="supprimer"
              />
            </div>
            <button
              type="button"
              className="btn-danger w-full"
              onClick={() => void purgeUser()}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Supprimer toutes les données
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
