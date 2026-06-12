/**
 * Integration tests for lib/adminOperational.ts
 *
 * Strategy:
 *  - Mock `firebaseAuth` so no real Firebase connection is needed.
 *  - Mock global `fetch` so no real HTTP calls are made.
 *  - Verify that each exported function calls the correct endpoint,
 *    HTTP method, and request body.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

// ── Firebase mock ─────────────────────────────────────────────────────────────
vi.mock('@/lib/firebase', () => ({
  firebaseApp: {},
  firebaseAuth: {
    currentUser: {
      getIdToken: async () => 'mock-jwt-token',
    },
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/i18n/language', () => ({
  getCurrentLanguage: () => 'en',
}));

import {
  getAdminDashboardSummary,
  listAdminRecommendations,
  getAdminRecommendationDetail,
  refreshAdminRecommendations,
  updateAdminRecommendationStatus,
  createAdminRecommendationTask,
  createAdminRecommendationNotification,
  createAdminSupplyRequest,
  createAdminResourceSupplyRequest,
  listOperationalContacts,
  createOperationalContact,
  updateOperationalContact,
  updateOperationalContactStatus,
  getAdminResourceSummary,
  getAdminResourceDepartments,
  getAdminResourceStaffing,
  getAdminResourceInventory,
  getAdminResourceInventoryMovements,
  getAdminOperationalRoster,
  updateAdminResourceSummary,
  updateAdminResourceDepartment,
  createAdminResourceDepartment,
  deleteAdminResourceDepartment,
  updateAdminResourceStaffing,
  createAdminResourceStaffing,
  deleteAdminResourceStaffing,
  updateAdminResourceInventory,
  createAdminResourceInventory,
  deleteAdminResourceInventory,
} from '@/lib/adminOperational';

// ── Fetch mock helpers ────────────────────────────────────────────────────────

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function mockFetchEmpty(status = 204) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(null, { status }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Test data ─────────────────────────────────────────────────────────────────

const BASE = 'http://localhost:8080';

const DASHBOARD_SUMMARY = {
  hospitalName: 'HGZ-21',
  municipalityName: 'Iztapalapa',
  stateName: 'CDMX',
  generatedAt: '2026-05-31T00:00:00Z',
  topCards: [],
  alerts: [],
  mapZones: [],
  recommendedActions: [],
};

const RECOMMENDATION = {
  id: 'rec-001',
  hospitalId: 'hosp-01',
  type: 'SUPPLY',
  severity: 'HIGH' as const,
  status: 'NEW' as const,
  category: 'Inventory',
  title: 'Restock antivirals',
  description: 'Low antiviral stock detected.',
  expectedImpact: 'Prevent supply shortage',
  urgencyWindow: '48h',
  confidenceScore: 0.92,
  rationale: ['Influenza A surge'],
  recommendedActions: ['Order 200 units'],
  affectedDepartments: ['Emergency'],
  affectedResources: ['Antiviral-A'],
  createdByMode: 'AI',
  createdAt: '2026-05-31T00:00:00Z',
  updatedAt: '2026-05-31T00:00:00Z',
  auditTrail: [],
  tasks: [],
  notifications: [],
  supplyRequests: [],
};

const RESOURCE_SUMMARY = {
  totalBeds: 200,
  availableBeds: 48,
  icuTotalBeds: 20,
  icuAvailableBeds: 5,
  isolationRoomsTotal: 10,
  isolationRoomsAvailable: 3,
  oxygenCapacityUnits: 500,
  oxygenAvailableUnits: 320,
  doctorsOnShift: 14,
  nursesOnShift: 42,
  specialistsOnShift: 6,
  source: 'MANUAL',
  capturedAt: '2026-05-31T00:00:00Z',
};

const DEPARTMENT = {
  id: 'dept-001',
  departmentCode: 'EMERG',
  departmentName: 'Emergency',
  levelLabel: 'Critical',
  totalBeds: 50,
  occupiedBeds: 42,
  availableBeds: 8,
  status: 'CRITICAL',
  notes: 'High occupancy',
};

const STAFFING_PROFILE = {
  id: 'staff-001',
  roleCode: 'DOCTOR',
  roleName: 'Médico General',
  headcount: 20,
  onShiftCount: 14,
  onCallCount: 3,
  standbyCount: 3,
};

const INVENTORY_ITEM = {
  id: 'inv-001',
  itemCode: 'ANTIVIRAL-A',
  itemName: 'Antiviral A',
  category: 'Medication',
  location: 'Pharmacy',
  currentQuantity: 45,
  capacityQuantity: 200,
  unit: 'vials',
  criticalThreshold: 50,
  targetQuantity: 180,
  status: 'CRITICAL',
};

const CONTACT = {
  id: 'contact-001',
  displayName: 'Dra. Lopez',
  roleLabel: 'Epidemiologia',
  departmentCode: 'EPI',
  contactChannel: 'EMAIL',
  contactValue: 'lopez@example.com',
  availabilityStatus: 'ACTIVE',
  assignable: true,
  notifiable: true,
};

// ── getAdminDashboardSummary ──────────────────────────────────────────────────

describe('getAdminDashboardSummary', () => {
  it('calls GET /admin/dashboard/summary', async () => {
    const spy = mockFetch(DASHBOARD_SUMMARY);
    await getAdminDashboardSummary();
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/dashboard/summary`);
    expect(init?.method).toBeUndefined();
  });

  it('returns the full dashboard payload', async () => {
    mockFetch(DASHBOARD_SUMMARY);
    const result = await getAdminDashboardSummary();
    expect(result.hospitalName).toBe('HGZ-21');
    expect(result.municipalityName).toBe('Iztapalapa');
    expect(result.topCards).toEqual([]);
  });

  it('includes Authorization header', async () => {
    const spy = mockFetch(DASHBOARD_SUMMARY);
    await getAdminDashboardSummary();
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });
});

// ── listAdminRecommendations ──────────────────────────────────────────────────

describe('listAdminRecommendations', () => {
  it('calls GET /admin/recommendations with no params', async () => {
    const spy = mockFetch([RECOMMENDATION]);
    await listAdminRecommendations();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations`);
  });

  it('appends status query param when provided', async () => {
    const spy = mockFetch([RECOMMENDATION]);
    await listAdminRecommendations({ status: 'NEW' });
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations?status=NEW`);
  });

  it('appends severity query param when provided', async () => {
    const spy = mockFetch([RECOMMENDATION]);
    await listAdminRecommendations({ severity: 'HIGH' });
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations?severity=HIGH`);
  });

  it('appends multiple query params when all provided', async () => {
    const spy = mockFetch([RECOMMENDATION]);
    await listAdminRecommendations({ status: 'NEW', severity: 'HIGH', type: 'SUPPLY' });
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toContain('status=NEW');
    expect(url).toContain('severity=HIGH');
    expect(url).toContain('type=SUPPLY');
  });

  it('returns the full recommendation array', async () => {
    mockFetch([RECOMMENDATION]);
    const result = await listAdminRecommendations();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('rec-001');
    expect(result[0].severity).toBe('HIGH');
  });
});

// ── getAdminRecommendationDetail ──────────────────────────────────────────────

describe('getAdminRecommendationDetail', () => {
  it('calls GET /admin/recommendations/:id', async () => {
    const spy = mockFetch(RECOMMENDATION);
    await getAdminRecommendationDetail('rec-001');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations/rec-001`);
  });

  it('returns the recommendation detail', async () => {
    mockFetch(RECOMMENDATION);
    const result = await getAdminRecommendationDetail('rec-001');
    expect(result.title).toBe('Restock antivirals');
    expect(result.confidenceScore).toBe(0.92);
  });
});

// ── refreshAdminRecommendations ───────────────────────────────────────────────

describe('refreshAdminRecommendations', () => {
  it('calls POST /admin/recommendations/refresh', async () => {
    const spy = mockFetch({ generated: 3 });
    await refreshAdminRecommendations();
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations/refresh`);
    expect(init?.method).toBe('POST');
  });

  it('returns the generated count', async () => {
    mockFetch({ generated: 5 });
    const result = await refreshAdminRecommendations();
    expect(result.generated).toBe(5);
  });
});

// ── updateAdminRecommendationStatus ──────────────────────────────────────────

describe('updateAdminRecommendationStatus', () => {
  it('calls PATCH /admin/recommendations/:id/status', async () => {
    const spy = mockFetchEmpty();
    await updateAdminRecommendationStatus('rec-001', 'ACCEPTED');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations/rec-001/status`);
    expect(init?.method).toBe('PATCH');
  });

  it('sends the status in the request body', async () => {
    const spy = mockFetchEmpty();
    await updateAdminRecommendationStatus('rec-001', 'COMPLETED');
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.status).toBe('COMPLETED');
  });
});

// ── createAdminRecommendationTask ─────────────────────────────────────────────

describe('createAdminRecommendationTask', () => {
  const TASK_INPUT = {
    ownerLabel: 'Dra. López',
    departmentLabel: 'Emergency',
    priority: 'HIGH',
    deadlineAt: '2026-06-01T08:00:00Z',
    notes: 'Urgent restocking needed',
  };

  it('calls POST /admin/recommendations/:id/tasks', async () => {
    const spy = mockFetch({ id: 'task-001', ...TASK_INPUT, status: 'PENDING', createdAt: '2026-05-31T00:00:00Z' }, 201);
    await createAdminRecommendationTask('rec-001', TASK_INPUT);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations/rec-001/tasks`);
    expect(init?.method).toBe('POST');
  });

  it('sends task input in the body', async () => {
    const spy = mockFetch({}, 201);
    await createAdminRecommendationTask('rec-001', TASK_INPUT);
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.ownerLabel).toBe('Dra. López');
    expect(parsed.priority).toBe('HIGH');
  });
});

// ── createAdminRecommendationNotification ─────────────────────────────────────

describe('createAdminRecommendationNotification', () => {
  const NOTIF_INPUT = {
    audienceType: 'CONTACT' as const,
    audienceContactId: 'contact-001',
    audienceLabel: 'All Doctors',
    message: 'Critical antiviral shortage.',
  };

  it('calls POST /admin/recommendations/:id/notifications', async () => {
    const spy = mockFetch({ id: 'notif-001', ...NOTIF_INPUT, status: 'SENT', sentAt: null }, 201);
    await createAdminRecommendationNotification('rec-001', NOTIF_INPUT);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations/rec-001/notifications`);
    expect(init?.method).toBe('POST');
  });

  it('sends audience and message in body', async () => {
    const spy = mockFetch({}, 201);
    await createAdminRecommendationNotification('rec-001', NOTIF_INPUT);
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.audienceLabel).toBe('All Doctors');
    expect(parsed.message).toBe('Critical antiviral shortage.');
  });
});

// ── createAdminSupplyRequest ───────────────────────────────────────────────────

describe('createAdminSupplyRequest', () => {
  const SUPPLY_INPUT = {
    supplyTypeLabel: 'Antiviral A',
    quantity: 200,
    unit: 'vials',
    destination: 'Pharmacy',
    suggestedSupplier: 'MedSupply MX',
  };

  it('calls POST /admin/recommendations/:id/supply-requests', async () => {
    const spy = mockFetch({ id: 'supply-001' }, 201);
    await createAdminSupplyRequest('rec-001', SUPPLY_INPUT);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/recommendations/rec-001/supply-requests`);
    expect(init?.method).toBe('POST');
  });

  it('sends the supply input in body', async () => {
    const spy = mockFetch({}, 201);
    await createAdminSupplyRequest('rec-001', SUPPLY_INPUT);
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.quantity).toBe(200);
    expect(parsed.destination).toBe('Pharmacy');
  });
});

describe('createAdminResourceSupplyRequest', () => {
  const SUPPLY_INPUT = {
    supplyTypeLabel: 'Masks',
    quantity: 500,
    unit: 'boxes',
    destination: 'Warehouse',
    priority: 'HIGH',
  };

  it('calls POST /admin/resources/inventory/:itemId/supply-requests', async () => {
    const spy = mockFetch({ id: 'supply-002' }, 201);
    await createAdminResourceSupplyRequest('inv-001', SUPPLY_INPUT);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/inventory/inv-001/supply-requests`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string).quantity).toBe(500);
  });
});

describe('operational contacts', () => {
  const CONTACT_INPUT = {
    displayName: 'Dra. Lopez',
    roleLabel: 'Epidemiologia',
    departmentCode: 'EPI',
    email: 'lopez@example.com',
    assignable: true,
    notifiable: false,
    availabilityStatus: 'ACTIVE' as const,
  };

  it('lists contacts with no filters', async () => {
    const spy = mockFetch([CONTACT]);
    await listOperationalContacts();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/operational-contacts`);
  });

  it('lists contacts with assignable, notifiable and department filters', async () => {
    const spy = mockFetch([CONTACT]);
    await listOperationalContacts({ assignable: true, notifiable: false, departmentCode: 'EPI' });
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toContain('assignable=true');
    expect(url).toContain('notifiable=false');
    expect(url).toContain('departmentCode=EPI');
  });

  it('creates an operational contact', async () => {
    const spy = mockFetch(CONTACT, 201);
    await createOperationalContact(CONTACT_INPUT);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/operational-contacts`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string).email).toBe('lopez@example.com');
  });

  it('updates an operational contact', async () => {
    const spy = mockFetch(CONTACT);
    await updateOperationalContact('contact-001', CONTACT_INPUT);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/operational-contacts/contact-001`);
    expect(init?.method).toBe('PUT');
  });

  it('updates operational contact status', async () => {
    const spy = mockFetch({ ...CONTACT, availabilityStatus: 'INACTIVE' });
    await updateOperationalContactStatus('contact-001', 'INACTIVE');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/operational-contacts/contact-001/status`);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(init?.body as string).status).toBe('INACTIVE');
  });
});

// ── Resource endpoints ────────────────────────────────────────────────────────

describe('getAdminResourceSummary', () => {
  it('calls GET /admin/resources/summary', async () => {
    const spy = mockFetch({ section: 'summary', data: RESOURCE_SUMMARY });
    await getAdminResourceSummary();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/summary`);
  });

  it('returns section and data', async () => {
    mockFetch({ section: 'summary', data: RESOURCE_SUMMARY });
    const result = await getAdminResourceSummary();
    expect(result.section).toBe('summary');
    expect(result.data.totalBeds).toBe(200);
    expect(result.data.availableBeds).toBe(48);
  });
});

describe('getAdminResourceDepartments', () => {
  it('calls GET /admin/resources/departments', async () => {
    const spy = mockFetch({ section: 'departments', data: [DEPARTMENT] });
    await getAdminResourceDepartments();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/departments`);
  });

  it('returns the departments array in data', async () => {
    mockFetch({ section: 'departments', data: [DEPARTMENT] });
    const result = await getAdminResourceDepartments();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].departmentCode).toBe('EMERG');
  });
});

describe('getAdminResourceStaffing', () => {
  it('calls GET /admin/resources/staffing', async () => {
    const spy = mockFetch({ section: 'staffing', data: [STAFFING_PROFILE] });
    await getAdminResourceStaffing();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/staffing`);
  });
});

describe('getAdminResourceInventory', () => {
  it('calls GET /admin/resources/inventory', async () => {
    const spy = mockFetch({ section: 'inventory', data: [INVENTORY_ITEM] });
    await getAdminResourceInventory();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/inventory`);
  });

  it('surfaces critical inventory items', async () => {
    mockFetch({ section: 'inventory', data: [INVENTORY_ITEM] });
    const result = await getAdminResourceInventory();
    expect(result.data[0].status).toBe('CRITICAL');
    expect(result.data[0].currentQuantity).toBeLessThan(result.data[0].criticalThreshold);
  });
});

describe('getAdminResourceInventoryMovements', () => {
  it('calls GET /admin/resources/inventory/:itemId/movements', async () => {
    const spy = mockFetch({ section: 'movements', data: [{ id: 'mov-1', inventoryItemId: 'inv-001' }] });
    await getAdminResourceInventoryMovements('inv-001');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/inventory/inv-001/movements`);
  });
});

describe('getAdminOperationalRoster', () => {
  it('calls GET /admin/resources/operational-roster', async () => {
    const spy = mockFetch({ section: 'roster', data: [] });
    await getAdminOperationalRoster();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/operational-roster`);
  });
});

// ── updateAdminResourceSummary ────────────────────────────────────────────────

describe('updateAdminResourceSummary', () => {
  it('calls PUT /admin/resources/summary', async () => {
    const spy = mockFetch(RESOURCE_SUMMARY);
    await updateAdminResourceSummary(RESOURCE_SUMMARY);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/summary`);
    expect(init?.method).toBe('PUT');
  });

  it('sends the updated summary in body', async () => {
    const spy = mockFetch(RESOURCE_SUMMARY);
    await updateAdminResourceSummary(RESOURCE_SUMMARY);
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.totalBeds).toBe(200);
    expect(parsed.availableBeds).toBe(48);
  });
});

// ── Department CRUD ───────────────────────────────────────────────────────────

describe('updateAdminResourceDepartment', () => {
  it('calls PUT /admin/resources/departments/:id', async () => {
    const spy = mockFetch(DEPARTMENT);
    await updateAdminResourceDepartment('dept-001', DEPARTMENT);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/departments/dept-001`);
    expect(init?.method).toBe('PUT');
  });
});

describe('createAdminResourceDepartment', () => {
  it('calls POST /admin/resources/departments', async () => {
    const { id: _id, availableBeds: _ab, ...input } = DEPARTMENT;
    const spy = mockFetch(DEPARTMENT, 201);
    await createAdminResourceDepartment(input);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/departments`);
    expect(init?.method).toBe('POST');
  });
});

describe('deleteAdminResourceDepartment', () => {
  it('calls DELETE /admin/resources/departments/:id', async () => {
    const spy = mockFetchEmpty();
    await deleteAdminResourceDepartment('dept-001');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/departments/dept-001`);
    expect(init?.method).toBe('DELETE');
  });
});

// ── Staffing CRUD ─────────────────────────────────────────────────────────────

describe('updateAdminResourceStaffing', () => {
  it('calls PUT /admin/resources/staffing/:id', async () => {
    const spy = mockFetch(STAFFING_PROFILE);
    await updateAdminResourceStaffing('staff-001', STAFFING_PROFILE);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/staffing/staff-001`);
    expect(init?.method).toBe('PUT');
  });
});

describe('createAdminResourceStaffing', () => {
  it('calls POST /admin/resources/staffing', async () => {
    const { id: _id, ...input } = STAFFING_PROFILE;
    const spy = mockFetch(STAFFING_PROFILE, 201);
    await createAdminResourceStaffing(input);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/staffing`);
    expect(init?.method).toBe('POST');
  });
});

describe('deleteAdminResourceStaffing', () => {
  it('calls DELETE /admin/resources/staffing/:id', async () => {
    const spy = mockFetchEmpty();
    await deleteAdminResourceStaffing('staff-001');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/staffing/staff-001`);
    expect(init?.method).toBe('DELETE');
  });
});

// ── Inventory CRUD ────────────────────────────────────────────────────────────

describe('updateAdminResourceInventory', () => {
  it('calls PUT /admin/resources/inventory/:id', async () => {
    const spy = mockFetch(INVENTORY_ITEM);
    await updateAdminResourceInventory('inv-001', INVENTORY_ITEM);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/inventory/inv-001`);
    expect(init?.method).toBe('PUT');
  });
});

describe('createAdminResourceInventory', () => {
  it('calls POST /admin/resources/inventory', async () => {
    const { id: _id, ...input } = INVENTORY_ITEM;
    const spy = mockFetch(INVENTORY_ITEM, 201);
    await createAdminResourceInventory(input);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/inventory`);
    expect(init?.method).toBe('POST');
  });

  it('sends item details in body', async () => {
    const { id: _id, ...input } = INVENTORY_ITEM;
    const spy = mockFetch(INVENTORY_ITEM, 201);
    await createAdminResourceInventory(input);
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.itemCode).toBe('ANTIVIRAL-A');
    expect(parsed.criticalThreshold).toBe(50);
  });
});

describe('deleteAdminResourceInventory', () => {
  it('calls DELETE /admin/resources/inventory/:id', async () => {
    const spy = mockFetchEmpty();
    await deleteAdminResourceInventory('inv-001');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/resources/inventory/inv-001`);
    expect(init?.method).toBe('DELETE');
  });
});
