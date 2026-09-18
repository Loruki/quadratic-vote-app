import Link from 'next/link';
import { ArrowRight, CalendarDays, Map as MapIcon, PiggyBank, RotateCcw, Rocket } from 'lucide-react';
import { POLL_TEMPLATES } from '@/lib/templates';

const ICONS: Record<string, React.ReactNode> = {
  retro: <RotateCcw className="h-4 w-4" />,
  roadmap: <Rocket className="h-4 w-4" />,
  offsite: <CalendarDays className="h-4 w-4" />,
  budget: <PiggyBank className="h-4 w-4" />,
  trip: <MapIcon className="h-4 w-4" />,
};

/** Jobs people actually search for, one tap from a pre-filled poll. */
export function TemplateGrid({ from }: { from: string }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {POLL_TEMPLATES.map((t) => (
        <li key={t.id}>
          <Link
            href={`/create?template=${t.id}&from=${from}`}
            className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-grad-brand-soft text-primary">
              {ICONS[t.id]}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-semibold">
                {t.name}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{t.blurb}</span>
            </span>
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={`/create?from=${from}`}
          className="flex h-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Start from scratch <ArrowRight className="h-4 w-4" />
        </Link>
      </li>
    </ul>
  );
}
