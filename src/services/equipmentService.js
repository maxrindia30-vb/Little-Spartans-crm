/**
 * Little Spartans ZenConnect CRM - Sports Equipment & Multi-Location Inventory Service
 *
 * Provides operations for:
 * - Location-scoped equipment inventory tracking
 * - Condition status evaluation (Good, Needs Maintenance, Damaged, Missing)
 * - Coach condition report submission (read-only for base quantities)
 * - Super Coach report verification, inventory calibration, and maintenance queue
 * - Admin major repair/purchase authorization & audit history
 *
 * ============================================================================
 * BACKEND API SPECIFICATION:
 * - GET    /api/v1/equipment?location=...&category=...&condition=...
 * - POST   /api/v1/equipment
 * - PUT    /api/v1/equipment/:id
 * - POST   /api/v1/equipment/reports
 * - PATCH  /api/v1/equipment/reports/:id/verify
 * - PATCH  /api/v1/equipment/reports/:id/approve
 * ============================================================================
 */

export const EQUIPMENT_CATEGORIES = [
  'Football',
  'Basketball',
  'Gymnastics equipment',
  'Gymnastics mats',
  'Cones',
  'Skipping ropes',
  'Yoga mats',
  'Judo mats',
  'Hula hoops',
  'Other sports equipment'
];

export const EQUIPMENT_CONDITIONS = {
  GOOD: 'Good',
  NEEDS_MAINTENANCE: 'Needs Maintenance',
  DAMAGED: 'Damaged',
  MISSING: 'Missing'
};

export const CONDITION_COLORS = {
  'Good': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Needs Maintenance': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Damaged': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'Missing': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' }
};

export const REPORT_STATUSES = {
  PENDING_REVIEW: 'Pending Review',
  VERIFIED_BY_SUPER_COACH: 'Verified by Super Coach',
  APPROVED_BY_ADMIN: 'Approved by Admin',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected'
};

/**
 * Initial canonical equipment inventory across Little Spartans centers
 */
