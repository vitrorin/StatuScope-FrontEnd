export type AdminRecommendationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AdminRecommendationStatus = 'NEW' | 'ACCEPTED' | 'ASSIGNED' | 'COMPLETED' | 'REJECTED';

const generatedAt = '2026-06-10T12:00:00.000Z';

const summary = {
  totalBeds: 180,
  availableBeds: 42,
  icuTotalBeds: 28,
  icuAvailableBeds: 7,
  isolationRoomsTotal: 18,
  isolationRoomsAvailable: 5,
  oxygenCapacityUnits: 120,
  oxygenAvailableUnits: 86,
  doctorsOnShift: 34,
  nursesOnShift: 78,
  specialistsOnShift: 12,
  source: 'storybook-mock',
  capturedAt: generatedAt,
};

const departments = [
  { id: 'dept-er', departmentCode: 'ER', departmentName: 'Emergency', levelLabel: 'Critical care', totalBeds: 38, occupiedBeds: 31, availableBeds: 7, status: 'WARNING', notes: 'Respiratory triage lane active.' },
  { id: 'dept-icu', departmentCode: 'ICU', departmentName: 'Intensive Care', levelLabel: 'High complexity', totalBeds: 28, occupiedBeds: 21, availableBeds: 7, status: 'STABLE', notes: 'Two ventilators reserved.' },
  { id: 'dept-ped', departmentCode: 'PED', departmentName: 'Pediatrics', levelLabel: 'General', totalBeds: 24, occupiedBeds: 14, availableBeds: 10, status: 'STABLE', notes: 'Staffing normal.' },
];

const staffing = [
  { id: 'staff-doctor', roleCode: 'doctor', roleName: 'Doctors', headcount: 64, onShiftCount: 34, onCallCount: 12, standbyCount: 8 },
  { id: 'staff-nurse', roleCode: 'nurse', roleName: 'Nurses', headcount: 130, onShiftCount: 78, onCallCount: 20, standbyCount: 12 },
  { id: 'staff-pulmo', roleCode: 'pulmonologist', roleName: 'Pulmonologists', headcount: 8, onShiftCount: 4, onCallCount: 2, standbyCount: 1 },
];

const inventory = [
  { id: 'inv-mask', itemCode: 'PPE-MASK', itemName: 'N95 Masks', category: 'PPE', location: 'Central Storage', currentQuantity: 1240, capacityQuantity: 1800, unit: 'units', criticalThreshold: 400, targetQuantity: 1600, status: 'STABLE' },
  { id: 'inv-oxygen', itemCode: 'OXY-TANK', itemName: 'Oxygen Tanks', category: 'Respiratory', location: 'ER Storage', currentQuantity: 86, capacityQuantity: 120, unit: 'units', criticalThreshold: 40, targetQuantity: 100, status: 'WARNING' },
  { id: 'inv-saline', itemCode: 'IV-SAL', itemName: 'IV Saline', category: 'Medication', location: 'Pharmacy', currentQuantity: 320, capacityQuantity: 500, unit: 'bags', criticalThreshold: 120, targetQuantity: 420, status: 'STABLE' },
];

const contacts = [
  { id: 'contact-er', userId: 'usr-er', displayName: 'Laura Medina', roleLabel: 'ER Coordinator', departmentCode: 'ER', contactChannel: 'EMAIL', contactValue: 'laura@central.test', availabilityStatus: 'ACTIVE', assignable: true, notifiable: true, updatedAt: generatedAt },
  { id: 'contact-supply', userId: 'usr-supply', displayName: 'Carlos Nunez', roleLabel: 'Supply Lead', departmentCode: 'SUPPLY', contactChannel: 'EMAIL', contactValue: 'supply@central.test', availabilityStatus: 'ACTIVE', assignable: true, notifiable: true, updatedAt: generatedAt },
  { id: 'contact-icu', userId: 'usr-icu', displayName: 'Dr. Sofia Ramos', roleLabel: 'ICU Lead', departmentCode: 'ICU', contactChannel: 'SMS', contactValue: '+529991112222', availabilityStatus: 'ACTIVE', assignable: true, notifiable: true, updatedAt: generatedAt },
];

