import type { GiftPhoto } from '@/api/giftPhoto';

/** Fil des photos de réception de cadeau partagées par les membres de la partie. */
export default function GiftPhotoFeed({ photos }: { photos: GiftPhoto[] }) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-camp-bark/70">
        Aucune photo partagée pour l’instant. Marque un cadeau comme reçu pour proposer la tienne&nbsp;!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => {
        const name = typeof photo.user === 'string' ? '' : photo.user.name;
        return (
          <figure key={photo._id} className="overflow-hidden rounded-2xl border-2 border-camp-bark/15 bg-white/50">
            <img src={photo.imageUrl} alt={`Cadeau reçu par ${name}, semaine ${photo.week}`} className="aspect-square w-full object-cover" />
            <figcaption className="p-2.5">
              <p className="text-xs font-bold text-camp-pine-dark">{name}</p>
              <p className="text-xs text-camp-bark/70">Semaine {photo.week}</p>
              {photo.caption && <p className="mt-1 text-xs text-camp-ink">{photo.caption}</p>}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
