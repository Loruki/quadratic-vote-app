import { describe, expect, it } from 'vitest';
import { csvCell } from '../backup';

describe('csvCell', () => {
  it('passes plain values through unchanged', () => {
    expect(csvCell('Alice')).toBe('Alice');
    expect(csvCell('https://example.com/x')).toBe('https://example.com/x');
    expect(csvCell('')).toBe('');
  });

  it('quotes values containing commas, quotes, or newlines', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"');
    expect(csvCell('she said "hi"')).toBe('"she said ""hi"""');
  });
});