const recommendations = [
  {
    id: 'rec-beds',
    hospitalId: 'hosp-central',
    sourceAlertId: 'alert-dengue',
    sourceOutbreakId: 'outbreak-dengue',
    type: 'RESOURCE_ALLOCATION',
    severity: 'HIGH' as AdminRecommendationSeverity,
    status: 'NEW' as AdminRecommendationStatus,
    category: 'Capacity',
    title: 'Prepare additional isolation beds',
    description: 'Projected dengue admissions may exceed current isolation capacity tonight.',
    expectedImpact: 'Reduce admission delay by an estimated 18%.',
    urgencyWindow: 'Next 6 hours',
    confidenceScore: 0.86,
    imageMode: 'heatmap',
    rationale: ['Local cases increased during the last 24 hours.', 'Isolation rooms are near target utilization.'],
    recommendedActions: ['Reserve 5 isolation rooms.', 'Notify ER and ICU coordinators.'],
    affectedDepartments: ['ER', 'ICU'],
    affectedResources: ['Isolation rooms', 'N95 masks'],
    createdByMode: 'AUTOMATED',
    createdAt: generatedAt,
    updatedAt: generatedAt,
    resolvedAt: null,
    auditTrail: [{ id: 'audit-1', eventType: 'CREATED', eventLabel: 'Recommendation generated', createdAt: generatedAt }],
    tasks: [{ id: 'task-1', ownerContactId: 'contact-er', ownerLabel: 'Laura Medina', departmentLabel: 'Emergency', priority: 'HIGH', status: 'OPEN', deadlineAt: '2026-06-10T18:00:00.000Z', notes: 'Reserve rooms near ER.', createdAt: generatedAt }],
    notifications: [],
    supplyRequests: [],
  },
  {
    id: 'rec-oxygen',
    hospitalId: 'hosp-central',
    type: 'SUPPLY_REQUEST',
    severity: 'MEDIUM' as AdminRecommendationSeverity,
    status: 'ASSIGNED' as AdminRecommendationStatus,
    category: 'Supplies',
    title: 'Replenish oxygen tank reserve',
    description: 'Oxygen reserve is below preferred target for respiratory surge coverage.',
    expectedImpact: 'Improve respiratory readiness for the next 48 hours.',
    urgencyWindow: 'Next 24 hours',
    confidenceScore: 0.72,
    imageMode: 'supply',
    rationale: ['Inventory is above critical level but below target.', 'Influenza consultations are rising.'],
    recommendedActions: ['Request 20 additional oxygen tanks.'],
    affectedDepartments: ['ER'],
    affectedResources: ['Oxygen tanks'],
    createdByMode: 'AUTOMATED',
    createdAt: generatedAt,
    updatedAt: generatedAt,
    resolvedAt: null,
    auditTrail: [],
    tasks: [],
    notifications: [],
    supplyRequests: [],
  },
];

export async function getAdminDashboardSummary() {
  return {
    hospitalName: 'Central Hospital',
    municipalityName: 'Merida',
    stateName: 'Yucatan',
    generatedAt,
    topCards: [
      { id: 'beds', title: 'Available Beds', value: '42', subtitle: 'General and isolation', status: 'positive', badge: '+5 ready', iconKey: 'beds' },
      { id: 'staff', title: 'Staff On Shift', value: '124', subtitle: 'Clinical staff', status: 'positive', badge: 'Stable', iconKey: 'staff' },
      { id: 'alerts', title: 'Active Alerts', value: '8', subtitle: 'Within radius', status: 'warning', badge: '+2', iconKey: 'alert' },
    ],
    alerts: [
      { id: 'adm-alert-1', disease: 'Dengue', severity: 'HIGH', location: 'Centro', message: 'Confirmed cases rising near the hospital.', caseCount: 42, createdAt: generatedAt },
      { id: 'adm-alert-2', disease: 'Influenza', severity: 'MEDIUM', location: 'Norte', message: 'Respiratory consultations trending upward.', caseCount: 26, createdAt: generatedAt },
    ],
    mapZones: [
      { municipalityId: 'mun-merida', municipalityName: 'Merida', status: 'HIGH', outbreakCount: 8, latitude: 20.967, longitude: -89.623 },
      { municipalityId: 'mun-progreso', municipalityName: 'Progreso', status: 'MEDIUM', outbreakCount: 3, latitude: 21.28, longitude: -89.66 },
    ],
    recommendedActions: recommendations.map(({ id, title, type, severity, status }) => ({ id, title, type, severity, status })),
  };
}

