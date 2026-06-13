import { AppColors } from '@/constants/theme';

export const overlayActions = {
  close: () => undefined,
  confirm: () => undefined,
  save: () => undefined,
  submit: () => undefined,
  send: () => undefined,
  delete: () => undefined,
};

export const adminDashboardAlert = {
  id: 'alert-1',
  title: 'Sarampion en pediatria',
  description: 'Incremento de casos confirmados durante las ultimas 24 horas.',
  variant: 'critical' as const,
  department: 'Urgencias',
  area: 'Pediatria',
  priority: 'Alta',
  recommendedAction: 'Activar protocolo de aislamiento y notificar al equipo epidemiologico.',
  caseCount: 18,
  caseLabel: '18 casos activos',
  confirmationStatus: 'Confirmado',
  municipalityName: 'San Nicolas de los Garza',
  stateName: 'Nuevo Leon',
};

export const adminDashboardMetric = {
  id: 'metric-1',
  title: 'Enfermedad con mas casos',
  value: 'Sarampion',
  subtitle: 'Mayor carga clinica actual',
  tone: 'critical' as const,
  badge: 'Alto',
  detailTitle: 'Enfermedad con mas casos',
  detailSummary: 'Esta metrica reemplaza la proyeccion hasta contar con series historicas semanales.',
  signalLabel: 'Mayor carga actual',
  recommendedAction: 'Priorizar triage respiratorio y seguimiento de contactos cercanos.',
  insightsVariant: 'ranked' as const,
  insights: [
    {
      title: 'Sarampion',
      location: 'San Nicolas de los Garza',
      cases: '78 casos',
      severity: 'Confirmado',
      color: AppColors.status.danger,
      meta: 'Ultimas 24 h',
    },
    {
      title: 'Rubeola',
      location: 'Monterrey',
      cases: '31 casos',
      severity: 'Sospechoso',
      color: AppColors.status.warning,
    },
  ],
  relatedAlerts: [],
};

export const adminDashboardZone = {
  id: 'zone-1',
  name: 'Apodaca',
  risk: 'Moderado',
  disease: 'Rubeola',
  cases: '16 casos activos',
  radius: 'Dentro de 8 km',
  priority: 'Alta',
  note: 'Zona con aumento de casos sospechosos en el radio hospitalario.',
  recommendedAction: 'Mantener vigilancia activa y revisar disponibilidad de pruebas.',
  municipalityName: 'Apodaca',
  stateName: 'Nuevo Leon',
  top: '48%',
  left: '56%',
  latitude: 25.781,
  longitude: -100.188,
  borderColor: AppColors.status.warning,
  fillColor: AppColors.status.warningSoft,
};

export const adminDashboardSummary = {
  hospitalName: 'Hospital Metropolitano',
  municipalityName: 'San Nicolas de los Garza',
  stateName: 'Nuevo Leon',
  generatedAt: '2026-06-11T18:00:00Z',
  topCards: [],
  alerts: [],
  mapZones: [],
  recommendedActions: [
    {
      id: 'action-1',
      title: 'Reforzar filtros de admision',
      type: 'PREVENTION',
      severity: 'HIGH',
      status: 'NEW',
    },
  ],
};

export const recommendationItem = {
  id: 'rec-1',
  type: 'Operational',
  severity: 'high' as const,
  backendSeverity: 'HIGH',
  category: 'Capacity',
  title: 'Reforzar triaje respiratorio',
  description: 'Incrementar filtros clinicos en admision y pediatria durante el pico de demanda.',
  createdByMode: 'ASSISTED',
  metaItems: [{ label: 'Urgencias' }, { label: '24 h' }],
  accentColor: AppColors.status.warning,
  actions: [
    { label: 'Asignar tarea', variant: 'primary' as const },
    { label: 'Notificar', variant: 'secondary' as const },
  ],
  confidenceScore: 88,
  expectedImpact: 'Reduce saturacion inicial y acelera confirmacion diagnostica.',
  urgencyWindow: 'Proximas 24 horas',
  affectedDepartments: ['Urgencias', 'Pediatria'],
  affectedResources: ['Pruebas rapidas', 'Cubrebocas N95'],
  rationale: ['Casos respiratorios por encima del umbral operativo.', 'Mayor demanda en admision.'],
  recommendedActions: ['Abrir filtro respiratorio.', 'Notificar a contactos operativos.'],
  status: 'new' as const,
  assignee: 'Equipo de guardia',
  activeTask: {
    id: 'task-1',
    ownerContactId: 'contact-1',
    ownerLabel: 'Dra. Rivera',
    departmentLabel: 'Urgencias',
    deadlineAt: '2026-06-12T12:00:00Z',
    notes: 'Revisar disponibilidad por turno.',
    priority: 'Alta',
  },
  auditTrail: [{ timestamp: '2026-06-11 18:00', label: 'Recomendacion generada' }],
};