export const initialEquipmentInventory = [
  // KK NAGAR
  {
    id: 'EQ-KKN-001',
    name: 'Size 4 Pro Match Footballs',
    category: 'Football',
    location: 'KK NAGAR',
    totalQty: 24,
    availableQty: 22,
    damagedQty: 2,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2026-02-15',
    lastInspectionDate: '2026-11-12',
    lastUpdatedBy: 'Senior Coach Kabir Rao',
    remarks: 'Official junior training footballs for evening squad.',
    history: [
      { id: 'EQH-101', timestamp: '2026-11-12T10:00:00Z', action: 'Routine Inspection', user: 'Senior Coach Kabir Rao', role: 'Super Coach', details: 'All footballs pressure tested.' }
    ]
  },
  {
    id: 'EQ-KKN-002',
    name: 'High-Density Tumbling Mats (2m x 1m)',
    category: 'Gymnastics mats',
    location: 'KK NAGAR',
    totalQty: 16,
    availableQty: 14,
    damagedQty: 2,
    missingQty: 0,
    condition: 'Needs Maintenance',
    purchaseDate: '2025-08-20',
    lastInspectionDate: '2026-11-10',
    lastUpdatedBy: 'Coach Kapil',
    remarks: 'Corner velcro stitching loose on 2 tumbling pads.',
    history: [
      { id: 'EQH-102', timestamp: '2026-11-10T16:30:00Z', action: 'Condition Reported', user: 'Coach Kapil', role: 'Coach', details: 'Corner stitching loose on 2 mats.' }
    ]
  },
  {
    id: 'EQ-KKN-003',
    name: 'Agility Training Marker Cones (Set of 50)',
    category: 'Cones',
    location: 'KK NAGAR',
    totalQty: 100,
    availableQty: 95,
    damagedQty: 2,
    missingQty: 3,
    condition: 'Good',
    purchaseDate: '2026-01-10',
    lastInspectionDate: '2026-11-08',
    lastUpdatedBy: 'Coach Dibi',
    remarks: 'High-visibility fluorescent cones for sprint agility drills.',
    history: []
  },
  {
    id: 'EQ-KKN-004',
    name: 'Junior Gymnastics Vaulting Springboard',
    category: 'Gymnastics equipment',
    location: 'KK NAGAR',
    totalQty: 2,
    availableQty: 2,
    damagedQty: 0,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2025-11-05',
    lastInspectionDate: '2026-11-05',
    lastUpdatedBy: 'Senior Coach Kabir Rao',
    remarks: 'Heavy duty steel springs; certified for athletes under 45kg.',
    history: []
  },
  {
    id: 'EQ-KKN-005',
    name: 'Standard Tatami Judo Mats (4cm Thickness)',
    category: 'Judo mats',
    location: 'KK NAGAR',
    totalQty: 30,
    availableQty: 28,
    damagedQty: 2,
    missingQty: 0,
    condition: 'Needs Maintenance',
    purchaseDate: '2025-06-12',
    lastInspectionDate: '2026-11-11',
    lastUpdatedBy: 'Senior Coach Kabir Rao',
    remarks: '2 border tiles showing wear; scheduled for surface patch.',
    history: []
  },

  // KILPAUK
  {
    id: 'EQ-KIL-001',
    name: 'Size 5 Junior Composite Basketballs',
    category: 'Basketball',
    location: 'KILPAUK',
    totalQty: 20,
    availableQty: 18,
    damagedQty: 1,
    missingQty: 1,
    condition: 'Good',
    purchaseDate: '2026-03-01',
    lastInspectionDate: '2026-11-13',
    lastUpdatedBy: 'Coach Hanif',
    remarks: 'Indoor court basketballs with microfiber grip.',
    history: []
  },
  {
    id: 'EQ-KIL-002',
    name: 'Adjustable Speed Skipping Ropes (Steel Wire)',
    category: 'Skipping ropes',
    location: 'KILPAUK',
    totalQty: 35,
    availableQty: 35,
    damagedQty: 0,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2026-04-10',
    lastInspectionDate: '2026-11-09',
    lastUpdatedBy: 'Coach Hanif',
    remarks: 'Bearing handles with smooth rotation for cardio drills.',
    history: []
  },
  {
    id: 'EQ-KIL-003',
    name: 'Multi-Color Agility Hula Hoops (80cm)',
    category: 'Hula hoops',
    location: 'KILPAUK',
    totalQty: 25,
    availableQty: 23,
    damagedQty: 2,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2026-02-18',
    lastInspectionDate: '2026-11-07',
    lastUpdatedBy: 'Senior Coach Kabir Rao',
    remarks: 'Used for target jumping and coordination circuits.',
    history: []
  },
  {
    id: 'EQ-KIL-004',
    name: 'EVA Foam Non-Slip Yoga Mats (8mm)',
    category: 'Yoga mats',
    location: 'KILPAUK',
    totalQty: 30,
    availableQty: 27,
    damagedQty: 3,
    missingQty: 0,
    condition: 'Damaged',
    purchaseDate: '2025-09-15',
    lastInspectionDate: '2026-11-14',
    lastUpdatedBy: 'Coach Hanif',
    remarks: '3 mats torn along edge from outdoor conditioning.',
    history: []
  },

  // MAHALINGAPURAM
  {
    id: 'EQ-MAH-001',
    name: 'Foldable Gymnastics Balance Beam (2.4m)',
    category: 'Gymnastics equipment',
    location: 'MAHALINGAPURAM',
    totalQty: 4,
    availableQty: 4,
    damagedQty: 0,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2025-10-10',
    lastInspectionDate: '2026-11-12',
    lastUpdatedBy: 'Senior Coach Kabir Rao',
    remarks: 'Suede covered low practice beam for beginner stability.',
    history: []
  },
  {
    id: 'EQ-MAH-002',
    name: 'Agility Ladder & Slalom Poles Set',
    category: 'Other sports equipment',
    location: 'MAHALINGAPURAM',
    totalQty: 8,
    availableQty: 7,
    damagedQty: 1,
    missingQty: 0,
    condition: 'Needs Maintenance',
    purchaseDate: '2026-01-22',
    lastInspectionDate: '2026-11-13',
    lastUpdatedBy: 'Coach Kapil',
    remarks: '1 slalom base peg cracked.',
    history: []
  },
  {
    id: 'EQ-MAH-003',
    name: 'High Grip Leather Footballs (Size 3 & 4)',
    category: 'Football',
    location: 'MAHALINGAPURAM',
    totalQty: 18,
    availableQty: 16,
    damagedQty: 1,
    missingQty: 1,
    condition: 'Good',
    purchaseDate: '2026-03-14',
    lastInspectionDate: '2026-11-11',
    lastUpdatedBy: 'Senior Coach Kabir Rao',
    remarks: 'Waterproof synthetic leather for rainy session backups.',
    history: []
  },

  // ANNA NAGAR
  {
    id: 'EQ-ANN-001',
    name: 'Olympic Style Incline Gymnastics Wedge Ramp',
    category: 'Gymnastics mats',
    location: 'ANNA NAGAR',
    totalQty: 3,
    availableQty: 3,
    damagedQty: 0,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2025-12-01',
    lastInspectionDate: '2026-11-06',
    lastUpdatedBy: 'Coach Teja',
    remarks: 'High density cheese mat for back handspring progression.',
    history: []
  },
  {
    id: 'EQ-ANN-002',
    name: 'Heavy Duty Basketball Net & Rims',
    category: 'Basketball',
    location: 'ANNA NAGAR',
    totalQty: 4,
    availableQty: 4,
    damagedQty: 0,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2025-07-19',
    lastInspectionDate: '2026-11-04',
    lastUpdatedBy: 'Coach Teja',
    remarks: 'Breakaway spring rims installed on Court A.',
    history: []
  },

  // KOLATHUR
  {
    id: 'EQ-KOL-001',
    name: 'Multi-Color Saucer Disc Cones (Set of 100)',
    category: 'Cones',
    location: 'KOLATHUR',
    totalQty: 100,
    availableQty: 92,
    damagedQty: 4,
    missingQty: 4,
    condition: 'Good',
    purchaseDate: '2026-04-05',
    lastInspectionDate: '2026-11-10',
    lastUpdatedBy: 'Admin',
    remarks: 'Flexible PVC disc cones with metal carry holder.',
    history: []
  }
];

