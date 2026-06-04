import Link from 'next/link';

export function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const label = size === 'lg' ? 'text-xl' : 'text-base';
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 font-semibold tracking-tight"
      aria-label="Quadratic Vote — home"
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-grad-brand text-primary-foreground shadow-soft transition-transform group-hover:rotate-6"
        aria-hidden
      >
        {/* Natural <sup> keeps the ² in the text flow — the old absolute
            positioning clipped it against the rounded square and read as
            broken. */}
        <span className="font-mono text-[15px] font-bold leading-none">
          Q<sup className="text-[0.6em] font-semibold">2</sup>
        </span>
      </span>
      {/* Hide the wordmark text on the narrowest screens so the mobile nav
          (Explore + Create) has room without overflowing. */}
      <span className={`hidden min-[380px]:inline ${label}`}>Quadratic Vote</span>
    </Link>
  );
}
