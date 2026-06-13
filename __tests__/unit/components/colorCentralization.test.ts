import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@/__tests__/helpers/jestCompat';

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const componentsRoot = path.join(repoRoot, 'components');
const hardcodedColorPattern = /#[0-9A-Fa-f]{3,8}|rgba\(/;

function collectComponentSources(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectComponentSources(absolutePath);
    }

    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      return [absolutePath];
    }

    return [];
  });
}

describe('component color centralization', () => {
  it('keeps component colors behind theme tokens', () => {
    const violations = collectComponentSources(componentsRoot).flatMap((filePath) => {
      return fs
        .readFileSync(filePath, 'utf8')
        .split(/\r?\n/)
        .flatMap((line, index) => {
          if (!hardcodedColorPattern.test(line)) return [];

          const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
          return [`${relativePath}:${index + 1}: ${line.trim()}`];
        });
    });

    expect(violations).toEqual([]);
  });
});
