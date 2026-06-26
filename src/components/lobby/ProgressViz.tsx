import type { GameProgress } from '@/api/types';
import { Gift, Users } from 'lucide-react';

/** Anneau de complétion (donut SVG) — part reçue sur le total attendu. */
function CompletionRing({ pct }: { pct: number }) {
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-camp-sand"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-camp-pine transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-black leading-none text-camp-pine-dark">
          {Math.round(clamped)}%
        </span>
        <span className="mt-0.5 text-xs font-semibold text-camp-bark">reçus</span>
      </div>
    </div>
  );
}

/** Barre de progression d'un membre (cadeaux reçus / total). */
function MemberBar({ name, received, total }: { name: string; received: number; total: number }) {
  const pct = total > 0 ? Math.round((received / total) * 100) : 0;
  const complete = total > 0 && received >= total;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-semibold text-camp-ink">{name}</span>
        <span className="shrink-0 text-xs font-bold text-camp-bark">
          {received}/{total}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-camp-sand/70">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${
            complete ? 'bg-camp-ember' : 'bg-camp-pine'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Visualisation de la progression des cadeaux reçus pour l'organisateur. */
export default function ProgressViz({ progress }: { progress: GameProgress }) {
  const { numberOfWeeks, members } = progress;
  const expected = members.length * numberOfWeeks;
  const received = members.reduce((sum, m) => sum + m.receivedCount, 0);
  const pct = expected > 0 ? (received / expected) * 100 : 0;
  const fullyServed = members.filter((m) => m.receivedCount >= numberOfWeeks).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-camp-sand/30 p-4 sm:flex-row sm:items-center">
        <CompletionRing pct={pct} />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-camp-bark">
            <Gift className="h-4 w-4 text-camp-pine" />
            <span>
              <strong className="text-camp-pine-dark">{received}</strong> cadeaux reçus sur{' '}
              <strong className="text-camp-pine-dark">{expected}</strong> attendus
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-camp-bark">
            <Users className="h-4 w-4 text-camp-pine" />
            <span>
              <strong className="text-camp-pine-dark">{fullyServed}</strong>/{members.length}{' '}
              participant{members.length > 1 ? 's' : ''} au complet
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <MemberBar
            key={m.user._id}
            name={m.user.name}
            received={m.receivedCount}
            total={numberOfWeeks}
          />
        ))}
        {members.length === 0 && (
          <p className="text-sm text-camp-bark">Aucun participant.</p>
        )}
      </div>
    </div>
  );
}
