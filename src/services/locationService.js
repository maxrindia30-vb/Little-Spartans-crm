/**
 * Little Spartans ZenConnect CRM - Common Location & Enquiry Filtering Service
 *
 * Ensures a single canonical list of academy locations across Admin modules
 * (Enquiry Management, Class Scheduling, and Student Attendance).
 *
 * ============================================================================
 * BACKEND INTEGRATION REQUIRED:
 * - GET /api/v1/locations
 *   Returns: [{ id, name, city, address, courts }]
 * - GET /api/v1/enquiries?location={location}&stage={stage}&date={date}&search={q}&page={p}&limit={n}
 *   Must filter records server-side by `location` column and return paginated
 *   results + location-scoped stage counts.
 * ============================================================================
 */

/**
 * Returns the canonical list of academy location objects from global CRM state.
 * Pass `{ includeInactive: true }` to include deactivated locations for Admin management.
 */
export function getCommonLocations(data, { includeInactive = false } = {}) {
  if (data?.locations && data.locations.length > 0) {
    return includeInactive
      ? data.locations
      : data.locations.filter((loc) => loc.status !== 'Inactive');
  }
  const fallbackNames = data?.academy?.centers || [];
  return fallbackNames.map((name, idx) => ({
    id: `LOC-${idx + 1}`,
    name,
    city: 'Chennai',
    courts: [],
    status: 'Active',
  }));
}

/**
 * Filters enquiries strictly by location, stage, source, date, and search query.
 */
export function filterEnquiries(
  enquiries = [],
  { location = 'All', stage = 'All', source = 'All', date = '', search = '' } = {}
) {
  const query = search.trim().toLowerCase();

  return enquiries.filter((enq) => {
    const matchesLocation = location === 'All' || enq.center === location;
    const matchesStage = stage === 'All' || enq.stage === stage;
    const matchesSource =
      source === 'All' || (enq.source || '').toLowerCase() === source.toLowerCase();
    const enqCreatedDate = (enq.createdAt || enq.enquiryDate || '').split('T')[0];
    const matchesDate = !date || enqCreatedDate === date;
    const matchesSearch =
      !query ||
      enq.childName?.toLowerCase().includes(query) ||
      enq.parentName?.toLowerCase().includes(query) ||
      enq.phone?.includes(search.trim()) ||
      enq.email?.toLowerCase().includes(query) ||
      enq.id?.toLowerCase().includes(query);

    return matchesLocation && matchesStage && matchesSource && matchesDate && matchesSearch;
  });
}
