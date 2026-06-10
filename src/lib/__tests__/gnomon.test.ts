import { describe, expect, it } from 'vitest';
import { cellSizePx, gnomonCells, gridDim } from '../gnomon';

function filled(cells: ReturnType<typeof gnomonCells>) {
  return cells.filter((c) => c.kind === 'filled');
}
function ghosts(cells: ReturnType<typeof gnomonCells>) {
  return cells.filter((c) => c.kind === 'ghost');
}
function key(c: { x: number; y: number }) {
  return `${c.x},${c.y}`;
}

describe('gnomonCells', () => {
  it('renders N² filled cells', () => {
    for (const n of [0, 1, 2, 5, 13, 14]) {
      expect(filled(gnomonCells(n, false))).toHaveLength(n * n);
      expect(filled(gnomonCells(n, true))).toHaveLength(n * n);
    }
  });

  it('renders the gnomon shell of exactly 2N+1 ghost cells when affordable', () => {
    for (const n of [0, 1, 2, 5, 13, 14]) {
      expect(ghosts(gnomonCells(n, true))).toHaveLength(2 * n + 1);
      expect(ghosts(gnomonCells(n, false))).toHaveLength(0);
    }
  });

  it('ghost cells are exactly the cells on the next square’s outer edge', () => {
    const cells = gnomonCells(3, true);
    for (const g of ghosts(cells)) {
      expect(Math.max(g.x, g.y)).toBe(3);
    }
    for (const f of filled(cells)) {
      expect(Math.max(f.x, f.y)).toBeLessThan(3);
    }
  });

  it('has no duplicate coordinates', () => {
    const cells = gnomonCells(14, true);
    expect(new Set(cells.map(key)).size).toBe(cells.length);
  });

  it('keeps filled-cell coordinates stable as votes grow (no remount keys)', () => {
    // Every filled cell at N votes must exist, identically, at N+1 votes —
    // this is what guarantees existing cells never replay their animation.
    for (let n = 0; n < 14; n++) {
      const before = new Set(filled(gnomonCells(n, true)).map(key));
      const after = new Set(filled(gnomonCells(n + 1, true)).map(key));
      for (const k of before) expect(after.has(k)).toBe(true);
    }
  });

  it('the ghost shell at N becomes filled at N+1', () => {
    const ghostKeys = ghosts(gnomonCells(4, true)).map(key);
    const nextFilled = new Set(filled(gnomonCells(5, false)).map(key));
    for (const k of ghostKeys) expect(nextFilled.has(k)).toBe(true);
  });
});

describe('gridDim / cellSizePx', () => {
  it('dim includes the ghost ring only when shown', () => {
    expect(gridDim(3, true)).toBe(4);
    expect(gridDim(3, false)).toBe(3);
    expect(gridDim(0, true)).toBe(1);
    expect(gridDim(0, false)).toBe(0);
  });

  it('holds cells at base size up to 5×5, shrinks beyond', () => {
    expect(cellSizePx(1)).toBe(10);
    expect(cellSizePx(5)).toBe(10);
    expect(cellSizePx(6)).toBe(8);
    expect(cellSizePx(10)).toBe(4);
    expect(cellSizePx(15)).toBe(2); // 14 votes + ghost ring, worst case
  });

  it('always fits inside the slot', () => {
    for (let dim = 1; dim <= 15; dim++) {
      const cell = cellSizePx(dim);
      expect(cell).toBeGreaterThan(0);
      expect(dim * cell + (dim - 1) * 2).toBeLessThanOrEqual(60);
    }
  });
});
