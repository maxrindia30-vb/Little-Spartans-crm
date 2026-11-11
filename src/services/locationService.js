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
 */
export function getCommonLocations(data) {
  if (data?.locations && data.locations.length > 0) {
    return data.locations;
  }
  const fallbackNames = data?.academy?.centers || [];
  return fallbackNames.map((name, idx) => ({
    id: `LOC-${idx + 1}`,
    name,
    city: 'Chennai',
    courts: []
  }));
}

/**
 * Filters enquiries strictly by location, stage, date, and search query.
 */
export function filterEnquiries(enquiries = [], { location = 'All', stage = 'All', date = '', search = '' } = {}) {
  const query = search.trim().toLowerCase();

  return enquiries.filter((enq) => {
    const matchesLocation = location === 'All' || enq.center === location;
    const matchesStage = stage === 'All' || enq.stage === stage;
    const matchesDate = !date || enq.createdAt === date || enq.trialDate === date;
    const matchesSearch =
      !query ||
      enq.childName?.toLowerCase().includes(query) ||
      enq.parentName?.toLowerCase().includes(query) ||
      enq.phone?.includes(search.trim()) ||
      enq.id?.toLowerCase().includes(query);

    return matchesLocation && matchesStage && matchesDate && matchesSearch;
  });
}
