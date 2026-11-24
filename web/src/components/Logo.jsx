export default function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-brand-600" />
        <path d="M9 22l7-12 7 12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`text-lg font-semibold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>RepairTrack</span>
    </div>
  );
}