export const departments = [
  {
    id: 'dept-1',
    departmentCode: 'ER',
    departmentName: 'Urgencias',
    levelLabel: 'Alta prioridad',
    totalBeds: 42,
    occupiedBeds: 34,
    availableBeds: 8,
    status: 'High Demand',
    notes: 'Demanda elevada por sintomas respiratorios.',
  },
  {
    id: 'dept-2',
    departmentCode: 'PED',
    departmentName: 'Pediatria',
    levelLabel: 'Critico',
    totalBeds: 28,
    occupiedBeds: 25,
    availableBeds: 3,
    status: 'Critical',
    notes: 'Requiere seguimiento cada turno.',
  },
];

export const contacts = [
  {
    id: 'contact-1',
    userId: 'user-1',
    displayName: 'Dra. Sofia Rivera',
    roleLabel: 'Jefa de Urgencias',
    departmentCode: 'ER',
    contactChannel: 'EMAIL',
    contactValue: 'sofia.rivera@hospital.test',
    availabilityStatus: 'ACTIVE',
    assignable: true,
    notifiable: true,
    updatedAt: '2026-06-11T18:00:00Z',
  },
  {
    id: 'contact-2',
    userId: 'user-2',
    displayName: 'Dr. Mateo Salinas',
    roleLabel: 'Epidemiologia',
    departmentCode: 'PED',
    contactChannel: 'EMAIL',
    contactValue: 'mateo.salinas@hospital.test',
    availabilityStatus: 'ACTIVE',
    assignable: true,
    notifiable: true,
    updatedAt: '2026-06-11T18:00:00Z',
  },
];

export const resourceConfiguration = {
  totalBeds: '240',
  totalPersonnel: '420',
  doctors: '88',
  nurses: '190',
  neurologists: '8',
  cardiologists: '12',
  pediatricians: '18',
  surgeons: '16',
  anesthesiologists: '10',
  radiologists: '7',
  pulmonologists: '9',
  infectiousDiseaseSpecialists: '6',
  emergencyPhysicians: '22',
};

export const departmentResource = {
  id: 'department-1',
  code: 'ER',
  name: 'Urgencias',
  level: 'Alta prioridad',
  totalBeds: '42',
  occupiedBeds: '34',
  status: 'High Demand' as const,
  notes: 'Demanda elevada por pacientes respiratorios.',
};

export const staffingProfiles = [
  {
    id: 'staffing-1',
    roleCode: 'DOC',
    roleName: 'Medicos',
    headcount: '88',
    onShiftCount: '26',
    onCallCount: '12',
    standbyCount: '8',
  },
  {
    id: 'staffing-2',
    roleCode: 'NUR',
    roleName: 'Enfermeria',
    headcount: '190',
    onShiftCount: '64',
    onCallCount: '20',
    standbyCount: '12',
  },
];

export const roster = [
  {
    id: 'roster-1',
    name: 'Dra. Sofia Rivera',
    role: 'Jefa de Urgencias',
    department: 'Urgencias',
    shift: 'Matutino',
    availability: 'On Shift' as const,
    contactChannel: 'EMAIL',
    contactValue: 'sofia.rivera@hospital.test',
  },
  {
    id: 'roster-2',
    name: 'Dr. Mateo Salinas',
    role: 'Epidemiologia',
    department: 'Pediatria',
    shift: 'Vespertino',
    availability: 'On Call' as const,
    contactChannel: 'PHONE',
    contactValue: '+52 81 0000 0000',
  },
];

export const inventoryItem = {
  id: 'inventory-1',
  itemCode: 'N95',
  title: 'Cubrebocas N95',
  category: 'Proteccion',
  currentQuantity: '128',
  capacityQuantity: '400',
  unit: 'piezas',
  criticalThreshold: '80',
  targetQuantity: '300',
  status: 'Bajo inventario',
  valueText: '128 / 400 piezas',
  progress: 32,
  tone: 'low' as const,
  actionLabel: 'Solicitar reabasto',
  actionType: 'order' as const,
  location: 'Almacen central',
  targetLevel: '300 piezas',
};

export const inventoryMovements = [
  {
    id: 'movement-1',
    inventoryItemId: 'inventory-1',
    movementType: 'OUTBOUND',
    quantityDelta: -42,
    unit: 'piezas',
    notes: 'Entrega a urgencias',
    relatedSupplyRequestId: 'supply-1',
    createdAt: '2026-06-11T16:00:00Z',
  },
  {
    id: 'movement-2',
    inventoryItemId: 'inventory-1',
    movementType: 'INBOUND',
    quantityDelta: 80,
    unit: 'piezas',
    notes: 'Recepcion de proveedor',
    createdAt: '2026-06-10T12:00:00Z',
  },
];