/**
 * Initial sample coach equipment condition reports awaiting Super Coach / Admin review
 */
export const initialEquipmentReports = [
  {
    id: 'EQREP-001',
    equipmentId: 'EQ-KKN-002',
    equipmentName: 'High-Density Tumbling Mats (2m x 1m)',
    location: 'KK NAGAR',
    category: 'Gymnastics mats',
    submittedBy: 'Coach Kapil',
    submittedRole: 'coach',
    reportedCondition: 'Needs Maintenance',
    damagedCount: 2,
    missingCount: 0,
    remarks: 'Velcro joiner strip came unstitched during tumbling circuit. Mats drift apart when children jump.',
    photoNote: 'IMG_20261110_velcro_mat_tear.jpg (Verified with Coach Kapil)',
    status: REPORT_STATUSES.PENDING_REVIEW,
    superCoachReview: null,
    adminApproval: null,
    createdAt: '2026-11-10T16:30:00Z',
    updatedAt: '2026-11-10T16:30:00Z'
  },
  {
    id: 'EQREP-002',
    equipmentId: 'EQ-KIL-004',
    equipmentName: 'EVA Foam Non-Slip Yoga Mats (8mm)',
    location: 'KILPAUK',
    category: 'Yoga mats',
    submittedBy: 'Coach Hanif',
    submittedRole: 'coach',
    reportedCondition: 'Damaged',
    damagedCount: 3,
    missingCount: 0,
    remarks: 'Deep tears across middle section after gravel got dragged in during open air agility class.',
    photoNote: 'IMG_20261114_yoga_mat_tear.jpg',
    status: REPORT_STATUSES.VERIFIED_BY_SUPER_COACH,
    superCoachReview: {
      reviewer: 'Senior Coach Kabir Rao',
      role: 'Super Coach',
      timestamp: '2026-11-14T18:00:00Z',
      notes: 'Inspected on site at Kilpauk. Unsafe for kids to balance on. Recommended 3 replacement mats from central store.',
      action: 'Verified'
    },
    adminApproval: null,
    createdAt: '2026-11-14T12:15:00Z',
    updatedAt: '2026-11-14T18:00:00Z'
  },
  {
    id: 'EQREP-003',
    equipmentId: 'EQ-KKN-001',
    equipmentName: 'Size 4 Pro Match Footballs',
    location: 'KK NAGAR',
    category: 'Football',
    submittedBy: 'Coach Kapil',
    submittedRole: 'coach',
    reportedCondition: 'Damaged',
    damagedCount: 2,
    missingCount: 0,
    remarks: 'Two match balls punctured by boundary fence wire.',
    photoNote: 'Punctured valve photo logged.',
    status: REPORT_STATUSES.PENDING_REVIEW,
    superCoachReview: null,
    adminApproval: null,
    createdAt: '2026-11-13T17:45:00Z',
    updatedAt: '2026-11-13T17:45:00Z'
  }
];

