export interface ResourceConfiguration {
  totalBeds: string;
  totalPersonnel: string;
  doctors: string;
  nurses: string;
  neurologists: string;
  cardiologists: string;
  pediatricians: string;
  surgeons: string;
  anesthesiologists: string;
  radiologists: string;
  pulmonologists: string;
  infectiousDiseaseSpecialists: string;
  emergencyPhysicians: string;
}

export interface DepartmentResourceItem {
  id: string;
  code: string;
  name: string;
  level: string;
  totalBeds: string;
  occupiedBeds: string;
  status: 'Critical' | 'Stable' | 'High Demand';
  notes: string;
}

export interface StaffingProfileItem {
  id: string;
  roleCode: string;
  roleName: string;
  headcount: string;
  onShiftCount: string;
  onCallCount: string;
  standbyCount: string;
}

export interface StaffRosterItem {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  availability: 'On Shift' | 'On Call' | 'Standby' | 'Unavailable';
  contactChannel?: string;
  contactValue?: string;
}

export interface InventoryResourceItem {
  id: string;
  itemCode: string;
  title: string;
  category: string;
  currentQuantity: string;
  capacityQuantity: string;
  unit: string;
  criticalThreshold: string;
  targetQuantity: string;
  status: string;
  valueText: string;
  progress: number;
  tone: 'normal' | 'low' | 'critical';
  actionLabel: string;
  actionType: 'refill' | 'order' | 'manage';
  location: string;
  targetLevel: string;
}
