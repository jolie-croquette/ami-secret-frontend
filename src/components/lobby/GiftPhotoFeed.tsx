import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { giftPhotoApi, type GiftPhoto } from '@/api/giftPhoto';

interface Props {
  photos: GiftPhoto[];
  /** ID de l'utilisateur connecté — pour afficher les contrôles auteur. */
  currentUserId?: string;
  /** Si vrai, affiche le bouton supprimer sur toutes les photos (admin partie ou site). */
  canDeleteAll?: boolean;
  gameCode: string;
  onChanged: () => void;
}

/** Fil des photos de réception de cadeau partagées par les membres de la partie. */
export default function GiftPhotoFeed({ photos, currentUserId, canDeleteAll, gameCode, onChanged }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<GiftPhoto | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const openEdit = (photo: GiftPhoto) => {
    setEditing(photo);
    setEditCaption(photo.caption ?? '');
    setPendingFile(null);
  };

  const handleDelete = async (photo: GiftPhoto) => {
    if (!confirm('Supprimer cette photo ?')) return;
    setBusy(photo._id);
    try {
      await giftPhotoApi.delete(gameCode, photo._id);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setBusy(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setBusy(editing._id);
    try {
      await giftPhotoApi.update(gameCode, editing._id, {
        caption: editCaption,
        ...(pendingFile ? { photo: pendingFile } : {}),
      });
      setEditing(null);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setBusy(null);
    }
  };

  if (photos.length === 0) {
    return (
      <p className="text-sm text-camp-bark/70">
        Aucune photo partagée pour l'instant. Marque un cadeau comme reçu pour proposer la tienne&nbsp;!
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => {
          const name = typeof photo.user === 'string' ? '' : photo.user.name;
          const authorId = typeof photo.user === 'string' ? photo.user : photo.user._id;
          const isAuthor = currentUserId === authorId;
          const showDelete = isAuthor || canDeleteAll;
          const showEdit = isAuthor;
          const isBusy = busy === photo._id;

          return (
            <figure key={photo._id} className="overflow-hidden rounded-2xl border-2 border-camp-bark/15 bg-white/50">
              <div className="relative">
                <img
                  src={photo.imageUrl}
                  alt={`Cadeau reçu par ${name}, semaine ${photo.week}`}
                  className="aspect-square w-full object-cover"
                />
                {(showDelete || showEdit) && (
                  <div className="absolute right-2 top-2 flex gap-1">
                    {showEdit && (
                      <button
                        type="button"
                        onClick={() => openEdit(photo)}
                        disabled={isBusy}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-camp-ink shadow hover:bg-white"
                        aria-label="Modifier la photo"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {showDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(photo)}
                        disabled={isBusy}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-camp-ember shadow hover:bg-white"
                        aria-label="Supprimer la photo"
                      >
                        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <figcaption className="p-2.5">
                <p className="text-xs font-bold text-camp-pine-dark">{name}</p>
                <p className="text-xs text-camp-bark/70">Semaine {photo.week}</p>
                {photo.caption && <p className="mt-1 text-xs text-camp-ink">{photo.caption}</p>}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Modal d'édition — monté dans <body> via portal pour éviter tout overlap */}
      {editing && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-camp-ink/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="card-sign relative z-10 w-full max-w-sm overflow-y-auto max-h-[90dvh] p-6">
            <h2 className="mb-4 font-display text-lg font-black text-camp-pine-dark">Modifier la photo</h2>

            {/* Prévisualisation + remplacement */}
            <div className="mb-4 overflow-hidden rounded-xl">
              <img
                src={pendingFile ? URL.createObjectURL(pendingFile) : editing.imageUrl}
                alt="Aperçu"
                className="aspect-square w-full object-cover"
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingFile(f); }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-ghost mb-4 w-full !py-2 text-sm"
            >
              Remplacer l'image
            </button>

            {/* Légende */}
            <label className="mb-1 block text-sm font-semibold text-camp-ink">Légende</label>
            <input
              type="text"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              maxLength={200}
              placeholder="Ajouter une légende…"
              className="input mb-4 w-full"
            />

            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost flex-1">Annuler</button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={busy === editing._id}
                className="btn-primary flex-1"
              >
                {busy === editing._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
