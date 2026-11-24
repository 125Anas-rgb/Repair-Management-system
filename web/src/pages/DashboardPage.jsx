import { useAuth } from '../auth/AuthContext';

const ROLE_LABEL = { SHOP_ADMIN: 'Shop admin', FRONT_DESK: 'Front desk', TECHNICIAN: 'Technician' };

export default function DashboardPage() {
  const { user, shop, role } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-slate-500">Welcome back</p>
      <h1 className="text-2xl font-semibold">{user?.fullName}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card label="Shop" value={shop?.shopName || 'Not set'} hint={shop?.shopCode} />
        <Card label="Your role" value={ROLE_LABEL[role] || 'None'} hint={user?.email} />
        <Card label="Shop status" value={shop?.shopStatus ? shop.shopStatus.replace(/_/g, ' ').toLowerCase() : '—'} />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-medium">Ticket counts, workload and recent repairs will appear here.</p>
        <p className="mt-1 text-sm text-slate-500">Ticket intake arrives in milestone 3 (1 to 3 Dec).</p>
      </div>
    </div>
  );
}

function Card({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold capitalize">{value}</p>
      {hint && <p className="mt-0.5 truncate text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