export const adminUser = {
  id: 'user-1',
  initials: 'SR',
  name: 'Sofia Rivera',
  email: 'sofia.rivera@hospital.test',
  role: 'Doctor' as const,
  roleTone: 'info' as const,
  status: 'Active' as const,
  statusVariant: 'success' as const,
};

export const doctorDashboardAlert = {
  id: 'doctor-alert-1',
  title: 'Actividad de sarampion',
  description: 'Pacientes con sintomas compatibles en el radio de atencion.',
  variant: 'warning' as const,
  area: 'Consulta externa',
  priority: 'Moderada',
  recommendedAction: 'Solicitar confirmacion diagnostica y seguimiento de contactos.',
  caseCount: 12,
  caseLabel: '12 casos activos',
  confirmationStatus: 'Sospechoso',
  municipalityName: 'Guadalupe',
  stateName: 'Nuevo Leon',
};

export const doctorDashboardMetric = {
  id: 'doctor-metric-1',
  title: 'Crecimiento semanal',
  value: '+18%',
  badge: 'Moderado',
  status: 'warning' as const,
  subtitle: 'Comparado con la semana anterior',
  detailTitle: 'Crecimiento semanal',
  detailSummary: 'La tendencia local muestra aumento moderado en casos respiratorios.',
  signalLabel: 'Variacion detectada',
  recommendedAction: 'Mantener pruebas de confirmacion en pacientes con sintomas compatibles.',
  iconKey: 'trend' as const,
  insights: [
    {
      title: 'Sarampion',
      location: 'Guadalupe',
      cases: '24 casos',
      severity: 'Sospechoso',
      color: AppColors.status.warning,
      meta: 'Semana actual',
    },
  ],
};

export const doctorDashboardZone = {
  id: 'doctor-zone-1',
  name: 'Guadalupe',
  risk: 'Moderado',
  disease: 'Sarampion',
  cases: '12 casos activos',
  radius: 'Dentro de 6 km',
  priority: 'Media',
  note: 'Zona con vigilancia clinica activa.',
  recommendedAction: 'Revisar antecedentes de vacunacion y sintomas.',
  municipalityName: 'Guadalupe',
  stateName: 'Nuevo Leon',
  top: '50%',
  left: '58%',
  borderColor: AppColors.status.warning,
  latitude: 25.676,
  longitude: -100.256,
};

export const reportSection = {
  title: 'Resumen epidemiologico local',
  contextLabel: 'Radio hospitalario',
  contextValue: '8 km',
  totalCases: 42,
  rows: [
    { disease: 'Sarampion', cases: 24, outbreaks: 3 },
    { disease: 'Rubeola', cases: 12, outbreaks: 2 },
    { disease: 'Influenza', cases: 6, outbreaks: 1 },
  ],
};

export const analyticsDisease = {
  id: 'disease-1',
  name: 'Sarampion',
  cases: '124',
  weeklyGrowth: '+18%',
  riskLevel: 'Alto',
  affectedZones: '5 zonas',
  trend: 'Aumento sostenido durante la ultima semana.',
};

export const analyticsZone = {
  id: 'analytics-zone-1',
  name: 'Monterrey centro',
  risk: 'Alto',
  disease: 'Sarampion',
  radius: '12 km',
  priority: 'Alta',
  trend: 'Concentracion creciente de casos sospechosos.',
  note: 'Zona prioritaria por densidad poblacional y movilidad.',
};

export const mapLegendItems = [
  { label: 'Riesgo alto', color: AppColors.status.danger },
  { label: 'Emergente', color: AppColors.status.warning },
  { label: 'Riesgo bajo', color: AppColors.status.success },
];

export const mapPins = [
  {
    id: 'pin-1',
    top: '42%',
    left: '48%',
    borderColor: AppColors.status.danger,
    fillColor: AppColors.surface.card,
  },
  {
    id: 'pin-2',
    top: '58%',
    left: '62%',
    borderColor: AppColors.status.warning,
    fillColor: AppColors.surface.card,
  },
];

export const mapImageUri =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520"><rect width="900" height="520" fill="#eef4f8"/><path d="M0 330 C180 260 240 390 410 290 C560 200 690 260 900 190 L900 520 L0 520 Z" fill="#d7ead6"/><path d="M50 110 C210 70 330 150 460 95 C640 20 780 130 900 80" stroke="#becbd8" stroke-width="22" fill="none"/><path d="M0 250 L900 145" stroke="#f4a261" stroke-width="8" fill="none"/><path d="M120 500 L700 20" stroke="#9aa7b5" stroke-width="5" fill="none"/><circle cx="460" cy="260" r="88" fill="#fef3c7" opacity=".75"/><circle cx="470" cy="260" r="42" fill="#fed7aa" opacity=".8"/></svg>',
  );
