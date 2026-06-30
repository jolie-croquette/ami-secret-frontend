import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { gamesApi } from '@/api/games';
import { giftPhotoApi } from '@/api/giftPhoto';
import type { GameSummary } from '@/api/types';

/**
 * Page cible du share_target PWA.
 * Le service worker intercepte le POST /share-target, stocke l'image dans
 * le cache 'pending-share', puis redirige ici.
 * L'utilisateur choisit la partie et la semaine, puis on uploade.
 */
export default function SharePhoto() {
  const navigate = useNavigate();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [week, setWeek] = useState(1);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        // Récupère l'image depuis le cache du SW
        const cache = await caches.open('pending-share');
        const res = await cache.match('/_pending-share-photo');
        if (res) {
          const b = await res.blob();
          setBlob(b);
          setPreview(URL.createObjectURL(b));
          // Nettoyer le cache après lecture
          await cache.delete('/_pending-share-photo');
        }

        // Charge les parties actives
        const myGames = await gamesApi.myGames();
        const active = myGames.filter((g) => g.status === 'drawn');
        setGames(active);
        if (active.length === 1) setSelectedCode(active[0].code);
      } catch {
        toast.error('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, []);

  const handleUpload = async () => {
    if (!blob || !selectedCode) return;
    setBusy(true);
    try {
      const file = new File([blob], 'photo-partagee.jpg', { type: blob.type || 'image/jpeg' });
      await giftPhotoApi.upload(selectedCode, { week, photo: file, caption: caption || undefined });
      toast.success('Photo partagée avec la partie !');
      navigate(`/lobby/${selectedCode}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-camp-sand">
        <Loader2 className="h-8 w-8 animate-spin text-camp-pine" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-camp-sand p-4">
      <div className="mx-auto max-w-sm">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-1.5 text-sm text-camp-bark hover:text-camp-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <div className="card-sign p-6">
          <h1 className="mb-4 font-display text-xl font-black text-camp-pine-dark">
            Partager une photo
          </h1>

          {preview ? (
            <div className="mb-4 overflow-hidden rounded-xl">
              <img src={preview} alt="Photo à partager" className="aspect-square w-full object-cover" />
            </div>
          ) : (
            <div className="mb-4 flex aspect-square w-full items-center justify-center rounded-xl bg-camp-bark/10">
              <p className="text-sm text-camp-bark/60">Aucune image reçue</p>
            </div>
          )}

          {games.length === 0 ? (
            <p className="text-center text-sm text-camp-bark">
              Tu n'as aucune partie en cours. Rejoins ou crée une partie d'abord.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-camp-ink">Partie</label>
                <select
                  value={selectedCode}
                  onChange={(e) => { setSelectedCode(e.target.value); setWeek(1); }}
                  className="field w-full"
                >
                  <option value="">— Choisir une partie —</option>
                  {games.map((g) => (
                    <option key={g.code} value={g.code}>{g.name}</option>
                  ))}
                </select>
              </div>

              {selectedCode && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-camp-ink">Semaine</label>
                  <select
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="field w-full"
                  >
                    {Array.from(
                      { length: games.find((g) => g.code === selectedCode)?.numberOfWeeks ?? 4 },
                      (_, i) => i + 1
                    ).map((w) => (
                      <option key={w} value={w}>Semaine {w}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-semibold text-camp-ink">
                  Légende <span className="font-normal text-camp-bark/60">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={200}
                  placeholder="Ajouter une légende…"
                  className="field w-full"
                />
              </div>

              <button
                type="button"
                onClick={() => void handleUpload()}
                disabled={busy || !selectedCode || !blob}
                className="btn-primary w-full"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                Partager dans la partie
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
