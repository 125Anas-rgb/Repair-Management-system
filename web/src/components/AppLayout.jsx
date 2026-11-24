import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Logo from './Logo';

const ROLE_LABEL = { SHOP_ADMIN: 'Shop admin', FRONT_DESK: 'Front desk', TECHNICIAN: 'Technician' };

// Which roles see which menu item. Items marked soon are built in later milestones.
const NAV = [
  { to: '/', label: 'Dashboard', roles: ['SHOP_ADMIN', 'FRONT_DESK', 'TECHNICIAN'], end: true },
  { to: '/tickets', label: 'Tickets', roles: ['SHOP_ADMIN', 'FRONT_DESK', 'TECHNICIAN'], soon: true },
  { to: '/staff', label: 'Staff', roles: ['SHOP_ADMIN'], soon: true },
  { to: '/settings', label: 'Shop settings', roles: ['SHOP_ADMIN'], soon: true },
];

export default function AppLayout() {
  const { user, shop, role, logout } = useAuth();
  const items = NAV.filter((n) => n.roles.includes(role));

  return (
    <div className="flex h-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-5 py-4">
          <Logo />
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Shop</p>
          <p className="mt-1 truncate font-medium">{shop?.shopName || 'No shop yet'}</p>
          {shop && <p className="text-xs text-slate-500">{shop.shopCode}</p>}
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) =>
            item.soon ? (
              <span
                key={item.to}
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-400"
              >
                {item.label}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase">Soon</span>
              </span>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-medium">{user?.fullName}</p>
          <p className="text-xs text-slate-500">{ROLE_LABEL[role] || 'No role'}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Logo />
          <button type="button" onClick={logout} className="text-sm text-slate-600">
            Sign out
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
