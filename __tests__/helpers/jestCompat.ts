const originalGlobals = new Map<PropertyKey, unknown>();

function stubGlobal(key: PropertyKey, value: unknown) {
  if (!originalGlobals.has(key)) {
    originalGlobals.set(key, globalThis[key as keyof typeof globalThis]);
  }
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
}

function unstubAllGlobals() {
  originalGlobals.forEach((value, key) => {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  });
  originalGlobals.clear();
}

export const vi: any = {
  ...jest,
  fn: jest.fn,
  mock: jest.mock,
  spyOn: jest.spyOn,
  clearAllMocks: jest.clearAllMocks,
  restoreAllMocks: jest.restoreAllMocks,
  stubGlobal,
  unstubAllGlobals,
};

const jestGlobals = globalThis as any;

export const describe = jestGlobals.describe;
export const it = jestGlobals.it;
export const test = jestGlobals.test;
export const expect: any = Object.assign(
  (actual: unknown, _message?: string) => jestGlobals.expect(actual),
  {
    any: jestGlobals.expect.any,
    anything: jestGlobals.expect.anything,
    arrayContaining: jestGlobals.expect.arrayContaining,
    objectContaining: jestGlobals.expect.objectContaining,
    stringContaining: jestGlobals.expect.stringContaining,
    stringMatching: jestGlobals.expect.stringMatching,
    extend: jestGlobals.expect.extend,
    assertions: jestGlobals.expect.assertions,
    hasAssertions: jestGlobals.expect.hasAssertions,
  },
);
export const beforeEach = jestGlobals.beforeEach;
export const afterEach = jestGlobals.afterEach;
export const beforeAll = jestGlobals.beforeAll;
export const afterAll = jestGlobals.afterAll;
