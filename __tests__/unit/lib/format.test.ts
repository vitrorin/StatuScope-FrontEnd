import { describe, it, expect } from '@/__tests__/helpers/jestCompat';
import { initialsFromName } from '@/lib/format';

describe('initialsFromName', () => {
  it('returns ?? for null', () => {
    expect(initialsFromName(null)).toBe('??');
  });

  it('returns ?? for undefined', () => {
    expect(initialsFromName(undefined)).toBe('??');
  });

  it('returns ?? for empty string', () => {
    expect(initialsFromName('')).toBe('??');
  });

  it('returns ?? for whitespace-only string', () => {
    expect(initialsFromName('   ')).toBe('??');
  });

  it('returns first two chars uppercased for single word', () => {
    expect(initialsFromName('ana')).toBe('AN');
  });

  it('returns single char for a single-char name', () => {
    expect(initialsFromName('X')).toBe('X');
  });

  it('returns first + last initials for two-word name', () => {
    expect(initialsFromName('Ana Lopez')).toBe('AL');
  });

  it('returns first + last initials for multi-word name (Dr. prefix)', () => {
    expect(initialsFromName('Dra. Ana Lopez')).toBe('DL');
  });

  it('uses first and last word for three-word name', () => {
    expect(initialsFromName('Juan Carlos Rivera')).toBe('JR');
  });

  it('trims leading/trailing whitespace', () => {
    expect(initialsFromName('  Ana Lopez  ')).toBe('AL');
  });

  it('handles multiple internal spaces', () => {
    expect(initialsFromName('Ana  Lopez')).toBe('AL');
  });

  it('returns uppercase', () => {
    expect(initialsFromName('pedro garcia')).toBe('PG');
  });
});
