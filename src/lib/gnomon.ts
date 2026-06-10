/**
 * Cell geometry for the gnomon grid — the option card's votes-as-area
 * visualization. N votes render as an N×N square of filled cells (N² cells
 * = N² credits, the literal "quadratic"), and the affordable next vote
 * renders as the L-shaped shell — the gnomon — of exactly 2N+1 ghost cells
 * around it, which is `nextVoteCost` made visible.
 *
 * Coordinates are math-style: (0,0) is the bottom-left corner, x grows
 * right, y grows up. They are stable as N changes — cell (0,0) is always
 * the original first vote — which is what lets React keys stay stable so
 * existing cells never remount or replay their enter animation.
 */

export interface GnomonCell {
  x: number;
  y: number;
  kind: 'filled' | 'ghost';
}

/** Cells per side of the rendered grid, including the ghost ring. */
export function gridDim(votes: number, showGhost: boolean): number {
  return votes + (showGhost ? 1 : 0);
}

export function gnomonCells(votes: number, showGhost: boolean): GnomonCell[] {
  const cells: GnomonCell[] = [];
  for (let y = 0; y < votes; y++) {
    for (let x = 0; x < votes; x++) {
      cells.push({ x, y, kind: 'filled' });
    }
  }
  if (showGhost) {
    // Top edge of the next square (left to right), then its right edge
    // (bottom to top): together the L-shaped shell of 2N+1 cells.
    for (let x = 0; x <= votes; x++) cells.push({ x, y: votes, kind: 'ghost' });
    for (let y = 0; y < votes; y++) cells.push({ x: votes, y, kind: 'ghost' });
  }
  return cells;
}

/**
 * Cell size in px for a grid of `dim` cells per side inside a fixed slot.
 * Cells hold at `basePx` up to 5×5 so the square's *area* visibly grows
 * with votes (a flexible cell size would make every count fill the slot
 * and kill the metaphor); past 5×5 they shrink to keep fitting the slot.
 */
export function cellSizePx(dim: number, slotPx = 60, gapPx = 2, basePx = 10): number {
  if (dim <= 0) return basePx;
  return Math.min(basePx, Math.floor((slotPx - (dim - 1) * gapPx) / dim));
}
