import { NavLink, Outlet } from 'react-router-dom';
import RestTimer from './RestTimer';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/registrar', label: 'Registrar Treino', icon: '📝' },
  { to: '/treinos', label: 'Treinos Salvos', icon: '📚' },
  { to: '/montar', label: 'Montar Treino', icon: '🧩' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-card-border bg-card/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="text-xl">⚡</span>
          <span className="font-display text-lg font-semibold">ForgeFit</span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-accent/20 to-accent-2/10 text-ink border border-accent/30'
                    : 'text-ink-dim hover:bg-white/5 hover:text-ink'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-6 py-6 text-xs text-ink-dim">
          Seus dados, salvos com segurança no seu próprio servidor.
        </div>
      </aside>

      <main className="ml-64 flex-1 px-8 py-8 md:px-12">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>

      <RestTimer />
    </div>
  );
}