export async function listAdminRecommendations() { return recommendations; }
export async function getAdminRecommendationDetail(id: string) { return recommendations.find((item) => item.id === id) ?? recommendations[0]; }
export async function refreshAdminRecommendations() { return { generated: 2 }; }
export async function updateAdminRecommendationStatus() { return undefined; }
export async function createAdminRecommendationTask() { return { id: 'task-new', ownerLabel: 'Laura Medina', departmentLabel: 'Emergency', priority: 'HIGH', status: 'OPEN', createdAt: generatedAt }; }
export async function createAdminRecommendationNotification() { return { id: 'notification-new', audienceLabel: 'Emergency', message: 'Mock notification', status: 'SENT', sentAt: generatedAt }; }
export async function createAdminSupplyRequest() { return { id: 'supply-new', supplyTypeLabel: 'Oxygen Tanks', quantity: 20, unit: 'units', destination: 'ER', status: 'REQUESTED', createdAt: generatedAt }; }
export async function createAdminResourceSupplyRequest() { return createAdminSupplyRequest(); }
export async function listOperationalContacts() { return contacts; }
export async function createOperationalContact(input: Record<string, unknown>) { return { ...contacts[0], ...input, id: 'contact-new' }; }
export async function updateOperationalContact(id: string, input: Record<string, unknown>) { return { ...contacts[0], ...input, id }; }
export async function updateOperationalContactStatus(id: string, status: string) { return { ...contacts[0], id, availabilityStatus: status }; }
export async function getAdminResourceSummary() { return { section: 'summary', data: summary }; }
export async function getAdminResourceDepartments() { return { section: 'departments', data: departments }; }
export async function getAdminResourceStaffing() { return { section: 'staffing', data: staffing }; }
export async function getAdminResourceInventory() { return { section: 'inventory', data: inventory }; }
export async function getAdminResourceInventoryMovements() { return { section: 'movements', data: [{ id: 'mov-1', inventoryItemId: 'inv-oxygen', movementType: 'RESTOCK', quantityDelta: 20, unit: 'units', notes: 'Mock restock', createdAt: generatedAt }] }; }
export async function getAdminOperationalRoster() { return { section: 'roster', data: contacts }; }
export async function updateAdminResourceSummary(input: Record<string, unknown>) { return input; }
export async function updateAdminResourceDepartment(id: string, input: Record<string, unknown>) { return { ...departments[0], ...input, id }; }
export async function createAdminResourceDepartment(input: Record<string, unknown>) { return { ...departments[0], ...input, id: 'dept-new' }; }
export async function deleteAdminResourceDepartment() { return undefined; }
export async function updateAdminResourceStaffing(id: string, input: Record<string, unknown>) { return { ...staffing[0], ...input, id }; }
export async function createAdminResourceStaffing(input: Record<string, unknown>) { return { ...staffing[0], ...input, id: 'staff-new' }; }
export async function deleteAdminResourceStaffing() { return undefined; }
export async function updateAdminResourceInventory(id: string, input: Record<string, unknown>) { return { ...inventory[0], ...input, id }; }
export async function createAdminResourceInventory(input: Record<string, unknown>) { return { ...inventory[0], ...input, id: 'inv-new' }; }
export async function deleteAdminResourceInventory() { return undefined; }
