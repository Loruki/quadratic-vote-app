import Link from 'next/link';

export function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'text-xl' : 'text-base';
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 font-semibold tracking-tight"
      aria-label="Quadratic Vote — home"
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-lg bg-grad-brand text-primary-foreground shadow-soft transition-transform group-hover:rotate-6`}
        aria-hidden
      >
        <span className={`relative font-mono text-[13px] font-bold leading-none`}>
          Q<sup className="absolute -top-1 -right-1.5 text-[9px]">2</sup>
        </span>
      </span>
      <span className={dim}>Quadratic Vote</span>
    </Link>
  );
}
