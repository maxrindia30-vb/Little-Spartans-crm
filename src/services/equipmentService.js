/**
 * Little Spartans ZenConnect CRM - Sports Equipment & Multi-Location Inventory Service
 *
 * Provides operations for:
 * - Location-scoped equipment inventory tracking
 * - Condition status evaluation (Good, Needs Maintenance, Damaged, Missing)
 * - Coach equipment requirement submissions & damage reports
 * - Super Coach report review, inventory calibration, and maintenance queue
 * - Admin central inventory oversight, procurement sanctions & audit history
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

export const EQUIPMENT_REQUEST_TYPES = [
  'New Equipment Required',
  'Damaged Equipment',
  'Missing Equipment',
  'Replacement Required',
  'Additional Quantity Required'
];

export const REPORT_STATUSES = {
  PENDING_REVIEW: 'Pending Review',
  REVIEWED: 'Reviewed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  FULFILLED: 'Fulfilled'
};

export const STATUS_COLORS = {
  'Pending Review': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-500' },
  'Reviewed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-500' },
  'Approved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-500' },
  'Rejected': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-500' },
  'Fulfilled': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-500' }
};

/**
 * Initial canonical equipment inventory across Little Spartans centers
 * Location-specific records: KK NAGAR, KILPAUK, MAHALINGAPURAM, ANNA NAGAR, KOLATHUR
 */
export const initialEquipmentInventory = [
  {
    id: 'EQ-KKN-1001',
    name: 'Size 4 Pro Match Footballs',
    category: 'Football',
    location: 'KK NAGAR',
    totalQty: 20,
    availableQty: 18,
    damagedQty: 2,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2026-09-15',
    lastInspectionDate: '2026-11-23',
    lastUpdatedBy: 'Arun Prakash (Coach)',
    imageUrl: '',
    remarks: 'Official FIFA standard training footballs for junior agility squads.',
    history: [
      {
        id: 'EQH-101',
        timestamp: '2026-09-15T09:00:00.000Z',
        action: 'Item Registered',
        user: 'Administrator',
        role: 'Admin',
        details: 'Initial procurement of 20 match footballs for KK Nagar center.'
      },
      {
        id: 'EQH-102',
        timestamp: '2026-11-23T07:30:00.000Z',
        action: 'Equipment Check Confirmed',
        user: 'Arun Prakash',
        role: 'Coach',
        details: 'Confirmed and inspected on site for morning training session.'
      }
    ]
  },
  {
    id: 'EQ-KKN-1002',
    name: 'Agility Speed Hurdles (6-inch)',
    category: 'Gymnastics equipment',
    location: 'KK NAGAR',
    totalQty: 15,
    availableQty: 15,
    damagedQty: 0,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2026-10-01',
    lastInspectionDate: '2026-11-23',
    lastUpdatedBy: 'Anita R. (Super Coach)',
    imageUrl: '',
    remarks: 'Fluorescent orange hurdle set stored in Turf storage rack.',
    history: [
      {
        id: 'EQH-103',
        timestamp: '2026-10-01T10:00:00.000Z',
        action: 'Item Registered',
        user: 'Anita R.',
        role: 'Super Coach',
        details: 'Allocated 15 agility hurdles to KK Nagar inventory.'
      }
    ]
  },
  {
    id: 'EQ-KPK-2001',
    name: 'Size 5 Junior Grip Basketballs',
    category: 'Basketball',
    location: 'KILPAUK',
    totalQty: 16,
    availableQty: 14,
    damagedQty: 1,
    missingQty: 1,
    condition: 'Needs Maintenance',
    purchaseDate: '2026-08-20',
    lastInspectionDate: '2026-11-22',
    lastUpdatedBy: 'Vignesh K (Coach)',
    imageUrl: '',
    remarks: 'High-grip composite leather basketballs for rising stars batch.',
    history: [
      {
        id: 'EQH-201',
        timestamp: '2026-08-20T11:00:00.000Z',
        action: 'Item Registered',
        user: 'Administrator',
        role: 'Admin',
        details: 'Procured 16 basketballs for Kilpauk court.'
      }
    ]
  },
  {
    id: 'EQ-MHL-3001',
    name: 'High-Density Gymnastics Crash Mats',
    category: 'Gymnastics mats',
    location: 'MAHALINGAPURAM',
    totalQty: 8,
    availableQty: 8,
    damagedQty: 0,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2026-07-10',
    lastInspectionDate: '2026-11-21',
    lastUpdatedBy: 'Anita R. (Super Coach)',
    imageUrl: '',
    remarks: '4-inch landing mats with non-slip vinyl coating.',
    history: [
      {
        id: 'EQH-301',
        timestamp: '2026-07-10T12:00:00.000Z',
        action: 'Item Registered',
        user: 'Administrator',
        role: 'Admin',
        details: 'Initial setup of crash mats at Mahalingapuram.'
      }
    ]
  },
  {
    id: 'EQ-ANN-4001',
    name: 'Speed Cones & Marker Discs (50pk)',
    category: 'Cones',
    location: 'ANNA NAGAR',
    totalQty: 12,
    availableQty: 11,
    damagedQty: 1,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2026-09-05',
    lastInspectionDate: '2026-11-23',
    lastUpdatedBy: 'Divya R (Coach)',
    imageUrl: '',
    remarks: 'Multi-color disc cones for sprint agility drills.',
    history: [
      {
        id: 'EQH-401',
        timestamp: '2026-09-05T14:00:00.000Z',
        action: 'Item Registered',
        user: 'Anita R.',
        role: 'Super Coach',
        details: 'Allocated 12 cone sets to Anna Nagar center.'
      }
    ]
  },
  {
    id: 'EQ-KOL-5001',
    name: 'Adjustable Speed Skipping Ropes',
    category: 'Skipping ropes',
    location: 'KOLATHUR',
    totalQty: 25,
    availableQty: 23,
    damagedQty: 2,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: '2026-10-15',
    lastInspectionDate: '2026-11-18',
    lastUpdatedBy: 'Anita R. (Super Coach)',
    imageUrl: '',
    remarks: 'Wire-core speed ropes for conditioning drills.',
    history: [
      {
        id: 'EQH-501',
        timestamp: '2026-10-15T15:00:00.000Z',
        action: 'Item Registered',
        user: 'Administrator',
        role: 'Admin',
        details: 'Allocated 25 skipping ropes to Kolathur center.'
      }
    ]
  }
];

