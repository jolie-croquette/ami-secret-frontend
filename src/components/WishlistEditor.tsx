import { Gift, Link as LinkIcon, Tag, Plus, X } from 'lucide-react';
import type { WishlistItem } from '@/api/types';

/** Éditeur de liste de souhaits : lignes (titre / lien / prix) ajoutables/retirables. */
export default function WishlistEditor({
  items,
  onChange,
}: {
  items: WishlistItem[];
  onChange: (next: WishlistItem[]) => void;
}) {
  const update = (i: number, patch: Partial<WishlistItem>) => {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { title: '', url: '', price: '' }]);

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div
          key={i}
          className="rounded-2xl border-2 border-camp-bark/20 bg-white/60 p-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <Gift className="h-4 w-4 shrink-0 text-camp-pine" />
            <input
              className="field !py-1.5 flex-1"
              placeholder="Idée de cadeau (ex : tasse à café)"
              value={it.title}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <button
              type="button"
              className="icon-btn icon-btn-danger !h-8 !w-8"
              title="Retirer"
              onClick={() => removeAt(i)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-camp-bark/40" />
              <input
                className="field !py-1.5 pl-9"
                placeholder="Lien (facultatif)"
                value={it.url ?? ''}
                onChange={(e) => update(i, { url: e.target.value })}
              />
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-camp-bark/40" />
              <input
                className="field !py-1.5 pl-9"
                placeholder="Prix indicatif (ex : ~25 $)"
                value={it.price ?? ''}
                onChange={(e) => update(i, { price: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="btn-ghost !px-4 !py-2 text-sm" onClick={add}>
        <Plus className="h-4 w-4" /> Ajouter une idée
      </button>
    </div>
  );
}
