import { describe, expect, it } from '@/__tests__/helpers/jestCompat';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '..', '..', '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), 'utf-8');
}

describe('system admin route gates', () => {
  const systemRoutes = [
    'app/system/dashboard.tsx',
    'app/system/users.tsx',
    'app/system/hospitals.tsx',
  ];

  it('require the system admin role and system admin privilege', () => {
    for (const route of systemRoutes) {
      const source = readSource(route);
      expect(source, `${route} must require SYSTEM_ADMIN`).toContain("roles={['SYSTEM_ADMIN']}");
      expect(source, `${route} must require isSystemAdmin`).toContain("privileges={['isSystemAdmin']}");
      expect(source, `${route} must not be hospital-admin scoped`).not.toContain("roles={['HOSPITAL_ADMIN']}");
    }
  });
});

describe('hospital admin route gates', () => {
  const hospitalAdminRoutes = [
    'app/admin/analytics.tsx',
    'app/admin/resources.tsx',
    'app/admin/recommendations.tsx',
    'app/admin/users.tsx',
    'app/dashboard/[role].tsx',
  ];

  it('keep hospital operations scoped to hospital admins', () => {
    for (const route of hospitalAdminRoutes) {
      const source = readSource(route);
      expect(source, `${route} must require HOSPITAL_ADMIN`).toContain("roles={['HOSPITAL_ADMIN']}");
      expect(source, `${route} must not use system-admin privilege`).not.toContain("privileges={['isSystemAdmin']}");
    }
  });
});