/**
 * Filter equipment records by location, category, condition, and search string
 */
export function filterEquipment(
  inventory = [],
  { location = 'All', category = 'All', condition = 'All', search = '' } = {}
) {
  const query = search.trim().toLowerCase();

  return inventory.filter((item) => {
    const matchesLocation = location === 'All' || item.location === location;
    const matchesCategory = category === 'All' || item.category === category;
    const matchesCondition = condition === 'All' || item.condition === condition;
    const matchesSearch =
      !query ||
      item.name?.toLowerCase().includes(query) ||
      item.id?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query) ||
      item.remarks?.toLowerCase().includes(query);

    return matchesLocation && matchesCategory && matchesCondition && matchesSearch;
  });
}

/**
 * Calculate KPI metrics for equipment inventory
 */
export function calculateEquipmentMetrics(inventory = [], reports = [], location = 'All') {
  const scopedInventory = location === 'All' ? inventory : inventory.filter((i) => i.location === location);
  const scopedReports = location === 'All' ? reports : reports.filter((r) => r.location === location);

  const totalItems = scopedInventory.reduce((acc, i) => acc + (Number(i.totalQty) || 0), 0);
  const availableItems = scopedInventory.reduce((acc, i) => acc + (Number(i.availableQty) || 0), 0);
  const damagedItems = scopedInventory.reduce((acc, i) => acc + (Number(i.damagedQty) || 0), 0);
  const missingItems = scopedInventory.reduce((acc, i) => acc + (Number(i.missingQty) || 0), 0);

  const pendingReports = scopedReports.filter((r) => r.status === REPORT_STATUSES.PENDING_REVIEW).length;
  const verifiedReports = scopedReports.filter((r) => r.status === REPORT_STATUSES.VERIFIED_BY_SUPER_COACH).length;

  const goodRecords = scopedInventory.filter((i) => i.condition === 'Good').length;
  const healthRate = scopedInventory.length > 0 ? Math.round((goodRecords / scopedInventory.length) * 100) : 100;

  return {
    totalTypes: scopedInventory.length,
    totalItems,
    availableItems,
    damagedItems,
    missingItems,
    pendingReports,
    verifiedReports,
    healthRate
  };
}

/**
 * Export equipment inventory to CSV
 */
export function exportEquipmentToCsv(inventory = []) {
  const headers = [
    'Equipment ID',
    'Equipment Name',
    'Category',
    'Location',
    'Total Qty',
    'Available Qty',
    'Damaged Qty',
    'Missing Qty',
    'Condition',
    'Purchase Date',
    'Last Inspection Date',
    'Last Updated By',
    'Remarks'
  ];

  const rows = inventory.map((item) => [
    `"${item.id}"`,
    `"${(item.name || '').replace(/"/g, '""')}"`,
    `"${item.category || ''}"`,
    `"${item.location || ''}"`,
    item.totalQty,
    item.availableQty,
    item.damagedQty,
    item.missingQty,
    `"${item.condition || ''}"`,
    `"${item.purchaseDate || ''}"`,
    `"${item.lastInspectionDate || ''}"`,
    `"${(item.lastUpdatedBy || '').replace(/"/g, '""')}"`,
    `"${(item.remarks || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
