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
 * Initial canonical equipment inventory across Little Spartans centers (clean starting state)
 */
export const initialEquipmentInventory = [];

/**
 * Initial sample coach equipment condition reports (clean starting state)
 */
export const initialEquipmentReports = [];

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
