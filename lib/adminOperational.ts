import { api } from './api';

export type AdminRecommendationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AdminRecommendationStatus = 'NEW' | 'ACCEPTED' | 'ASSIGNED' | 'COMPLETED' | 'REJECTED';

export interface AdminDashboardSummaryResponse {
  hospitalName: string;
  municipalityName?: string | null;
  stateName?: string | null;
  generatedAt: string;
  topCards: AdminDashboardMetricResponse[];
  alerts: AdminDashboardAlertResponse[];
  mapZones: AdminDashboardZoneResponse[];
  recommendedActions: AdminRecommendedActionResponse[];
}

export interface AdminDashboardMetricResponse {
  id: string;
  title: string;
  value: string;
  subtitle?: string | null;
  status?: string | null;
  badge?: string | null;
  iconKey?: string | null;
}

export interface AdminDashboardAlertResponse {
  id: string;
  disease: string;
  severity: string;
  location: string;
  message: string;
  caseCount: number;
  createdAt: string;
}

export interface AdminDashboardZoneResponse {
  municipalityId: string;
  municipalityName: string;
  status: string;
  outbreakCount: number;
  latitude: number;
  longitude: number;
}

export interface AdminRecommendedActionResponse {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  translations?: Record<string, OperationalRecommendationTranslation> | null;
}

export interface OperationalRecommendationResponse {
  id: string;
  hospitalId: string;
  sourceAlertId?: string | null;
  sourceOutbreakId?: string | null;
  type: string;
  severity: AdminRecommendationSeverity;
  status: AdminRecommendationStatus;
  category: string;
  title: string;
  description: string;
  expectedImpact: string;
  urgencyWindow: string;
  confidenceScore: number;
  translations?: Record<string, OperationalRecommendationTranslation> | null;
  imageMode?: string | null;
  rationale: string[];
  recommendedActions: string[];
  affectedDepartments: string[];
  affectedResources: string[];
  createdByMode: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  auditTrail: OperationalRecommendationAuditEntryResponse[];
  tasks: OperationalTaskResponse[];
  notifications: OperationalNotificationResponse[];
  supplyRequests: SupplyRequestResponse[];
}

export interface OperationalRecommendationTranslation {
  title?: string | null;
  description?: string | null;
  expectedImpact?: string | null;
  urgencyWindow?: string | null;
  rationale?: string[] | null;
  recommendedActions?: string[] | null;
}

export interface OperationalRecommendationAuditEntryResponse {
  id: string;
  eventType: string;
  eventLabel: string;
  createdAt: string;
}