/**
 * Initial sample coach equipment requests and condition reports
 */
export const initialEquipmentReports = [
  {
    id: 'EQREQ-101',
    coachName: 'Arun Prakash',
    coachId: 'COACH-ARUN',
    location: 'KK NAGAR',
    equipmentName: 'Size 4 Pro Match Footballs',
    equipmentId: 'EQ-KKN-1001',
    category: 'Football',
    requestType: 'Damaged Equipment',
    requiredQty: 2,
    damagedCount: 2,
    missingCount: 0,
    reportedCondition: 'Damaged',
    remarks: 'Valves leaking air and outer casing torn during evening agility training drill.',
    photoNote: 'IMG_20261120_valve_leak.jpg',
    submissionDate: '2026-11-20',
    status: 'Pending Review',
    submittedBy: 'Arun Prakash',
    submittedRole: 'coach',
    createdAt: '2026-11-20T17:30:00.000Z',
    updatedAt: '2026-11-20T17:30:00.000Z',
    history: [
      {
        id: 'EQRH-1',
        timestamp: '2026-11-20T17:30:00.000Z',
        action: 'Request Submitted',
        user: 'Arun Prakash',
        role: 'Coach',
        details: 'Reported 2 damaged footballs requiring replacement at KK Nagar.'
      }
    ]
  },
  {
    id: 'EQREQ-102',
    coachName: 'Divya R',
    coachId: 'COACH-DIVYA',
    location: 'ANNA NAGAR',
    equipmentName: 'Junior Agility Ladder (6m)',
    equipmentId: '',
    category: 'Gymnastics equipment',
    requestType: 'New Equipment Required',
    requiredQty: 3,
    damagedCount: 0,
    missingCount: 0,
    reportedCondition: 'Good',
    remarks: 'Need 3 additional 6-meter agility floor ladders for expanding Saturday batch size.',
    photoNote: 'Catalog ref: Spartan Agility Pro Ladder',
    submissionDate: '2026-11-22',
    status: 'Reviewed',
    submittedBy: 'Divya R',
    submittedRole: 'coach',
    createdAt: '2026-11-22T10:15:00.000Z',
    updatedAt: '2026-11-22T16:00:00.000Z',
    superCoachReview: {
      reviewer: 'Anita R.',
      role: 'Super Coach',
      timestamp: '2026-11-22T16:00:00.000Z',
      notes: 'Reviewed and confirmed batch expansion. Recommended Admin procurement approval.',
      action: 'Reviewed'
    },
    history: [
      {
        id: 'EQRH-2',
        timestamp: '2026-11-22T10:15:00.000Z',
        action: 'Request Submitted',
        user: 'Divya R',
        role: 'Coach',
        details: 'Submitted requirement for 3 new agility ladders for Anna Nagar.'
      },
      {
        id: 'EQRH-3',
        timestamp: '2026-11-22T16:00:00.000Z',
        action: 'Reviewed by Super Coach',
        user: 'Anita R.',
        role: 'Super Coach',
        details: 'Verified batch requirements and forwarded recommendation.'
      }
    ]
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
  const reviewedReports = scopedReports.filter((r) => r.status === REPORT_STATUSES.REVIEWED).length;
  const approvedReports = scopedReports.filter((r) => r.status === REPORT_STATUSES.APPROVED).length;
  const fulfilledReports = scopedReports.filter((r) => r.status === REPORT_STATUSES.FULFILLED).length;

  const goodRecords = scopedInventory.filter((i) => i.condition === 'Good').length;
  const healthRate = scopedInventory.length > 0 ? Math.round((goodRecords / scopedInventory.length) * 100) : 100;

  return {
    totalTypes: scopedInventory.length,
    totalItems,
    availableItems,
    damagedItems,
    missingItems,
    pendingReports,
    reviewedReports,
    approvedReports,
    fulfilledReports,
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
