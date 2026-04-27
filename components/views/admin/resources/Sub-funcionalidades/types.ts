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
  name: string;
  level: string;
  totalBeds: string;
  occupiedBeds: string;
  status: 'Critical' | 'Stable' | 'High Demand';
  notes: string;
}

export interface StaffRosterItem {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  availability: 'On Shift' | 'On Call' | 'Standby';
}

export interface InventoryResourceItem {
  id: string;
  title: string;
  valueText: string;
  progress: number;
  tone: 'normal' | 'critical';
  actionLabel: string;
  actionType: 'refill' | 'order' | 'manage';
  location: string;
  targetLevel: string;
}

export const defaultResourceConfiguration: ResourceConfiguration = {
  totalBeds: '580',
  totalPersonnel: '246',
  doctors: '36',
  nurses: '84',
  neurologists: '6',
  cardiologists: '8',
  pediatricians: '10',
  surgeons: '12',
  anesthesiologists: '7',
  radiologists: '5',
  pulmonologists: '4',
  infectiousDiseaseSpecialists: '3',
  emergencyPhysicians: '9',
};

export const defaultDepartments: DepartmentResourceItem[] = [
  {
    id: 'icu',
    name: 'Intensive Care (ICU)',
    level: 'Level 4',
    totalBeds: '50',
    occupiedBeds: '45',
    status: 'Critical',
    notes: 'High acuity patients with constant ventilator demand.',
  },
  {
    id: 'ed',
    name: 'Emergency Dept (ED)',
    level: 'Level 1',
    totalBeds: '120',
    occupiedBeds: '82',
    status: 'Stable',
    notes: 'Patient flow remains stable with standard triage coverage.',
  },
  {
    id: 'ward',
    name: 'General Ward',
    level: 'Level 2 & 3',
    totalBeds: '310',
    occupiedBeds: '268',
    status: 'High Demand',
    notes: 'Bed turnover elevated because of seasonal respiratory cases.',
  },
];

export const defaultRoster: StaffRosterItem[] = [
  { id: 'r1', name: 'Dr. Sarah Chen', role: 'Pulmonologist', department: 'ICU', shift: '07:00 - 19:00', availability: 'On Shift' },
  { id: 'r2', name: 'Dr. Miguel Torres', role: 'Emergency Physician', department: 'ED', shift: '07:00 - 19:00', availability: 'On Shift' },
  { id: 'r3', name: 'Nurse Elena Ward', role: 'Charge Nurse', department: 'General Ward', shift: '07:00 - 19:00', availability: 'On Shift' },
  { id: 'r4', name: 'Dr. Nina Patel', role: 'Neurologist', department: 'ICU', shift: 'On Call', availability: 'On Call' },
  { id: 'r5', name: 'Nurse Omar Reyes', role: 'Triage Nurse', department: 'ED', shift: 'Standby', availability: 'Standby' },
  { id: 'r6', name: 'Dr. Lucia Gomez', role: 'Pediatrician', department: 'Ward 3', shift: '19:00 - 07:00', availability: 'On Shift' },
];

export const defaultInventory: InventoryResourceItem[] = [
  {
    id: 'oxygen',
    title: 'Medical Oxygen',
    valueText: '850L / 1000L',
    progress: 85,
    tone: 'normal',
    actionLabel: 'Order Refill',
    actionType: 'refill',
    location: 'Critical Care Storage A',
    targetLevel: '1000L',
  },
  {
    id: 'vaccines',
    title: 'Vaccine Stock (Multi-strain)',
    valueText: 'Critical 12%',
    progress: 12,
    tone: 'critical',
    actionLabel: 'Order More Now',
    actionType: 'order',
    location: 'Cold Chain Pharmacy',
    targetLevel: '90%+',
  },
  {
    id: 'medications',
    title: 'Essential Medications',
    valueText: '62% in stock',
    progress: 62,
    tone: 'normal',
    actionLabel: 'Manage Supply',
    actionType: 'manage',
    location: 'Central Medication Room',
    targetLevel: '75%+',
  },
];