export interface OperationalTaskResponse {
  id: string;
  ownerContactId?: string | null;
  ownerGroupId?: string | null;
  ownerLabel: string;
  departmentLabel: string;
  priority: string;
  status: string;
  deadlineAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface OperationalNotificationResponse {
  id: string;
  audienceContactId?: string | null;
  audienceGroupId?: string | null;
  audienceType?: 'CONTACT' | 'DEPARTMENT' | 'GROUP' | string | null;
  audienceDepartmentCode?: string | null;
  audienceLabel: string;
  message: string;
  status: string;
  deliveryChannel?: string | null;
  deliveryStatusDetail?: string | null;
  recipientSummary?: OperationalNotificationRecipientSummary | null;
  recipients?: OperationalNotificationRecipientResponse[] | null;
  sentAt?: string | null;
}

export interface OperationalNotificationRecipientSummary {
  total: number;
  sent: number;
  failed: number;
}

export interface OperationalNotificationRecipientResponse {
  id: string;
  contactId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  status: string;
  deliveryStatusDetail?: string | null;
  deliveredAt?: string | null;
}

export interface SupplyRequestResponse {
  id: string;
  recommendationId?: string | null;
  hospitalId?: string | null;
  inventoryItemId?: string | null;
  supplyTypeLabel: string;
  quantity: number;
  unit: string;
  destination: string;
  suggestedSupplier?: string | null;
  status: string;
  sourceActionCode?: string | null;
  priority?: string | null;
  requestedNeededBy?: string | null;
  requestedByUserId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateOperationalTaskInput {
  ownerContactId?: string;
  ownerLabel?: string;
  departmentLabel?: string;
  deadlineAt?: string | null;
  priority?: string;
  notes?: string;
  language?: 'en' | 'es';
}

export interface CreateOperationalNotificationInput {
  audienceType: 'CONTACT' | 'DEPARTMENT';
  audienceContactId?: string;
  audienceDepartmentCode?: string;
  audienceLabel?: string;
  message: string;
  language?: 'en' | 'es';
}

export interface CreateSupplyRequestInput {
  supplyTypeLabel: string;
  quantity: number;
  unit: string;
  destination: string;
  suggestedSupplier?: string;
  priority?: string;
  requestedNeededBy?: string | null;
}

export interface HospitalInventoryMovementResponse {
  id: string;
  inventoryItemId: string;
  movementType: string;
  quantityDelta: number;
  unit?: string | null;
  notes?: string | null;
  relatedSupplyRequestId?: string | null;
  createdAt: string;
}

export interface ResourceResponse<T> {
  section: string;
  data: T;
}

export interface HospitalResourceSummaryResponse {
  totalBeds: number;
  availableBeds: number;
  icuTotalBeds: number;
  icuAvailableBeds: number;
  isolationRoomsTotal: number;
  isolationRoomsAvailable: number;
  oxygenCapacityUnits: number;
  oxygenAvailableUnits: number;
  doctorsOnShift: number;
  nursesOnShift: number;
  specialistsOnShift: number;
  source: string;
  capturedAt: string;
}

export interface HospitalDepartmentResourceResponse {
  id: string;
  departmentCode: string;
  departmentName: string;
  levelLabel: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  status: string;
  notes: string;
}

export interface HospitalStaffingProfileResponse {
  id: string;
  roleCode: string;
  roleName: string;
  headcount: number;
  onShiftCount: number;
  onCallCount: number;
  standbyCount: number;
}

export interface HospitalInventoryItemResponse {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  location: string;
  currentQuantity: number;
  capacityQuantity: number;
  unit: string;
  criticalThreshold: number;
  targetQuantity: number;
  status: string;
}

export interface OperationalContactResponse {
  id: string;
  userId?: string | null;
  displayName: string;
  roleLabel: string;
  departmentCode?: string | null;
  contactChannel?: string | null;
  contactValue?: string | null;
  availabilityStatus: string;
  assignable: boolean;
  notifiable: boolean;
  updatedAt?: string | null;
}

export interface OperationalContactInput {
  displayName: string;
  roleLabel: string;
  departmentCode: string;
  email: string;
  assignable: boolean;
  notifiable: boolean;
  availabilityStatus: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateHospitalResourceSummaryInput extends HospitalResourceSummaryResponse {}
export interface UpdateHospitalDepartmentInput extends HospitalDepartmentResourceResponse {}
export interface UpdateHospitalStaffingProfileInput extends HospitalStaffingProfileResponse {}
export interface UpdateHospitalInventoryItemInput extends HospitalInventoryItemResponse {}
export interface CreateHospitalDepartmentInput extends Omit<HospitalDepartmentResourceResponse, 'id' | 'availableBeds'> {}
export interface CreateHospitalStaffingProfileInput extends Omit<HospitalStaffingProfileResponse, 'id'> {}
export interface CreateHospitalInventoryItemInput extends Omit<HospitalInventoryItemResponse, 'id'> {}

function recommendationQuery(params: { status?: string; severity?: string; type?: string }) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.severity) query.set('severity', params.severity);
  if (params.type) query.set('type', params.type);
  const value = query.toString();
  return value ? `?${value}` : '';
}

function contactQuery(params: { assignable?: boolean; notifiable?: boolean; departmentCode?: string } = {}) {
  const query = new URLSearchParams();
  if (typeof params.assignable === 'boolean') query.set('assignable', String(params.assignable));
  if (typeof params.notifiable === 'boolean') query.set('notifiable', String(params.notifiable));
  if (params.departmentCode) query.set('departmentCode', params.departmentCode);
  const value = query.toString();
  return value ? `?${value}` : '';
}

export async function getAdminDashboardSummary() {
  return api<AdminDashboardSummaryResponse>('/admin/dashboard/summary');
}

export async function listAdminRecommendations(params: { status?: string; severity?: string; type?: string } = {}) {
  return api<OperationalRecommendationResponse[]>(
    `/admin/recommendations${recommendationQuery(params)}`,
  );
}

export async function getAdminRecommendationDetail(id: string) {
  return api<OperationalRecommendationResponse>(`/admin/recommendations/${id}`);
}

export async function refreshAdminRecommendations() {
  return api<{ generated: number }>('/admin/recommendations/refresh', { method: 'POST' });
}

export async function updateAdminRecommendationStatus(id: string, status: AdminRecommendationStatus) {
  return api<void>(`/admin/recommendations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function createAdminRecommendationTask(id: string, input: CreateOperationalTaskInput) {
  return api<OperationalTaskResponse>(`/admin/recommendations/${id}/tasks`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createAdminRecommendationNotification(id: string, input: CreateOperationalNotificationInput) {
  return api<OperationalNotificationResponse>(`/admin/recommendations/${id}/notifications`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createAdminSupplyRequest(id: string, input: CreateSupplyRequestInput) {
  return api<SupplyRequestResponse>(`/admin/recommendations/${id}/supply-requests`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createAdminResourceSupplyRequest(itemId: string, input: CreateSupplyRequestInput) {
  return api<SupplyRequestResponse>(`/admin/resources/inventory/${itemId}/supply-requests`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listOperationalContacts(params: { assignable?: boolean; notifiable?: boolean; departmentCode?: string } = {}) {
  return api<OperationalContactResponse[]>(`/admin/operational-contacts${contactQuery(params)}`);
}

export async function createOperationalContact(input: OperationalContactInput) {
  return api<OperationalContactResponse>('/admin/operational-contacts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateOperationalContact(id: string, input: OperationalContactInput) {
  return api<OperationalContactResponse>(`/admin/operational-contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function updateOperationalContactStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
  return api<OperationalContactResponse>(`/admin/operational-contacts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminResourceSummary() {
  return api<ResourceResponse<HospitalResourceSummaryResponse>>('/admin/resources/summary');
}

export async function getAdminResourceDepartments() {
  return api<ResourceResponse<HospitalDepartmentResourceResponse[]>>('/admin/resources/departments');
}

export async function getAdminResourceStaffing() {
  return api<ResourceResponse<HospitalStaffingProfileResponse[]>>('/admin/resources/staffing');
}

export async function getAdminResourceInventory() {
  return api<ResourceResponse<HospitalInventoryItemResponse[]>>('/admin/resources/inventory');
}

export async function getAdminResourceInventoryMovements(itemId: string) {
  return api<ResourceResponse<HospitalInventoryMovementResponse[]>>(`/admin/resources/inventory/${itemId}/movements`);
}

export async function getAdminOperationalRoster() {
  return api<ResourceResponse<OperationalContactResponse[]>>('/admin/resources/operational-roster');
}

export async function updateAdminResourceSummary(input: UpdateHospitalResourceSummaryInput) {
  return api<HospitalResourceSummaryResponse>('/admin/resources/summary', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function updateAdminResourceDepartment(id: string, input: UpdateHospitalDepartmentInput) {
  return api<HospitalDepartmentResourceResponse>(`/admin/resources/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function createAdminResourceDepartment(input: CreateHospitalDepartmentInput) {
  return api<HospitalDepartmentResourceResponse>('/admin/resources/departments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteAdminResourceDepartment(id: string) {
  return api<void>(`/admin/resources/departments/${id}`, {
    method: 'DELETE',
  });
}

export async function updateAdminResourceStaffing(id: string, input: UpdateHospitalStaffingProfileInput) {
  return api<HospitalStaffingProfileResponse>(`/admin/resources/staffing/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function createAdminResourceStaffing(input: CreateHospitalStaffingProfileInput) {
  return api<HospitalStaffingProfileResponse>('/admin/resources/staffing', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteAdminResourceStaffing(id: string) {
  return api<void>(`/admin/resources/staffing/${id}`, {
    method: 'DELETE',
  });
}

export async function updateAdminResourceInventory(id: string, input: UpdateHospitalInventoryItemInput) {
  return api<HospitalInventoryItemResponse>(`/admin/resources/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function createAdminResourceInventory(input: CreateHospitalInventoryItemInput) {
  return api<HospitalInventoryItemResponse>('/admin/resources/inventory', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteAdminResourceInventory(id: string) {
  return api<void>(`/admin/resources/inventory/${id}`, {
    method: 'DELETE',
  });
}
