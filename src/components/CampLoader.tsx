import { Campfire } from '@/components/visuals/CampVisuals';

/** Écran de chargement plein écran, thématisé feu de camp. */
export function CampLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-camp-cream bg-topo">
      <Campfire className="w-24 h-24" title="Chargement" />
      <p className="font-hand text-2xl text-camp-ember-dark animate-float">{label}</p>
    </div>
  );
}

export default CampLoader;
