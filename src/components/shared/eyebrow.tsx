import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  /** Optional leading icon — pass a Lucide icon at h-3 w-3 sizing. */
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Small uppercase "eyebrow" / kicker pill used above section headings.
 *
 * Consolidates 9 inline copies of:
 *   inline-flex items-center gap-1.5 rounded-full bg-grad-brand-soft px-2.5
 *   py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary
 */
export function Eyebrow({ children, icon, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-grad-brand-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
