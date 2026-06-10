'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cellSizePx, gnomonCells, gridDim } from '@/lib/gnomon';

interface Props {
  votes: number;
  /** Render the dashed next-vote shell (only when the voter can afford it). */
  showGhost: boolean;
}

const SLOT = 60;
const GAP = 2;

/**
 * Votes-as-area: N votes render as an N×N square of brand cells — N² cells
 * = N² credits, the literal "quadratic". The affordable next vote shows as
 * a dashed L-shaped shell (the gnomon) of 2N+1 ghost cells: the shell IS
 * the price preview. At 0 votes a single ghost cell invites the first tap.
 *
 * Decorative only — it stays aria-hidden; the option card's text carries
 * the numbers for screen readers.
 *
 * The slot is fixed at 60×60 so cards never change height as votes change
 * (no layout shift under the voter's thumb mid tap-sequence). Cells are
 * keyed by bottom-left-anchored (x,y) coords from gnomonCells, so existing
 * cells never remount — only the new shell springs in on each tap.
 */
export function GnomonGrid({ votes, showGhost }: Props) {
  const dim = gridDim(votes, showGhost);
  const cell = cellSizePx(dim, SLOT, GAP);
  const cells = gnomonCells(votes, showGhost);

  return (
    <div aria-hidden className="flex h-[60px] w-[60px] shrink-0 items-end">
      {dim > 0 && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${dim}, ${cell}px)`,
            gridAutoRows: `${cell}px`,
            gap: GAP,
          }}
        >
          {cells
            .filter((c) => c.kind === 'ghost')
            .map((c) => (
              <span
                key={`g${c.x},${c.y}`}
                className="rounded-[2px] border border-dashed border-primary/40"
                style={{ gridColumn: c.x + 1, gridRow: dim - c.y }}
              />
            ))}
          <AnimatePresence initial={false}>
            {cells
              .filter((c) => c.kind === 'filled')
              .map((c) => (
                <motion.span
                  key={`f${c.x},${c.y}`}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  className="rounded-[2px] bg-grad-brand"
                  style={{ gridColumn: c.x + 1, gridRow: dim - c.y }}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
