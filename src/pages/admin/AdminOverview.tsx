import { useEffect, useState, type ComponentType } from 'react';
import { adminApi } from '@/api/admin';
import type { AdminStats } from '@/api/types';
import { CampLoader } from '@/components/CampLoader';
import { toast } from 'react-toastify';
import {
  Users,
  ShieldCheck,
  Ban,
  ClipboardCheck,
  Gamepad2,
  Hourglass,
  Shuffle,
  Sparkles,
  Bell,
  BellRing,
} from 'lucide-react';

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="card-sign flex items-center gap-4 p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-camp-sand text-camp-pine">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-display text-3xl font-black leading-none text-camp-pine-dark">{value}</p>
        <p className="mt-1 text-sm font-semibold text-camp-bark">{label}</p>
      </div>
    </div>
  );
}

interface Segment {
  label: string;
  value: number;
  /** Couleur Tailwind via currentColor (classe text-*). */
  colorClass: string;
}

/** Donut multi-segments (SVG) avec total au centre. */
function Donut({ segments, total }: { segments: Segment[]; total: number }) {
  const size = 156;
  const stroke = 20;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;

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
          className="text-camp-sand/70"
        />
        {total > 0 &&
          segments.map((s) => {
            const frac = s.value / total;
            const dash = frac * c;
            const seg = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-acc}
                className={`${s.colorClass} transition-all duration-700 ease-out`}
              />
            );
            acc += dash;
            return seg;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-black leading-none text-camp-pine-dark">{total}</span>
        <span className="mt-0.5 text-xs font-semibold text-camp-bark">total</span>
      </div>
    </div>
  );
}

/** Légende d'un donut. */
function Legend({ segments, total }: { segments: Segment[]; total: number }) {
  return (
    <ul className="flex-1 space-y-2">
      {segments.map((s) => {
        const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
        return (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className={`h-3 w-3 shrink-0 rounded-full bg-current ${s.colorClass}`} />
            <span className="flex-1 text-camp-bark">{s.label}</span>
            <span className="font-bold text-camp-pine-dark">{s.value}</span>
            <span className="w-10 text-right text-xs text-camp-bark/70">{pct}%</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Barre horizontale simple (valeur / total). */
function Bar({ label, value, total, colorClass }: Segment & { total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-camp-bark">{label}</span>
        <span className="font-bold text-camp-pine-dark">
          {value}
          <span className="ml-1 text-xs font-semibold text-camp-bark/70">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-camp-sand/70">
        <div
          className={`h-full rounded-full bg-current transition-[width] duration-700 ease-out ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        setStats(await adminApi.stats());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur lors du chargement des statistiques.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <CampLoader />;
  if (!stats) return <p className="text-camp-bark">Statistiques indisponibles.</p>;

  const gameSegments: Segment[] = [
    { label: 'En attente (lobby)', value: stats.games.lobby, colorClass: 'text-camp-sun' },
    { label: 'Tirées', value: stats.games.drawn, colorClass: 'text-camp-pine' },
    { label: 'Révélées', value: stats.games.revealed, colorClass: 'text-camp-ember' },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-xl font-black text-camp-pine-dark">Utilisateurs</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Comptes" value={stats.users.total} />
          <StatCard icon={ShieldCheck} label="Administrateurs" value={stats.users.admins} />
          <StatCard icon={ClipboardCheck} label="Profils complétés" value={stats.users.onboarded} />
          <StatCard icon={Ban} label="Bannis" value={stats.users.banned} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-black text-camp-pine-dark">Parties</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Gamepad2} label="Total" value={stats.games.total} />
          <StatCard icon={Hourglass} label="En attente (lobby)" value={stats.games.lobby} />
          <StatCard icon={Shuffle} label="Tirées" value={stats.games.drawn} />
          <StatCard icon={Sparkles} label="Révélées" value={stats.games.revealed} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-black text-camp-pine-dark">Notifications</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard icon={Bell} label="Total" value={stats.notifications.total} />
          <StatCard icon={BellRing} label="Non lues" value={stats.notifications.unread} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-black text-camp-pine-dark">Répartition</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Parties par statut */}
          <div className="card-sign p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-camp-pine-dark">Parties par statut</h3>
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <Donut total={stats.games.total} segments={gameSegments} />
              <Legend total={stats.games.total} segments={gameSegments} />
            </div>
          </div>

          {/* Composition des comptes */}
          <div className="card-sign p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-camp-pine-dark">Comptes</h3>
            <div className="space-y-3">
              <Bar
                label="Profils complétés"
                value={stats.users.onboarded}
                total={stats.users.total}
                colorClass="text-camp-pine"
              />
              <Bar
                label="Administrateurs"
                value={stats.users.admins}
                total={stats.users.total}
                colorClass="text-camp-lake"
              />
              <Bar
                label="Bannis"
                value={stats.users.banned}
                total={stats.users.total}
                colorClass="text-camp-berry"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
