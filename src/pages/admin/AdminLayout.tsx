import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Gamepad2 } from 'lucide-react';

const tabs = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Aperçu' },
  { to: '/admin/users', end: false, icon: Users, label: 'Utilisateurs' },
  { to: '/admin/games', end: false, icon: Gamepad2, label: 'Parties' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="label-hand text-xl -rotate-1">poste de commandement</p>
          <h1 className="font-display text-3xl font-black text-camp-pine-dark">
            Espace administrateur
          </h1>
        </header>

        <nav className="mb-8 flex flex-wrap gap-2">
          {tabs.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  isActive
                    ? 'bg-camp-pine text-camp-cream shadow-sign-sm'
                    : 'border-2 border-camp-bark/15 bg-white/60 text-camp-pine hover:border-camp-pine/40'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
