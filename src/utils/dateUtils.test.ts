import { describe, it, expect } from 'vitest';
import { formatDateToChinese } from './dateUtils';

describe('formatDateToChinese', () => {
  it('formats a valid ISO-8601 string to Chinese format', () => {
    const result = formatDateToChinese('2026-04-12T00:00:00Z');
    expect(result).toBe('2026年4月12日');
  });

  it('handles invalid date strings by returning the original string', () => {
    const result = formatDateToChinese('invalid-date');
    expect(result).toBe('invalid-date');
  });

  it('formats another valid date correctly', () => {
    const result = formatDateToChinese('2023-11-05T15:30:00Z');
    expect(result).toBe('2023年11月5日');
  });
});
