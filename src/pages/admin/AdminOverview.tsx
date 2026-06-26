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
    </div>
  );
}
