import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { readError } from '../lib/api';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(readError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid h-full lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-brand-900 p-12 text-white lg:flex">
        <Logo light />
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">Every repair, from intake to pickup, in one place.</h1>
          <p className="mt-4 max-w-md text-brand-100">
            Create tickets, assign technicians, track progress on web and mobile, and let customers follow their repair with
            a QR code.
          </p>
        </div>
        <p className="text-sm text-brand-100/70">Final Year Project · Device Repair Tracking System</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Staff sign in to manage your shop's repairs.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error.message}
              </div>
            )}
            <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={error?.fields?.email} />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              error={error?.fields?.password}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New repair shop? <span className="font-medium text-slate-400">Shop registration opens in the next milestone.</span>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, name, error, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        {...props}
        className={`mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 ${
          error ? 'border-red-400' : 'border-slate-300 focus:border-brand-500'
        }`}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
